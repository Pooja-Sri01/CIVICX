"""
CIVICX Predictive Infrastructure Deterioration & Failure Forecasting Test Suite (Prompt 8)
Validates multi-horizon condition trajectories, acceleration trends, critical threshold crossings,
proactive maintenance windows, honest low-data handling, and non-overwrite of official 6-factor risk.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.seed.seed_runner import seed_database

def test_predictive_intelligence_workflow():
    seed_database()
    with TestClient(app) as client:
        print("\n=======================================================")
        print("TESTING PREDICTIVE INFRASTRUCTURE INTELLIGENCE (PROMPT 8)")
        print("=======================================================")

        # 1. Asset Predictive Deterioration Forecast (RD-1042 with rich history)
        res = client.get("/api/predictions/assets/RD-1042")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert data["asset_id"] == "RD-1042"
        assert data["is_available"] is True
        assert data["data_quality"] in ["HIGH", "MEDIUM"]
        assert len(data["forecast"]) >= 3 # 6M, 12M, 24M
        
        # Verify forecast horizons
        h_6m = next(f for f in data["forecast"] if f["horizon"] == "6M")
        h_12m = next(f for f in data["forecast"] if f["horizon"] == "12M")
        h_24m = next(f for f in data["forecast"] if f["horizon"] == "24M")

        assert h_6m["condition"] <= data["current_condition"]
        assert h_12m["condition"] <= h_6m["condition"]
        assert h_24m["condition"] <= h_12m["condition"]
        assert h_12m["lower_bound"] < h_12m["upper_bound"]
        assert "condition_band" in h_12m

        # Verify acceleration & maintenance window
        assert data["trend"] == "ACCELERATING"
        assert "Immediate" in data["maintenance_window"] or "month" in data["maintenance_window"]
        assert len(data["evidence_chain"]) >= 2
        print(f"[PASS] 1. RD-1042 Forecast: Cond {data['current_condition']} -> 6M: {h_6m['condition']}, 12M: {h_12m['condition']}, 24M: {h_24m['condition']} (Trend: {data['trend']}, Window: {data['maintenance_window']})")

        # 2. Critical Threshold Crossing Detection
        assert "critical_threshold_crossing" in data
        assert data["critical_threshold_crossing"] != ""
        print(f"[PASS] 2. Critical threshold crossing: {data['critical_threshold_crossing']}")

        # 3. Citywide Predictive Summary (/api/predictions/summary)
        res_summary = client.get("/api/predictions/summary")
        assert res_summary.status_code == 200
        summary = res_summary.json()
        assert summary["total_assets_evaluated"] == 78
        assert summary["accelerating_count"] > 0
        assert summary["critical_under_12m"] > 0
        assert summary["maintenance_under_6m"] > 0
        assert len(summary["risk_mitigation_window_breakdown"]) >= 3
        print(f"[PASS] 3. Citywide summary: {summary['total_assets_evaluated']} assets evaluated | Accelerating: {summary['accelerating_count']} | Critical <12M: {summary['critical_under_12m']} | Maint <6M: {summary['maintenance_under_6m']}")

        # 4. Predictive Priority Queue (/api/predictions/priorities)
        res_priorities = client.get("/api/predictions/priorities?limit=10")
        assert res_priorities.status_code == 200
        priorities = res_priorities.json()
        assert len(priorities) == 10
        assert priorities[0]["asset_id"] == "RD-1042"
        assert "forecast_12m" in priorities[0]
        assert "maintenance_window" in priorities[0]
        print(f"[PASS] 4. Predictive priority queue: Top asset #{priorities[0]['priority_rank']} is {priorities[0]['asset_id']} (12M Forecast: {priorities[0]['forecast_12m']}/100, Window: {priorities[0]['maintenance_window']})")

        # 5. On-Demand Prediction Runner (/api/predictions/run)
        res_run = client.post("/api/predictions/run", json={"asset_id": "BR-2019"})
        assert res_run.status_code == 200
        run_data = res_run.json()
        assert run_data["asset_id"] == "BR-2019"
        assert len(run_data["forecast"]) >= 3
        print(f"[PASS] 5. On-demand prediction run: BR-2019 -> 12M Forecast: {run_data['forecast'][1]['condition']}/100")

        # 6. Non-Existent or Low-Data Asset Handling
        res_low = client.get("/api/predictions/assets/NON-EXISTENT-XYZ")
        assert res_low.status_code == 200
        low_data = res_low.json()
        assert low_data["data_quality"] == "LOW"
        assert low_data["is_available"] is False
        assert "unavailable_reason" in low_data
        print(f"[PASS] 6. Low-data honest handling: Returned is_available=False with clear reason")

        # 7. Non-Overwrite Integrity: Official CIVICX 6-Factor Risk Score remains authoritative
        res_risk = client.get("/api/assets/RD-1042/risk-explanation")
        assert res_risk.status_code == 200
        risk_explanation = res_risk.json()
        assert risk_explanation["risk_score"] >= 80
        assert risk_explanation["risk_level"] in ["CRITICAL", "HIGH"]
        print(f"[PASS] 7. Risk Engine Separation: Official MCDA risk remains {risk_explanation['risk_score']}/100 {risk_explanation['risk_level']} (unmodified by prediction model)")

        print("=======================================================")
        print("ALL PREDICTIVE INTELLIGENCE TESTS PASSED (100% SUCCESS)")
        print("=======================================================\n")

if __name__ == "__main__":
    test_predictive_intelligence_workflow()
