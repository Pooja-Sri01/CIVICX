from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(String(50), unique=True, index=True, nullable=False)
    asset_type = Column(String(50), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location = Column(String(255), nullable=False)
    ward = Column(String(50), nullable=True)
    zone = Column(String(50), nullable=True)
    
    # Condition & Severity (0-100)
    condition_score = Column(Integer, nullable=False, default=50)
    damage_severity = Column(Integer, nullable=False, default=50)
    damage_type = Column(String(255), nullable=True)
    
    # Risk Metrics
    risk_score = Column(Integer, index=True, nullable=False, default=50)
    risk_level = Column(String(20), index=True, nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    
    # Stress & Multipliers
    criticality = Column(String(20), nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    usage_score = Column(Integer, nullable=False, default=50)
    historical_deterioration = Column(Float, nullable=False, default=15.0) # rate %/yr
    environmental_exposure = Column(Float, nullable=False, default=50.0) # exposure index 0-100
    
    # Cost & Rank
    estimated_repair_cost = Column(Float, nullable=False, default=500000.0)
    priority_rank = Column(Integer, index=True, nullable=False, default=1)
    recommended_action = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=True)
    last_inspection_date = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    maintenance_records = relationship("MaintenanceRecord", back_populates="asset", cascade="all, delete-orphan")
    reports = relationship("InfrastructureReport", back_populates="asset", cascade="all, delete-orphan")
    simulations = relationship("SimulationScenario", back_populates="asset", cascade="all, delete-orphan")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    maintenance_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    cost = Column(Float, nullable=False, default=0.0)
    date = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="COMPLETED") # COMPLETED, IN_PROGRESS, SCHEDULED
    vendor = Column(String(150), nullable=True)
    condition_after = Column(Integer, nullable=True)

    asset = relationship("Asset", back_populates="maintenance_records")


class InfrastructureReport(Base):
    __tablename__ = "infrastructure_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    reported_date = Column(String(50), nullable=False)
    source = Column(String(50), nullable=False, default="Citizen") # Citizen, Inspector, Sensor, System
    status = Column(String(50), nullable=False, default="OPEN") # OPEN, INVESTIGATING, RESOLVED

    asset = relationship("Asset", back_populates="reports")


class BudgetScenario(Base):
    __tablename__ = "budget_scenarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    available_budget = Column(Float, nullable=False)
    selected_assets = Column(Text, nullable=False) # JSON array of asset IDs
    total_cost = Column(Float, nullable=False)
    expected_risk_reduction = Column(Float, nullable=False)
    strategy = Column(String(50), nullable=False, default="civicx_value_max")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_type = Column(String(50), nullable=False) # REPAIR_NOW, DELAY, PARTIAL_REPAIR
    time_horizon_months = Column(Integer, nullable=False, default=6) # 3, 6, 12
    projected_risk = Column(Integer, nullable=False)
    projected_condition = Column(Integer, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    asset = relationship("Asset", back_populates="simulations")


class CitizenUser(Base):
    __tablename__ = "citizen_users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    ward = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=True)
    points_balance = Column(Integer, nullable=False, default=100)
    is_anonymous = Column(Integer, nullable=False, default=0) # 0 = visible, 1 = anonymous
    is_verified = Column(Integer, nullable=False, default=1) # 1 = verified, 0 = pending OTP
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    otp_attempts = Column(Integer, nullable=False, default=0)
    otp_last_sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    reports = relationship("CitizenReport", back_populates="user", cascade="all, delete-orphan")
    rewards = relationship("CitizenReward", back_populates="user", cascade="all, delete-orphan")


class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. CIV-2026-00124
    user_id = Column(Integer, ForeignKey("citizen_users.id", ondelete="SET NULL"), nullable=True, index=True)
    category = Column(String(100), nullable=False) # Pothole, Road Damage, Drainage / Flooding, Bridge / Flyover Damage, Street Infrastructure, Public Facility, Other Infrastructure
    description = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), nullable=False)
    zone = Column(String(50), nullable=True)
    severity = Column(String(20), nullable=False, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    validation_score = Column(Integer, nullable=False, default=75) # 0-100
    validation_status = Column(String(50), nullable=False, default="LIKELY VALID") # LIKELY VALID, NEEDS REVIEW, DUPLICATE REPORT
    validation_factors = Column(Text, nullable=True) # JSON of factor breakdown
    status = Column(String(50), nullable=False, default="SUBMITTED") # SUBMITTED, UNDER_REVIEW, VALIDATED, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED, DUPLICATE
    priority = Column(String(20), nullable=False, default="MEDIUM")
    nearest_asset_id = Column(String(50), nullable=True) # e.g. RD-1042
    nearest_asset_distance_m = Column(Float, nullable=True) # e.g. 184.0
    asset_link_status = Column(String(50), nullable=False, default="POTENTIAL_MATCH") # NO_ASSET_FOUND, POTENTIAL_MATCH, LINKED, MANUALLY_LINKED, REJECTED
    asset_link_confidence = Column(Float, nullable=False, default=0.85) # 0.0 to 1.0
    asset_link_reason = Column(Text, nullable=True)
    linked_at = Column(DateTime, nullable=True)
    linked_by = Column(String(100), nullable=True, default="CIVICX Match Engine")
    assigned_to = Column(String(150), nullable=True)
    assigned_department = Column(String(100), nullable=True) # Road Maintenance, Stormwater, Bridge Maintenance, Public Works
    assigned_engineer = Column(String(150), nullable=True)
    target_date = Column(String(50), nullable=True)
    resolution_description = Column(Text, nullable=True)
    resolution_photo = Column(String(500), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    duplicate_of_id = Column(String(50), nullable=True)
    action_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("CitizenUser", back_populates="reports")
    rewards = relationship("CitizenReward", back_populates="report", cascade="all, delete-orphan")
    events = relationship("CitizenReportEvent", back_populates="report", cascade="all, delete-orphan", order_by="CitizenReportEvent.created_at.asc()")


class CitizenReportEvent(Base):
    __tablename__ = "citizen_report_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("citizen_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False) # SUBMITTED, SCREENED, VALIDATED, ASSIGNED, WORK_STARTED, RESOLVED, REJECTED, DUPLICATE_LINKED
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    actor_id = Column(String(100), nullable=False, default="Municipal Engineer")
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    report = relationship("CitizenReport", back_populates="events")


class CitizenReward(Base):
    __tablename__ = "citizen_rewards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("citizen_users.id", ondelete="CASCADE"), nullable=False, index=True)
    report_id = Column(Integer, ForeignKey("citizen_reports.id", ondelete="SET NULL"), nullable=True, index=True)
    points = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False) # Report Submitted (+10), Report Validated (+50), Government Action (+100), Issue Resolved (+250)
    status = Column(String(50), nullable=False, default="CREDITED") # CREDITED, PENDING, REDEEMED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("CitizenUser", back_populates="rewards")
    report = relationship("CitizenReport", back_populates="rewards")


