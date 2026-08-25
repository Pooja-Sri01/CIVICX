import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DemoBanner: React.FC = () => {
  const { isCitizen, user } = useAuth();

  return (
    <div className="bg-zinc-950 text-zinc-300 text-xs py-1.5 px-4 flex items-center justify-between border-b border-zinc-800 no-print font-mono">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2.5">
          <span className="bg-lime text-civic-dark text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
            {isCitizen ? "CITIZEN CIVIC PORTAL" : "SMART CITY DIGITAL TWIN"}
          </span>
          <span className="text-zinc-300 text-xs hidden sm:inline font-medium">
            {isCitizen
              ? `Coimbatore Corporation • ${user?.ward || 'Ward 24 (Gandhipuram)'} Active`
              : "Coimbatore Municipal Corporation • 78 Infrastructure Corridors Monitored"}
          </span>
          <span className="text-zinc-300 text-xs sm:hidden">
            Coimbatore Smart City
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5 text-lime font-bold">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse"></span>
            GIS Live Spatial Feed
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline text-zinc-300 font-bold">RDD2022 AI Inspection Active</span>
        </div>
      </div>
    </div>
  );
};
