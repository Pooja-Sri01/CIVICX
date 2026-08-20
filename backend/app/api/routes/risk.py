from fastapi import APIRouter
from backend.app.schemas.schemas import RiskCalculateRequest, RiskCalculateResponse
from backend.app.algorithms.risk_engine import RiskEngine

router = APIRouter(tags=["Risk Engine"])

@router.post("/risk/calculate", response_model=RiskCalculateResponse)
def calculate_risk_score(req: RiskCalculateRequest):
    """
    Executes deterministic multi-criteria risk index calculation and factor impact breakdown.
    """
    res = RiskEngine.calculate_risk(
        condition_score=req.condition_score,
        damage_severity=req.damage_severity,
        usage_score=req.usage_score,
        criticality=req.criticality,
        historical_deterioration=req.historical_deterioration or 15.0,
        environmental_exposure=req.environmental_exposure or 50.0
    )
    return res
