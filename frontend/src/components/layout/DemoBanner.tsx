import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800 no-print">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2.5">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            SMART CITY DIGITAL TWIN
          </span>
          <span className="text-slate-300 font-mono text-xs hidden sm:inline">
            Coimbatore Municipal Corporation • 78 IoT Spatial Telemetry Nodes Active
          </span>
          <span className="text-slate-300 font-mono text-xs sm:hidden">
            Coimbatore Smart City
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GIS Live Feed
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-blue-300">RDD2022 AI Inference 96.4%</span>
        </div>
      </div>
    </div>
  );
};
