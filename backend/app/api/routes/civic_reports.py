import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.api.dependencies import get_db
from backend.app.models.models import CitizenReport, CitizenReward, CitizenUser, Asset, CitizenReportEvent, AuditEvent
from backend.app.schemas.schemas import (
    CitizenReportResponse,
    CitizenReportEventResponse,
    CivicReportStatsResponse,
    CivicReportsSummaryResponse,
    CivicReportAdminDetailResponse,
    PrioritizeReportRequest,
    StatusUpdateRequest,
    ValidateRequest,
    DuplicateRequest,
    RejectRequest,
    AssignWorkflowRequest,
    StartWorkRequest,
    ResolveRequest,
    AssignRequest
)
from backend.app.services.citizen_service import (
    award_citizen_points,
    validate_citizen_report,
    is_valid_status_transition,
    VALID_STATUS_TRANSITIONS
)
from backend.app.services.audit_service import AuditService

router = APIRouter(prefix="/civic-reports", tags=["Government Civic Intelligence"])

def _find_report(report_id: str, db: Session) -> Optional[CitizenReport]:
    query = db.query(CitizenReport)
    if report_id.isdigit():
        rep = query.filter((CitizenReport.id == int(report_id)) | (CitizenReport.report_id == report_id)).first()
    else:
        rep = query.filter(CitizenReport.report_id == report_id).first()
    return rep

def _log_event(
    report_id: int,
    event_type: str,
    old_status: Optional[str],
    new_status: str,
    description: str,
    actor_id: str = "Municipal Engineer",
    db: Session = None
):
    if not db:
        return
    event = CitizenReportEvent(
        report_id=report_id,
        event_type=event_type,
        old_status=old_status,
        new_status=new_status,
        actor_id=actor_id,
        description=description,
        created_at=datetime.utcnow()
    )
    db.add(event)
    db.commit()

    # Also log immutable AuditEvent
    AuditService.log_event(
        db=db,
        event_type=f"REPORT_{event_type}",
        entity_type="CITIZEN_REPORT",
        entity_id=str(report_id),
        actor_id=actor_id,
        actor_type="ENGINEER",
        old_value={"status": old_status},
        new_value={"status": new_status, "description": description}
    )

def _format_report_dict(rep: CitizenReport) -> dict:
    factors = []
    if rep.validation_factors:
        try:
            factors = json.loads(rep.validation_factors)
        except Exception:
            factors = []
    
    events_list = []
    if rep.events:
        for ev in rep.events:
            events_list.append({
                "id": ev.id,
                "report_id": ev.report_id,
                "event_type": ev.event_type,
                "old_status": ev.old_status,
                "new_status": ev.new_status,
                "actor_id": ev.actor_id,
                "description": ev.description,
                "created_at": ev.created_at
            })

    user_name = rep.user.name if rep.user else "Civic Contributor"
    return {
        "id": rep.id,
        "report_id": rep.report_id,
        "user_id": rep.user_id,
        "user_name": user_name,
        "category": rep.category,
        "description": rep.description,
        "photo_url": rep.photo_url,
        "latitude": rep.latitude,
        "longitude": rep.longitude,
        "location_name": rep.location_name,
        "zone": rep.zone or "Central Zone",
        "severity": rep.severity,
        "validation_score": rep.validation_score,
        "validation_status": rep.validation_status,
        "validation_factors": factors,
        "status": rep.status,
        "priority": rep.priority,
        "nearest_asset_id": rep.nearest_asset_id,
        "nearest_asset_distance_m": rep.nearest_asset_distance_m,
        "asset_link_status": getattr(rep, "asset_link_status", "POTENTIAL_MATCH"),
        "asset_link_confidence": getattr(rep, "asset_link_confidence", 0.85),
        "asset_link_reason": getattr(rep, "asset_link_reason", None),
        "linked_at": getattr(rep, "linked_at", None),
        "linked_by": getattr(rep, "linked_by", "CIVICX Match Engine"),
        "assigned_to": rep.assigned_to,
        "assigned_department": rep.assigned_department,
        "assigned_engineer": rep.assigned_engineer,
        "target_date": rep.target_date,
        "resolution_description": rep.resolution_description,
        "resolution_photo": rep.resolution_photo,
        "resolved_at": rep.resolved_at,
        "duplicate_of_id": rep.duplicate_of_id,
        "action_notes": rep.action_notes,
        "events": events_list,
        "created_at": rep.created_at,
        "updated_at": rep.updated_at
    }

