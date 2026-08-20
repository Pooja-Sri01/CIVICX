from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.api.dependencies import get_db
from backend.app.models.models import Asset
from backend.app.schemas.schemas import BudgetOptimizeRequest, BudgetOptimizeResponse
from backend.app.algorithms.budget_optimizer import BudgetOptimizer

router = APIRouter(tags=["Budget Optimizer"])

@router.post("/budget/optimize", response_model=BudgetOptimizeResponse)
def optimize_budget(
    req: BudgetOptimizeRequest,
    db: Session = Depends(get_db)
):
    """
    Executes knapsack value-maximization heuristic selecting optimal repair portfolio within available budget.
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
            "estimated_repair_cost": a.estimated_repair_cost,
            "recommended_action": a.recommended_action
        }
        for a in assets
    ]

    result = BudgetOptimizer.optimize(
        assets=asset_dicts,
        available_budget=req.available_budget,
        strategy=req.strategy or "civicx_value_max"
    )
    return result
