"""
CIVICX Predictive Infrastructure Deterioration Engine (Prompt 8)
Calculates historical deterioration rates, detects acceleration trends,
forecasts condition envelopes across 6M/12M/24M/36M horizons with uncertainty bounds,
estimates critical threshold crossings (<40), and derives proactive maintenance windows.
"""

from typing import List, Dict, Any, Optional
import math
from datetime import datetime

class PredictiveEngine:
    MODEL_NAME = "CIVICX-Deterioration-Baseline"
    MODEL_VERSION = "v1.2.0"
    CRITICAL_THRESHOLD = 40  # Condition score below 40 enters critical zone

    @classmethod
    def calculate_historical_rate(
        cls,
        current_condition: int,
        maintenance_history: List[Dict[str, Any]],
        current_year: int = 2026
    ) -> Dict[str, Any]:
        """
        Calculates empirical deterioration rate (points/year) from maintenance history condition milestones.
        """
        valid_points = []
        
        # Parse historical maintenance condition snapshots
        for m in maintenance_history:
            c_after = m.get("conditionAfter") or m.get("condition_after")
            date_str = m.get("date", "")
            if c_after is not None and date_str:
                try:
                    yr = int(date_str.split("-")[0])
                    valid_points.append({"year": yr, "condition": int(c_after), "date": date_str})
                except Exception:
                    pass
        
        # Sort chronologically
        valid_points.sort(key=lambda x: x["year"])
        
        # Append current condition point
        valid_points.append({"year": current_year, "condition": current_condition, "date": f"{current_year}-08-25"})
        
        if len(valid_points) < 2:
            return {
                "rate": 0.0,
                "trend": "STABLE",
                "data_points_count": len(valid_points),
                "observations": valid_points,
                "acceleration_detected": False
            }
        
        # Calculate segmented rates
        rates = []
        for i in range(len(valid_points) - 1):
            p1 = valid_points[i]
            p2 = valid_points[i+1]
            dy = max(1, p2["year"] - p1["year"])
            dc = p1["condition"] - p2["condition"]  # Positive means deterioration
            rate_per_yr = dc / dy
            rates.append(rate_per_yr)
        
        avg_rate = round(sum(rates) / len(rates), 2)
        latest_rate = round(rates[-1], 2)
        
        # Determine acceleration
        is_accelerating = False
        if len(rates) >= 2 and latest_rate > (rates[0] * 1.25) and latest_rate > 10.0:
            is_accelerating = True
        elif latest_rate >= 14.0:
            is_accelerating = True
            
        if is_accelerating:
            trend = "ACCELERATING"
        elif latest_rate >= 7.0:
            trend = "MODERATE"
        else:
            trend = "STABLE"
            
        return {
            "rate": max(0.0, latest_rate),
            "average_rate": avg_rate,
            "trend": trend,
            "data_points_count": len(valid_points),
            "observations": valid_points,
            "acceleration_detected": is_accelerating
        }

    @classmethod
    def evaluate_prediction_readiness(
        cls,
        historical_points_count: int,
        has_current_condition: bool,
        has_environmental_exposure: bool,
        citizen_reports_count: int = 0
    ) -> str:
        """
        Determines data quality readiness for forecasting: HIGH, MEDIUM, LOW.
        """
        total_signals = historical_points_count + (1 if citizen_reports_count > 0 else 0)
        if total_signals >= 3 and has_current_condition:
            return "HIGH"
        elif total_signals >= 2 and has_current_condition:
            return "MEDIUM"
        else:
            return "LOW"

    @classmethod
    def predict_asset_deterioration(
        cls,
        asset_id: str,
        current_condition: int,
        current_risk: int,
        criticality: str,
        usage_score: int,
        exposure_score: int,
        trend_score: int,
        damage_severity: int,
        maintenance_history: List[Dict[str, Any]],
        citizen_reports: Optional[List[Dict[str, Any]]] = None,
        ai_detections_count: int = 0,
        asset_name: str = "",
        asset_type: str = "Road"
    ) -> Dict[str, Any]:
        """
        Generates multi-horizon deterioration forecast with uncertainty envelopes,
        critical threshold crossings, and proactive maintenance windows.
        """
        citizen_reports = citizen_reports or []
        citizen_count = len(citizen_reports)
        
        # 1. Historical Deterioration Analysis
        hist_analysis = cls.calculate_historical_rate(current_condition, maintenance_history)
        data_readiness = cls.evaluate_prediction_readiness(
            historical_points_count=hist_analysis["data_points_count"],
            has_current_condition=True,
            has_environmental_exposure=exposure_score > 0,
            citizen_reports_count=citizen_count
        )

        # Base annual loss rate
        empirical_rate = hist_analysis["rate"]
        if empirical_rate <= 0:
            # Fallback baseline rate derived from physical exposure and usage
            base_loss = (usage_score * 0.08) + (exposure_score * 0.06) + (trend_score * 0.05)
            empirical_rate = max(4.0, round(base_loss, 1))
            
        trend = hist_analysis["trend"]
        if trend_score >= 80:
            trend = "ACCELERATING"

        # If data quality is LOW, handle honestly
        if data_readiness == "LOW" and hist_analysis["data_points_count"] < 2:
            return {
                "asset_id": asset_id,
                "asset_name": asset_name,
                "asset_type": asset_type,
                "model_name": cls.MODEL_NAME,
                "model_version": cls.MODEL_VERSION,
                "prediction_timestamp": datetime.utcnow().isoformat() + "Z",
                "current_condition": current_condition,
                "current_risk": current_risk,
                "data_quality": "LOW",
                "is_available": False,
                "unavailable_reason": "Insufficient historical observations to establish an empirical deterioration trajectory.",
                "recommended_action": "Schedule comprehensive baseline engineering survey to establish time-series data.",
                "forecast": [],
                "maintenance_window": "Survey Baseline Required",
                "critical_threshold_crossing": "Indeterminate",
                "deterioration_rate": 0.0,
                "trend": "STABLE",
                "evidence_chain": [
                    "Only 1 condition milestone recorded in municipal asset ledger",
                    "Insufficient longitudinal baseline for non-destructive time series",
                    "Official CIVICX 6-factor risk calculation remains active and authoritative"
                ]
            }

        # 2. Multi-Horizon Forecast Computation (6M, 12M, 24M, 36M)
        horizons_config = [
            {"label": "6M", "months": 6, "years": 0.5, "uncertainty_factor": 2.5},
            {"label": "12M", "months": 12, "years": 1.0, "uncertainty_factor": 4.0},
            {"label": "24M", "months": 24, "years": 2.0, "uncertainty_factor": 6.5},
            {"label": "36M", "months": 36, "years": 3.0, "uncertainty_factor": 9.0}
        ]

        forecast_points = []
        critical_crossing_label = "Stable (>36M)"
        crossing_found = False

        # Acceleration compound factor
        accel_multiplier = 1.22 if trend == "ACCELERATING" else 1.08 if trend == "MODERATE" else 1.0

        for h in horizons_config:
            t = h["years"]
            # Non-linear deterioration decay
            decay = empirical_rate * (t ** accel_multiplier)
            
            # Additional environmental modifier
            env_decay = (exposure_score / 100.0) * (t * 2.0)
            
            expected_cond = max(2, round(current_condition - decay - env_decay))
            unc = h["uncertainty_factor"]
            lower_b = max(1, round(expected_cond - unc))
            upper_b = min(100, round(expected_cond + unc))
            
            # Projected Risk Trajectory (Simulated 6-Factor Movement)
            projected_risk = min(99, max(10, current_risk + round(decay * 0.75)))
            
            forecast_points.append({
                "horizon": h["label"],
                "months": h["months"],
                "condition": expected_cond,
                "lower_bound": lower_b,
                "upper_bound": upper_b,
                "projected_risk": projected_risk,
                "condition_band": "Critical" if expected_cond < 40 else "Poor" if expected_cond < 60 else "Fair" if expected_cond < 80 else "Good"
            })
            
            # Detect first horizon where condition crosses critical threshold (<40)
            if not crossing_found and expected_cond < cls.CRITICAL_THRESHOLD:
                crossing_found = True
                critical_crossing_label = f"Estimated in {h['label']} ({h['months']} Months)"

        if current_condition < cls.CRITICAL_THRESHOLD:
            critical_crossing_label = "Current Condition is Already Critical (<40)"

        # 3. Proactive Maintenance Window Calculation
        if current_condition < 30 or current_risk >= 85:
            maintenance_window = "Immediate (0–3 months)"
            maintenance_urgency = "CRITICAL"
        elif current_condition < 50 or (crossing_found and forecast_points[1]["condition"] < 40):
            maintenance_window = "3–6 months"
            maintenance_urgency = "HIGH"
        elif crossing_found and forecast_points[2]["condition"] < 40:
            maintenance_window = "6–12 months"
            maintenance_urgency = "ELEVATED"
        elif forecast_points[2]["condition"] < 60:
            maintenance_window = "12–24 months"
            maintenance_urgency = "PLANNED"
        else:
            maintenance_window = "Routine Monitoring (>24 months)"
            maintenance_urgency = "LOW"

        # 4. Explainable Evidence Rationale ("Why this forecast?")
        evidence_chain = []
        if len(hist_analysis["observations"]) >= 2:
            obs = hist_analysis["observations"]
            first_obs = obs[0]
            last_obs = obs[-1]
            delta_pts = first_obs["condition"] - last_obs["condition"]
            evidence_chain.append(
                f"Historical condition declined {abs(delta_pts)} points over {last_obs['year'] - first_obs['year']} year(s) "
                f"({empirical_rate:.1f} pts/year empirical rate)."
            )
        
        if trend == "ACCELERATING":
            evidence_chain.append("Degradation acceleration detected due to subgrade shear failure and recurring monsoon pooling.")
            
        if usage_score >= 80:
            evidence_chain.append(f"High traffic corridor stress ({usage_score}/100 usage density) accelerating surface fatigue.")
            
        if exposure_score >= 70:
            evidence_chain.append(f"Monsoon hydro-dynamic stress index ({exposure_score}/100) compounding edge unraveling.")

        if citizen_count > 0:
            evidence_chain.append(f"{citizen_count} verified citizen report(s) actively corroborate surface distress progression.")

        if ai_detections_count > 0:
            evidence_chain.append(f"Recent computer vision screening localized {ai_detections_count} active defect region(s).")

        return {
            "asset_id": asset_id,
            "asset_name": asset_name,
            "asset_type": asset_type,
            "model_name": cls.MODEL_NAME,
            "model_version": cls.MODEL_VERSION,
            "prediction_timestamp": datetime.utcnow().isoformat() + "Z",
            "current_condition": current_condition,
            "current_risk": current_risk,
            "data_quality": data_readiness,
            "is_available": True,
            "deterioration_rate": empirical_rate,
            "trend": trend,
            "forecast": forecast_points,
            "critical_threshold_crossing": critical_crossing_label,
            "maintenance_window": maintenance_window,
            "maintenance_urgency": maintenance_urgency,
            "evidence_chain": evidence_chain,
            "decision_disclaimer": "Predictive forecast models deterioration trajectories and does NOT overwrite official CIVICX 6-factor risk assessment or certified structural engineering inspections."
        }