@router.get("/summary", response_model=CivicReportsSummaryResponse)
@router.get("/stats", response_model=CivicReportStatsResponse)
def get_civic_report_stats(db: Session = Depends(get_db)):
    """Retrieve aggregate KPI stats for the Government Civic Intelligence Center."""
    all_reports = db.query(CitizenReport).all()
    all_assets = {a.asset_id: a for a in db.query(Asset).all()}
    
    new_reports = sum(1 for r in all_reports if r.status == "SUBMITTED")
    under_review = sum(1 for r in all_reports if r.status == "UNDER_REVIEW")
    validated = sum(1 for r in all_reports if r.status in ["VALIDATED", "PRIORITIZED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"])
    assigned = sum(1 for r in all_reports if r.status == "ASSIGNED")
    in_progress = sum(1 for r in all_reports if r.status in ["IN_PROGRESS", "PRIORITIZED"])
    resolved = sum(1 for r in all_reports if r.status == "RESOLVED")
    duplicate = sum(1 for r in all_reports if r.status == "DUPLICATE")
    rejected = sum(1 for r in all_reports if r.status == "REJECTED")

    # High-Risk linked reports
    high_risk_count = 0
    for r in all_reports:
        if r.nearest_asset_id and r.nearest_asset_id in all_assets:
            ast = all_assets[r.nearest_asset_id]
            if ast.risk_level in ["HIGH", "CRITICAL"] or ast.risk_score >= 70:
                high_risk_count += 1
        elif r.severity in ["HIGH", "CRITICAL"]:
            high_risk_count += 1

    return {
        "new_reports": new_reports,
        "under_review": under_review,
        "validated": validated,
        "assigned": assigned,
        "in_progress": in_progress,
        "resolved": resolved,
        "duplicate": duplicate,
        "rejected": rejected,
        "high_risk_linked": high_risk_count,
        "total": len(all_reports)
    }

