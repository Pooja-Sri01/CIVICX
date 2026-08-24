from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.api.dependencies import get_db
from backend.app.models.models import Asset
from backend.app.algorithms.copilot_engine import CopilotEngine

router = APIRouter(tags=["AI Copilot & Decision Intelligence"])

class CopilotChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    agent_mode: Optional[str] = "general"
    api_key: Optional[str] = None

class TestApiKeyRequest(BaseModel):
    api_key: str

@router.post("/copilot/chat")
def copilot_chat(
    req: CopilotChatRequest,
    db: Session = Depends(get_db)
):
    """
    Context-aware Copilot conversation endpoint grounded in actual CivicX infrastructure data,
    powered by Google Gemini LLM API with intelligent deterministic fallback and domain guardrails.
    """
    assets = db.query(Asset).all()
    asset_dicts = [
        {
            "id": str(a.id),
            "asset_id": a.asset_id,
            "name": a.name,
            "asset_type": a.asset_type,
            "type": a.asset_type,
            "location": a.location,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
            "condition_score": a.condition_score,
            "usage_score": a.usage_score,
            "exposure_score": a.environmental_exposure,
            "environmental_exposure": a.environmental_exposure,
            "criticality": a.criticality,
            "priority_rank": a.priority_rank,
            "estimated_repair_cost": a.estimated_repair_cost,
            "recommended_action": a.recommended_action,
            "damage_type": a.damage_type,
            "last_inspection": str(a.last_inspection_date) if a.last_inspection_date else "2026-08-14"
        }
        for a in assets
    ]

    return CopilotEngine.process_query(
        message=req.message,
        context=req.context,
        assets_list=asset_dicts,
        agent_mode=req.agent_mode or "general",
        api_key=req.api_key
    )

@router.post("/copilot/test-key")
def test_gemini_key(req: TestApiKeyRequest):
    """
    Validates a Google Gemini API Key.
    """
    return CopilotEngine.test_gemini_api_key(req.api_key)

@router.get("/copilot/insights")
def get_ai_decision_insights(
    db: Session = Depends(get_db)
):
    """
    Returns proactive AI Decision Insights categorized by Critical, Warning, and Opportunities.
    """
    assets = db.query(Asset).all()
    asset_dicts = [
        {
            "id": str(a.id),
            "asset_id": a.asset_id,
            "name": a.name,
            "asset_type": a.asset_type,
            "type": a.asset_type,
            "location": a.location,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
            "condition_score": a.condition_score,
            "criticality": a.criticality,
            "priority_rank": a.priority_rank,
            "estimated_repair_cost": a.estimated_repair_cost,
            "recommended_action": a.recommended_action
        }
        for a in assets
    ]

    return CopilotEngine.get_proactive_insights(asset_dicts)
