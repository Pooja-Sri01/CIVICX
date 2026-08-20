import { Asset, DashboardSummary, OptimizationResult, SimulationResult, MaintenanceLog } from '../types';
import { INITIAL_ASSETS, DEMO_SUMMARY } from '../data/seedData';
import { calculateRiskScore, runBudgetOptimization, simulateAssetTrajectory } from '../utils/calculations';

const API_BASE = '/api';

export interface RiskDistributionData {
  total_assets: number;
  distribution: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  average_risk: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  historical_trend_summary: string;
}

export interface InspectionAnalysisResult {
  damage_type: string;
  confidence: number;
  severity: string;
  description: string;
  model_mode: string;
}

function normalizeBackendAsset(raw: any): Asset {
  if (raw.assetId && raw.conditionScore !== undefined) {
    return raw as Asset;
  }

  const cond = raw.condition_score ?? 50;
  const severity = raw.damage_severity ?? 50;
  const risk = raw.risk_score ?? 50;
  const crit = raw.criticality ?? 'MEDIUM';
  const usage = raw.usage_score ?? 50;
  const cost = raw.estimated_repair_cost ?? 500000;

  return {
    id: String(raw.id ?? raw.asset_id),
    assetId: raw.asset_id ?? `AST-${raw.id}`,
    name: raw.name ?? 'Infrastructure Asset',
    type: raw.asset_type ?? 'Road',
    location: raw.location ?? 'Coimbatore, Tamil Nadu',
    ward: raw.ward ?? 'Ward 24',
    zone: raw.zone ?? 'Central Zone',
    latitude: raw.latitude ?? 11.0168,
    longitude: raw.longitude ?? 76.9673,
    conditionScore: cond,
    damageSeverity: severity,
    damageType: raw.damage_type ?? 'Pavement Fatigue Cracking & Localized Raveling',
    riskScore: risk,
    riskLevel: (raw.risk_level === 'CRITICAL' ? 'Critical' : raw.risk_level === 'HIGH' ? 'High' : raw.risk_level === 'MEDIUM' ? 'Medium' : 'Low') as any,
    criticality: (crit === 'CRITICAL' ? 'Critical' : crit === 'HIGH' ? 'High' : crit === 'MEDIUM' ? 'Medium' : 'Low') as any,
    criticalityScore: crit === 'CRITICAL' ? 96 : crit === 'HIGH' ? 85 : crit === 'MEDIUM' ? 60 : 30,
    usage: `Urban Transit Corridor (${(15000 + usage * 450).toLocaleString()} PCU/day)`,
    usageScore: usage,
    historicalTrend: `Accelerating degradation (+${raw.historical_deterioration ?? 18}%/yr)`,
    trendScore: Math.min(100, Math.round((raw.historical_deterioration ?? 18) * 3)),
    environmentalExposure: 'Monsoon Inundation & Traffic Load',
    exposureScore: Math.round(raw.environmental_exposure ?? 50),
    estimatedRepairCost: cost,
    priorityRank: raw.priority_rank ?? 1,
    recommendedAction: raw.recommended_action ?? 'Preventative Resurfacing & Base Stabilization',
    image: raw.image_url ?? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
    detectedBBoxes: risk >= 60 ? [
      { label: 'Surface Distress (D40)', confidence: 0.94, x: 25, y: 40, width: 45, height: 32 }
    ] : [],
    lastInspection: raw.last_inspection_date ?? '2026-08-14',
    maintenanceHistory: (raw.maintenance_records || []).map((m: any) => ({
      date: m.date,
      action: m.maintenance_type,
      cost: m.cost,
      vendor: m.vendor ?? 'Municipal Maintenance Division',
      conditionAfter: m.condition_after ?? 80
    })),
    explainability: {
      summary: `Asset evaluated in ${raw.zone || 'Coimbatore'} showing ${raw.risk_level || 'MEDIUM'} risk based on condition index ${cond}% and traffic density.`,
      topFactors: [
        {
          factor: 'Structural Condition Deficit',
          impact: cond < 40 ? 'Critical' : 'Moderate',
          weight: 0.25,
          scoreContribution: Number((0.25 * (100 - cond)).toFixed(1)),
          description: `Condition index recorded at ${cond}/100.`
        },
        {
          factor: 'Corridor Criticality & Evacuation',
          impact: crit === 'CRITICAL' ? 'Critical' : 'High',
          weight: 0.20,
          scoreContribution: Number((0.20 * (crit === 'CRITICAL' ? 95 : 75)).toFixed(1)),
          description: `Ranked as ${crit} strategic public route.`
        },
        {
          factor: 'Traffic & Usage Loading',
          impact: usage > 75 ? 'High' : 'Moderate',
          weight: 0.15,
          scoreContribution: Number((0.15 * usage).toFixed(1)),
          description: `Carrying approximately ${(15000 + usage * 450).toLocaleString()} daily passenger vehicle units.`
        },
        {
          factor: 'Monsoon Hydro-Dynamic Stress',
          impact: 'Moderate',
          weight: 0.10,
          scoreContribution: Number((0.10 * (raw.environmental_exposure ?? 50)).toFixed(1)),
          description: `Environmental exposure index at ${Math.round(raw.environmental_exposure ?? 50)}/100.`
        }
      ],
      whyRank: raw.priority_reason ?? `Ranked #${raw.priority_rank ?? 1} based on multi-factor lifecycle ROI.`,
      preventativeROI: `${Number((2.5 + risk / 25.0).toFixed(1))}x ROI vs Delayed Fix`
    }
  };
}

