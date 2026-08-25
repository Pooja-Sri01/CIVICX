import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.seed.seed_runner import seed_database

def run_tests():
    seed_database()
    with TestClient(app) as client:
        print("=" * 60)
        print("Testing CIVICX API Endpoints (Citizen + Government Prompt 3)...")
        print("=" * 60)

        # 1. Health check
        res = client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[PASS] GET /api/health passed:", res.json())

        # 2. Get 78 Assets
        res = client.get("/api/assets")
        assert res.status_code == 200, f"Get assets failed: {res.text}"
        assets = res.json()
        assert len(assets) == 78, f"Expected 78 assets, got {len(assets)}"
        print(f"[PASS] GET /api/assets passed ({len(assets)} assets verified)")

        # 3. Get Citizen Reports
        res = client.get("/api/citizen/reports")
        assert res.status_code == 200, f"Get citizen reports failed: {res.text}"
        reports = res.json()
        print(f"[PASS] GET /api/citizen/reports passed ({len(reports)} initial seeded reports)")

        # 4. Submit a new citizen report
        new_report_payload = {
            "category": "Pothole",
            "description": "Deep cluster of active potholes near Gandhipuram bus stand causing axle stress and traffic bottleneck.",
            "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
            "latitude": 11.0170,
            "longitude": 76.9670,
            "location_name": "Gandhipuram Bus Station Corridor, Coimbatore",
            "zone": "Central Zone",
            "severity": "HIGH",
            "user_name": "Arun Kumar",
            "user_email": "arun.civic@gmail.com"
        }
        res = client.post("/api/citizen/reports", json=new_report_payload)
        assert res.status_code == 200, f"Submit citizen report failed: {res.text}"
        created = res.json()
        print(f"[PASS] POST /api/citizen/reports passed (Created {created['report_id']}, Score: {created['validation_score']}/100, Nearest Asset: {created['nearest_asset_id']}, Dist: {created['nearest_asset_distance_m']}m)")

        # 5. Get Civic Reports Stats (KPIs)
        res = client.get("/api/civic-reports/stats")
        assert res.status_code == 200, f"Get stats failed: {res.text}"
        stats = res.json()
        print(f"[PASS] GET /api/civic-reports/stats passed:", stats)

        # 6. Validate Report (/validate) -> +50 pts
        res = client.post(f"/api/civic-reports/{created['report_id']}/validate", json={
            "action_notes": "Screening confirmed by Municipal Works division.",
            "award_points": True
        })
        assert res.status_code == 200, f"Validate report failed: {res.text}"
        validated_rep = res.json()
        assert validated_rep["status"] == "VALIDATED"
        print(f"[PASS] POST /api/civic-reports/{created['report_id']}/validate passed")

        # 7. Assign Crew Workflow (/assign) -> +100 pts
        res = client.post(f"/api/civic-reports/{created['report_id']}/assign", json={
            "department": "Road Maintenance",
            "engineer": "Central Zone Rapid Response Crew",
            "priority": "HIGH",
            "target_date": "2026-08-28",
            "action_notes": "Dispatched emergency asphalt patching team."
        })
        assert res.status_code == 200, f"Assign crew failed: {res.text}"
        assigned_rep = res.json()
        assert assigned_rep["status"] == "ASSIGNED"
        assert assigned_rep["assigned_department"] == "Road Maintenance"
        print(f"[PASS] POST /api/civic-reports/{created['report_id']}/assign passed")

        # 8. Start Work (/start-work)
        res = client.post(f"/api/civic-reports/{created['report_id']}/start-work", json={
            "action_notes": "Field repair crew deployed and active on site."
        })
        assert res.status_code == 200, f"Start work failed: {res.text}"
        work_rep = res.json()
        assert work_rep["status"] == "IN_PROGRESS"
        print(f"[PASS] POST /api/civic-reports/{created['report_id']}/start-work passed")

        # 9. Mark Resolved (/resolve) -> +250 pts
        res = client.post(f"/api/civic-reports/{created['report_id']}/resolve", json={
            "resolution_description": "Road pothole cluster patched, leveled, and bitumen surface restored.",
            "resolved_date": "2026-08-25",
            "action_notes": "Patching work completed and verified on-site.",
            "award_points": True
        })
        assert res.status_code == 200, f"Resolve report failed: {res.text}"
        resolved_rep = res.json()
        assert resolved_rep["status"] == "RESOLVED"
        assert resolved_rep["resolution_description"] is not None
        print(f"[PASS] POST /api/civic-reports/{created['report_id']}/resolve passed")

        # 10. Audit Timeline (/timeline)
        res = client.get(f"/api/civic-reports/{created['report_id']}/timeline")
        assert res.status_code == 200, f"Get timeline failed: {res.text}"
        events = res.json()
        assert len(events) >= 4, f"Expected at least 4 audit events, got {len(events)}"
        print(f"[PASS] GET /api/civic-reports/{created['report_id']}/timeline passed ({len(events)} events)")

        # 11. Report Reward Breakdown (/reports/{id}/rewards) -> Total 410 pts
        res = client.get(f"/api/citizen/reports/{created['report_id']}/rewards")
        assert res.status_code == 200, f"Get report breakdown failed: {res.text}"
        breakdown = res.json()
        assert breakdown["total_earned"] == 410, f"Expected 410 pts, got {breakdown['total_earned']}"
        print(f"[PASS] GET /api/citizen/reports/{created['report_id']}/rewards passed (Total 410 pts: 10 + 50 + 100 + 250)")

        # 12. Citizen Wallet Summary (/rewards/wallet)
        res = client.get("/api/citizen/rewards/wallet")
        assert res.status_code == 200, f"Get wallet summary failed: {res.text}"
        wallet = res.json()
        assert "current_balance" in wallet
        assert "lifetime_earned" in wallet
        print(f"[PASS] GET /api/citizen/rewards/wallet passed (Balance: {wallet['current_balance']}, Lifetime: {wallet['lifetime_earned']})")

        # 13. Demo Redemption (/rewards/redeem)
        res = client.post("/api/citizen/rewards/redeem", json={"points": 1000})
        assert res.status_code == 200, f"Redeem points failed: {res.text}"
        redemption = res.json()
        assert redemption["success"] is True
        print(f"[PASS] POST /api/citizen/rewards/redeem passed (Redeemed: {redemption['points_redeemed']}, Remaining: {redemption['remaining_balance']})")

        # 14. Citizen Impact (/impact)
        res = client.get("/api/citizen/impact")
        assert res.status_code == 200, f"Get citizen impact failed: {res.text}"
        impact = res.json()
        assert "categories_contributed" in impact
        assert "contribution_journey" in impact
        print(f"[PASS] GET /api/citizen/impact passed ({len(impact['categories_contributed'])} categories, {len(impact['contribution_journey'])} journey events)")

        # 15. Leaderboard (/leaderboard)
        res = client.get("/api/citizen/leaderboard")
        assert res.status_code == 200, f"Get leaderboard failed: {res.text}"
        champions = res.json()
        print(f"[PASS] GET /api/citizen/leaderboard passed ({len(champions)} champions)")

        print("=" * 60)
        print("ALL PROMPT 3 CIVIC REWARDS & IMPACT TESTS PASSED SUCCESSFULLY!")
        print("=" * 60)

if __name__ == "__main__":
    run_tests()
