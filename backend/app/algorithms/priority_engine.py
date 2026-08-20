"""
CIVICX Explainable Priority Ranking Engine
Evaluates dynamic priority scores considering risk, criticality, usage, damage severity, and cost efficiency.
Generates ranking with human-understandable natural language justifications.
"""

from typing import List, Dict, Any, Union
from backend.app.algorithms.risk_engine import RiskEngine

class PriorityEngine:
    @staticmethod
    def calculate_priority_score(
        risk_score: int,
        criticality: Union[str, int, float],
        usage_score: int,
        damage_severity: int,
        estimated_repair_cost: float
    ) -> float:
        """
        Calculates priority score where high risk, critical role, heavy usage,
        and high cost-efficiency maximize ranking urgency.
        """
        r = float(risk_score)
        k = RiskEngine.normalize_criticality(criticality)
        u = float(usage_score)
        d = float(damage_severity)
        c = max(100000.0, float(estimated_repair_cost))

        # Composite numerator: Urgency & Impact
        urgency_factor = (r * 1.5) + (k * 1.3) + (u * 0.8) + (d * 0.4)
        
        # Cost factor: Diminishing returns penalty to favor high-yield interventions
        cost_scale = c ** 0.12

        priority_score = urgency_factor / cost_scale
        return round(priority_score, 3)

    @classmethod
    def generate_reason(
        cls,
        risk_score: int,
        risk_level: str,
        criticality: str,
        usage_score: int,
        estimated_repair_cost: float,
        rank: int
    ) -> str:
        cost_lakhs = round(estimated_repair_cost / 100000.0, 1)
        
        if rank == 1:
            return (
                f"Ranked #1: Immediate {risk_level.lower()} hazard on a {criticality.lower()} priority corridor. "
                f"Carries high public usage with maximum preventative intervention ROI."
            )
        elif risk_score >= 75:
            return (
                f"High risk ({risk_score}/100) combined with {criticality.lower()} network role and "
                f"urgent cost-effective intervention window (₹{cost_lakhs}L)."
            )
        elif usage_score >= 75:
            return (
                f"Heavy traffic corridor ({usage_score}/100 usage density) requiring proactive stabilization "
                f"to prevent severe commuter gridlock."
            )
        elif risk_score >= 50:
            return (
                f"Moderate-to-high deterioration with favourable cost efficiency (₹{cost_lakhs}L) "
                f"preventing severe compounding subgrade damage."
            )
        else:
            return (
                f"Asset in stable state; prioritized for routine monitoring and preventative sealing."
            )

    @classmethod
    def rank_assets(cls, asset_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Ranks a list of asset dicts or objects, appending priority_score, priority_rank, and reason.
        """
        scored_list = []
        for a in asset_records:
            item = dict(a)
            risk = item.get("risk_score", 50)
            crit = item.get("criticality", "MEDIUM")
            usage = item.get("usage_score", 50)
            severity = item.get("damage_severity", 50)
            cost = item.get("estimated_repair_cost", 500000.0)

            p_score = cls.calculate_priority_score(
                risk_score=risk,
                criticality=crit,
                usage_score=usage,
                damage_severity=severity,
                estimated_repair_cost=cost
            )
            item["priority_score"] = p_score
            scored_list.append(item)

        # Sort descending by priority score
        scored_list.sort(key=lambda x: x["priority_score"], reverse=True)

        # Assign ranks and reasons
        for rank, item in enumerate(scored_list, 1):
            item["priority_rank"] = rank
            item["priority_reason"] = cls.generate_reason(
                risk_score=item.get("risk_score", 50),
                risk_level=item.get("risk_level", "MEDIUM"),
                criticality=str(item.get("criticality", "MEDIUM")),
                usage_score=item.get("usage_score", 50),
                estimated_repair_cost=item.get("estimated_repair_cost", 500000.0),
                rank=rank
            )

        return scored_list
