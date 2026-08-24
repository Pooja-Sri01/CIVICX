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



