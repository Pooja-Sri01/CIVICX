"""
CIVICX Recommendation & Action Center Service (Prompt 10)
Orchestrates explainable municipal decision recommendations and action items.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.models.models import (
    Asset,
    CitizenReport,
    AIInspection,
    MunicipalActionItem,
    BudgetScenario
)
from backend.app.algorithms.recommendation_engine import RecommendationEngine
from backend.app.services.predictive_service import PredictiveService

class RecommendationService:
    @staticmethod
    def get_asset_recommendation(db: Session, asset_id: str) -> Dict[str, Any]:
        """
        Synthesizes asset intelligence into an explainable recommendation.
        """
        query = db.query(Asset)
        if asset_id.isdigit():
            asset = query.filter(or_(Asset.id == int(asset_id), Asset.asset_id == asset_id)).first()
        else:
            asset = query.filter(Asset.asset_id.ilike(asset_id)).first()

        if not asset:
            # Low data fallback for non-existent/unobserved assets
            return RecommendationEngine.generate_asset_recommendation(
                asset_id=asset_id,
                asset_name=f"Asset {asset_id}",
                asset_type="Infrastructure Asset",
                condition_score=50,
                risk_score=50,
                risk_level="MEDIUM",
                priority_rank=99,
                deterioration_rate=10.0,
                trend="STABLE",
                forecast_12m=45,
                maintenance_window="Routine Monitoring",
                estimated_cost=50000.0,
                data_quality="LOW",
                is_funded_in_budget=True
            )

        # 1. AI Inspection Telemetry
        latest_ai = db.query(AIInspection).filter(
            AIInspection.asset_id == asset.asset_id
        ).order_by(AIInspection.created_at.desc()).first()
        ai_damage = latest_ai.damage_type if latest_ai else asset.damage_type

        # 2. Citizen Reports
        citizen_count = db.query(CitizenReport).filter(
            or_(CitizenReport.nearest_asset_id == asset.asset_id, CitizenReport.nearest_asset_id == str(asset.id))
        ).count()

        # 3. Forecast Telemetry
        forecast_res = PredictiveService.get_asset_forecast(db, asset.asset_id)
        data_quality = forecast_res.get("data_quality", "HIGH")
        trend = forecast_res.get("trend", "STABLE")
        rate = forecast_res.get("deterioration_rate", asset.historical_deterioration)
        window = forecast_res.get("maintenance_window", "6–12 months")
        f_12m = forecast_res.get("forecast", [{}, {}])[1].get("condition", 57) if len(forecast_res.get("forecast", [])) > 1 else 57

        return RecommendationEngine.generate_asset_recommendation(
            asset_id=asset.asset_id,
            asset_name=asset.name,
            asset_type=asset.asset_type,
            condition_score=asset.condition_score,
            risk_score=asset.risk_score,
            risk_level=asset.risk_level,
            priority_rank=asset.priority_rank or 1,
            deterioration_rate=rate,
            trend=trend,
            forecast_12m=f_12m,
            maintenance_window=window,
            estimated_cost=asset.estimated_repair_cost,
            data_quality=data_quality,
            is_funded_in_budget=True,
            citizen_reports_count=citizen_count,
            ai_damage_detected=ai_damage
        )

    @staticmethod
    def get_city_recommendations_summary(db: Session) -> Dict[str, Any]:
        """
        Evaluates citywide asset recommendations and partitions them into
        'Attention Required Now' vs 'Can Wait (Monitor)'.
        """
        assets = db.query(Asset).order_by(Asset.priority_rank.asc()).all()
        
        recs: List[Dict[str, Any]] = []
        attention_list: List[Dict[str, Any]] = []
        monitor_list: List[Dict[str, Any]] = []

        reconstruct_cnt = 0
        rehab_cnt = 0
        preventive_cnt = 0
        inspect_cnt = 0
        monitor_cnt = 0

        total_rec_budget = 0.0

        for a in assets:
            rec = RecommendationService.get_asset_recommendation(db, a.asset_id)
            recs.append(rec)
            total_rec_budget += rec["estimated_cost"]

            rtype = rec["recommendation_type"]
            if rtype == "RECONSTRUCT":
                reconstruct_cnt += 1
                attention_list.append(rec)
            elif rtype == "REHABILITATE":
                rehab_cnt += 1
                attention_list.append(rec)
            elif rtype == "PREVENTIVE_MAINTENANCE":
                preventive_cnt += 1
                attention_list.append(rec)
            elif rtype == "INSPECT":
                inspect_cnt += 1
                attention_list.append(rec)
            else:
                monitor_cnt += 1
                monitor_list.append(rec)

        return {
            "total_evaluated": len(assets),
            "critical_reconstruct_count": reconstruct_cnt,
            "urgent_rehabilitate_count": rehab_cnt,
            "preventive_maintenance_count": preventive_cnt,
            "inspection_required_count": inspect_cnt,
            "monitor_count": monitor_cnt,
            "total_recommended_budget": round(total_rec_budget, 2),
            "unfunded_priority_budget": round(max(0.0, total_rec_budget - 50000000.0), 2), # Assuming ₹50L primary municipal budget envelope
            "attention_required": attention_list[:15],
            "can_wait_monitor": monitor_list[:15]
        }

    @staticmethod
    def create_action_item(db: Session, req_data: Dict[str, Any], created_by: str = "Municipal Engineer") -> MunicipalActionItem:
        """
        Creates an operational action item from an explainable recommendation.
        """
        item = MunicipalActionItem(
            asset_id=req_data["asset_id"],
            action_type=req_data.get("action_type", "PREVENTIVE_MAINTENANCE"),
            title=req_data.get("title", f"Action for {req_data['asset_id']}"),
            urgency=req_data.get("urgency", "HIGH"),
            status="NEW",
            assigned_dept=req_data.get("assigned_dept", "Road Infrastructure Department"),
            due_window=req_data.get("due_window", "3–6 Months"),
            estimated_cost=float(req_data.get("estimated_cost", 0.0)),
            rationale=req_data.get("rationale"),
            created_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def get_action_items(
        db: Session,
        status: Optional[str] = None,
        urgency: Optional[str] = None,
        asset_id: Optional[str] = None
    ) -> List[MunicipalActionItem]:
        """
        Queries municipal action workflow items.
        """
        query = db.query(MunicipalActionItem)
        if status:
            query = query.filter(MunicipalActionItem.status.ilike(status))
        if urgency:
            query = query.filter(MunicipalActionItem.urgency.ilike(urgency))
        if asset_id:
            query = query.filter(MunicipalActionItem.asset_id.ilike(asset_id))
        
        return query.order_by(MunicipalActionItem.created_at.desc()).all()

    @staticmethod
    def update_action_status(db: Session, action_id: int, new_status: str) -> Optional[MunicipalActionItem]:
        """
        Updates the workflow status of an action item.
        """
        item = db.query(MunicipalActionItem).filter(MunicipalActionItem.id == action_id).first()
        if not item:
            return None
        item.status = new_status.upper()
        item.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(item)
        return item
