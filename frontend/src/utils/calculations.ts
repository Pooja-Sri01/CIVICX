import { Asset, OptimizationResult, SimulationResult, RiskLevel } from '../types';

/**
 * Deterministic Risk Calculation Formula:
 * Risk = w_c * (100 - Condition) + w_d * Severity + w_k * Criticality + w_u * Usage + w_h * Trend + w_e * Environment
 */
export function calculateRiskScore(params: {
  conditionScore: number;
  damageSeverity: number;
  criticalityScore: number;
  usageScore: number;
  trendScore: number;
  exposureScore: number;
}): { riskScore: number; riskLevel: RiskLevel; factors: Array<{ factor: string; scoreContribution: number }> } {
  const c = Math.max(0, Math.min(100, params.conditionScore));
  const d = Math.max(0, Math.min(100, params.damageSeverity));
  const k = Math.max(0, Math.min(100, params.criticalityScore));
  const u = Math.max(0, Math.min(100, params.usageScore));
  const h = Math.max(0, Math.min(100, params.trendScore));
  const e = Math.max(0, Math.min(100, params.exposureScore));

  const c_contrib = 0.25 * (100 - c);
  const d_contrib = 0.25 * d;
  const k_contrib = 0.20 * k;
  const u_contrib = 0.15 * u;
  const h_contrib = 0.10 * h;
  const e_contrib = 0.05 * e;

  const total = Math.round(c_contrib + d_contrib + k_contrib + u_contrib + h_contrib + e_contrib);
  const clamped = Math.max(1, Math.min(99, total));

  let level: RiskLevel = 'Low';
  if (clamped >= 76) level = 'Critical';
  else if (clamped >= 51) level = 'High';
  else if (clamped >= 26) level = 'Medium';

  return {
    riskScore: clamped,
    riskLevel: level,
    factors: [
      { factor: 'Condition Deficit (100-C)', scoreContribution: Number(c_contrib.toFixed(1)) },
      { factor: 'Damage Severity', scoreContribution: Number(d_contrib.toFixed(1)) },
      { factor: 'Criticality Multiplier', scoreContribution: Number(k_contrib.toFixed(1)) },
      { factor: 'Traffic / Usage Loading', scoreContribution: Number(u_contrib.toFixed(1)) },
      { factor: 'Historical Degradation Trend', scoreContribution: Number(h_contrib.toFixed(1)) },
      { factor: 'Environmental Exposure', scoreContribution: Number(e_contrib.toFixed(1)) },
    ],
  };
}

/**
 * Budget Optimization Knapsack Heuristic:
 * Value metric = (Risk Reduction * Criticality) / (Repair Cost ^ 0.6)
 * Maximizes risk reduction subject to sum(Cost) <= Available Budget
 */
export function runBudgetOptimization(
  assets: Asset[],
  budget: number,
  strategy: 'civicx_value_max' | 'fifo_baseline' = 'civicx_value_max'
): OptimizationResult {
  const sorted = [...assets];

  if (strategy === 'civicx_value_max') {
    // Greedy heuristic by risk-reduction efficiency
    sorted.sort((a, b) => {
      // Expected risk reduction if repaired: post-repair risk ~ 12
      const deltaA = Math.max(10, a.riskScore - 12);
      const deltaB = Math.max(10, b.riskScore - 12);

      const valueA = (deltaA * (a.criticalityScore / 50.0)) / Math.pow(Math.max(100000, a.estimatedRepairCost), 0.55);
      const valueB = (deltaB * (b.criticalityScore / 50.0)) / Math.pow(Math.max(100000, b.estimatedRepairCost), 0.55);

      return valueB - valueA;
    });
  } else {
    // Naive First-Reported / ID order
    sorted.sort((a, b) => a.id.localeCompare(b.id));
  }

  const selected: Asset[] = [];
  const unselected: Asset[] = [];
  let currentCost = 0;

  for (const asset of sorted) {
    if (currentCost + asset.estimatedRepairCost <= budget) {
      selected.push(asset);
      currentCost += asset.estimatedRepairCost;
    } else {
      unselected.push(asset);
    }
  }

  const initialTotalRisk = assets.reduce((sum, a) => sum + a.riskScore, 0);
  // Repaired assets drop to nominal post-repair risk 12
  const postRepairTotalRisk = assets.reduce((sum, a) => {
    if (selected.some((s) => s.id === a.id)) {
      return sum + 12;
    }
    return sum + a.riskScore;
  }, 0);

  const totalRiskReduction = initialTotalRisk - postRepairTotalRisk;
  const riskReductionPercent = initialTotalRisk > 0 ? (totalRiskReduction / initialTotalRisk) * 100 : 0;
  const costEfficiencyPerRiskPoint = totalRiskReduction > 0 ? currentCost / totalRiskReduction : 0;

  return {
    budget,
    strategy,
    allocatedCost: currentCost,
    unallocatedCost: Math.max(0, budget - currentCost),
    budgetUtilizationPct: budget > 0 ? (currentCost / budget) * 100 : 0,
    assetsRepairedCount: selected.length,
    totalAssetsConsidered: assets.length,
    initialTotalRisk,
    postRepairTotalRisk,
    totalRiskReduction,
    riskReductionPercent: Number(riskReductionPercent.toFixed(1)),
    costEfficiencyPerRiskPoint: Math.round(costEfficiencyPerRiskPoint),
    selectedAssetIds: selected.map((s) => s.id),
    selectedAssets: selected,
    unselectedAssets: unselected,
  };
}

