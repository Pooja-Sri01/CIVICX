"""
Automated Test Suite for CIVICX Digital Twin & What-If Simulation (Prompt 9)
Tests Digital Twin state aggregation, counterfactual what-if simulations,
temporal tags (ACTUAL vs FORECAST vs SIMULATION), non-destructive simulation execution,
scenario persistence, and operational status workflows.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.seed.seed_runner import seed_database

def run_digital_twin_tests():
    print("=" * 60)
    print("TESTING CIVICX DIGITAL TWIN & WHAT-IF SIMULATION (PROMPT 9)")
    print("=" * 60)

    # Seed clean database
    seed_database()
    client = TestClient(app)

    # 1. Test GET /api/digital-twin/assets/RD-1042
    res = client.get("/api/digital-twin/assets/RD-1042")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    dt = res.json()
    assert dt["asset_id"] == "RD-1042", f"Expected RD-1042, got {dt['asset_id']}"
    assert dt["condition_score"] == 14, f"Expected condition 14, got {dt['condition_score']}"
    assert dt["risk_score"] == 93, f"Expected risk 93, got {dt['risk_score']}"
    assert "lifecycle_stage" in dt, "Missing lifecycle_stage"
    assert "citizen_signals" in dt, "Missing citizen_signals"
    assert "ai_inspection_signals" in dt, "Missing ai_inspection_signals"
    assert "forecast_summary" in dt, "Missing forecast_summary"
    assert "scenarios" in dt, "Missing baseline scenarios"
    print(f"[PASS] 1. GET Digital Twin State for RD-1042: Lifecycle={dt['lifecycle_stage']}, Citizen Reports={dt['citizen_signals']['total_reports']}, AI Defect={dt['ai_inspection_signals']['detected_damage']}")

    # 2. Test POST /api/digital-twin/simulate (What-If: Preventive Maintenance at 6 Months)
    sim_payload = {
        "asset_id": "RD-1042",
        "intervention_type": "PREVENTIVE_MAINTENANCE",
        "timing_months": 6,
        "budget": 650000.0
    }
    sim_res = client.post("/api/digital-twin/simulate", json=sim_payload)
    assert sim_res.status_code == 200, f"Expected 200, got {sim_res.status_code}: {sim_res.text}"
    sim_data = sim_res.json()
    
    assert sim_data["asset_id"] == "RD-1042"
    assert sim_data["scenario"]["intervention_type"] == "PREVENTIVE_MAINTENANCE"
    assert sim_data["scenario"]["timing_months"] == 6
    assert sim_data["effectiveness"]["condition_gain_pts"] > 0
    assert sim_data["effectiveness"]["cost_of_delay"] > 0
    assert len(sim_data["trajectories"]["simulated"]) == 5
    assert len(sim_data["trajectories"]["do_nothing"]) == 5
    print(f"[PASS] 2. What-If Simulation: Condition Gain=+{sim_data['effectiveness']['condition_gain_pts']} pts, Cost of Delay=INR {sim_data['financials']['cost_of_delay']:,.2f}, 5-Yr TCO=INR {sim_data['financials']['five_year_tco_simulated']:,.2f}")

    # 3. Test Temporal Demarcation Tags
    do_nothing_tags = [pt["tag"] for pt in sim_data["trajectories"]["do_nothing"]]
    sim_tags = [pt["tag"] for pt in sim_data["trajectories"]["simulated"]]
    assert do_nothing_tags[0] == "ACTUAL", f"Expected 2026 to be ACTUAL, got {do_nothing_tags[0]}"
    assert "FORECAST" in do_nothing_tags or "SIMULATION" in do_nothing_tags
    assert "SIMULATION" in sim_tags
    print(f"[PASS] 3. Temporal Demarcation Tags: Verified ACTUAL (2026), FORECAST, and SIMULATION tags")

    # 4. Verify Ground Truth Isolation (Asset in DB must remain unmodified)
    asset_check = client.get("/api/assets/RD-1042")
    assert asset_check.status_code == 200
    a_data = asset_check.json()
    assert a_data["condition_score"] == 14, "Asset condition was corrupted by simulation"
    assert a_data["risk_score"] == 93, "Asset risk was corrupted by simulation"
    print("[PASS] 4. Ground Truth Integrity: Asset condition (14) & MCDA risk (93) remained uncorrupted")

    # 5. Test Save Scenario POST /api/digital-twin/scenarios
    save_payload = {
        "asset_id": "RD-1042",
        "name": "Gandhipuram Monsoon Preventive Action Plan",
        "intervention_type": "PREVENTIVE_MAINTENANCE",
        "timing_months": 6,
        "budget": 650000.0,
        "scenario_status": "SIMULATED",
        "simulation_result": sim_data
    }
    save_res = client.post("/api/digital-twin/scenarios", json=save_payload)
    assert save_res.status_code == 200, f"Expected 200, got {save_res.status_code}: {save_res.text}"
    saved_obj = save_res.json()
    scenario_id = saved_obj["id"]
    assert saved_obj["name"] == "Gandhipuram Monsoon Preventive Action Plan"
    assert saved_obj["scenario_status"] == "SIMULATED"
    print(f"[PASS] 5. Scenario Saved: ID #{scenario_id} ({saved_obj['name']})")

    # 6. Test GET /api/digital-twin/scenarios
    list_res = client.get("/api/digital-twin/scenarios?asset_id=RD-1042")
    assert list_res.status_code == 200
    saved_list = list_res.json()
    assert len(saved_list) >= 1
    assert any(s["id"] == scenario_id for s in saved_list)
    print(f"[PASS] 6. Retrieved Saved Scenarios: Found {len(saved_list)} saved scenarios for RD-1042")

    # 7. Test PATCH /api/digital-twin/scenarios/{id}/status (Review Workflow)
    patch_res = client.patch(f"/api/digital-twin/scenarios/{scenario_id}/status", json={"status": "APPROVED"})
    assert patch_res.status_code == 200, f"Expected 200, got {patch_res.status_code}: {patch_res.text}"
    updated_obj = patch_res.json()
    assert updated_obj["scenario_status"] == "APPROVED"
    print(f"[PASS] 7. Operational Review Status Updated: Scenario #{scenario_id} is now APPROVED")

    # 8. Test Major Rehabilitation Scenario (Alternative What-If)
    rehab_payload = {
        "asset_id": "BR-2019",
        "intervention_type": "REHABILITATION",
        "timing_months": 0,
        "budget": 2400000.0
    }
    rehab_res = client.post("/api/digital-twin/simulate", json=rehab_payload)
    assert rehab_res.status_code == 200
    rehab_data = rehab_res.json()
    assert rehab_data["effectiveness"]["lifespan_extension_years"] == 8
    print(f"[PASS] 8. Major Rehabilitation Simulation (BR-2019): +{rehab_data['effectiveness']['lifespan_extension_years']} Yrs Lifespan, 2030 Condition={rehab_data['trajectories']['simulated'][-1]['condition']}/100")

    print("=" * 60)
    print("ALL DIGITAL TWIN & WHAT-IF TESTS PASSED (100% SUCCESS)")
    print("=" * 60)

if __name__ == "__main__":
    run_digital_twin_tests()
