import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-[#1A1A1A] text-white/90 text-xs py-1.5 px-4 flex items-center justify-between border-b border-white/10 no-print">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-lime text-civic-dark text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
            DEMO ENVIRONMENT
          </span>
          <span className="text-zinc-300 hidden sm:inline">
            Coimbatore Infrastructure Risk Intelligence Prototype — Synthetic municipal telemetry for evaluation.
          </span>
          <span className="text-zinc-300 sm:hidden">
            Coimbatore Demo Environment
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Simulation Engine Active
          </span>
          <span className="hidden md:inline text-zinc-500">|</span>
          <span className="hidden md:inline">RDD2022 CV Ready</span>
        </div>
      </div>
    </div>
  );
};
