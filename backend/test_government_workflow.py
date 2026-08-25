import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import SessionLocal
from backend.app.models.models import Asset, CitizenReport, AuditEvent
from backend.seed.seed_runner import seed_database

def run_government_workflow_tests():
    seed_database()
    with TestClient(app) as client:
        print("=" * 75)
        print("CIVICX PROMPT 4: GOVERNMENT CIVIC INTELLIGENCE CENTER & WORKFLOW TESTS")
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

        # 1. Test Summary Endpoint
        res = client.get("/api/civic-reports/summary")
        assert res.status_code == 200, f"Summary failed: {res.text}"
        summary = res.json()
        assert "new_reports" in summary
        assert "under_review" in summary
        assert "validated" in summary
        assert "high_risk_linked" in summary
        assert "in_progress" in summary
        assert "resolved" in summary
        print(f"[PASS] 1. GET /api/civic-reports/summary: {summary}")

        # 2. Test Multi-Dimensional Filtering and Sorting
        res = client.get("/api/civic-reports?status=VALIDATED&sort=highest_risk")
        assert res.status_code == 200, f"Filter failed: {res.text}"
        validated_reps = res.json()
        print(f"[PASS] 2. GET /api/civic-reports with filters: Retrieved {len(validated_reps)} sorted validated reports")

        # 3. Create a New Report for Operational Workflow
        payload = {
            "category": "Pothole",
            "description": "Deep alligator cracking and asphalt rutting near junction.",
            "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
            "latitude": 11.0168,
            "longitude": 76.9673,
            "location_name": "Gandhipuram Underpass, Coimbatore",
            "zone": "Central Zone",
            "severity": "HIGH",
            "user_name": "Gov Workflow Tester",
            "user_email": "gov.tester@civicx.gov.in"
        }
        res = client.post("/api/citizen/reports", json=payload)
        assert res.status_code == 200
        rep_id = res.json()["report_id"]
        print(f"[PASS] 3. Created Report {rep_id} (Status: SUBMITTED)")

        # 4. Admin Detail Endpoint
        res_admin = client.get(f"/api/civic-reports/{rep_id}/admin")
        assert res_admin.status_code == 200, f"Admin detail failed: {res_admin.text}"
        admin_data = res_admin.json()
        assert admin_data["report"]["report_id"] == rep_id
        assert admin_data["linked_asset"] is not None
        assert admin_data["linked_asset"]["asset_id"] == "RD-1042"
        assert admin_data["decision_context"]["priority_rank"] == 1
        print(f"[PASS] 4. GET /api/civic-reports/{rep_id}/admin: Verified administrative decision intelligence for {admin_data['linked_asset']['name']}")

        # 5. Move SUBMITTED -> UNDER_REVIEW
        res = client.post(f"/api/civic-reports/{rep_id}/status", json={"status": "UNDER_REVIEW", "action_notes": "Operations console started review"})
        assert res.status_code == 200
        assert res.json()["status"] == "UNDER_REVIEW"
        print(f"[PASS] 5. Transitioned {rep_id} to UNDER_REVIEW")

        # 6. Validate Report (UNDER_REVIEW -> VALIDATED)
        res = client.post(f"/api/civic-reports/{rep_id}/validate", json={"action_notes": "Verified by Municipal Engineer"})
        assert res.status_code == 200
        assert res.json()["status"] == "VALIDATED"
        print(f"[PASS] 6. Validated {rep_id} (+50 pts awarded)")

        # 7. Prioritize Report (VALIDATED -> PRIORITIZED)
        res = client.post(f"/api/civic-reports/{rep_id}/prioritize", json={"priority": "HIGH", "action_notes": "High structural priority assigned"})
        assert res.status_code == 200
        assert res.json()["status"] == "PRIORITIZED"
        assert res.json()["priority"] == "HIGH"
        print(f"[PASS] 7. Prioritized {rep_id} to tier HIGH")

        # 8. Assign Report (PRIORITIZED -> ASSIGNED)
        assign_payload = {
            "department": "Road Maintenance",
            "engineer": "Central Zone Rapid Response Team",
            "priority": "HIGH",
            "target_date": "2026-08-29",
            "action_notes": "Dispatched field team"
        }
        res = client.post(f"/api/civic-reports/{rep_id}/assign", json=assign_payload)
        assert res.status_code == 200
        assert res.json()["status"] == "ASSIGNED"
        print(f"[PASS] 8. Assigned {rep_id} to Road Maintenance (+100 pts awarded)")

        # 9. Start Work (ASSIGNED -> IN_PROGRESS)
        res = client.post(f"/api/civic-reports/{rep_id}/start-work", json={"action_notes": "Asphalt crew on site"})
        assert res.status_code == 200
        assert res.json()["status"] == "IN_PROGRESS"
        print(f"[PASS] 9. Started work on {rep_id} (Status: IN_PROGRESS)")

        # 10. Resolve Report (IN_PROGRESS -> RESOLVED)
        res = client.post(f"/api/civic-reports/{rep_id}/resolve", json={"resolution_description": "Pothole filled and surface resurfaced to specification"})
        assert res.status_code == 200
        assert res.json()["status"] == "RESOLVED"
        assert res.json()["resolution_description"] is not None
        print(f"[PASS] 10. Resolved {rep_id} (+250 pts awarded)")

        # 11. Test Rejection Workflow on a New Report
        res = client.post("/api/citizen/reports", json=payload)
        rep2_id = res.json()["report_id"]
        res_rej = client.post(f"/api/civic-reports/{rep2_id}/reject", json={"reason": "Non-Infrastructure Issue", "action_notes": "Private driveway defect outside municipal mandate"})
        assert res_rej.status_code == 200
        assert res_rej.json()["status"] == "REJECTED"
        print(f"[PASS] 11. Rejected {rep2_id} with structured reason")

        # 12. Verify MCDA Risk Score Isolation
        db = SessionLocal()
        try:
            asset_after = db.query(Asset).filter(Asset.asset_id == "RD-1042").first()
            assert asset_after.risk_score == initial_risk
            print(f"[PASS] 12. MCDA Risk Score remains exactly {asset_after.risk_score}/100 (Uncompromised engineering isolation)")
        finally:
            db.close()

        print("=" * 75)
        print("ALL PROMPT 4 GOVERNMENT CIVIC INTELLIGENCE WORKFLOW TESTS PASSED 100%!")
        print("=" * 75)

if __name__ == "__main__":
    run_government_workflow_tests()
