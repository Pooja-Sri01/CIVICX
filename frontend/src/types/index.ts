export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type CriticalityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type AssetType = 'Road' | 'Bridge' | 'Drainage' | 'Culvert' | 'Flyover' | 'Traffic Corridor';

export interface BoundingBox {
  label: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
}

export interface MaintenanceLog {
  date: string;
  action: string;
  cost: number;
  vendor: string;
  conditionAfter: number;
}

export interface RiskFactor {
  factor: string;
  impact: 'High' | 'Moderate' | 'Low' | 'Critical';
  weight: number; // e.g. 0.25
  scoreContribution: number; // contribution to total 0-100
  description: string;
}

export interface Explainability {
  summary: string;
  topFactors: RiskFactor[];
  whyRank: string;
  preventativeROI: string;
}

export interface Asset {
  id: string;
  assetId: string;
  name: string;
  type: AssetType;
  location: string;
  ward: string;
  zone: string;
  latitude: number;
  longitude: number;
  conditionScore: number; // 0 (failed) to 100 (pristine)
  damageSeverity: number; // 0 to 100
  damageType: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  criticality: CriticalityLevel;
  criticalityScore: number; // 0 to 100
  usage: string;
  usageScore: number; // 0 to 100
  historicalTrend: string;
  trendScore: number; // 0 to 100
  environmentalExposure: string;
  exposureScore: number; // 0 to 100
  estimatedRepairCost: number; // in INR ₹
  priorityRank: number;
  recommendedAction: string;
  image: string;
  detectedBBoxes: BoundingBox[];
  lastInspection: string;
  maintenanceHistory: MaintenanceLog[];
  explainability: Explainability;
  selectionReason?: string;
  deferralReason?: string;
  costEfficiencyMetric?: number;
  interventionType?: string;
  currentRisk?: number;
  postRepairRisk?: number;
  riskReduction?: number;
}


export interface DashboardSummary {
  city: string;
  region: string;
  totalAssets: number;
  highRiskAssets: number;
  criticalAssets: number;
  mediumRiskAssets: number;
  lowRiskAssets: number;
  activeRepairPlanCost: number;
  availableBudget: number;
  riskDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  categoryRisk: Array<{
    category: AssetType;
    total: number;
    avgRisk: number;
    criticalCount: number;
    totalEstCost: number;
  }>;
  recentAlerts: Array<{
    id: string;
    assetId: string;
    name: string;
    risk: number;
    riskLevel: RiskLevel;
    timestamp: string;
    action: string;
  }>;
}

export interface PortfolioExplanationData {
  summary: string;
  strategy_label: string;
  risk_mitigation_efficiency: string;
  unfunded_critical_count: number;
  critical_budget_gap: number;
}

export interface OptimizationResult {
  budget: number;
  strategy: 'civicx_value_max' | 'fifo_baseline';
  allocatedCost: number;
  unallocatedCost: number;
  budgetUtilizationPct: number;
  assetsRepairedCount: number;
  totalAssetsConsidered: number;
  initialTotalRisk: number;
  postRepairTotalRisk: number;
  totalRiskReduction: number;
  riskReductionPercent: number;
  costEfficiencyPerRiskPoint: number; // Cost in INR per risk point mitigated
  selectedAssetIds: string[];
  selectedAssets: Asset[];
  unselectedAssets: Asset[];
  unfundedCriticalAssets?: Asset[];
  criticalBudgetGap?: number;
  portfolioExplanation?: PortfolioExplanationData;
}

export interface HorizonState {
  horizon: string;
  label: string;
  risk: number;
  condition: number;
  cost: number;
  stateDescription: string;
  riskIncreasePct: number;
  costIncreasePct: number;
}

export interface ScenarioPoint {
  risk: number;
  condition: number;
  cost: number;
  maintenance_need: string;
}

export interface YearlyTimelinePoint {
  year: number;
  label: string;
  repair_now: ScenarioPoint;
  partial_repair: ScenarioPoint;
  delay: ScenarioPoint;
}

