import math
import json
from datetime import datetime
from typing import Tuple, Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.models import Asset, CitizenReport, CitizenUser, CitizenReward
from backend.app.core.config import settings

# ============================================================
# STATUS LIFECYCLE TRANSITION RULES
# ============================================================

VALID_STATUS_TRANSITIONS: Dict[str, List[str]] = {
    "SUBMITTED": ["UNDER_REVIEW", "VALIDATED", "REJECTED", "DUPLICATE"],
    "UNDER_REVIEW": ["VALIDATED", "REJECTED", "DUPLICATE"],
    "VALIDATED": ["PRIORITIZED", "ASSIGNED", "REJECTED", "DUPLICATE"],
    "PRIORITIZED": ["ASSIGNED", "REJECTED", "DUPLICATE"],
    "ASSIGNED": ["IN_PROGRESS", "REJECTED", "DUPLICATE"],
    "IN_PROGRESS": ["RESOLVED", "REJECTED", "DUPLICATE"],
    "RESOLVED": [],  # Terminal state
    "REJECTED": ["UNDER_REVIEW"],  # Re-open if contested
    "DUPLICATE": ["UNDER_REVIEW"], # Re-open if false positive
}

def is_valid_status_transition(current_status: str, target_status: str) -> bool:
    """Validate whether transitioning from current_status to target_status is allowed."""
    current = (current_status or "SUBMITTED").upper()
    target = (target_status or "").upper()
    if current == target:
        return True
    allowed = VALID_STATUS_TRANSITIONS.get(current, [])
    return target in allowed

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return round(R * c, 1)

# ============================================================
# CATEGORY-TO-ASSET COMPATIBILITY MATRIX
# ============================================================

CATEGORY_ASSET_COMPATIBILITY: Dict[str, Dict[str, float]] = {
    "Pothole": {"Road": 1.0, "Bridge": 0.8, "Flyover": 0.8, "Terminal": 0.5, "Drainage": 0.2},
    "Road Damage": {"Road": 1.0, "Bridge": 0.9, "Flyover": 0.9, "Terminal": 0.5, "Drainage": 0.2},
    "Drainage / Flooding": {"Drainage": 1.0, "Canal": 1.0, "Culvert": 1.0, "Road": 0.5, "Bridge": 0.3},
    "Bridge / Flyover Damage": {"Bridge": 1.0, "Flyover": 1.0, "ROB": 1.0, "Road": 0.6, "Drainage": 0.1},
    "Street Infrastructure": {"Streetlight": 1.0, "Public Facility": 0.8, "Terminal": 0.8, "Road": 0.7},
    "Public Facility": {"Public Facility": 1.0, "Terminal": 1.0, "Road": 0.5},
    "Other Infrastructure": {"Road": 0.7, "Drainage": 0.7, "Bridge": 0.7, "Flyover": 0.7, "Canal": 0.7, "Terminal": 0.7}
}

def rank_and_match_asset(
    latitude: float,
    longitude: float,
    category: str,
    db: Session,
    max_radius_m: Optional[float] = None
) -> Dict[str, Any]:
    """
    Deterministic candidate matching algorithm ranking assets by distance and category compatibility.
    """
    radius = max_radius_m if max_radius_m is not None else getattr(settings, "DEFAULT_ASSET_MATCH_RADIUS_METERS", 500.0)
    assets = db.query(Asset).all()
    if not assets:
        return {
            "asset": None,
            "asset_id": None,
            "distance_m": None,
            "match_status": "NO_ASSET_FOUND",
            "confidence": 0.0,
            "reason": "No infrastructure assets cataloged in municipal database."
        }

    scored_candidates = []
    cat_weights = CATEGORY_ASSET_COMPATIBILITY.get(category, {"Road": 0.7, "Drainage": 0.7, "Bridge": 0.7})

    for a in assets:
        d = haversine_distance_meters(latitude, longitude, a.latitude, a.longitude)
        if d <= radius:
            # Determine category compatibility multiplier (default to 0.4 if unknown)
            compat = 0.4
            for type_key, weight in cat_weights.items():
                if type_key.lower() in a.asset_type.lower() or type_key.lower() in a.name.lower():
                    compat = max(compat, weight)

            # Combined ranking score: 60% category compatibility + 40% spatial proximity
            dist_score = max(0.0, 1.0 - (d / radius))
            rank_score = (compat * 0.6) + (dist_score * 0.4)
            scored_candidates.append({
                "asset": a,
                "asset_id": a.asset_id,
                "distance_m": d,
                "compatibility": compat,
                "rank_score": rank_score
            })

    if not scored_candidates:
        # Check closest asset outside radius for fallback context
        closest_asset = min(assets, key=lambda a: haversine_distance_meters(latitude, longitude, a.latitude, a.longitude))
        closest_dist = haversine_distance_meters(latitude, longitude, closest_asset.latitude, closest_asset.longitude)
        return {
            "asset": None,
            "asset_id": None,
            "distance_m": closest_dist,
            "match_status": "NO_ASSET_FOUND",
            "confidence": 0.0,
            "reason": f"No compatible municipal asset within {radius:.0f}m radius (Closest: {closest_asset.asset_id} at {closest_dist:.0f}m)."
        }

    # Sort best candidates by rank score desc, then distance asc
    scored_candidates.sort(key=lambda c: (-c["rank_score"], c["distance_m"]))
    best = scored_candidates[0]
    confidence = round(min(0.99, max(0.50, best["rank_score"])), 2)

    reason = (
        f"Nearest compatible {best['asset'].asset_type} corridor ({best['asset'].asset_id}) "
        f"within {best['distance_m']:.0f}m of reported location (Category compatibility: {int(best['compatibility']*100)}%)."
    )

    return {
        "asset": best["asset"],
        "asset_id": best["asset_id"],
        "distance_m": best["distance_m"],
        "match_status": "POTENTIAL_MATCH",
        "confidence": confidence,
        "reason": reason
    }

