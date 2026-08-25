import React from 'react';
import { motion } from 'motion/react';
import {
  AlertOctagon,
  AlertTriangle,
  TrendingDown,
  Clock,
  ArrowRight,
  Sparkles,
  Sliders,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DecisionRecommendation } from '../../types';
import { formatINR } from '../../utils/formatters';

interface CivicDecisionCardProps {
  recommendation: DecisionRecommendation;
  onSelectAction?: (rec: DecisionRecommendation) => void;
  className?: string;
}

export const CivicDecisionCard: React.FC<CivicDecisionCardProps> = ({
  recommendation,
  onSelectAction,
  className = ''
}) => {
  const navigate = useNavigate();

  const isUrgent = recommendation.urgency === 'CRITICAL' || recommendation.urgency === 'HIGH';
  const isMonitor = recommendation.recommendation_type === 'MONITOR';

  return (
    <div className={`p-4 rounded-2xl border font-mono text-xs shadow-subtle transition-all hover:border-zinc-300 bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            recommendation.urgency === 'CRITICAL' ? 'bg-red-600 animate-pulse' :
            recommendation.urgency === 'HIGH' ? 'bg-orange-500' :
            recommendation.urgency === 'MEDIUM' ? 'bg-amber-500' :
            'bg-emerald-500'
          }`} />
          <span className="font-bold text-zinc-900">{recommendation.asset_id}</span>
          <span className="text-[10px] text-zinc-400">· {recommendation.asset_type}</span>
        </div>

        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
          recommendation.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' :
          recommendation.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' :
          recommendation.urgency === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
          'bg-emerald-100 text-emerald-800'
        }`}>
          {recommendation.urgency}
        </span>
      </div>

      {/* Action Title */}
      <div className="pt-2 pb-1">
        <span className="text-[9px] uppercase font-bold text-zinc-400 block">RECOMMENDED ACTION</span>
        <h4 className="font-sans font-bold text-xs text-civic-dark mt-0.5 leading-snug">
          {recommendation.action_title}
        </h4>
      </div>

      {/* Meta Strip */}
      <div className="grid grid-cols-2 gap-2 pt-1 pb-2 text-[10px] text-zinc-600">
        <div>
          <span className="text-zinc-400 block">Target Window</span>
          <span className="font-bold text-zinc-800">{recommendation.target_window}</span>
        </div>
        <div>
          <span className="text-zinc-400 block">Estimated Cost</span>
          <span className="font-bold text-zinc-900 font-mono">{formatINR(recommendation.estimated_cost)}</span>
        </div>
      </div>

      {/* Why Explanation Fact */}
      <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] font-sans text-zinc-600 space-y-1">
        <span className="font-mono text-[9px] text-zinc-400 uppercase font-bold block">WHY THIS ACTION?</span>
        <p className="line-clamp-2 leading-relaxed">
          {recommendation.why_explanation[0] || recommendation.expected_impact}
        </p>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="pt-3 flex items-center justify-between border-t border-zinc-100 mt-2">
        <Link
          to={`/assets/${recommendation.asset_id}#digital-twin`}
          className="text-[10px] text-lime-dark hover:underline font-bold flex items-center gap-1"
        >
          <Cpu className="w-3 h-3" />
          <span>Simulate Future</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            to={`/assets/${recommendation.asset_id}`}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono text-[10px] font-bold transition-colors"
          >
            Inspect
          </Link>
          {onSelectAction && !isMonitor && (
            <button
              onClick={() => onSelectAction(recommendation)}
              className="px-2.5 py-1 rounded-lg bg-civic-dark text-lime font-mono text-[10px] font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1"
            >
              <span>Act</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
