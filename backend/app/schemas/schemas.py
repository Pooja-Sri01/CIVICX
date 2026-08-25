from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict

# ============================
# Maintenance Record Schemas
# ============================

class MaintenanceRecordBase(BaseModel):
    maintenance_type: str
    description: str
    cost: float
    date: str
    status: str = "COMPLETED"
    vendor: Optional[str] = None
    condition_after: Optional[int] = None

class MaintenanceRecordResponse(MaintenanceRecordBase):
    id: int
    asset_id: int

    model_config = ConfigDict(from_attributes=True)

# ============================
# Infrastructure Report Schemas
# ============================

class InfrastructureReportBase(BaseModel):
    report_type: str
    description: str
    severity: str = "MEDIUM"
    reported_date: str
    source: str = "Citizen"
    status: str = "OPEN"

class InfrastructureReportResponse(InfrastructureReportBase):
    id: int
    asset_id: int

    model_config = ConfigDict(from_attributes=True)

# ============================
# Asset Schemas
# ============================

class AssetBase(BaseModel):
    asset_id: str
    asset_type: str
    name: str
    latitude: float
    longitude: float
    location: str
    ward: Optional[str] = None
    zone: Optional[str] = None
    condition_score: int = Field(ge=0, le=100)
    damage_severity: int = Field(ge=0, le=100)
    damage_type: Optional[str] = None
    risk_score: int = Field(ge=0, le=100)
    risk_level: str = "MEDIUM" # LOW, MEDIUM, HIGH, CRITICAL
    criticality: str = "MEDIUM" # LOW, MEDIUM, HIGH, CRITICAL
    usage_score: int = Field(ge=0, le=100)
    historical_deterioration: float = 15.0
    environmental_exposure: float = 50.0
    estimated_repair_cost: float
    priority_rank: int = 1
    recommended_action: str
    image_url: Optional[str] = None
    last_inspection_date: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetResponse(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime
    maintenance_records: List[MaintenanceRecordResponse] = []
    reports: List[InfrastructureReportResponse] = []

    model_config = ConfigDict(from_attributes=True)

# ============================
# Risk Calculation Schemas
# ============================

class RiskCalculateRequest(BaseModel):
    condition_score: int = Field(ge=0, le=100)
    damage_severity: int = Field(ge=0, le=100)
    usage_score: int = Field(ge=0, le=100)
    criticality: Union[str, int, float]
    historical_deterioration: Optional[float] = 15.0
    environmental_exposure: Optional[float] = 50.0

class RiskFactorImpact(BaseModel):
    factor: str
    impact: str
    score_contribution: float
    description: str

class RiskCalculateResponse(BaseModel):
    risk_score: int
    risk_level: str
    factors: List[RiskFactorImpact]
    explanation: str

# ============================
# Priority Schemas
# ============================

class PriorityItemResponse(BaseModel):
    id: int
    asset_id: str
    name: str
    asset_type: str
    location: str
    ward: Optional[str] = None
    zone: Optional[str] = None
    risk_score: int
    risk_level: str
    condition_score: int
    criticality: str
    usage_score: int
    estimated_repair_cost: float
    priority_score: float
    priority_rank: int
    priority_reason: str
    recommended_action: str

# ============================
# Budget Optimizer Schemas
# ============================

class BudgetOptimizeRequest(BaseModel):
    available_budget: float = Field(gt=0)
    strategy: Optional[str] = "civicx_value_max"

class PortfolioExplanation(BaseModel):
    summary: str
    strategy_label: str
    risk_mitigation_efficiency: str
    unfunded_critical_count: int
    critical_budget_gap: float

class BudgetOptimizeResponse(BaseModel):
    available_budget: float
    strategy: str
    total_cost: float
    remaining_budget: float
    budget_utilization_pct: float
    assets_repaired: int
    total_assets_evaluated: int
    initial_total_risk: int
    post_repair_total_risk: int
    estimated_risk_reduction: int
    risk_reduction_percentage: float
    cost_per_risk_point_reduced: float
    selected_asset_ids: List[str]
    selected_assets: List[Dict[str, Any]]
    unselected_assets: List[Dict[str, Any]]
    unfunded_critical_assets: Optional[List[Dict[str, Any]]] = []
    critical_budget_gap: Optional[float] = 0.0
    portfolio_explanation: Optional[PortfolioExplanation] = None


# ============================
# Simulation Schemas
# ============================

class SimulationRunRequest(BaseModel):
    asset_id: str
    scenario: Optional[str] = "REPAIR_NOW"
    forecast_horizon: Optional[int] = 5

class SimulationRunResponse(BaseModel):
    asset_id: str
    current_state: Dict[str, Any]
    horizons: Dict[str, Any]
    yearly_timeline: Optional[List[Dict[str, Any]]] = []
    scenarios: Dict[str, Any]
    cost_of_delay: Optional[float] = 0.0
    additional_risk_from_delay: Optional[int] = 0
    recommended_scenario: str
    recommendation_reason: str
    decision_insight: Optional[str] = None
    assumptions: Optional[Dict[str, Any]] = None
    data_quality: Optional[Dict[str, Any]] = None

class PortfolioSimulationResponse(BaseModel):
    total_assets_simulated: int
    city_timeline: List[Dict[str, Any]]
    total_5year_savings: float
    total_risk_points_prevented: int


# ============================
# AI Inspection Schemas
# ============================

class BoundingBoxCoordinates(BaseModel):
    x: float
    y: float
    width: float
    height: float

class AIDetectionBox(BaseModel):
    damage_type: str
    severity: str = "HIGH"
    confidence: float
    bbox: BoundingBoxCoordinates
    reason: Optional[str] = None

class AIInspectionCreate(BaseModel):
    image_url: Optional[str] = None
    report_id: Optional[str] = None
    asset_id: Optional[str] = None
    context_hints: Optional[str] = None

class AIInspectionFeedbackCreate(BaseModel):
    reviewer_id: Optional[str] = "Municipal Engineer"
    reviewer_role: Optional[str] = "ENGINEER"
    review_result: str = "CONFIRMED" # CONFIRMED, FLAGGED_FOR_MANUAL_REVIEW, DISAGREED
    suggested_damage_type: Optional[str] = None
    review_notes: Optional[str] = None

class AIInspectionFeedbackResponse(BaseModel):
    id: int
    inspection_id: int
    reviewer_id: str
    reviewer_role: str
    review_result: str
    suggested_damage_type: Optional[str] = None
    review_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIInspectionResponse(BaseModel):
    id: int
    inspection_id: str
    report_id: Optional[str] = None
    asset_id: Optional[str] = None
    image_url: str
    annotated_image_url: Optional[str] = None
    model_name: str = "CIVICX-Vision-RDD2022"
    model_version: str = "v1.2.0"
    domain: str = "ROAD"
    damage_type: str
    severity: str
    confidence: float
    confidence_band: str = "HIGH CONFIDENCE"
    status: str = "COMPLETED"
    detections: List[AIDetectionBox] = []
    evidence: List[str] = []
    summary: Optional[str] = None
    disclaimer: str = "AI Visual Screening output is an empirical evidence signal and does NOT substitute certified municipal engineering structural inspection."
    feedbacks: List[AIInspectionFeedbackResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIInspectionCategoryCount(BaseModel):
    category: str
    count: int
    average_confidence: float

class AIInspectionStatsResponse(BaseModel):
    total_images_analyzed: int
    high_confidence_count: int
    medium_confidence_count: int
    low_confidence_count: int
    manual_review_flagged: int
    model_accuracy_benchmark: str = "94.2% RDD2022 Benchmark"
    top_detected_conditions: List[AIInspectionCategoryCount] = []

class InspectionAnalyzeRequest(BaseModel):
    asset_id: Optional[str] = None
    image_url: Optional[str] = None
    report_id: Optional[str] = None

class InspectionAnalyzeResponse(BaseModel):
    damage_type: str
    confidence: float
    severity: str
    description: str
    model_mode: str = "DEMO_INSPECTION"
    detections: Optional[List[AIDetectionBox]] = []
    evidence: Optional[List[str]] = []
    confidence_band: Optional[str] = "HIGH CONFIDENCE"
    model_name: Optional[str] = "CIVICX-Vision-RDD2022"
    model_version: Optional[str] = "v1.2.0"

class DetectedIssue(BaseModel):
    issue: str
    severity: str
    evidence: str
    impact: str
    confidence: Optional[float] = None

class AssetInspectionResponse(BaseModel):
    asset_id: str
    name: str
    asset_type: str
    location: str
    last_inspection_date: Optional[str] = None
    condition_score: int
    condition_rating: str
    observed_evidence: List[str]
    detected_issues: List[DetectedIssue]
    ai_vision: Optional[InspectionAnalyzeResponse] = None
    deterioration_signal: str # Improving, Stable, Deteriorating, Insufficient History
    deterioration_reason: str
    next_inspection_recommendation: str

class RiskDriver(BaseModel):
    factor: str
    impact: str
    score_contribution: float
    percentage_share: float
    description: str

class AssetRiskExplanationResponse(BaseModel):
    asset_id: str
    risk_score: int
    risk_level: str
    drivers: List[RiskDriver]
    summary_explanation: str
    what_would_reduce_risk: str
    preventative_roi: str
    confidence_label: Optional[str] = None




# ============================
# Dashboard & Distribution Schemas
# ============================

class CategoryDistributionItem(BaseModel):
    asset_type: str
    count: int
    average_risk: float
    critical_count: int
    total_repair_cost: float

class DashboardSummaryResponse(BaseModel):
    city: str
    region: str
    total_assets: int
    critical_assets: int
    high_risk_assets: int
    medium_risk_assets: int
    low_risk_assets: int
    total_estimated_repair_cost: float
    available_budget: float
    average_risk: float
    risk_distribution: Dict[str, int]
    category_summary: List[CategoryDistributionItem]
    top_priority_assets: List[PriorityItemResponse]

class RiskDistributionResponse(BaseModel):
    total_assets: int
    distribution: Dict[str, int]
    average_risk: float
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    historical_trend_summary: str


# ============================
# Citizen Civic Schemas
# ============================

class CitizenReportCreate(BaseModel):
    category: str
    description: str
    photo_url: Optional[str] = None
    latitude: float
    longitude: float
    location_name: Optional[str] = "Coimbatore, Tamil Nadu"
    zone: Optional[str] = None
    severity: Optional[str] = "MEDIUM"
    user_name: Optional[str] = "Civic Citizen"
    user_email: Optional[str] = "citizen@civicx.org"

class CitizenValidationFactor(BaseModel):
    signal: str
    passed: bool
    score: int
    detail: str

class CitizenReportEventResponse(BaseModel):
    id: int
    report_id: int
    event_type: str
    old_status: Optional[str] = None
    new_status: str
    actor_id: str
    description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CitizenReportResponse(BaseModel):
    id: int
    report_id: str
    user_id: Optional[int] = None
    user_name: Optional[str] = "Civic Citizen"
    category: str
    description: str
    photo_url: Optional[str] = None
    latitude: float
    longitude: float
    location_name: str
    zone: Optional[str] = "Central Zone"
    severity: str
    validation_score: int
    validation_status: str
    validation_factors: Optional[List[Dict[str, Any]]] = []
    status: str
    priority: str
    nearest_asset_id: Optional[str] = None
    nearest_asset_distance_m: Optional[float] = None
    asset_link_status: Optional[str] = "POTENTIAL_MATCH"
    asset_link_confidence: Optional[float] = 0.85
    asset_link_reason: Optional[str] = None
    linked_at: Optional[datetime] = None
    linked_by: Optional[str] = "CIVICX Match Engine"
    assigned_to: Optional[str] = None
    assigned_department: Optional[str] = None
    assigned_engineer: Optional[str] = None
    target_date: Optional[str] = None
    resolution_description: Optional[str] = None
    resolution_photo: Optional[str] = None
    resolved_at: Optional[datetime] = None
    duplicate_of_id: Optional[str] = None
    action_notes: Optional[str] = None
    events: Optional[List[CitizenReportEventResponse]] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AssetEvidenceSummary(BaseModel):
    asset_id: str
    total_reports: int
    validated_reports: int
    under_review_reports: int
    in_progress_reports: int
    resolved_reports: int
    common_category: Optional[str] = None
    latest_observation_date: Optional[str] = None
    evidence_context: str
    reports: List[CitizenReportResponse] = []

class AssetLinkResponse(BaseModel):
    report_id: str
    asset: Optional[Dict[str, Any]] = None
    match_status: str
    confidence: float
    reason: str
    distance_m: Optional[float] = None

class ManualLinkAssetRequest(BaseModel):
    asset_id: str
    action_notes: Optional[str] = "Manually linked by Municipal Engineer"

class CivicReportStatsResponse(BaseModel):
    new_reports: int
    under_review: int
    validated: int
    assigned: int
    in_progress: int
    resolved: int
    duplicate: int
    rejected: int
    high_risk_linked: Optional[int] = 0
    total: int

class CivicReportsSummaryResponse(BaseModel):
    new_reports: int
    under_review: int
    validated: int
    high_risk_linked: int
    in_progress: int
    resolved: int
    total: int

class CivicReportAdminDetailResponse(BaseModel):
    report: CitizenReportResponse
    linked_asset: Optional[Dict[str, Any]] = None
    decision_context: Optional[Dict[str, Any]] = None
    events: List[CitizenReportEventResponse] = []

class PrioritizeReportRequest(BaseModel):
    priority: Optional[str] = "HIGH"
    action_notes: Optional[str] = "Report prioritized by Municipal Engineer"

class CitizenRewardResponse(BaseModel):
    id: int
    user_id: int
    report_id: Optional[int] = None
    points: int
    reason: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CategoryContribution(BaseModel):
    category: str
    count: int

class ContributionJourneyEvent(BaseModel):
    title: str
    report_id: str
    points: int
    date: str

class CitizenImpactResponse(BaseModel):
    reports_submitted: int
    reports_validated: int
    issues_resolved: int
    roads_improved: int
    infrastructure_protected: int
    points_earned: int
    current_balance: int
    summary_message: str
    categories_contributed: Optional[List[CategoryContribution]] = []
    contribution_journey: Optional[List[ContributionJourneyEvent]] = []

class CitizenLeaderboardItem(BaseModel):
    rank: int
    name: str
    reports_validated: int
    issues_resolved: int
    civicx_points: int
    badge: str

class CitizenRedeemRequest(BaseModel):
    points: int = 1000

class CitizenRedeemResponse(BaseModel):
    success: bool
    points_redeemed: int
    remaining_balance: int
    message: str

class CitizenWalletResponse(BaseModel):
    current_balance: int
    lifetime_earned: int
    pending: int
    redeemed: int
    rewards: List[CitizenRewardResponse]

class ReportRewardBreakdownResponse(BaseModel):
    report_id: str
    status: str
    submission_points: int
    validation_points: int
    action_points: int
    resolution_points: int
    total_earned: int
    rewards: List[CitizenRewardResponse]

class StatusUpdateRequest(BaseModel):
    status: str
    action_notes: Optional[str] = None
    award_points: Optional[bool] = True

class ValidateRequest(BaseModel):
    action_notes: Optional[str] = "Screening validated by Municipal Engineer."
    award_points: Optional[bool] = True

class DuplicateRequest(BaseModel):
    duplicate_of_id: str
    action_notes: Optional[str] = "Marked as duplicate of existing corridor report."

class RejectRequest(BaseModel):
    reason: str = "Insufficient photographic evidence or non-municipal jurisdiction."
    action_notes: Optional[str] = None

class AssignWorkflowRequest(BaseModel):
    department: str = "Road Maintenance"
    engineer: Optional[str] = "Central Zone Engineering Team"
    priority: Optional[str] = "HIGH"
    target_date: Optional[str] = None
    action_notes: Optional[str] = None

class StartWorkRequest(BaseModel):
    action_notes: Optional[str] = "Field repair crew deployed and active on site."

class ResolveRequest(BaseModel):
    resolution_description: str
    resolved_date: Optional[str] = None
    resolution_photo: Optional[str] = None
    action_notes: Optional[str] = None
    award_points: Optional[bool] = True

class AssignRequest(BaseModel):
    assigned_to: str
    priority: Optional[str] = "MEDIUM"
    action_notes: Optional[str] = None

class RewardRequest(BaseModel):
    points: int
    reason: str

# ============================================================
# PREDICTIVE DETERIORATION SCHEMAS (PROMPT 8)
# ============================================================

class ForecastHorizonPoint(BaseModel):
    horizon: str # "6M", "12M", "24M", "36M"
    months: int
    condition: int
    lower_bound: int
    upper_bound: int
    projected_risk: int
    condition_band: str

class DeteriorationForecastResponse(BaseModel):
    asset_id: str
    asset_name: Optional[str] = ""
    asset_type: Optional[str] = "Road"
    model_name: str = "CIVICX-Deterioration-Baseline"
    model_version: str = "v1.2.0"
    prediction_timestamp: str
    current_condition: int
    current_risk: int
    data_quality: str # "HIGH", "MEDIUM", "LOW"
    is_available: bool = True
    unavailable_reason: Optional[str] = None
    recommended_action: Optional[str] = None
    deterioration_rate: float = 0.0
    trend: str = "STABLE" # "STABLE", "MODERATE", "ACCELERATING"
    forecast: List[ForecastHorizonPoint] = []
    critical_threshold_crossing: str
    maintenance_window: str
    maintenance_urgency: Optional[str] = "PLANNED"
    evidence_chain: List[str] = []
    decision_disclaimer: str

class PredictiveSummaryResponse(BaseModel):
    total_assets_evaluated: int
    accelerating_count: int
    critical_under_12m: int
    maintenance_under_6m: int
    low_data_confidence_count: int
    avg_projected_loss_12m: float
    risk_mitigation_window_breakdown: Dict[str, int]

class PredictivePriorityItem(BaseModel):
    asset_id: str
    asset_name: str
    asset_type: str
    zone: str
    current_risk: int
    risk_level: str
    current_condition: int
    forecast_12m: int
    trend: str
    maintenance_window: str
    priority_rank: int

# ============================================================
# DIGITAL TWIN & WHAT-IF SIMULATION SCHEMAS (PROMPT 9)
# ============================================================

class DigitalTwinTrajectoryPoint(BaseModel):
    year: int
    tag: str # "ACTUAL", "FORECAST", "SIMULATION"
    condition: int
    risk: int
    cost_cumulative: float
    status: str

class DigitalTwinScenarioConfig(BaseModel):
    intervention_type: str
    intervention_name: str
    timing_months: int
    timing_label: str
    target_budget: float
    description: str

class DigitalTwinEffectiveness(BaseModel):
    condition_gain_pts: int
    risk_reduction_pts: int
    lifespan_extension_years: int
    cost_of_delay: float
    delay_cost_penalty_pct: float

class DigitalTwinFinancials(BaseModel):
    initial_cost: float
    immediate_cost: float
    cost_of_delay: float
    five_year_tco_simulated: float
    five_year_tco_do_nothing: float
    net_lifecycle_savings: float

class DigitalTwinTrajectories(BaseModel):
    years: List[int]
    do_nothing: List[DigitalTwinTrajectoryPoint]
    simulated: List[DigitalTwinTrajectoryPoint]

class DigitalTwinScenarioSimulationResponse(BaseModel):
    asset_id: str
    scenario: DigitalTwinScenarioConfig
    effectiveness: DigitalTwinEffectiveness
    financials: DigitalTwinFinancials
    trajectories: DigitalTwinTrajectories
    explainability: str
    model_metadata: Dict[str, str]

class CustomScenarioRunRequest(BaseModel):
    asset_id: str
    intervention_type: Optional[str] = "PREVENTIVE_MAINTENANCE"
    timing_months: Optional[int] = 0
    budget: Optional[float] = None

class SavedScenarioCreate(BaseModel):
    asset_id: str
    name: str
    intervention_type: str
    timing_months: int = 0
    budget: float = 0.0
    scenario_status: Optional[str] = "SIMULATED"
    simulation_result: Optional[Dict[str, Any]] = None

class SavedScenarioResponse(BaseModel):
    id: int
    asset_id: str
    name: str
    intervention_type: str
    timing_months: int
    budget: float
    scenario_status: str
    simulation_result: Optional[Dict[str, Any]] = None
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DigitalTwinStateResponse(BaseModel):
    asset_id: str
    name: str
    asset_type: str
    location: str
    zone: str
    latitude: float
    longitude: float
    condition_score: int
    risk_score: int
    risk_level: str
    priority_rank: int
    recommended_action: str
    estimated_repair_cost: float
    last_inspection_date: Optional[str] = None
    lifecycle_stage: str # "OPERATION", "INSPECTION", "MAINTENANCE", "REHABILITATION", "RENEWAL"
    data_freshness: str
    citizen_signals: Dict[str, Any]
    ai_inspection_signals: Dict[str, Any]
    forecast_summary: Dict[str, Any]
    scenarios: Dict[str, Any]

# ============================================================
# EXECUTIVE DECISION RECOMMENDATION & ACTION SCHEMAS (PROMPT 10)
# ============================================================

class DecisionRecommendationResponse(BaseModel):
    asset_id: str
    asset_name: str
    asset_type: str
    recommendation_type: str # INSPECT, MONITOR, PREVENTIVE_MAINTENANCE, REHABILITATE, RECONSTRUCT, REVIEW_BUDGET
    action_title: str
    urgency: str # CRITICAL, HIGH, MEDIUM, LOW, ROUTINE
    target_window: str
    estimated_cost: float
    decision_confidence: str # HIGH, MEDIUM, LOW
    expected_impact: str
    why_explanation: List[str]
    decision_chain_stage: str # "08 RECOMMEND", "10 MONITOR", etc.
    is_funded: bool

class CityRecommendationsSummaryResponse(BaseModel):
    total_evaluated: int
    critical_reconstruct_count: int
    urgent_rehabilitate_count: int
    preventive_maintenance_count: int
    inspection_required_count: int
    monitor_count: int
    total_recommended_budget: float
    unfunded_priority_budget: float
    attention_required: List[DecisionRecommendationResponse]
    can_wait_monitor: List[DecisionRecommendationResponse]

class MunicipalActionCreate(BaseModel):
    asset_id: str
    action_type: str
    title: str
    urgency: Optional[str] = "HIGH"
    assigned_dept: Optional[str] = "Road Infrastructure Department"
    due_window: Optional[str] = "3–6 Months"
    estimated_cost: Optional[float] = 0.0
    rationale: Optional[str] = None

class MunicipalActionResponse(BaseModel):
    id: int
    asset_id: str
    action_type: str
    title: str
    urgency: str
    status: str # NEW, UNDER_REVIEW, APPROVED, SCHEDULED, IN_PROGRESS, COMPLETED, MONITORING
    assigned_dept: str
    due_window: str
    estimated_cost: float
    rationale: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ============================================================
# CITIZEN AUTHENTICATION & PROFILE SCHEMAS (SECURE PRODUCTION)
# ============================================================

class CitizenSendOtpRequest(BaseModel):
    email: str

class CitizenVerifyOtpRequest(BaseModel):
    email: str
    otp_code: str

class CitizenCompleteRegistrationRequest(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    ward: Optional[str] = "Central Zone"
    password: str

class CitizenRegisterRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str
    ward: Optional[str] = "Central Zone"

class CitizenLoginRequest(BaseModel):
    email: str
    password: str

class CitizenProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    ward: Optional[str] = "Central Zone"
    points_balance: int
    is_verified: bool
    reports_count: Optional[int] = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CitizenAuthResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    user: Optional[CitizenProfileResponse] = None
    dev_code: Optional[str] = None





