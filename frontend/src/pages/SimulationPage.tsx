import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  Sliders, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  RotateCcw, 
  CheckCircle2, 
  TrendingDown,
  Layers,
  Calendar,
  DollarSign,
  ShieldCheck,
  Zap,
  Info,
  Building2,
  Database,
  RefreshCw,
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

import { ApiService } from '../services/api';
import { Asset, SimulationResult, PortfolioSimulationData } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { ErrorState } from '../components/common/ErrorState';
import { DashboardSkeleton } from '../components/common/DashboardSkeleton';
import { formatINR } from '../utils/formatters';

type ScenarioKey = 'repairNow' | 'partialPatch' | 'delaySixMonths';
type HorizonKey = 'today' | 'sixMonths' | 'twelveMonths';
type SimulationMode = 'single_asset' | 'city_portfolio';

export const SimulationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assetIdParam = searchParams.get('asset');

  const [mode, setMode] = useState<SimulationMode>('single_asset');
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioSimulationData | null>(null);
  
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('repairNow');
  const [activeYear, setActiveYear] = useState<number>(2027);
  const [chartView, setChartView] = useState<'risk' | 'condition' | 'cost'>('risk');
  
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const initSimulation = async () => {
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
        const [simData, portData] = await Promise.all([
          ApiService.runSimulation(initialId),
          ApiService.runPortfolioSimulation()
        ]);
        setSimulation(simData);
        setPortfolioData(portData);
      } catch (err) {
        console.error('Simulation initialization failed', err);
        setError('Could not initialize City Time Machine simulation.');
      } finally {
        setLoading(false);
      }
    };

    initSimulation();
  }, [assetIdParam]);

  const handleSelectAsset = async (newId: string) => {
    setSelectedAssetId(newId);
    setSimulating(true);
    try {
      const simData = await ApiService.runSimulation(newId);
      setSimulation(simData);
    } catch (err) {
      console.error('Simulation update failed', err);
      setError('Failed to calculate deterioration forecast for this asset.');
    } finally {
      setSimulating(false);
    }
  };

  const currentAsset = simulation?.asset;

  // Yearly Multi-Horizon Chart Data
  const yearlyChartData = useMemo(() => {
    if (!simulation?.yearlyTimeline) {
      const r0 = currentAsset?.riskScore || 70;
      const c0 = currentAsset?.conditionScore || 50;
      const cost0 = currentAsset?.estimatedRepairCost || 1000000;
      return [
        { year: '2026 (Today)', 'Repair Now': 12, 'Partial Patch': 54, 'Delay (Untreated)': r0, conditionRepair: 95, conditionPartial: 65, conditionDelay: c0, costRepair: cost0, costDelay: cost0 },
        { year: '2027 (+1 Yr)', 'Repair Now': 15, 'Partial Patch': 68, 'Delay (Untreated)': Math.min(98, r0 + 20), conditionRepair: 92, conditionPartial: 52, conditionDelay: Math.max(15, c0 - 25), costRepair: cost0 * 1.05, costDelay: cost0 * 2.45 },
        { year: '2028 (+2 Yrs)', 'Repair Now': 18, 'Partial Patch': 78, 'Delay (Untreated)': Math.min(99, r0 + 28), conditionRepair: 88, conditionPartial: 38, conditionDelay: Math.max(8, c0 - 40), costRepair: cost0 * 1.10, costDelay: cost0 * 3.20 },
        { year: '2029 (+3 Yrs)', 'Repair Now': 22, 'Partial Patch': 86, 'Delay (Untreated)': 99, conditionRepair: 84, conditionPartial: 28, conditionDelay: Math.max(4, c0 - 48), costRepair: cost0 * 1.15, costDelay: cost0 * 4.10 },
        { year: '2030 (+4 Yrs)', 'Repair Now': 26, 'Partial Patch': 94, 'Delay (Untreated)': 99, conditionRepair: 80, conditionPartial: 18, conditionDelay: 2, costRepair: cost0 * 1.22, costDelay: cost0 * 4.80 },
      ];
    }

    return simulation.yearlyTimeline.map(pt => ({
      year: pt.label,
      rawYear: pt.year,
      'Repair Now': pt.repair_now.risk,
      'Partial Patch': pt.partial_repair.risk,
      'Delay (Untreated)': pt.delay.risk,
      conditionRepair: pt.repair_now.condition,
      conditionPartial: pt.partial_repair.condition,
      conditionDelay: pt.delay.condition,
      costRepair: pt.repair_now.cost,
      costDelay: pt.delay.cost,
    }));
  }, [simulation, currentAsset]);

  // Selected Year Snapshot Data
  const selectedYearPoint = useMemo(() => {
    if (!simulation?.yearlyTimeline) return null;
    return simulation.yearlyTimeline.find(p => p.year === activeYear) || simulation.yearlyTimeline[1];
  }, [simulation, activeYear]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !simulation || !currentAsset) {
    return <ErrorState message={error || undefined} onRetry={() => handleSelectAsset(selectedAssetId)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Quick Switchers */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-civic-border"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-civic-dark tracking-tight">
              CITY TIME MACHINE
            </h1>
            <span className="bg-lime text-civic-dark text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded font-mono">
              WHAT-IF SIMULATOR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
            Explore how infrastructure risk, physical condition, and municipal repair costs evolve across future decisions.
          </p>
        </div>

        {/* Global Nav Shortcuts & Mode Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 rounded-xl bg-zinc-200/80 inline-flex items-center">
            <button
              onClick={() => setMode('single_asset')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'single_asset'
                  ? 'bg-civic-dark text-lime shadow-subtle'
                  : 'text-zinc-600 hover:text-civic-dark'
              }`}
            >
              Asset Lifecycle
            </button>
            <button
              onClick={() => setMode('city_portfolio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'city_portfolio'
                  ? 'bg-civic-dark text-lime shadow-subtle'
                  : 'text-zinc-600 hover:text-civic-dark'
              }`}
            >
              Citywide Portfolio
            </button>
          </div>

          <Link
            to={`/budget?asset=${currentAsset.id}`}
            className="px-3.5 py-2 rounded-xl bg-white border border-civic-border text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-subtle flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-600" />
            <span>Budget Optimizer</span>
          </Link>
          <Link
            to={`/assets/${currentAsset.id}`}
            className="px-3.5 py-2 rounded-xl bg-civic-dark text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-subtle flex items-center gap-1.5"
          >
            <span>Asset Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime" />
          </Link>
        </div>
      </motion.div>

      {/* Mode A: Single Asset Time Machine */}
      {mode === 'single_asset' ? (
        <>
          {/* 2. Simulation Controls & Current State Strip */}
          <div className="glass-panel p-6 rounded-3xl border border-civic-border bg-white shadow-subtle space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Asset Selector */}
              <div className="flex-1 max-w-lg">
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1">
                  Select Infrastructure Asset to Simulate
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedAssetId}
                    onChange={(e) => handleSelectAsset(e.target.value)}
                    disabled={simulating}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-civic-dark focus:outline-none focus:ring-2 focus:ring-lime disabled:opacity-50"
                  >
                    {allAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        #{a.priorityRank} {a.assetId} — {a.name} ({a.type}, {a.location})
                      </option>
                    ))}
                  </select>
                  {simulating && (
                    <div className="w-5 h-5 rounded-full border-2 border-civic-dark border-t-transparent animate-spin" />
                  )}
                </div>
              </div>

              {/* Current Asset Ground Truth Telemetry */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs min-w-[110px]">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase">CURRENT RISK</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-display font-extrabold text-base text-civic-dark">{currentAsset.riskScore}</span>
                    <span className="text-[10px] font-mono text-zinc-400">/100</span>
                    <RiskBadge level={currentAsset.riskLevel} score={currentAsset.riskScore} size="sm" />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs min-w-[110px]">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase">CONDITION</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-display font-extrabold text-base text-zinc-900">{currentAsset.conditionScore}%</span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {currentAsset.conditionScore >= 80 ? 'Good' : currentAsset.conditionScore >= 50 ? 'Fair' : 'Critical'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs min-w-[140px]">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase">ESTIMATED REPAIR COST</span>
                  <span className="font-display font-extrabold text-base text-zinc-900 block mt-0.5">
                    {formatINR(currentAsset.estimatedRepairCost)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs min-w-[130px]">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase">LAST INSPECTION</span>
                  <span className="font-mono font-bold text-xs text-zinc-700 block mt-0.5">
                    {currentAsset.lastInspection || '2026-08-14'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Scenario Switcher & Interactive Time Machine Year Stepper */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Scenario Segmented Control */}
            <div className="lg:col-span-6">
              <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1.5">
                Select Active Maintenance Scenario
              </label>
              <div className="p-1.5 rounded-2xl bg-zinc-200/80 grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setActiveScenario('repairNow')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeScenario === 'repairNow'
                      ? 'bg-civic-dark text-lime shadow-subtle'
                      : 'text-zinc-700 hover:text-civic-dark'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Repair Now</span>
                </button>

                <button
                  onClick={() => setActiveScenario('partialPatch')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeScenario === 'partialPatch'
                      ? 'bg-civic-dark text-amber-400 shadow-subtle'
                      : 'text-zinc-700 hover:text-civic-dark'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Partial Patch</span>
                </button>

                <button
                  onClick={() => setActiveScenario('delaySixMonths')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeScenario === 'delaySixMonths'
                      ? 'bg-civic-dark text-red-400 shadow-subtle'
                      : 'text-zinc-700 hover:text-civic-dark'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Delay</span>
                </button>
              </div>
            </div>

            {/* Time Machine Year Horizon Timeline Stepper */}
            <div className="lg:col-span-6">
              <label className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1.5">
                City Time Machine Horizon (Select Future Year)
              </label>
              <div className="p-1.5 rounded-2xl bg-white border border-civic-border shadow-subtle flex items-center justify-between gap-1">
                {[2026, 2027, 2028, 2029, 2030].map((year) => {
                  const isCurrent = year === 2026;
                  const isSelected = activeYear === year;
                  return (
                    <button
                      key={year}
                      onClick={() => setActiveYear(year)}
                      className={`flex-1 py-2 px-1 rounded-xl text-center transition-all ${
                        isSelected
                          ? 'bg-civic-dark text-white font-extrabold shadow-subtle'
                          : 'hover:bg-zinc-100 text-zinc-600 font-bold'
                      }`}
                    >
                      <div className="font-mono text-xs">{year}</div>
                      <div className={`text-[9px] font-mono uppercase ${isSelected ? 'text-lime' : 'text-zinc-400'}`}>
                        {isCurrent ? 'Today' : `+${year - 2026} Yr`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Selected Year Snapshot Banner */}
          {selectedYearPoint && (
            <motion.div
              key={activeYear}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-3xl bg-white border-2 border-civic-dark shadow-subtle space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-civic-dark" />
                  <span className="font-mono text-xs font-bold uppercase text-zinc-500">
                    YEAR {activeYear} DECISION SNAPSHOT — {selectedYearPoint.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded">
                  Active Comparison: {activeScenario === 'repairNow' ? 'Repair Now' : activeScenario === 'partialPatch' ? 'Partial Patch' : 'Untreated Delay'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Projected Risk */}
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase">Projected Risk</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`font-display font-black text-xl ${
                      activeScenario === 'repairNow' ? 'text-emerald-700' : activeScenario === 'partialPatch' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {activeScenario === 'repairNow' ? selectedYearPoint.repair_now.risk : activeScenario === 'partialPatch' ? selectedYearPoint.partial_repair.risk : selectedYearPoint.delay.risk}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">/100</span>
                  </div>
                </div>

                {/* Projected Condition */}
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase">Condition Integrity</span>
                  <span className="font-display font-black text-xl text-zinc-900 block mt-0.5">
                    {activeScenario === 'repairNow' ? selectedYearPoint.repair_now.condition : activeScenario === 'partialPatch' ? selectedYearPoint.partial_repair.condition : selectedYearPoint.delay.condition}%
                  </span>
                </div>

                {/* Projected Maintenance Need */}
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase">Maintenance Requirement</span>
                  <span className="font-mono text-xs font-bold text-zinc-800 block mt-1 line-clamp-1">
                    {activeScenario === 'repairNow' ? selectedYearPoint.repair_now.maintenance_need : activeScenario === 'partialPatch' ? selectedYearPoint.partial_repair.maintenance_need : selectedYearPoint.delay.maintenance_need}
                  </span>
                </div>

                {/* Projected Intervention Cost */}
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase">Projected Cost</span>
                  <span className="font-display font-black text-xl text-zinc-900 block mt-0.5">
                    {formatINR(activeScenario === 'repairNow' ? selectedYearPoint.repair_now.cost : activeScenario === 'partialPatch' ? selectedYearPoint.partial_repair.cost : selectedYearPoint.delay.cost)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. Main Deterioration & Cost Trajectory Visualizations */}
          <div className="glass-panel p-6 rounded-3xl border border-civic-border bg-white shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-display font-bold text-base text-civic-dark">
                  Multi-Year Lifecycle Trajectory Modeling (2026–2030)
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Comparative forecasting: Repair Now (Preventative) vs Partial Patch vs Untreated Delay
                </p>
              </div>

              {/* Chart Metric Switcher */}
              <div className="p-1 rounded-xl bg-zinc-100 inline-flex items-center gap-1">
                <button
                  onClick={() => setChartView('risk')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartView === 'risk' ? 'bg-civic-dark text-white shadow-subtle' : 'text-zinc-600 hover:text-civic-dark'
                  }`}
                >
                  Risk Curve
                </button>
                <button
                  onClick={() => setChartView('condition')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartView === 'condition' ? 'bg-civic-dark text-white shadow-subtle' : 'text-zinc-600 hover:text-civic-dark'
                  }`}
                >
                  Condition Integrity
                </button>
                <button
                  onClick={() => setChartView('cost')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartView === 'cost' ? 'bg-civic-dark text-white shadow-subtle' : 'text-zinc-600 hover:text-civic-dark'
                  }`}
                >
                  Cost Escalation
                </button>
              </div>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'risk' ? (
                  <AreaChart data={yearlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F4" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#71717A' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717A' }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} / 100`, 'Risk Index']}
                      contentStyle={{ backgroundColor: '#1A1A1A', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="Delay (Untreated)" stroke="#DC2626" fill="#DC2626" fillOpacity={0.18} strokeWidth={2.5} />
                    <Area type="monotone" dataKey="Partial Patch" stroke="#D97706" fill="#D97706" fillOpacity={0.12} strokeWidth={2} strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="Repair Now" stroke="#059669" fill="#059669" fillOpacity={0.22} strokeWidth={2.5} />
                  </AreaChart>
                ) : chartView === 'condition' ? (
                  <LineChart data={yearlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F4" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#71717A' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717A' }} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Condition Integrity']}
                      contentStyle={{ backgroundColor: '#1A1A1A', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="conditionRepair" name="Repair Now Condition" stroke="#059669" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="conditionPartial" name="Partial Patch Condition" stroke="#D97706" strokeWidth={2} strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="conditionDelay" name="Delay Condition" stroke="#DC2626" strokeWidth={2.5} />
                  </LineChart>
                ) : (
                  <BarChart data={yearlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F4" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#71717A' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#71717A' }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                    <Tooltip
                      formatter={(val: any) => [formatINR(val), 'Estimated Repair Cost']}
                      contentStyle={{ backgroundColor: '#1A1A1A', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="costRepair" name="Repair Now Lifecycle Cost" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="costDelay" name="Escalated Delay Repair Cost" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Trajectory Synthesis Message */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-700 font-medium">
                  {activeScenario === 'delaySixMonths' ? (
                    <strong className="text-red-700">
                      Untreated delay triggers +{simulation.horizons.sixMonths.costIncreasePct}% cost inflation by 6 months and reaches terminal full-depth failure by 2028.
                    </strong>
                  ) : activeScenario === 'repairNow' ? (
                    <strong className="text-emerald-700">
                      Immediate repair locks cost at {formatINR(currentAsset.estimatedRepairCost)} and preserves high structural condition (80%+) through 2030.
                    </strong>
                  ) : (
                    <strong className="text-amber-700">
                      Partial patch is low cost upfront (₹{Math.round(currentAsset.estimatedRepairCost * 0.25 / 100000)}L) but suffers high recurrence probability within 4 months.
                    </strong>
                  )}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 hidden sm:inline">
                Cost of Delay (6 Mo): +{formatINR(simulation.costOfDelay || 0)}
              </span>
            </div>
          </div>

          {/* 6. Side-by-Side Scenario Trade-Off Matrix */}
          <div className="glass-panel rounded-3xl border border-civic-border overflow-hidden bg-white shadow-subtle">
            <div className="p-5 border-b border-civic-border flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-civic-dark">
                  SIDE-BY-SIDE SCENARIO TRADE-OFF MATRIX
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Comparative analysis of immediate vs partial vs postponed intervention
                </p>
              </div>
              <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded font-bold">
                MCDA Decision Analytics
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Metric</th>
                    <th className="py-3 px-4 bg-emerald-50/50 text-emerald-800">Scenario A — Repair Now</th>
                    <th className="py-3 px-4 bg-amber-50/40 text-amber-800">Scenario B — Partial Patch</th>
                    <th className="py-3 px-4 bg-red-50/40 text-red-800">Scenario C — Untreated Delay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70 bg-white">
                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-600">Initial / Current Condition</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{currentAsset.conditionScore}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{currentAsset.conditionScore}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{currentAsset.conditionScore}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-600">Future Condition (Year 2027)</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">92% (Pristine)</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">52% (Deteriorating)</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-700">{simulation.horizons.twelveMonths.condition}% (Severe Failure)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-600">Current Risk Score</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{currentAsset.riskScore} / 100</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{currentAsset.riskScore} / 100</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{currentAsset.riskScore} / 100</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-600">Projected Risk (6 Months)</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">12 / 100 (Low Residual)</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">54 / 100 (Medium)</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-700">{simulation.horizons.sixMonths.risk} / 100 (Critical)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-600">Immediate Intervention Cost</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{formatINR(currentAsset.estimatedRepairCost)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{formatINR(currentAsset.estimatedRepairCost * 0.25)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-500">₹0 (Postponed)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-600">Future Repair Cost (6 Months)</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">Routine Upkeep</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">Secondary Patch Needed</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-700">{formatINR(simulation.horizons.sixMonths.cost)} (+52%)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-600">Cost of Delay (Financial Penalty)</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">₹0 (Optimal)</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">High Recurrence Cost</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-700">+{formatINR(simulation.costOfDelay || 0)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-600">Additional Risk from Delay</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">0 pts</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">+42 pts</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-700">+{simulation.additionalRiskFromDelay || 0} pts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. Decision Insight & Why This Outcome Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Decision Insight Card */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border-2 border-civic-dark bg-white shadow-elevated space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                  CIVICX ALGORITHMIC DECISION INSIGHT
                </span>
                <span className="bg-lime text-civic-dark text-[10px] font-extrabold px-2 py-0.5 rounded font-mono">
                  VERDICT: REPAIR NOW
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-display font-extrabold text-lg text-civic-dark">
                  Preventative Resurfacing Maximizes 5-Year Lifecycle ROI
                </h4>
                <p className="text-xs text-zinc-700 leading-relaxed font-medium bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  {simulation.decisionInsight || simulation.recommendationReason}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/budget?asset=${currentAsset.id}`)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-civic-dark text-white text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                >
                  <Sliders className="w-3.5 h-3.5 text-lime" />
                  <span>Allocate Budget in Optimizer</span>
                </button>
                <Link
                  to={`/assets/${currentAsset.id}`}
                  className="py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Open Asset Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Transparent Assumptions & Data Quality */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-civic-border bg-white shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                  SIMULATION ASSUMPTIONS & DATA QUALITY
                </span>
                <Database className="w-4 h-4 text-zinc-400" />
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Deterioration Model</span>
                  <p className="text-zinc-800 font-mono font-medium">
                    {simulation.assumptions?.deterioration_model || 'Non-linear compound subgrade degradation index'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Moisture Stress Multiplier</span>
                  <p className="text-zinc-800 font-mono font-medium">
                    {simulation.assumptions?.moisture_stress_factor || 'Monsoon hydro-dynamic penetration penalty (+15%/cycle)'}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 block">Logged Observations</span>
                    <span className="font-mono font-bold text-xs text-zinc-900">
                      {simulation.dataQuality?.historical_observations || 2} records
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[9px] font-mono uppercase text-zinc-400 block">Forecast Confidence</span>
                    <span className="font-mono font-bold text-[11px] text-emerald-700">
                      {simulation.dataQuality?.forecast_reliability || 'HIGH (Ground Truth)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Mode B: Citywide Portfolio Simulation */
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-civic-border bg-white shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-display font-black text-xl text-civic-dark">
                  Citywide Portfolio Time Machine (2026–2030)
                </h3>
                <p className="text-xs text-zinc-500 font-mono">
                  Aggregate city impact: Simulating {portfolioData?.total_assets_simulated || allAssets.length} municipal assets across Coimbatore
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="text-[9px] font-mono font-bold text-emerald-700 block uppercase">5-YEAR CITY SAVINGS</span>
                  <span className="font-display font-extrabold text-base text-emerald-800">
                    {formatINR(portfolioData?.total_5year_savings || 18500000)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 text-white text-xs">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase">RISK MITIGATION</span>
                  <span className="font-display font-extrabold text-base text-lime">
                    -{portfolioData?.total_risk_points_prevented || 340} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Citywide Trajectory Chart */}
            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portfolioData?.city_timeline || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F4" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#71717A' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717A' }} tickFormatter={(v) => `₹${(v/10000000).toFixed(1)} Cr`} />
                  <Tooltip
                    formatter={(val: any) => [formatINR(val), 'Capital Outlay']}
                    contentStyle={{ backgroundColor: '#1A1A1A', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="proactive_cost" name="Proactive Portfolio Budget" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delayed_cost" name="Delayed Escalation Cost" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* City Timeline Breakdown Table */}
          <div className="glass-panel rounded-3xl border border-civic-border overflow-hidden bg-white shadow-subtle">
            <div className="p-5 border-b border-civic-border">
              <h3 className="font-display font-bold text-sm text-civic-dark">
                CITYWIDE MULTI-YEAR FINANCIAL FORECAST
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Proactive Risk Sum</th>
                    <th className="py-3 px-4">Delayed Risk Sum</th>
                    <th className="py-3 px-4">Proactive Budget</th>
                    <th className="py-3 px-4">Delayed Reconstruction Cost</th>
                    <th className="py-3 px-4 text-right">Municipal Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70 bg-white">
                  {(portfolioData?.city_timeline || []).map((row) => (
                    <tr key={row.year}>
                      <td className="py-3 px-4 font-mono font-bold text-civic-dark">{row.year}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">{row.proactive_risk} pts</td>
                      <td className="py-3 px-4 font-mono font-bold text-red-700">{row.delayed_risk} pts</td>
                      <td className="py-3 px-4 font-mono text-zinc-900">{formatINR(row.proactive_cost)}</td>
                      <td className="py-3 px-4 font-mono text-zinc-900">{formatINR(row.delayed_cost)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-right">
                        {row.savings_delta > 0 ? `+${formatINR(row.savings_delta)}` : 'Baseline'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
