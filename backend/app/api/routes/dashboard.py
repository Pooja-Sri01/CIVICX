from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List

from backend.app.api.dependencies import get_db
from backend.app.models.models import Asset
from backend.app.schemas.schemas import (
    DashboardSummaryResponse,
    RiskDistributionResponse,
    CategoryDistributionItem,
    PriorityItemResponse
)
from backend.app.algorithms.priority_engine import PriorityEngine

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Computes real-time dynamic dashboard indicators strictly calculated from the database.
    """
    assets = db.query(Asset).all()
    total_assets = len(assets)
    
    if total_assets == 0:
        return {
            "city": "Coimbatore",
            "region": "Tamil Nadu, India",
            "total_assets": 0,
            "critical_assets": 0,
            "high_risk_assets": 0,
            "medium_risk_assets": 0,
            "low_risk_assets": 0,
            "total_estimated_repair_cost": 0.0,
            "available_budget": 25000000.0,
            "average_risk": 0.0,
            "risk_distribution": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0},
            "category_summary": [],
            "top_priority_assets": []
        }

    critical_count = sum(1 for a in assets if a.risk_level == "CRITICAL")
    high_count = sum(1 for a in assets if a.risk_level == "HIGH")
    medium_count = sum(1 for a in assets if a.risk_level == "MEDIUM")
    low_count = sum(1 for a in assets if a.risk_level == "LOW")

    total_cost = sum(a.estimated_repair_cost for a in assets)
    avg_risk = sum(a.risk_score for a in assets) / float(total_assets)

    # Group by category dynamically
    categories_set = sorted(list({a.asset_type for a in assets}))
    cat_summary: List[CategoryDistributionItem] = []
    for cat in categories_set:
        c_assets = [a for a in assets if a.asset_type == cat]
        cat_summary.append(
            CategoryDistributionItem(
                asset_type=cat,
                count=len(c_assets),
                average_risk=round(sum(a.risk_score for a in c_assets) / len(c_assets), 1),
                critical_count=sum(1 for a in c_assets if a.risk_level == "CRITICAL"),
                total_repair_cost=round(sum(a.estimated_repair_cost for a in c_assets), 2)
            )
        )

    # Top priority assets
    ranked = sorted(assets, key=lambda x: x.priority_rank)[:8]
    top_prio_items = [
        PriorityItemResponse(
            id=a.id,
            asset_id=a.asset_id,
            name=a.name,
            asset_type=a.asset_type,
            location=a.location,
            ward=a.ward,
            zone=a.zone,
            risk_score=a.risk_score,
            risk_level=a.risk_level,
            condition_score=a.condition_score,
            criticality=a.criticality,
            usage_score=a.usage_score,
            estimated_repair_cost=a.estimated_repair_cost,
            priority_score=PriorityEngine.calculate_priority_score(
                risk_score=a.risk_score,
                criticality=a.criticality,
                usage_score=a.usage_score,
                damage_severity=a.damage_severity,
                estimated_repair_cost=a.estimated_repair_cost
            ),
            priority_rank=a.priority_rank,
            priority_reason=PriorityEngine.generate_reason(
                risk_score=a.risk_score,
                risk_level=a.risk_level,
                criticality=a.criticality,
                usage_score=a.usage_score,
                estimated_repair_cost=a.estimated_repair_cost,
                rank=a.priority_rank
            ),
            recommended_action=a.recommended_action
        )
        for a in ranked
    ]

    return {
        "city": "Coimbatore",
        "region": "Tamil Nadu, India",
        "total_assets": total_assets,
        "critical_assets": critical_count,
        "high_risk_assets": high_count,
        "medium_risk_assets": medium_count,
        "low_risk_assets": low_count,
        "total_estimated_repair_cost": round(total_cost, 2),
        "available_budget": 25000000.0,
        "average_risk": round(avg_risk, 1),
        "risk_distribution": {
            "CRITICAL": critical_count,
            "HIGH": high_count,
            "MEDIUM": medium_count,
            "LOW": low_count
        },
        "category_summary": cat_summary,
        "top_priority_assets": top_prio_items
    }

@router.get("/assets/risk-distribution", response_model=RiskDistributionResponse)
def get_risk_distribution(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    total = len(assets)
    if total == 0:
        return {
            "total_assets": 0,
            "distribution": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0},
            "average_risk": 0.0,
            "critical_count": 0,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
            "historical_trend_summary": "No assets available."
        }

    critical = sum(1 for a in assets if a.risk_level == "CRITICAL")
    high = sum(1 for a in assets if a.risk_level == "HIGH")
    medium = sum(1 for a in assets if a.risk_level == "MEDIUM")
    low = sum(1 for a in assets if a.risk_level == "LOW")
    avg = sum(a.risk_score for a in assets) / float(total)

    return {
        "total_assets": total,
        "distribution": {
            "CRITICAL": critical,
            "HIGH": high,
            "MEDIUM": medium,
            "LOW": low
        },
        "average_risk": round(avg, 1),
        "critical_count": critical,
        "high_count": high,
        "medium_count": medium,
        "low_count": low,
        "historical_trend_summary": f"{round((critical + high)/total * 100, 1)}% of monitored city infrastructure exhibits high or critical degradation needing immediate preventative intervention."
    }


@router.get("/dashboard/data-health")
def get_data_health(db: Session = Depends(get_db)):
    """
    Returns data quality and freshness metrics across the monitored asset portfolio.
    Shows which assets have recent inspections, outdated data, or missing records.
    """
    import datetime as dt_module
    assets = db.query(Asset).all()
    total = len(assets)
    if total == 0:
        return {
            "total_assets": 0,
            "recent_inspections": 0,
            "moderate_age_inspections": 0,
            "outdated_inspections": 0,
            "missing_inspection_date": 0,
            "missing_damage_type": 0,
            "assets_with_maintenance_records": 0,
            "assets_without_maintenance_records": 0,
            "data_freshness_pct": 0.0,
            "health_score": 0.0,
            "summary": "No assets in the system."
        }

    today = dt_module.date.today()
    recent = 0       # inspected within 30 days
    moderate = 0     # 30–90 days
    outdated = 0     # >90 days
    missing_date = 0
    missing_damage = 0
    has_maintenance = 0

    for a in assets:
        # Inspection date freshness
        if not a.last_inspection_date:
            missing_date += 1
        else:
            try:
                # Handle both string dates (YYYY-MM-DD) and simple year strings
                date_str = str(a.last_inspection_date).strip()
                if len(date_str) == 10:
                    insp_date = dt_module.date.fromisoformat(date_str)
                elif len(date_str) == 4:
                    insp_date = dt_module.date(int(date_str), 1, 1)
                else:
                    insp_date = dt_module.date.fromisoformat(date_str[:10])
                days_ago = (today - insp_date).days
                if days_ago <= 30:
                    recent += 1
                elif days_ago <= 90:
                    moderate += 1
                else:
                    outdated += 1
            except (ValueError, TypeError):
                missing_date += 1

        # Data completeness checks
        if not a.damage_type or a.damage_type.strip() == "":
            missing_damage += 1
        if a.maintenance_records and len(a.maintenance_records) > 0:
            has_maintenance += 1

    no_maintenance = total - has_maintenance
    data_freshness_pct = round((recent + moderate) / total * 100.0, 1)
    health_score = round(
        (recent * 1.0 + moderate * 0.6 + outdated * 0.1) / total * 100.0, 1
    )

    return {
        "total_assets": total,
        "recent_inspections": recent,
        "moderate_age_inspections": moderate,
        "outdated_inspections": outdated,
        "missing_inspection_date": missing_date,
        "missing_damage_type": missing_damage,
        "assets_with_maintenance_records": has_maintenance,
        "assets_without_maintenance_records": no_maintenance,
        "data_freshness_pct": data_freshness_pct,
        "health_score": health_score,
        "summary": (
            f"Data Health: {data_freshness_pct}% of assets have inspections within 90 days. "
            f"{missing_date} assets lack inspection dates. "
            f"{no_maintenance} assets have no maintenance history on record."
        )
    }