/**
 * City Time Machine Deterioration Simulator:
 * Models asset degradation curves across Today, +6 Months, and +12 Months
 * with decision options: Repair Now, Delay 6 Months, Partial Patch
 */
export function simulateAssetTrajectory(asset: Asset): SimulationResult {
  const currentRisk = asset.riskScore;
  const currentCond = asset.conditionScore;
  const baseCost = asset.estimatedRepairCost;

  // Horizon 6 Months if left untreated
  const sixMoRiskIncrease = Math.round(Math.min(99 - currentRisk, (100 - currentCond) * 0.18 + 7));
  const sixMoRisk = Math.min(98, currentRisk + sixMoRiskIncrease);
  const sixMoCond = Math.max(5, currentCond - Math.round(currentCond * 0.28 + 6));
  const sixMoCost = Math.round(baseCost * 1.52);

  // Horizon 12 Months if left untreated
  const twelveMoRiskIncrease = Math.round(Math.min(99 - currentRisk, sixMoRiskIncrease * 1.8 + 10));
  const twelveMoRisk = Math.min(99, currentRisk + twelveMoRiskIncrease);
  const twelveMoCond = Math.max(2, currentCond - Math.round(currentCond * 0.55 + 14));
  const twelveMoCost = Math.round(baseCost * 2.45);

  return {
    assetId: asset.assetId,
    asset,
    horizons: {
      today: {
        horizon: 'Today',
        label: 'Current Status',
        risk: currentRisk,
        condition: currentCond,
        cost: baseCost,
        stateDescription: 'Active surface and structural distress as verified by latest visual and sensor telemetry.',
        riskIncreasePct: 0,
        costIncreasePct: 0,
      },
      sixMonths: {
        horizon: '+6 Months',
        label: 'Delay 6 Months (Untreated)',
        risk: sixMoRisk,
        condition: sixMoCond,
        cost: sixMoCost,
        stateDescription: 'Subgrade water ingress propagates fatigue cracking into extensive potholes. Base course degradation begins.',
        riskIncreasePct: Number((((sixMoRisk - currentRisk) / Math.max(1, currentRisk)) * 100).toFixed(1)),
        costIncreasePct: 52,
      },
      twelveMonths: {
        horizon: '+12 Months',
        label: 'Delay 12 Months (Untreated)',
        risk: twelveMoRisk,
        condition: twelveMoCond,
        cost: twelveMoCost,
        stateDescription: 'Full structural foundation failure. Routine resurfacing impossible; requires emergency full-depth reconstruction and road closure.',
        riskIncreasePct: Number((((twelveMoRisk - currentRisk) / Math.max(1, currentRisk)) * 100).toFixed(1)),
        costIncreasePct: 145,
      },
    },
    scenarios: {
      repairNow: {
        name: 'Repair Now (Preventative)',
        riskAfter: 12,
        immediateCost: baseCost,
        fiveYearTCO: Math.round(baseCost * 1.15),
        recommendationScore: 96,
        rationale: `Locks repair cost at ₹${(baseCost / 100000).toFixed(1)}L, reducing risk score from ${currentRisk} to 12. Halts subgrade water infiltration before subsequent monsoon.`,
        isRecommended: true,
      },
      delaySixMonths: {
        name: 'Delay 6 Months',
        riskAfter: 28,
        projectedCost: sixMoCost,
        escalationPenalty: Math.round(sixMoCost - baseCost),
        rationale: `Compounding degradation causes ₹${((sixMoCost - baseCost) / 100000).toFixed(1)}L (+52%) financial penalty. Emergency repairs will cause severe commuter disruption.`,
        isRecommended: false,
      },
      partialPatch: {
        name: 'Partial Patch / Cold Fill',
        riskAfter: 54,
        immediateCost: Math.round(baseCost * 0.22),
        effectiveLifespanMonths: 4,
        rationale: 'Low upfront cost but failure recurrence rate >78% within 4 months. Fails to arrest sub-base erosion.',
        isRecommended: false,
      },
    },
    recommendedOption: 'Repair Now (Preventative)',
    recommendationReason: `CivicX recommends immediate repair because delaying intervention past 6 months triggers a ₹${((sixMoCost - baseCost) / 100000).toFixed(1)}L cost penalty while escalating risk to ${sixMoRisk}.`,
  };
}
