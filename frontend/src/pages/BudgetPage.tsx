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
  Info
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
  { label: '₹5M', value: 5000000 },
  { label: '₹10M', value: 10000000 },
  { label: '₹15M', value: 15000000 },
  { label: '₹20M', value: 20000000 },
  { label: '₹25M (Cap)', value: 25000000 },
];

export const BudgetPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedAssetId = searchParams.get('asset');

  const [budget, setBudget] = useState<number>(15000000);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<OptimizationResult | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runOptimization = async (budgetToRun: number) => {
    setOptimizing(true);
    setError(null);
    try {
      // Run both CivicX knapsack value-maximization and the naive FIFO baseline
      const [optData, baseData] = await Promise.all([
        ApiService.optimizeBudget(budgetToRun, 'civicx_value_max'),
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
    runOptimization(budget);
  }, []);

  const handleBudgetChange = (newVal: number) => {
    setBudget(newVal);
  };

  const handleApplyBudget = () => {
    runOptimization(budget);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto animate-spin text-civic-dark">
          <Sliders className="w-6 h-6 text-lime-dark" />
        </div>
        <h3 className="font-display font-bold text-lg text-civic-dark">
          Evaluating Repair Portfolios…
        </h3>
        <p className="text-xs text-zinc-500 font-mono">
          Executing Multi-Criteria Knapsack Optimization across Coimbatore Inventory
        </p>
      </div>
    );
  }

  if (error || !result) {
    return <ErrorState message={error || undefined} onRetry={() => runOptimization(budget)} />;
  }

  const comparisonChartData = [
    {
      name: 'Initial Risk',
      risk: result.initialTotalRisk,
      fill: '#DC2626',
    },
    {
      name: 'Conventional Baseline',
      risk: baselineResult ? baselineResult.postRepairTotalRisk : result.initialTotalRisk * 0.75,
      fill: '#94A3B8',
    },
    {
      name: 'CivicX Optimized',
      risk: result.postRepairTotalRisk,
      fill: '#059669',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-civic-border"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-civic-dark tracking-tight">
              BUDGET OPTIMIZER
            </h1>
            <span className="bg-lime text-civic-dark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
              KNAPSACK ALGORITHM
            </span>
            <span className="bg-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
              DEMO ENVIRONMENT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            “Allocate limited resources where they reduce the most infrastructure risk.”
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/priorities"
            className="px-3.5 py-2 rounded-xl bg-white border border-civic-border text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-all shadow-subtle"
          >
            <span>Priority Queue</span>
          </Link>
          <Link
            to="/simulation"
            className="px-3.5 py-2 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-subtle flex items-center gap-1.5"
          >
            <span>City Time Machine</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime" />
          </Link>
        </div>
      </motion.div>

      {/* 2. Interactive Budget Control Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-civic-border bg-white shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-zinc-400 block">
              MUNICIPAL CAPITAL ENVELOPE
            </span>
            <h3 className="font-display font-extrabold text-2xl text-civic-dark mt-0.5">
              {formatINR(budget)}
            </h3>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_BUDGETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  handleBudgetChange(preset.value);
                  runOptimization(preset.value);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                  budget === preset.value
                    ? 'bg-civic-dark text-lime shadow-subtle'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider & Trigger Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
          <div className="sm:col-span-9 space-y-2">
            <input
              type="range"
              min="2000000"
              max="30000000"
              step="500000"
              value={budget}
              onChange={(e) => handleBudgetChange(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-lime-dark"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>₹2M (Emergency Min)</span>
              <span>₹15M (Mid Target)</span>
              <span>₹30M (Max Envelope)</span>
            </div>
          </div>

          <div className="sm:col-span-3">
            <button
              onClick={handleApplyBudget}
              disabled={optimizing}
              className="w-full py-2.5 px-4 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50"
            >
              {optimizing ? (
                <span>Optimizing…</span>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5 text-lime" />
                  <span>Run Optimization</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Budget Overview (5 Key Metrics) */}
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
          badge="High Efficiency"
          badgeType="lime"
          icon={ShieldCheck}
        />
        <MetricCard
          title="REMAINING"
          value={formatINR(result.unallocatedCost)}
          subtitle="Unused Reserve"
          icon={Building}
        />
        <MetricCard
          title="ASSETS REPAIRED"
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

      {/* 4. Main Portfolio Grid + Selected Asset Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recommended Repair Portfolio */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-3xl border border-civic-border overflow-hidden shadow-subtle">
            <div className="p-4 bg-white border-b border-civic-border flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-civic-dark">
                  CIVICX OPTIMIZED REPAIR PORTFOLIO
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {result.selectedAssets.length} Assets Selected • Maximizing ΔRisk / Cost
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Optimal Portfolio
              </span>
            </div>

            {result.selectedAssets.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
                <AlertCircle className="w-6 h-6 text-zinc-400 mx-auto" />
                <p className="font-semibold text-zinc-700">No repair portfolio can be created within the selected budget.</p>
                <p>Please increase the capital budget slider above to evaluate interventions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
                    <tr>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Asset</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Risk</th>
                      <th className="py-2.5 px-3">Repair Cost</th>
                      <th className="py-2.5 px-3 text-right">Simulate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/70 bg-white">
                    {result.selectedAssets.map((asset) => {
                      const isSelected = selectedAsset?.id === asset.id;
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
                            <p className="text-[10px] text-zinc-500 font-mono">{asset.type}</p>
                          </td>
                          <td className="py-3 px-3 max-w-[140px] truncate text-zinc-700">
                            {asset.location.split(',')[0]}
                          </td>
                          <td className="py-3 px-3">
                            <RiskBadge level={asset.riskLevel} score={asset.riskScore} size="sm" />
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                            {formatINR(asset.estimatedRepairCost)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/simulation?asset=${asset.id}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[11px] font-semibold text-civic-dark transition-colors inline-flex items-center gap-1"
                            >
                              <span>Simulate</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
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
              className="glass-panel p-6 rounded-3xl border-2 border-civic-dark bg-white shadow-elevated space-y-5 sticky top-24"
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
                </div>
                <RiskBadge level={selectedAsset.riskLevel} score={selectedAsset.riskScore} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Repair Cost</span>
                  <p className="font-bold text-zinc-900 mt-0.5">{formatINR(selectedAsset.estimatedRepairCost)}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Target Action</span>
                  <p className="font-bold text-zinc-900 mt-0.5 truncate">{selectedAsset.recommendedAction}</p>
                </div>
              </div>

              {/* Rationale */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-lime-dark" />
                  <span>PORTFOLIO SELECTION REASON</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-medium bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/70">
                  {selectedAsset.explainability?.whyRank}
                </p>
              </div>

              {/* Connected Action to City Time Machine */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <button
                  onClick={() => navigate(`/simulation?asset=${selectedAsset.id}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                >
                  <span>Simulate This Decision (City Time Machine)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-lime" />
                </button>

                <Link
                  to={`/assets/${selectedAsset.id}`}
                  className="w-full py-2 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 text-center block"
                >
                  <span>Open Asset Intelligence →</span>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl border border-civic-border text-zinc-500 text-xs">
              Select an asset from the optimized portfolio to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* 5. Before vs CivicX Comparison & Risk Reduction Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Exposure Reduction Chart */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-civic-border bg-white shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="font-display font-bold text-base text-civic-dark">
                Citywide Risk Exposure Impact
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Initial Risk vs Baseline vs CivicX Knapsack Optimization
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              -{result.riskReductionPercent}% Risk
            </span>
          </div>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717A' }} />
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

          <p className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
            CivicX achieves <span className="font-bold text-civic-dark">{result.totalRiskReduction} points</span> of total municipal risk reduction for a capital investment of {formatINR(result.allocatedCost)}.
          </p>
        </div>

        {/* Side-by-Side Comparison Card */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-civic-border bg-white shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h3 className="font-display font-bold text-base text-civic-dark">
              Approach Comparison
            </h3>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
              Prototype Baseline
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Conventional */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase block">
                Conventional First-Come
              </span>
              <div className="space-y-1 text-xs">
                <p className="text-zinc-600">Assets Repaired: <span className="font-bold text-zinc-900">{baselineResult?.assetsRepairedCount ?? 0}</span></p>
                <p className="text-zinc-600">Risk Reduced: <span className="font-bold text-zinc-900">{baselineResult?.riskReductionPercent ?? 0}%</span></p>
                <p className="text-zinc-600">Budget Utilized: <span className="font-bold text-zinc-900">{baselineResult?.budgetUtilizationPct ?? 0}%</span></p>
              </div>
              <p className="text-[10px] text-zinc-400 italic">
                Allocates strictly on report arrival timestamp without risk-to-cost weighting.
              </p>
            </div>

            {/* CivicX */}
            <div className="p-4 rounded-2xl bg-lime/10 border border-lime/30 space-y-3">
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
              <p className="text-[10px] text-zinc-600 font-medium">
                Solves greedy ROI knapsack maximizing citywide hazard reduction per rupee.
              </p>
            </div>
          </div>

          {/* WHY THIS PLAN? Explanation */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs space-y-1">
            <p className="font-bold text-civic-dark flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-700" />
              <span>WHY THESE ASSETS?</span>
            </p>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              CivicX prioritizes assets that provide the greatest expected risk reduction relative to repair cost while respecting the available budget constraint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
