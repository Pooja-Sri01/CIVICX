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
  LogOut,
  User,
  Sparkles,
  Zap,
  ListTodo,
  Camera,
  Trophy,
  Coins,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenCopilot?: () => void;
}

interface NavItem {
  label: string;
  shortLabel: string;
  path: string;
  icon: any;
  aliases?: string[];
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCopilot }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCitizen, isMunicipal, logout } = useAuth();

  // Municipal Navigation Links with responsive short/full labels
  const municipalNavItems: NavItem[] = [
    { label: 'Command Center', shortLabel: 'Command', path: '/dashboard', icon: LayoutDashboard },
    { label: 'GIS Risk Map', shortLabel: 'GIS Map', path: '/map', icon: Map },
    { label: 'Asset Intelligence', shortLabel: 'Assets', path: '/assets', icon: Layers },
    { label: 'Priority Queue', shortLabel: 'Priorities', path: '/priorities', icon: ListOrdered },
    { label: 'Time Machine', shortLabel: 'Simulation', path: '/simulation', icon: Clock },
    { label: 'Budget Optimizer', shortLabel: 'Budget', path: '/budget', icon: Calculator },
    { label: 'Civic Intake', shortLabel: 'Civic Intake', path: '/civic-reports', icon: ListTodo },
    { label: 'Reports', shortLabel: 'Reports', path: '/reports', icon: FileText },
  ];

  // Citizen Navigation Links
  const citizenNavItems: NavItem[] = [
    { label: 'Citizen Home', shortLabel: 'Home', path: '/citizen/portal', aliases: ['/citizen', '/citizen/portal'], icon: User },
    { label: 'Report Defect', shortLabel: 'Report', path: '/citizen/report', aliases: ['/citizen/report'], icon: Camera },
    { label: 'My Complaints', shortLabel: 'Complaints', path: '/citizen/my-reports', aliases: ['/citizen/my-reports', '/citizen/reports'], icon: FileText },
    { label: 'Rewards & Wallet', shortLabel: 'Rewards', path: '/citizen/rewards', aliases: ['/citizen/rewards'], icon: Coins },
    { label: 'Leaderboard', shortLabel: 'Rankings', path: '/citizen/leaderboard', aliases: ['/citizen/leaderboard'], icon: Trophy },
    { label: 'Impact', shortLabel: 'Impact', path: '/citizen/impact', aliases: ['/citizen/impact'], icon: Activity },
    { label: 'City Map', shortLabel: 'Map', path: '/map', aliases: ['/map'], icon: Map },
  ];

  const activeNavItems = isCitizen ? citizenNavItems : municipalNavItems;

  const isItemActive = (item: NavItem, isRouterActive: boolean) => {
    if (isRouterActive) return true;
    if (item.aliases && item.aliases.some(a => location.pathname === a || location.pathname.startsWith(a + '/'))) {
      return true;
    }
    return false;
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full no-print bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 xl:gap-4">
          {/* Brand Logo */}
          <Link 
            to={isCitizen ? "/citizen/portal" : (isAuthenticated && isMunicipal ? "/dashboard" : "/")} 
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-civic-dark flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
              <Zap className="w-4 h-4 text-lime" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display font-black text-lg tracking-tight text-slate-900">
                  CIVIC<span className="text-lime-dark">X</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                  COIMBATORE
                </span>
                {isCitizen ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 hidden 2xl:inline-block">
                    CITIZEN
                  </span>
                ) : isAuthenticated && isMunicipal ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hidden 2xl:inline-block">
                    MUNICIPAL
                  </span>
                ) : null}
              </div>
              <span className="text-[8.5px] uppercase tracking-wider font-mono mt-1 text-slate-500 font-semibold leading-none hidden sm:block truncate max-w-[160px]">
                {isCitizen ? "Citizen Intelligence" : "Infrastructure Twin"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 flex-1 justify-center min-w-0 px-1">
              {activeNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => {
                      const active = isItemActive(item, isActive);
                      return `flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                        active
                          ? 'bg-civic-dark text-lime shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`;
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden xl:inline whitespace-nowrap">{item.label}</span>
                    <span className="xl:hidden whitespace-nowrap">{item.shortLabel}</span>
                  </NavLink>
                );
              })}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center space-x-5 lg:space-x-6 text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
              <Link to="/map" className="hover:text-civic-dark transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Map className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>GIS Map</span>
              </Link>
              <Link to="/citizen/report" className="hover:text-civic-dark transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Camera className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span>Report Defect</span>
              </Link>
              <Link to="/citizen" className="hover:text-civic-dark transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>Citizen Portal</span>
              </Link>
              <Link to="/citizen/rewards" className="hover:text-civic-dark transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Coins className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Rewards</span>
              </Link>
              <Link to="/citizen/impact" className="hover:text-civic-dark transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Activity className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Impact</span>
              </Link>
            </nav>
          )}

          {/* Right Action Ribbon & User Profile */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 flex-shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {/* AI Copilot Trigger for Municipal */}
                {isMunicipal && onOpenCopilot && (
                  <button
                    onClick={onOpenCopilot}
                    className="px-2.5 xl:px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-bold font-mono transition-all flex items-center gap-1.5 border border-zinc-200 whitespace-nowrap shadow-xs flex-shrink-0"
                    title="Open CivicX AI Copilot"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-civic-dark flex-shrink-0" />
                    <span>AI Copilot</span>
                  </button>
                )}

                {/* User Profile Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block leading-tight truncate max-w-[120px] xl:max-w-[150px]">
                      {user.name}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-mono block leading-tight truncate max-w-[120px] xl:max-w-[150px]">
                      {isCitizen ? (user.ward || 'Citizen') : (user.role || 'Municipal Engineer')}
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-600 transition-colors flex-shrink-0"
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
                  className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?mode=CITIZEN"
                  className="px-4 py-2 rounded-xl bg-civic-dark text-lime font-mono text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm whitespace-nowrap"
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
              aria-label="Toggle Navigation Menu"
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
                    className={({ isActive }) => {
                      const active = isItemActive(item, isActive);
                      return `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? 'bg-civic-dark text-lime font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`;
                    }}
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
                    <span className="text-[10px] text-slate-500 font-mono">
                      {isCitizen ? (user?.ward || 'Citizen') : (user?.role || 'Municipal Engineer')}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 text-xs text-rose-600 font-bold font-mono px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
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
