import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Database, ActivitySquare, ShieldAlert, Layers, BarChart3,
  Wrench, Banknote, PiggyBank, Clock, CheckCircle2, ChevronDown,
  ChevronRight, AlertOctagon, TrendingDown, Zap, ArrowRight, Info
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { formatINR } from '../../utils/formatters';

// ============================================================
// Types
// ============================================================
interface DecisionStep {
  step: number;
  stage: string;
  label: string;
  value: string;
  rating?: string;
  risk_level?: string;
  detail?: Record<string, any>;
}

interface DecisionChainData {
  asset_id: string;
  name: string;
  asset_type: string;
  location: string;
  zone?: string;
  ward?: string;
  summary: {
    risk_score: number;
    risk_level: string;
    condition_score: number;
    priority_rank: number;
    recommended_action: string;
    estimated_cost: number;
    budget_status: string;
    cost_of_delay_6m: number;
    final_decision: string;
  };
  decision_chain: DecisionStep[];
}

// ============================================================
// Stage config: icons, colors, labels
// ============================================================
const STAGE_CONFIG: Record<string, {
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  route?: (assetId: string) => string;
}> = {
  EVIDENCE: {
    icon: Database,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    accentColor: '#64748B',
    route: (id) => `/assets/${id}`,
  },
  CONDITION: {
    icon: ActivitySquare,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    accentColor: '#EA580C',
    route: (id) => `/assets/${id}`,
  },
  RISK: {
    icon: ShieldAlert,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    accentColor: '#DC2626',
    route: (id) => `/assets/${id}`,
  },
  RISK_DRIVERS: {
    icon: Layers,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    accentColor: '#7C3AED',
    route: (id) => `/assets/${id}`,
  },
  PRIORITY: {
    icon: BarChart3,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    accentColor: '#D97706',
    route: () => '/priorities',
  },
  INTERVENTION: {
    icon: Wrench,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    accentColor: '#2563EB',
    route: (id) => `/assets/${id}`,
  },
  COST: {
    icon: Banknote,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    accentColor: '#059669',
    route: () => '/budget',
  },
  BUDGET: {
    icon: PiggyBank,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    accentColor: '#0D9488',
    route: () => '/budget',
  },
  DELAY_CONSEQUENCE: {
    icon: Clock,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    accentColor: '#E11D48',
    route: (id) => `/simulation?asset=${id}`,
  },
  DECISION: {
    icon: CheckCircle2,
    color: 'text-lime-700',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-300',
    accentColor: '#4D7C0F',
    route: () => '/reports',
  },
};

// ============================================================
// Risk level badge
// ============================================================
const RiskLevelPill: React.FC<{ level: string }> = ({ level }) => {
  const upper = level.toUpperCase();
  const map: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-300',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-300',
    LOW: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${map[upper] || 'bg-zinc-100 text-zinc-600 border-zinc-300'}`}>
      {upper}
    </span>
  );
};

// ============================================================
// Condition rating badge
// ============================================================
const ConditionPill: React.FC<{ rating: string }> = ({ rating }) => {
  const map: Record<string, string> = {
    GOOD: 'bg-emerald-100 text-emerald-700',
    FAIR: 'bg-amber-100 text-amber-700',
    POOR: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${map[rating.toUpperCase()] || 'bg-zinc-100 text-zinc-600'}`}>
      {rating}
    </span>
  );
};

