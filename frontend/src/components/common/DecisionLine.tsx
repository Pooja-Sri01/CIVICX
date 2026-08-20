import React from 'react';
import { motion } from 'motion/react';

export type DecisionStage = 'DATA' | 'DETECT' | 'RISK' | 'PRIORITIZE' | 'OPTIMIZE' | 'SIMULATE' | 'ACTION';

interface DecisionLineProps {
  activeStage?: DecisionStage;
  className?: string;
}

const STAGES: { id: DecisionStage; label: string }[] = [
  { id: 'DATA', label: 'DATA' },
  { id: 'DETECT', label: 'DETECT' },
  { id: 'RISK', label: 'RISK' },
  { id: 'PRIORITIZE', label: 'PRIORITIZE' },
  { id: 'OPTIMIZE', label: 'OPTIMIZE' },
  { id: 'SIMULATE', label: 'SIMULATE' },
  { id: 'ACTION', label: 'ACTION' },
];

export const DecisionLine: React.FC<DecisionLineProps> = ({
  activeStage = 'DATA',
  className = '',
}) => {
  const activeIndex = STAGES.findIndex((s) => s.id === activeStage);

  return (
    <div className={`w-full py-2 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Continuous 1px Background Track */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-200 -translate-y-1/2 z-0" />

        {/* Highlighted Completed Track */}
        <motion.div
          initial={false}
          animate={{
            width: `${(Math.max(0, activeIndex) / (STAGES.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute top-1/2 left-0 h-px bg-civic-dark -translate-y-1/2 z-0"
        />

        {/* Stage Nodes */}
        {STAGES.map((stage, idx) => {
          const isActive = stage.id === activeStage;
          const isPassed = idx < activeIndex;

          return (
            <div
              key={stage.id}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? 'bg-civic-dark ring-4 ring-lime ring-offset-1 scale-125'
                    : isPassed
                    ? 'bg-civic-dark'
                    : 'bg-zinc-300 border border-white'
                }`}
              >
                {isActive && <div className="w-1 h-1 rounded-full bg-lime" />}
              </div>

              <span
                className={`text-[9px] font-mono tracking-widest uppercase mt-1.5 transition-colors ${
                  isActive
                    ? 'font-bold text-civic-dark'
                    : isPassed
                    ? 'font-medium text-zinc-600'
                    : 'text-zinc-400 font-normal'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
