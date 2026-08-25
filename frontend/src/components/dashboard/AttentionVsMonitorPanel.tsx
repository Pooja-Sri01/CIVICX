import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertOctagon,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { DecisionRecommendation } from '../../types';
import { CivicDecisionCard } from '../common/CivicDecisionCard';

interface AttentionVsMonitorPanelProps {
  attentionList: DecisionRecommendation[];
  monitorList: DecisionRecommendation[];
  onSelectAction?: (rec: DecisionRecommendation) => void;
}

export const AttentionVsMonitorPanel: React.FC<AttentionVsMonitorPanelProps> = ({
  attentionList,
  monitorList,
  onSelectAction
}) => {
  const [activeTab, setActiveTab] = useState<'ATTENTION' | 'MONITOR'>('ATTENTION');

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-subtle font-mono text-xs space-y-4">
      {/* Header Tabs */}
      <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-zinc-200 p-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('ATTENTION')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ATTENTION'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>ATTENTION REQUIRED ({attentionList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('MONITOR')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'MONITOR'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>WHAT CAN WAIT · MONITOR ({monitorList.length})</span>
            </button>
          </div>
        </div>

        <span className="text-[10px] text-zinc-500 font-sans">
          {activeTab === 'ATTENTION'
            ? 'Prioritized by Critical Risk, Accelerating Decay, and 6–12M Thresholds'
            : 'Stable Lifecycle Assets · Capital Preserved for Urgent Interventions'}
        </span>
      </div>

      {/* Grid of Decision Cards */}
      <div className="p-5 pt-1">
        {activeTab === 'ATTENTION' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {attentionList.slice(0, 6).map((rec) => (
              <CivicDecisionCard
                key={rec.asset_id}
                recommendation={rec}
                onSelectAction={onSelectAction}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {monitorList.slice(0, 6).map((rec) => (
              <CivicDecisionCard
                key={rec.asset_id}
                recommendation={rec}
                onSelectAction={onSelectAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
