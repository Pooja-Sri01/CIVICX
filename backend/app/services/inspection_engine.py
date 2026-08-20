"""
Inspection Engine Service
Integrates the damage detector interface into the CivicX backend API workflow.
"""
from typing import Dict, Any, Optional
from ml.inference.damage_detector import detect_damage

class InspectionEngine:
    @staticmethod
    def analyze_asset_image(asset_id: Optional[str], image_url: Optional[str]) -> Dict[str, Any]:
        detection_result = detect_damage(image_url or asset_id)
        return {
            "assetId": asset_id,
            "imageUrl": image_url,
            "visionAnalysis": detection_result,
            "aiRecommendation": "High priority intervention required. Resurfacing recommended to prevent baseline water ingress."
        }