// ============================================================
// Budget status pill
// ============================================================
const BudgetStatusPill: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    FUNDED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    UNFUNDED: 'bg-rose-100 text-rose-700 border-rose-300',
    UNKNOWN: 'bg-zinc-100 text-zinc-500 border-zinc-300',
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${map[status.toUpperCase()] || map.UNKNOWN}`}>
      {status.toUpperCase()}
    </span>
  );
};

// ============================================================
// Decision verdict banner
// ============================================================
const DecisionVerdict: React.FC<{ decision: string; insight?: string }> = ({ decision, insight }) => {
  const isRepairNow = decision === 'REPAIR NOW';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-4 flex items-center gap-3 mt-1 ${
        isRepairNow
          ? 'bg-[#1A1A1A] border border-lime-400/30'
          : 'bg-emerald-900/20 border border-emerald-500/30'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isRepairNow ? 'bg-[#9FFF00]/20' : 'bg-emerald-500/20'
      }`}>
        {isRepairNow
          ? <Zap className="w-5 h-5 text-[#9FFF00]" />
          : <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-mono tracking-widest uppercase font-bold ${isRepairNow ? 'text-[#9FFF00]' : 'text-emerald-400'}`}>
          CIVICX VERDICT
        </div>
        <div className={`text-sm font-display font-extrabold mt-0.5 ${isRepairNow ? 'text-white' : 'text-emerald-100'}`}>
          {decision}
        </div>
        {insight && (
          <p className="text-[11px] text-zinc-400 mt-1 leading-snug line-clamp-2">{insight}</p>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================
// Single step card
// ============================================================
const StepCard: React.FC<{
  step: DecisionStep;
  assetId: string;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
  index: number;
}> = ({ step, assetId, isExpanded, onToggle, isLast, index }) => {
  const config = STAGE_CONFIG[step.stage] || STAGE_CONFIG.EVIDENCE;
  const Icon = config.icon;
  const route = config.route?.(assetId);

  return (
    <div className="relative">
      {/* Connector line — not for last step */}
      {!isLast && (
        <div
          className="absolute left-[18px] top-[46px] w-0.5 bg-zinc-200 z-0"
          style={{ height: 'calc(100% - 6px)' }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.25 }}
        className="relative z-10"
      >
        {/* Step row */}
        <button
          onClick={onToggle}
          className="w-full flex items-start gap-3 py-1 group focus:outline-none"
        >
          {/* Step icon bubble */}
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200 ${
              isExpanded
                ? `bg-[${config.accentColor}] border-transparent`
                : `${config.bgColor} ${config.borderColor} group-hover:scale-110`
            }`}
            style={isExpanded ? { backgroundColor: config.accentColor } : {}}
          >
            <Icon
              className={`w-4 h-4 ${isExpanded ? 'text-white' : config.color}`}
            />
          </div>

          {/* Step content */}
          <div className="flex-1 min-w-0 text-left pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">
                {step.step.toString().padStart(2, '0')} · {step.label}
              </span>
              {/* Status pills */}
              {step.rating && <ConditionPill rating={step.rating} />}
              {step.risk_level && <RiskLevelPill level={step.risk_level} />}
              {step.stage === 'BUDGET' && step.detail?.status && (
                <BudgetStatusPill status={step.detail.status} />
              )}
              {step.stage === 'DECISION' && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  step.value === 'REPAIR NOW'
                    ? 'bg-[#9FFF00]/20 text-[#1A1A1A]'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {step.value}
                </span>
              )}
            </div>
            <div className={`text-sm font-semibold mt-0.5 truncate ${
              step.stage === 'DECISION'
                ? 'text-[#1A1A1A]'
                : 'text-zinc-800'
            }`}>
              {step.stage !== 'DECISION' && step.stage !== 'BUDGET' && step.stage !== 'EVIDENCE'
                ? step.value
                : null}
              {step.stage === 'EVIDENCE' && (
                <span className="text-xs text-zinc-600 font-normal">{step.value}</span>
              )}
            </div>
          </div>

          {/* Expand/collapse + navigate */}
          <div className="flex items-center gap-1 pt-1">
            {route && (
              <Link
                to={route}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] font-mono text-zinc-400 hover:text-civic-dark transition-colors p-1 rounded hover:bg-zinc-100"
                title={`Navigate to ${step.label}`}
              >
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </div>
          </div>
        </button>

        {/* Expanded detail panel */}
        <AnimatePresence>
          {isExpanded && step.detail && (
            <motion.div
              key={`detail-${step.step}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className={`ml-12 mb-2 rounded-xl p-3 border ${config.bgColor} ${config.borderColor}`}>
                <StepDetail step={step} config={config} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// ============================================================
// Detail content per stage
// ============================================================
const StepDetail: React.FC<{ step: DecisionStep; config: any }> = ({ step, config }) => {
  const d = step.detail || {};

  const Row: React.FC<{ label: string; value: any; mono?: boolean }> = ({ label, value, mono }) => (
    <div className="flex justify-between items-center gap-2 py-0.5">
      <span className="text-[11px] text-zinc-500">{label}</span>
      <span className={`text-[11px] font-semibold text-right ${mono ? 'font-mono' : ''} ${config.color}`}>
        {String(value ?? '—')}
      </span>
    </div>
  );

  if (step.stage === 'EVIDENCE') {
    return (
      <div className="space-y-0.5">
        <Row label="Maintenance Records" value={`${d.maintenance_records ?? 0} logs`} />
        <Row label="Incident Reports" value={`${d.incident_reports ?? 0} reports`} />
        <Row label="Last Inspection" value={d.last_inspection || 'Not recorded'} />
        <Row label="Data Quality" value={d.data_age_label || 'Analytical Baseline'} />
        {d.citizen_reports_count !== undefined && d.citizen_reports_count > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-purple-200 text-purple-900 font-mono text-[10px] flex items-center justify-between">
            <span className="font-bold">Citizen Evidence Available:</span>
            <span className="font-bold">{d.citizen_reports_count} validated observations</span>
          </div>
        )}
      </div>
    );
  }

  if (step.stage === 'CONDITION') {
    return (
      <div className="space-y-0.5">
        <Row label="Condition Index" value={`${d.condition_score}/100`} mono />
        <Row label="Damage Severity" value={`${d.damage_severity}/100`} mono />
        <Row label="Damage Type" value={d.damage_type || 'Surface Distress'} />
        <Row label="Rating" value={d.condition_rating || 'POOR'} />
      </div>
    );
  }

  if (step.stage === 'RISK') {
    return (
      <div className="space-y-0.5">
        <Row label="Risk Score" value={`${d.risk_score}/100`} mono />
        <Row label="Classification" value={d.risk_level} />
        <Row label="Method" value={d.calculation_method || '6-Factor MCDA'} />
        <Row label="Data Confidence" value={d.confidence || 'MEDIUM'} />
        <div className="mt-2 pt-2 border-t border-current/10">
          <p className="text-[10px] text-zinc-500 flex items-start gap-1">
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
            All risk values are deterministic. No ML model used. Fully auditable.
          </p>
        </div>
      </div>
    );
  }

  if (step.stage === 'RISK_DRIVERS') {
    const topDrivers: any[] = d.top_drivers || [];
    return (
      <div className="space-y-1.5">
        {topDrivers.length === 0 && (
          <p className="text-[11px] text-zinc-500">No driver breakdown available.</p>
        )}
        {topDrivers.map((driver: any, i: number) => (
          <div key={i} className="space-y-0.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium text-zinc-700">{driver.factor}</span>
              <span className={`text-[11px] font-mono font-bold ${config.color}`}>
                +{driver.score_contribution ?? 0} pts
              </span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-1">
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${Math.min(100, (driver.score_contribution ?? 0) * 4)}%`,
                  backgroundColor: config.accentColor
                }}
              />
            </div>
            <p className="text-[10px] text-zinc-500">{driver.description}</p>
          </div>
        ))}
      </div>
    );
  }

  if (step.stage === 'PRIORITY') {
    return (
      <div className="space-y-0.5">
        <Row label="City Rank" value={`#${d.rank} of ${d.total_assets || '?'} assets`} mono />
        <Row label="Priority Status" value={d.priority_label || `Rank #${d.rank}`} />
        <Row label="Top Priority?" value={d.is_top_priority ? '✓ YES — Urgent Action Required' : 'Moderate Priority'} />
      </div>
    );
  }

  if (step.stage === 'INTERVENTION') {
    return (
      <div className="space-y-0.5">
        <Row label="Prescribed Action" value={d.action} />
        <Row label="Criticality" value={d.criticality || '—'} />
        <Row label="Urgency" value={d.urgency || '—'} />
      </div>
    );
  }

  if (step.stage === 'COST') {
    return (
      <div className="space-y-0.5">
        <Row label="Estimated Cost" value={d.estimated_cost ? `₹${(d.estimated_cost / 100000).toFixed(1)} Lakhs` : '—'} mono />
        <Row label="Cost Type" value={d.cost_type || 'Estimated Engineering Cost'} />
        <Row label="Expected Risk Reduction" value={`−${d.expected_risk_reduction ?? '?'} pts`} mono />
        <Row label="Post-Repair Risk" value={`${d.post_repair_risk ?? 12}/100`} mono />
      </div>
    );
  }

  if (step.stage === 'BUDGET') {
    return (
      <div className="space-y-0.5">
        <Row label="Budget Status" value={<BudgetStatusPill status={d.status || 'UNKNOWN'} />} />
        <Row label="Baseline Budget" value={d.baseline_budget ? `₹${(d.baseline_budget / 10000000).toFixed(1)} Crore` : '₹2.5 Crore'} mono />
        {!d.is_funded && d.budget_gap > 0 && (
          <Row
            label="Additional Funding Needed"
            value={`₹${(d.budget_gap / 100000).toFixed(1)} Lakhs`}
            mono
          />
        )}
        <p className="text-[10px] text-zinc-500 mt-1">{d.note || '—'}</p>
      </div>
    );
  }

  if (step.stage === 'DELAY_CONSEQUENCE') {
    return (
      <div className="space-y-0.5">
        <Row
          label="Cost of 6-Month Delay"
          value={d.cost_of_delay_6m ? `+₹${(d.cost_of_delay_6m / 100000).toFixed(1)} Lakhs` : '—'}
          mono
        />
        <Row label="Escalation" value={`+${d.escalation_pct ?? 52}%`} mono />
        <Row label="Projected Risk (6 Mo)" value={d.risk_at_6m ? `${d.risk_at_6m}/100` : '—'} mono />
        <Row label="Additional Risk Points" value={d.additional_risk ? `+${d.additional_risk} pts` : '—'} mono />
        {d.simulation_note && (
          <div className="mt-1 p-1.5 rounded-lg bg-rose-100/50 border border-rose-200">
            <p className="text-[10px] text-rose-700 font-mono">{d.simulation_note}</p>
          </div>
        )}
      </div>
    );
  }

  if (step.stage === 'DECISION') {
    return (
      <div className="space-y-0.5">
        <Row label="Verdict" value={d.decision || 'REPAIR NOW'} />
        <Row label="Confidence" value={d.confidence || 'MEDIUM'} />
        {d.rationale && (
          <p className="text-[10px] text-zinc-500 mt-1 leading-snug">{d.rationale}</p>
        )}
      </div>
    );
  }

  return (
    <p className="text-[11px] text-zinc-500">{JSON.stringify(d).slice(0, 120)}</p>
  );
};