@router.get("/my", response_model=List[CitizenReportResponse])
def get_my_citizen_reports(
    email: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve citizen observations submitted by the authenticated/specified citizen."""
    query = db.query(CitizenReport)
    if user_id:
        query = query.filter(CitizenReport.user_id == user_id)
    elif email:
        user = db.query(CitizenUser).filter(CitizenUser.email == email).first()
        if user:
            query = query.filter(CitizenReport.user_id == user.id)
        else:
            return []
    reports = query.order_by(desc(CitizenReport.created_at)).all()
    return [_format_report_dict(r) for r in reports]

@router.get("", response_model=List[CitizenReportResponse])
def get_government_civic_reports(
    zone: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    risk: Optional[str] = None,
    validation: Optional[str] = None,
    asset_status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve all citizen reports with multi-criteria filtering and sorting for Government Civic Intelligence Center."""
    query = db.query(CitizenReport)
    all_assets = {a.asset_id: a for a in db.query(Asset).all()}

    if zone and zone != "All":
        query = query.filter(CitizenReport.zone == zone)
    if category and category != "All":
        query = query.filter(CitizenReport.category == category)
    if status and status != "All":
        query = query.filter(CitizenReport.status == status.upper())
    if severity and severity != "All":
        query = query.filter(CitizenReport.severity == severity.upper())
    if validation and validation != "All":
        query = query.filter(CitizenReport.validation_status.ilike(f"%{validation}%"))
    if priority and priority != "All":
        query = query.filter(CitizenReport.priority == priority.upper())
    if asset_status and asset_status != "All":
        query = query.filter(CitizenReport.asset_link_status == asset_status.upper())
    if search:
        s = f"%{search}%"
        query = query.filter(
            (CitizenReport.report_id.ilike(s)) |
            (CitizenReport.description.ilike(s)) |
            (CitizenReport.location_name.ilike(s)) |
            (CitizenReport.nearest_asset_id.ilike(s)) |
            (CitizenReport.category.ilike(s))
        )

    reports = query.all()

    # Risk level filter (evaluated against linked asset risk or report severity)
    if risk and risk != "All":
        target_risk = risk.upper()
        filtered_reps = []
        for r in reports:
            ast = all_assets.get(r.nearest_asset_id) if r.nearest_asset_id else None
            ast_risk = ast.risk_level.upper() if ast else r.severity.upper()
            if ast_risk == target_risk:
                filtered_reps.append(r)
        reports = filtered_reps

    # Sorting
    if sort == "oldest":
        reports.sort(key=lambda r: r.created_at)
    elif sort == "highest_risk":
        reports.sort(key=lambda r: (all_assets.get(r.nearest_asset_id).risk_score if (r.nearest_asset_id and r.nearest_asset_id in all_assets) else 50), reverse=True)
    elif sort == "highest_priority":
        prio_map = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
        reports.sort(key=lambda r: prio_map.get(r.priority, 1), reverse=True)
    elif sort == "lowest_validation":
        reports.sort(key=lambda r: r.validation_score)
    elif sort == "longest_pending":
        reports.sort(key=lambda r: r.created_at)
    else: # newest default
        reports.sort(key=lambda r: r.created_at, reverse=True)

    return [_format_report_dict(r) for r in reports]

@router.get("/{report_id}/admin")
def get_civic_report_admin_detail(report_id: str, db: Session = Depends(get_db)):
    """Retrieve full administrative decision intelligence combining citizen observation and authoritative CIVICX asset context."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail=f"Civic report '{report_id}' not found")

    asset_data = None
    decision_context = None
    if rep.nearest_asset_id:
        asset = db.query(Asset).filter(Asset.asset_id == rep.nearest_asset_id).first()
        if asset:
            asset_data = {
                "id": asset.id,
                "asset_id": asset.asset_id,
                "name": asset.name,
                "asset_type": asset.asset_type,
                "location": asset.location,
                "zone": asset.zone,
                "ward": asset.ward,
                "risk_score": asset.risk_score,
                "risk_level": asset.risk_level,
                "condition_score": asset.condition_score,
                "priority_rank": asset.priority_rank,
                "recommended_action": asset.recommended_action,
                "estimated_repair_cost": asset.estimated_repair_cost,
                "usage_score": asset.usage_score,
                "environmental_exposure": asset.environmental_exposure,
                "historical_deterioration": asset.historical_deterioration,
                "damage_type": asset.damage_type,
                "damage_severity": asset.damage_severity,
                "cost_of_delay_6m": round(asset.estimated_repair_cost * 1.52, 2)
            }
            decision_context = {
                "priority_rank": asset.priority_rank,
                "recommended_intervention": asset.recommended_action,
                "estimated_cost": asset.estimated_repair_cost,
                "cost_of_delay_6m": round(asset.estimated_repair_cost * 1.52, 2),
                "budget_status": "FUNDED" if asset.priority_rank <= 34 else "UNFUNDED_GAP",
                "evidence_summary": f"Citizen observation {rep.report_id} corroborates inspection telemetry on {asset.name}."
            }

    events = db.query(CitizenReportEvent).filter(CitizenReportEvent.report_id == rep.id).order_by(CitizenReportEvent.created_at.asc()).all()

    return {
        "report": _format_report_dict(rep),
        "linked_asset": asset_data,
        "decision_context": decision_context,
        "events": [
            {
                "id": ev.id,
                "report_id": ev.report_id,
                "event_type": ev.event_type,
                "old_status": ev.old_status,
                "new_status": ev.new_status,
                "actor_id": ev.actor_id,
                "description": ev.description,
                "created_at": ev.created_at
            }
            for ev in events
        ]
    }

@router.get("/{report_id}", response_model=CitizenReportResponse)
def get_civic_report_detail(report_id: str, db: Session = Depends(get_db)):
    """Retrieve a single citizen report with complete decision context and timeline."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail=f"Civic report '{report_id}' not found")
    return _format_report_dict(rep)

@router.get("/{report_id}/timeline", response_model=List[CitizenReportEventResponse])
def get_civic_report_timeline(report_id: str, db: Session = Depends(get_db)):
    """Retrieve the audit timeline events for a specific citizen report."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")
    
    events = db.query(CitizenReportEvent).filter(CitizenReportEvent.report_id == rep.id).order_by(CitizenReportEvent.created_at.asc()).all()
    return events

@router.get("/{report_id}/asset")
def get_report_linked_asset(report_id: str, db: Session = Depends(get_db)):
    """Retrieve correlated asset details, matching explanation, and status for a citizen report."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")

    if not rep.nearest_asset_id:
        return {
            "report_id": rep.report_id,
            "asset": None,
            "match_status": "NO_ASSET_FOUND",
            "confidence": 0.0,
            "reason": "No compatible municipal asset within matching radius.",
            "distance_m": None
        }

    asset = db.query(Asset).filter(Asset.asset_id == rep.nearest_asset_id).first()
    asset_dict = None
    if asset:
        asset_dict = {
            "id": asset.id,
            "asset_id": asset.asset_id,
            "name": asset.name,
            "asset_type": asset.asset_type,
            "location": asset.location,
            "zone": asset.zone,
            "risk_score": asset.risk_score,
            "risk_level": asset.risk_level,
            "condition_score": asset.condition_score,
            "recommended_action": asset.recommended_action,
            "distance_m": rep.nearest_asset_distance_m
        }

    return {
        "report_id": rep.report_id,
        "asset": asset_dict,
        "match_status": getattr(rep, "asset_link_status", "POTENTIAL_MATCH"),
        "confidence": getattr(rep, "asset_link_confidence", 0.85),
        "reason": getattr(rep, "asset_link_reason", f"Nearest compatible {asset.asset_type if asset else 'infrastructure'} corridor within matching radius."),
        "distance_m": rep.nearest_asset_distance_m
    }

