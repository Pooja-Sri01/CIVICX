"""
CIVICX Municipal Action Center Endpoints (Prompt 10)
Provides REST APIs for tracking operational municipal actions and decision workflows.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.api.dependencies import get_db
from backend.app.services.recommendation_service import RecommendationService
from backend.app.schemas.schemas import (
    MunicipalActionCreate,
    MunicipalActionResponse
)

router = APIRouter(prefix="/actions", tags=["Municipal Action Center"])

class ActionStatusUpdateRequest(BaseModel):
    status: str # NEW, UNDER_REVIEW, APPROVED, SCHEDULED, IN_PROGRESS, COMPLETED, MONITORING

@router.get("", response_model=List[MunicipalActionResponse])
def list_action_items(
    status: Optional[str] = Query(None, description="Filter by status"),
    urgency: Optional[str] = Query(None, description="Filter by urgency"),
    asset_id: Optional[str] = Query(None, description="Filter by asset ID"),
    db: Session = Depends(get_db)
):
    """
    Lists operational municipal action items.
    """
    return RecommendationService.get_action_items(db, status=status, urgency=urgency, asset_id=asset_id)

@router.post("", response_model=MunicipalActionResponse)
def create_action_item(
    req: MunicipalActionCreate,
    db: Session = Depends(get_db)
):
    """
    Creates a new operational action item from a decision recommendation.
    """
    return RecommendationService.create_action_item(db, req.model_dump())

@router.patch("/{action_id}/status", response_model=MunicipalActionResponse)
def update_action_item_status(
    action_id: int,
    req: ActionStatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Updates the operational workflow status of an action item.
    """
    updated = RecommendationService.update_action_status(db, action_id, req.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Municipal action item not found.")
    return updated
