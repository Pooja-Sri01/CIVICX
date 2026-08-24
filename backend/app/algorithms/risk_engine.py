"""
CIVICX Deterministic Risk Engine
Calculates normalized multi-criteria infrastructure risk score (0-100),
classifies into LOW, MEDIUM, HIGH, CRITICAL, and outputs explainable factor impacts.
"""

from typing import Dict, Any, List, Union

class RiskEngine:
    # Deterministic Multi-Criteria Decision Analysis (MCDA) Weights (Total = 1.00 / 100%)
    WEIGHT_CONDITION = 0.30                     # 30% Structural Condition Deficit
    WEIGHT_DAMAGE_SEVERITY = 0.25              # 25% Damage Severity
    WEIGHT_USAGE = 0.15                        # 15% Traffic Load / Urban Transit Density
    WEIGHT_CRITICALITY = 0.15                  # 15% Route Criticality
    WEIGHT_ENVIRONMENTAL_EXPOSURE = 0.10       # 10% Monsoon / Hydrological Hydro-Stress
    WEIGHT_HISTORICAL_DETERIORATION = 0.05     # 5% Historical Deterioration Trend Signal

    CRITICALITY_MAP = {
        "LOW": 30.0,
        "MEDIUM": 60.0,
        "HIGH": 85.0,
        "CRITICAL": 98.0
    }

    @classmethod
    def normalize_criticality(cls, criticality: Union[str, int, float]) -> float:
        if isinstance(criticality, str):
            return cls.CRITICALITY_MAP.get(criticality.upper(), 50.0)
        return float(max(0, min(100, criticality)))

    @classmethod
    def calculate_risk(
        cls,
        condition_score: int,
        damage_severity: int,
        usage_score: int,
        criticality: Union[str, int, float],
        historical_deterioration: float = 15.0,
        environmental_exposure: float = 50.0
    ) -> Dict[str, Any]:
        """
        Calculate deterministic risk score & explainability breakdown.
        """
        c = max(0, min(100, condition_score))
        d = max(0, min(100, damage_severity))
        u = max(0, min(100, usage_score))
        k = cls.normalize_criticality(criticality)
        h = max(0, min(100, float(historical_deterioration)))
        e = max(0, min(100, float(environmental_exposure)))

        # Condition deficit: Lower condition score represents higher physical deterioration
        condition_deficit = 100 - c

        c_contrib = cls.WEIGHT_CONDITION * condition_deficit
        d_contrib = cls.WEIGHT_DAMAGE_SEVERITY * d
        k_contrib = cls.WEIGHT_CRITICALITY * k
        u_contrib = cls.WEIGHT_USAGE * u
        h_contrib = cls.WEIGHT_HISTORICAL_DETERIORATION * h
        e_contrib = cls.WEIGHT_ENVIRONMENTAL_EXPOSURE * e

        total_raw = c_contrib + d_contrib + k_contrib + u_contrib + h_contrib + e_contrib
        risk_score = int(round(max(1, min(99, total_raw))))

        # Standard 4-Tier Municipal Classification
        if risk_score >= 76:
            risk_level = "CRITICAL"
        elif risk_score >= 51:
            risk_level = "HIGH"
        elif risk_score >= 26:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        def get_impact(contrib: float, max_weight: float) -> str:
            pct = contrib / (max_weight * 100.0)
            if pct >= 0.75:
                return "Critical"
            elif pct >= 0.50:
                return "High"
            elif pct >= 0.25:
                return "Moderate"
            return "Low"

        factors = [
            {
                "factor": "Condition Deficit",
                "factor_value": condition_deficit,
                "weight_pct": 30,
                "impact": get_impact(c_contrib, cls.WEIGHT_CONDITION),
                "score_contribution": round(c_contrib, 1),
                "description": f"Condition score evaluated at {c}/100 (Deficit: {condition_deficit}/100)."
            },
            {
                "factor": "Damage Severity",
                "factor_value": d,
                "weight_pct": 25,
                "impact": get_impact(d_contrib, cls.WEIGHT_DAMAGE_SEVERITY),
                "score_contribution": round(d_contrib, 1),
                "description": f"Physical damage severity indexed at {d}/100."
            },
            {
                "factor": "Traffic Load",
                "factor_value": u,
                "weight_pct": 15,
                "impact": get_impact(u_contrib, cls.WEIGHT_USAGE),
                "score_contribution": round(u_contrib, 1),
                "description": f"Traffic exposure index at {u}/100."
            },
            {
                "factor": "Route Criticality",
                "factor_value": round(k, 1),
                "weight_pct": 15,
                "impact": get_impact(k_contrib, cls.WEIGHT_CRITICALITY),
                "score_contribution": round(k_contrib, 1),
                "description": f"Strategic route importance ranked as {criticality} ({round(k, 1)}/100)."
            },
            {
                "factor": "Hydro/Monsoon Stress",
                "factor_value": round(e, 1),
                "weight_pct": 10,
                "impact": get_impact(e_contrib, cls.WEIGHT_ENVIRONMENTAL_EXPOSURE),
                "score_contribution": round(e_contrib, 1),
                "description": f"Hydrological and weather monsoon stress factor at {round(e, 1)}/100."
            },
            {
                "factor": "Deterioration Signal",
                "factor_value": round(h, 1),
                "weight_pct": 5,
                "impact": get_impact(h_contrib, cls.WEIGHT_HISTORICAL_DETERIORATION),
                "score_contribution": round(h_contrib, 1),
                "description": f"Normalized historical deterioration signal indexed at {round(h, 1)}/100."
            }

        ]

        explanation = (
            f"Asset classified as {risk_level} risk (score: {risk_score}/100). "
            f"Primary risk drivers: {'Condition Deficit' if c_contrib >= d_contrib else 'Damage Severity'} "
            f"and {'Route Criticality' if k_contrib >= u_contrib else 'Traffic Loading'}."
        )

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "factors": factors,
            "explanation": explanation
        }