@router.post("/{report_id}/link-asset", response_model=CitizenReportResponse)
def manually_link_report_asset(
    report_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    """Allow authorized municipal engineers to manually link, override, or unlink an infrastructure asset."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")

    target_asset_id = payload.get("asset_id")
    action_notes = payload.get("action_notes", "Manually linked by Municipal Engineer")

    if not target_asset_id or target_asset_id == "UNLINK":
        old_asset = rep.nearest_asset_id
        rep.nearest_asset_id = None
        rep.nearest_asset_distance_m = None
        rep.asset_link_status = "NO_ASSET_FOUND"
        rep.asset_link_reason = f"Manually unlinked from asset {old_asset}."
        rep.linked_by = "Municipal Engineer"
        rep.linked_at = datetime.utcnow()
        db.commit()
        db.refresh(rep)

        _log_event(
            report_id=rep.id,
            event_type="ASSET_UNLINKED",
            old_status=rep.status,
            new_status=rep.status,
            description=f"Municipal Engineer unlinked report from asset {old_asset}.",
            db=db
        )
        return _format_report_dict(rep)

    target_asset = db.query(Asset).filter(Asset.asset_id == target_asset_id).first()
    if not target_asset:
        raise HTTPException(status_code=404, detail=f"Target asset '{target_asset_id}' not found")

    from backend.app.services.citizen_service import haversine_distance_meters
    dist = haversine_distance_meters(rep.latitude, rep.longitude, target_asset.latitude, target_asset.longitude)

    old_asset = rep.nearest_asset_id
    rep.nearest_asset_id = target_asset.asset_id
    rep.nearest_asset_distance_m = dist
    rep.asset_link_status = "MANUALLY_LINKED"
    rep.asset_link_confidence = 1.0
    rep.asset_link_reason = f"Confirmed and manually linked to {target_asset.name} ({target_asset.asset_id}) by Municipal Engineer."
    rep.linked_by = "Municipal Engineer"
    rep.linked_at = datetime.utcnow()

    db.commit()
    db.refresh(rep)

    _log_event(
        report_id=rep.id,
        event_type="ASSET_MANUALLY_LINKED",
        old_status=rep.status,
        new_status=rep.status,
        description=f"Manually linked to asset {target_asset.asset_id} ({target_asset.name}) at distance ~{dist:.0f}m. {action_notes}",
        db=db
    )

    return _format_report_dict(rep)

@router.post("/{report_id}/validate", response_model=CitizenReportResponse)
def validate_report(
    report_id: str,
    payload: ValidateRequest,
    db: Session = Depends(get_db)
):
    """Confirm validation of a citizen report and award +50 points."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")

    old_status = rep.status
    if not is_valid_status_transition(old_status, "VALIDATED"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from '{old_status}' to 'VALIDATED'. Allowed: {VALID_STATUS_TRANSITIONS.get(old_status, [])}"
        )

    # Re-run screening to refresh factors
    screening = validate_citizen_report(
        category=rep.category,
        description=rep.description,
        photo_url=rep.photo_url,
        latitude=rep.latitude,
        longitude=rep.longitude,
        severity=rep.severity,
        db=db,
        exclude_report_id=rep.id
    )

    rep.status = "VALIDATED"
    rep.validation_score = screening["validation_score"]
    rep.validation_status = screening["validation_status"]
    rep.validation_factors = json.dumps(screening["factors"])
    if payload.action_notes:
        rep.action_notes = payload.action_notes

    db.commit()
    db.refresh(rep)

    _log_event(
        report_id=rep.id,
        event_type="VALIDATED",
        old_status=old_status,
        new_status="VALIDATED",
        description=payload.action_notes or f"Municipal Engineer verified screening (Score: {rep.validation_score}/100 - {rep.validation_status}).",
        db=db
    )

    if payload.award_points and rep.user_id:
        award_citizen_points(rep.user_id, 50, f"Report {rep.report_id} validated by municipal command", rep.id, db)

    return _format_report_dict(rep)

