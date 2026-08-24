import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  AlertOctagon, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  DollarSign
} from 'lucide-react';
import { AIDecisionInsightsResponse, AIDecisionInsight } from '../../types';

interface AIDecisionInsightsCardProps {
  insightsData: AIDecisionInsightsResponse | null;
  onOpenCopilot?: () => void;
}

export const AIDecisionInsightsCard: React.FC<AIDecisionInsightsCardProps> = ({
  insightsData,
  onOpenCopilot
}) => {
  const navigate = useNavigate();

  if (!insightsData) return null;

  const allInsights: AIDecisionInsight[] = [
    ...(insightsData.insights?.critical || []),
    ...(insightsData.insights?.warning || []),
    ...(insightsData.insights?.opportunities || [])
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border-2 border-civic-dark bg-white shadow-elevated space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-civic-dark flex items-center justify-center">
            <Zap className="w-4 h-4 text-lime" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-base text-civic-dark tracking-tight">
                AI DECISION INSIGHTS
              </h3>
              <span className="bg-lime text-civic-dark text-[9px] font-extrabold uppercase px-2 py-0.5 rounded font-mono">
                PROACTIVE ENGINE
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Pattern intelligence identified from real-time city risk, budget gaps, and degradation trends
            </p>
          </div>
        </div>

        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-bold font-mono transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-civic-dark" />
            <span>Ask Copilot →</span>
          </button>
        )}
      </div>

      {/* Insight Badges Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {allInsights.map((insight) => {
          const isCrit = insight.category === 'CRITICAL';
          const isWarn = insight.category === 'WARNING';
          
          return (
            <div
              key={insight.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isCrit
                  ? 'bg-red-50/60 border-red-200'
                  : isWarn
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-emerald-50/60 border-emerald-200'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                    isCrit ? 'bg-red-200 text-red-900' : isWarn ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    {insight.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-900">
                    {insight.metric_value}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-civic-dark leading-snug">
                  {insight.title}
                </h4>

                <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">
                  {insight.description}
                </p>
              </div>

              <button
                onClick={() => navigate(insight.action_route)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between font-mono ${
                  isCrit
                    ? 'bg-red-900 text-white hover:bg-red-950'
                    : isWarn
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                    : 'bg-emerald-900 text-white hover:bg-emerald-950'
                }`}
              >
                <span>{insight.action_label}</span>
                <ArrowRight className="w-3 h-3 text-lime" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
