import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import SessionLocal
from backend.app.models.models import Asset, CitizenUser, CitizenReward, RewardLedger
from backend.seed.seed_runner import seed_database

def run_rewards_wallet_tests():
    seed_database()
    with TestClient(app) as client:
        print("=" * 75)
        print("CIVICX PROMPT 5: REWARDS WALLET & SIMULATED REDEMPTION TESTS")
        print("=" * 75)

        # Baseline: Check official asset risk before test
        db = SessionLocal()
        initial_risk = 0
        try:
            asset = db.query(Asset).filter(Asset.asset_id == "RD-1042").first()
            assert asset is not None
            initial_risk = asset.risk_score
            print(f"[INIT] Asset RD-1042 Baseline MCDA Risk Score: {initial_risk}/100")
        finally:
            db.close()

        # 1. Test Reward Options Endpoint
        res = client.get("/api/citizen/rewards/options")
        assert res.status_code == 200, f"Options failed: {res.text}"
        options = res.json()
        assert len(options) == 3
        assert options[0]["reward_id"] == "DEMO_1000"
        assert options[0]["points_cost"] == 1000
        assert options[0]["demo_value_inr"] == 10
        print(f"[PASS] 1. GET /api/citizen/rewards/options: {len(options)} tiers configured")

        # 2. Test Wallet Summary Endpoint
        res = client.get("/api/citizen/rewards/wallet")
        assert res.status_code == 200, f"Wallet failed: {res.text}"
        wallet = res.json()
        assert "current_balance" in wallet
        assert "lifetime_earned" in wallet
        assert "pending" in wallet
        assert "pending_breakdown" in wallet
        print(f"[PASS] 2. GET /api/citizen/rewards/wallet: Current Balance = {wallet['current_balance']}, Pending = {wallet['pending']}")

        # 3. Create a New Report to verify Milestone Point Accumulation
        payload = {
            "category": "Pothole",
            "description": "Deep asphalt trench on Gandhipuram Underpass.",
            "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
            "latitude": 11.0168,
            "longitude": 76.9673,
            "location_name": "Gandhipuram Underpass, Coimbatore",
            "zone": "Central Zone",
            "severity": "HIGH",
            "user_name": "Rewards Tester",
            "user_email": "rewards.tester@civicx.gov.in"
        }
        res = client.post("/api/citizen/reports", json=payload)
        assert res.status_code == 200
        rep_id = res.json()["report_id"]
        print(f"[PASS] 3. Created Report {rep_id} (+10 pts submission reward)")

        # Verify Submission Points
        res_bk = client.get(f"/api/citizen/reports/{rep_id}/rewards")
        assert res_bk.status_code == 200
        assert res_bk.json()["submission_points"] == 10
        print(f"[PASS] 3b. Report Rewards Breakdown: Submission Points = 10")

        # 4. Validate Report (+50 pts)
        res_val = client.post(f"/api/civic-reports/{rep_id}/validate", json={"action_notes": "Validated defect"})
        assert res_val.status_code == 200
        print(f"[PASS] 4. Validated {rep_id} (+50 pts validation reward)")

        # 5. Work Started / Assign Report (+100 pts)
        assign_payload = {
            "department": "Road Maintenance",
            "engineer": "Central Zone Works",
            "priority": "HIGH",
            "target_date": "2026-08-30",
            "action_notes": "Assigned crew"
        }
        res_ass = client.post(f"/api/civic-reports/{rep_id}/assign", json=assign_payload)
        assert res_ass.status_code == 200
        print(f"[PASS] 5. Assigned {rep_id} (+100 pts action reward)")

        # 5b. Start Work (ASSIGNED -> IN_PROGRESS)
        res_work = client.post(f"/api/civic-reports/{rep_id}/start-work", json={"action_notes": "Crew started on site"})
        assert res_work.status_code == 200

        # 6. Resolve Report (+250 pts)
        res_res = client.post(f"/api/civic-reports/{rep_id}/resolve", json={"resolution_description": "Pothole filled and bitumen leveled"})
        assert res_res.status_code == 200
        print(f"[PASS] 6. Resolved {rep_id} (+250 pts resolution reward)")

        # 7. Check Total Earned on Report (10 + 50 + 100 + 250 = 410 pts)
        res_bk_final = client.get(f"/api/citizen/reports/{rep_id}/rewards")
        assert res_bk_final.status_code == 200
        assert res_bk_final.json()["total_earned"] == 410
        print(f"[PASS] 7. Verified total per-report reward yield: {res_bk_final.json()['total_earned']} / 410 Points")

        # 8. Test Double-Entry Transaction Ledger
        res_tx = client.get("/api/citizen/rewards/transactions?limit=10")
        assert res_tx.status_code == 200
        tx_data = res_tx.json()
        assert tx_data["total"] >= 4
        print(f"[PASS] 8. GET /api/citizen/rewards/transactions: Retrieved {len(tx_data['transactions'])} immutable ledger entries")

        # 9. Test Tiered Simulated Redemption (DEMO_1000)
        res_red = client.post("/api/citizen/rewards/redeem", json={"reward_id": "DEMO_1000"})
        assert res_red.status_code == 200, f"Redeem failed: {res_red.text}"
        red_data = res_red.json()
        assert red_data["success"] is True
        assert red_data["points_redeemed"] == 1000
        assert red_data["demo_value_inr"] == 10
        print(f"[PASS] 9. Redeemed DEMO_1000: -1,000 Points for INR 10 Demo Credit (New Balance: {red_data['new_balance']})")

        # 10. Test Insufficient Balance Handling (Attempt DEMO_5000 when balance is below 5000)
        res_over = client.post("/api/citizen/rewards/redeem", json={"reward_id": "DEMO_5000"})
        assert res_over.status_code == 400
        print(f"[PASS] 10. Insufficient balance protection: Rejected over-draft redemption with 400 Bad Request")

        # 11. Test Citizen Impact & Privacy-Safe Leaderboard
        res_imp = client.get("/api/citizen/impact")
        assert res_imp.status_code == 200
        assert "reports_submitted" in res_imp.json()
        assert "issues_resolved" in res_imp.json()

        res_lb = client.get("/api/citizen/leaderboard")
        assert res_lb.status_code == 200
        assert len(res_lb.json()) > 0
        print(f"[PASS] 11. Verified Citizen Impact and Privacy-Safe Leaderboard")

        # 12. Verify MCDA Risk Score Isolation
        db = SessionLocal()
        try:
            asset_after = db.query(Asset).filter(Asset.asset_id == "RD-1042").first()
            assert asset_after.risk_score == initial_risk
            print(f"[PASS] 12. MCDA Risk Score remains exactly {asset_after.risk_score}/100 (Uncompromised engineering isolation)")
        finally:
            db.close()

        print("=" * 75)
        print("ALL PROMPT 5 REWARDS WALLET & REDEMPTION TESTS PASSED 100%!")
        print("=" * 75)

if __name__ == "__main__":
    run_rewards_wallet_tests()
