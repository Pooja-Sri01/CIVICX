import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  Building,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

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

    if (!email || !password) {
      setError('Please provide both municipal email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate(redirectUrl);
    } else {
      setError('Invalid credentials. Please verify your municipal email and password.');
    }
  };

  const handleDemoAccess = () => {
    loginAsDemo();
    navigate(redirectUrl);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-white border border-zinc-200 shadow-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: CivicX Infrastructure Brand Visual */}
        <div className="lg:col-span-5 bg-zinc-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-subtle">
                <div className="w-3 h-3 rounded-full bg-lime-dark" />
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-tight text-white block leading-none">
                  CIVIC<span className="text-zinc-400 font-light">X</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono">
                  Infrastructure Intelligence
                </span>
              </div>
            </Link>

            <div className="space-y-3 pt-6 border-t border-white/10">
              <h2 className="font-display font-extrabold text-2xl text-white tracking-tight leading-snug">
                Predict the Risk. <br />
                Prioritize the Fix. <br />
                <span className="text-lime">Simulate the Future.</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Connecting city engineers and municipal decision-makers to deterministic risk modeling and knapsack capital optimization.
              </p>
            </div>
          </div>

          {/* Infrastructure Feature Badges */}
          <div className="space-y-2.5 pt-8 border-t border-white/10 relative z-10 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>Coimbatore City Pilot Dataset (78 Assets)</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>6-Factor Multi-Criteria Decision Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>City Time Machine 12-Month Decay Simulation</span>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  SECURE ACCESS
                </span>
                <span className="bg-zinc-100 text-zinc-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  DEMO AVAILABLE
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-civic-dark tracking-tight mt-1">
                WELCOME BACK
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Access your municipal infrastructure intelligence workspace.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 font-mono">
                  MUNICIPAL EMAIL
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@coimbatore.gov.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 font-mono">
                    PASSWORD
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-medium text-zinc-500 hover:text-civic-dark transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-civic-dark text-white text-xs font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50 font-mono"
              >
                <span>{loading ? 'AUTHENTICATING…' : 'SIGN IN →'}</span>
              </button>
            </form>

            {/* Instant Hackathon Demo Access */}
            <div className="pt-4 border-t border-zinc-100">
              <button
                onClick={handleDemoAccess}
                className="w-full py-3 px-4 rounded-xl bg-lime text-civic-dark text-xs font-bold hover:bg-lime-hover transition-all flex items-center justify-center gap-2 shadow-sm font-mono"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>CONTINUE AS DEMO →</span>
              </button>
              <p className="text-[10px] text-zinc-400 text-center mt-2 font-mono">
                Instant judge access as Coimbatore Municipal Officer • No signup required
              </p>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-zinc-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-civic-dark hover:underline font-mono">
              CREATE ACCOUNT →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
