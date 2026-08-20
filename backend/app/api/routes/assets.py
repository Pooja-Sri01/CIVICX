from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from backend.app.api.dependencies import get_db
from backend.app.models.models import Asset, MaintenanceRecord, InfrastructureReport
from backend.app.schemas.schemas import (
    AssetResponse,
    MaintenanceRecordResponse,
    InfrastructureReportResponse
)

router = APIRouter(tags=["Assets"])

def find_asset_or_404(asset_id_or_pk: str, db: Session) -> Asset:
    query = db.query(Asset)
    if asset_id_or_pk.isdigit():
        asset = query.filter(or_(Asset.id == int(asset_id_or_pk), Asset.asset_id == asset_id_or_pk)).first()
    else:
        asset = query.filter(Asset.asset_id.ilike(asset_id_or_pk)).first()
        
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset with ID '{asset_id_or_pk}' not found.")
    return asset

@router.get("/assets", response_model=List[AssetResponse])
def list_assets(
    asset_type: Optional[str] = Query(None, description="Filter by asset archetype e.g. Road, Bridge"),
    risk_level: Optional[str] = Query(None, description="Filter by risk tier: LOW, MEDIUM, HIGH, CRITICAL"),
    zone: Optional[str] = Query(None, description="Filter by municipal zone e.g. Central Zone, East Zone"),
    search: Optional[str] = Query(None, description="Search in name, asset_id, or location"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Asset)
    if asset_type and asset_type != "All":
        query = query.filter(Asset.asset_type.ilike(asset_type))
    if risk_level and risk_level != "All":
        query = query.filter(Asset.risk_level == risk_level.upper())
    if zone and zone != "All":
        query = query.filter(Asset.zone.ilike(zone))
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Asset.name.ilike(s),
                Asset.asset_id.ilike(s),
                Asset.location.ilike(s)
            )
        )
    return query.order_by(Asset.priority_rank.asc()).offset(offset).limit(limit).all()

@router.get("/assets/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: str,
    db: Session = Depends(get_db)
):
    return find_asset_or_404(asset_id, db)

@router.get("/assets/{asset_id}/maintenance", response_model=List[MaintenanceRecordResponse])
def get_asset_maintenance(
    asset_id: str,
    db: Session = Depends(get_db)
):
    asset = find_asset_or_404(asset_id, db)
    return asset.maintenance_records

@router.get("/assets/{asset_id}/reports", response_model=List[InfrastructureReportResponse])
def get_asset_reports(
    asset_id: str,
    db: Session = Depends(get_db)
):
    asset = find_asset_or_404(asset_id, db)
    return asset.reports
