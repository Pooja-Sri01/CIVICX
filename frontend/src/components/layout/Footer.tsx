import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Cpu, Zap, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 transition-all duration-300 no-print text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="font-display font-black text-base tracking-tight text-slate-900">
                CIVIC<span className="text-blue-600">X</span>
              </span>
              <span className="text-xs font-mono text-slate-500">/ Decision Intelligence 2.0</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md text-center md:text-left">
              “Predict the Risk. Prioritize the Fix. Simulate the Future.” Autonomous municipal infrastructure decision engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono font-semibold text-slate-600">
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Command Center</Link>
            <Link to="/map" className="hover:text-blue-600 transition-colors">Risk Map</Link>
            <Link to="/priorities" className="hover:text-blue-600 transition-colors">Priority Queue</Link>
            <Link to="/budget" className="hover:text-blue-600 transition-colors">Budget Optimizer</Link>
            <Link to="/simulation" className="hover:text-blue-600 transition-colors">City Time Machine</Link>
            <Link to="/reports" className="hover:text-blue-600 transition-colors">Decision Reports</Link>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Coimbatore Municipal Corp</span>
          </div>
        </div>

        {/* Technical Architecture & Stack Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FastAPI Backend 127.0.0.1:8000</span>
            </span>
            <span>•</span>
            <span className="text-slate-500">78 Assets Connected</span>
          </div>
          <div>
            <span>© 2026 CIVICX • Open Decision Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

