"""
Explainable Priority Engine for CivicX Platform
Evaluates ranking based on risk mitigation urgency, network criticality, usage density, and cost-efficiency.
"""
from typing import List, Dict, Any

class PriorityEngine:
    @staticmethod
    def rank_assets(assets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        sorted_assets = list(assets)
        for a in sorted_assets:
            r = a.get("riskScore", 50)
            k = a.get("criticalityScore", 50)
            u = a.get("usageScore", 50)
            c = max(100000, a.get("estimatedRepairCost", 500000))
            # Cost-efficiency weighted priority metric
            metric = (r * 1.6 + k * 1.3 + u * 0.9) / (c ** 0.12)
            a["_priorityMetric"] = metric

        sorted_assets.sort(key=lambda x: x["_priorityMetric"], reverse=True)
        for rank, a in enumerate(sorted_assets, 1):
            a["priorityRank"] = rank
            del a["_priorityMetric"]

        return sorted_assets
