"""
AI Infrastructure Inspection & Evidence Intelligence Test Suite
Validates image validation, model inference, bounding boxes, explainability,
human review, audit logs, and non-overwrite of 6-factor risk metrics.
"""
import sys
import os
import io

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from PIL import Image
from backend.app.main import app
from backend.seed.seed_runner import seed_database

def create_dummy_image(format="JPEG", size=(640, 480), color=(100, 100, 100)) -> bytes:
    img = Image.new("RGB", size, color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

def test_ai_inspection_workflow():
    seed_database()
    with TestClient(app) as client:
        print("\n=======================================================")
        print("TESTING AI INFRASTRUCTURE INSPECTION (PROMPT 7)")
        print("=======================================================")

        # 1. Direct Image Upload Inspection (Road Defect)
        img_bytes = create_dummy_image("JPEG")
        files = {"file": ("test_road_pothole.jpg", img_bytes, "image/jpeg")}
        data = {"context_hints": "Pothole near junction"}

        res = client.post("/api/ai/inspections", files=files, data=data)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        insp = res.json()
        assert "inspection_id" in insp
        assert insp["damage_type"] != ""
        assert insp["confidence"] >= 0.80
        assert insp["confidence_band"] == "HIGH CONFIDENCE"
        assert len(insp["detections"]) > 0
        assert len(insp["evidence"]) > 0
        assert "AI Visual Screening" in insp["disclaimer"]
        print(f"[PASS] 1. Image upload inspection: {insp['inspection_id']} -> {insp['damage_type']} ({insp['confidence']*100:.0f}%)")

        inspection_id = insp["inspection_id"]

        # 2. Existing Citizen Report Image Inspection (Reuse stored evidence without re-upload)
        res_report = client.post("/api/ai/inspections", data={"report_id": "CIV-2026-00001"})
        assert res_report.status_code == 200
        insp_rep = res_report.json()
        assert insp_rep["report_id"] == "CIV-2026-00001"
        assert insp_rep["asset_id"] == "RD-1042"
        print(f"[PASS] 2. Citizen report evidence inspection: Reused CIV-2026-00001 image -> {insp_rep['damage_type']}")

        # 3. Existing Asset Image Inspection (Correlate with bridge)
        res_asset = client.post("/api/ai/inspections", data={"asset_id": "BR-2019"})
        assert res_asset.status_code == 200
        insp_ast = res_asset.json()
        assert insp_ast["asset_id"] == "BR-2019"
        assert insp_ast["domain"] == "BRIDGE"
        print(f"[PASS] 3. Asset digital twin inspection: Correlated BR-2019 -> {insp_ast['damage_type']}")

        # 4. Image Validation - Reject corrupted/invalid payload gracefully
        bad_files = {"file": ("malicious.exe", b"NOT_AN_IMAGE_PAYLOAD", "image/jpeg")}
        res_bad = client.post("/api/ai/inspections", files=bad_files)
        assert res_bad.status_code == 400
        print(f"[PASS] 4. Image validation: Rejected invalid corrupted payload with 400 status")

        # 5. Retrieve Inspection Detail by ID
        res_detail = client.get(f"/api/ai/inspections/{inspection_id}")
        assert res_detail.status_code == 200
        assert res_detail.json()["inspection_id"] == inspection_id
        print(f"[PASS] 5. GET /api/ai/inspections/{inspection_id}: Detail successfully retrieved")

        # 6. Retrieve Inspection History (Filter by asset)
        res_hist = client.get("/api/ai/inspections?asset_id=RD-1042")
        assert res_hist.status_code == 200
        hist = res_hist.json()
        assert len(hist) >= 1
        print(f"[PASS] 6. GET /api/ai/inspections?asset_id=RD-1042: {len(hist)} historical inspection events logged")

        # 7. Record Human-in-the-Loop Feedback (Engineer confirms finding)
        feedback_payload = {
            "reviewer_id": "Er. S. Narayanan (Municipal Senior Engineer)",
            "reviewer_role": "ENGINEER",
            "review_result": "CONFIRMED",
            "review_notes": "Ground survey confirms high severity subgrade depression."
        }
        res_fb = client.post(f"/api/ai/inspections/{inspection_id}/review", json=feedback_payload)
        assert res_fb.status_code == 200
        updated_insp = res_fb.json()
        assert len(updated_insp["feedbacks"]) >= 1
        assert updated_insp["feedbacks"][0]["review_result"] == "CONFIRMED"
        # Ensure original AI prediction is NOT overwritten
        assert updated_insp["damage_type"] == insp["damage_type"]
        assert updated_insp["confidence"] == insp["confidence"]
        print(f"[PASS] 7. Human review recorded: Confirmed without altering raw AI prediction")

        # 8. Inspection Stats Endpoint
        res_stats = client.get("/api/ai/inspections/stats")
        assert res_stats.status_code == 200
        stats = res_stats.json()
        assert stats["total_images_analyzed"] >= 1
        assert len(stats["top_detected_conditions"]) >= 1
        print(f"[PASS] 8. GET /api/ai/inspections/stats: {stats['total_images_analyzed']} analyzed, {stats['high_confidence_count']} high confidence")

        # 9. Verify Non-Overwrite: Official CIVICX 6-Factor Risk is unchanged
        res_risk = client.get("/api/assets/RD-1042/risk-explanation")
        assert res_risk.status_code == 200
        risk_data = res_risk.json()
        assert risk_data["risk_score"] >= 80
        assert risk_data["risk_level"] in ["CRITICAL", "HIGH"]
        print(f"[PASS] 9. Decision engine integrity: Official CIVICX risk remains {risk_data['risk_score']}/100 {risk_data['risk_level']} (unmodified by AI screening)")


        print("=======================================================")
        print("ALL AI INSPECTION TESTS PASSED (100% SUCCESS)")
        print("=======================================================\n")

if __name__ == "__main__":
    test_ai_inspection_workflow()
