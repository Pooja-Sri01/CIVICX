"""
CIVICX Knapsack Budget Optimizer
Implements a multi-criteria knapsack optimization heuristic to select the optimal infrastructure repair portfolio
that maximizes citywide risk reduction subject to a strict municipal capital budget constraint.
"""

from typing import List, Dict, Any

class BudgetOptimizer:
    @staticmethod
    def optimize(
        assets: List[Dict[str, Any]],
        available_budget: float,
        strategy: str = "civicx_value_max"
    ) -> Dict[str, Any]:
        """
        Executes budget optimization and portfolio selection.
        """
        asset_pool = [dict(a) for a in assets]
        budget = max(0.0, float(available_budget))

        # Value metric calculation for sorting
        def value_efficiency(item: Dict[str, Any]) -> float:
            curr_risk = float(item.get("risk_score", 50))
            delta_risk = max(10.0, curr_risk - 12.0)
            
            crit = str(item.get("criticality", "MEDIUM")).upper()
            crit_multiplier = 1.6 if crit == "CRITICAL" else 1.3 if crit == "HIGH" else 1.0 if crit == "MEDIUM" else 0.7
            
            cost = max(100000.0, float(item.get("estimated_repair_cost", 500000.0)))
            return (delta_risk * crit_multiplier) / (cost ** 0.55)

        if strategy == "civicx_value_max":
            asset_pool.sort(key=value_efficiency, reverse=True)
        else:
            # Naive Baseline: First-come First-served (ID order)
            asset_pool.sort(key=lambda x: str(x.get("id", "")))

        selected_assets = []
        unselected_assets = []
        total_cost = 0.0

        for a in asset_pool:
            cost = float(a.get("estimated_repair_cost", 500000.0))
            curr_risk = int(a.get("risk_score", 50))
            post_risk = 12
            risk_red = max(0, curr_risk - post_risk)
            cost_in_lakhs = max(0.1, cost / 100000.0)
            efficiency = round(risk_red / cost_in_lakhs, 2)
            
            crit = str(a.get("criticality", "MEDIUM")).upper()
            risk_lvl = str(a.get("risk_level", "Medium")).upper()

            asset_enriched = {
                **a,
                "current_risk": curr_risk,
                "post_repair_risk": post_risk,
                "risk_reduction": risk_red,
                "cost_efficiency_metric": efficiency,
                "intervention_type": a.get("recommended_action") or "Preventative Resurfacing & Base Stabilization",
                "cost_type": "Estimated Engineering Cost"
            }

            if total_cost + cost <= budget:
                asset_enriched["selection_reason"] = (
                    f"Selected for high risk-reduction efficiency ({efficiency} pts/₹L) and {crit} corridor criticality."
                )
                selected_assets.append(asset_enriched)
                total_cost += cost
            else:
                needed = round(cost - (budget - total_cost), 2)
                if needed <= 0:
                    needed = round(cost, 2)
                
                asset_enriched["deferral_reason"] = (
                    f"Budget ceiling exceeded: requires additional ₹{needed:,.0f} to fund."
                    if (budget - total_cost) < cost else
                    f"Lower risk-reduction efficiency relative to higher-ranked priority interventions."
                )
                unselected_assets.append(asset_enriched)

        initial_total_risk = sum(int(a.get("risk_score", 0)) for a in asset_pool)
        selected_ids = {a.get("id") for a in selected_assets}
        
        # Post-repair risk calculation
        post_repair_total_risk = sum(
            12 if a.get("id") in selected_ids else int(a.get("risk_score", 0))
            for a in asset_pool
        )

        risk_reduction = initial_total_risk - post_repair_total_risk
        reduction_pct = (risk_reduction / initial_total_risk * 100.0) if initial_total_risk > 0 else 0.0
        remaining_budget = max(0.0, budget - total_cost)

        # Critical Asset Gap Analysis
        unfunded_critical = [
            u for u in unselected_assets 
            if str(u.get("risk_level", "")).upper() in ["CRITICAL", "HIGH"] or str(u.get("criticality", "")).upper() in ["CRITICAL", "HIGH"]
        ]
        critical_budget_gap = sum(float(u.get("estimated_repair_cost", 0.0)) for u in unfunded_critical)

        # Portfolio synthesis explanation
        if len(selected_assets) > 0:
            top_asset_names = ", ".join([s.get("asset_id", "") for s in selected_assets[:3]])
            explanation_summary = (
                f"CivicX optimized portfolio funds {len(selected_assets)} interventions ({top_asset_names}{'...' if len(selected_assets) > 3 else ''}) "
                f"delivering {risk_reduction} points of citywide risk reduction (-{round(reduction_pct, 1)}%) "
                f"while allocating {round((total_cost / budget * 100.0) if budget > 0 else 0.0, 1)}% of the available ₹{budget:,.0f} envelope."
            )
        else:
            explanation_summary = "Available budget is insufficient to fund any eligible infrastructure interventions in the candidate queue."

        return {
            "available_budget": budget,
            "strategy": strategy,
            "total_cost": round(total_cost, 2),
            "remaining_budget": round(remaining_budget, 2),
            "budget_utilization_pct": round((total_cost / budget * 100.0) if budget > 0 else 0.0, 1),
            "assets_repaired": len(selected_assets),
            "total_assets_evaluated": len(asset_pool),
            "initial_total_risk": initial_total_risk,
            "post_repair_total_risk": post_repair_total_risk,
            "estimated_risk_reduction": risk_reduction,
            "risk_reduction_percentage": round(reduction_pct, 1),
            "cost_per_risk_point_reduced": round(total_cost / risk_reduction, 0) if risk_reduction > 0 else 0.0,
            "selected_asset_ids": [a.get("asset_id") or str(a.get("id")) for a in selected_assets],
            "selected_assets": selected_assets,
            "unselected_assets": unselected_assets,
            "unfunded_critical_assets": unfunded_critical,
            "critical_budget_gap": round(critical_budget_gap, 2),
            "portfolio_explanation": {
                "summary": explanation_summary,
                "strategy_label": "CivicX MCDA Knapsack (Risk-to-Cost Efficiency)" if strategy == "civicx_value_max" else "FIFO / First-Come Baseline",
                "risk_mitigation_efficiency": f"{round(risk_reduction / (total_cost / 100000.0), 2) if total_cost > 0 else 0.0} Risk Pts / ₹ Lakh",
                "unfunded_critical_count": len(unfunded_critical),
                "critical_budget_gap": round(critical_budget_gap, 2)
            }
        }

