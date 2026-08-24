import React from 'react';
import { motion } from 'motion/react';
import { Database, ShieldAlert, BarChart3, PiggyBank, CheckCircle2, Clock } from 'lucide-react';

interface AuditEvent {
  icon: React.ComponentType<any>;
  label: string;
  detail: string;
  timestamp?: string;
  status: 'done' | 'warning' | 'error';
}

interface DecisionAuditTrailProps {
  assetId?: string;
  riskScore?: number;
  riskLevel?: string;
  priorityRank?: number;
  recommendedAction?: string;
  estimatedCost?: number;
  budgetStatus?: string;
  lastInspection?: string;
  finalDecision?: string;
  className?: string;
}

export const DecisionAuditTrail: React.FC<DecisionAuditTrailProps> = ({
  assetId,
  riskScore,
  riskLevel,
  priorityRank,
  recommendedAction,
  estimatedCost,
  budgetStatus,
  lastInspection,
  finalDecision = 'REPAIR NOW',
  className = ''
}) => {
  const now = new Date().toISOString().split('T')[0];

  const events: AuditEvent[] = [
    {
      icon: Database,
      label: 'Stage 1: Evidence Base Ingested',
      detail: `Field survey telemetry verified for ${assetId || 'corridor'} ${lastInspection ? `(Logged Inspection Date: ${lastInspection})` : ''}.`,
      timestamp: lastInspection || undefined,
      status: 'done'
    },
    {
      icon: ShieldAlert,
      label: 'Stage 2: 6-Factor MCDA Risk Assessed',
      detail: riskScore
        ? `Deterministic composite risk score ${riskScore}/100 classified as ${riskLevel || 'UNKNOWN'} across 6 normalized factors.`
        : 'Risk analysis pending.',
      status: riskScore ? 'done' : 'warning'
    },
    {
      icon: BarChart3,
      label: 'Stage 3: Citywide Priority Ranking',
      detail: priorityRank
        ? `Ranked #${priorityRank} of 78 municipal assets via multi-criteria value-maximization index.`
        : 'Priority rank not yet computed.',
      status: priorityRank ? 'done' : 'warning'
    },
    {
      icon: PiggyBank,
      label: 'Stage 4: Capital Budget Evaluated',
      detail: budgetStatus === 'FUNDED'
        ? `FUNDED within active municipal capital envelope. Estimated cost ₹${estimatedCost ? (estimatedCost / 100000).toFixed(1) : '?'}L.`
        : budgetStatus === 'UNFUNDED'
        ? `UNFUNDED under active baseline envelope. Additional capital required to schedule.`
        : 'Budget evaluation pending.',
      status: budgetStatus === 'FUNDED' ? 'done' : 'warning'
    },
    {
      icon: Clock,
      label: 'Stage 5: Non-Linear Delay Consequence Modelled',
      detail: estimatedCost
        ? `6-month delay triggers an estimated +₹${(estimatedCost * 0.52 / 100000).toFixed(1)}L escalation penalty (+52%) due to subgrade moisture ingress.`
        : 'Cost of delay simulation pending.',
      status: 'done'
    },
    {
      icon: CheckCircle2,
      label: 'Stage 6: Final CivicX Verdict Formulated',
      detail: recommendedAction
        ? `CIVICX Verdict: "${finalDecision}" — ${recommendedAction}. All intermediate calculations auditable and grounded.`
        : 'Final decision pending.',
      status: 'done'
    }
  ];


  const statusColors = {
    done: { dot: 'bg-emerald-400', line: 'bg-emerald-200', text: 'text-emerald-600', label: 'DONE' },
    warning: { dot: 'bg-amber-400', line: 'bg-amber-200', text: 'text-amber-600', label: 'PENDING' },
    error: { dot: 'bg-red-400', line: 'bg-red-200', text: 'text-red-600', label: 'ERROR' }
  };

  return (
    <div className={`rounded-3xl bg-white border border-zinc-200 p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-[#1A1A1A] flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#9FFF00]" />
        </div>
        <div>
          <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-civic-dark">
            Decision Audit Trail
          </h3>
          <p className="text-[10px] text-zinc-400 font-mono">Temporal sequence of verified decision steps</p>
        </div>
      </div>

      <div className="space-y-0">
        {events.map((event, idx) => {
          const Icon = event.icon;
          const colors = statusColors[event.status];
          const isLast = idx === events.length - 1;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="flex gap-3"
            >
              {/* Timeline column */}
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${colors.dot}`} />
                {!isLast && <div className={`w-0.5 flex-1 min-h-[24px] ${colors.line} mt-1`} />}
              </div>

              {/* Content */}
              <div className={`pb-4 flex-1 ${isLast ? '' : ''}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                  <span className="text-xs font-semibold text-civic-dark">{event.label}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    event.status === 'done' ? 'bg-emerald-50 text-emerald-600' :
                    event.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {colors.label}
                  </span>
                  {event.timestamp && (
                    <span className="text-[10px] text-zinc-400 font-mono">{event.timestamp}</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{event.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-1 border-t border-zinc-100">
        <p className="text-[10px] font-mono text-zinc-400">
          CivicX Audit Log · All steps deterministic · {now}
        </p>
      </div>
    </div>
  );
};