export interface SimulationResult {
  assetId: string;
  asset: Asset;
  horizons: {
    today: HorizonState;
    sixMonths: HorizonState;
    twelveMonths: HorizonState;
    threeMonths?: HorizonState;
    twentyFourMonths?: HorizonState;
  };
  yearlyTimeline?: YearlyTimelinePoint[];
  scenarios: {
    repairNow: {
      name: string;
      riskAfter: number;
      immediateCost: number;
      fiveYearTCO: number;
      recommendationScore?: number;
      rationale: string;
      isRecommended: boolean;
    };
    delaySixMonths: {
      name: string;
      riskAfter: number;
      projectedCost: number;
      escalationPenalty: number;
      additionalRisk?: number;
      rationale: string;
      isRecommended: boolean;
    };
    partialPatch: {
      name: string;
      riskAfter: number;
      immediateCost: number;
      effectiveLifespanMonths: number;
      rationale: string;
      isRecommended: boolean;
    };
  };
  costOfDelay?: number;
  additionalRiskFromDelay?: number;
  recommendedOption: string;
  recommendationReason: string;
  decisionInsight?: string;
  assumptions?: {
    baseline_year: number;
    deterioration_model: string;
    moisture_stress_factor: string;
    cost_escalation_model: string;
  };
  dataQuality?: {
    historical_observations: number;
    last_inspection: string;
    forecast_reliability: string;
  };
}

export interface CityTimelinePoint {
  year: number;
  proactive_risk: number;
  proactive_cost: number;
  delayed_risk: number;
  delayed_cost: number;
  savings_delta: number;
}

export interface PortfolioSimulationData {
  total_assets_simulated: number;
  city_timeline: CityTimelinePoint[];
  total_5year_savings: number;
  total_risk_points_prevented: number;
}

export interface AssetDecisionReportData {
  report_id: string;
  report_type: string;
  generated_at: string;
  authority: string;
  status: string;
  asset: {
    id: string | number;
    asset_id: string;
    name: string;
    asset_type: string;
    location: string;
    ward?: string;
    zone?: string;
    latitude?: number;
    longitude?: number;
    criticality?: string;
    condition_score: number;
    risk_score: number;
    risk_level: string;
    priority_rank: number;
    estimated_repair_cost: number;
    recommended_action: string;
    damage_type?: string;
    last_inspection?: string;
  };
  risk_assessment: {
    score: number;
    level: string;
    drivers: Array<{
      factor: string;
      impact: string;
      score_contribution: number;
      percentage_share: number;
      description: string;
    }>;
    summary: string;
    what_would_reduce_risk: string;
    preventative_roi: string;
  };
  inspection_findings: {
    condition_rating: string;
    observed_evidence: string[];
    detected_issues: Array<{
      issue: string;
      severity: string;
      evidence: string;
      impact: string;
      confidence?: number;
    }>;
    ai_vision?: {
      damage_type: string;
      confidence: number;
      severity: string;
      description: string;
      model_mode?: string;
    };
    deterioration_signal: string;
    next_recommendation: string;
  };
  priority_assessment: {
    rank: number;
    urgency: string;
    rationale: string;
  };
  recommended_intervention: {
    action: string;
    cost: number;
    cost_type: string;
    expected_risk_reduction: number;
    post_repair_risk: number;
  };
  what_if_simulation: {
    scenarios: any;
    cost_of_delay: number;
    additional_risk_from_delay: number;
    yearly_timeline: YearlyTimelinePoint[];
    decision_insight: string;
  };
  decision_recommendation: {
    headline: string;
    summary: string;
    consequence_of_delay: string;
  };
  assumptions: any;
  data_quality: any;
}

export interface PortfolioDecisionReportData {
  report_id: string;
  report_type: string;
  generated_at: string;
  authority: string;
  status: string;
  overview: {
    city: string;
    region: string;
    total_assets: number;
    critical_assets: number;
    high_risk_assets: number;
    medium_risk_assets: number;
    low_risk_assets: number;
    average_risk: number;
    total_repair_cost: number;
    active_budget_envelope: number;
  };
  priority_corridors: Array<{
    priority_rank: number;
    asset_id: string;
    name: string;
    type: string;
    location: string;
    risk_score: number;
    risk_level: string;
    recommended_action: string;
    estimated_repair_cost: number;
  }>;
  budget_allocation: {
    available_budget: number;
    allocated_budget: number;
    remaining_budget: number;
    budget_utilization_pct: number;
    assets_addressed: number;
    total_risk_reduction: number;
    selected_assets: any[];
    unfunded_critical_count: number;
    critical_budget_gap: number;
    portfolio_explanation?: any;
  };
  citywide_simulation: PortfolioSimulationData;
  decision_recommendation: {
    headline: string;
    summary: string;
    critical_gap_action: string;
  };
  assumptions: any;
}

