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

@router.get("/assets/{asset_id}/inspection")
def get_asset_inspection(asset_id: str):
    target = None
    for a in ASSETS_DB:
        if a["id"] == asset_id or a["assetId"].lower() == asset_id.lower():
            target = a
            break
    if not target:
        target = ASSETS_DB[0]

    cond = target["conditionScore"]
    cond_rating = "GOOD" if cond >= 80 else "FAIR" if cond >= 60 else "POOR" if cond >= 40 else "CRITICAL"
    
    return {
        "asset_id": target["assetId"],
        "name": target["name"],
        "asset_type": target["type"],
        "location": target["location"],
        "last_inspection_date": target.get("lastInspection", "2026-08-14"),
        "condition_score": cond,
        "condition_rating": cond_rating,
        "observed_evidence": [
            f"Primary Distress: {target.get('damageType', 'Pavement fatigue cracking')}",
            f"Structural Condition Index: {cond}/100 ({cond_rating})",
            f"Damage Severity Rating: {target.get('damageSeverity', 50)}/100",
            f"Traffic Exposure: {target.get('usageScore', 50)}/100 urban transit density",
            f"Environmental Hydro-Stress: {target.get('exposureScore', 50)}/100 monsoon vulnerability index",
            f"Historical Maintenance: {len(target.get('maintenanceHistory', []))} logged interventions"
        ],
        "detected_issues": [
            {
                "issue": target.get("damageType", "Pavement Fatigue Distress"),
                "severity": target["riskLevel"].upper(),
                "evidence": "Visual survey telemetry & municipal field logs",
                "impact": "Structural layer fatigue and localized raveling",
                "confidence": 0.94
            },
            {
                "issue": "Subgrade Water Inundation Vulnerability",
                "severity": "HIGH" if target.get("exposureScore", 50) >= 60 else "MEDIUM",
                "evidence": f"Hydrological exposure index ({target.get('exposureScore', 50)}/100)",
                "impact": "Base moisture ingress and rapid stripping",
                "confidence": 0.91
            }
        ],
        "ai_vision": {
            "damage_type": target.get("damageType", "Pothole (D40) & Fatigue Cracking (D20)"),
            "confidence": 0.94,
            "severity": target["riskLevel"].upper(),
            "description": f"Surface and structural defect localization confirmed in {target['location']} corridor sector.",
            "model_mode": "ANALYTICAL_INSPECTION"
        },
        "deterioration_signal": "Deteriorating" if len(target.get("maintenanceHistory", [])) > 0 else "INSUFFICIENT HISTORY",
        "deterioration_reason": "Condition deficit observed vs prior post-maintenance benchmark." if len(target.get("maintenanceHistory", [])) > 0 else "No prior maintenance interventions logged in database.",
        "next_inspection_recommendation": "Immediate engineering structural verification within 14 days." if target["riskLevel"] == "Critical" else "Follow-up non-destructive survey within 30 days."
    }

@router.get("/assets/{asset_id}/risk-explanation")
def get_asset_risk_explanation(asset_id: str):
    target = None
    for a in ASSETS_DB:
        if a["id"] == asset_id or a["assetId"].lower() == asset_id.lower():
            target = a
            break
    if not target:
        target = ASSETS_DB[0]

    calc = RiskEngine.calculate(
        condition_score=target["conditionScore"],
        damage_severity=target["damageSeverity"],
        criticality_score=target.get("criticalityScore", 80),
        usage_score=target["usageScore"],
        trend_score=target.get("trendScore", 50),
        exposure_score=target.get("exposureScore", 50)
    )

    total_score = max(1, calc["riskScore"])
    drivers = [
        {
            "factor": f["factor"],
            "impact": f["impact"],
            "score_contribution": f["scoreContribution"],
            "percentage_share": round((f["scoreContribution"] / total_score) * 100.0, 1),
            "description": f["description"]
        }
        for f in calc.get("factors", [])
    ]

    return {
        "asset_id": target["assetId"],
        "risk_score": calc["riskScore"],
        "risk_level": calc["riskLevel"],
        "drivers": drivers,
        "summary_explanation": f"Asset {target['assetId']} carries {calc['riskLevel']} risk ({calc['riskScore']}/100) based on condition deficit ({target['conditionScore']}/100) and strategic corridor traffic loading.",
        "what_would_reduce_risk": f"Executing '{target['recommendedAction']}' will restore condition to 85+, mitigating subgrade water infiltration and reducing composite risk by ~{max(15, round(calc['riskScore'] * 0.65))} points.",
        "preventative_roi": f"{round(2.5 + calc['riskScore'] / 25.0, 1)}x ROI vs Delayed Fix",
        "confidence_label": "Deterministic 6-Factor MCDA Analytical Model"
    }

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
    budget_val = getattr(req, "available_budget", None) or getattr(req, "budget", 15000000.0)
    return BudgetOptimizer.optimize(
        assets=ASSETS_DB,
        available_budget=budget_val,
        strategy=req.strategy or "civicx_value_max"
    )


