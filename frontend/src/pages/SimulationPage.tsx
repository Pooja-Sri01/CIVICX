import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  Sparkles, 
  Sliders, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight,
  TrendingDown,
  Activity,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

import { ApiService } from '../services/api';
import { Asset, SimulationResult } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { ErrorState } from '../components/common/ErrorState';
import { formatINR } from '../utils/formatters';

type ScenarioKey = 'repairNow' | 'partialPatch' | 'delaySixMonths';
type HorizonKey = 'today' | 'sixMonths' | 'twelveMonths';

export const SimulationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assetIdParam = searchParams.get('asset');

  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('repairNow');
  const [activeHorizon, setActiveHorizon] = useState<HorizonKey>('sixMonths');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load priorities and initial asset
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const priorities = await ApiService.getPriorities();
        setAllAssets(priorities);

        let initialId = priorities[0]?.id || '1';
        if (assetIdParam) {
          const matched = priorities.find(
            (a) => a.id === assetIdParam || a.assetId.toLowerCase() === assetIdParam.toLowerCase()
          );
          if (matched) initialId = matched.id;
        }

        setSelectedAssetId(initialId);
        const simData = await ApiService.runSimulation(initialId);
        setSimulation(simData);
      } catch (err) {
        console.error('Simulation initialization failed', err);
        setError('Could not initialize City Time Machine simulation.');
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [assetIdParam]);

  const handleSelectAsset = async (newId: string) => {
    setSelectedAssetId(newId);
    setSimulating(true);
    try {
      const simData = await ApiService.runSimulation(newId);
      setSimulation(simData);
    } catch (err) {
      console.error('Simulation update failed', err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto animate-spin text-civic-dark">
          <Clock className="w-6 h-6 text-lime-dark" />
        </div>
        <h3 className="font-display font-bold text-lg text-civic-dark">
          Simulating Future Scenarios…
        </h3>
        <p className="text-xs text-zinc-500 font-mono">
          City Time Machine executing multi-horizon degradation modeling
        </p>
      </div>
    );
  }

  if (error || !simulation) {
    return <ErrorState message={error || undefined} onRetry={() => handleSelectAsset(selectedAssetId)} />;
  }

  const asset = simulation.asset;

  // Multi-horizon trajectory chart data
  const chartData = [
    {
      horizon: 'Today',
      'Repair Now': 12,
      'Partial Patch': 54,
      'Delay (Untreated)': asset.riskScore,
    },
    {
      horizon: '+3 Mo',
      'Repair Now': 14,
      'Partial Patch': 65,
      'Delay (Untreated)': Math.min(98, asset.riskScore + 8),
    },
    {
      horizon: '+6 Mo',
      'Repair Now': 18,
      'Partial Patch': 78,
      'Delay (Untreated)': simulation.horizons.sixMonths.risk,
    },
    {
      horizon: '+12 Mo',
      'Repair Now': 24,
      'Partial Patch': 89,
      'Delay (Untreated)': simulation.horizons.twelveMonths.risk,
    },
  ];

  // Active scenario data
  const currentScenario = simulation.scenarios[activeScenario];
  const horizonData = simulation.horizons[activeHorizon];

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
              CITY TIME MACHINE
            </h1>
            <span className="bg-lime text-civic-dark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
              PREDICTIVE SIMULATION
            </span>
            <span className="bg-zinc-200 text-zinc-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
              PROTOTYPE SIMULATION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            “Simulate the future before you commit the budget.”
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/budget?asset=${asset.id}`}
            className="px-3.5 py-2 rounded-xl bg-white border border-civic-border text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-all shadow-subtle flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-600" />
            <span>Budget Optimizer</span>
          </Link>
          <Link
            to={`/assets/${asset.id}`}
            className="px-3.5 py-2 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-subtle flex items-center gap-1.5"
          >
            <span>Asset Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime" />
          </Link>
        </div>
      </motion.div>

      {/* 2. Asset Selector & Quick State Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-civic-border bg-white shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
              Select Infrastructure Asset to Simulate
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => handleSelectAsset(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-civic-dark focus:outline-none focus:ring-2 focus:ring-lime"
            >
              {allAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.priorityRank} {a.assetId} — {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          {/* Current State Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 block">CURRENT RISK</span>
              <span className="font-bold font-mono text-sm text-civic-dark">{asset.riskScore} / 100</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 block">CONDITION</span>
              <span className="font-bold font-mono text-sm text-zinc-900">{asset.conditionScore}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 block">BASE REPAIR COST</span>
              <span className="font-bold font-mono text-sm text-zinc-900">{formatINR(asset.estimatedRepairCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Scenario Segmented Control + Time Horizon Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Scenario Tabs */}
        <div className="p-1 rounded-2xl bg-zinc-200/80 inline-flex items-center gap-1">
          <button
            onClick={() => setActiveScenario('repairNow')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeScenario === 'repairNow'
                ? 'bg-civic-dark text-lime shadow-subtle'
                : 'text-zinc-700 hover:text-civic-dark'
            }`}
          >
            ✓ Repair Now (Preventative)
          </button>

          <button
            onClick={() => setActiveScenario('partialPatch')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeScenario === 'partialPatch'
                ? 'bg-civic-dark text-amber-400 shadow-subtle'
                : 'text-zinc-700 hover:text-civic-dark'
            }`}
          >
            ⚠ Partial Patch
          </button>

          <button
            onClick={() => setActiveScenario('delaySixMonths')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeScenario === 'delaySixMonths'
                ? 'bg-civic-dark text-red-400 shadow-subtle'
                : 'text-zinc-700 hover:text-civic-dark'
            }`}
          >
            ✕ Delay 6 Months
          </button>
        </div>

        {/* Time Horizon Pills */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[10px] text-zinc-400 uppercase font-bold mr-1">Horizon:</span>
          {(['today', 'sixMonths', 'twelveMonths'] as HorizonKey[]).map((hk) => (
            <button
              key={hk}
              onClick={() => setActiveHorizon(hk)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeHorizon === hk
                  ? 'bg-zinc-800 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
              }`}
            >
              {simulation.horizons[hk].horizon}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Simulation Trajectory Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-civic-border bg-white shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="font-display font-bold text-base text-civic-dark">
              Future Risk Trajectory Modeling
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              Algorithmic Deterioration Curves: Repair Now vs Partial Patch vs Untreated Delay
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-500">
            Deterioration Rate: +{asset.trendScore / 3}%/yr
          </span>
        </div>

        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="horizon" tick={{ fontSize: 11, fill: '#71717A' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717A' }} />
              <Tooltip
                formatter={(val: any) => [`${val} / 100`, 'Risk Index']}
                contentStyle={{ backgroundColor: '#1A1A1A', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="Delay (Untreated)" stroke="#DC2626" fill="#DC2626" fillOpacity={0.15} strokeWidth={2.5} />
              <Area type="monotone" dataKey="Partial Patch" stroke="#D97706" fill="#D97706" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="Repair Now" stroke="#059669" fill="#059669" fillOpacity={0.2} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 leading-relaxed font-medium">
          {activeScenario === 'delaySixMonths' ? (
            <span className="text-red-700 font-bold">
              ⚠ Delaying intervention by 6 months increases projected risk to {simulation.horizons.sixMonths.risk}/100 and inflates repair cost by +{simulation.horizons.sixMonths.costIncreasePct}%.
            </span>
          ) : activeScenario === 'repairNow' ? (
            <span className="text-emerald-700 font-bold">
              ✓ Immediate intervention locks cost at {formatINR(asset.estimatedRepairCost)} and drops residual risk to 12/100.
            </span>
          ) : (
            <span className="text-amber-700 font-bold">
              ⚠ Partial patch provides temporary relief, but recurrence probability exceeds 78% within 4 months.
            </span>
          )}
        </p>
      </div>

      {/* 5. Current State vs Future State Transition Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current State */}
        <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-4">
          <span className="text-xs font-mono font-bold uppercase text-zinc-400 block">
            CURRENT STATE (TODAY)
          </span>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white border border-zinc-200">
              <span className="text-[10px] font-mono text-zinc-400 block">Risk Score</span>
              <span className="font-display font-extrabold text-lg text-civic-dark">{asset.riskScore}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-zinc-200">
              <span className="text-[10px] font-mono text-zinc-400 block">Condition</span>
              <span className="font-display font-extrabold text-lg text-zinc-900">{asset.conditionScore}%</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-zinc-200">
              <span className="text-[10px] font-mono text-zinc-400 block">Base Cost</span>
              <span className="font-display font-extrabold text-lg text-zinc-900">{formatINR(asset.estimatedRepairCost)}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-600">
            Active telemetry confirms localized distress and ongoing subgrade fatigue.
          </p>
        </div>

        {/* Future State */}
        <div className="p-6 rounded-3xl bg-white border-2 border-civic-dark shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-zinc-500 block">
              FUTURE STATE ({horizonData.horizon} — {currentScenario.name})
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              activeScenario === 'repairNow' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {currentScenario.name}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] font-mono text-zinc-400 block">Projected Risk</span>
              <span className={`font-display font-extrabold text-lg ${
                currentScenario.riskAfter <= 25 ? 'text-emerald-700' : 'text-red-600'
              }`}>
                {currentScenario.riskAfter} / 100
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] font-mono text-zinc-400 block">Projected Condition</span>
              <span className="font-display font-extrabold text-lg text-zinc-900">
                {activeScenario === 'repairNow' ? '95%' : `${horizonData.condition}%`}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] font-mono text-zinc-400 block">Projected Cost</span>
              <span className="font-display font-extrabold text-lg text-zinc-900">
                {formatINR(activeScenario === 'repairNow' ? asset.estimatedRepairCost : horizonData.cost)}
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-700 leading-relaxed font-medium">
            {currentScenario.rationale}
          </p>
        </div>
      </div>

      {/* 6. Scenario Comparison Table & CivicX Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scenario Comparison Table */}
        <div className="lg:col-span-7 glass-panel rounded-3xl border border-civic-border overflow-hidden shadow-subtle">
          <div className="p-4 bg-white border-b border-civic-border flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-civic-dark">
              SCENARIO TRADE-OFF MATRIX
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Multi-Year Lifecycle Comparison
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3.5">Scenario</th>
                  <th className="py-2.5 px-3.5">Cost</th>
                  <th className="py-2.5 px-3.5">Risk After</th>
                  <th className="py-2.5 px-3.5">Financial Penalty</th>
                  <th className="py-2.5 px-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 bg-white">
                <tr className="bg-emerald-50/50 font-medium">
                  <td className="py-3 px-3.5 font-bold text-civic-dark">Repair Now</td>
                  <td className="py-3 px-3.5 font-mono text-zinc-900">{formatINR(asset.estimatedRepairCost)}</td>
                  <td className="py-3 px-3.5"><RiskBadge level="Low" score={12} size="sm" /></td>
                  <td className="py-3 px-3.5 font-mono text-emerald-700 font-bold">₹0 (Optimal)</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700">Recommended</td>
                </tr>

                <tr>
                  <td className="py-3 px-3.5 font-bold text-zinc-700">Partial Patch</td>
                  <td className="py-3 px-3.5 font-mono text-zinc-900">{formatINR(asset.estimatedRepairCost * 0.25)}</td>
                  <td className="py-3 px-3.5"><RiskBadge level="High" score={54} size="sm" /></td>
                  <td className="py-3 px-3.5 font-mono text-amber-700 font-bold">High Recurrence</td>
                  <td className="py-3 px-3.5 text-right font-mono text-zinc-500">Short-term</td>
                </tr>

                <tr className="bg-red-50/30">
                  <td className="py-3 px-3.5 font-bold text-red-700">Delay 6 Months</td>
                  <td className="py-3 px-3.5 font-mono text-zinc-900">{formatINR(simulation.horizons.sixMonths.cost)}</td>
                  <td className="py-3 px-3.5"><RiskBadge level="Critical" score={simulation.horizons.sixMonths.risk} size="sm" /></td>
                  <td className="py-3 px-3.5 font-mono text-red-700 font-bold">+{formatINR(simulation.horizons.sixMonths.cost - asset.estimatedRepairCost)}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-red-700">Escalation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CivicX Recommendation Box */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border-2 border-civic-dark bg-white shadow-elevated space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
              CIVICX RECOMMENDATION
            </span>
            <span className="bg-lime text-civic-dark text-[10px] font-bold px-2 py-0.5 rounded font-mono">
              ALGORITHMIC VERDICT
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="font-display font-extrabold text-xl text-civic-dark">
              {simulation.recommendedOption === 'REPAIR_NOW' ? 'REPAIR NOW (PREVENTATIVE)' : 'PRIORITIZE IMMEDIATE STABILIZATION'}
            </h4>
            <p className="text-xs text-zinc-700 leading-relaxed font-medium mt-2 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/70">
              {simulation.recommendationReason}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate(`/budget?asset=${asset.id}`)}
              className="w-full py-2.5 px-4 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-subtle"
            >
              <span>Commit Decision in Budget Optimizer</span>
              <ArrowRight className="w-3.5 h-3.5 text-lime" />
            </button>

            <Link
              to="/reports"
              className="w-full py-2 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 text-center block"
            >
              <span>Export Executive Brief Report →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
