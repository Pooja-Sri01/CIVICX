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


@router.post("/budget/scenarios")
def get_budget_scenarios(
    db: Session = Depends(get_db)
):
    """
    Runs knapsack optimization at 4 standard budget tiers simultaneously.
    Returns a side-by-side comparison for the Budget Scenario Analysis panel.
    Tiers: ₹5M / ₹15M / ₹25M / ₹50M
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

    budget_tiers = [
        {"budget": 5_000_000, "label": "₹50 Lakhs"},
        {"budget": 15_000_000, "label": "₹1.5 Crore"},
        {"budget": 25_000_000, "label": "₹2.5 Crore"},
        {"budget": 50_000_000, "label": "₹5 Crore"},
    ]

    scenarios = []
    for tier in budget_tiers:
        result = BudgetOptimizer.optimize(asset_dicts, tier["budget"], "civicx_value_max")
        # Count critical assets funded
        critical_funded = sum(
            1 for a in result.get("selected_assets", [])
            if str(a.get("risk_level", "")).upper() == "CRITICAL"
        )
        scenarios.append({
            "budget_label": tier["label"],
            "budget_amount": tier["budget"],
            "assets_funded": result.get("assets_repaired", 0),
            "total_cost": result.get("total_cost", 0),
            "budget_utilization_pct": result.get("budget_utilization_pct", 0),
            "risk_reduction": result.get("estimated_risk_reduction", 0),
            "risk_reduction_percentage": result.get("risk_reduction_percentage", 0),
            "critical_assets_funded": critical_funded,
            "unfunded_critical": result.get("portfolio_explanation", {}).get("unfunded_critical_count", 0),
            "critical_budget_gap": result.get("critical_budget_gap", 0),
            "remaining_budget": result.get("remaining_budget", 0),
            "cost_per_risk_point": result.get("cost_per_risk_point_reduced", 0),
            "summary": result.get("portfolio_explanation", {}).get("summary", ""),
        })

    return {
        "scenarios": scenarios,
        "total_assets_evaluated": len(asset_dicts),
        "total_portfolio_cost": sum(a["estimated_repair_cost"] for a in asset_dicts),
        "strategy": "civicx_value_max"
    }

