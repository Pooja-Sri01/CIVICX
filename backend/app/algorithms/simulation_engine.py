"""
CIVICX City Time Machine Deterioration Simulator
Simulates future infrastructure states across time horizons (3, 6, 12 months)
for scenarios: REPAIR_NOW, DELAY, and PARTIAL_REPAIR.
"""

from typing import Dict, Any

class SimulationEngine:
    @classmethod
    def simulate_asset(
        cls,
        asset_id: str,
        current_risk: int,
        current_condition: int,
        base_repair_cost: float,
        deterioration_rate: float = 15.0
    ) -> Dict[str, Any]:
        """
        Runs comprehensive multi-horizon and multi-scenario deterioration simulation.
        """
        r0 = int(current_risk)
        c0 = int(current_condition)
        base_cost = float(base_repair_cost)
        rate = float(deterioration_rate)

        # 3-Month Projection (Untreated Delay)
        r_3m = min(98, r0 + round(max(3, (100 - c0) * 0.08 + (rate * 0.15))))
        c_3m = max(5, c0 - round(c0 * 0.12 + 3))
        cost_3m = round(base_cost * 1.22, 2)

        # 6-Month Projection (Untreated Delay)
        r_6m = min(98, r0 + round(max(6, (100 - c0) * 0.18 + (rate * 0.35))))
        c_6m = max(3, c0 - round(c0 * 0.28 + 6))
        cost_6m = round(base_cost * 1.52, 2)

        # 12-Month Projection (Untreated Delay)
        r_12m = min(99, r0 + round(max(12, (100 - c0) * 0.36 + (rate * 0.70))))
        c_12m = max(1, c0 - round(c0 * 0.55 + 14))
        cost_12m = round(base_cost * 2.45, 2)

        horizons = {
            "3_months": {
                "horizon": "3 Months",
                "projected_risk": r_3m,
                "projected_condition": c_3m,
                "estimated_cost": cost_3m,
                "cost_increase_pct": 22.0,
                "state_summary": "Micro-cracks propagate into shallow localized potholes. Moisture penetration begins."
            },
            "6_months": {
                "horizon": "6 Months",
                "projected_risk": r_6m,
                "projected_condition": c_6m,
                "estimated_cost": cost_6m,
                "cost_increase_pct": 52.0,
                "state_summary": "Potholes widen; subgrade water infiltration creates structural base course displacement."
            },
            "12_months": {
                "horizon": "12 Months",
                "projected_risk": r_12m,
                "projected_condition": c_12m,
                "estimated_cost": cost_12m,
                "cost_increase_pct": 145.0,
                "state_summary": "Full foundation shear failure. Simple resurfacing impossible; requires emergency full-depth reconstruction."
            }
        }

        scenarios = {
            "REPAIR_NOW": {
                "scenario_type": "REPAIR_NOW",
                "title": "Repair Now (Preventative)",
                "projected_risk": 12,
                "projected_condition": 95,
                "estimated_cost": base_cost,
                "five_year_tco": round(base_cost * 1.15, 2),
                "is_recommended": True,
                "rationale": f"Locks repair cost at ₹{round(base_cost/100000.0, 1)}L, reducing risk to 12/100 and avoiding monsoon damage escalation."
            },
            "DELAY": {
                "scenario_type": "DELAY",
                "title": "Delay 6 Months (Untreated)",
                "projected_risk": r_6m,
                "projected_condition": c_6m,
                "estimated_cost": cost_6m,
                "penalty_amount": round(cost_6m - base_cost, 2),
                "is_recommended": False,
                "rationale": f"Deferring repairs triggers an extra ₹{round((cost_6m - base_cost)/100000.0, 1)}L (+52%) financial delay penalty."
            },
            "PARTIAL_REPAIR": {
                "scenario_type": "PARTIAL_REPAIR",
                "title": "Partial Patch / Temporary Fill",
                "projected_risk": 54,
                "projected_condition": 62,
                "estimated_cost": round(base_cost * 0.25, 2),
                "effective_lifespan_months": 4,
                "is_recommended": False,
                "rationale": "Inexpensive immediate patch, but recurrence failure probability is >78% within 4 months."
            }
        }

        return {
            "asset_id": asset_id,
            "current_state": {
                "risk_score": r0,
                "condition_score": c0,
                "base_cost": base_cost
            },
            "horizons": horizons,
            "scenarios": scenarios,
            "recommended_scenario": "REPAIR_NOW",
            "recommendation_reason": f"CivicX recommends immediate preventative intervention because delaying 6 months escalates cost by ₹{round((cost_6m - base_cost)/100000.0, 1)}L and raises risk to {r_6m}/100."
        }