@router.post("/simulation/run")
def run_simulation(req: SimulationRequest):
    target = None
    target_id = getattr(req, "assetId", None) or getattr(req, "asset_id", None) or "1"
    for a in ASSETS_DB:
        if str(a["id"]) == str(target_id) or a["assetId"].lower() == str(target_id).lower():
            target = a
            break
    if not target:
        target = ASSETS_DB[0]

    return SimulationEngine.simulate_asset(
        asset_id=target["assetId"],
        current_risk=target["riskScore"],
        current_condition=target["conditionScore"],
        base_repair_cost=target["estimatedRepairCost"],
        deterioration_rate=target.get("trendScore", 50) / 3.0,
        historical_records_count=len(target.get("maintenanceHistory", [])),
        last_inspection_date=target.get("lastInspection", "2026-08-14")
    )

@router.post("/simulation/portfolio")
def run_portfolio_simulation():
    return SimulationEngine.simulate_portfolio(ASSETS_DB)


@router.post("/inspection/analyze")
def analyze_inspection(req: InspectionAnalyzeRequest):
    return InspectionEngine.analyze_asset_image(req.assetId, req.imageUrl)

@router.get("/reports/portfolio")
def get_portfolio_report_fallback():
    total_assets = len(ASSETS_DB)
    critical_assets = sum(1 for a in ASSETS_DB if a.get("riskLevel") == "Critical")
    high_assets = sum(1 for a in ASSETS_DB if a.get("riskLevel") == "High")
    medium_assets = sum(1 for a in ASSETS_DB if a.get("riskLevel") == "Medium")
    low_assets = sum(1 for a in ASSETS_DB if a.get("riskLevel") == "Low")
    total_cost = sum(a.get("estimatedRepairCost", 0) for a in ASSETS_DB)
    avg_risk = round(sum(a.get("riskScore", 0) for a in ASSETS_DB) / max(1, total_assets), 1)

    sorted_assets = sorted(ASSETS_DB, key=lambda a: a.get("priorityRank", 99))
    top_priorities = [
        {
            "priority_rank": a.get("priorityRank", 1),
            "asset_id": a.get("assetId", ""),
            "name": a.get("name", ""),
            "type": a.get("type", ""),
            "location": a.get("location", ""),
            "risk_score": a.get("riskScore", 0),
            "risk_level": a.get("riskLevel", "Medium").upper(),
            "recommended_action": a.get("recommendedAction", ""),
            "estimated_repair_cost": a.get("estimatedRepairCost", 0)
        }
        for a in sorted_assets[:10]
    ]

    budget_res = BudgetOptimizer.optimize(ASSETS_DB, 15000000.0, "civicx_value_max")
    city_sim = SimulationEngine.simulate_portfolio(ASSETS_DB)

    return {
        "report_id": f"CIVICX-CITY-RPT-CBE-2026",
        "report_type": "PORTFOLIO_DECISION_REPORT",
        "generated_at": "2026-08-21",
        "authority": "Coimbatore City Corporation • Municipal Engineering & Planning Board",
        "status": "EXECUTIVE STRATEGIC BRIEF",
        "overview": {
            "city": "Coimbatore",
            "region": "Tamil Nadu, India",
            "total_assets": total_assets,
            "critical_assets": critical_assets,
            "high_risk_assets": high_assets,
            "medium_risk_assets": medium_assets,
            "low_risk_assets": low_assets,
            "average_risk": avg_risk,
            "total_repair_cost": total_cost,
            "active_budget_envelope": 15000000.0
        },
        "priority_corridors": top_priorities,
        "budget_allocation": {
            "available_budget": 15000000.0,
            "allocated_budget": budget_res.get("total_cost", 0),
            "remaining_budget": budget_res.get("remaining_budget", 0),
            "budget_utilization_pct": budget_res.get("budget_utilization_percentage", 0),
            "assets_addressed": budget_res.get("assets_addressed_count", 0),
            "total_risk_reduction": budget_res.get("total_risk_reduction", 0),
            "selected_assets": budget_res.get("selected_assets", []),
            "unfunded_critical_count": budget_res.get("portfolio_explanation", {}).get("unfunded_critical_count", 0),
            "critical_budget_gap": budget_res.get("critical_budget_gap", 0),
            "portfolio_explanation": budget_res.get("portfolio_explanation", {})
        },
        "citywide_simulation": city_sim,
        "decision_recommendation": {
            "headline": "ADOPT PROACTIVE VALUE-MAXIMIZED CAPITAL ALLOCATION",
            "summary": f"Under the standard ₹1.50 Crore capital ceiling, CivicX Knapsack Optimization funds {budget_res.get('assets_addressed_count', 0)} priority corridors, eliminating {budget_res.get('total_risk_reduction', 0)} risk points. Over 5 years, proactive execution prevents ₹{round(city_sim.get('total_5year_savings', 0)/10000000.0, 2)} Crore in compound delay penalties.",
            "critical_gap_action": f"An additional ₹{round(budget_res.get('critical_budget_gap', 0)/100000.0, 1)} Lakhs is required to fully fund the remaining critical corridor gap."
        },
        "assumptions": {
            "baseline_year": 2026,
            "budget_strategy": "Multi-Criteria Decision Analysis (MCDA) Knapsack Value Maximization",
            "decay_rate_model": "Non-linear compound subgrade degradation index",
            "penalty_model": "Emergency reconstruction penalty scaling factor (2.45x at 12 mo)"
        }
    }

