import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Layers, 
  ListOrdered, 
  Calculator, 
  Clock, 
  FileText, 
  Menu, 
  X,
  ArrowRight,
  ShieldCheck,
  LogOut,
  User,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DecisionLine, DecisionStage } from '../common/DecisionLine';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenCopilot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCopilot }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isLanding = location.pathname === '/';

  const getActiveStage = (pathname: string): DecisionStage => {
    if (pathname === '/dashboard') return 'DATA';
    if (pathname === '/map') return 'DETECT';
    if (pathname.startsWith('/assets')) return 'RISK';
    if (pathname === '/priorities') return 'PRIORITIZE';
    if (pathname === '/budget') return 'OPTIMIZE';
    if (pathname === '/simulation') return 'SIMULATE';
    if (pathname === '/reports') return 'ACTION';
    return 'DATA';
  };


  const activeStage = getActiveStage(location.pathname);

  const navItems = [
    { label: 'Command Center', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Risk Map', path: '/map', icon: Map },
    { label: 'Asset Intelligence', path: '/assets', icon: Layers },
    { label: 'Priority Queue', path: '/priorities', icon: ListOrdered },
    { label: 'Budget Optimizer', path: '/budget', icon: Calculator },
    { label: 'City Time Machine', path: '/simulation', icon: Clock },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];


  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full no-print bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-slate-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Authority Label */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-civic-dark flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <Zap className="w-4 h-4 text-lime" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg tracking-tight leading-none text-slate-900">
                  CIVIC<span className="text-civic-dark">X</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                  COIMBATORE
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-mono mt-0.5 text-slate-500 font-semibold">
                Infrastructure Decision Twin
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isLanding ? (
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
            </nav>
          ) : (
            <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              <a href="#corridor-inspector" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Corridor Inspector</span>
              </a>
              <a href="#pipeline" className="hover:text-blue-600 transition-colors">
                8-Step Pipeline
              </a>
              <Link to="/map" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <Map className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Map</span>
              </Link>
            </nav>
          )}

          {/* Right Action Ribbon & User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {isLanding ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors font-mono"
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-civic-dark text-white text-xs font-display font-bold hover:bg-zinc-800 transition-all shadow-md group"
                >
                  <span>Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-lime" />
                </Link>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                {/* AI Copilot Trigger */}
                {onOpenCopilot && (
                  <button
                    onClick={onOpenCopilot}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-bold font-mono transition-all flex items-center gap-1.5 border border-zinc-200"
                    title="Open CivicX AI Copilot"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-civic-dark" />
                    <span>AI Copilot</span>
                  </button>
                )}

                {/* User Info Badge */}
                <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="flex flex-col text-left leading-tight">
                    <span className="font-bold text-slate-900 truncate max-w-[130px]">{user.name}</span>
                    <span className="text-[9px] text-slate-500 truncate max-w-[130px]">{user.organization}</span>
                  </div>
                </div>

                {/* Sign Out Trigger */}
                <button
                  onClick={handleSignOut}
                  title="Sign out of CivicX"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 font-mono"
              >
                Sign In
              </Link>
            )}
          </div>


          {/* Mobile menu trigger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Global Signature Decision Line Track */}
        {!isLanding && (
          <div className="hidden md:block py-1 border-t border-zinc-100">
            <DecisionLine activeStage={activeStage} />
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden border-b px-4 pt-2 pb-4 space-y-1 shadow-elevated ${
              isLanding 
                ? 'bg-surface-dark border-white/10 text-white' 
                : 'bg-white border-zinc-200 text-civic-dark'
            }`}
          >
            {!isLanding ? (
              navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive ? 'bg-civic-dark text-white' : 'text-zinc-700 hover:bg-zinc-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })
            ) : (
              <div className="space-y-2 py-2">
                <a
                  href="#interactive-suite"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-mono font-bold text-lime"
                >
                  Interactive Suite
                </a>
                <a
                  href="#pipeline"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-mono text-zinc-300"
                >
                  8-Step Pipeline
                </a>
                <a
                  href="#platform"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-mono text-zinc-300"
                >
                  Architecture
                </a>
              </div>
            )}
            
            <div className={`pt-3 border-t mt-2 space-y-2 ${isLanding ? 'border-white/10' : 'border-zinc-100'}`}>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-100 text-red-600 text-xs font-bold font-mono"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out ({user?.name})</span>
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-lime text-civic-dark text-xs font-bold font-display shadow-lime-glow"
                >
                  <span>Launch Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