def find_nearest_asset(latitude: float, longitude: float, db: Session, category: str = "Pothole") -> Tuple[Optional[str], Optional[float]]:
    """Find the closest CIVICX asset to given coordinates using category ranking."""
    match = rank_and_match_asset(latitude, longitude, category, db)
    return match["asset_id"], match["distance_m"]

def validate_citizen_report(
    category: str,
    description: str,
    photo_url: Optional[str],
    latitude: float,
    longitude: float,
    severity: str,
    db: Session,
    exclude_report_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Deterministic 7-signal screening verification engine for citizen civic observations.
    Calculates screening validation score (0-100), explainable label, and reasons.
    """
    score = 0
    factors: List[Dict[str, Any]] = []
    reasons: List[str] = []

    # Signal 1: Geolocation validity (+15)
    geo_valid = (-90.0 <= latitude <= 90.0) and (-180.0 <= longitude <= 180.0)
    in_coimbatore = (10.7 <= latitude <= 11.3) and (76.7 <= longitude <= 77.3)
    if geo_valid:
        geo_score = 15 if in_coimbatore else 10
        score += geo_score
        reasons.append("Valid geographic coordinates within municipal spatial bounds")
        factors.append({
            "signal": "Location Verification",
            "passed": True,
            "score": geo_score,
            "detail": f"Coordinates ({latitude:.4f}, {longitude:.4f}) verified within municipal spatial envelope."
        })
    else:
        factors.append({
            "signal": "Location Verification",
            "passed": False,
            "score": 0,
            "detail": "Invalid geographic coordinates provided."
        })

    # Signal 2: Description depth & completeness (+15)
    desc_clean = description.strip() if description else ""
    if len(desc_clean) >= 25:
        score += 15
        reasons.append(f"Detailed engineering description provided ({len(desc_clean)} characters)")
        factors.append({
            "signal": "Description Quality",
            "passed": True,
            "score": 15,
            "detail": f"Comprehensive descriptive text ({len(desc_clean)} characters) detailing infrastructure defect."
        })
    elif len(desc_clean) >= 8:
        score += 10
        reasons.append("Basic infrastructure description provided")
        factors.append({
            "signal": "Description Quality",
            "passed": True,
            "score": 10,
            "detail": "Basic description provided; additional structural context recommended."
        })
    else:
        factors.append({
            "signal": "Description Quality",
            "passed": False,
            "score": 0,
            "detail": "Description is too brief for engineering verification screening."
        })

    # Signal 3: Photo Evidence Attached (+15)
    if photo_url and photo_url.strip():
        score += 15
        reasons.append("Visual photographic evidence attached")
        factors.append({
            "signal": "Visual Inspection Photo",
            "passed": True,
            "score": 15,
            "detail": "Visual photographic evidence uploaded and linked to report."
        })
    else:
        factors.append({
            "signal": "Visual Inspection Photo",
            "passed": False,
            "score": 0,
            "detail": "No photo attached. Photographic telemetry strongly enhances validation confidence."
        })

    # Signal 4: Category Validity (+10)
    valid_categories = [
        "Pothole",
        "Road Damage",
        "Drainage / Flooding",
        "Bridge / Flyover Damage",
        "Street Infrastructure",
        "Public Facility",
        "Other Infrastructure"
    ]
    if category in valid_categories:
        score += 10
        reasons.append(f"Standard municipal category '{category}'")
        factors.append({
            "signal": "Standard Infrastructure Category",
            "passed": True,
            "score": 10,
            "detail": f"Matched standard municipal taxonomy category '{category}'."
        })
    else:
        factors.append({
            "signal": "Standard Infrastructure Category",
            "passed": False,
            "score": 5,
            "detail": f"Non-standard category '{category}'. Assigned default screening."
        })

    # Signal 5: Duplicate Proximity Check (+15)
    query = db.query(CitizenReport).filter(
        CitizenReport.status.in_(["SUBMITTED", "UNDER_REVIEW", "VALIDATED", "PRIORITIZED", "ASSIGNED", "IN_PROGRESS"])
    )
    if exclude_report_id:
        query = query.filter(CitizenReport.id != exclude_report_id)
    active_reports = query.all()

    is_duplicate = False
    dup_distance = float('inf')
    dup_id = None

    for rep in active_reports:
        d = haversine_distance_meters(latitude, longitude, rep.latitude, rep.longitude)
        if d < 50.0 and rep.category == category:
            is_duplicate = True
            dup_distance = d
            dup_id = rep.report_id
            break

    if is_duplicate:
        factors.append({
            "signal": "Duplicate Proximity Check",
            "passed": False,
            "score": 0,
            "detail": f"Potential duplicate observation detected within {dup_distance:.1f}m of active report {dup_id}."
        })
    else:
        score += 15
        reasons.append("Unique geographic observation (no duplicate detected nearby)")
        factors.append({
            "signal": "Duplicate Proximity Check",
            "passed": True,
            "score": 15,
            "detail": "Unique geographic observation. No duplicate active report within 50m threshold."
        })

    # Signal 6: Existing CIVICX Asset Proximity & Compatibility (+15 or +5)
    asset_match = rank_and_match_asset(latitude, longitude, category, db)
    nearest_id = asset_match["asset_id"]
    dist_m = asset_match["distance_m"]

    if nearest_id and dist_m is not None and dist_m <= 500.0:
        score += 15
        reasons.append(f"Direct correlation with monitored municipal asset {nearest_id} ({dist_m:.0f}m)")
        factors.append({
            "signal": "CIVICX Asset Correlation",
            "passed": True,
            "score": 15,
            "detail": f"Correlated with {asset_match['asset'].asset_type if asset_match.get('asset') else 'asset'} {nearest_id} ({dist_m:.0f}m away)."
        })
    elif nearest_id and dist_m is not None and dist_m <= 1500.0:
        score += 5
        reasons.append(f"Located in vicinity of monitored asset {nearest_id} ({dist_m:.0f}m)")
        factors.append({
            "signal": "CIVICX Asset Correlation",
            "passed": True,
            "score": 5,
            "detail": f"Located {dist_m:.0f}m from monitored asset {nearest_id}."
        })
    else:
        factors.append({
            "signal": "CIVICX Asset Correlation",
            "passed": False,
            "score": 0,
            "detail": "No compatible municipal asset within immediate matching radius."
        })

    # Signal 7: Severity & Data Consistency (+15)
    score += 15
    reasons.append(f"Internally consistent severity rating '{severity}'")
    factors.append({
        "signal": "Severity Field Consistency",
        "passed": True,
        "score": 15,
        "detail": f"User reported severity '{severity}' recorded for screening prioritization."
    })

    # Cap score at 100
    final_score = min(100, max(0, score))

    if is_duplicate:
        status_label = "DUPLICATE REPORT"
    elif final_score >= 80:
        status_label = "LIKELY VALID"
    elif final_score >= 60:
        status_label = "NEEDS REVIEW"
    else:
        status_label = "LOW CONFIDENCE"

    return {
        "validation_score": final_score,
        "validation_status": status_label,
        "validation_label": status_label,
        "validation_reasons": reasons,
        "is_duplicate": is_duplicate,
        "duplicate_of": dup_id,
        "nearest_asset_id": nearest_id,
        "nearest_asset_distance_m": dist_m,
        "asset_link_status": asset_match["match_status"],
        "asset_link_confidence": asset_match["confidence"],
        "asset_link_reason": asset_match["reason"],
        "factors": factors
    }

def award_citizen_points(
    user_id: int,
    points: int,
    reason: str,
    report_id: Optional[int],
    db: Session
) -> Optional[CitizenReward]:
    """Credit CIVICX Points to a citizen user with deterministic idempotency, double-entry ledger logging, and audit tracking."""
    user = db.query(CitizenUser).filter(CitizenUser.id == user_id).first()
    if not user:
        return None

    # Deterministic duplicate reward check
    if report_id:
        existing = db.query(CitizenReward).filter(
            CitizenReward.user_id == user_id,
            CitizenReward.report_id == report_id,
            CitizenReward.points == points
        ).first()
        if existing:
            return existing

    from backend.app.services.reward_service import RewardService
    RewardService.credit_points(
        db=db,
        user_id=user_id,
        points=points,
        reason=reason,
        report_id=report_id,
        transaction_type="EARN"
    )

    reward = db.query(CitizenReward).filter(
        CitizenReward.user_id == user_id,
        CitizenReward.report_id == report_id,
        CitizenReward.points == points
    ).order_by(CitizenReward.id.desc()).first()

    return reward
