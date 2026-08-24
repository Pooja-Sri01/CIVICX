import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Sliders, 
  Wallet, 
  TrendingDown, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  RotateCcw, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Building,
  Info,
  Layers,
  Compass,
  AlertOctagon,
  DollarSign,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

import { ApiService } from '../services/api';
import { OptimizationResult, Asset } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { MetricCard } from '../components/common/MetricCard';
import { ErrorState } from '../components/common/ErrorState';
import { formatINR } from '../utils/formatters';

const PRESET_BUDGETS = [
  { label: '₹50 Lakh', value: 5000000 },
  { label: '₹1.00 Crore', value: 10000000 },
  { label: '₹1.50 Crore', value: 15000000 },
  { label: '₹2.00 Crore', value: 20000000 },
  { label: '₹2.50 Crore', value: 25000000 },
  { label: '₹3.00 Crore (Cap)', value: 30000000 },
];

export const BudgetPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedAssetId = searchParams.get('asset');

  const [budgetInput, setBudgetInput] = useState<number>(15000000);
  const [strategy, setStrategy] = useState<'civicx_value_max' | 'fifo_baseline'>('civicx_value_max');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<OptimizationResult | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [scenarios, setScenarios] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const runOptimization = async (budgetToRun: number, optStrategy = strategy) => {
    if (isNaN(budgetToRun) || budgetToRun <= 0) {
      setValidationError('Please enter a valid municipal budget amount greater than ₹0.');
      return;
    }
    setValidationError(null);
    setOptimizing(true);
    setError(null);

    try {
      // Run both CivicX knapsack value-maximization and the naive FIFO baseline
      const [optData, baseData] = await Promise.all([
        ApiService.optimizeBudget(budgetToRun, optStrategy),
        ApiService.optimizeBudget(budgetToRun, 'fifo_baseline'),
      ]);
      setResult(optData);
      setBaselineResult(baseData);

      if (optData.selectedAssets.length > 0) {
        if (preselectedAssetId) {
          const found = optData.selectedAssets.find(
            (a) => a.id === preselectedAssetId || a.assetId.toLowerCase() === preselectedAssetId.toLowerCase()
          );
          setSelectedAsset(found || optData.selectedAssets[0]);
        } else {
          setSelectedAsset(optData.selectedAssets[0]);
        }
      } else {
        setSelectedAsset(null);
      }
    } catch (err) {
      console.error('Budget optimization failed', err);
      setError('Could not complete budget portfolio optimization.');
    } finally {
      setOptimizing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    runOptimization(budgetInput, strategy);
    // Load scenario comparison asynchronously (non-blocking)
    ApiService.getBudgetScenarios().then(setScenarios).catch(() => {});
  }, []);

  const handleBudgetChange = (newVal: number) => {
    setBudgetInput(newVal);
    if (newVal > 0) setValidationError(null);
  };

  const handleApplyBudget = () => {
    runOptimization(budgetInput, strategy);
  };

  const handleAddGapToBudget = (gapAmount: number) => {
    const newBudget = budgetInput + gapAmount;
    setBudgetInput(newBudget);
    runOptimization(newBudget, strategy);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto animate-spin text-civic-dark">
          <Sliders className="w-6 h-6 text-lime-dark" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg text-civic-dark">
            OPTIMIZING MAINTENANCE PORTFOLIO
          </h3>
          <p className="text-xs text-zinc-500 font-mono">
            Evaluating candidate interventions → Comparing lifecycle costs → Calculating risk reduction → Selecting optimal portfolio
          </p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <ErrorState 
        title="OPTIMIZATION UNAVAILABLE"
        message={error || "CivicX optimization service is currently unreachable."} 
        onRetry={() => runOptimization(budgetInput, strategy)} 
      />
    );
  }

  const comparisonChartData = [
    {
      name: 'Initial Risk',
      risk: result.initialTotalRisk,
      fill: '#DC2626',
    },
    {
      name: 'Conventional Baseline (FIFO)',
      risk: baselineResult ? baselineResult.postRepairTotalRisk : result.initialTotalRisk * 0.75,
      fill: '#94A3B8',
    },
    {
      name: 'CivicX Knapsack (Value-Max)',
      risk: result.postRepairTotalRisk,
      fill: '#059669',
    },
  ];

  const unfundedCritical = result.unfundedCriticalAssets || [];
  const criticalGap = result.criticalBudgetGap || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header & Stepper Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-200 text-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 font-bold text-zinc-600 hover:text-civic-dark transition-colors font-mono"
          >
            <Compass className="w-3.5 h-3.5 text-zinc-500" />
            <span>COMMAND CENTER</span>
          </Link>
          <span className="text-zinc-300">•</span>
          <Link
            to="/priorities"
            className="inline-flex items-center gap-1.5 font-bold text-zinc-600 hover:text-civic-dark transition-colors font-mono"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span>PRIORITY QUEUE</span>
          </Link>
          <span className="text-zinc-300">•</span>
          <Link
            to="/simulation"
            className="inline-flex items-center gap-1.5 font-bold text-zinc-600 hover:text-civic-dark transition-colors font-mono"
          >
            <span>CITY TIME MACHINE</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-lime text-civic-dark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
            MCDA KNAPSACK
          </span>
          <span className="bg-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
            COIMBATORE INVENTORY
          </span>
        </div>
      </div>

      {/* 2. Editorial Title */}
      <div className="space-y-1">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-civic-dark tracking-tight">
          BUDGET OPTIMIZER
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 font-sans">
          Allocate limited municipal resources where they achieve the maximum measurable infrastructure risk reduction.
        </p>
      </div>

      {/* 3. Interactive Budget Control Panel */}
      <div className="p-6 rounded-3xl border border-zinc-200 bg-white shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase font-bold text-zinc-400 block">
              MUNICIPAL CAPITAL ENVELOPE (INR)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl sm:text-3xl text-civic-dark">
                {formatINR(budgetInput)}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                ({(budgetInput / 100000).toFixed(1)} Lakhs)
              </span>
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_BUDGETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  handleBudgetChange(preset.value);
                  runOptimization(preset.value, strategy);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                  budgetInput === preset.value
                    ? 'bg-civic-dark text-lime shadow-subtle'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Field + Range Slider & Optimization Trigger */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
              Custom Budget Entry (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-400 font-mono text-xs">₹</span>
              <input
                type="number"
                min="500000"
                max="50000000"
                step="500000"
                value={budgetInput}
                onChange={(e) => handleBudgetChange(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold text-civic-dark bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime"
                placeholder="Enter budget in ₹"
              />
            </div>
            {validationError && (
              <p className="text-[10px] text-red-600 font-mono">{validationError}</p>
            )}
          </div>

          <div className="sm:col-span-5 space-y-2">
            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
              Interactive Envelope Slider
            </label>
            <input
              type="range"
              min="2000000"
              max="30000000"
              step="500000"
              value={budgetInput}
              onChange={(e) => handleBudgetChange(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-lime-dark"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>₹20L (Emergency)</span>
              <span>₹1.5 Cr (Mid)</span>
              <span>₹3.0 Cr (Max)</span>
            </div>
          </div>

          <div className="sm:col-span-3 pt-2 sm:pt-0">
            <button
              onClick={handleApplyBudget}
              disabled={optimizing}
              className="w-full py-2.5 px-4 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50 font-mono"
            >
              {optimizing ? (
                <span>Optimizing Portfolio…</span>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5 text-lime" />
                  <span>RUN OPTIMIZATION</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Budget Summary Metrics (5 Key Decision Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="AVAILABLE BUDGET"
          value={formatINR(result.budget)}
          subtitle="Input Envelope"
          icon={Wallet}
        />
        <MetricCard
          title="ALLOCATED"
          value={formatINR(result.allocatedCost)}
          subtitle={`${result.budgetUtilizationPct}% utilized`}
          badge="Allocated"
          badgeType="lime"
          icon={ShieldCheck}
        />
        <MetricCard
          title="REMAINING"
          value={formatINR(result.unallocatedCost)}
          subtitle="Unallocated Reserve"
          icon={Building}
        />
        <MetricCard
          title="ASSETS ADDRESSED"
          value={`${result.assetsRepairedCount} / ${result.totalAssetsConsidered}`}
          subtitle="Selected Interventions"
          icon={CheckCircle2}
        />
        <MetricCard
          title="EXPECTED RISK REDUCTION"
          value={`-${result.riskReductionPercent}%`}
          subtitle={`${result.totalRiskReduction} Total Risk Pts`}
          badge="Citywide Relief"
          badgeType="critical"
          icon={TrendingDown}
        />
      </div>

      {/* 4.5. Budget Scenario Comparison Table */}
      {scenarios && scenarios.scenarios && (
        <div className="rounded-3xl bg-white border border-zinc-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-mono uppercase font-bold text-zinc-600 tracking-widest">BUDGET SCENARIO ANALYSIS</h3>
            <span className="text-[10px] font-mono text-zinc-400 ml-2">4 Capital Tiers · What does the city get?</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-100">
                <tr>
                  <th className="py-2.5 px-4">Budget Envelope</th>
                  <th className="py-2.5 px-3 text-center">Assets Funded</th>
                  <th className="py-2.5 px-3 text-center">Risk Reduction</th>
                  <th className="py-2.5 px-3 text-center">Critical Protected</th>
                  <th className="py-2.5 px-3 text-center">Unfunded Critical</th>
                  <th className="py-2.5 px-3 text-center">Budget Used</th>
                  <th className="py-2.5 px-3 text-center">₹ / Risk Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {scenarios.scenarios.map((sc: any, i: number) => {
                  const isActive = Math.abs(sc.budget_amount - budgetInput) < 1_000_000;
                  return (
                    <tr
                      key={i}
                      className={`transition-colors ${
                        isActive
                          ? 'bg-lime/10 border-l-2 border-l-lime-dark'
                          : 'hover:bg-zinc-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-civic-dark">{sc.budget_label}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{formatINR(sc.budget_amount)}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-blue-600">{sc.assets_funded}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="font-bold text-emerald-600">-{sc.risk_reduction} pts</div>
                        <div className="text-[10px] text-zinc-400">{sc.risk_reduction_percentage.toFixed(1)}%</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-violet-600">{sc.critical_assets_funded}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${sc.unfunded_critical > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {sc.unfunded_critical === 0 ? '✓ 0' : sc.unfunded_critical}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-zinc-700">{sc.budget_utilization_pct.toFixed(1)}%</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-zinc-600">₹{Math.round(sc.cost_per_risk_point / 1000)}K</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2 bg-zinc-50 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 font-mono">
              CIVICX MCDA Knapsack · {scenarios.total_assets_evaluated} assets evaluated · Strategy: Value-Maximization
            </p>
          </div>
        </div>
      )}

      {/* 5. Critical Asset Budget Gap Alert (if any critical corridors remain unfunded) */}
      {unfundedCritical.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/80 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200/70 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-950 uppercase font-mono">
                  CRITICAL INFRASTRUCTURE BUDGET GAP
                </span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.2 rounded font-mono">
                  {unfundedCritical.length} Corridor(s) Unfunded
                </span>
              </div>
              <p className="text-xs text-amber-900/90 font-medium mt-0.5">
                {unfundedCritical.length} Critical/High-risk asset(s) cannot be funded under the current {formatINR(result.budget)} envelope. 
                An additional <span className="font-bold">{formatINR(criticalGap)}</span> is required to cover all critical infrastructure.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAddGapToBudget(criticalGap)}
            className="px-3.5 py-2 rounded-xl bg-amber-900 text-amber-50 text-xs font-mono font-bold hover:bg-amber-950 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-subtle"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>Add +{formatINR(criticalGap)} & Re-optimize</span>
          </button>
        </div>
      )}

      {/* 6. Main Portfolio Grid + Selected Asset Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recommended Repair Portfolio Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-subtle">
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-extrabold text-sm text-civic-dark uppercase tracking-tight">
                  RECOMMENDED INTERVENTIONS PORTFOLIO
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {result.selectedAssets.length} Assets Selected • Maximizing (ΔRisk × Criticality) / Cost
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                Optimal Allocation
              </span>
            </div>

            {result.selectedAssets.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 space-y-2 font-mono">
                <AlertCircle className="w-6 h-6 text-zinc-400 mx-auto" />
                <p className="font-bold text-zinc-700">NO INTERVENTIONS FUNDABLE WITHIN BUDGET</p>
                <p>Please increase the capital budget entry above to generate an actionable repair portfolio.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
                    <tr>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Asset / Type</th>
                      <th className="py-2.5 px-3">Risk Shift</th>
                      <th className="py-2.5 px-3">Intervention Action</th>
                      <th className="py-2.5 px-3">Estimated Cost</th>
                      <th className="py-2.5 px-3">Efficiency</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/70 bg-white">
                    {result.selectedAssets.map((asset) => {
                      const isSelected = selectedAsset?.id === asset.id;
                      const currRisk = asset.currentRisk ?? asset.riskScore;
                      const postRisk = asset.postRepairRisk ?? 12;
                      const riskReduction = asset.riskReduction ?? Math.max(0, currRisk - postRisk);

                      return (
                        <tr
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-zinc-100 font-medium' : 'hover:bg-zinc-50/80'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold">
                            <span className="w-6 h-6 rounded bg-civic-dark text-lime text-xs font-mono font-bold flex items-center justify-center">
                              #{asset.priorityRank < 10 ? `0${asset.priorityRank}` : asset.priorityRank}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-civic-dark">{asset.assetId}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{asset.type} • {asset.location.split(',')[0]}</p>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-red-600">{currRisk}</span>
                              <span className="text-zinc-400">→</span>
                              <span className="font-bold text-emerald-600">{postRisk}</span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-bold">
                                -{riskReduction}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-zinc-700 max-w-[150px] truncate text-[11px]">
                            {asset.interventionType || asset.recommendedAction}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                            {formatINR(asset.estimatedRepairCost)}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-zinc-600">
                            {asset.costEfficiencyMetric ?? ((riskReduction / (asset.estimatedRepairCost / 100000)).toFixed(1))} pts/₹L
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/simulation?asset=${asset.id}`);
                                }}
                                className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[10px] font-mono font-bold text-civic-dark transition-colors inline-flex items-center gap-1"
                                title="Simulate Decision"
                              >
                                <span>Sim</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/assets/${asset.id}`);
                                }}
                                className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                                title="View Inspection Details"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Asset Intelligence & Connected Next Steps */}
        <div className="lg:col-span-5 space-y-6">
          {selectedAsset ? (
            <motion.div
              key={selectedAsset.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="p-6 rounded-3xl border-2 border-civic-dark bg-white shadow-elevated space-y-5 sticky top-24"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-civic-dark text-lime font-mono font-bold text-xs flex items-center justify-center">
                      #{selectedAsset.priorityRank < 10 ? `0${selectedAsset.priorityRank}` : selectedAsset.priorityRank}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-500">
                      {selectedAsset.assetId} • {selectedAsset.type}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-lg text-civic-dark mt-1">
                    {selectedAsset.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    {selectedAsset.location} ({selectedAsset.zone || 'Central Zone'})
                  </p>
                </div>
                <RiskBadge level={selectedAsset.riskLevel} score={selectedAsset.riskScore} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Estimated Cost</span>
                  <p className="font-bold text-zinc-900 mt-0.5 font-mono">{formatINR(selectedAsset.estimatedRepairCost)}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Target Action</span>
                  <p className="font-bold text-zinc-900 mt-0.5 truncate">{selectedAsset.interventionType || selectedAsset.recommendedAction}</p>
                </div>
              </div>

              {/* Rationale */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-lime-dark" />
                  <span>PORTFOLIO SELECTION RATIONALE</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-medium bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/70">
                  {selectedAsset.selectionReason || selectedAsset.explainability?.whyRank || 
                    `Prioritized based on high risk-to-cost mitigation efficiency (${selectedAsset.costEfficiencyMetric ?? 3.5} pts/₹L) and strategic route criticality.`}
                </p>
              </div>

              {/* Connected Actions */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <button
                  onClick={() => navigate(`/simulation?asset=${selectedAsset.id}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-subtle font-mono"
                >
                  <span>Simulate This Decision (City Time Machine)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-lime" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/assets/${selectedAsset.id}`}
                    className="py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-semibold transition-colors flex items-center justify-center gap-1 text-center font-mono"
                  >
                    <span>Inspection Data</span>
                  </Link>

                  <Link
                    to="/map"
                    className="py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-semibold transition-colors flex items-center justify-center gap-1 text-center font-mono"
                  >
                    <span>View on Map</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-12 text-center rounded-3xl border border-zinc-200 bg-white text-zinc-500 text-xs font-mono">
              Select an asset from the portfolio table to inspect intervention details.
            </div>
          )}
        </div>
      </div>

      {/* 7. "WHY THIS PORTFOLIO?" & Methodology Explanation Card */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-civic-dark" />
            <h3 className="font-display font-extrabold text-base text-civic-dark">
              WHY THIS PORTFOLIO?
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold">
            MCDA KNAPSACK SYNTHESIS
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block tracking-wider">
            PORTFOLIO SELECTION SUMMARY
          </span>
          <p className="text-xs text-zinc-800 leading-relaxed font-medium">
            {result.portfolioExplanation?.summary ||
              `CivicX optimized portfolio funds ${result.assetsRepairedCount} interventions delivering ${result.totalRiskReduction} points of citywide risk reduction (-${result.riskReductionPercent}%) within the ${formatINR(result.budget)} envelope.`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Optimization Objective</span>
            <p className="font-bold text-civic-dark">Maximize Risk Reduction (ΔRisk × Criticality) / Cost</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Risk Reduction Efficiency</span>
            <p className="font-mono font-bold text-emerald-700">{result.portfolioExplanation?.risk_mitigation_efficiency || `${((result.totalRiskReduction / (result.allocatedCost / 100000)).toFixed(2))} Pts / ₹ Lakh`}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Budget Constraint</span>
            <p className="font-bold text-zinc-800 font-mono">Strict Ceiling ≤ {formatINR(result.budget)}</p>
          </div>
        </div>
      </div>

      {/* 8. Before vs After Risk Comparison Chart & Methodology Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Exposure Reduction Chart */}
        <div className="lg:col-span-6 p-6 rounded-3xl border border-zinc-200 bg-white shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="font-display font-bold text-base text-civic-dark">
                Citywide Risk Exposure Impact
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Initial Risk vs Baseline vs CivicX Knapsack Optimization
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              -{result.riskReductionPercent}% Risk
            </span>
          </div>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717A' }} />
                <YAxis tick={{ fontSize: 10, fill: '#71717A' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Total Risk Pts`, 'Score']}
                  contentStyle={{ backgroundColor: '#1A1A1A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="risk" radius={[6, 6, 0, 0]}>
                  {comparisonChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 font-sans">
            CivicX delivers <span className="font-bold text-civic-dark">{result.totalRiskReduction} points</span> of total municipal risk reduction for a capital investment of {formatINR(result.allocatedCost)}.
          </p>
        </div>

        {/* Side-by-Side Comparison Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl border border-zinc-200 bg-white shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h3 className="font-display font-bold text-base text-civic-dark">
              Approach Comparison
            </h3>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold">
              PORTFOLIO BENCHMARK
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Conventional FIFO */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase block">
                Conventional FIFO
              </span>
              <div className="space-y-1 text-xs">
                <p className="text-zinc-600">Assets Repaired: <span className="font-bold text-zinc-900 font-mono">{baselineResult?.assetsRepairedCount ?? 0}</span></p>
                <p className="text-zinc-600">Risk Reduced: <span className="font-bold text-zinc-900 font-mono">+{baselineResult?.riskReductionPercent ?? 0}%</span></p>
                <p className="text-zinc-600">Budget Utilized: <span className="font-bold text-zinc-900 font-mono">{baselineResult?.budgetUtilizationPct ?? 0}%</span></p>
              </div>
              <p className="text-[10px] text-zinc-400 italic font-sans pt-1">
                Allocates strictly on report arrival timestamp without risk-to-cost weighting.
              </p>
            </div>

            {/* CivicX Knapsack */}
            <div className="p-4 rounded-2xl bg-lime/10 border border-lime/30 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-civic-dark uppercase block">
                  CivicX Knapsack
                </span>
                <span className="w-2 h-2 rounded-full bg-lime-dark" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-zinc-800">Assets Repaired: <span className="font-bold text-civic-dark font-mono">{result.assetsRepairedCount}</span></p>
                <p className="text-zinc-800">Risk Reduced: <span className="font-bold text-emerald-700 font-mono">+{result.riskReductionPercent}%</span></p>
                <p className="text-zinc-800">Budget Utilized: <span className="font-bold text-civic-dark font-mono">{result.budgetUtilizationPct}%</span></p>
              </div>
              <p className="text-[10px] text-zinc-600 font-medium font-sans pt-1">
                Multi-criteria optimization maximizing risk relief per rupee invested.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs space-y-1">
            <p className="font-bold text-civic-dark flex items-center gap-1.5 font-mono text-[11px]">
              <Info className="w-3.5 h-3.5 text-zinc-700" />
              <span>DECISION ADVANTAGE:</span>
            </p>
            <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
              CivicX prioritizes critical transit arteries and high-severity distress over low-impact repairs, generating superior risk reduction within identical budget limits.
            </p>
          </div>
        </div>
      </div>

      {/* 9. DEFERRED ASSETS (Unfunded Candidate Queue) */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-subtle overflow-hidden">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-extrabold text-sm text-civic-dark uppercase tracking-tight">
              DEFERRED ASSETS (UNFUNDED CANDIDATE QUEUE)
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              {result.unselectedAssets.length} Assets Deferred • Requires additional capital or subsequent cycle funding
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
            Deferred Queue
          </span>
        </div>

        {result.unselectedAssets.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 font-mono">
            All candidate infrastructure assets successfully funded under the current budget envelope!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Asset ID</th>
                  <th className="py-2.5 px-3">Type & Location</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3">Required Intervention</th>
                  <th className="py-2.5 px-3">Estimated Cost</th>
                  <th className="py-2.5 px-3">Deferral Reason</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 bg-white">
                {result.unselectedAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-civic-dark">
                      {asset.assetId}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-civic-dark">{asset.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{asset.type} • {asset.location.split(',')[0]}</p>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={asset.riskLevel} score={asset.riskScore} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-zinc-700 text-[11px] max-w-[140px] truncate">
                      {asset.interventionType || asset.recommendedAction}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                      {formatINR(asset.estimatedRepairCost)}
                    </td>
                    <td className="py-3 px-3 text-zinc-600 font-mono text-[11px]">
                      {asset.deferralReason || `Requires additional funding beyond current ₹${(result.budget / 100000).toFixed(0)}L envelope.`}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/assets/${asset.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[10px] font-mono font-bold text-civic-dark transition-colors inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

