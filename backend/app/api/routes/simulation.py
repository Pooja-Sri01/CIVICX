from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.api.dependencies import get_db
from backend.app.models.models import Asset
from backend.app.schemas.schemas import SimulationRunRequest, SimulationRunResponse
from backend.app.algorithms.simulation_engine import SimulationEngine

router = APIRouter(tags=["City Time Machine"])

@router.post("/simulation/run", response_model=SimulationRunResponse)
def run_simulation(
    req: SimulationRunRequest,
    db: Session = Depends(get_db)
):
    """
    Runs City Time Machine simulation projecting 3, 6, and 12-month decay curves and scenario trade-offs.
    """
    query = db.query(Asset)
    if req.asset_id.isdigit():
        asset = query.filter(or_(Asset.id == int(req.asset_id), Asset.asset_id == req.asset_id)).first()
    else:
        asset = query.filter(Asset.asset_id.ilike(req.asset_id)).first()

    if not asset:
        # Fallback to first asset if target is demo ID
        asset = db.query(Asset).first()
        if not asset:
            raise HTTPException(status_code=404, detail="No assets available for simulation.")

    sim_data = SimulationEngine.simulate_asset(
        asset_id=asset.asset_id,
        current_risk=asset.risk_score,
        current_condition=asset.condition_score,
        base_repair_cost=asset.estimated_repair_cost,
        deterioration_rate=asset.historical_deterioration
    )
    return sim_data
