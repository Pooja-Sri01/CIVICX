"""
CIVICX Digital Twin & What-If Simulation Endpoints (Prompt 9)
Provides REST APIs for asset digital twin state, counterfactual scenario simulation,
scenario lifecycle persistence, and review workflows.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.api.dependencies import get_db
from backend.app.services.digital_twin_service import DigitalTwinService
from backend.app.schemas.schemas import (
    DigitalTwinStateResponse,
    DigitalTwinScenarioSimulationResponse,
    CustomScenarioRunRequest,
    SavedScenarioCreate,
    SavedScenarioResponse
)

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin & Lifecycle Simulation"])

class StatusUpdateRequest(BaseModel):
    status: str # DRAFT, SIMULATED, REVIEWED, APPROVED, REJECTED

@router.get("/assets/{asset_id}", response_model=DigitalTwinStateResponse)
def get_digital_twin_asset_state(
    asset_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves the complete Digital Twin state for a municipal infrastructure asset,
    integrating condition, risk, AI inspection signals, citizen telemetry, and lifecycle stage.
    """
    try:
        return DigitalTwinService.get_digital_twin_state(db, asset_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate digital twin state: {str(e)}")

@router.post("/simulate", response_model=DigitalTwinScenarioSimulationResponse)
def simulate_digital_twin_scenario(
    req: CustomScenarioRunRequest,
    db: Session = Depends(get_db)
):
    """
    Runs a counterfactual What-If scenario (Intervention + Timing + Budget)
    and computes the condition trajectory, risk reduction, lifecycle TCO, and cost of delay.
    """
    try:
        return DigitalTwinService.simulate_custom_scenario(
            db=db,
            asset_id=req.asset_id,
            intervention_type=req.intervention_type or "PREVENTIVE_MAINTENANCE",
            timing_months=req.timing_months or 0,
            budget=req.budget
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scenario simulation failed: {str(e)}")

@router.get("/scenarios", response_model=List[SavedScenarioResponse])
def get_saved_scenarios(
    asset_id: Optional[str] = Query(None, description="Filter by asset ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieves saved what-if scenario history for auditing and municipal review.
    """
    return DigitalTwinService.get_saved_scenarios(db, asset_id)

@router.post("/scenarios", response_model=SavedScenarioResponse)
def save_digital_twin_scenario(
    req: SavedScenarioCreate,
    db: Session = Depends(get_db)
):
    """
    Saves a what-if scenario for municipal deliberation and budget planning.
    """
    record = DigitalTwinService.save_scenario(
        db=db,
        asset_id=req.asset_id,
        name=req.name,
        intervention_type=req.intervention_type,
        timing_months=req.timing_months,
        budget=req.budget,
        scenario_status=req.scenario_status or "SIMULATED",
        simulation_result=req.simulation_result
    )
    return {
        "id": record.id,
        "asset_id": record.asset_id,
        "name": record.name,
        "intervention_type": record.intervention_type,
        "timing_months": record.timing_months,
        "budget": record.budget,
        "scenario_status": record.scenario_status,
        "simulation_result": req.simulation_result,
        "created_by": record.created_by,
        "created_at": record.created_at,
        "updated_at": record.updated_at
    }

@router.patch("/scenarios/{scenario_id}/status", response_model=SavedScenarioResponse)
def update_scenario_status(
    scenario_id: int,
    req: StatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Updates the operational review status of a saved scenario (DRAFT, SIMULATED, REVIEWED, APPROVED, REJECTED).
    """
    updated = DigitalTwinService.update_scenario_status(db, scenario_id, req.status.upper())
    if not updated:
        raise HTTPException(status_code=404, detail="Saved scenario not found.")
    
    import json
    res_dict = json.loads(updated.simulation_result_json) if updated.simulation_result_json else None
    return {
        "id": updated.id,
        "asset_id": updated.asset_id,
        "name": updated.name,
        "intervention_type": updated.intervention_type,
        "timing_months": updated.timing_months,
        "budget": updated.budget,
        "scenario_status": updated.scenario_status,
        "simulation_result": res_dict,
        "created_by": updated.created_by,
        "created_at": updated.created_at,
        "updated_at": updated.updated_at
    }
