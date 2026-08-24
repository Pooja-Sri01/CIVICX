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
# Inspection Schemas
# ============================

class InspectionAnalyzeRequest(BaseModel):
    asset_id: Optional[str] = None
    image_url: Optional[str] = None

class InspectionAnalyzeResponse(BaseModel):
    damage_type: str
    confidence: float
    severity: str
    description: str
    model_mode: str = "DEMO_INSPECTION"

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