# ============================================================
# ENTERPRISE EXTENSIONS (PROMPT 1/10)
# ============================================================

class AuditEvent(Base):
    """
    Append-only immutable audit ledger tracking all critical municipal infrastructure
    and civic state transitions with request correlation tracking.
    """
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type = Column(String(100), index=True, nullable=False) # e.g. REPORT_VALIDATED, RISK_RECALCULATED, REWARD_CREDITED
    entity_type = Column(String(50), index=True, nullable=False) # e.g. ASSET, CITIZEN_REPORT, REWARD, DECISION
    entity_id = Column(String(100), index=True, nullable=False)
    actor_id = Column(String(100), index=True, nullable=False, default="system")
    actor_type = Column(String(50), nullable=False, default="SYSTEM") # CITIZEN, ENGINEER, INSPECTOR, SYSTEM, ADMIN
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)
    request_id = Column(String(100), index=True, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    __table_args__ = (
        Index("idx_audit_entity_lookup", "entity_type", "entity_id", "timestamp"),
    )


class RiskAssessment(Base):
    """
    Versioned MCDA Risk Assessment history enabling historical auditability across algorithm releases.
    """
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    condition_score = Column(Integer, nullable=False)
    damage_score = Column(Integer, nullable=False)
    traffic_score = Column(Integer, nullable=False)
    criticality_score = Column(Integer, nullable=False)
    environment_score = Column(Float, nullable=False)
    deterioration_score = Column(Float, nullable=False)
    risk_score = Column(Integer, index=True, nullable=False)
    risk_level = Column(String(20), index=True, nullable=False)
    algorithm_version = Column(String(50), nullable=False, default="CIVICX-MCDA-v2.0")
    drivers_json = Column(Text, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)


class DecisionRecord(Base):
    """
    Versioned municipal intervention recommendation record documenting decision context and rationale.
    """
    __tablename__ = "decision_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    decision_version = Column(String(50), nullable=False, default="v1.0")
    risk_assessment_id = Column(Integer, ForeignKey("risk_assessments.id", ondelete="SET NULL"), nullable=True)
    priority_score = Column(Float, nullable=False)
    priority_rank = Column(Integer, nullable=False)
    recommended_intervention = Column(String(255), nullable=False)
    estimated_cost = Column(Float, nullable=False)
    budget_status = Column(String(50), nullable=False, default="PENDING_REVIEW")
    cost_of_delay_6m = Column(Float, nullable=False, default=0.0)
    verdict = Column(String(50), nullable=False, default="REPAIR_NOW")
    justification = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)


