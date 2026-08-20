import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-civic-border bg-white/70 py-10 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-100">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-civic-dark flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-lime" />
              </div>
              <span className="font-display font-bold text-sm text-civic-dark tracking-tight">CIVICX</span>
              <span className="text-xs text-zinc-400">Decision Intelligence Platform</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-md text-center md:text-left">
              “Predict the Risk. Prioritize the Fix. Simulate the Future.” Built for municipal infrastructure authorities.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
            <Link to="/dashboard" className="hover:text-civic-dark transition-colors">Command Center</Link>
            <Link to="/map" className="hover:text-civic-dark transition-colors">Risk Map</Link>
            <Link to="/priorities" className="hover:text-civic-dark transition-colors">Priority Queue</Link>
            <Link to="/budget" className="hover:text-civic-dark transition-colors">Budget Optimizer</Link>
            <Link to="/simulation" className="hover:text-civic-dark transition-colors">City Time Machine</Link>
            <Link to="/reports" className="hover:text-civic-dark transition-colors">Decision Reports</Link>
          </div>

          <div className="text-xs text-zinc-400 text-center md:text-right font-mono">
            Demo City: Coimbatore, TN | Synthetic Data
          </div>
        </div>

        {/* Technology Stack & AI Architecture attribution */}
        <div className="text-center space-y-2 text-[11px] text-zinc-500">
          <p className="font-mono text-zinc-600">
            React + TypeScript • Vite • Tailwind CSS • FastAPI • Python • PostgreSQL • SQLAlchemy • Scikit-learn • Pandas • NumPy • Leaflet • OpenStreetMap • Recharts • Axios • GitHub
          </p>
          <p className="font-mono text-zinc-400 text-[10px]">
            AI/Decision Intelligence: Risk Engine • Priority Engine • Budget Optimization • Future Scenario Simulation • Computer Vision Integration
          </p>
        </div>
      </div>
    </footer>
  );
};
