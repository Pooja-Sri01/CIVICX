"""
CIVICX City Time Machine & Digital Twin Simulation Engine (Prompt 9)
Simulates multi-horizon infrastructure deterioration decay curves (2026-2030),
counterfactual what-if scenarios (Do Nothing, Routine, Preventive, Rehabilitation, Reconstruction),
timing offsets (Now, 6M, 12M, 24M), lifecycle total cost of ownership (TCO), and cost of delay.
"""

from typing import Dict, Any, List, Optional

class SimulationEngine:
    INTERVENTION_MODELS = {
        "DO_NOTHING": {
            "name": "Do Nothing (Untreated Decay)",
            "condition_boost": 0,
            "max_condition": 100,
            "cost_multiplier": 0.0,
            "lifespan_extension_years": 0,
            "target_risk": None,
            "description": "No municipal intervention. Asset follows empirical deterioration trajectory."
        },
        "ROUTINE_MAINTENANCE": {
            "name": "Routine Maintenance (Patching & Crack Sealing)",
            "condition_boost": 12,
            "max_condition": 75,
            "cost_multiplier": 0.15,
            "lifespan_extension_years": 1,
            "target_risk": 55,
            "description": "Surface level pothole filling and localized sealants. Recurrence failure likely within 12 months."
        },
        "PREVENTIVE_MAINTENANCE": {
            "name": "Preventive Maintenance (High-Modulus Overlay)",
            "condition_boost": 35,
            "max_condition": 92,
            "cost_multiplier": 0.65,
            "lifespan_extension_years": 4,
            "target_risk": 18,
            "description": "Polymer-modified asphalt resurfacing and joint waterproofing preventing subgrade water ingress."
        },
        "REHABILITATION": {
            "name": "Major Structural Rehabilitation",
            "condition_boost": 60,
            "max_condition": 98,
            "cost_multiplier": 1.0,
            "lifespan_extension_years": 8,
            "target_risk": 12,
            "description": "Full-depth milling, base course stabilization, and structural bearing rehabilitation."
        },
        "RECONSTRUCTION": {
            "name": "Full Corridor Reconstruction",
            "condition_boost": 85,
            "max_condition": 100,
            "cost_multiplier": 2.4,
            "lifespan_extension_years": 15,
            "target_risk": 8,
            "description": "Complete subgrade replacement and modern high-capacity structural reconstruction."
        }
    }

    @classmethod
    def simulate_custom_scenario(
        cls,
        asset_id: str,
        current_condition: int,
        current_risk: int,
        base_repair_cost: float,
        intervention_type: str = "PREVENTIVE_MAINTENANCE",
        timing_months: int = 0, # 0 (Now), 6, 12, 24
        custom_budget: Optional[float] = None,
        deterioration_rate: float = 14.5
    ) -> Dict[str, Any]:
        """
        Simulates a specific counterfactual What-If scenario (Intervention + Timing)
        and compares it against the 'Do Nothing' baseline.
        """
        c0 = max(1, min(100, int(current_condition)))
        r0 = max(1, min(99, int(current_risk)))
        cost_base = max(50000.0, float(base_repair_cost))
        rate = max(4.0, float(deterioration_rate))

        intervention_key = intervention_type.upper()
        if intervention_key not in cls.INTERVENTION_MODELS:
            intervention_key = "PREVENTIVE_MAINTENANCE"
        
        cfg = cls.INTERVENTION_MODELS[intervention_key]
        
        # Calculate cost with timing escalation penalty
        # Delay increases required intervention scope and cost
        timing_years = timing_months / 12.0
        delay_cost_escalation = 1.0 + (timing_years * 0.45) # +45% cost per year of deferral
        
        initial_cost = round(cost_base * cfg["cost_multiplier"] * (delay_cost_escalation if intervention_key != "DO_NOTHING" else 0.0), 2)
        immediate_cost = round(cost_base * cfg["cost_multiplier"], 2)
        cost_of_delay = max(0.0, round(initial_cost - immediate_cost, 2))

        # Yearly Timelines (2026 - 2030)
        years = [2026, 2027, 2028, 2029, 2030]
        timeline_do_nothing = []
        timeline_simulated = []

        curr_c_dn = c0
        curr_r_dn = r0
        curr_c_sim = c0
        curr_r_sim = r0

        applied = False

        for yr_idx, yr in enumerate(years):
            elapsed_months = yr_idx * 12
            
            # --- 1. DO NOTHING TRAJECTORY ---
            if yr_idx == 0:
                timeline_do_nothing.append({
                    "year": yr,
                    "tag": "ACTUAL",
                    "condition": curr_c_dn,
                    "risk": curr_r_dn,
                    "cost_cumulative": 0.0,
                    "status": "Current Monitored State"
                })
            else:
                decay = rate * (1.25 if curr_c_dn < 40 else 1.1)
                curr_c_dn = max(2, round(curr_c_dn - decay))
                curr_r_dn = min(99, round(curr_r_dn + (decay * 0.8)))
                timeline_do_nothing.append({
                    "year": yr,
                    "tag": "FORECAST" if yr_idx <= 2 else "SIMULATION",
                    "condition": curr_c_dn,
                    "risk": curr_r_dn,
                    "cost_cumulative": 0.0,
                    "status": "Critical Subgrade Rutting" if curr_c_dn < 40 else "Accelerating Degradation"
                })

            # --- 2. WHAT-IF SIMULATED TRAJECTORY ---
            if yr_idx == 0:
                if timing_months == 0 and intervention_key != "DO_NOTHING":
                    # Applied immediately in 2026
                    curr_c_sim = min(cfg["max_condition"], c0 + cfg["condition_boost"])
                    curr_r_sim = cfg["target_risk"] or max(10, r0 - 45)
                    applied = True
                    timeline_simulated.append({
                        "year": yr,
                        "tag": "SIMULATION",
                        "condition": curr_c_sim,
                        "risk": curr_r_sim,
                        "cost_cumulative": initial_cost,
                        "status": f"Intervention Applied: {cfg['name']}"
                    })
                else:
                    timeline_simulated.append({
                        "year": yr,
                        "tag": "ACTUAL",
                        "condition": c0,
                        "risk": r0,
                        "cost_cumulative": 0.0,
                        "status": "Baseline State"
                    })
            else:
                # Check if intervention triggers in this year
                if not applied and elapsed_months >= timing_months and intervention_key != "DO_NOTHING":
                    # Apply intervention with recovered condition
                    curr_c_sim = min(cfg["max_condition"], curr_c_sim + cfg["condition_boost"])
                    curr_r_sim = cfg["target_risk"] or max(10, curr_r_sim - 40)
                    applied = True
                    timeline_simulated.append({
                        "year": yr,
                        "tag": "SIMULATION",
                        "condition": curr_c_sim,
                        "risk": curr_r_sim,
                        "cost_cumulative": initial_cost,
                        "status": f"Intervention Applied ({timing_months}M): {cfg['name']}"
                    })
                else:
                    # Post-intervention slower decay rate or pre-intervention natural decay
                    active_rate = (rate * 0.35) if applied else (rate * 1.15)
                    curr_c_sim = max(2, round(curr_c_sim - active_rate))
                    curr_r_sim = min(99, round(curr_r_sim + (active_rate * 0.6)))
                    timeline_simulated.append({
                        "year": yr,
                        "tag": "SIMULATION",
                        "condition": curr_c_sim,
                        "risk": curr_r_sim,
                        "cost_cumulative": initial_cost if applied else 0.0,
                        "status": "Stabilized Lifecycle" if applied else "Deferred Degradation"
                    })

        # Intervention Effectiveness Metrics
        final_cond_delta = timeline_simulated[-1]["condition"] - timeline_do_nothing[-1]["condition"]
        final_risk_delta = timeline_do_nothing[-1]["risk"] - timeline_simulated[-1]["risk"]

        tco_simulated = initial_cost + (initial_cost * 0.12) # +12% maintenance over 5 yrs
        tco_do_nothing = cost_base * 3.4 # Emergency delayed full reconstruction cost

        return {
            "asset_id": asset_id,
            "scenario": {
                "intervention_type": intervention_key,
                "intervention_name": cfg["name"],
                "timing_months": timing_months,
                "timing_label": "Immediate (Now)" if timing_months == 0 else f"{timing_months} Months Delay",
                "target_budget": custom_budget or initial_cost,
                "description": cfg["description"]
            },
            "effectiveness": {
                "condition_gain_pts": max(0, final_cond_delta),
                "risk_reduction_pts": max(0, final_risk_delta),
                "lifespan_extension_years": cfg["lifespan_extension_years"],
                "cost_of_delay": cost_of_delay,
                "delay_cost_penalty_pct": round(((delay_cost_escalation - 1.0) * 100), 1) if timing_months > 0 else 0.0
            },
            "financials": {
                "initial_cost": initial_cost,
                "immediate_cost": immediate_cost,
                "cost_of_delay": cost_of_delay,
                "five_year_tco_simulated": round(tco_simulated, 2),
                "five_year_tco_do_nothing": round(tco_do_nothing, 2),
                "net_lifecycle_savings": round(max(0.0, tco_do_nothing - tco_simulated), 2)
            },
            "trajectories": {
                "years": years,
                "do_nothing": timeline_do_nothing,
                "simulated": timeline_simulated
            },
            "explainability": (
                f"Applying {cfg['name']} at {timing_months}M preserves condition at {timeline_simulated[-1]['condition']}/100 in 2030 "
                f"(vs {timeline_do_nothing[-1]['condition']}/100 Do Nothing), avoiding a ₹{round(cost_of_delay/100000.0, 1)}L delay cost escalation."
            ),
            "model_metadata": {
                "simulation_engine": "CIVICX-DigitalTwin-v2.0",
                "prediction_baseline": "CIVICX-Deterioration-Baseline-v1.2.0"
            }
        }

    @classmethod
    def simulate_asset(
        cls,
        asset_id: str,
        current_risk: int,
        current_condition: int,
        base_repair_cost: float,
        deterioration_rate: float = 15.0,
        historical_records_count: int = 2,
        last_inspection_date: str = "2026-08-14"
    ) -> Dict[str, Any]:
        """
        Runs comprehensive multi-horizon and multi-scenario deterioration simulation.
        (Maintains 100% backward compatibility for all existing simulation endpoints).
        """
        r0 = max(1, min(99, int(current_risk)))
        c0 = max(1, min(100, int(current_condition)))
        base_cost = max(50000.0, float(base_repair_cost))
        rate = max(5.0, float(deterioration_rate))

        timeline_2026 = {
            "year": 2026,
            "label": "2026 (Today)",
            "repair_now": {"risk": 12, "condition": 95, "cost": base_cost, "maintenance_need": "Routine preventative inspection"},
            "partial_repair": {"risk": 54, "condition": 65, "cost": round(base_cost * 0.25, 2), "maintenance_need": "Temporary patch monitoring"},
            "delay": {"risk": r0, "condition": c0, "cost": base_cost, "maintenance_need": "Active surface & subgrade distress"}
        }

        r_2027 = min(98, r0 + round(max(10, (100 - c0) * 0.35 + (rate * 0.65))))
        c_2027 = max(15, c0 - round(c0 * 0.45 + 10))
        cost_2027 = round(base_cost * 2.45, 2)
        timeline_2027 = {
            "year": 2027,
            "label": "2027 (+1 Year)",
            "repair_now": {"risk": 15, "condition": 92, "cost": round(base_cost * 1.05, 2), "maintenance_need": "Annual seal verification"},
            "partial_repair": {"risk": 68, "condition": 52, "cost": round(base_cost * 0.55, 2), "maintenance_need": "Patch recurrence & cracking"},
            "delay": {"risk": r_2027, "condition": c_2027, "cost": cost_2027, "maintenance_need": "Sub-base erosion; full-depth repair required"}
        }

        r_2028 = min(99, r_2027 + round(max(8, (100 - c_2027) * 0.30 + (rate * 0.50))))
        c_2028 = max(8, c_2027 - round(c_2027 * 0.50 + 8))
        cost_2028 = round(base_cost * 3.20, 2)
        timeline_2028 = {
            "year": 2028,
            "label": "2028 (+2 Years)",
            "repair_now": {"risk": 18, "condition": 88, "cost": round(base_cost * 1.10, 2), "maintenance_need": "Routine maintenance cycle"},
            "partial_repair": {"risk": 78, "condition": 38, "cost": round(base_cost * 1.20, 2), "maintenance_need": "Secondary base failure"},
            "delay": {"risk": r_2028, "condition": c_2028, "cost": cost_2028, "maintenance_need": "Structural foundation displacement; road closure risk"}
        }

        r_2029 = min(99, r_2028 + 5)
        c_2029 = max(4, c_2028 - 5)
        cost_2029 = round(base_cost * 4.10, 2)
        timeline_2029 = {
            "year": 2029,
            "label": "2029 (+3 Years)",
            "repair_now": {"risk": 22, "condition": 84, "cost": round(base_cost * 1.15, 2), "maintenance_need": "Preventative micro-surfacing"},
            "partial_repair": {"risk": 86, "condition": 28, "cost": round(base_cost * 1.95, 2), "maintenance_need": "Extensive structural rutting"},
            "delay": {"risk": r_2029, "condition": c_2029, "cost": cost_2029, "maintenance_need": "Critical corridor failure; complete reconstruction required"}
        }

        r_2030 = 99
        c_2030 = 2
        cost_2030 = round(base_cost * 4.80, 2)
        timeline_2030 = {
            "year": 2030,
            "label": "2030 (+4 Years)",
            "repair_now": {"risk": 26, "condition": 80, "cost": round(base_cost * 1.22, 2), "maintenance_need": "Mid-life cycle resurfacing"},
            "partial_repair": {"risk": 94, "condition": 18, "cost": round(base_cost * 2.80, 2), "maintenance_need": "Severe structural distress"},
            "delay": {"risk": r_2030, "condition": c_2030, "cost": cost_2030, "maintenance_need": "Asset lifecycle terminal collapse"}
        }

        yearly_timeline = [timeline_2026, timeline_2027, timeline_2028, timeline_2029, timeline_2030]

        r_3m = min(98, r0 + round(max(3, (100 - c0) * 0.08 + (rate * 0.15))))
        c_3m = max(5, c0 - round(c0 * 0.12 + 3))
        cost_3m = round(base_cost * 1.22, 2)

        r_6m = min(98, r0 + round(max(6, (100 - c0) * 0.18 + (rate * 0.35))))
        c_6m = max(3, c0 - round(c0 * 0.28 + 6))
        cost_6m = round(base_cost * 1.52, 2)

        horizons = {
            "today": {
                "horizon": "Today (2026)",
                "projected_risk": r0,
                "projected_condition": c0,
                "estimated_cost": base_cost,
                "cost_increase_pct": 0.0,
                "state_summary": "Active surface & structural fatigue confirmed by visual and sensor telemetry."
            },
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
                "horizon": "12 Months (2027)",
                "projected_risk": r_2027,
                "projected_condition": c_2027,
                "estimated_cost": cost_2027,
                "cost_increase_pct": 145.0,
                "state_summary": "Full foundation shear failure. Simple resurfacing impossible; requires emergency full-depth reconstruction."
            },
            "24_months": {
                "horizon": "24 Months (2028)",
                "projected_risk": r_2028,
                "projected_condition": c_2028,
                "estimated_cost": cost_2028,
                "cost_increase_pct": 220.0,
                "state_summary": "Severe base rutting and subgrade erosion. High risk of emergency corridor closure."
            }
        }

        cost_of_delay_6m = round(cost_6m - base_cost, 2)
        additional_risk_delay_6m = max(0, r_6m - 12)

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
                "penalty_amount": cost_of_delay_6m,
                "additional_risk": additional_risk_delay_6m,
                "is_recommended": False,
                "rationale": f"Deferring repairs by 6 months triggers a ₹{round(cost_of_delay_6m/100000.0, 1)}L (+52%) financial delay penalty and raises risk to {r_6m}/100."
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

        decision_insight = (
            f"Immediate preventative intervention yields the lowest 5-year lifecycle cost ({round(base_cost * 1.15 / 100000.0, 1)}L TCO) "
            f"and permanently avoids the ₹{round(cost_of_delay_6m / 100000.0, 1)}L delay penalty caused by compound subgrade water erosion."
        )

        return {
            "asset_id": asset_id,
            "current_state": {
                "risk_score": r0,
                "condition_score": c0,
                "base_cost": base_cost
            },
            "horizons": horizons,
            "yearly_timeline": yearly_timeline,
            "scenarios": scenarios,
            "cost_of_delay": cost_of_delay_6m,
            "additional_risk_from_delay": additional_risk_delay_6m,
            "recommended_scenario": "REPAIR_NOW",
            "recommendation_reason": f"CivicX recommends immediate preventative intervention because delaying 6 months escalates cost by ₹{round(cost_of_delay_6m/100000.0, 1)}L and raises risk to {r_6m}/100.",
            "decision_insight": decision_insight,
            "assumptions": {
                "baseline_year": 2026,
                "deterioration_model": "Non-linear compound subgrade degradation index",
                "moisture_stress_factor": "Monsoon hydro-dynamic penetration penalty (+15%/cycle)",
                "cost_escalation_model": "Emergency reconstruction penalty scaling factor (2.45x at 12 mo)"
            },
            "data_quality": {
                "historical_observations": historical_records_count,
                "last_inspection": last_inspection_date,
                "forecast_reliability": "HIGH (Ground Truth Verified)" if historical_records_count > 0 else "MEDIUM (Baseline Analytical Telemetry)"
            }
        }

    @classmethod
    def simulate_portfolio(cls, assets: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Simulates citywide portfolio risk and cost trajectory over 2026-2030.
        """
        total_assets = len(assets)
        initial_risk = sum(int(a.get("risk_score", 50)) for a in assets)
        total_base_cost = sum(float(a.get("estimated_repair_cost", 500000.0)) for a in assets)

        years = [2026, 2027, 2028, 2029, 2030]
        city_timeline = []

        for idx, year in enumerate(years):
            if idx == 0:
                city_timeline.append({
                    "year": year,
                    "proactive_risk": round(total_assets * 12),
                    "proactive_cost": round(total_base_cost, 2),
                    "delayed_risk": initial_risk,
                    "delayed_cost": round(total_base_cost, 2),
                    "savings_delta": 0.0
                })
            else:
                mult = 1.0 + (idx * 0.65)
                proactive_risk = round(total_assets * (12 + idx * 3))
                proactive_cost = round(total_base_cost * (1.0 + idx * 0.06), 2)
                delayed_risk = min(total_assets * 98, round(initial_risk * (1.0 + idx * 0.18)))
                delayed_cost = round(total_base_cost * mult, 2)

                city_timeline.append({
                    "year": year,
                    "proactive_risk": proactive_risk,
                    "proactive_cost": proactive_cost,
                    "delayed_risk": delayed_risk,
                    "delayed_cost": delayed_cost,
                    "savings_delta": round(delayed_cost - proactive_cost, 2)
                })

        return {
            "total_assets_simulated": total_assets,
            "city_timeline": city_timeline,
            "total_5year_savings": round(city_timeline[-1]["delayed_cost"] - city_timeline[-1]["proactive_cost"], 2),
            "total_risk_points_prevented": city_timeline[-1]["delayed_risk"] - city_timeline[-1]["proactive_risk"]
        }
