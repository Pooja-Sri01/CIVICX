import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  TrendingDown,
  ListOrdered,
  Sliders,
  Wallet,
  CheckCircle2,
  Play,
  Activity,
  ArrowRight
} from 'lucide-react';

interface CivicDecisionChainRibbonProps {
  currentStage?: number; // 1 to 10
  className?: string;
}

const CHAIN_STEPS = [
  { step: 1, id: '01 DETECT', label: 'Citizen Evidence', icon: Sparkles },
  { step: 2, id: '02 ASSESS', label: 'AI Vision Screening', icon: Cpu },
  { step: 3, id: '03 EXPLAIN', label: '6-Factor Risk', icon: ShieldCheck },
  { step: 4, id: '04 PREDICT', label: 'Decay Forecast', icon: TrendingDown },
  { step: 5, id: '05 PRIORITIZE', label: 'MCDA Queue', icon: ListOrdered },
  { step: 6, id: '06 SIMULATE', label: 'Digital Twin', icon: Sliders },
  { step: 7, id: '07 OPTIMIZE', label: 'Budget Knapsack', icon: Wallet },
  { step: 8, id: '08 RECOMMEND', label: 'Decision Engine', icon: CheckCircle2 },
  { step: 9, id: '09 ACT', label: 'Action Center', icon: Play },
  { step: 10, id: '10 MONITOR', label: 'Lifecycle Telemetry', icon: Activity }
];

export const CivicDecisionChainRibbon: React.FC<CivicDecisionChainRibbonProps> = ({
  currentStage = 8,
  className = ''
}) => {
  return (
    <div className={`p-4 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-3 font-mono text-xs shadow-subtle ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
          <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
            CIVICX 10-STEP MUNICIPAL DECISION CHAIN
          </span>
        </div>
        <span className="text-[9px] text-zinc-400">
          Continuous Decision Intelligence Pipeline
        </span>
      </div>

      {/* 10 Step Stepper Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-1.5 pt-1">
        {CHAIN_STEPS.map((s) => {
          const isDone = s.step < currentStage;
          const isCurrent = s.step === currentStage;
          const Icon = s.icon;

          return (
            <div
              key={s.step}
              className={`p-2 rounded-xl border text-center transition-all ${
                isCurrent
                  ? 'bg-lime text-civic-dark border-lime font-black shadow-lime-glow scale-[1.03]'
                  : isDone
                  ? 'bg-white/10 border-white/20 text-zinc-200'
                  : 'bg-white/5 border-white/10 text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[9px]">
                <Icon className="w-3 h-3" />
                <span>{s.id.split(' ')[0]}</span>
              </div>
              <span className={`text-[8px] font-bold block truncate mt-0.5 ${
                isCurrent ? 'text-civic-dark' : 'text-zinc-400'
              }`}>
                {s.id.split(' ')[1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
