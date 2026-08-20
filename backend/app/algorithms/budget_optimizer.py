"""
CIVICX Knapsack Budget Optimizer
Implements a greedy ROI-per-cost heuristic to select the optimal infrastructure repair portfolio
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

        if strategy == "civicx_value_max":
            # Value metric: (Expected Risk Reduction * Criticality Weight) / (Repair Cost ^ 0.55)
            def value_efficiency(item: Dict[str, Any]) -> float:
                curr_risk = item.get("risk_score", 50)
                # Nominal post-repair residual risk target is ~12
                delta_risk = max(10.0, float(curr_risk - 12))
                
                crit = str(item.get("criticality", "MEDIUM")).upper()
                crit_multiplier = 1.6 if crit == "CRITICAL" else 1.3 if crit == "HIGH" else 1.0 if crit == "MEDIUM" else 0.7
                
                cost = max(100000.0, float(item.get("estimated_repair_cost", 500000.0)))
                return (delta_risk * crit_multiplier) / (cost ** 0.55)

            asset_pool.sort(key=value_efficiency, reverse=True)
        else:
            # Naive Baseline: First-come First-served (ID order)
            asset_pool.sort(key=lambda x: str(x.get("id", "")))

        selected_assets = []
        unselected_assets = []
        total_cost = 0.0

        for a in asset_pool:
            cost = float(a.get("estimated_repair_cost", 0.0))
            if total_cost + cost <= budget:
                selected_assets.append(a)
                total_cost += cost
            else:
                unselected_assets.append(a)

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
            "unselected_assets": unselected_assets
        }
