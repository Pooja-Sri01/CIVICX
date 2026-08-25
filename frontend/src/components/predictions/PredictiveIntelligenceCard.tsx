import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingDown,
  Activity,
  AlertTriangle,
  Clock,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  RotateCcw,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertOctagon,
  Cpu
} from 'lucide-react';
import { DeteriorationForecast } from '../../types';

interface PredictiveIntelligenceCardProps {
  forecast: DeteriorationForecast | null;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const PredictiveIntelligenceCard: React.FC<PredictiveIntelligenceCardProps> = ({
  forecast,
  onRefresh,
  isLoading = false
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<string>('12M');

  if (!forecast) {
    return (
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-subtle text-center text-xs text-zinc-500 font-mono">
        Loading predictive deterioration forecast...
      </div>
    );
  }

  // Low-Data Honest Notice Handling
  if (!forecast.is_available) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-subtle font-mono text-xs">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-civic-dark uppercase tracking-wide">
                PREDICTIVE DETERIORATION FORECAST
              </span>
              <p className="text-[11px] text-zinc-500">Longitudinal Defect Trajectory Modeling</p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
            DATA READINESS: {forecast.data_quality}
          </span>
        </div>

        <div className="p-6 space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-bold text-sm text-zinc-800">
              Longitudinal Forecast Temporarily Unavailable
            </h4>
            <p className="text-[11px] text-zinc-600 font-sans max-w-md mx-auto leading-relaxed">
              {forecast.unavailable_reason || 'Insufficient historical condition observations to establish an empirical decay envelope.'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700 font-sans max-w-md mx-auto text-left">
            <strong>Recommended Municipal Action:</strong> {forecast.recommended_action || 'Continue routine non-destructive inspections to establish a multi-year time-series baseline.'}
          </div>
        </div>
      </div>
    );
  }

  const activePoint = forecast.forecast.find(f => f.horizon === selectedHorizon) || forecast.forecast[1] || forecast.forecast[0];
  const isAccelerating = forecast.trend === 'ACCELERATING';

  // SVG Chart Calculations
  const chartPoints = [
    { x: 10, y: 100 - forecast.current_condition, label: 'NOW', val: forecast.current_condition },
    ...forecast.forecast.map((f, idx) => ({
      x: 35 + idx * 28,
      y: 100 - f.condition,
      label: f.horizon,
      val: f.condition,
      lower: f.lower_bound,
      upper: f.upper_bound
    }))
  ];

  const svgPath = chartPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x}% ${Math.max(5, Math.min(95, p.y))}%`).join(' ');

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-subtle font-mono text-xs">
      {/* Header Banner */}
      <div className="p-4 bg-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-lime/20 text-lime flex items-center justify-center border border-lime/30">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm text-white tracking-tight uppercase">
                PREDICTIVE INFRASTRUCTURE INTELLIGENCE
              </span>
              <span className="bg-lime text-civic-dark text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded">
                PROMPT 8 FORECAST
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Empirical Multi-Horizon Deterioration & Proactive Maintenance Timeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isAccelerating ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-lime/20 text-lime border border-lime/30'
          }`}>
            TREND: {forecast.trend}
          </span>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
            READINESS: {forecast.data_quality}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Current Condition</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-lg text-civic-dark">
                {forecast.current_condition}
              </span>
              <span className="text-zinc-400 text-xs">/ 100</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-sans block">
              {forecast.current_condition < 40 ? 'Critical state' : forecast.current_condition < 60 ? 'Poor state' : 'Fair state'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Deterioration Rate</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`font-display font-black text-lg ${isAccelerating ? 'text-red-600' : 'text-zinc-900'}`}>
                -{forecast.deterioration_rate}
              </span>
              <span className="text-zinc-400 text-[10px]">pts/yr</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-sans block">
              {isAccelerating ? 'Accelerating decay' : 'Linear baseline'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Critical Threshold (&lt;40)</span>
            <span className="font-bold text-xs text-rose-600 block mt-1 truncate">
              {forecast.critical_threshold_crossing}
            </span>
            <span className="text-[10px] text-zinc-500 font-sans block">
              Condition threshold envelope
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-lime/10 border border-lime/30 space-y-1">
            <span className="text-[10px] text-civic-dark uppercase font-extrabold block">Maintenance Window</span>
            <span className="font-display font-black text-sm text-civic-dark block mt-1">
              {forecast.maintenance_window}
            </span>
            <span className="text-[10px] text-lime-dark font-sans block font-bold">
              Proactive Action Optimal
            </span>
          </div>
        </div>

        {/* Interactive Condition Trajectory Timeline */}
        <div className="p-5 rounded-3xl bg-zinc-950 text-white space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-lime" />
              <span className="font-bold text-xs text-white uppercase tracking-wide">
                PROJECTED CONDITION TRAJECTORY (CIVICX TIME MACHINE)
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">
              Model: {forecast.model_name} ({forecast.model_version})
            </span>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {forecast.forecast.map((pt) => {
              const isSelected = selectedHorizon === pt.horizon;
              return (
                <button
                  key={pt.horizon}
                  onClick={() => setSelectedHorizon(pt.horizon)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-lime text-civic-dark border-lime shadow-lime-glow font-bold'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold">{pt.horizon} ({pt.months}M)</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      isSelected ? 'bg-civic-dark text-lime' : 'bg-white/10 text-zinc-300'
                    }`}>
                      {pt.condition_band}
                    </span>
                  </div>

                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display font-black text-base">
                      {pt.condition}
                    </span>
                    <span className="text-[10px] opacity-75">/ 100</span>
                  </div>

                  <div className="text-[9px] opacity-70 mt-0.5">
                    Range: {pt.lower_bound}–{pt.upper_bound}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Horizon Detail Panel */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 font-sans">
              <span className="font-mono text-[10px] text-lime uppercase font-bold block">
                {selectedHorizon} FORECAST HORIZON ENVELOPE:
              </span>
              <p className="text-zinc-300 text-[11px]">
                Projected Condition: <strong className="text-white">{activePoint.condition}/100</strong> (Expected Range: {activePoint.lower_bound}–{activePoint.upper_bound}). Projected Risk Index: <strong className="text-rose-400">{activePoint.projected_risk}/100</strong>.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 text-[11px] font-bold border border-zinc-700">
                {activePoint.condition < 40 ? 'CRITICAL RISK' : activePoint.condition < 60 ? 'ELEVATED RISK' : 'STABILIZED'}
              </span>
            </div>
          </div>
        </div>

        {/* Explainable Evidence ("Why this forecast?") */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5">
          <div className="flex items-center gap-2 text-civic-dark">
            <Cpu className="w-4 h-4 text-purple-700" />
            <span className="font-bold uppercase text-[11px]">
              WHY THIS FORECAST? (GROUND TRUTH EVIDENCE CHAIN)
            </span>
          </div>

          <div className="space-y-1.5">
            {forecast.evidence_chain.map((ev, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-zinc-700 font-sans leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                <span>{ev}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guardrail Disclaimer */}
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-sans flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
          <div>
            <strong>Separation of Predictive Model & Official Risk:</strong> {forecast.decision_disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};
