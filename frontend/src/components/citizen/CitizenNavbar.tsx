import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Zap,
  PlusCircle,
  ListTodo,
  Coins,
  Trophy,
  Activity,
  Map as MapIcon,
  Home,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const CitizenNavbar: React.FC = () => {
  const citizenNav = [
    { label: 'Home', path: '/citizen', icon: Home },
    { label: 'Report Issue', path: '/citizen/report', icon: PlusCircle },
    { label: 'My Reports', path: '/citizen/reports', icon: ListTodo },
    { label: 'Civic Map', path: '/map', icon: MapIcon },
    { label: 'Rewards', path: '/citizen/rewards', icon: Coins },
    { label: 'Leaderboard', path: '/citizen/leaderboard', icon: Trophy },
    { label: 'Impact', path: '/citizen/impact', icon: Activity },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-1.5 shrink-0">
            {citizenNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/citizen'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-civic-dark text-lime shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-4 shrink-0 border-l border-slate-200">
            <Link
              to="/dashboard"
              className="text-[11px] font-mono text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
            >
              <span>Officer Command Center</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
