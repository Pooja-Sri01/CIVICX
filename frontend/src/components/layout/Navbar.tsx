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
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DecisionLine, DecisionStage } from '../common/DecisionLine';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isLanding = location.pathname === '/';

  const getActiveStage = (pathname: string): DecisionStage => {
    if (pathname === '/dashboard') return 'RISK';
    if (pathname === '/map') return 'DETECT';
    if (pathname === '/priorities') return 'PRIORITIZE';
    if (pathname.startsWith('/assets')) return 'DETECT';
    if (pathname === '/budget') return 'OPTIMIZE';
    if (pathname === '/simulation') return 'SIMULATE';
    if (pathname === '/reports') return 'ACTION';
    return 'DATA';
  };

  const activeStage = getActiveStage(location.pathname);

  const navItems = [
    { label: 'Command Center', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Risk Map', path: '/map', icon: Map },
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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Authority Label */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-civic-dark flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform">
              <div className="w-3 h-3 rounded-full bg-lime" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg tracking-tight text-civic-dark leading-none">
                  CIVIC<span className="text-zinc-500 font-light">X</span>
                </span>
                <span className="bg-zinc-100 text-zinc-600 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-zinc-200">
                  COIMBATORE
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono mt-0.5">
                Infrastructure Risk Intelligence
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
                          ? 'bg-civic-dark text-white shadow-subtle'
                          : 'text-zinc-600 hover:text-civic-dark hover:bg-zinc-100'
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
            <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-zinc-600 font-mono">
              <a href="#pipeline" className="hover:text-civic-dark transition-colors">Decision Pipeline</a>
              <a href="#platform" className="hover:text-civic-dark transition-colors">Architecture</a>
              <a href="#simulation" className="hover:text-civic-dark transition-colors">Time Machine</a>
            </nav>
          )}

          {/* Right Action Ribbon & User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {isLanding ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:text-civic-dark transition-colors font-mono"
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-subtle group"
                >
                  <span>Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5 text-lime group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                {/* User Info Badge */}
                <div className="px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-mono text-zinc-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="flex flex-col text-left leading-tight">
                    <span className="font-bold text-civic-dark truncate max-w-[130px]">{user.name}</span>
                    <span className="text-[9px] text-zinc-400 truncate max-w-[130px]">{user.organization}</span>
                  </div>
                </div>

                {/* Sign Out Trigger */}
                <button
                  onClick={handleSignOut}
                  title="Sign out of CivicX"
                  className="p-2 rounded-lg bg-zinc-100 hover:bg-red-50 hover:text-red-700 text-zinc-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 font-mono"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-600 hover:text-civic-dark hover:bg-zinc-100"
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
            className="lg:hidden border-b border-zinc-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-elevated"
          >
            {navItems.map((item) => {
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
            })}
            <div className="pt-3 border-t border-zinc-100 mt-2 space-y-2">
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
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-civic-dark text-white text-xs font-semibold"
                >
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 text-lime" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
