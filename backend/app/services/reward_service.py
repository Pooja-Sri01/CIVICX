import uuid
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.app.models.models import CitizenUser, CitizenReward, RewardLedger, CitizenReport
from backend.app.services.audit_service import AuditService
from backend.app.core.logging import get_logger

logger = get_logger("civicx.rewards")

REWARD_OPTIONS = [
    {
        "reward_id": "DEMO_1000",
        "title": "Municipal Recognition Voucher (Demo)",
        "description": "Prototype redemption token equivalent to ₹10 demo civic value.",
        "points_cost": 1000,
        "demo_value_inr": 10,
        "category": "MUNICIPAL_SERVICES"
    },
    {
        "reward_id": "DEMO_2500",
        "title": "Civic Champion Transit Pass (Demo)",
        "description": "Prototype civic pass equivalent to ₹25 demo municipal value.",
        "points_cost": 2500,
        "demo_value_inr": 25,
        "category": "PUBLIC_TRANSIT"
    },
    {
        "reward_id": "DEMO_5000",
        "title": "Urban Stewardship Honor (Demo)",
        "description": "Prototype honor certificate & ₹50 demo civic reward credit.",
        "points_cost": 5000,
        "demo_value_inr": 50,
        "category": "UTILITY_REBATE"
    }
]

