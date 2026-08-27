import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const DemoBanner: React.FC = () => {
  const { isCitizen, user } = useAuth();

  return (
    <div className="bg-zinc-950 text-zinc-300 text-xs py-1.5 border-b border-zinc-800 no-print font-mono w-full">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between w-full">
        {/* Left Side: System Status & Ward */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="bg-lime text-civic-dark text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0">
            {isCitizen ? "CITIZEN CIVIC PORTAL" : "SMART CITY DIGITAL TWIN"}
          </span>
          <span className="text-zinc-300 text-xs hidden sm:inline font-medium truncate">
            {isCitizen
              ? `Coimbatore Municipal Corporation • ${user?.ward || 'Ward 24 (Gandhipuram)'}`
              : "Coimbatore Municipal Corporation • 78 Infrastructure Corridors Monitored"}
          </span>
          <span className="text-zinc-300 text-xs sm:hidden truncate">
            Coimbatore Smart City
          </span>
        </div>

        {/* Right Side: Real-time Telemetry Status */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-zinc-400 flex-shrink-0 ml-3">
          <span className="flex items-center gap-1.5 text-lime font-bold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse flex-shrink-0" />
            <span>GIS Live Spatial Feed</span>
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline text-zinc-300 font-bold whitespace-nowrap">
            RDD2022 AI Inspection Active
          </span>
        </div>
      </div>
    </div>
  );
};
