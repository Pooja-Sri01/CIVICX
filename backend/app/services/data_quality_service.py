import datetime
from typing import Dict, Any, List
from backend.app.models.models import Asset
from backend.app.services.spatial_service import SpatialService

class DataQualityService:
    """
    Deterministic enterprise data quality evaluation engine.
    Audits asset inventory and citizen telemetry for data integrity.
    """
    @staticmethod
    def audit_asset(asset: Asset) -> Dict[str, Any]:
        issues: List[str] = []
        status = "VALID"

        # 1. Coordinate check
        if not (asset.latitude and asset.longitude):
            issues.append("Missing spatial coordinates")
            status = "INVALID"
        elif not SpatialService.is_valid_coimbatore_coordinate(asset.latitude, asset.longitude):
            issues.append(f"Coordinate ({asset.latitude}, {asset.longitude}) outside Coimbatore bounds")
            status = "WARNING" if status != "INVALID" else status

        # 2. Risk factor bounds check
        if not (0 <= asset.condition_score <= 100):
            issues.append("Condition score out of [0, 100] bounds")
            status = "INVALID"
        if not (0 <= asset.risk_score <= 100):
            issues.append("Risk score out of [0, 100] bounds")
            status = "INVALID"

        # 3. Damage description check
        if not asset.damage_type or asset.damage_type.strip() == "":
            issues.append("Missing primary damage type specification")
            status = "WARNING" if status == "VALID" else status

        # 4. Inspection date freshness check
        if not asset.last_inspection_date:
            issues.append("Missing last inspection date")
            status = "WARNING" if status == "VALID" else status

        # 5. Maintenance records check
        if not asset.maintenance_records:
            issues.append("No historical maintenance records linked")
            status = "WARNING" if status == "VALID" else status

        return {
            "asset_id": asset.asset_id,
            "status": status,
            "issues": issues,
            "issue_count": len(issues),
            "quality_score": 100 if status == "VALID" else (70 if status == "WARNING" else 30)
        }

    @classmethod
    def audit_fleet(cls, assets: List[Asset]) -> Dict[str, Any]:
        total = len(assets)
        if total == 0:
            return {"total": 0, "valid": 0, "warning": 0, "invalid": 0, "overall_health_score": 0.0}

        valid_count = 0
        warning_count = 0
        invalid_count = 0
        total_score = 0.0

        for a in assets:
            report = cls.audit_asset(a)
            total_score += report["quality_score"]
            if report["status"] == "VALID":
                valid_count += 1
            elif report["status"] == "WARNING":
                warning_count += 1
            else:
                invalid_count += 1

        return {
            "total_assets_audited": total,
            "valid_assets": valid_count,
            "warning_assets": warning_count,
            "invalid_assets": invalid_count,
            "overall_health_score": round(total_score / float(total), 1),
            "data_freshness_pct": round(((valid_count + warning_count) / float(total)) * 100.0, 1)
        }
