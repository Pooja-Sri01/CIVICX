import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import SessionLocal
from backend.app.models.models import Asset, CitizenReport, AuditEvent
from backend.app.services.citizen_service import rank_and_match_asset
from backend.seed.seed_runner import seed_database

def run_asset_linking_tests():
    seed_database()
    with TestClient(app) as client:
        print("=" * 75)
        print("CIVICX PROMPT 3: CITIZEN -> ASSET LINKING & EVIDENCE INTEGRATION TESTS")
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

        # 1. Test Deterministic Asset Matching Algorithm
        db = SessionLocal()
        try:
            # Gandhipuram Underpass coordinates (near RD-1042)
            match = rank_and_match_asset(11.0168, 76.9673, "Pothole", db, max_radius_m=500.0)
            assert match["match_status"] == "POTENTIAL_MATCH"
            assert match["asset_id"] == "RD-1042"
            assert match["distance_m"] <= 500.0
            assert match["confidence"] >= 0.70
            print(f"[PASS] 1. rank_and_match_asset: Matched {match['asset_id']} (Distance: {match['distance_m']:.1f}m, Confidence: {match['confidence']}, Reason: {match['reason'][:60]}...)")

            # Out of bounds coordinates (10km away from any Coimbatore asset)
            match_out = rank_and_match_asset(11.5000, 77.5000, "Pothole", db, max_radius_m=500.0)
            assert match_out["match_status"] == "NO_ASSET_FOUND"
            assert match_out["asset_id"] is None
            print(f"[PASS] 2. Out-of-radius matching correctly returns NO_ASSET_FOUND (Closest dist: {match_out['distance_m']:.0f}m)")
        finally:
            db.close()

        # 2. Submit Report Near Asset RD-1042
        payload = {
            "category": "Pothole",
            "description": "Severe surface raveling and pothole on Gandhipuram Inbound corridor.",
            "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
            "latitude": 11.0168,
            "longitude": 76.9673,
            "location_name": "Gandhipuram Underpass, Coimbatore",
            "zone": "Central Zone",
            "severity": "HIGH",
            "user_name": "Asset Link Tester",
            "user_email": "linking.tester@civicx.gov.in"
        }
        res = client.post("/api/citizen/reports", json=payload)
        assert res.status_code == 200, f"Submit failed: {res.text}"
        rep = res.json()
        rep_id = rep["report_id"]
        assert rep["nearest_asset_id"] == "RD-1042"
        assert rep["asset_link_status"] == "POTENTIAL_MATCH"
        print(f"[PASS] 3. Citizen Report {rep_id} submitted with automatic asset link: {rep['nearest_asset_id']} (~{rep['nearest_asset_distance_m']:.0f}m)")

        # 3. GET /api/civic-reports/{report_id}/asset
        res = client.get(f"/api/civic-reports/{rep_id}/asset")
        assert res.status_code == 200, f"Get asset link failed: {res.text}"
        link_data = res.json()
        assert link_data["report_id"] == rep_id
        assert link_data["asset"]["asset_id"] == "RD-1042"
        assert link_data["match_status"] == "POTENTIAL_MATCH"
        print(f"[PASS] 4. GET /api/civic-reports/{rep_id}/asset: Verified linked asset payload for {link_data['asset']['name']}")

        # 4. Manual Government Asset Link Override
        override_payload = {
            "asset_id": "BR-2019",
            "action_notes": "Re-associated with Peelamedu Rail Overbridge after structural site survey"
        }
        res_link = client.post(f"/api/civic-reports/{rep_id}/link-asset", json=override_payload)
        assert res_link.status_code == 200, f"Manual link failed: {res_link.text}"
        updated_rep = res_link.json()
        assert updated_rep["nearest_asset_id"] == "BR-2019"
        assert updated_rep["asset_link_status"] == "MANUALLY_LINKED"
        print(f"[PASS] 5. POST /api/civic-reports/{rep_id}/link-asset: Successfully overridden to {updated_rep['nearest_asset_id']} (Status: {updated_rep['asset_link_status']})")

        # 5. GET /api/assets/{asset_id}/civic-reports
        res_evidence = client.get("/api/assets/BR-2019/civic-reports")
        assert res_evidence.status_code == 200, f"Asset civic reports failed: {res_evidence.text}"
        evidence = res_evidence.json()
        assert evidence["asset_id"] == "BR-2019"
        assert evidence["total_reports"] >= 1
        print(f"[PASS] 6. GET /api/assets/BR-2019/civic-reports: {evidence['total_reports']} citizen evidence reports linked to asset corridor")

        # 6. Verify Official MCDA Risk Score Remains Unaltered
        db = SessionLocal()
        try:
            asset_after = db.query(Asset).filter(Asset.asset_id == "RD-1042").first()
            assert asset_after.risk_score == initial_risk, f"CRITICAL FAILURE: Official risk score mutated from {initial_risk} to {asset_after.risk_score}!"
            print(f"[PASS] 7. Official MCDA Risk Score remains exactly {asset_after.risk_score}/100 (Zero risk engine pollution)")
        finally:
            db.close()

        print("=" * 75)
        print("ALL PROMPT 3 CITIZEN -> ASSET LINKING TESTS PASSED 100%!")
        print("=" * 75)

if __name__ == "__main__":
    run_asset_linking_tests()