// ============================================================
// Main Component
// ============================================================
interface AssetDecisionChainProps {
  assetId: string;
  compact?: boolean;
  className?: string;
}

export const AssetDecisionChain: React.FC<AssetDecisionChainProps> = ({
  assetId,
  compact = false,
  className = '',
}) => {
  const [data, setData] = useState<DecisionChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([3, 9, 10]));

  const load = useCallback(async () => {
    if (!assetId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await ApiService.getAssetDecisionChain(assetId);
      setData(result);
    } catch {
      setError('Failed to load decision chain data.');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStep = (step: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

  const expandAll = () => {
    if (data) setExpandedSteps(new Set(data.decision_chain.map((s) => s.step)));
  };
  const collapseAll = () => setExpandedSteps(new Set());

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className={`rounded-3xl bg-white border border-zinc-200 p-5 ${className}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 animate-pulse" />
          <div className="h-4 w-40 bg-zinc-100 rounded animate-pulse" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-zinc-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-zinc-100 rounded animate-pulse w-24" />
              <div className="h-4 bg-zinc-100 rounded animate-pulse w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────
  if (error || !data) {
    return (
      <div className={`rounded-3xl bg-white border border-red-200 p-5 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertOctagon className="w-4 h-4" />
          <span className="text-sm font-semibold">Decision chain unavailable</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1">{error || 'Unable to load chain data.'}</p>
        <button
          onClick={load}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const chain = data.decision_chain || [];
  const summary = data.summary;
  const finalDecision = chain.find((s) => s.stage === 'DECISION');

  // ── Compact mode: just the hero summary strip ─────────────
  if (compact) {
    return (
      <div className={`rounded-2xl bg-white border border-zinc-200 p-4 ${className}`}>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Risk', value: `${summary.risk_score}/100`, sub: summary.risk_level },
            { label: 'Priority', value: `#${summary.priority_rank}`, sub: 'City Rank' },
            { label: 'Action', value: summary.recommended_action, sub: 'Prescribed Fix', wide: true },
            { label: 'Cost', value: `₹${(summary.estimated_cost / 100000).toFixed(1)}L`, sub: 'Estimated' },
            { label: 'Budget', value: summary.budget_status, sub: 'Status' },
            { label: 'Delay +6M', value: `+₹${(summary.cost_of_delay_6m / 100000).toFixed(1)}L`, sub: '+52%' },
            { label: 'Verdict', value: summary.final_decision, sub: 'CivicX Decision' },
          ].map((item, i) => (
            <div key={i} className={`${(item as any).wide ? 'flex-[2]' : 'flex-1'} min-w-[80px] bg-zinc-50 rounded-xl p-2.5 border border-zinc-100`}>
              <div className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">{item.label}</div>
              <div className="text-sm font-bold text-civic-dark mt-0.5 truncate">{item.value}</div>
              <div className="text-[10px] text-zinc-500">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Full mode ─────────────────────────────────────────────
  return (
    <div className={`rounded-3xl bg-white border border-zinc-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-zinc-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-[#9FFF00]" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-civic-dark tracking-tight uppercase">
                DECISION CHAIN
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mt-1">
              {data.name} · {data.asset_type} · {data.location}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={expandAll}
              className="text-[10px] font-mono text-zinc-400 hover:text-zinc-700 transition-colors px-2 py-1 rounded hover:bg-zinc-100"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-[10px] font-mono text-zinc-400 hover:text-zinc-700 transition-colors px-2 py-1 rounded hover:bg-zinc-100"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Decision verdict strip */}
        {finalDecision && (
          <DecisionVerdict
            decision={finalDecision.value}
            insight={finalDecision.detail?.rationale || finalDecision.detail?.decision_insight}
          />
        )}
      </div>

      {/* Chain steps */}
      <div className="px-5 py-4 space-y-1">
        {chain.map((step, idx) => (
          <StepCard
            key={step.step}
            step={step}
            assetId={assetId}
            isExpanded={expandedSteps.has(step.step)}
            onToggle={() => toggleStep(step.step)}
            isLast={idx === chain.length - 1}
            index={idx}
          />
        ))}
      </div>

      {/* Phase 5: WHY THIS DECISION? Synthesis Card */}
      <div className="mx-5 mb-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
            <h4 className="text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
              WHY CIVICX RECOMMENDS THIS
            </h4>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            summary.final_decision === 'REPAIR NOW'
              ? 'bg-[#1A1A1A] text-[#9FFF00]'
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            VERDICT: {summary.final_decision}
          </span>
        </div>

        {/* Structured Decision Equation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
            <span className="text-[9px] text-zinc-400 block uppercase">Composite Risk</span>
            <span className="font-bold text-red-600 text-sm">{summary.risk_score} / 100</span>
            <span className="text-[9px] text-zinc-500 block">{summary.risk_level}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
            <span className="text-[9px] text-zinc-400 block uppercase">City Priority</span>
            <span className="font-bold text-civic-dark text-sm">#{summary.priority_rank} / 78</span>
            <span className="text-[9px] text-zinc-500 block">Ranking</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
            <span className="text-[9px] text-zinc-400 block uppercase">Immediate Cost</span>
            <span className="font-bold text-zinc-800 text-sm">₹{(summary.estimated_cost / 100000).toFixed(1)}L</span>
            <span className="text-[9px] text-zinc-500 block">{summary.budget_status}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
            <span className="text-[9px] text-zinc-400 block uppercase">Cost of Delay (6M)</span>
            <span className="font-bold text-rose-600 text-sm">+₹{(summary.cost_of_delay_6m / 100000).toFixed(1)}L</span>
            <span className="text-[9px] text-rose-500 block">+52% Penalty</span>
          </div>
        </div>

        {/* Logical synthesis explanation */}
        <div className="p-3 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-700 leading-relaxed font-sans">
          <strong>Decision Logic: </strong>
          Corridor exhibits <strong>{summary.risk_level.toLowerCase()} composite risk ({summary.risk_score}/100)</strong> with a critical structural condition deficit ({summary.condition_score}/100). Prescribed action <em>"{summary.recommended_action}"</em> locks in baseline cost at ₹{(summary.estimated_cost / 100000).toFixed(1)} Lakhs. Deferring action by 6 months incurs an estimated +₹{(summary.cost_of_delay_6m / 100000).toFixed(1)} Lakhs financial penalty, justifying immediate execution.
        </div>
      </div>

      {/* Footer audit trail */}
      <div className="px-5 pb-4 pt-2 border-t border-zinc-100">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-zinc-400">
            CIVICX MCDA Engine · Deterministic · Fully Auditable · No ML Hallucination
          </p>
          <Link
            to={`/reports?asset=${assetId}`}
            className="text-[10px] font-mono text-zinc-500 hover:text-civic-dark flex items-center gap-1 transition-colors"
          >
            Full Report <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

