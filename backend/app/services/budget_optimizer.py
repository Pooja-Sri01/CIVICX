"""
Budget Optimization Knapsack Engine for CivicX Platform
Implements a greedy value-maximization heuristic vs FIFO baseline.
"""
from typing import List, Dict, Any

class BudgetOptimizer:
    @staticmethod
    def optimize(
        assets: List[Dict[str, Any]],
        budget: float,
        strategy: str = "civicx_value_max"
    ) -> Dict[str, Any]:
        sorted_assets = list(assets)
        if strategy == "civicx_value_max":
            def efficiency_score(a: Dict[str, Any]) -> float:
                delta_risk = max(10, a.get("riskScore", 50) - 12)
                crit_factor = a.get("criticalityScore", 50) / 50.0
                cost = max(100000, a.get("estimatedRepairCost", 500000))
                return (delta_risk * crit_factor) / (cost ** 0.55)

            sorted_assets.sort(key=efficiency_score, reverse=True)
        else:
            sorted_assets.sort(key=lambda x: x.get("id", ""))

        selected = []
        unselected = []
        current_cost = 0.0

        for a in sorted_assets:
            cost = a.get("estimatedRepairCost", 0.0)
            if current_cost + cost <= budget:
                selected.append(a)
                current_cost += cost
            else:
                unselected.append(a)

        initial_risk = sum(a.get("riskScore", 0) for a in assets)
        selected_ids = {s.get("id") for s in selected}
        post_repair_risk = sum(12 if a.get("id") in selected_ids else a.get("riskScore", 0) for a in assets)

        total_reduction = initial_risk - post_repair_risk
        reduction_pct = (total_reduction / initial_risk * 100) if initial_risk > 0 else 0.0
        efficiency_ratio = (current_cost / total_reduction) if total_reduction > 0 else 0.0

        return {
            "budget": budget,
            "strategy": strategy,
            "allocatedCost": current_cost,
            "unallocatedCost": max(0.0, budget - current_cost),
            "budgetUtilizationPct": round((current_cost / budget * 100) if budget > 0 else 0.0, 1),
            "assetsRepairedCount": len(selected),
            "totalAssetsConsidered": len(assets),
            "initialTotalRisk": initial_risk,
            "postRepairTotalRisk": post_repair_risk,
            "totalRiskReduction": total_reduction,
            "riskReductionPercent": round(reduction_pct, 1),
            "costEfficiencyPerRiskPoint": round(efficiency_ratio, 0),
            "selectedAssetIds": [s.get("id") for s in selected],
            "selectedAssets": selected,
            "unselectedAssets": unselected
        }
