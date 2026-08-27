import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  AlertCircle,
  CheckCircle2, 
  Zap, 
  BadgeCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('Coimbatore City Corporation');
  const [role, setRole] = useState('Assistant Executive Engineer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const handleAutoFill = () => {
    setName('Er. M. Senthil Nathan');
    setOrganization('Coimbatore City Corporation');
    setRole('Assistant Executive Engineer (Works)');
    setEmail('senthil.nathan@coimbatore.gov.in');
    setPassword('civicx2026');
    setConfirmPassword('civicx2026');
    setError(null);
    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid government email address.');
      return;
    }

    if (password.length < 6) {
      setError('Access key must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Access keys do not match.');
      return;
    }

    setLoading(true);
    const success = await register(name, organization, email, password, role);
    setLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Could not complete officer registration. Please verify your inputs.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 shadow-elevated p-8 sm:p-10 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                GOVERNMENT ONBOARDING
              </span>
              <span className="bg-lime text-civic-dark text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                OFFICIAL REGISTRATION
              </span>
            </div>
            <h1 className="font-display font-black text-2xl text-civic-dark tracking-tight">
              REGISTER MUNICIPAL OFFICER
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Provision authorized credentials to access Coimbatore’s infrastructure decision workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoFill}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 text-lime hover:bg-zinc-800 text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm flex-shrink-0"
            title="Auto-fill sample officer details for testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-lime" />
            <span>⚡ Demo Auto-Fill</span>
          </button>
        </div>

        {autoFilled && (
          <div className="py-2 px-3 rounded-xl bg-lime/15 border border-lime/40 text-civic-dark text-xs font-mono font-bold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-lime-dark" />
              <span>Demo Municipal Officer details populated!</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Ready to Submit</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 font-mono">
                OFFICER FULL NAME
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Er. K. Vignesh"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 font-mono">
                DESIGNATION / ROLE
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Assistant Executive Engineer"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 font-mono">
              DEPARTMENT / MUNICIPAL BODY
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Coimbatore City Corporation"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 font-mono">
              OFFICIAL GOVERNMENT EMAIL
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vignesh@coimbatore.gov.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 font-mono">
                ACCESS KEY
              </label>
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 font-mono">
                CONFIRM ACCESS KEY
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-civic-dark text-white text-xs font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50 font-mono mt-4"
          >
            <span>{loading ? 'AUTHORIZING OFFICER…' : 'COMPLETE REGISTRATION & ENTER COMMAND CENTER →'}</span>
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-zinc-500 font-medium">
          Already have official municipal credentials?{' '}
          <Link to="/login" className="font-bold text-civic-dark hover:underline font-mono">
            OFFICER SIGN IN →
          </Link>
        </div>
      </div>
    </div>
  );
};
