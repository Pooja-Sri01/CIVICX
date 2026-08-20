"""
Deterministic Risk Engine for CivicX Platform
Calculates normalized multi-criteria risk index and explainable factor breakdown.
"""
from typing import Dict, Any, List

class RiskEngine:
    WEIGHT_CONDITION = 0.25
    WEIGHT_DAMAGE_SEVERITY = 0.25
    WEIGHT_CRITICALITY = 0.20
    WEIGHT_USAGE = 0.15
    WEIGHT_HISTORICAL_TREND = 0.10
    WEIGHT_ENVIRONMENTAL_EXPOSURE = 0.05

    @classmethod
    def calculate(
        cls,
        condition_score: int,
        damage_severity: int,
        criticality_score: int,
        usage_score: int,
        trend_score: int,
        exposure_score: int
    ) -> Dict[str, Any]:
        c = max(0, min(100, condition_score))
        d = max(0, min(100, damage_severity))
        k = max(0, min(100, criticality_score))
        u = max(0, min(100, usage_score))
        h = max(0, min(100, trend_score))
        e = max(0, min(100, exposure_score))

        c_contrib = cls.WEIGHT_CONDITION * (100 - c)
        d_contrib = cls.WEIGHT_DAMAGE_SEVERITY * d
        k_contrib = cls.WEIGHT_CRITICALITY * k
        u_contrib = cls.WEIGHT_USAGE * u
        h_contrib = cls.WEIGHT_HISTORICAL_TREND * h
        e_contrib = cls.WEIGHT_ENVIRONMENTAL_EXPOSURE * e

        total_score = round(c_contrib + d_contrib + k_contrib + u_contrib + h_contrib + e_contrib)
        risk_score = max(1, min(99, total_score))

        if risk_score >= 76:
            risk_level = "Critical"
        elif risk_score >= 51:
            risk_level = "High"
        elif risk_score >= 26:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        factors = [
            {"factor": "Structural Condition Deficit (100-C)", "weight": cls.WEIGHT_CONDITION, "contribution": round(c_contrib, 1)},
            {"factor": "Damage Severity Factor", "weight": cls.WEIGHT_DAMAGE_SEVERITY, "contribution": round(d_contrib, 1)},
            {"factor": "Network Criticality Multiplier", "weight": cls.WEIGHT_CRITICALITY, "contribution": round(k_contrib, 1)},
            {"factor": "Traffic Loading / Usage", "weight": cls.WEIGHT_USAGE, "contribution": round(u_contrib, 1)},
            {"factor": "Historical Deterioration Trend", "weight": cls.WEIGHT_HISTORICAL_TREND, "contribution": round(h_contrib, 1)},
            {"factor": "Environmental Hydrological Stress", "weight": cls.WEIGHT_ENVIRONMENTAL_EXPOSURE, "contribution": round(e_contrib, 1)},
        ]

        explanation = (
            f"Risk index {risk_score}/100 ({risk_level}). Primary driver is "
            f"{'structural condition deficit' if c_contrib > 15 else 'high damage severity and network criticality'} "
            f"combined with traffic exposure."
        )

        return {
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "factors": factors,
            "explanation": explanation
        }
