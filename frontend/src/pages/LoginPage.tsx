import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  Building2,
  CheckCircle2,
  Zap,
  KeyRound,
  FileCheck,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth, DEFAULT_GOV_OFFICER } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState('authority@coimbatore.gov.in');
  const [password, setPassword] = useState('civicx2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your municipal email and access key.');
      return;
    }

    if (password.length < 6) {
      setError('Access key must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate(redirectUrl);
    } else {
      setError('Invalid government credentials. Please use the official municipal ID or click Quick Access below.');
    }
  };

  const handleInstantOfficialAccess = () => {
    loginAsDemo();
    navigate(redirectUrl);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-white border border-zinc-200 shadow-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Official Government Infrastructure Identity */}
        <div className="lg:col-span-5 bg-zinc-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-civic-dark border border-white/20 flex items-center justify-center shadow-subtle">
                <Zap className="w-5 h-5 text-lime" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xl tracking-tight text-white block leading-none">
                    CIVIC<span className="text-lime">X</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    GOVT PORTAL
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono">
                  Coimbatore City Corporation
                </span>
              </div>
            </Link>

            <div className="space-y-3 pt-6 border-t border-white/10">
              <h2 className="font-display font-extrabold text-2xl text-white tracking-tight leading-snug">
                Municipal Authority <br />
                <span className="text-lime">Decision Intelligence Portal</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Authorized government access to Coimbatore’s predictive infrastructure twins, knapsack capital optimization, and official decision briefs.
              </p>
            </div>
          </div>

          {/* Official Verification Highlights */}
          <div className="space-y-3 pt-8 border-t border-white/10 relative z-10 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>78 Monitored City Infrastructure Corridors</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>Multi-Criteria Risk Assessment (MCDA)</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>₹1.50 Crore Capital Optimization Engine</span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[10px] text-zinc-500 font-mono">
            Security Clearance: Department of Municipal Administration & Water Supply
          </div>
        </div>

        {/* Right Column: Government Authentication Workspace */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  OFFICIAL MUNICIPAL ACCESS
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AUTHENTICATED ACCESS
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-civic-dark tracking-tight mt-1">
                OFFICER SIGN IN
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Enter your designated government credentials to access the infrastructure workspace.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Official Credentials Box for Instant Reference */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Default Municipal Credentials:</span>
                <span className="text-[10px] font-mono font-bold text-civic-dark bg-zinc-200 px-1.5 py-0.5 rounded">Verified Officer</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-zinc-400 block text-[9px]">OFFICIAL ID:</span>
                  <span className="font-bold text-civic-dark select-all">authority@coimbatore.gov.in</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px]">ACCESS KEY:</span>
                  <span className="font-bold text-civic-dark select-all">civicx2026</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 font-mono">
                  MUNICIPAL EMAIL / OFFICER ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="authority@coimbatore.gov.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 font-mono">
                    ACCESS KEY / PASSWORD
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-medium text-zinc-500 hover:text-civic-dark transition-colors"
                  >
                    Reset key?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-civic-dark text-white text-xs font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50 font-mono"
              >
                <span>{loading ? 'AUTHENTICATING…' : 'SIGN IN WITH CREDENTIALS →'}</span>
              </button>
            </form>

            {/* Instant 1-Click Official Municipal Officer SSO */}
            <div className="pt-4 border-t border-zinc-100 space-y-2">
              <button
                onClick={handleInstantOfficialAccess}
                className="w-full py-3 px-4 rounded-xl bg-lime text-civic-dark text-xs font-bold hover:bg-lime-hover transition-all flex items-center justify-center gap-2 shadow-sm font-mono"
              >
                <ShieldCheck className="w-4 h-4 text-civic-dark" />
                <span>OFFICIAL ONE-CLICK ACCESS (CHIEF ENGINEER) →</span>
              </button>
              <p className="text-[10px] text-zinc-400 text-center font-mono">
                Direct authorized session as Chief Municipal Engineer ({DEFAULT_GOV_OFFICER.name})
              </p>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-zinc-500 font-medium">
            Register new government officer profile?{' '}
            <Link to="/register" className="font-bold text-civic-dark hover:underline font-mono">
              OFFICIAL REGISTRATION →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