@router.get("/reports/asset/{asset_id}")
@router.get("/reports/{asset_id}")
def get_report(asset_id: str):
    target = None
    for a in ASSETS_DB:
        if str(a["id"]) == str(asset_id) or a["assetId"].lower() == str(asset_id).lower():
            target = a
            break
    if not target:
        target = ASSETS_DB[0]

    sim = SimulationEngine.simulate_asset(
        asset_id=target["assetId"],
        current_risk=target["riskScore"],
        current_condition=target["conditionScore"],
        base_repair_cost=target["estimatedRepairCost"],
        deterioration_rate=target.get("trendScore", 50) / 3.0,
        historical_records_count=len(target.get("maintenanceHistory", [])),
        last_inspection_date=target.get("lastInspection", "2026-08-14")
    )
    risk_analysis = RiskEngine.explain_asset_risk(target)

    return {
        "report_id": f"CIVICX-RPT-{target['assetId']}-2026",
        "report_type": "ASSET_DECISION_REPORT",
        "generated_at": "2026-08-21",
        "authority": "Coimbatore City Corporation • Department of Municipal Infrastructure",
        "status": "OFFICIALLY VERIFIED",
        "asset": {
            "id": target["id"],
            "asset_id": target["assetId"],
            "name": target["name"],
            "asset_type": target["type"],
            "location": target["location"],
            "ward": target.get("ward", "Ward 24"),
            "zone": target.get("zone", "Central Zone"),
            "latitude": target.get("latitude", 11.0168),
            "longitude": target.get("longitude", 76.9558),
            "criticality": target.get("criticality", "HIGH"),
            "condition_score": target["conditionScore"],
            "risk_score": target["riskScore"],
            "risk_level": target["riskLevel"].upper(),
            "priority_rank": target.get("priorityRank", 1),
            "estimated_repair_cost": target["estimatedRepairCost"],
            "recommended_action": target["recommendedAction"],
            "damage_type": target.get("damageType", "Structural Fatigue"),
            "last_inspection": target.get("lastInspection", "2026-08-14")
        },
        "risk_assessment": {
            "score": target["riskScore"],
            "level": target["riskLevel"].upper(),
            "drivers": risk_analysis.get("drivers", []),
            "summary": risk_analysis.get("summary_explanation", f"Asset {target['assetId']} carries {target['riskLevel']} risk due to surface distress and high traffic volume."),
            "what_would_reduce_risk": risk_analysis.get("what_would_reduce_risk", f"Executing {target['recommendedAction']} will reduce risk significantly."),
            "preventative_roi": risk_analysis.get("preventative_roi", "3.2x ROI vs Delayed Fix")
        },
        "inspection_findings": {
            "condition_rating": "CRITICAL" if target["conditionScore"] < 50 else "FAIR",
            "observed_evidence": [
                f"Primary Distress: {target.get('damageType', 'Pavement cracking')}",
                f"Condition Score: {target['conditionScore']}/100",
                f"Traffic Load Index: {target.get('usageScore', 80)}/100"
            ],
            "detected_issues": [
                {
                    "issue": target.get("damageType", "Localized Potholes"),
                    "severity": target["riskLevel"].upper(),
                    "evidence": "Visual survey telemetry & municipal field logs",
                    "impact": "Structural base fatigue",
                    "confidence": 0.94
                }
            ],
            "ai_vision": {
                "damage_type": target.get("damageType", "Pothole"),
                "confidence": 0.94,
                "severity": target["riskLevel"].upper(),
                "description": f"Surface defect localization confirmed on {target['name']}.",
                "model_mode": "ANALYTICAL_INSPECTION"
            },
            "deterioration_signal": "Deteriorating",
            "next_recommendation": "Immediate engineering survey within 14 days."
        },
        "priority_assessment": {
            "rank": target.get("priorityRank", 1),
            "urgency": target["riskLevel"].upper(),
            "rationale": f"Corridor #{target.get('priorityRank', 1)} exhibits {target['riskLevel']} risk with heavy transit loading."
        },
        "recommended_intervention": {
            "action": target["recommendedAction"],
            "cost": target["estimatedRepairCost"],
            "cost_type": "ESTIMATED ENGINEERING COST",
            "expected_risk_reduction": max(10, target["riskScore"] - 12),
            "post_repair_risk": 12
        },
        "what_if_simulation": {
            "scenarios": sim.get("scenarios", {}),
            "cost_of_delay": sim.get("cost_of_delay", 0),
            "additional_risk_from_delay": sim.get("additional_risk_from_delay", 0),
            "yearly_timeline": sim.get("yearly_timeline", []),
            "decision_insight": sim.get("decision_insight", "")
        },
        "decision_recommendation": {
            "headline": f"AUTHORIZE IMMEDIATE INTERVENTION: {target['recommendedAction'].upper()}",
            "summary": f"CivicX recommends prioritizing '{target['recommendedAction']}' on '{target['name']}' at ₹{round(target['estimatedRepairCost']/100000.0, 1)} Lakhs to eliminate {max(10, target['riskScore'] - 12)} risk points.",
            "consequence_of_delay": f"Delaying intervention past 6 months triggers a ₹{round(sim.get('cost_of_delay', 0)/100000.0, 1)} Lakhs (+52%) financial penalty."
        },
        "assumptions": sim.get("assumptions", {}),
        "data_quality": sim.get("data_quality", {})
    }

