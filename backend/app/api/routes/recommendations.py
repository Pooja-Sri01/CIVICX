"""
CIVICX Explainable Recommendation Endpoints (Prompt 10)
Provides REST APIs for asset-specific and citywide explainable decision recommendations.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.api.dependencies import get_db
from backend.app.services.recommendation_service import RecommendationService
from backend.app.schemas.schemas import (
    DecisionRecommendationResponse,
    CityRecommendationsSummaryResponse
)

router = APIRouter(prefix="/recommendations", tags=["Explainable Recommendations"])

@router.get("/assets/{asset_id}", response_model=DecisionRecommendationResponse)
def get_asset_recommendation(
    asset_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns an explainable, fact-grounded municipal recommendation for an asset.
    """
    return RecommendationService.get_asset_recommendation(db, asset_id)

@router.get("/city-summary", response_model=CityRecommendationsSummaryResponse)
def get_city_recommendations_summary(
    db: Session = Depends(get_db)
):
    """
    Returns citywide summary of recommendations, distinguishing 'Attention Required Now' from 'Can Wait (Monitor)'.
    """
    return RecommendationService.get_city_recommendations_summary(db)
