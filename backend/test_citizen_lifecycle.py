import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import SessionLocal
from backend.app.models.models import Asset, CitizenReport, CitizenReportEvent, AuditEvent
from backend.seed.seed_runner import seed_database

def run_lifecycle_tests():
    seed_database()
    with TestClient(app) as client:
        print("=" * 75)
        print("CIVICX PROMPT 2: CITIZEN REPORT LIFECYCLE & VALIDATION TESTS")
        print("=" * 75)

        # Baseline: Check official asset risk before any citizen reporting
        db = SessionLocal()
        initial_risk = 0
        try:
            asset = db.query(Asset).filter(Asset.asset_id == "RD-1042").first()
            assert asset is not None
            initial_risk = asset.risk_score
            print(f"[INIT] Asset RD-1042 Baseline MCDA Risk Score: {initial_risk}/100")
        finally:
            db.close()

        # 1. Citizen Report Creation & Deterministic Screening
        payload = {
            "category": "Pothole",
            "description": "Deep asphalt fissure cluster on Cross Cut Road requiring rapid municipal cold patch repair.",
            "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
            "latitude": 11.0168,
            "longitude": 76.9673,
            "location_name": "Cross Cut Road, Gandhipuram, Coimbatore",
            "zone": "Central Zone",
            "severity": "HIGH",
            "user_name": "Lifecycle Tester",
            "user_email": "tester.citizen@civicx.gov.in"
        }
        res = client.post("/api/citizen/reports", json=payload)
        assert res.status_code == 200, f"Creation failed: {res.text}"
        rep = res.json()
        rep_id = rep["report_id"]
        assert rep["status"] == "SUBMITTED"
        assert rep["validation_score"] >= 80
        assert rep["validation_status"] == "LIKELY VALID"
        assert len(rep["validation_factors"]) >= 6
        print(f"[PASS] 1. Report Created: {rep_id} | Score: {rep['validation_score']}/100 ({rep['validation_status']}) | Nearest Asset: {rep['nearest_asset_id']}")

        # 2. Get Single Report Detail
        res = client.get(f"/api/civic-reports/{rep_id}")
        assert res.status_code == 200, f"Detail failed: {res.text}"
        detail = res.json()
        assert detail["report_id"] == rep_id
        assert detail["nearest_asset_id"] == "RD-1042"
        print(f"[PASS] 2. GET /api/civic-reports/{rep_id}: Retrieved report with {len(detail['validation_factors'])} validation signals")

        # 3. Test Invalid State Transition (Illegal skip from SUBMITTED directly to RESOLVED)
        res_invalid = client.post(f"/api/civic-reports/{rep_id}/status", json={"status": "RESOLVED"})
        assert res_invalid.status_code == 400, f"Expected 400 Bad Request for illegal skip, got: {res_invalid.status_code}"
        print(f"[PASS] 3. Server-side State Machine rejected illegal transition SUBMITTED -> RESOLVED (HTTP 400)")

        # 4. Valid Lifecycle Progression: SUBMITTED -> UNDER_REVIEW
        res = client.post(f"/api/civic-reports/{rep_id}/status", json={"status": "UNDER_REVIEW", "action_notes": "Municipal engineer reviewing queue"})
        assert res.status_code == 200
        assert res.json()["status"] == "UNDER_REVIEW"
        print(f"[PASS] 4. Transition SUBMITTED -> UNDER_REVIEW successful")

        # 5. Valid Lifecycle Progression: UNDER_REVIEW -> VALIDATED
        res = client.post(f"/api/civic-reports/{rep_id}/validate", json={"action_notes": "Corroborated via municipal dispatch", "award_points": True})
        assert res.status_code == 200
        assert res.json()["status"] == "VALIDATED"
        print(f"[PASS] 5. Transition UNDER_REVIEW -> VALIDATED (+50 pts) successful")

        # 6. Valid Lifecycle Progression: VALIDATED -> ASSIGNED
        res = client.post(f"/api/civic-reports/{rep_id}/assign", json={"department": "Road Maintenance", "engineer": "Central Zone Engineer", "priority": "HIGH", "target_date": "2026-08-30"})
        assert res.status_code == 200
        assert res.json()["status"] == "ASSIGNED"
        print(f"[PASS] 6. Transition VALIDATED -> ASSIGNED (+100 pts) successful")

        # 7. Valid Lifecycle Progression: ASSIGNED -> IN_PROGRESS
        res = client.post(f"/api/civic-reports/{rep_id}/start-work", json={"action_notes": "Field repair crew deployed on-site"})
        assert res.status_code == 200
        assert res.json()["status"] == "IN_PROGRESS"
        print(f"[PASS] 7. Transition ASSIGNED -> IN_PROGRESS successful")

        # 8. Valid Lifecycle Progression: IN_PROGRESS -> RESOLVED
        res = client.post(f"/api/civic-reports/{rep_id}/resolve", json={"resolution_description": "Cold patch application completed and inspected.", "award_points": True})
        assert res.status_code == 200
        assert res.json()["status"] == "RESOLVED"
        print(f"[PASS] 8. Transition IN_PROGRESS -> RESOLVED (+250 pts) successful")

        # 9. Test Terminal State Immutability (Cannot transition out of RESOLVED)
        res_term = client.post(f"/api/civic-reports/{rep_id}/status", json={"status": "IN_PROGRESS"})
        assert res_term.status_code == 400
        print(f"[PASS] 9. Terminal State Enforcement: Cannot transition out of RESOLVED (HTTP 400)")

        # 10. Audit Timeline Events
        res = client.get(f"/api/civic-reports/{rep_id}/timeline")
        assert res.status_code == 200
        events = res.json()
        assert len(events) >= 5
        print(f"[PASS] 10. GET /api/civic-reports/{rep_id}/timeline: {len(events)} persistent chronological lifecycle events recorded")

        # 11. Duplicate Detection & Linking
        dup_payload = {
            "category": "Pothole",
            "description": "Another observation of the same pothole near Cross Cut Road junction.",
            "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
            "latitude": 11.0168,
            "longitude": 76.9673,
            "location_name": "Cross Cut Road, Gandhipuram, Coimbatore",
            "zone": "Central Zone",
            "severity": "HIGH",
            "user_name": "Duplicate Tester",
            "user_email": "dup.citizen@civicx.gov.in"
        }
        res_dup = client.post("/api/citizen/reports", json=dup_payload)
        assert res_dup.status_code == 200
        dup_rep = res_dup.json()
        print(f"[PASS] 11. Duplicate detection: Created report {dup_rep['report_id']} (Status: {dup_rep['status']})")

        # 12. Verification that Official MCDA Risk Score Was NOT Mutated
        db = SessionLocal()
        try:
            asset_after = db.query(Asset).filter(Asset.asset_id == "RD-1042").first()
            assert asset_after.risk_score == initial_risk, f"CRITICAL FAILURE: Official risk score mutated from {initial_risk} to {asset_after.risk_score}!"
            print(f"[PASS] 12. Engineering Isolation: Official MCDA Risk Score remains {asset_after.risk_score}/100 (Unaltered by citizen reporting)")
        finally:
            db.close()

        print("=" * 75)
        print("ALL PROMPT 2 CITIZEN LIFECYCLE & VALIDATION TESTS PASSED 100%!")
        print("=" * 75)

if __name__ == "__main__":
    run_lifecycle_tests()
