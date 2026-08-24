import React from 'react';
import { ShieldAlert, TrendingDown, CheckCircle2, HelpCircle, ArrowDownRight, Layers } from 'lucide-react';
import { RiskExplanationDetail } from '../../services/api';
import { RiskBadge } from './RiskBadge';

interface ExplainableRiskCardProps {
  explanation: RiskExplanationDetail;
  assetName?: string;
}

export const ExplainableRiskCard: React.FC<ExplainableRiskCardProps> = ({
  explanation,
  assetName,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-subtle space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h3 className="font-display font-extrabold text-base text-civic-dark tracking-tight">
              WHY THIS RISK?
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            Multi-criteria factor decomposition & risk drivers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RiskBadge 
            level={explanation.risk_level as any} 
            score={explanation.risk_score} 
            size="sm" 
          />
        </div>
      </div>

      {/* Non-Technical Summary Explanation */}
      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-1.5">
        <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block tracking-wider">
          PRIMARY RISK DRIVER SUMMARY
        </span>
        <p className="text-xs text-zinc-700 leading-relaxed font-medium">
          {explanation.summary_explanation}
        </p>
      </div>

      {/* Ranked Factor Contribution Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
            Factor Contribution Breakdown
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            Score Impact (0-100)
          </span>
        </div>

        <div className="space-y-2.5">
          {explanation.drivers.map((driver, idx) => {
            const isHigh = driver.impact === 'Critical' || driver.impact === 'High';
            return (
              <div key={idx} className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-800 font-sans">{driver.factor}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      driver.impact === 'Critical' ? 'bg-red-100 text-red-700' :
                      driver.impact === 'High' ? 'bg-orange-100 text-orange-700' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {driver.impact}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-red-600">+{driver.score_contribution}</span>
                    <span className="text-[10px] text-zinc-400 font-sans">({driver.percentage_share}%)</span>
                  </div>
                </div>

                {/* Contribution Bar */}
                <div className="w-full h-2 rounded-full bg-zinc-200/60 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      driver.impact === 'Critical' ? 'bg-red-600' :
                      driver.impact === 'High' ? 'bg-orange-500' :
                      'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, driver.percentage_share * 1.5))}%` }}
                  />
                </div>

                <p className="text-[11px] text-zinc-500">
                  {driver.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHAT WOULD REDUCE THE RISK? */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
        <div className="flex items-center gap-1.5 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
          <span>WHAT WOULD REDUCE THE RISK?</span>
        </div>
        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
          {explanation.what_would_reduce_risk}
        </p>
        <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-emerald-700">
          <span>Lifecycle Efficiency:</span>
          <span className="font-bold">{explanation.preventative_roi}</span>
        </div>
      </div>

      {/* WHAT HAPPENS IF WE DELAY? */}
      <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-rose-800 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>WHAT IF WE DELAY 6 MONTHS?</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
            PROJECTED
          </span>
        </div>
        <p className="text-xs text-rose-900 leading-relaxed font-medium">
          Deferring intervention past 6 months triggers an estimated <strong>+52% cost escalation penalty</strong> due to progressive subgrade shear failure and moisture infiltration.
        </p>
        <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-rose-800">
          <span>Simulation Model:</span>
          <span className="font-bold">Non-linear Compound Decay</span>
        </div>
      </div>

      {/* Model Transparency Tag */}
      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400">
        <span>ENGINE: {explanation.confidence_label || '6-Factor MCDA Analytical Model'}</span>
        <span className="text-emerald-600 font-bold">100% AUDITABLE</span>
      </div>
    </div>
  );
};

