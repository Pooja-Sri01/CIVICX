import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Activity,
  Layers,
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Sliders,
  DollarSign,
  ShieldAlert,
  HelpCircle,
  Save,
  Check,
  Eye,
  Building,
  MapPin,
  Flame,
  Info
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
  CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
  DigitalTwinState,
  DigitalTwinScenarioResult,
  SavedDigitalTwinScenario,
  ScenarioInterventionType,
  ScenarioStatus
} from '../../types';
import { ApiService } from '../../services/api';
import { formatINR } from '../../utils/formatters';

interface DigitalTwinWorkspaceProps {
  assetId: string;
  initialState?: DigitalTwinState | null;
  onOpenAIModal?: () => void;
}

export const DigitalTwinWorkspace: React.FC<DigitalTwinWorkspaceProps> = ({
  assetId,
  initialState,
  onOpenAIModal
}) => {
  const navigate = useNavigate();

  const [dtState, setDtState] = useState<DigitalTwinState | null>(initialState || null);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [loading, setLoading] = useState<boolean>(!initialState);

  // Scenario Builder State
  const [selectedIntervention, setSelectedIntervention] = useState<ScenarioInterventionType>('PREVENTIVE_MAINTENANCE');
  const [selectedTiming, setSelectedTiming] = useState<number>(0);
  const [customBudget, setCustomBudget] = useState<number>(650000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<DigitalTwinScenarioResult | null>(null);

  // Scenario History & Save
  const [savedScenarios, setSavedScenarios] = useState<SavedDigitalTwinScenario[]>([]);
  const [scenarioNameInput, setScenarioNameInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadState = async () => {
      setLoading(true);
      try {
        const [stateData, scenarioData] = await Promise.all([
          ApiService.getDigitalTwinState(assetId),
          ApiService.getSavedDigitalTwinScenarios(assetId)
        ]);
        setDtState(stateData);
        setSavedScenarios(scenarioData);
        setCustomBudget(stateData.estimated_repair_cost ? stateData.estimated_repair_cost * 0.65 : 650000);
        
        // Initial default simulation
        const sim = await ApiService.simulateDigitalTwinScenario({
          asset_id: assetId,
          intervention_type: 'PREVENTIVE_MAINTENANCE',
          timing_months: 0,
          budget: stateData.estimated_repair_cost * 0.65
        });
        setSimulationResult(sim);
      } catch (err) {
        console.error('Failed to load digital twin state', err);
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, [assetId]);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await ApiService.simulateDigitalTwinScenario({
        asset_id: assetId,
        intervention_type: selectedIntervention,
        timing_months: selectedTiming,
        budget: customBudget
      });
      setSimulationResult(res);
    } catch (err) {
      console.error('Simulation run failed', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSaveScenario = async () => {
    if (!scenarioNameInput.trim() || !simulationResult) return;
    setIsSaving(true);
    try {
      const saved = await ApiService.saveDigitalTwinScenario({
        asset_id: assetId,
        name: scenarioNameInput.trim(),
        intervention_type: selectedIntervention,
        timing_months: selectedTiming,
        budget: customBudget,
        scenario_status: 'SIMULATED',
        simulation_result: simulationResult
      });
      setSavedScenarios([saved, ...savedScenarios]);
      setScenarioNameInput('');
      setSaveSuccessMsg(`Scenario saved successfully (ID #${saved.id})`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to save scenario', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (scenarioId: number, newStatus: string) => {
    try {
      const updated = await ApiService.updateScenarioStatus(scenarioId, newStatus);
      setSavedScenarios(savedScenarios.map(s => s.id === scenarioId ? updated : s));
    } catch (err) {
      console.error('Failed to update scenario status', err);
    }
  };

  if (loading || !dtState) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-subtle text-center text-xs text-zinc-500 font-mono">
        Loading CIVICX Digital Twin State & Lifecycle Simulator...
      </div>
    );
  }

  // Active Scrubbed Year Point
  const yearIndex = [2026, 2027, 2028, 2029, 2030].indexOf(selectedYear);
  const activeDoNothingPoint = simulationResult?.trajectories.do_nothing[yearIndex] || {
    year: selectedYear,
    tag: selectedYear === 2026 ? 'ACTUAL' : 'FORECAST',
    condition: dtState.condition_score,
    risk: dtState.risk_score,
    cost_cumulative: 0,
    status: 'Monitored State'
  };

  const activeSimulatedPoint = simulationResult?.trajectories.simulated[yearIndex] || activeDoNothingPoint;

  // Chart Data Preparation
  const chartData = (simulationResult?.trajectories.years || [2026, 2027, 2028, 2029, 2030]).map((yr, idx) => ({
    year: yr.toString(),
    do_nothing_condition: simulationResult?.trajectories.do_nothing[idx]?.condition || 50,
    simulated_condition: simulationResult?.trajectories.simulated[idx]?.condition || 50,
    do_nothing_risk: simulationResult?.trajectories.do_nothing[idx]?.risk || 50,
    simulated_risk: simulationResult?.trajectories.simulated[idx]?.risk || 50
  }));

  return (
    <div id="digital-twin" className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-subtle font-mono text-xs space-y-6">
      {/* 1. Header Ribbon */}
      <div className="p-5 bg-zinc-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lime/20 text-lime flex items-center justify-center border border-lime/30 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-base text-white tracking-tight uppercase">
                CIVICX DIGITAL TWIN & WHAT-IF SIMULATOR
              </span>
              <span className="bg-lime text-civic-dark text-[9px] font-mono font-black px-1.5 py-0.2 rounded">
                PROMPT 9
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Live Software Representation · Counterfactual Scenario Simulation · Lifecycle Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
            STAGE: {dtState.lifecycle_stage}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-white/10 text-zinc-300 border border-white/15 text-[10px] font-bold">
            SYNCED: {dtState.data_freshness.split(' ')[0]} {dtState.data_freshness.split(' ')[1]}
          </span>
          <button
            onClick={() => navigate(`/map?asset=${dtState.asset_id}`)}
            className="px-3 py-1 rounded-xl bg-lime text-civic-dark text-[10px] font-bold hover:bg-lime-light transition-all flex items-center gap-1 shadow-sm"
          >
            <MapPin className="w-3 h-3" />
            <span>GIS Map View</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 2. Consolidated Digital Twin Status & Evidence Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Ground Truth State */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Ground Truth State</span>
              <span className="px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 text-[9px] font-bold">ACTUAL</span>
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="font-display font-black text-2xl text-civic-dark">
                {dtState.condition_score}
              </span>
              <span className="text-zinc-400 text-xs">/ 100 Cond</span>
            </div>
            <span className="text-[11px] text-zinc-600 font-sans block">
              Official Risk: <strong className="text-rose-600">{dtState.risk_score}/100 ({dtState.risk_level})</strong>
            </span>
          </div>

          {/* AI Inspection Evidence */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-purple-700 uppercase font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" /> AI Visual Signal
              </span>
              <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                {Math.round(dtState.ai_inspection_signals.confidence * 100)}% Conf
              </span>
            </div>
            <p className="font-bold text-xs text-zinc-900 truncate pt-1">
              {dtState.ai_inspection_signals.detected_damage}
            </p>
            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="text-[10px] text-purple-700 hover:underline font-bold flex items-center gap-1"
              >
                <span>View Computer Vision BBoxes</span> →
              </button>
            )}
          </div>

          {/* Citizen Evidence Telemetry */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Citizen Signals</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                {dtState.citizen_signals.validated_reports} Validated
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="font-display font-black text-xl text-zinc-800">
                {dtState.citizen_signals.total_reports} Reports
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-sans block">
              Corroborates active surface distress
            </span>
          </div>

          {/* Predictive Deterioration Baseline */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">12M Baseline</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                dtState.forecast_summary.trend === 'ACCELERATING' ? 'bg-red-100 text-red-800' : 'bg-lime text-civic-dark'
              }`}>
                {dtState.forecast_summary.trend}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="font-display font-black text-2xl text-red-600">
                {dtState.forecast_summary.forecast_12m}
              </span>
              <span className="text-zinc-400 text-xs">/ 100 (12M)</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-sans block">
              Window: <strong>{dtState.forecast_summary.maintenance_window}</strong>
            </span>
          </div>
        </div>

        {/* 3. Time Scrubber (2026 - 2030) */}
        <div className="p-5 rounded-3xl bg-zinc-900 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-lime" />
              <span className="font-bold text-xs uppercase text-white tracking-wide">
                DIGITAL TWIN TIME SCRUBBER (2026 – 2030)
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">
              Scrub year to inspect evolving digital twin twin state
            </span>
          </div>

          {/* Year Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {[2026, 2027, 2028, 2029, 2030].map((yr) => {
              const isSelected = selectedYear === yr;
              const isActual = yr === 2026;
              const tagLabel = isActual ? 'ACTUAL' : yr === 2027 ? 'FORECAST' : 'SIMULATION';
              return (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-lime text-civic-dark border-lime shadow-lime-glow font-bold scale-[1.02]'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  <div className="text-[10px] font-bold flex items-center justify-center gap-1">
                    <span>{yr}</span>
                    {isActual && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </div>
                  <span className={`text-[8px] font-bold uppercase block mt-0.5 ${
                    isSelected ? 'text-civic-dark' : 'text-zinc-400'
                  }`}>
                    {tagLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scrubbed Year Inspection Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                Do Nothing (Baseline in {selectedYear})
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display font-black text-lg text-rose-400">
                  {activeDoNothingPoint.condition}/100 Cond
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  (Risk: {activeDoNothingPoint.risk}/100)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">{activeDoNothingPoint.status}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono text-lime uppercase font-bold block">
                With {simulationResult?.scenario.intervention_name || 'Intervention'}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display font-black text-lg text-lime">
                  {activeSimulatedPoint.condition}/100 Cond
                </span>
                <span className="text-xs text-zinc-300 font-mono">
                  (Risk: {activeSimulatedPoint.risk}/100)
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5">{activeSimulatedPoint.status}</p>
            </div>

            <div className="sm:border-l sm:border-white/10 sm:pl-4">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                Temporal Tag & Authority
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                  selectedYear === 2026 ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40' : 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                }`}>
                  {selectedYear === 2026 ? 'ACTUAL OBSERVATION' : 'SIMULATED COUNTERFACTUAL'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 block mt-1">
                Does not modify live database ground truth
              </span>
            </div>
          </div>
        </div>

        {/* 4. What-If Scenario Builder */}
        <div className="p-5 rounded-3xl bg-zinc-50 border border-zinc-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-civic-dark" />
              <span className="font-bold text-xs uppercase text-civic-dark tracking-wide">
                WHAT-IF SCENARIO BUILDER
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Test Alternative Engineering Interventions & Timing Offsets
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Intervention Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-600 block">
                1. Select Intervention Archetype
              </label>
              <select
                value={selectedIntervention}
                onChange={(e) => setSelectedIntervention(e.target.value as ScenarioInterventionType)}
                className="w-full p-2.5 rounded-xl bg-white border border-zinc-300 font-sans text-xs font-semibold focus:ring-2 focus:ring-lime"
              >
                <option value="DO_NOTHING">Do Nothing (Untreated Decay)</option>
                <option value="ROUTINE_MAINTENANCE">Routine Maintenance (Patching & Sealing)</option>
                <option value="PREVENTIVE_MAINTENANCE">Preventive Maintenance (Polymer Overlay)</option>
                <option value="REHABILITATION">Major Structural Rehabilitation</option>
                <option value="RECONSTRUCTION">Full Corridor Reconstruction</option>
              </select>
            </div>

            {/* Timing Offset */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-600 block">
                2. Intervention Timing
              </label>
              <select
                value={selectedTiming}
                onChange={(e) => setSelectedTiming(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-white border border-zinc-300 font-sans text-xs font-semibold focus:ring-2 focus:ring-lime"
              >
                <option value={0}>Immediate Action (Now · 2026)</option>
                <option value={6}>Delay 6 Months (Post-Monsoon)</option>
                <option value={12}>Delay 12 Months (2027 Cycle)</option>
                <option value={24}>Delay 24 Months (2028 Horizon)</option>
              </select>
            </div>

            {/* Target Budget Allocation */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-600 block">
                3. Target Budget (₹ INR)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="50000"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(parseFloat(e.target.value) || 0)}
                  className="flex-1 p-2 rounded-xl bg-white border border-zinc-300 font-mono text-xs font-bold focus:ring-2 focus:ring-lime"
                />
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="px-4 py-2 rounded-xl bg-civic-dark text-lime font-mono text-xs font-bold hover:bg-zinc-800 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>Simulate</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Counterfactual Trajectory Visual Chart */}
        {simulationResult && (
          <div className="p-5 rounded-3xl bg-white border border-zinc-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100">
              <span className="font-bold text-xs text-civic-dark uppercase">
                COUNTERFACTUAL DECAY TRAJECTORY (2026 – 2030)
              </span>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-red-500 rounded" />
                  <span className="text-zinc-600">Do Nothing</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#9FFF00] rounded" />
                  <span className="text-zinc-900 font-bold">{simulationResult.scenario.intervention_name}</span>
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderRadius: '1rem', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="do_nothing_condition"
                    name="Do Nothing Condition"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#ef4444' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="simulated_condition"
                    name="Simulated Condition"
                    stroke="#84cc16"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#84cc16' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Effectiveness & Financial Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Condition Gain</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-lg text-emerald-700">
                    +{simulationResult.effectiveness.condition_gain_pts}
                  </span>
                  <span className="text-[10px] text-emerald-600">pts</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-sans block mt-0.5">by year 2030</span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] text-blue-800 uppercase font-bold block">Risk Reduction</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-lg text-blue-700">
                    -{simulationResult.effectiveness.risk_reduction_pts}
                  </span>
                  <span className="text-[10px] text-blue-600">risk pts</span>
                </div>
                <span className="text-[10px] text-blue-700 font-sans block mt-0.5">avoids failure collapse</span>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-purple-800 uppercase font-bold block">Lifespan Boost</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-lg text-purple-700">
                    +{simulationResult.effectiveness.lifespan_extension_years}
                  </span>
                  <span className="text-[10px] text-purple-600">Years</span>
                </div>
                <span className="text-[10px] text-purple-700 font-sans block mt-0.5">structural life extension</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-800 uppercase font-bold block">Cost of Delay</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-lg text-amber-700">
                    {formatINR(simulationResult.financials.cost_of_delay)}
                  </span>
                </div>
                <span className="text-[10px] text-amber-700 font-sans block mt-0.5">
                  {simulationResult.effectiveness.delay_cost_penalty_pct > 0 ? `+${simulationResult.effectiveness.delay_cost_penalty_pct}% penalty` : 'Zero penalty'}
                </span>
              </div>
            </div>

            {/* Explainable Scenario Insight */}
            <div className="p-3.5 rounded-2xl bg-zinc-900 text-white font-sans text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-lime mt-0.5 shrink-0" />
              <div>
                <strong className="font-mono text-lime uppercase text-[10px] block">WHY THIS SCENARIO?</strong>
                <p className="text-zinc-300 text-[11px] leading-relaxed mt-0.5">
                  {simulationResult.explainability}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 6. Save Scenario Action Bar */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <Save className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Enter scenario name (e.g. Monsoon Preventative Action Plan)..."
              value={scenarioNameInput}
              onChange={(e) => setScenarioNameInput(e.target.value)}
              className="w-full p-2 rounded-xl bg-white border border-zinc-300 text-xs font-medium focus:ring-2 focus:ring-lime"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveScenario}
              disabled={isSaving || !scenarioNameInput.trim()}
              className="px-4 py-2 rounded-xl bg-civic-dark text-lime text-xs font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <span>Save Scenario Plan</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-sans flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* 7. Saved Scenario History & Operational Review Status */}
        {savedScenarios.length > 0 && (
          <div className="p-5 rounded-3xl bg-white border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="font-bold text-xs text-civic-dark uppercase">
                SAVED WHAT-IF SCENARIOS & OPERATIONAL STATUS ({savedScenarios.length})
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Municipal Decision Support Repository
              </span>
            </div>

            <div className="space-y-2">
              {savedScenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">{sc.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        sc.scenario_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        sc.scenario_status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                        sc.scenario_status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-zinc-200 text-zinc-800'
                      }`}>
                        {sc.scenario_status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-sans">
                      {sc.intervention_type} · Timing: {sc.timing_months}M · Budget: {formatINR(sc.budget)} · Created by: {sc.created_by}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(sc.id, 'APPROVED')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(sc.id, 'REVIEWED')}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