@router.post("/{report_id}/prioritize", response_model=CitizenReportResponse)
def prioritize_report(
    report_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    """Prioritize a validated report for municipal field dispatch."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")

    old_status = rep.status
    if not is_valid_status_transition(old_status, "PRIORITIZED"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from '{old_status}' to 'PRIORITIZED'. Allowed: {VALID_STATUS_TRANSITIONS.get(old_status, [])}"
        )

    prio = payload.get("priority", "HIGH").upper()
    action_notes = payload.get("action_notes", f"Prioritized at tier {prio} for municipal maintenance dispatch.")

    rep.status = "PRIORITIZED"
    rep.priority = prio
    if action_notes:
        rep.action_notes = action_notes

    db.commit()
    db.refresh(rep)

    _log_event(
        report_id=rep.id,
        event_type="PRIORITIZED",
        old_status=old_status,
        new_status="PRIORITIZED",
        description=action_notes,
        db=db
    )

    return _format_report_dict(rep)

@router.post("/{report_id}/duplicate", response_model=CitizenReportResponse)
def mark_report_duplicate(
    report_id: str,
    payload: DuplicateRequest,
    db: Session = Depends(get_db)
):
    """Mark report as duplicate linked to an existing report ID."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")

    old_status = rep.status
    rep.status = "DUPLICATE"
    rep.duplicate_of_id = payload.duplicate_of_id
    rep.action_notes = payload.action_notes

    db.commit()
    db.refresh(rep)

    _log_event(
        report_id=rep.id,
        event_type="DUPLICATE_LINKED",
        old_status=old_status,
        new_status="DUPLICATE",
        description=f"Marked duplicate of active report {payload.duplicate_of_id}. {payload.action_notes}",
        db=db
    )

    return _format_report_dict(rep)

@router.post("/{report_id}/reject", response_model=CitizenReportResponse)
def reject_report(
    report_id: str,
    payload: RejectRequest,
    db: Session = Depends(get_db)
):
    """Reject a citizen report with structured reason."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")

    old_status = rep.status
    rep.status = "REJECTED"
    rep.action_notes = payload.action_notes or payload.reason

    db.commit()
    db.refresh(rep)

    _log_event(
        report_id=rep.id,
        event_type="REJECTED",
        old_status=old_status,
        new_status="REJECTED",
        description=f"Report rejected: {payload.reason}",
        db=db
    )

    return _format_report_dict(rep)

@router.post("/{report_id}/assign", response_model=CitizenReportResponse)
def assign_report_workflow(
    report_id: str,
    payload: AssignWorkflowRequest,
    db: Session = Depends(get_db)
):
    """Assign report to municipal department & engineer with target date."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")

    old_status = rep.status
    if not is_valid_status_transition(old_status, "ASSIGNED"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from '{old_status}' to 'ASSIGNED'. Allowed: {VALID_STATUS_TRANSITIONS.get(old_status, [])}"
        )

    rep.status = "ASSIGNED"
    rep.assigned_department = payload.department
    rep.assigned_engineer = payload.engineer
    rep.assigned_to = f"{payload.department} - {payload.engineer}" if payload.engineer else payload.department
    if payload.priority:
        rep.priority = payload.priority.upper()
    if payload.target_date:
        rep.target_date = payload.target_date
    if payload.action_notes:
        rep.action_notes = payload.action_notes

    db.commit()
    db.refresh(rep)

    _log_event(
        report_id=rep.id,
        event_type="ASSIGNED",
        old_status=old_status,
        new_status="ASSIGNED",
        description=f"Assigned to {rep.assigned_to}. Priority: {rep.priority}. Target: {rep.target_date or 'Immediate'}.",
        db=db
    )

    if rep.user_id:
        award_citizen_points(rep.user_id, 100, f"Work authorized and assigned for {rep.report_id}", rep.id, db)

    return _format_report_dict(rep)

