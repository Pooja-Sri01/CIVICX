import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import SessionLocal
from backend.app.models.models import Asset
from backend.seed.seed_runner import seed_database

def run_map_intelligence_tests():
    seed_database()
    with TestClient(app) as client:
        print("=" * 75)
        print("CIVICX PROMPT 6: MAP INTELLIGENCE & GIS SPATIAL TESTS")
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

        # 1. Test GET /api/map/intelligence (Consolidated GIS endpoint)
        res = client.get("/api/map/intelligence")
        assert res.status_code == 200, f"Map intelligence failed: {res.text}"
        data = res.json()
        assert "assets" in data
        assert "reports" in data
        assert "summary" in data
        assert len(data["assets"]) == 78
        assert len(data["reports"]) >= 5
        print(f"[PASS] 1. GET /api/map/intelligence: {len(data['assets'])} assets, {len(data['reports'])} reports")

        # 2. Test Asset Data Integrity on Map Payload
        first_asset = data["assets"][0]
        assert "asset_id" in first_asset
        assert "latitude" in first_asset
        assert "longitude" in first_asset
        assert "risk_score" in first_asset
        assert "risk_level" in first_asset
        assert "priority" in first_asset
        assert 10.9 <= first_asset["latitude"] <= 11.2
        assert 76.8 <= first_asset["longitude"] <= 77.1
        print(f"[PASS] 2. Verified asset geospatial payload ({first_asset['asset_id']} @ {first_asset['latitude']}, {first_asset['longitude']})")

        # 3. Test Citizen Report Data Integrity on Map Payload
        first_rep = data["reports"][0]
        assert "report_id" in first_rep
        assert "latitude" in first_rep
        assert "longitude" in first_rep
        assert "validation_score" in first_rep
        assert "status" in first_rep
        print(f"[PASS] 3. Verified citizen report geospatial payload ({first_rep['report_id']} - Score: {first_rep['validation_score']}/100)")

        # 4. Test Viewport Bounding Box Filtering
        res_bbox = client.get("/api/map/intelligence?north=11.03&south=11.00&east=76.98&west=76.95")
        assert res_bbox.status_code == 200
        bbox_data = res_bbox.json()
        assert len(bbox_data["assets"]) <= len(data["assets"])
        print(f"[PASS] 4. Viewport Bounding Box Filter: {len(bbox_data['assets'])} assets within bounding box")

        # 5. Verify Correlation between Report and Nearest Asset
        linked_reps = [r for r in data["reports"] if r.get("nearest_asset_id")]
        assert len(linked_reps) > 0
        target_rep = linked_reps[0]
        matched_asset = next((a for a in data["assets"] if a["asset_id"] == target_rep["nearest_asset_id"]), None)
        assert matched_asset is not None
        print(f"[PASS] 5. Verified correlation link: {target_rep['report_id']} -> {matched_asset['asset_id']} ({matched_asset['name']})")

        # 6. Verify Summary Counts
        summary = data["summary"]
        assert summary["total_assets"] == 78
        assert summary["total_reports"] >= 5
        assert summary["critical_assets"] >= 1
        assert summary["high_risk_assets"] >= 1
        print(f"[PASS] 6. Summary metrics verified: {summary}")

        # 7. Uncompromised MCDA Risk Score Isolation
        db = SessionLocal()
        try:
            asset_after = db.query(Asset).filter(Asset.asset_id == "RD-1042").first()
            assert asset_after.risk_score == initial_risk
            print(f"[PASS] 7. Official MCDA Risk Score remains strictly {asset_after.risk_score}/100 (Isolated from GIS visualizations)")
        finally:
            db.close()

        print("=" * 75)
        print("ALL PROMPT 6 MAP INTELLIGENCE & GIS TESTS PASSED 100%!")
        print("=" * 75)

if __name__ == "__main__":
    run_map_intelligence_tests()