export interface CopilotEvidenceItem {

  label: string;
  value: string;
  source: string;
}

export interface CopilotActionItem {
  label: string;
  route: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  why?: string;
  evidence?: CopilotEvidenceItem[];
  actions?: CopilotActionItem[];
  suggested_prompts?: string[];
  context_asset?: string;
  source_model?: string;
  model_type?: 'gemini' | 'deterministic' | 'guardrail';
  agent_mode?: string;
}

export interface AIDecisionInsight {
  id: string;
  category: 'CRITICAL' | 'WARNING' | 'OPPORTUNITIES';
  title: string;
  description: string;
  metric_label: string;
  metric_value: string;
  action_type?: string;
  action_label: string;
  action_route: string;
}

export interface AIDecisionInsightsResponse {
  critical_count: number;
  warning_count: number;
  opportunity_count: number;
  insights: {
    critical: AIDecisionInsight[];
    warning: AIDecisionInsight[];
    opportunities: AIDecisionInsight[];
  };
}

// ============================
// Citizen Intelligence Types
// ============================

export type CitizenReportStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'PRIORITIZED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'DUPLICATE';

export interface CitizenValidationFactor {
  signal: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface CitizenReport {
  id: number | string;
  reportId: string;
  userId?: number;
  userName?: string;
  category: string;
  description: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  locationName: string;
  zone?: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  validationScore: number;
  validationStatus: 'LIKELY VALID' | 'NEEDS REVIEW' | 'DUPLICATE REPORT' | 'LOW CONFIDENCE';
  validationFactors?: CitizenValidationFactor[];
  status: CitizenReportStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  nearestAssetId?: string;
  nearestAssetDistanceM?: number;
  assetLinkStatus?: 'NO_ASSET_FOUND' | 'POTENTIAL_MATCH' | 'LINKED' | 'MANUALLY_LINKED' | 'REJECTED';
  assetLinkConfidence?: number;
  assetLinkReason?: string;
  linkedAt?: string;
  linkedBy?: string;
  assignedTo?: string;
  assignedDepartment?: string;
  assignedEngineer?: string;
  targetDate?: string;
  resolutionDescription?: string;
  resolutionPhoto?: string;
  resolvedAt?: string;
  duplicateOfId?: string;
  actionNotes?: string;
  events?: CitizenReportEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CivicAssetLink {
  reportId: string;
  asset?: {
    id: number | string;
    assetId: string;
    name: string;
    assetType: string;
    location: string;
    zone: string;
    riskScore: number;
    riskLevel: string;
    conditionScore: number;
    recommendedAction: string;
    distanceM?: number;
  } | null;
  matchStatus: 'NO_ASSET_FOUND' | 'POTENTIAL_MATCH' | 'LINKED' | 'MANUALLY_LINKED' | 'REJECTED';
  confidence: number;
  reason: string;
  distanceM?: number;
}

export interface AssetEvidenceSummary {
  assetId: string;
  totalReports: number;
  validatedReports: number;
  underReviewReports: number;
  inProgressReports: number;
  resolvedReports: number;
  commonCategory?: string;
  latestObservationDate?: string;
  evidenceContext: string;
  reports: CitizenReport[];
}

export interface CitizenReportEvent {
  id: number;
  reportId: number;
  eventType: string;
  oldStatus?: string;
  newStatus: string;
  actorId: string;
  description: string;
  createdAt: string;
}

export interface CivicReportStats {
  newReports: number;
  underReview: number;
  validated: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  duplicate: number;
  rejected: number;
  highRiskLinked?: number;
  total: number;
}

export interface CitizenReward {
  id: number;
  userId: number;
  reportId?: number;
  points: number;
  reason: string;
  status: 'EARNED' | 'CREDITED' | 'PENDING' | 'REDEEMED' | 'CANCELLED';
  createdAt: string;
}

export interface CategoryContribution {
  category: string;
  count: number;
}

export interface ContributionJourneyEvent {
  title: string;
  reportId: string;
  points: number;
  date: string;
}

export interface CitizenImpact {
  reportsSubmitted: number;
  reportsValidated: number;
  issuesResolved: number;
  roadsImproved: number;
  infrastructureProtected: number;
  pointsEarned: number;
  currentBalance: number;
  summaryMessage: string;
  categoriesContributed?: CategoryContribution[];
  contributionJourney?: ContributionJourneyEvent[];
}

export interface CivicRewardOption {
  rewardId: string;
  title: string;
  description: string;
  pointsCost: number;
  demoValueInr: number;
  category: string;
}

export interface CivicPointTransaction {
  id: number;
  userId: number;
  reportId?: number;
  transactionType: 'EARN' | 'REDEEM' | 'ADJUSTMENT';
  points: number;
  balanceAfter: number;
  reason: string;
  referenceId: string;
  createdAt: string;
}

export interface CitizenWallet {
  currentBalance: number;
  lifetimeEarned: number;
  pending: number;
  pendingBreakdown?: {
    waitingForValidation?: number;
    waitingForMunicipalAction?: number;
    waitingForResolution?: number;
  };
  redeemed: number;
  rewards: CitizenReward[];
}

export interface ReportRewardBreakdown {
  reportId: string;
  status: string;
  submissionPoints: number;
  validationPoints: number;
  actionPoints: number;
  resolutionPoints: number;
  totalEarned: number;
  rewards: CitizenReward[];
}

export interface CitizenLeaderboardItem {
  rank: number;
  name: string;
  reportsValidated?: number;
  issuesResolved?: number;
  civicxPoints: number;
  badge: string;
  avatarColor?: string;
}

export interface CitizenReportCreateInput {
  category: string;
  description: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  zone?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  userName?: string;
  userEmail?: string;
}

// ============================================================
// ENTERPRISE DOMAIN TYPES (PROMPT 1/10)
// ============================================================

export interface AuditEvent {
  id: number;
  eventType: string;
  entityType: string;
  entityId: string;
  actorId: string;
  actorType: 'CITIZEN' | 'ENGINEER' | 'INSPECTOR' | 'SYSTEM' | 'ADMIN';
  oldValue?: string | null;
  newValue?: string | null;
  metadataJson?: string | null;
  requestId?: string;
  timestamp: string;
}

export interface RiskAssessmentRecord {
  id: number;
  assetId: number | string;
  conditionScore: number;
  damageScore: number;
  trafficScore: number;
  criticalityScore: number;
  environmentScore: number;
  deteriorationScore: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  algorithmVersion: string;
  calculatedAt: string;
}

export interface DecisionRecordItem {
  id: number;
  assetId: number | string;
  decisionVersion: string;
  priorityScore: number;
  priorityRank: number;
  recommendedIntervention: string;
  estimatedCost: number;
  budgetStatus: string;
  costOfDelay6m: number;
  verdict: string;
  createdAt: string;
}

export interface RewardLedgerEntry {
  id: number;
  userId: number;
  reportId?: number | null;
  transactionType: 'EARN' | 'BONUS' | 'REDEEM' | 'REVERSAL';
  points: number;
  balanceAfter: number;
  reason: string;
  referenceId?: string;
  createdAt: string;
}

export interface DataQualityReport {
  totalAssetsAudited: number;
  validAssets: number;
  warningAssets: number;
  invalidAssets: number;
  overallHealthScore: number;
  dataFreshnessPct: number;
}

export interface TelemetryRecordItem {
  id: number;
  sourceId?: number;
  assetId?: number;
  metricType: string;
  value: number;
  unit: string;
  qualityScore: number;
  recordedAt: string;
}

export interface CivicMapIntelligenceResponse {
  assets: Array<{
    id: number;
    asset_id: string;
    name: string;
    type: string;
    location: string;
    zone: string;
    latitude: number;
    longitude: number;
    risk_level: string;
    risk_score: number;
    condition_score: number;
    priority: string;
    recommended_action: string;
    estimated_repair_cost: number;
  }>;
  reports: Array<{
    id: number;
    report_id: string;
    category: string;
    description: string;
    photo_url?: string;
    latitude: number;
    longitude: number;
    location_name: string;
    zone?: string;
    severity: string;
    status: string;
    validation_score: number;
    validation_status: string;
    nearest_asset_id?: string;
    nearest_asset_distance_m?: number;
    asset_link_status?: string;
    created_at: string;
  }>;
  summary: {
    total_assets: number;
    total_reports: number;
    critical_assets: number;
    high_risk_assets: number;
    active_reports: number;
  };
}

// ============================================================
// AI INFRASTRUCTURE INSPECTION TYPES (PROMPT 7)
// ============================================================

export interface BoundingBoxCoordinates {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  width: number; // 0-100 percentage
  height: number; // 0-100 percentage
}

export interface AIDetection {
  damage_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number; // 0.0 to 1.0
  bbox: BoundingBoxCoordinates;
  reason?: string;
}

export interface AIInspectionFeedback {
  id: number;
  inspection_id: number;
  reviewer_id: string;
  reviewer_role: string;
  review_result: 'CONFIRMED' | 'FLAGGED_FOR_MANUAL_REVIEW' | 'DISAGREED';
  suggested_damage_type?: string;
  review_notes?: string;
  created_at: string;
}

export interface AIInspection {
  id: number;
  inspection_id: string;
  report_id?: string | null;
  asset_id?: string | null;
  image_url: string;
  annotated_image_url?: string;
  model_name: string;
  model_version: string;
  domain: string;
  damage_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  confidence_band: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'LOW CONFIDENCE';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'LOW_CONFIDENCE' | 'FAILED';
  detections: AIDetection[];
  evidence: string[];
  summary?: string;
  disclaimer: string;
  feedbacks?: AIInspectionFeedback[];
  created_at: string;
}

export interface AIInspectionCategoryCount {
  category: string;
  count: number;
  average_confidence: number;
}

export interface AIInspectionStats {
  total_images_analyzed: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  low_confidence_count: number;
  manual_review_flagged: number;
  model_accuracy_benchmark: string;
  top_detected_conditions: AIInspectionCategoryCount[];
}

// ============================================================
// PREDICTIVE INFRASTRUCTURE DETERIORATION TYPES (PROMPT 8)
// ============================================================

export interface ForecastHorizonPoint {
  horizon: string; // "6M", "12M", "24M", "36M"
  months: number;
  condition: number;
  lower_bound: number;
  upper_bound: number;
  projected_risk: number;
  condition_band: 'Good' | 'Fair' | 'Poor' | 'Critical';
}

export interface DeteriorationForecast {
  asset_id: string;
  asset_name?: string;
  asset_type?: string;
  model_name: string;
  model_version: string;
  prediction_timestamp: string;
  current_condition: number;
  current_risk: number;
  data_quality: 'HIGH' | 'MEDIUM' | 'LOW';
  is_available: boolean;
  unavailable_reason?: string | null;
  recommended_action?: string | null;
  deterioration_rate: number;
  trend: 'STABLE' | 'MODERATE' | 'ACCELERATING';
  forecast: ForecastHorizonPoint[];
  critical_threshold_crossing: string;
  maintenance_window: string;
  maintenance_urgency?: string;
  evidence_chain: string[];
  decision_disclaimer: string;
}

export interface PredictiveSummary {
  total_assets_evaluated: number;
  accelerating_count: number;
  critical_under_12m: number;
  maintenance_under_6m: number;
  low_data_confidence_count: number;
  avg_projected_loss_12m: number;
  risk_mitigation_window_breakdown: Record<string, number>;
}

export interface PredictivePriorityItem {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  zone: string;
  current_risk: number;
  risk_level: string;
  current_condition: number;
  forecast_12m: number;
  trend: 'STABLE' | 'MODERATE' | 'ACCELERATING';
  maintenance_window: string;
  priority_rank: number;
}

// ============================================================
// DIGITAL TWIN & WHAT-IF SIMULATION TYPES (PROMPT 9)
// ============================================================

export type LifecycleStage = 'PLANNING' | 'CONSTRUCTION' | 'OPERATION' | 'INSPECTION' | 'MAINTENANCE' | 'REHABILITATION' | 'RENEWAL';
export type ScenarioInterventionType = 'DO_NOTHING' | 'ROUTINE_MAINTENANCE' | 'PREVENTIVE_MAINTENANCE' | 'REHABILITATION' | 'RECONSTRUCTION';
export type ScenarioStatus = 'DRAFT' | 'SIMULATED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';

export interface DigitalTwinTrajectoryPoint {
  year: number;
  tag: 'ACTUAL' | 'FORECAST' | 'SIMULATION';
  condition: number;
  risk: number;
  cost_cumulative: number;
  status: string;
}

export interface DigitalTwinScenarioConfig {
  intervention_type: ScenarioInterventionType;
  intervention_name: string;
  timing_months: number;
  timing_label: string;
  target_budget: number;
  description: string;
}

export interface DigitalTwinEffectiveness {
  condition_gain_pts: number;
  risk_reduction_pts: number;
  lifespan_extension_years: number;
  cost_of_delay: number;
  delay_cost_penalty_pct: number;
}

export interface DigitalTwinFinancials {
  initial_cost: number;
  immediate_cost: number;
  cost_of_delay: number;
  five_year_tco_simulated: number;
  five_year_tco_do_nothing: number;
  net_lifecycle_savings: number;
}

export interface DigitalTwinScenarioResult {
  asset_id: string;
  scenario: DigitalTwinScenarioConfig;
  effectiveness: DigitalTwinEffectiveness;
  financials: DigitalTwinFinancials;
  trajectories: {
    years: number[];
    do_nothing: DigitalTwinTrajectoryPoint[];
    simulated: DigitalTwinTrajectoryPoint[];
  };
  explainability: string;
  model_metadata: Record<string, string>;
}

export interface SavedDigitalTwinScenario {
  id: number;
  asset_id: string;
  name: string;
  intervention_type: ScenarioInterventionType;
  timing_months: number;
  budget: number;
  scenario_status: ScenarioStatus;
  simulation_result?: DigitalTwinScenarioResult;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface DigitalTwinState {
  asset_id: string;
  name: string;
  asset_type: string;
  location: string;
  zone: string;
  latitude: number;
  longitude: number;
  condition_score: number;
  risk_score: number;
  risk_level: string;
  priority_rank: number;
  recommended_action: string;
  estimated_repair_cost: number;
  last_inspection_date?: string;
  lifecycle_stage: LifecycleStage;
  data_freshness: string;
  citizen_signals: {
    total_reports: number;
    validated_reports: number;
    active_reports: number;
    latest_report_id?: string;
    latest_category?: string;
  };
  ai_inspection_signals: {
    inspection_id: string;
    detected_damage: string;
    confidence: number;
    inspection_date: string;
    human_review_status: string;
  };
  forecast_summary: {
    is_available: boolean;
    trend: string;
    deterioration_rate: number;
    maintenance_window: string;
    critical_threshold_crossing: string;
    forecast_12m: number;
  };
  scenarios: Record<string, any>;
}

// ============================================================
// EXECUTIVE DECISION RECOMMENDATION & ACTION TYPES (PROMPT 10)
// ============================================================

export type RecommendationType = 'INSPECT' | 'MONITOR' | 'PREVENTIVE_MAINTENANCE' | 'REHABILITATE' | 'RECONSTRUCT' | 'REVIEW_BUDGET';
export type RecommendationUrgency = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'ROUTINE';
export type MunicipalActionStatus = 'NEW' | 'UNDER_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MONITORING';

export interface DecisionRecommendation {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  recommendation_type: RecommendationType;
  action_title: string;
  urgency: RecommendationUrgency;
  target_window: string;
  estimated_cost: number;
  decision_confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  expected_impact: string;
  why_explanation: string[];
  decision_chain_stage: string;
  is_funded: boolean;
}

export interface CityRecommendationsSummary {
  total_evaluated: number;
  critical_reconstruct_count: number;
  urgent_rehabilitate_count: number;
  preventive_maintenance_count: number;
  inspection_required_count: number;
  monitor_count: number;
  total_recommended_budget: number;
  unfunded_priority_budget: number;
  attention_required: DecisionRecommendation[];
  can_wait_monitor: DecisionRecommendation[];
}

export interface MunicipalActionItem {
  id: number;
  asset_id: string;
  action_type: RecommendationType;
  title: string;
  urgency: RecommendationUrgency;
  status: MunicipalActionStatus;
  assigned_dept: string;
  due_window: string;
  estimated_cost: number;
  rationale?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface MunicipalActionCreateInput {
  asset_id: string;
  action_type: string;
  title: string;
  urgency?: string;
  assigned_dept?: string;
  due_window?: string;
  estimated_cost?: number;
  rationale?: string;
}