@router.post("/{report_id}/start-work", response_model=CitizenReportResponse)
def start_work_on_report(
    report_id: str,
    payload: StartWorkRequest,
    db: Session = Depends(get_db)
):
    """Mark work started on-site by repair crew."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")

    old_status = rep.status
    if not is_valid_status_transition(old_status, "IN_PROGRESS"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from '{old_status}' to 'IN_PROGRESS'. Allowed: {VALID_STATUS_TRANSITIONS.get(old_status, [])}"
        )

    rep.status = "IN_PROGRESS"
    if payload.action_notes:
        rep.action_notes = payload.action_notes

    db.commit()
    db.refresh(rep)

    _log_event(
        report_id=rep.id,
        event_type="WORK_STARTED",
        old_status=old_status,
        new_status="IN_PROGRESS",
        description=payload.action_notes or "Field repair crew deployed and active on site.",
        db=db
    )

    return _format_report_dict(rep)

@router.post("/{report_id}/resolve", response_model=CitizenReportResponse)
def resolve_report(
    report_id: str,
    payload: ResolveRequest,
    db: Session = Depends(get_db)
):
    """Mark issue resolved with completion description and award +250 points."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")

    old_status = rep.status
    if not is_valid_status_transition(old_status, "RESOLVED"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from '{old_status}' to 'RESOLVED'. Allowed: {VALID_STATUS_TRANSITIONS.get(old_status, [])}"
        )

    rep.status = "RESOLVED"
    rep.resolution_description = payload.resolution_description
    rep.resolution_photo = payload.resolution_photo
    rep.resolved_at = datetime.utcnow()
    if payload.action_notes:
        rep.action_notes = payload.action_notes

    db.commit()
    db.refresh(rep)

    _log_event(
        report_id=rep.id,
        event_type="RESOLVED",
        old_status=old_status,
        new_status="RESOLVED",
        description=f"Issue resolved: {payload.resolution_description}",
        db=db
    )

    if payload.award_points and rep.user_id:
        award_citizen_points(rep.user_id, 250, f"Civic report {rep.report_id} successfully resolved", rep.id, db)

    return _format_report_dict(rep)

@router.patch("/{report_id}/status", response_model=CitizenReportResponse)
@router.post("/{report_id}/status", response_model=CitizenReportResponse)
def update_report_status(
    report_id: str,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update report status enforcing server-side lifecycle state machine rules."""
    rep = _find_report(report_id, db)
    if not rep:
        raise HTTPException(status_code=404, detail="Civic report not found")

    old_status = rep.status
    new_status = payload.status.upper()

    if not is_valid_status_transition(old_status, new_status):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition from '{old_status}' to '{new_status}'. Allowed transitions: {VALID_STATUS_TRANSITIONS.get(old_status, [])}"
        )

    rep.status = new_status
    if payload.action_notes:
        rep.action_notes = payload.action_notes

    db.commit()
    db.refresh(rep)

    _log_event(
        report_id=rep.id,
        event_type=new_status,
        old_status=old_status,
        new_status=new_status,
        description=payload.action_notes or f"Status transitioned from {old_status} to {new_status}",
        db=db
    )

    if payload.award_points and rep.user_id:
        if old_status != "VALIDATED" and new_status == "VALIDATED":
            award_citizen_points(rep.user_id, 50, f"Report {rep.report_id} validated by municipal command", rep.id, db)
        elif old_status not in ["ASSIGNED", "IN_PROGRESS", "RESOLVED"] and new_status in ["ASSIGNED", "IN_PROGRESS"]:
            award_citizen_points(rep.user_id, 100, f"Work authorized for {rep.report_id}", rep.id, db)
        elif old_status != "RESOLVED" and new_status == "RESOLVED":
            award_citizen_points(rep.user_id, 250, f"Civic report {rep.report_id} successfully resolved", rep.id, db)

    return _format_report_dict(rep)
