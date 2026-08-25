"""
Automated Test Suite for CIVICX Executive Decision Center & Recommendations (Prompt 10)
Tests Explainable Recommendation Engine, Citywide Decision Summary (Attention vs Monitor),
and Municipal Action Center workflow.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.seed.seed_runner import seed_database

def run_executive_decision_tests():
    print("=" * 65)
    print("TESTING CIVICX EXECUTIVE DECISION CENTER & RECOMMENDATIONS (PROMPT 10)")
    print("=" * 65)

    seed_database()
    client = TestClient(app)

    # 1. Test Single Asset Recommendation (RD-1042)
    res = client.get("/api/recommendations/assets/RD-1042")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    rec = res.json()
    assert rec["asset_id"] == "RD-1042"
    assert rec["recommendation_type"] in ["REHABILITATE", "RECONSTRUCT", "PREVENTIVE_MAINTENANCE"]
    assert rec["urgency"] in ["CRITICAL", "HIGH"]
    assert len(rec["why_explanation"]) >= 2
    assert rec["decision_chain_stage"] == "08 RECOMMEND"
    print(f"[PASS] 1. RD-1042 Recommendation: Type={rec['recommendation_type']}, Title='{rec['action_title']}', Urgency={rec['urgency']}, Cost=INR {rec['estimated_cost']:,.2f}")

    # 2. Test Low-Data Honest Handling (Non-Existent / Low Baseline Asset)
    low_res = client.get("/api/recommendations/assets/NON-EXISTENT-XYZ")
    assert low_res.status_code == 200
    low_data = low_res.json()
    assert low_data["recommendation_type"] == "INSPECT"
    assert low_data["decision_confidence"] == "LOW"
    print(f"[PASS] 2. Low-Data Asset Recommendation: Type={low_data['recommendation_type']}, Confidence={low_data['decision_confidence']}")

    # 3. Test Citywide Recommendations Summary
    sum_res = client.get("/api/recommendations/city-summary")
    assert sum_res.status_code == 200
    city_sum = sum_res.json()
    assert city_sum["total_evaluated"] == 78
    assert len(city_sum["attention_required"]) > 0
    assert len(city_sum["can_wait_monitor"]) > 0
    print(f"[PASS] 3. Citywide Summary: Evaluated={city_sum['total_evaluated']} | Attention Required={len(city_sum['attention_required'])} | Can Wait (Monitor)={len(city_sum['can_wait_monitor'])} | Total Recommended Budget=INR {city_sum['total_recommended_budget']:,.2f}")

    # 4. Test Municipal Action Creation (POST /api/actions)
    act_payload = {
        "asset_id": "RD-1042",
        "action_type": rec["recommendation_type"],
        "title": rec["action_title"],
        "urgency": rec["urgency"],
        "assigned_dept": "Road Infrastructure Department",
        "due_window": rec["target_window"],
        "estimated_cost": rec["estimated_cost"],
        "rationale": "High MCDA risk score (93/100) and accelerating deterioration rate."
    }
    act_res = client.post("/api/actions", json=act_payload)
    assert act_res.status_code == 200
    act_item = act_res.json()
    action_id = act_item["id"]
    assert act_item["status"] == "NEW"
    print(f"[PASS] 4. Municipal Action Created: ID #{action_id} for RD-1042 (Status={act_item['status']})")

    # 5. Test Action List (GET /api/actions)
    list_res = client.get("/api/actions?asset_id=RD-1042")
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(i["id"] == action_id for i in items)
    print(f"[PASS] 5. Queried Actions: Found {len(items)} action items for RD-1042")

    # 6. Test Action Status Progression (PATCH /api/actions/{id}/status)
    for next_status in ["APPROVED", "IN_PROGRESS", "COMPLETED"]:
        p_res = client.patch(f"/api/actions/{action_id}/status", json={"status": next_status})
        assert p_res.status_code == 200
        p_obj = p_res.json()
        assert p_obj["status"] == next_status
    print(f"[PASS] 6. Action Workflow Lifecycle: Progressed #{action_id} from NEW -> APPROVED -> IN_PROGRESS -> COMPLETED")

    print("=" * 65)
    print("ALL EXECUTIVE DECISION CENTER TESTS PASSED (100% SUCCESS)")
    print("=" * 65)

if __name__ == "__main__":
    run_executive_decision_tests()