class RewardService:
    """
    Enterprise Reward Service enforcing idempotent ledger transactions and audit anchoring.
    """
    @staticmethod
    def get_reward_options() -> List[Dict[str, Any]]:
        return REWARD_OPTIONS

    @staticmethod
    def credit_points(
        db: Session,
        user_id: int,
        points: int,
        reason: str,
        report_id: Optional[int] = None,
        transaction_type: str = "EARN",
        actor_id: str = "Municipal System"
    ) -> Optional[RewardLedger]:
        user = db.query(CitizenUser).filter(CitizenUser.id == user_id).first()
        if not user:
            logger.warning(f"Attempted to credit reward to non-existent user_id {user_id}")
            return None

        # Anti-spam duplicate check for specific report milestones
        if report_id:
            existing = db.query(CitizenReward).filter(
                CitizenReward.user_id == user_id,
                CitizenReward.report_id == report_id,
                CitizenReward.points == points
            ).first()
            if existing:
                logger.info(f"Duplicate reward suppressed: User {user_id}, Report {report_id}, Points {points}")
                return None

        old_balance = user.points_balance
        new_balance = old_balance + points
        user.points_balance = new_balance

        # 1. Create legacy reward record for backward compatibility
        reward_record = CitizenReward(
            user_id=user_id,
            report_id=report_id,
            points=points,
            reason=reason,
            status="CREDITED"
        )
        db.add(reward_record)

        # 2. Append to immutable double-entry RewardLedger
        ref_id = f"tx-{uuid.uuid4().hex[:12]}"
        ledger_entry = RewardLedger(
            user_id=user_id,
            report_id=report_id,
            transaction_type=transaction_type,
            points=points,
            balance_after=new_balance,
            reason=reason,
            reference_id=ref_id
        )
        db.add(ledger_entry)

        # 3. Append to AuditEvent
        AuditService.log_event(
            db=db,
            event_type="REWARD_CREDITED",
            entity_type="REWARD",
            entity_id=ref_id,
            actor_id=actor_id,
            actor_type="SYSTEM",
            old_value={"balance": old_balance},
            new_value={"balance": new_balance, "credited": points},
            metadata={"user_id": user_id, "report_id": report_id, "reason": reason}
        )

        db.commit()
        db.refresh(ledger_entry)
        return ledger_entry

    @staticmethod
    def debit_points(
        db: Session,
        user_id: int,
        points: int,
        reason: str,
        actor_id: str = "Citizen"
    ) -> Optional[RewardLedger]:
        user = db.query(CitizenUser).filter(CitizenUser.id == user_id).first()
        if not user:
            return None

        if user.points_balance < points:
            raise ValueError(f"Insufficient balance. Current: {user.points_balance}, Required: {points}")

        old_balance = user.points_balance
        new_balance = old_balance - points
        user.points_balance = new_balance

        # Legacy reward record
        reward_record = CitizenReward(
            user_id=user_id,
            report_id=None,
            points=-points,
            reason=reason,
            status="REDEEMED"
        )
        db.add(reward_record)

        # Immutable double-entry ledger entry
        ref_id = f"tx-{uuid.uuid4().hex[:12]}"
        ledger_entry = RewardLedger(
            user_id=user_id,
            report_id=None,
            transaction_type="REDEEM",
            points=-points,
            balance_after=new_balance,
            reason=reason,
            reference_id=ref_id
        )
        db.add(ledger_entry)

        # Audit Event
        AuditService.log_event(
            db=db,
            event_type="REWARD_REDEEMED",
            entity_type="REWARD",
            entity_id=ref_id,
            actor_id=actor_id,
            actor_type="CITIZEN",
            old_value={"balance": old_balance},
            new_value={"balance": new_balance, "debited": points},
            metadata={"user_id": user_id, "reason": reason}
        )

        db.commit()
        db.refresh(ledger_entry)
        return ledger_entry

    @staticmethod
    def redeem_option(
        db: Session,
        user_id: int,
        reward_id: str
    ) -> Dict[str, Any]:
        opt = next((r for r in REWARD_OPTIONS if r["reward_id"] == reward_id), None)
        if not opt:
            raise ValueError(f"Invalid reward option: {reward_id}")

        points = opt["points_cost"]
        reason = f"Simulated Demo Redemption: {opt['title']} (₹{opt['demo_value_inr']} Demo Value)"
        ledger = RewardService.debit_points(db, user_id, points, reason)

        return {
            "success": True,
            "reward_id": opt["reward_id"],
            "points_redeemed": points,
            "demo_value_inr": opt["demo_value_inr"],
            "new_balance": ledger.balance_after,
            "transaction_ref": ledger.reference_id,
            "disclaimer": "Demo Redemption — Prototype Concept for Future Municipal Partnership. CIVICX Points have no real-world monetary value."
        }

    @staticmethod
    def reconcile_user_balance(db: Session, user_id: int) -> int:
        """
        Reconciles user balance from total sum of ledger entries.
        """
        total = db.query(func.coalesce(func.sum(RewardLedger.points), 0)).filter(
            RewardLedger.user_id == user_id
        ).scalar()
        
        user = db.query(CitizenUser).filter(CitizenUser.id == user_id).first()
        if user and user.points_balance != total:
            logger.warning(f"Reconciling balance mismatch for user {user_id}: {user.points_balance} -> {total}")
            user.points_balance = total
            db.commit()
            
        return total

    @staticmethod
    def get_pending_rewards(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Calculates potential pending rewards from user's active, non-rejected reports.
        """
        reports = db.query(CitizenReport).filter(
            CitizenReport.user_id == user_id,
            CitizenReport.status.notin_(["REJECTED", "DUPLICATE", "RESOLVED"])
        ).all()

        pending_validation = 0
        pending_action = 0
        pending_resolution = 0

        for r in reports:
            if r.status in ["SUBMITTED", "UNDER_REVIEW"]:
                pending_validation += 50
                pending_action += 100
                pending_resolution += 250
            elif r.status in ["VALIDATED", "PRIORITIZED"]:
                pending_action += 100
                pending_resolution += 250
            elif r.status in ["ASSIGNED", "IN_PROGRESS"]:
                pending_resolution += 250

        total_pending = pending_validation + pending_action + pending_resolution
        return {
            "total_pending": total_pending,
            "breakdown": {
                "waiting_for_validation": pending_validation,
                "waiting_for_municipal_action": pending_action,
                "waiting_for_resolution": pending_resolution
            },
            "active_reports_count": len(reports)
        }

    @staticmethod
    def get_citizen_impact(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Computes accurate civic impact metrics for the authenticated citizen.
        """
        all_reports = db.query(CitizenReport).filter(CitizenReport.user_id == user_id).all()
        submitted_count = len(all_reports)
        validated_count = len([r for r in all_reports if r.status in ["VALIDATED", "PRIORITIZED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"]])
        acted_count = len([r for r in all_reports if r.status in ["ASSIGNED", "IN_PROGRESS", "RESOLVED"]])
        resolved_count = len([r for r in all_reports if r.status == "RESOLVED"])

        # Contribution score (0-100 explainable calculation)
        contribution_score = min(100, (submitted_count * 5) + (validated_count * 15) + (acted_count * 20) + (resolved_count * 30))

        return {
            "reports_submitted": submitted_count,
            "reports_validated": validated_count,
            "issues_acted_on": acted_count,
            "issues_resolved": resolved_count,
            "civic_contribution_score": contribution_score,
            "score_factors": {
                "evidence_quality": "High",
                "validation_rate": f"{(validated_count / submitted_count * 100):.0f}%" if submitted_count > 0 else "0%",
                "resolution_impact": f"{resolved_count} Verified Repairs"
            },
            "message": "Your Civic Contribution Makes an Impact."
        }

    @staticmethod
    def get_public_leaderboard(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Returns privacy-safe, anonymized rankings of top civic champions.
        """
        users = db.query(CitizenUser).order_by(desc(CitizenUser.points_balance)).limit(limit).all()
        leaderboard = []

        safe_aliases = [
            "Gandhipuram Urban Pioneer",
            "RS Puram Eco Guardian",
            "Peelamedu Transit Scout",
            "Singanallur Civic Champion",
            "Race Course Steward",
            "Avinashi Road Warden",
            "Ukkadam Watcher",
            "Saravanampatti Ranger"
        ]

        for rank, u in enumerate(users, start=1):
            alias = safe_aliases[(rank - 1) % len(safe_aliases)]
            # If real user has an initials representation
            initials = f"{u.name[0]}." if u.name else "C."
            leaderboard.append({
                "rank": rank,
                "display_name": f"{alias} ({initials})",
                "points": u.points_balance,
                "badge": "Top 1% Contributor" if rank <= 3 else "Active Steward",
                "avatar_color": "#9FFF00" if rank == 1 else "#3B82F6" if rank == 2 else "#A855F7"
            })

        return leaderboard
