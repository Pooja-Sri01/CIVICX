"""
City Time Machine Simulation Engine for CivicX Platform
Projects asset deterioration and scenario outcomes across Today, +6 Months, and +12 Months horizons.
"""
from typing import Dict, Any

class SimulationEngine:
    @staticmethod
    def simulate(asset: Dict[str, Any]) -> Dict[str, Any]:
        curr_risk = asset.get("riskScore", 60)
        curr_cond = asset.get("conditionScore", 50)
        base_cost = asset.get("estimatedRepairCost", 1000000)

        # +6 Months Horizon
        six_mo_risk_inc = round(min(99 - curr_risk, (100 - curr_cond) * 0.18 + 7))
        six_mo_risk = min(98, curr_risk + six_mo_risk_inc)
        six_mo_cond = max(5, curr_cond - round(curr_cond * 0.28 + 6))
        six_mo_cost = round(base_cost * 1.52)

        # +12 Months Horizon
        twelve_mo_risk_inc = round(min(99 - curr_risk, six_mo_risk_inc * 1.8 + 10))
        twelve_mo_risk = min(99, curr_risk + twelve_mo_risk_inc)
        twelve_mo_cond = max(2, curr_cond - round(curr_cond * 0.55 + 14))
        twelve_mo_cost = round(base_cost * 2.45)

        return {
            "assetId": asset.get("assetId"),
            "asset": asset,
            "horizons": {
                "today": {
                    "horizon": "Today",
                    "label": "Current Status",
                    "risk": curr_risk,
                    "condition": curr_cond,
                    "cost": base_cost,
                    "stateDescription": "Active surface distress confirmed by latest physical audit and telemetry.",
                    "riskIncreasePct": 0.0,
                    "costIncreasePct": 0.0
                },
                "sixMonths": {
                    "horizon": "+6 Months",
                    "label": "Delay 6 Months (Untreated)",
                    "risk": six_mo_risk,
                    "condition": six_mo_cond,
                    "cost": six_mo_cost,
                    "stateDescription": "Water ingress propagates fatigue cracking into extensive potholes. Sub-base begins loosening.",
                    "riskIncreasePct": round(((six_mo_risk - curr_risk) / max(1, curr_risk)) * 100, 1),
                    "costIncreasePct": 52.0
                },
                "twelveMonths": {
                    "horizon": "+12 Months",
                    "label": "Delay 12 Months (Untreated)",
                    "risk": twelve_mo_risk,
                    "condition": twelve_mo_cond,
                    "cost": twelve_mo_cost,
                    "stateDescription": "Full structural foundation collapse. Requires complete full-depth reconstruction.",
                    "riskIncreasePct": round(((twelve_mo_risk - curr_risk) / max(1, curr_risk)) * 100, 1),
                    "costIncreasePct": 145.0
                }
            },
            "scenarios": {
                "repairNow": {
                    "name": "Repair Now (Preventative)",
                    "riskAfter": 12,
                    "immediateCost": base_cost,
                    "fiveYearTCO": round(base_cost * 1.15),
                    "recommendationScore": 96,
                    "rationale": f"Locks repair cost at ₹{round(base_cost / 100000, 1)}L, reducing risk score from {curr_risk} to 12.",
                    "isRecommended": True
                },
                "delaySixMonths": {
                    "name": "Delay 6 Months",
                    "riskAfter": 28,
                    "projectedCost": six_mo_cost,
                    "escalationPenalty": round(six_mo_cost - base_cost),
                    "rationale": f"Triggers a ₹{round((six_mo_cost - base_cost) / 100000, 1)}L (+52%) financial escalation penalty.",
                    "isRecommended": False
                },
                "partialPatch": {
                    "name": "Partial Patch / Cold Fill",
                    "riskAfter": 54,
                    "immediateCost": round(base_cost * 0.22),
                    "effectiveLifespanMonths": 4,
                    "rationale": "High recurrence rate (>78% failure in 4 months) with continued underlying subgrade decay.",
                    "isRecommended": False
                }
            },
            "recommendedOption": "Repair Now (Preventative)",
            "recommendationReason": f"CivicX recommends immediate repair because delaying intervention triggers a ₹{round((six_mo_cost - base_cost) / 100000, 1)}L escalation penalty."
        }
