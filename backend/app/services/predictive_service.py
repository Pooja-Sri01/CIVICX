"""
CIVICX Predictive Service (Prompt 8)
Orchestrates empirical deterioration forecasts across asset digital twins,
maintenance ledgers, citizen evidence, and AI inspection detections.
Persists versioned time-series predictions and aggregates citywide predictive outlooks.
"""

import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.models.models import (
    Asset,
    MaintenanceRecord,
    CitizenReport,
    AIInspection,
    DeteriorationForecastRecord
)
from backend.app.algorithms.predictive_engine import PredictiveEngine
from backend.app.algorithms.priority_engine import PriorityEngine

class PredictiveService:
    @classmethod
    def get_asset_forecast(cls, db: Session, asset_id: str, persist: bool = True) -> Dict[str, Any]:
        """
        Calculates or retrieves the predictive deterioration forecast for an asset.
        """
        # Resolve asset
        asset = db.query(Asset).filter(
            (Asset.asset_id == asset_id) | (Asset.name.ilike(f"%{asset_id}%"))
        ).first()

        if not asset:
            # Fallback mock/synthetic response for non-existent assets
            return {
                "asset_id": asset_id,
                "asset_name": f"Asset {asset_id}",
                "asset_type": "Road",
                "model_name": PredictiveEngine.MODEL_NAME,
                "model_version": PredictiveEngine.MODEL_VERSION,
                "prediction_timestamp": datetime.utcnow().isoformat() + "Z",
                "current_condition": 50,
                "current_risk": 50,
                "data_quality": "LOW",
                "is_available": False,
                "unavailable_reason": "Asset record not found in municipal infrastructure database.",
                "recommended_action": "Verify asset registry ID.",
                "deterioration_rate": 0.0,
                "trend": "STABLE",
                "forecast": [],
                "critical_threshold_crossing": "Indeterminate",
                "maintenance_window": "Record Unregistered",
                "maintenance_urgency": "LOW",
                "evidence_chain": ["Asset ID could not be resolved against municipal asset ledger."],
                "decision_disclaimer": "Predictive forecast models deterioration trajectories and does NOT overwrite official CIVICX 6-factor risk assessment."
            }

        # Query maintenance records
        maintenance_records = db.query(MaintenanceRecord).filter(
            MaintenanceRecord.asset_id == asset.id
        ).all()
        maintenance_list = [
            {
                "date": str(m.date),
                "conditionAfter": getattr(m, "condition_after", 70) or 70,
                "action": getattr(m, "action", getattr(m, "maintenance_type", "Routine Maintenance")),
                "cost": m.cost
            }
            for m in maintenance_records
        ]

        # Query linked citizen reports
        citizen_reports = db.query(CitizenReport).filter(
            (CitizenReport.nearest_asset_id == asset.asset_id) |
            (CitizenReport.nearest_asset_id == str(asset.id))
        ).all()
        citizen_list = [
            {"report_id": r.report_id, "category": r.category, "severity": r.severity}
            for r in citizen_reports
        ]

        # Query linked AI inspections
        ai_inspections = db.query(AIInspection).filter(
            AIInspection.asset_id == asset.asset_id
        ).all()
        ai_detections_count = sum(len(json.loads(i.detections_json or "[]")) for i in ai_inspections)

        # Run Predictive Engine
        exposure_val = int(getattr(asset, "environmental_exposure", 50.0) or 50)
        trend_val = int(getattr(asset, "historical_deterioration", 15.0) or 15)

        forecast_result = PredictiveEngine.predict_asset_deterioration(
            asset_id=asset.asset_id,
            current_condition=asset.condition_score,
            current_risk=asset.risk_score,
            criticality=asset.criticality,
            usage_score=asset.usage_score,
            exposure_score=exposure_val,
            trend_score=trend_val,
            damage_severity=asset.damage_severity,
            maintenance_history=maintenance_list,
            citizen_reports=citizen_list,
            ai_detections_count=ai_detections_count,
            asset_name=asset.name,
            asset_type=asset.asset_type
        )

        # Persist snapshot if valid and requested
        if persist and forecast_result["is_available"]:
            try:
                record = DeteriorationForecastRecord(
                    asset_id=asset.asset_id,
                    model_name=forecast_result["model_name"],
                    model_version=forecast_result["model_version"],
                    current_condition=forecast_result["current_condition"],
                    current_risk=forecast_result["current_risk"],
                    data_quality=forecast_result["data_quality"],
                    trend=forecast_result["trend"],
                    deterioration_rate=forecast_result["deterioration_rate"],
                    horizons_json=json.dumps(forecast_result["forecast"]),
                    maintenance_window=forecast_result["maintenance_window"],
                    critical_threshold_crossing=forecast_result["critical_threshold_crossing"],
                    evidence_chain_json=json.dumps(forecast_result["evidence_chain"]),
                    predicted_at=datetime.utcnow()
                )
                db.add(record)
                db.commit()
            except Exception as e:
                db.rollback()

        return forecast_result

    @classmethod
    def get_city_summary(cls, db: Session) -> Dict[str, Any]:
        """
        Aggregates citywide predictive metrics: accelerating assets, critical <12M, maintenance windows.
        """
        assets = db.query(Asset).all()
        total_assets = len(assets)

        accelerating_count = 0
        critical_under_12m = 0
        maintenance_under_6m = 0
        low_data_confidence_count = 0
        total_projected_loss_12m = 0.0

        window_counts = {
            "Immediate (0–3 months)": 0,
            "3–6 months": 0,
            "6–12 months": 0,
            "12–24 months": 0,
            "Routine Monitoring (>24 months)": 0
        }

        for asset in assets:
            # Quick deterministic forecast calculation without heavy DB persistence
            trend_score = int(getattr(asset, "historical_deterioration", 15.0) or 15)
            cond = asset.condition_score
            exposure = int(getattr(asset, "environmental_exposure", 50.0) or 50)
            usage = asset.usage_score

            base_rate = max(4.0, (usage * 0.08) + (exposure * 0.06) + (trend_score * 0.05))
            trend = "ACCELERATING" if (trend_score >= 80 or base_rate >= 14.0 or cond < 30) else "MODERATE" if base_rate >= 7.0 else "STABLE"

            if trend == "ACCELERATING":
                accelerating_count += 1

            # 12M projected condition
            loss_12m = base_rate * (1.22 if trend == "ACCELERATING" else 1.08 if trend == "MODERATE" else 1.0)
            cond_12m = max(1, round(cond - loss_12m))
            total_projected_loss_12m += loss_12m

            if cond_12m < 40:
                critical_under_12m += 1

            # Maintenance window
            if cond < 30 or asset.risk_score >= 85:
                window = "Immediate (0–3 months)"
                maintenance_under_6m += 1
            elif cond < 50 or cond_12m < 40:
                window = "3–6 months"
                maintenance_under_6m += 1
            elif cond_12m < 55:
                window = "6–12 months"
            elif cond_12m < 70:
                window = "12–24 months"
            else:
                window = "Routine Monitoring (>24 months)"

            if window in window_counts:
                window_counts[window] += 1

        avg_loss = round(total_projected_loss_12m / max(1, total_assets), 1)

        return {
            "total_assets_evaluated": total_assets,
            "accelerating_count": accelerating_count,
            "critical_under_12m": critical_under_12m,
            "maintenance_under_6m": maintenance_under_6m,
            "low_data_confidence_count": low_data_confidence_count,
            "avg_projected_loss_12m": avg_loss,
            "risk_mitigation_window_breakdown": window_counts
        }

    @classmethod
    def get_predictive_priorities(cls, db: Session, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Returns assets ranked by priority enriched with 12M condition forecast, trend, and maintenance window.
        """
        assets = db.query(Asset).all()
        ranked = PriorityEngine.rank_assets([
            {
                "id": a.id,
                "asset_id": a.asset_id,
                "name": a.name,
                "asset_type": a.asset_type,
                "zone": a.zone,
                "risk_score": a.risk_score,
                "risk_level": a.risk_level,
                "condition_score": a.condition_score,
                "criticality": a.criticality,
                "usage_score": a.usage_score,
                "damage_severity": a.damage_severity,
                "estimated_repair_cost": a.estimated_repair_cost,
                "historical_deterioration": a.historical_deterioration,
                "environmental_exposure": a.environmental_exposure
            }
            for a in assets
        ])

        results = []
        for item in ranked[:limit]:
            trend_score = int(item.get("historical_deterioration") or 15)
            cond = item["condition_score"]
            exposure = int(item.get("environmental_exposure") or 50)
            usage = item["usage_score"]

            base_rate = max(4.0, (usage * 0.08) + (exposure * 0.06) + (trend_score * 0.05))
            trend = "ACCELERATING" if (trend_score >= 80 or base_rate >= 14.0 or cond < 30) else "MODERATE" if base_rate >= 7.0 else "STABLE"

            loss_12m = base_rate * (1.22 if trend == "ACCELERATING" else 1.08 if trend == "MODERATE" else 1.0)
            cond_12m = max(1, round(cond - loss_12m))

            if cond < 30 or item["risk_score"] >= 85:
                window = "Immediate (0–3M)"
            elif cond < 50 or cond_12m < 40:
                window = "3–6M"
            elif cond_12m < 55:
                window = "6–12M"
            elif cond_12m < 70:
                window = "12–24M"
            else:
                window = ">24M"

            results.append({
                "asset_id": item["asset_id"],
                "asset_name": item["name"],
                "asset_type": item["asset_type"],
                "zone": item["zone"],
                "current_risk": item["risk_score"],
                "risk_level": item["risk_level"],
                "current_condition": item["condition_score"],
                "forecast_12m": cond_12m,
                "trend": trend,
                "maintenance_window": window,
                "priority_rank": item["priority_rank"]
            })

        return results
