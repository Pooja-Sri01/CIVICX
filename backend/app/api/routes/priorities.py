from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from backend.app.api.dependencies import get_db
from backend.app.models.models import Asset
from backend.app.schemas.schemas import PriorityItemResponse
from backend.app.algorithms.priority_engine import PriorityEngine

router = APIRouter(tags=["Priorities"])

@router.get("/priorities", response_model=List[PriorityItemResponse])
def get_priorities(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Returns dynamically computed priority queue with explainable justification for each rank.
    """
    assets = db.query(Asset).all()
    asset_dicts = [
        {
            "id": a.id,
            "asset_id": a.asset_id,
            "name": a.name,
            "asset_type": a.asset_type,
            "location": a.location,
            "ward": a.ward,
            "zone": a.zone,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
            "condition_score": a.condition_score,
            "criticality": a.criticality,
            "usage_score": a.usage_score,
            "damage_severity": a.damage_severity,
            "estimated_repair_cost": a.estimated_repair_cost,
            "recommended_action": a.recommended_action
        }
        for a in assets
    ]

    ranked = PriorityEngine.rank_assets(asset_dicts)
    return [
        PriorityItemResponse(
            id=r["id"],
            asset_id=r["asset_id"],
            name=r["name"],
            asset_type=r["asset_type"],
            location=r["location"],
            ward=r.get("ward"),
            zone=r.get("zone"),
            risk_score=r["risk_score"],
            risk_level=r["risk_level"],
            condition_score=r["condition_score"],
            criticality=r["criticality"],
            usage_score=r["usage_score"],
            estimated_repair_cost=r["estimated_repair_cost"],
            priority_score=r["priority_score"],
            priority_rank=r["priority_rank"],
            priority_reason=r["priority_reason"],
            recommended_action=r["recommended_action"]
        )
        for r in ranked[:limit]
    ]
