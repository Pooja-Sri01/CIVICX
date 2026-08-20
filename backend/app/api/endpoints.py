from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import copy

from backend.app.database.seed_data import get_all_seed_assets
from backend.app.schemas.schemas import (
    AssetSchema,
    DashboardSummaryResponse,
    RiskCalculateRequest,
    RiskCalculateResponse,
    BudgetOptimizeRequest,
    SimulationRequest,
    InspectionAnalyzeRequest
)
from backend.app.services.risk_engine import RiskEngine
from backend.app.services.priority_engine import PriorityEngine
from backend.app.services.budget_optimizer import BudgetOptimizer
from backend.app.services.simulation_engine import SimulationEngine
from backend.app.services.inspection_engine import InspectionEngine

router = APIRouter(prefix="/api")

# In-memory realistic dataset initialized once
ASSETS_DB = get_all_seed_assets()

@router.get("/health")
def health_check():
    return {"status": "online", "platform": "CIVICX", "version": "1.0.0", "demoCity": "Coimbatore"}

@router.get("/dashboard/summary")
def get_dashboard_summary():
    total_assets = 1248
    critical_count = sum(1 for a in ASSETS_DB if a["riskLevel"] == "Critical")
    high_count = sum(1 for a in ASSETS_DB if a["riskLevel"] == "High")
    med_count = sum(1 for a in ASSETS_DB if a["riskLevel"] == "Medium")
    low_count = sum(1 for a in ASSETS_DB if a["riskLevel"] == "Low")

    # Group by category
    categories = ["Road", "Bridge", "Drainage", "Culvert", "Flyover", "Traffic Corridor"]
    cat_summary = []
    for cat in categories:
        cat_assets = [a for a in ASSETS_DB if a["type"] == cat]
        if cat_assets:
            avg_r = sum(a["riskScore"] for a in cat_assets) / len(cat_assets)
            crit_c = sum(1 for a in cat_assets if a["riskLevel"] == "Critical")
            tot_cost = sum(a["estimatedRepairCost"] for a in cat_assets)
            cat_summary.append({
                "category": cat,
                "total": len(cat_assets) * 16, # Scaled for demo city scale
                "avgRisk": round(avg_r, 1),
                "criticalCount": crit_c,
                "totalEstCost": tot_cost
            })

    alerts = [
        {"id": "alt-1", "assetId": "RD-1042", "name": "Gandhipuram Underpass Inbound Arterial", "risk": 93, "riskLevel": "Critical", "timestamp": "14 mins ago", "action": "Structural Milling"},
        {"id": "alt-2", "assetId": "BR-2019", "name": "Peelamedu Avinashi Road Rail Overbridge", "risk": 91, "riskLevel": "Critical", "timestamp": "1 hour ago", "action": "Joint Replacement"},
        {"id": "alt-3", "assetId": "DR-3051", "name": "Ukkadam Big Bazaar Primary Culvert", "risk": 88, "riskLevel": "Critical", "timestamp": "3 hours ago", "action": "RC Jacketing"},
        {"id": "alt-4", "assetId": "FL-4008", "name": "100 Feet Road Flyover Western Ramp", "risk": 84, "riskLevel": "Critical", "timestamp": "5 hours ago", "action": "Slab Jacking"}
    ]

    return {
        "city": "Coimbatore",
        "region": "Tamil Nadu, India",
        "totalAssets": total_assets,
        "highRiskAssets": 86,
        "criticalAssets": 19,
        "mediumRiskAssets": 412,
        "lowRiskAssets": 731,
        "activeRepairPlanCost": 18400000.0,
        "availableBudget": 25000000.0,
        "riskDistribution": {
            "critical": 19,
            "high": 86,
            "medium": 412,
            "low": 731
        },
        "categoryRisk": cat_summary,
        "recentAlerts": alerts
    }

@router.get("/assets")
def get_assets(
    type: Optional[str] = None,
    riskLevel: Optional[str] = None,
    zone: Optional[str] = None,
    search: Optional[str] = None
):
    results = ASSETS_DB
    if type:
        results = [a for a in results if a["type"].lower() == type.lower()]
    if riskLevel:
        results = [a for a in results if a["riskLevel"].lower() == riskLevel.lower()]
    if zone:
        results = [a for a in results if a["zone"].lower() == zone.lower()]
    if search:
        s = search.lower()
        results = [
            a for a in results 
            if s in a["name"].lower() or s in a["assetId"].lower() or s in a["location"].lower()
        ]
    return results

@router.get("/assets/{asset_id}")
def get_asset_by_id(asset_id: str):
    for a in ASSETS_DB:
        if a["id"] == asset_id or a["assetId"].lower() == asset_id.lower():
            return a
    raise HTTPException(status_code=404, detail="Asset not found")

@router.get("/priorities")
def get_priorities(limit: int = 50):
    ranked = PriorityEngine.rank_assets(ASSETS_DB)
    return ranked[:limit]

@router.post("/risk/calculate")
def calculate_risk(req: RiskCalculateRequest):
    return RiskEngine.calculate(
        condition_score=req.conditionScore,
        damage_severity=req.damageSeverity,
        criticality_score=req.criticalityScore,
        usage_score=req.usageScore,
        trend_score=req.trendScore,
        exposure_score=req.exposureScore
    )

@router.post("/budget/optimize")
def optimize_budget(req: BudgetOptimizeRequest):
    return BudgetOptimizer.optimize(
        assets=ASSETS_DB,
        budget=req.budget,
        strategy=req.strategy or "civicx_value_max"
    )

@router.post("/simulation/run")
def run_simulation(req: SimulationRequest):
    target = None
    for a in ASSETS_DB:
        if a["id"] == req.assetId or a["assetId"].lower() == req.assetId.lower():
            target = a
            break
    if not target:
        target = ASSETS_DB[0]
    return SimulationEngine.simulate(target)

@router.post("/inspection/analyze")
def analyze_inspection(req: InspectionAnalyzeRequest):
    return InspectionEngine.analyze_asset_image(req.assetId, req.imageUrl)

@router.get("/reports/{asset_id}")
def get_report(asset_id: str):
    target = None
    for a in ASSETS_DB:
        if a["id"] == asset_id or a["assetId"].lower() == asset_id.lower():
            target = a
            break
    if not target:
        target = ASSETS_DB[0]

    sim = SimulationEngine.simulate(target)
    return {
        "reportId": f"REP-2026-{target['assetId']}",
        "generatedAt": "2026-08-20T20:30:00Z",
        "authority": "Coimbatore Municipal Infrastructure Command",
        "asset": target,
        "simulation": sim,
        "recommendedAction": target["recommendedAction"],
        "budgetImpact": target["estimatedRepairCost"]
    }
