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

export interface SimulationResult {
  assetId: string;
  asset: Asset;
  horizons: {
    today: HorizonState;
    sixMonths: HorizonState;
    twelveMonths: HorizonState;
  };
  scenarios: {
    repairNow: {
      name: string;
      riskAfter: number;
      immediateCost: number;
      fiveYearTCO: number;
      recommendationScore: number;
      rationale: string;
      isRecommended: boolean;
    };
    delaySixMonths: {
      name: string;
      riskAfter: number;
      projectedCost: number;
      escalationPenalty: number;
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
  recommendedOption: string;
  recommendationReason: string;
}