class RewardLedger(Base):
    """
    Double-entry immutable civic reward transaction ledger.
    """
    __tablename__ = "reward_ledger"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("citizen_users.id", ondelete="CASCADE"), nullable=False, index=True)
    report_id = Column(Integer, ForeignKey("citizen_reports.id", ondelete="SET NULL"), nullable=True, index=True)
    transaction_type = Column(String(20), index=True, nullable=False) # EARN, BONUS, REDEEM, REVERSAL
    points = Column(Integer, nullable=False) # positive for credit, negative for debit
    balance_after = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    reference_id = Column(String(100), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    __table_args__ = (
        Index("idx_ledger_user_time", "user_id", "created_at"),
    )


class DataSource(Base):
    """
    Registry of external telemetry, sensor, and municipal data ingestion sources.
    """
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_name = Column(String(100), unique=True, nullable=False)
    source_type = Column(String(50), nullable=False) # IOT_SENSOR, TRAFFIC_FEED, WEATHER, CITIZEN_STREAM, INSPECTION_DEVICE
    status = Column(String(50), nullable=False, default="ACTIVE") # ACTIVE, INACTIVE, DEGRADED
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class TelemetryRecord(Base):
    """
    Normalized contract table for future real-time sensor, weather, and traffic observation streams.
    """
    __tablename__ = "telemetry_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey("data_sources.id", ondelete="CASCADE"), nullable=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=True, index=True)
    metric_type = Column(String(50), index=True, nullable=False) # VIBRATION, MOISTURE, DEFLECTION, RAINFALL, TRAFFIC_COUNT
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    quality_score = Column(Float, nullable=False, default=1.0) # 0.0 to 1.0
    metadata_json = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    __table_args__ = (
        Index("idx_telemetry_asset_metric", "asset_id", "metric_type", "recorded_at"),
    )


class AIInspection(Base):
    """
    Historical AI Computer Vision screening records tracking damage detections,
    confidence metrics, model version, and visual telemetry evidence.
    """
    __tablename__ = "ai_inspections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inspection_id = Column(String(100), unique=True, index=True, nullable=False) # e.g. INSP-2026-00042
    report_id = Column(String(50), index=True, nullable=True) # Linked citizen report ID
    asset_id = Column(String(50), index=True, nullable=True) # Linked asset ID
    image_url = Column(String(500), nullable=False)
    annotated_image_url = Column(String(500), nullable=True)
    model_name = Column(String(100), nullable=False, default="CIVICX-Vision-RDD2022")
    model_version = Column(String(50), nullable=False, default="v1.2.0")
    domain = Column(String(50), nullable=False, default="ROAD")
    damage_type = Column(String(255), nullable=False)
    severity = Column(String(20), nullable=False, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, nullable=False, default=0.94)
    confidence_band = Column(String(30), nullable=False, default="HIGH CONFIDENCE")
    status = Column(String(50), nullable=False, default="COMPLETED") # PENDING, PROCESSING, COMPLETED, LOW_CONFIDENCE, FAILED
    detections_json = Column(Text, nullable=True) # JSON list of bounding boxes
    explainability_json = Column(Text, nullable=True) # JSON list of explainable evidence strings
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    feedbacks = relationship("AIInspectionFeedback", back_populates="inspection", cascade="all, delete-orphan")


class AIInspectionFeedback(Base):
    """
    Human-in-the-loop engineering feedback ledger recording municipal verification
    without modifying raw neural inference history.
    """
    __tablename__ = "ai_inspection_feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inspection_id = Column(Integer, ForeignKey("ai_inspections.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(String(100), nullable=False, default="Municipal Engineer")
    reviewer_role = Column(String(50), nullable=False, default="ENGINEER")
    review_result = Column(String(50), nullable=False, default="CONFIRMED") # CONFIRMED, FLAGGED_FOR_MANUAL_REVIEW, DISAGREED
    suggested_damage_type = Column(String(255), nullable=True)
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    inspection = relationship("AIInspection", back_populates="feedbacks")


class DeteriorationForecastRecord(Base):
    """
    Versioned time-series deterioration forecasts for infrastructure assets (Prompt 8).
    Preserves historical forecast trajectory runs without overwriting past model evaluations.
    """
    __tablename__ = "deterioration_forecasts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(String(50), index=True, nullable=False)
    model_name = Column(String(100), nullable=False, default="CIVICX-Deterioration-Baseline")
    model_version = Column(String(50), nullable=False, default="v1.2.0")
    current_condition = Column(Integer, nullable=False)
    current_risk = Column(Integer, nullable=False)
    data_quality = Column(String(20), nullable=False, default="HIGH") # HIGH, MEDIUM, LOW
    trend = Column(String(30), nullable=False, default="STABLE") # STABLE, MODERATE, ACCELERATING
    deterioration_rate = Column(Float, nullable=False, default=0.0)
    horizons_json = Column(Text, nullable=False) # JSON array of 6M, 12M, 24M, 36M forecast points
    maintenance_window = Column(String(100), nullable=False)
    critical_threshold_crossing = Column(String(100), nullable=False)
    evidence_chain_json = Column(Text, nullable=True) # JSON array of facts
    predicted_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    __table_args__ = (
        Index("idx_forecast_asset_lookup", "asset_id", "predicted_at"),
    )


class DigitalTwinScenario(Base):
    """
    Versioned what-if scenario simulations for municipal digital twins (Prompt 9).
    Documents intervention simulations, counterfactual trajectories, and approval status.
    """
    __tablename__ = "digital_twin_scenarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(String(50), index=True, nullable=False)
    name = Column(String(150), nullable=False)
    intervention_type = Column(String(100), nullable=False, default="PREVENTIVE_MAINTENANCE")
    timing_months = Column(Integer, nullable=False, default=0)
    budget = Column(Float, nullable=False, default=0.0)
    scenario_status = Column(String(50), nullable=False, default="DRAFT") # DRAFT, SIMULATED, REVIEWED, APPROVED, REJECTED
    simulation_result_json = Column(Text, nullable=True) # JSON full simulation result
    created_by = Column(String(100), nullable=False, default="Municipal Engineer")
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_dt_scenario_asset", "asset_id", "created_at"),
    )


class MunicipalActionItem(Base):
    """
    Municipal action workflow tracking table (Prompt 10).
    Converts explainable recommendations into managed operational items.
    """
    __tablename__ = "municipal_actions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(String(50), index=True, nullable=False)
    action_type = Column(String(100), nullable=False) # PREVENTIVE_MAINTENANCE, REHABILITATION, RECONSTRUCT, INSPECT, MONITOR, REVIEW_BUDGET
    title = Column(String(255), nullable=False)
    urgency = Column(String(50), nullable=False, default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW, ROUTINE
    status = Column(String(50), nullable=False, default="NEW") # NEW, UNDER_REVIEW, APPROVED, SCHEDULED, IN_PROGRESS, COMPLETED, MONITORING
    assigned_dept = Column(String(100), nullable=False, default="Road Infrastructure Department")
    due_window = Column(String(100), nullable=False, default="3–6 Months")
    estimated_cost = Column(Float, nullable=False, default=0.0)
    rationale = Column(Text, nullable=True)
    created_by = Column(String(100), nullable=False, default="Municipal Engineer")
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_action_status_urgency", "status", "urgency"),
        Index("idx_action_asset", "asset_id"),
    )


