"""
CIVICX Predictive Deterioration REST API Endpoints (Prompt 8)
Provides multi-horizon condition forecasting, citywide predictive outlooks,
proactive maintenance windows, and predictive priority queues.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from backend.app.api.dependencies import get_db
from backend.app.services.predictive_service import PredictiveService
from backend.app.schemas.schemas import (
    DeteriorationForecastResponse,
    PredictiveSummaryResponse,
    PredictivePriorityItem
)

router = APIRouter(prefix="/predictions", tags=["predictive-intelligence"])

@router.get("/assets/{asset_id}", response_model=DeteriorationForecastResponse)
def get_asset_prediction(asset_id: str, db: Session = Depends(get_db)):
    """
    Retrieves empirical multi-horizon deterioration forecast for a specific infrastructure asset.
    """
    forecast = PredictiveService.get_asset_forecast(db, asset_id=asset_id, persist=True)
    return forecast

@router.get("/summary", response_model=PredictiveSummaryResponse)
def get_predictive_summary(db: Session = Depends(get_db)):
    """
    Returns citywide predictive metrics: accelerating assets, critical <12M, maintenance windows.
    """
    return PredictiveService.get_city_summary(db)

@router.get("/priorities", response_model=List[PredictivePriorityItem])
def get_predictive_priorities(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns predictive priority queue enriched with 12M condition forecast and deterioration trend.
    """
    return PredictiveService.get_predictive_priorities(db, limit=limit)

@router.post("/run", response_model=DeteriorationForecastResponse)
def run_asset_prediction(
    asset_id: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Triggers an on-demand recalculation of an asset's deterioration forecast and persists snapshot.
    """
    forecast = PredictiveService.get_asset_forecast(db, asset_id=asset_id, persist=True)
    return forecast
