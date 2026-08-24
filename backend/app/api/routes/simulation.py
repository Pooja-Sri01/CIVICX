from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.api.dependencies import get_db
from backend.app.models.models import Asset
from backend.app.schemas.schemas import SimulationRunRequest, SimulationRunResponse, PortfolioSimulationResponse
from backend.app.algorithms.simulation_engine import SimulationEngine

router = APIRouter(tags=["City Time Machine"])

@router.post("/simulation/run", response_model=SimulationRunResponse)
def run_simulation(
    req: SimulationRunRequest,
    db: Session = Depends(get_db)
):
    """
    Runs City Time Machine simulation projecting 2026-2030 decay curves and scenario trade-offs.
    """
    query = db.query(Asset)
    if req.asset_id.isdigit():
        asset = query.filter(or_(Asset.id == int(req.asset_id), Asset.asset_id == req.asset_id)).first()
    else:
        asset = query.filter(Asset.asset_id.ilike(req.asset_id)).first()

    if not asset:
        asset = db.query(Asset).first()
        if not asset:
            raise HTTPException(status_code=404, detail="No assets available for simulation.")

    m_count = len(asset.maintenance_records) if asset.maintenance_records else 0

    sim_data = SimulationEngine.simulate_asset(
        asset_id=asset.asset_id,
        current_risk=asset.risk_score,
        current_condition=asset.condition_score,
        base_repair_cost=asset.estimated_repair_cost,
        deterioration_rate=asset.historical_deterioration,
        historical_records_count=m_count,
        last_inspection_date=str(asset.last_inspection_date) if asset.last_inspection_date else "2026-08-14"
    )
    return sim_data

@router.post("/simulation/portfolio", response_model=PortfolioSimulationResponse)
def run_portfolio_simulation(
    db: Session = Depends(get_db)
):
    """
    Runs City-Level Time Machine simulation projecting citywide risk and cost trajectory for 2026-2030.
    """
    assets = db.query(Asset).all()
    asset_dicts = [
        {
            "id": a.id,
            "asset_id": a.asset_id,
            "name": a.name,
            "risk_score": a.risk_score,
            "condition_score": a.condition_score,
            "estimated_repair_cost": a.estimated_repair_cost
        }
        for a in assets
    ]
    return SimulationEngine.simulate_portfolio(asset_dicts)


@router.get("/simulation/asset/{asset_id}")
@router.post("/simulation/asset/{asset_id}")
def simulate_asset_by_path(
    asset_id: str,
    db: Session = Depends(get_db)
):
    """
    Convenience endpoint for single asset simulation by ID (path parameter).
    """
    req = SimulationRunRequest(asset_id=asset_id)
    return run_simulation(req, db)


