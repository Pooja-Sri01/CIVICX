import React, { useState, useEffect } from 'react';
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
  User,
  Phone,
  MapPin,
  Smartphone,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const modeParam = searchParams.get('mode')?.toUpperCase();
  const roleParam = searchParams.get('role')?.toUpperCase();
  const initialMode: 'CITIZEN' | 'MUNICIPAL' = (modeParam === 'MUNICIPAL' || roleParam === 'MUNICIPAL' || roleParam === 'ADMIN') ? 'MUNICIPAL' : 'CITIZEN';
  const initialStep = searchParams.get('step') === 'register' ? 'REGISTER_STEP_1' : 'SIGN_IN';

  const { 
    municipalLogin, 
    citizenLogin, 
    citizenSendOtp, 
    citizenVerifyOtp, 
    citizenCompleteRegistration 
  } = useAuth();

  // Mode: 'CITIZEN' | 'MUNICIPAL'
  const [authMode, setAuthMode] = useState<'CITIZEN' | 'MUNICIPAL'>(initialMode);
  
  // Citizen view: 'SIGN_IN' | 'REGISTER_STEP_1' | 'REGISTER_STEP_2_OTP' | 'REGISTER_STEP_3_PASS' | 'REGISTER_STEP_4_SUCCESS'
  const [citizenStep, setCitizenStep] = useState<'SIGN_IN' | 'REGISTER_STEP_1' | 'REGISTER_STEP_2_OTP' | 'REGISTER_STEP_3_PASS' | 'REGISTER_STEP_4_SUCCESS'>(initialStep);

  // Municipal form state (Pre-filled for authorized evaluation access)
  const [muniEmail, setMuniEmail] = useState('authority@coimbatore.gov.in');
  const [muniPassword, setMuniPassword] = useState('civicx2026');
  const [muniRole, setMuniRole] = useState('CHIEF_ENGINEER');

  // Citizen form state
  const [citEmail, setCitEmail] = useState('');
  const [citPassword, setCitPassword] = useState('');
  const [citName, setCitName] = useState('');
  const [citPhone, setCitPhone] = useState('');
  const [citWard, setCitWard] = useState('Ward 24 (Gandhipuram)');
  const [citConfirmPass, setCitConfirmPass] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  
  // Password visibility
  const [showPass, setShowPass] = useState(false);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  // Status & Error states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Clear messages when switching tabs
  const handleSwitchMode = (mode: 'CITIZEN' | 'MUNICIPAL') => {
    setAuthMode(mode);
    setError(null);
    setSuccessMsg(null);
  };

  // ============================================================
  // 1. MUNICIPAL SIGN IN HANDLER
  // ============================================================
  const handleMunicipalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!muniEmail.trim() || !muniPassword) {
      setError('Please provide your official municipal email and access key.');
      return;
    }

    setLoading(true);
    const res = await municipalLogin(muniEmail, muniPassword, muniRole);
    setLoading(false);

    if (res.success) {
      navigate(redirectUrl || '/');
    } else {
      setError(res.message);
    }
  };

  // ============================================================
  // 2. CITIZEN SIGN IN HANDLER
  // ============================================================
  const handleCitizenSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!citEmail.trim() || !citPassword) {
      setError('Please enter both your registered email and password.');
      return;
    }

    setLoading(true);
    const res = await citizenLogin(citEmail, citPassword);
    setLoading(false);

    if (res.success) {
      navigate(redirectUrl || '/citizen/portal');
    } else {
      setError(res.message);
    }
  };

  // ============================================================
  // 3. CITIZEN SIGN UP — STEP 1: SEND REAL EMAIL OTP
  // ============================================================
  const handleSendOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!citEmail.trim() || !citEmail.includes('@')) {
      setError('Please provide a valid email address to receive your verification code.');
      return;
    }

    setLoading(true);
    const res = await citizenSendOtp(citEmail);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`A verification code has been sent to ${citEmail.trim().toLowerCase()}.`);
      if (res.dev_code) {
        setDevOtpHint(res.dev_code);
      }
      setCooldown(60);
      setCitizenStep('REGISTER_STEP_2_OTP');
    } else {
      setError(res.message);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError(null);
    setLoading(true);
    const res = await citizenSendOtp(citEmail);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`A new verification code has been sent to ${citEmail.trim().toLowerCase()}.`);
      if (res.dev_code) {
        setDevOtpHint(res.dev_code);
      }
      setCooldown(60);
    } else {
      setError(res.message);
    }
  };

  // ============================================================
  // 4. CITIZEN SIGN UP — STEP 2: VERIFY OTP
  // ============================================================
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    const res = await citizenVerifyOtp(citEmail, otpCode);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Email verified successfully! Complete your account details below.');
      setCitizenStep('REGISTER_STEP_3_PASS');
    } else {
      setError(res.message);
    }
  };

  // ============================================================
  // 5. CITIZEN SIGN UP — STEP 3: CREATE PASSWORD & DETAILS
  // ============================================================
  const handleCompleteRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!citName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (citPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (citPassword !== citConfirmPass) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const res = await citizenCompleteRegistration(citEmail, citName, citPhone, citWard, citPassword);
    setLoading(false);

    if (res.success) {
      setCitizenStep('REGISTER_STEP_4_SUCCESS');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl rounded-3xl bg-white border border-zinc-200 shadow-elevated overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Coimbatore Smart Infrastructure Authority */}
        <div className="lg:col-span-5 bg-zinc-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
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
                    PORTAL
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono">
                  Coimbatore Municipal Corporation
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
                Connecting Coimbatore citizens and municipal engineers through AI computer vision, explainable risk models, and predictive lifecycle intelligence.
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-3 pt-8 border-t border-white/10 relative z-10 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>Citizen Civic Rewards & Complaint Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>78 Monitored City Infrastructure Assets</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
              <span>10-Step Municipal Decision Intelligence Chain</span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[10px] text-zinc-500 font-mono">
            Official System: Coimbatore City Municipal Corporation
          </div>
        </div>

        {/* Right Column: Authentication Workspace */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* 1. Main Role Segmented Controller */}
            <div className="flex rounded-2xl bg-zinc-100 p-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => handleSwitchMode('CITIZEN')}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  authMode === 'CITIZEN'
                    ? 'bg-civic-dark text-lime shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>CITIZEN PORTAL</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('MUNICIPAL')}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  authMode === 'MUNICIPAL'
                    ? 'bg-civic-dark text-lime shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>MUNICIPAL OFFICIAL</span>
              </button>
            </div>

            {/* Error / Success Notifications */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ============================================================ */}
            {/* A. CITIZEN PORTAL EXPERIENCE                                 */}
            {/* ============================================================ */}
            {authMode === 'CITIZEN' && (
              <div className="space-y-4">
                {/* Sub-tabs: Sign In vs Create Account */}
                {citizenStep !== 'REGISTER_STEP_4_SUCCESS' && (
                  <div className="flex border-b border-zinc-200 pb-2 gap-4 text-xs font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => { setCitizenStep('SIGN_IN'); setError(null); setSuccessMsg(null); }}
                      className={`pb-1.5 transition-colors border-b-2 ${
                        citizenStep === 'SIGN_IN'
                          ? 'border-civic-dark text-civic-dark font-black'
                          : 'border-transparent text-zinc-400 hover:text-zinc-700'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCitizenStep('REGISTER_STEP_1'); setError(null); setSuccessMsg(null); }}
                      className={`pb-1.5 transition-colors border-b-2 ${
                        citizenStep !== 'SIGN_IN'
                          ? 'border-civic-dark text-civic-dark font-black'
                          : 'border-transparent text-zinc-400 hover:text-zinc-700'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* SUB-VIEW 1: CITIZEN SIGN IN                              */}
                {/* -------------------------------------------------------- */}
                {citizenStep === 'SIGN_IN' && (
                  <form onSubmit={handleCitizenSignInSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 font-mono">
                        REGISTERED EMAIL
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="email"
                          value={citEmail}
                          onChange={(e) => setCitEmail(e.target.value)}
                          placeholder="e.g. resident@example.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 font-mono">
                        PASSWORD
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={citPassword}
                          onChange={(e) => setCitPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-civic-dark text-lime font-display font-black text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50"
                    >
                      {loading ? 'Authenticating...' : 'Sign In to Citizen Portal'}
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => { setCitizenStep('REGISTER_STEP_1'); setError(null); }}
                        className="text-xs text-zinc-500 hover:text-civic-dark font-medium"
                      >
                        Don't have an account? <span className="font-bold text-lime-dark hover:underline">Create Citizen Account</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* -------------------------------------------------------- */}
                {/* SUB-VIEW 2: CITIZEN REGISTRATION — STEP 1 (EMAIL INTAKE) */}
                {/* -------------------------------------------------------- */}
                {citizenStep === 'REGISTER_STEP_1' && (
                  <form onSubmit={handleSendOtpSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">STEP 1 OF 3</span>
                        <span className="text-[10px] font-mono text-zinc-400">Email Verification</span>
                      </div>
                      <h3 className="font-display font-black text-base text-civic-dark">
                        Create Your Citizen Account
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        Enter your email address. We will send a secure single-use verification code to your inbox.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 font-mono">
                        EMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="email"
                          value={citEmail}
                          onChange={(e) => setCitEmail(e.target.value)}
                          placeholder="e.g. resident@example.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-lime text-civic-dark font-display font-black text-sm hover:bg-lime-light transition-all flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50"
                    >
                      {loading ? 'Sending code...' : 'Send Verification Code'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* -------------------------------------------------------- */}
                {/* SUB-VIEW 3: CITIZEN REGISTRATION — STEP 2 (ENTER OTP)    */}
                {/* -------------------------------------------------------- */}
                {citizenStep === 'REGISTER_STEP_2_OTP' && (
                  <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">STEP 2 OF 3</span>
                        <span className="text-[10px] font-mono text-zinc-400">Enter Verification Code</span>
                      </div>
                      <h3 className="font-display font-black text-base text-civic-dark">
                        Check Your Email Inbox
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        A verification code has been sent to <strong className="text-civic-dark">{citEmail}</strong>. Please enter the 6-digit code below.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 font-mono">
                        6-DIGIT VERIFICATION CODE
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center font-mono font-black text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-lime"
                        required
                        autoFocus
                      />
                      <span className="text-[10px] text-zinc-400 block font-mono text-center mt-1">
                        Code expires in 5 minutes
                      </span>
                    </div>

                    {/* DEV / DEMO ENVIRONMENT OTP HELPER */}
                    {devOtpHint && (
                      <div className="p-3.5 rounded-2xl bg-zinc-900 border border-lime/30 text-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-lime flex items-center gap-1.5 uppercase">
                            <Zap className="w-3.5 h-3.5" />
                            <span>DEV / DEMO VERIFICATION HELPER</span>
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400">Local Environment</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="font-mono text-base font-black tracking-widest text-lime bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-700">
                            {devOtpHint}
                          </div>
                          <button
                            type="button"
                            onClick={() => setOtpCode(devOtpHint)}
                            className="px-3 py-1.5 rounded-xl bg-lime text-civic-dark text-xs font-mono font-bold hover:bg-lime-light transition-all flex items-center gap-1 shadow-sm"
                          >
                            <span>1-Click Auto-Fill</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || otpCode.length !== 6}
                      className="w-full py-3 rounded-xl bg-lime text-civic-dark font-display font-black text-sm hover:bg-lime-light transition-all flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setCitizenStep('REGISTER_STEP_1')}
                        className="text-zinc-500 hover:text-zinc-800 underline"
                      >
                        Change Email
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={cooldown > 0 || loading}
                        className={`font-bold flex items-center gap-1 ${
                          cooldown > 0 ? 'text-zinc-400 cursor-not-allowed' : 'text-lime-dark hover:underline'
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* -------------------------------------------------------- */}
                {/* SUB-VIEW 4: CITIZEN REGISTRATION — STEP 3 (PASSWORD & INFO) */}
                {/* -------------------------------------------------------- */}
                {citizenStep === 'REGISTER_STEP_3_PASS' && (
                  <form onSubmit={handleCompleteRegistrationSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">STEP 3 OF 3</span>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">Email Verified ✓</span>
                      </div>
                      <h3 className="font-display font-black text-base text-civic-dark">
                        Create Your Password & Profile
                      </h3>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 font-mono">FULL NAME</label>
                      <input
                        type="text"
                        value={citName}
                        onChange={(e) => setCitName(e.target.value)}
                        placeholder="e.g. Priya Sundaram"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 font-mono">MOBILE NUMBER (OPTIONAL)</label>
                        <input
                          type="tel"
                          value={citPhone}
                          onChange={(e) => setCitPhone(e.target.value)}
                          placeholder="+91 98421 88402"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 font-mono">RESIDENTIAL WARD</label>
                        <select
                          value={citWard}
                          onChange={(e) => setCitWard(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                        >
                          <option value="Ward 24 (Gandhipuram)">Ward 24 (Gandhipuram)</option>
                          <option value="Ward 12 (RS Puram)">Ward 12 (RS Puram)</option>
                          <option value="Ward 45 (Peelamedu)">Ward 45 (Peelamedu)</option>
                          <option value="Ward 67 (Singanallur)">Ward 67 (Singanallur)</option>
                          <option value="Ward 89 (Ukkadam)">Ward 89 (Ukkadam)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 font-mono">PASSWORD</label>
                        <input
                          type="password"
                          value={citPassword}
                          onChange={(e) => setCitPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-700 font-mono">CONFIRM PASSWORD</label>
                        <input
                          type="password"
                          value={citConfirmPass}
                          onChange={(e) => setCitConfirmPass(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-civic-dark text-lime font-display font-black text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50 mt-2"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* -------------------------------------------------------- */}
                {/* SUB-VIEW 5: CITIZEN REGISTRATION — STEP 4 (SUCCESS)      */}
                {/* -------------------------------------------------------- */}
                {citizenStep === 'REGISTER_STEP_4_SUCCESS' && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display font-black text-xl text-civic-dark">
                        Account Created Successfully!
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        Your CIVICX Citizen account is active with 100 Welcome Points. You can now submit observations and track neighborhood infrastructure.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(redirectUrl || '/citizen/portal')}
                      className="w-full py-3 rounded-xl bg-lime text-civic-dark font-display font-black text-sm hover:bg-lime-light transition-all flex items-center justify-center gap-2 shadow-subtle"
                    >
                      <span>Go to Citizen Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* B. MUNICIPAL OFFICIAL EXPERIENCE                             */}
            {/* ============================================================ */}
            {authMode === 'MUNICIPAL' && (
              <form onSubmit={handleMunicipalSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 font-mono">
                    GOVERNMENT ROLE & CLEARANCE
                  </label>
                  <select
                    value={muniRole}
                    onChange={(e) => setMuniRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                  >
                    <option value="CHIEF_ENGINEER">Chief Municipal Engineer (Directorate of Works)</option>
                    <option value="COMMISSIONER">Municipal Commissioner (Executive Authority)</option>
                    <option value="URBAN_PLANNER">Chief Urban Planner (City Planning & GIS)</option>
                    <option value="INSPECTOR">Senior Infrastructure Inspector</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 font-mono">
                    OFFICIAL MUNICIPAL EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      value={muniEmail}
                      onChange={(e) => setMuniEmail(e.target.value)}
                      placeholder="authority@coimbatore.gov.in"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 font-mono">
                    OFFICIAL ACCESS KEY
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={muniPassword}
                      onChange={(e) => setMuniPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-civic-dark text-lime font-display font-black text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Command Center'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
