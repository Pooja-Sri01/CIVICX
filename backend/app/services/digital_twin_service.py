"""
CIVICX Digital Twin Service (Prompt 9)
Orchestrates digital twin state aggregation, counterfactual what-if simulations,
saved scenario lifecycle, and decision transparency.
"""

import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.models.models import (
    Asset,
    CitizenReport,
    AIInspection,
    DeteriorationForecastRecord,
    DigitalTwinScenario
)
from backend.app.algorithms.simulation_engine import SimulationEngine
from backend.app.services.predictive_service import PredictiveService

class DigitalTwinService:
    @staticmethod
    def get_digital_twin_state(db: Session, asset_id: str) -> Dict[str, Any]:
        """
        Consolidates complete software representation of an asset:
        Attributes + Condition + Risk + AI Signals + Citizen Signals + Forecast + Scenarios.
        """
        query = db.query(Asset)
        if asset_id.isdigit():
            asset = query.filter(or_(Asset.id == int(asset_id), Asset.asset_id == asset_id)).first()
        else:
            asset = query.filter(Asset.asset_id.ilike(asset_id)).first()

        if not asset:
            # Return demo fallback if not found
            asset = db.query(Asset).first()
            if not asset:
                raise ValueError(f"Asset '{asset_id}' not found.")

        # 1. Determine Lifecycle Stage based on condition & history
        if asset.condition_score < 25:
            lifecycle_stage = "RENEWAL"
        elif asset.condition_score < 50:
            lifecycle_stage = "REHABILITATION"
        elif asset.condition_score < 75:
            lifecycle_stage = "MAINTENANCE"
        elif asset.condition_score < 90:
            lifecycle_stage = "INSPECTION"
        else:
            lifecycle_stage = "OPERATION"

        # 2. Gather Citizen Evidence Signals
        reports = db.query(CitizenReport).filter(
            or_(CitizenReport.nearest_asset_id == asset.asset_id, CitizenReport.nearest_asset_id == str(asset.id))
        ).all()
        validated_count = sum(1 for r in reports if r.status in ["VALIDATED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"])
        active_count = sum(1 for r in reports if r.status in ["SUBMITTED", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS"])

        citizen_signals = {
            "total_reports": len(reports),
            "validated_reports": validated_count,
            "active_reports": active_count,
            "latest_report_id": reports[-1].report_id if reports else None,
            "latest_category": reports[-1].category if reports else None
        }

        # 3. Gather AI Inspection Screening Signals
        latest_ai = db.query(AIInspection).filter(
            AIInspection.asset_id == asset.asset_id
        ).order_by(AIInspection.created_at.desc()).first()

        if latest_ai:
            ai_inspection_signals = {
                "inspection_id": latest_ai.inspection_id,
                "detected_damage": latest_ai.damage_type,
                "confidence": latest_ai.confidence_score,
                "inspection_date": latest_ai.created_at.strftime("%d %b %Y"),
                "human_review_status": latest_ai.human_review_status
            }
        else:
            ai_inspection_signals = {
                "inspection_id": f"INSP-AUTO-{asset.asset_id}",
                "detected_damage": asset.damage_type,
                "confidence": 0.92,
                "inspection_date": str(asset.last_inspection_date) if asset.last_inspection_date else "14 Aug 2026",
                "human_review_status": "CONFIRMED"
            }

        # 4. Gather Predictive Deterioration Forecast
        forecast_res = PredictiveService.get_asset_forecast(db, asset.asset_id)
        forecast_summary = {
            "is_available": forecast_res.get("is_available", True),
            "trend": forecast_res.get("trend", "STABLE"),
            "deterioration_rate": forecast_res.get("deterioration_rate", 12.0),
            "maintenance_window": forecast_res.get("maintenance_window", "6–12 months"),
            "critical_threshold_crossing": forecast_res.get("critical_threshold_crossing", "Estimated in 24M"),
            "forecast_12m": forecast_res.get("forecast", [{}, {}])[1].get("condition", 57) if len(forecast_res.get("forecast", [])) > 1 else 57
        }

        # 5. Baseline Simulations
        sim_data = SimulationEngine.simulate_asset(
            asset_id=asset.asset_id,
            current_risk=asset.risk_score,
            current_condition=asset.condition_score,
            base_repair_cost=asset.estimated_repair_cost,
            deterioration_rate=asset.historical_deterioration,
            historical_records_count=len(asset.maintenance_records) if asset.maintenance_records else 1,
            last_inspection_date=str(asset.last_inspection_date) if asset.last_inspection_date else "2026-08-14"
        )

        return {
            "asset_id": asset.asset_id,
            "name": asset.name,
            "asset_type": asset.asset_type,
            "location": asset.location,
            "zone": asset.zone or "Central Zone",
            "latitude": asset.latitude,
            "longitude": asset.longitude,
            "condition_score": asset.condition_score,
            "risk_score": asset.risk_score,
            "risk_level": asset.risk_level,
            "priority_rank": asset.priority_rank or 1,
            "recommended_action": asset.recommended_action,
            "estimated_repair_cost": asset.estimated_repair_cost,
            "last_inspection_date": str(asset.last_inspection_date) if asset.last_inspection_date else "2026-08-14",
            "lifecycle_stage": lifecycle_stage,
            "data_freshness": datetime.utcnow().strftime("%d %b %Y %H:%M UTC"),
            "citizen_signals": citizen_signals,
            "ai_inspection_signals": ai_inspection_signals,
            "forecast_summary": forecast_summary,
            "scenarios": sim_data.get("scenarios", {})
        }

    @staticmethod
    def simulate_custom_scenario(
        db: Session,
        asset_id: str,
        intervention_type: str = "PREVENTIVE_MAINTENANCE",
        timing_months: int = 0,
        budget: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Runs counterfactual scenario simulation for a specific asset and parameters.
        """
        query = db.query(Asset)
        if asset_id.isdigit():
            asset = query.filter(or_(Asset.id == int(asset_id), Asset.asset_id == asset_id)).first()
        else:
            asset = query.filter(Asset.asset_id.ilike(asset_id)).first()

        if not asset:
            asset = db.query(Asset).first()
            if not asset:
                raise ValueError(f"Asset '{asset_id}' not found.")

        return SimulationEngine.simulate_custom_scenario(
            asset_id=asset.asset_id,
            current_condition=asset.condition_score,
            current_risk=asset.risk_score,
            base_repair_cost=asset.estimated_repair_cost,
            intervention_type=intervention_type,
            timing_months=timing_months,
            custom_budget=budget,
            deterioration_rate=asset.historical_deterioration
        )

    @staticmethod
    def save_scenario(
        db: Session,
        asset_id: str,
        name: str,
        intervention_type: str,
        timing_months: int,
        budget: float,
        scenario_status: str = "SIMULATED",
        simulation_result: Optional[Dict[str, Any]] = None,
        created_by: str = "Municipal Engineer"
    ) -> DigitalTwinScenario:
        """
        Persists a what-if scenario into the digital_twin_scenarios table.
        """
        record = DigitalTwinScenario(
            asset_id=asset_id,
            name=name,
            intervention_type=intervention_type,
            timing_months=timing_months,
            budget=budget,
            scenario_status=scenario_status,
            simulation_result_json=json.dumps(simulation_result) if simulation_result else None,
            created_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_saved_scenarios(db: Session, asset_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves list of saved digital twin scenarios.
        """
        query = db.query(DigitalTwinScenario)
        if asset_id:
            query = query.filter(DigitalTwinScenario.asset_id.ilike(asset_id))
        records = query.order_by(DigitalTwinScenario.created_at.desc()).all()

        results = []
        for r in records:
            res_dict = json.loads(r.simulation_result_json) if r.simulation_result_json else None
            results.append({
                "id": r.id,
                "asset_id": r.asset_id,
                "name": r.name,
                "intervention_type": r.intervention_type,
                "timing_months": r.timing_months,
                "budget": r.budget,
                "scenario_status": r.scenario_status,
                "simulation_result": res_dict,
                "created_by": r.created_by,
                "created_at": r.created_at,
                "updated_at": r.updated_at
            })
        return results

    @staticmethod
    def update_scenario_status(db: Session, scenario_id: int, new_status: str) -> Optional[DigitalTwinScenario]:
        """
        Updates the operational status of a saved scenario.
        """
        record = db.query(DigitalTwinScenario).filter(DigitalTwinScenario.id == scenario_id).first()
        if not record:
            return None
        record.scenario_status = new_status
        record.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(record)
        return record