export const ApiService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return {
          city: data.city,
          region: data.region,
          totalAssets: data.total_assets,
          criticalAssets: data.critical_assets,
          highRiskAssets: data.high_risk_assets,
          mediumRiskAssets: data.medium_risk_assets,
          lowRiskAssets: data.low_risk_assets,
          activeRepairPlanCost: data.total_estimated_repair_cost,
          availableBudget: data.available_budget,
          riskDistribution: {
            critical: data.risk_distribution.CRITICAL ?? data.risk_distribution.critical ?? 0,
            high: data.risk_distribution.HIGH ?? data.risk_distribution.high ?? 0,
            medium: data.risk_distribution.MEDIUM ?? data.risk_distribution.medium ?? 0,
            low: data.risk_distribution.LOW ?? data.risk_distribution.low ?? 0,
          },
          categoryRisk: (data.category_summary || []).map((c: any) => ({
            category: c.asset_type,
            total: c.count,
            avgRisk: c.average_risk,
            criticalCount: c.critical_count,
            totalEstCost: c.total_repair_cost
          })),
          recentAlerts: (data.top_priority_assets || []).slice(0, 4).map((a: any) => ({
            id: String(a.id),
            assetId: a.asset_id,
            name: a.name,
            risk: a.risk_score,
            riskLevel: (a.risk_level === 'CRITICAL' ? 'Critical' : a.risk_level === 'HIGH' ? 'High' : a.risk_level === 'MEDIUM' ? 'Medium' : 'Low') as any,
            timestamp: 'Verified Telemetry',
            action: a.recommended_action
          }))
        };
      }
    } catch {
      // Graceful fallback to client seed data
    }
    return DEMO_SUMMARY;
  },

  async getRiskDistribution(): Promise<RiskDistributionData> {
    try {
      const res = await fetch(`${API_BASE}/assets/risk-distribution`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      total_assets: DEMO_SUMMARY.totalAssets,
      distribution: {
        CRITICAL: DEMO_SUMMARY.riskDistribution.critical,
        HIGH: DEMO_SUMMARY.riskDistribution.high,
        MEDIUM: DEMO_SUMMARY.riskDistribution.medium,
        LOW: DEMO_SUMMARY.riskDistribution.low
      },
      average_risk: 54.2,
      critical_count: DEMO_SUMMARY.riskDistribution.critical,
      high_count: DEMO_SUMMARY.riskDistribution.high,
      medium_count: DEMO_SUMMARY.riskDistribution.medium,
      low_count: DEMO_SUMMARY.riskDistribution.low,
      historical_trend_summary: '28.4% of assets require prioritized structural interventions to prevent monsoon flood disruption.'
    };
  },

  async getAssets(params?: { type?: string; riskLevel?: string; criticality?: string; zone?: string; search?: string }): Promise<Asset[]> {
    try {
      const query = new URLSearchParams();
      if (params?.type && params.type !== 'All') query.set('asset_type', params.type);
      if (params?.riskLevel && params.riskLevel !== 'All') query.set('risk_level', params.riskLevel.toUpperCase());
      if (params?.zone && params.zone !== 'All') query.set('zone', params.zone);
      if (params?.search) query.set('search', params.search);

      const res = await fetch(`${API_BASE}/assets?${query.toString()}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const rawList = await res.json();
        let list = rawList.map(normalizeBackendAsset);
        if (params?.criticality && params.criticality !== 'All') {
          list = list.filter((a: Asset) => a.criticality.toLowerCase() === params.criticality?.toLowerCase());
        }
        return list;
      }
    } catch {
      // Graceful fallback
    }

    let result = [...INITIAL_ASSETS];
    if (params?.type && params.type !== 'All') result = result.filter(a => a.type.toLowerCase() === params.type?.toLowerCase());
    if (params?.riskLevel && params.riskLevel !== 'All') result = result.filter(a => a.riskLevel.toLowerCase() === params.riskLevel?.toLowerCase());
    if (params?.criticality && params.criticality !== 'All') result = result.filter(a => a.criticality.toLowerCase() === params.criticality?.toLowerCase());
    if (params?.zone && params.zone !== 'All') result = result.filter(a => a.zone.toLowerCase() === params.zone?.toLowerCase());
    if (params?.search) {
      const s = params.search.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(s) || a.assetId.toLowerCase().includes(s) || a.location.toLowerCase().includes(s));
    }
    return result;
  },

  async getAssetById(id: string): Promise<Asset | null> {
    try {
      const res = await fetch(`${API_BASE}/assets/${id}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const raw = await res.json();
        return normalizeBackendAsset(raw);
      }
    } catch {
      // Graceful fallback
    }
    const found = INITIAL_ASSETS.find(a => a.id === id || a.assetId.toLowerCase() === id.toLowerCase());
    return found || INITIAL_ASSETS[0];
  },

  async getAssetMaintenance(assetId: string): Promise<MaintenanceLog[]> {
    try {
      const res = await fetch(`${API_BASE}/assets/${assetId}/maintenance`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return data.map((m: any) => ({
          date: m.date,
          action: m.maintenance_type,
          cost: m.cost,
          vendor: m.vendor ?? 'Coimbatore Municipal Works',
          conditionAfter: m.condition_after ?? 80
        }));
      }
    } catch {
      // Fallback
    }
    const asset = await this.getAssetById(assetId);
    return asset?.maintenanceHistory || [];
  },

  async analyzeInspection(assetId: string, imageUrl?: string): Promise<InspectionAnalysisResult> {
    try {
      const res = await fetch(`${API_BASE}/inspection/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: assetId, image_url: imageUrl }),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      damage_type: 'Severe Pothole (D40) & Fatigue Cracking (D20)',
      confidence: 0.94,
      severity: 'HIGH',
      description: 'Visible surface depression and structural cracking detected in the inspected pavement zone.',
      model_mode: 'DEMO_INSPECTION'
    };
  },

  async getPriorities(): Promise<Asset[]> {
    try {
      const res = await fetch(`${API_BASE}/priorities`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const rawList = await res.json();
        return rawList.map(normalizeBackendAsset);
      }
    } catch {
      // Graceful fallback
    }
    return [...INITIAL_ASSETS].sort((a, b) => a.priorityRank - b.priorityRank);
  },

  async calculateRisk(params: {
    conditionScore: number;
    damageSeverity: number;
    criticalityScore: number;
    usageScore: number;
    trendScore: number;
    exposureScore: number;
  }) {
    try {
      const res = await fetch(`${API_BASE}/risk/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condition_score: params.conditionScore,
          damage_severity: params.damageSeverity,
          usage_score: params.usageScore,
          criticality: params.criticalityScore >= 80 ? 'CRITICAL' : params.criticalityScore >= 60 ? 'HIGH' : 'MEDIUM',
          historical_deterioration: params.trendScore / 3.0,
          environmental_exposure: params.exposureScore
        }),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return calculateRiskScore(params);
  },

  async optimizeBudget(budget: number, strategy: 'civicx_value_max' | 'fifo_baseline' = 'civicx_value_max'): Promise<OptimizationResult> {
    try {
      const res = await fetch(`${API_BASE}/budget/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available_budget: budget,
          strategy
        }),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        return {
          budget: data.available_budget,
          strategy: data.strategy as any,
          allocatedCost: data.total_cost,
          unallocatedCost: data.remaining_budget,
          budgetUtilizationPct: data.budget_utilization_pct,
          assetsRepairedCount: data.assets_repaired,
          totalAssetsConsidered: data.total_assets_evaluated,
          initialTotalRisk: data.initial_total_risk,
          postRepairTotalRisk: data.post_repair_total_risk,
          totalRiskReduction: data.estimated_risk_reduction,
          riskReductionPercent: data.risk_reduction_percentage,
          costEfficiencyPerRiskPoint: data.cost_per_risk_point_reduced,
          selectedAssetIds: data.selected_asset_ids,
          selectedAssets: (data.selected_assets || []).map(normalizeBackendAsset),
          unselectedAssets: (data.unselected_assets || []).map(normalizeBackendAsset)
        };
      }
    } catch {
      // Fallback
    }
    return runBudgetOptimization(INITIAL_ASSETS, budget, strategy);
  },

  async runSimulation(assetId: string): Promise<SimulationResult> {
    try {
      const res = await fetch(`${API_BASE}/simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: assetId }),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        const asset = await this.getAssetById(assetId);
        return {
          assetId: data.asset_id,
          asset: asset || INITIAL_ASSETS[0],
          horizons: {
            today: {
              horizon: 'Today',
              label: 'Current Status',
              risk: data.current_state.risk_score,
              condition: data.current_state.condition_score,
              cost: data.current_state.base_cost,
              stateDescription: 'Active surface and structural distress confirmed by telemetry.',
              riskIncreasePct: 0,
              costIncreasePct: 0
            },
            sixMonths: {
              horizon: '+6 Months',
              label: data.horizons['6_months'].horizon,
              risk: data.horizons['6_months'].projected_risk,
              condition: data.horizons['6_months'].projected_condition,
              cost: data.horizons['6_months'].estimated_cost,
              stateDescription: data.horizons['6_months'].state_summary,
              riskIncreasePct: Number((((data.horizons['6_months'].projected_risk - data.current_state.risk_score) / Math.max(1, data.current_state.risk_score)) * 100).toFixed(1)),
              costIncreasePct: data.horizons['6_months'].cost_increase_pct
            },
            twelveMonths: {
              horizon: '+12 Months',
              label: data.horizons['12_months'].horizon,
              risk: data.horizons['12_months'].projected_risk,
              condition: data.horizons['12_months'].projected_condition,
              cost: data.horizons['12_months'].estimated_cost,
              stateDescription: data.horizons['12_months'].state_summary,
              riskIncreasePct: Number((((data.horizons['12_months'].projected_risk - data.current_state.risk_score) / Math.max(1, data.current_state.risk_score)) * 100).toFixed(1)),
              costIncreasePct: data.horizons['12_months'].cost_increase_pct
            }
          },
          scenarios: {
            repairNow: {
              name: data.scenarios.REPAIR_NOW.title,
              riskAfter: data.scenarios.REPAIR_NOW.projected_risk,
              immediateCost: data.scenarios.REPAIR_NOW.estimated_cost,
              fiveYearTCO: data.scenarios.REPAIR_NOW.five_year_tco,
              recommendationScore: 96,
              rationale: data.scenarios.REPAIR_NOW.rationale,
              isRecommended: true
            },
            delaySixMonths: {
              name: data.scenarios.DELAY.title,
              riskAfter: data.scenarios.DELAY.projected_risk,
              projectedCost: data.scenarios.DELAY.estimated_cost,
              escalationPenalty: data.scenarios.DELAY.penalty_amount,
              rationale: data.scenarios.DELAY.rationale,
              isRecommended: false
            },
            partialPatch: {
              name: data.scenarios.PARTIAL_REPAIR.title,
              riskAfter: data.scenarios.PARTIAL_REPAIR.projected_risk,
              immediateCost: data.scenarios.PARTIAL_REPAIR.estimated_cost,
              effectiveLifespanMonths: data.scenarios.PARTIAL_REPAIR.effective_lifespan_months,
              rationale: data.scenarios.PARTIAL_REPAIR.rationale,
              isRecommended: false
            }
          },
          recommendedOption: data.recommended_scenario,
          recommendationReason: data.recommendation_reason
        };
      }
    } catch {
      // Fallback
    }
    const asset = INITIAL_ASSETS.find(a => a.id === assetId || a.assetId.toLowerCase() === assetId.toLowerCase()) || INITIAL_ASSETS[0];
    return simulateAssetTrajectory(asset);
  },

  async generateReport(assetId: string) {
    const asset = await this.getAssetById(assetId);
    const target = asset || INITIAL_ASSETS[0];
    const sim = await this.runSimulation(target.id);
    return {
      reportId: `REP-2026-${target.assetId}`,
      generatedAt: new Date().toISOString(),
      authority: "Coimbatore Municipal Infrastructure Command",
      asset: target,
      simulation: sim,
      recommendedAction: target.recommendedAction,
      budgetImpact: target.estimatedRepairCost
    };
  }
};
