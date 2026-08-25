import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.seed.seed_runner import seed_database

def run_regression_tests():
    seed_database()
    with TestClient(app) as client:
        print("=" * 70)
        print("CIVICX FULL QA & REGRESSION TEST SUITE (PHASE 5)")
        print("=" * 70)

        # 1. Health check
        res = client.get("/api/health")
        assert res.status_code == 200, f"Health failed: {res.text}"
        data = res.json()
        assert data["status"] == "online"
        assert data["database"] == "connected"
        print("[PASS] 1. GET /api/health:", data["status"], "| Platform:", data["platform"])

        # 2. Dashboard Summary
        res = client.get("/api/dashboard/summary")
        assert res.status_code == 200, f"Dashboard summary failed: {res.text}"
        summary = res.json()
        assert summary["total_assets"] == 78
        print(f"[PASS] 2. GET /api/dashboard/summary: {summary['total_assets']} assets, Critical: {summary['critical_assets']}, Avg Risk: {summary['average_risk']:.1f}")

        # 3. Dashboard Data Health
        res = client.get("/api/dashboard/data-health")
        assert res.status_code == 200, f"Data health failed: {res.text}"
        health_data = res.json()
        print(f"[PASS] 3. GET /api/dashboard/data-health: Health Score {health_data['health_score']}%, Freshness {health_data['data_freshness_pct']}%")

        # 4. Assets List
        res = client.get("/api/assets")
        assert res.status_code == 200, f"Get assets failed: {res.text}"
        assets = res.json()
        assert len(assets) == 78, f"Expected 78 assets, got {len(assets)}"
        print(f"[PASS] 4. GET /api/assets: Verified {len(assets)} infrastructure assets")

        # 5. Asset Detail (RD-1042)
        res = client.get("/api/assets/RD-1042")
        assert res.status_code == 200, f"Asset detail failed: {res.text}"
        asset_detail = res.json()
        assert asset_detail["asset_id"] == "RD-1042"
        assert "risk_score" in asset_detail
        print(f"[PASS] 5. GET /api/assets/RD-1042: {asset_detail['name']}, Risk: {asset_detail['risk_score']}/100, Action: {asset_detail['recommended_action']}")

        # 6. Priorities Engine
        res = client.get("/api/priorities?limit=100")
        assert res.status_code == 200, f"Priorities failed: {res.text}"
        priorities_data = res.json()
        assert len(priorities_data) == 78
        print(f"[PASS] 6. GET /api/priorities: Top Priority Asset is {priorities_data[0]['asset_id']} (Rank #1, Risk {priorities_data[0]['risk_score']})")

        # 7. Budget Optimizer
        res = client.post("/api/budget/optimize", json={"available_budget": 50000000})
        assert res.status_code == 200, f"Budget optimize failed: {res.text}"
        budget_res = res.json()
        assert "selected_assets" in budget_res
        print(f"[PASS] 7. POST /api/budget/optimize: Funded {len(budget_res['selected_assets'])} assets, Total Cost: INR {budget_res['total_cost']:,.2f}")

        # 8. Budget Scenarios
        res = client.get("/api/budget/scenarios")
        assert res.status_code == 200, f"Budget scenarios failed: {res.text}"
        scenarios = res.json()
        print(f"[PASS] 8. GET /api/budget/scenarios: {len(scenarios)} scenarios generated")

        # 9. Simulation Run
        res = client.post("/api/simulation/run", json={"asset_id": "RD-1042"})
        assert res.status_code == 200, f"Simulation run failed: {res.text}"
        sim = res.json()
        assert "horizons" in sim
        print(f"[PASS] 9. POST /api/simulation/run: 5-year simulation generated {len(sim.get('yearly_timeline', []))} timeline points for RD-1042")

        # 10. Simulation Portfolio
        res = client.post("/api/simulation/portfolio")
        assert res.status_code == 200, f"Portfolio simulation failed: {res.text}"
        portfolio_sim = res.json()
        assert portfolio_sim["total_assets_simulated"] == 78
        print(f"[PASS] 10. POST /api/simulation/portfolio: Portfolio simulation completed ({portfolio_sim['total_assets_simulated']} assets)")

        # 11. Reports List & Generation
        res = client.get("/api/reports/asset/RD-1042")
        assert res.status_code == 200, f"Get asset report failed: {res.text}"
        rep_data = res.json()
        assert "decision_recommendation" in rep_data
        print(f"[PASS] 11. GET /api/reports/asset/RD-1042: Formal Decision Report generated (Verdict: {rep_data['decision_recommendation']['verdict']})")

        res_p = client.get("/api/reports/portfolio")
        assert res_p.status_code == 200, f"Get portfolio report failed: {res_p.text}"
        print("[PASS] 11b. GET /api/reports/portfolio: Citywide Portfolio Decision Report generated")

        # 12. Copilot Query
        res = client.post("/api/copilot/chat", json={"message": "What is the most critical asset in Central Zone?"})
        assert res.status_code == 200, f"Copilot chat failed: {res.text}"
        copilot_res = res.json()
        assert "answer" in copilot_res
        print(f"[PASS] 12. POST /api/copilot/chat: Grounded response received ({len(copilot_res['answer'])} chars)")

        # 13. Citizen Portal & Reports List
        res = client.get("/api/citizen/reports")
        assert res.status_code == 200, f"Get citizen reports failed: {res.text}"
        init_citizen_reports = res.json()
        print(f"[PASS] 13. GET /api/citizen/reports: {len(init_citizen_reports)} initial citizen reports")

        # 14. Citizen Report Submission & Deterministic Screening
        new_report = {
            "category": "Pothole",
            "description": "Deep asphalt crater cluster near Gandhipuram junction causing traffic bottleneck.",
            "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
            "latitude": 11.0170,
            "longitude": 76.9670,
            "location_name": "Gandhipuram Bus Station Corridor, Coimbatore",
            "zone": "Central Zone",
            "severity": "HIGH",
            "user_name": "Arun Kumar",
            "user_email": "arun.civic@gmail.com"
        }
        res = client.post("/api/citizen/reports", json=new_report)
        assert res.status_code == 200, f"Submit citizen report failed: {res.text}"
        created_report = res.json()
        rep_id = created_report["report_id"]
        assert created_report["status"] == "SUBMITTED"
        assert created_report["nearest_asset_id"] is not None
        print(f"[PASS] 14. POST /api/citizen/reports: Created {rep_id} (Score: {created_report['validation_score']}/100, Nearest Asset: {created_report['nearest_asset_id']})")

        # 15. Government Civic Reports Console Stats
        res = client.get("/api/civic-reports/stats")
        assert res.status_code == 200, f"Civic reports stats failed: {res.text}"
        civic_stats = res.json()
        print(f"[PASS] 15. GET /api/civic-reports/stats:", civic_stats)

        # 16. Government Validation (+50 pts)
        res = client.post(f"/api/civic-reports/{rep_id}/validate", json={
            "action_notes": "Deterministic screening confirmed by Municipal Engineering Division.",
            "award_points": True
        })
        assert res.status_code == 200, f"Validation failed: {res.text}"
        val_rep = res.json()
        assert val_rep["status"] == "VALIDATED"
        print(f"[PASS] 16. POST /api/civic-reports/{rep_id}/validate: Status is VALIDATED (+50 pts)")

        # 17. Government Assignment (+100 pts)
        res = client.post(f"/api/civic-reports/{rep_id}/assign", json={
            "department": "Road Maintenance",
            "engineer": "Central Zone Rapid Response Crew",
            "priority": "HIGH",
            "target_date": "2026-08-28",
            "action_notes": "Dispatched emergency asphalt patching team."
        })
        assert res.status_code == 200, f"Assignment failed: {res.text}"
        assign_rep = res.json()
        assert assign_rep["status"] == "ASSIGNED"
        print(f"[PASS] 17. POST /api/civic-reports/{rep_id}/assign: Assigned to {assign_rep['assigned_department']} (+100 pts)")

        # 18. Government Start Work
        res = client.post(f"/api/civic-reports/{rep_id}/start-work", json={
            "action_notes": "Patching crew deployed on site."
        })
        assert res.status_code == 200, f"Start work failed: {res.text}"
        in_prog_rep = res.json()
        assert in_prog_rep["status"] == "IN_PROGRESS"
        print(f"[PASS] 18. POST /api/civic-reports/{rep_id}/start-work: Status is IN_PROGRESS")

        # 19. Government Resolution (+250 pts)
        res = client.post(f"/api/civic-reports/{rep_id}/resolve", json={
            "resolution_description": "Road surface leveled, compacted, and hot-mix bitumen overlay applied.",
            "resolved_date": "2026-08-25",
            "action_notes": "Field repairs completed and verified with photographic audit.",
            "award_points": True
        })
        assert res.status_code == 200, f"Resolution failed: {res.text}"
        resolved_rep = res.json()
        assert resolved_rep["status"] == "RESOLVED"
        print(f"[PASS] 19. POST /api/civic-reports/{rep_id}/resolve: Status is RESOLVED (+250 pts)")

        # 20. Lifecycle Reward Breakdown (+10 + 50 + 100 + 250 = 410 pts)
        res = client.get(f"/api/citizen/reports/{rep_id}/rewards")
        assert res.status_code == 200, f"Reward breakdown failed: {res.text}"
        breakdown = res.json()
        assert breakdown["total_earned"] == 410, f"Expected 410 pts, got {breakdown['total_earned']}"
        print(f"[PASS] 20. GET /api/citizen/reports/{rep_id}/rewards: Total 410 pts (Submission: 10, Validation: 50, Action: 100, Resolution: 250)")

        # 21. Citizen Wallet & Balance
        res = client.get("/api/citizen/rewards/wallet")
        assert res.status_code == 200, f"Wallet failed: {res.text}"
        wallet = res.json()
        print(f"[PASS] 21. GET /api/citizen/rewards/wallet: Current Balance = {wallet['current_balance']} CIVICX Points")

        # 22. Prototype Redemption
        res = client.post("/api/citizen/rewards/redeem", json={"points": 1000})
        assert res.status_code == 200, f"Redemption failed: {res.text}"
        redeem_res = res.json()
        assert redeem_res["success"] is True
        print(f"[PASS] 22. POST /api/citizen/rewards/redeem: Redeemed 1,000 pts (Remaining: {redeem_res['remaining_balance']} pts)")

        # 23. Citizen Impact Dashboard Data
        res = client.get("/api/citizen/impact")
        assert res.status_code == 200, f"Impact failed: {res.text}"
        impact_data = res.json()
        assert len(impact_data["categories_contributed"]) > 0
        assert len(impact_data["contribution_journey"]) > 0
        print(f"[PASS] 23. GET /api/citizen/impact: {len(impact_data['categories_contributed'])} categories, {len(impact_data['contribution_journey'])} journey events")

        # 24. Civic Champions Leaderboard
        res = client.get("/api/citizen/leaderboard")
        assert res.status_code == 200, f"Leaderboard failed: {res.text}"
        champions = res.json()
        assert len(champions) >= 5
        print(f"[PASS] 24. GET /api/citizen/leaderboard: {len(champions)} champions ranked")

        print("=" * 70)
        print("ALL 24 REGRESSION & QA TESTS PASSED WITH 100% SUCCESS!")
        print("=" * 70)

if __name__ == "__main__":
    run_regression_tests()
