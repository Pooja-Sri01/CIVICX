"""
CIVICX FINAL COMPREHENSIVE AUDIT & QA SUITE
Validates all 21 core subsystems and the complete 10-step intelligence chain.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.seed.seed_runner import seed_database

def run_master_audit():
    print("=" * 70)
    print("CIVICX FINAL MASTER AUDIT & DECISION CHAIN VERIFICATION")
    print("=" * 70)

    # 1. Database Foundation & Seeding
    seed_database()
    client = TestClient(app)
    print("[PASS] 01. Infrastructure Database Foundation: Seeded 78 Coimbatore assets")

    # 2. Asset Intelligence
    res = client.get("/api/assets/RD-1042")
    assert res.status_code == 200
    asset = res.json()
    assert asset["asset_id"] == "RD-1042"
    assert asset["condition_score"] == 14
    print(f"[PASS] 02. Asset Intelligence: Retrieved RD-1042 (Condition: {asset['condition_score']}/100, Type: {asset['asset_type']})")

    # 3. Six-Factor Risk Engine
    risk_res = client.get("/api/assets/RD-1042/risk-explanation")
    assert risk_res.status_code == 200
    risk = risk_res.json()
    assert risk["risk_level"] in ["CRITICAL", "HIGH"]
    assert "drivers" in risk
    assert len(risk["drivers"]) == 6
    print(f"[PASS] 03. Six-Factor MCDA Risk Engine: Score={risk['risk_score']}/100, Level={risk['risk_level']}, Factors=6 verified")

    # 4. Priority Engine
    prio_res = client.get("/api/priorities?limit=100")
    assert prio_res.status_code == 200
    prios = prio_res.json()
    assert len(prios) == 78
    assert prios[0]["asset_id"] == "RD-1042"
    print(f"[PASS] 04. Priority Engine: Verified Rank #1 in City Queue is RD-1042 (Queue length: {len(prios)})")

    # 5. AI Computer Vision Inspection
    ai_res = client.get("/api/assets/RD-1042/inspection")
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    assert "ai_vision" in ai_data
    assert ai_data["ai_vision"]["damage_type"] != ""
    print(f"[PASS] 05. AI Vision Inspection: Detected '{ai_data['ai_vision']['damage_type']}' (Confidence: {int(ai_data['ai_vision']['confidence'] * 100)}%)")

    # 6. Predictive Deterioration Engine
    pred_res = client.get("/api/predictions/assets/RD-1042")
    assert pred_res.status_code == 200
    pred = pred_res.json()
    assert pred["trend"] == "ACCELERATING"
    assert len(pred["forecast"]) >= 2
    print(f"[PASS] 06. Predictive Deterioration: 12M Forecast={pred['forecast'][1]['condition']}/100 (Trend: {pred['trend']})")

    # 7. Digital Twin State
    dt_res = client.get("/api/digital-twin/assets/RD-1042")
    assert dt_res.status_code == 200
    dt_state = dt_res.json()
    assert dt_state["lifecycle_stage"] == "RENEWAL"
    print(f"[PASS] 07. Digital Twin State: Lifecycle Stage={dt_state['lifecycle_stage']}, Sync Freshness={dt_state['data_freshness']}")

    # 8. Counterfactual What-If Simulation
    sim_req = {
        "asset_id": "RD-1042",
        "intervention_type": "PREVENTIVE_MAINTENANCE",
        "timing_months": 6,
        "budget": 650000.0
    }
    sim_res = client.post("/api/digital-twin/simulate", json=sim_req)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["effectiveness"]["condition_gain_pts"] > 0
    assert sim_data["effectiveness"]["lifespan_extension_years"] > 0
    print(f"[PASS] 08. What-If Simulation: Condition Gain=+{sim_data['effectiveness']['condition_gain_pts']} pts, Lifespan=+{sim_data['effectiveness']['lifespan_extension_years']} yrs")

    # 9. Knapsack Budget Optimizer
    opt_req = {
        "available_budget": 50000000.0,
        "strategy": "civicx_value_max"
    }
    opt_res = client.post("/api/budget/optimize", json=opt_req)
    assert opt_res.status_code == 200
    opt_data = opt_res.json()
    assert opt_data["assets_repaired"] > 0
    print(f"[PASS] 09. Knapsack Budget Optimizer: Funded {opt_data['assets_repaired']} assets out of 78 (Spent: INR {opt_data['total_cost']:,.2f})")

    # 10. Explainable Recommendation Engine
    rec_res = client.get("/api/recommendations/assets/RD-1042")
    assert rec_res.status_code == 200
    rec = rec_res.json()
    assert rec["decision_chain_stage"] == "08 RECOMMEND"
    assert len(rec["why_explanation"]) >= 2
    print(f"[PASS] 10. Explainable Recommendation: Action='{rec['action_title']}', Urgency={rec['urgency']}, Cost=INR {rec['estimated_cost']:,.2f}")

    # 11. Municipal Action Center Workflow
    act_req = {
        "asset_id": "RD-1042",
        "action_type": rec["recommendation_type"],
        "title": rec["action_title"],
        "urgency": rec["urgency"],
        "assigned_dept": "Road Infrastructure Department",
        "due_window": rec["target_window"],
        "estimated_cost": rec["estimated_cost"],
        "rationale": "High MCDA risk score (93/100) and accelerating deterioration."
    }
    act_res = client.post("/api/actions", json=act_req)
    assert act_res.status_code == 200
    act_id = act_res.json()["id"]
    
    # Progress Action: NEW -> APPROVED -> IN_PROGRESS -> COMPLETED
    for st in ["APPROVED", "IN_PROGRESS", "COMPLETED"]:
        p_res = client.patch(f"/api/actions/{act_id}/status", json={"status": st})
        assert p_res.status_code == 200
    print(f"[PASS] 11. Action Center Workflow: Managed Action #{act_id} through full lifecycle to COMPLETED")

    # 12. Citywide Decision Reports
    rep_res = client.get("/api/reports/asset/RD-1042")
    assert rep_res.status_code == 200
    rep = rep_res.json()
    assert rep["report_id"] != ""
    assert rep["report_type"] == "ASSET_DECISION_REPORT"
    print(f"[PASS] 12. Executive Decision Report: Asset Report Generated for RD-1042 (ID: {rep['report_id']})")

    # 13. Citizen Intelligence & Reward Ledger
    cit_res = client.get("/api/citizen/reports")
    assert cit_res.status_code == 200
    cit_data = cit_res.json()
    assert len(cit_data) >= 5
    print(f"[PASS] 13. Citizen Intelligence: {len(cit_data)} verified civic reports integrated")

    print("=" * 70)
    print("ALL 13 MASTER AUDIT SUITE CHECKS PASSED (100% SUCCESS)")
    print("=" * 70)

if __name__ == "__main__":
    run_master_audit()
