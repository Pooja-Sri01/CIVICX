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
  Zap,
  ListTodo,
  Camera,
  Trophy,
  Coins,
  Award,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenCopilot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCopilot }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCitizen, isMunicipal, logout } = useAuth();
  const isLanding = location.pathname === '/';

  // Municipal Navigation Links
  const municipalNavItems = [
    { label: 'Command Center', path: '/dashboard', icon: LayoutDashboard },
    { label: 'GIS Risk Map', path: '/map', icon: Map },
    { label: 'Asset Intelligence', path: '/assets', icon: Layers },
    { label: 'Priority Queue', path: '/priorities', icon: ListOrdered },
    { label: 'Time Machine', path: '/simulation', icon: Clock },
    { label: 'Budget Optimizer', path: '/budget', icon: Calculator },
    { label: 'Civic Intake', path: '/civic-reports', icon: ListTodo },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  // Citizen Navigation Links
  const citizenNavItems = [
    { label: 'Citizen Home', path: '/citizen/portal', icon: User },
    { label: 'Report Defect', path: '/citizen/report', icon: Camera },
    { label: 'My Complaints', path: '/citizen/my-reports', icon: FileText },
    { label: 'Rewards & Wallet', path: '/citizen/rewards', icon: Coins },
    { label: 'Leaderboard', path: '/citizen/leaderboard', icon: Trophy },
    { label: 'City Map', path: '/map', icon: Map },
  ];

  const activeNavItems = isCitizen ? citizenNavItems : municipalNavItems;

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full no-print bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-slate-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Authority Label */}
          <Link to={isCitizen ? "/citizen/portal" : (isAuthenticated && isMunicipal ? "/dashboard" : "/")} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-civic-dark flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <Zap className="w-4 h-4 text-lime" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg tracking-tight leading-none text-slate-900">
                  CIVIC<span className="text-lime-dark">X</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                  COIMBATORE
                </span>
                {isCitizen ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 hidden sm:inline-block">
                    CITIZEN PORTAL
                  </span>
                ) : isAuthenticated && isMunicipal ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
                    MUNICIPAL AUTHORITY
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 hidden sm:inline-block">
                    CIVIC DECISION TWIN
                  </span>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-widest font-mono mt-0.5 text-slate-500 font-semibold">
                {isCitizen ? "Citizen Civic Intelligence" : (isAuthenticated ? "Infrastructure Decision Twin" : "Smart City Infrastructure")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <nav className="hidden lg:flex items-center space-x-1">
              {activeNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
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
            <nav className="hidden md:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              <Link to="/map" className="hover:text-civic-dark transition-colors flex items-center gap-1.5">
                <Map className="w-3.5 h-3.5 text-emerald-600" />
                <span>GIS Map</span>
              </Link>
              <Link to="/citizen/report" className="hover:text-civic-dark transition-colors flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-purple-600" />
                <span>Report Defect</span>
              </Link>
              <Link to="/citizen" className="hover:text-civic-dark transition-colors flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Citizen Portal</span>
              </Link>
              <Link to="/citizen/rewards" className="hover:text-civic-dark transition-colors flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Rewards</span>
              </Link>
            </nav>
          )}

          {/* Right Action Ribbon & User Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                {/* AI Copilot Trigger for Municipal */}
                {isMunicipal && onOpenCopilot && (
                  <button
                    onClick={onOpenCopilot}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-bold font-mono transition-all flex items-center gap-1.5 border border-zinc-200"
                    title="Open CivicX AI Copilot"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-civic-dark" />
                    <span>AI Copilot</span>
                  </button>
                )}

                {/* User Profile Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {isCitizen ? (user.ward || 'Citizen') : (user.role || 'Municipal Engineer')}
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?mode=CITIZEN"
                  className="px-4 py-2 rounded-xl bg-civic-dark text-lime font-mono text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-slate-200 bg-white"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {activeNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-civic-dark text-lime font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {isAuthenticated && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{user?.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-mono font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
