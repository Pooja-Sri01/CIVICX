import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid municipal email address.');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md rounded-3xl bg-white border border-zinc-200 shadow-elevated p-8 sm:p-10 space-y-6">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 hover:text-civic-dark transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO LOGIN</span>
          </Link>

          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
            ACCOUNT RECOVERY
          </span>
          <h1 className="font-display font-black text-2xl text-civic-dark tracking-tight mt-1">
            RESET YOUR PASSWORD
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Enter your verified municipal email to receive security recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recovery Link Generated</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If an active municipal account exists for <span className="font-mono font-bold">{email}</span>, password reset credentials have been routed through your civic IT dispatch.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 hover:underline font-mono"
              >
                <span>Return to Sign In →</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

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

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-civic-dark text-white text-xs font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-subtle font-mono"
              >
                <span>SEND RESET LINK</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
