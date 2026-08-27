import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins,
  Sparkles,
  Gift,
  ArrowRight,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  HelpCircle,
  Zap,
  TrendingUp,
  ShieldCheck,
  X,
  Play,
  Layers,
  HeartHandshake,
  Users,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { CitizenReward, CitizenWallet, CivicRewardOption, CitizenImpact, CitizenLeaderboardItem } from '../../types';
import { ResolutionRewardModal } from '../../components/citizen/ResolutionRewardModal';

export const CitizenRewardsPage: React.FC = () => {
  const { user, isAuthenticated, isCitizen } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState<CitizenWallet>({
    currentBalance: user?.pointsBalance ?? 0,
    lifetimeEarned: user?.pointsBalance ?? 0,
    pending: 0,
    pendingBreakdown: {
      waitingForValidation: 0,
      waitingForMunicipalAction: 0,
      waitingForResolution: 0
    },
    redeemed: 0,
    rewards: []
  });

  const [rewardOptions, setRewardOptions] = useState<CivicRewardOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<CivicRewardOption | null>(null);
  const [impact, setImpact] = useState<CitizenImpact | null>(null);
  const [leaderboard, setLeaderboard] = useState<CitizenLeaderboardItem[]>([]);

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showAnimationModal, setShowAnimationModal] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      const [optionsData, impactData, leaderData] = await Promise.all([
        ApiService.getRewardOptions(),
        ApiService.getCitizenImpact(user?.id),
        ApiService.getCitizenLeaderboard()
      ]);
      setRewardOptions(optionsData);
      setImpact(impactData);
      setLeaderboard(leaderData);
      if (optionsData.length > 0 && !selectedOption) {
        setSelectedOption(optionsData[0]);
      }

      if (isAuthenticated && user?.id) {
        const walletData = await ApiService.getCitizenWallet(user.id);
        setWallet({
          ...walletData,
          currentBalance: user.pointsBalance ?? walletData.currentBalance
        });
      } else {
        setWallet({
          currentBalance: 0,
          lifetimeEarned: 0,
          pending: 0,
          pendingBreakdown: {
            waitingForValidation: 0,
            waitingForMunicipalAction: 0,
            waitingForResolution: 0
          },
          redeemed: 0,
          rewards: []
        });
      }
    } catch (err) {
      console.error('Failed to load rewards console', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user, isAuthenticated]);

  const handleOpenRedeem = (opt?: CivicRewardOption) => {
    if (!isAuthenticated) {
      navigate('/login?mode=CITIZEN&redirect=/citizen/rewards');
      return;
    }
    if (opt) setSelectedOption(opt);
    setShowRedeemModal(true);
    setRedeemSuccess(false);
    setRedeemError(null);
  };

  const handleConfirmRedeem = async () => {
    if (!isAuthenticated) {
      navigate('/login?mode=CITIZEN&redirect=/citizen/rewards');
      return;
    }
    if (!selectedOption) return;
    if (wallet.currentBalance < selectedOption.pointsCost) {
      setRedeemError(`Insufficient points. You need ${selectedOption.pointsCost.toLocaleString()} CIVICX Points.`);
      return;
    }

    setIsRedeeming(true);
    setRedeemError(null);
    try {
      const res = await ApiService.redeemRewardOption(selectedOption.rewardId);
      if (res.success) {
        setRedeemSuccess(true);
        await fetchAllData();
      }
    } catch (err: any) {
      setRedeemError(err?.message || 'Failed to process simulated redemption.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEEF5] text-slate-900 flex flex-col pb-16">
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-900 font-mono text-xs font-bold">
            <Coins className="w-3.5 h-3.5" />
            <span>CIVICX REWARD WALLET & INCENTIVES</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Citizen Recognition & Rewards
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            "Your Civic Contribution Makes an Impact." Transparent non-financial rewards for verifiable infrastructure reporting.
          </p>
        </div>

        {/* Big Main Balance Hero Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-civic-dark text-white border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow Pattern */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-lime/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                <Sparkles className="w-4 h-4 text-lime" />
                <span>CIVIC PARTICIPATION BALANCE</span>
              </div>

              {/* Main Balance */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl">🪙</span>
                <motion.span
                  key={wallet.currentBalance}
                  initial={{ scale: 1.05, color: '#9FFF00' }}
                  animate={{ scale: 1, color: '#FFFFFF' }}
                  className="font-display font-black text-5xl sm:text-6xl tracking-tight"
                >
                  {wallet.currentBalance.toLocaleString()}
                </motion.span>
                <span className="font-mono text-lime font-black text-sm tracking-widest uppercase">
                  CIVICX POINTS
                </span>
              </div>

              <p className="text-xs text-zinc-300 font-sans max-w-md leading-relaxed">
                Your verified infrastructure observations directly empower municipal engineering prioritization. Earn points as your reports advance through the 7-signal screening and work order lifecycle.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {isAuthenticated ? (
                  <button
                    onClick={() => handleOpenRedeem(rewardOptions[0])}
                    className="px-6 py-3 rounded-2xl bg-lime text-civic-dark font-display font-bold text-xs hover:bg-lime-dark transition-all shadow-md flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span>REDEEM REWARDS</span>
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login?mode=CITIZEN&redirect=/citizen/rewards"
                      className="px-6 py-3 rounded-2xl bg-lime text-civic-dark font-display font-bold text-xs hover:bg-lime-light transition-all shadow-md flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>SIGN IN TO REDEEM</span>
                    </Link>
                    <Link
                      to="/login?mode=CITIZEN&redirect=/citizen/rewards"
                      className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold transition-all border border-zinc-700 flex items-center gap-2"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-lime" />
                      <span>Create Account (+100 Pts)</span>
                    </Link>
                  </>
                )}

                <button
                  onClick={() => setShowAnimationModal(true)}
                  className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold transition-all border border-zinc-700 flex items-center gap-2"
                  title="Preview the +250 points resolution celebration"
                >
                  <Play className="w-3.5 h-3.5 text-lime" />
                  <span>PREVIEW RESOLUTION ANIMATION</span>
                </button>
              </div>
            </div>

            {/* 4 Cards: CURRENT BALANCE, LIFETIME EARNED, PENDING, REDEEMED */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 font-mono">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-bold uppercase">CURRENT BALANCE</span>
                <span className="text-2xl font-bold text-lime">{wallet.currentBalance.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Available for demo</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-bold uppercase">LIFETIME EARNED</span>
                <span className="text-2xl font-bold text-white">{wallet.lifetimeEarned.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Verified points</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-bold uppercase">PENDING</span>
                <span className="text-2xl font-bold text-amber-400">{wallet.pending.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">In screening queue</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-bold uppercase">REDEEMED</span>
                <span className="text-2xl font-bold text-blue-400">{wallet.redeemed.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Civic credit claimed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Contribution Banner */}
        <div className="p-6 rounded-3xl bg-white border border-purple-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Your reports help the city understand where infrastructure needs attention.
              </h3>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Every verified defect is matched against Coimbatore Corporation's monitored asset corridors to prioritize capital budget allocation.
              </p>
            </div>
          </div>
        </div>

        {/* CIVIC REDEMPTION TIERS SECTION */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-lime-600" />
                <h2 className="font-display font-bold text-xl text-slate-900">
                  Municipal Reward & Voucher Options
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Redeem your verified civic stewardship points for municipal service credits, transit passes, and recognition vouchers.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono font-bold">
              1,000 Pts ≈ ₹10 Civic Value
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewardOptions.map((opt) => {
              const canAfford = wallet.currentBalance >= opt.pointsCost;
              return (
                <div
                  key={opt.rewardId}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    canAfford
                      ? 'bg-slate-50 border-slate-300 hover:border-lime-500 hover:shadow-md'
                      : 'bg-slate-50/60 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-mono font-bold">
                        {opt.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        ₹{opt.demoValueInr} Civic Value
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-slate-900">{opt.title}</h3>
                    <p className="text-xs text-slate-600 font-sans">{opt.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">REQUIRED</span>
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {opt.pointsCost.toLocaleString()} Pts
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenRedeem(opt)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-colors ${
                        canAfford
                          ? 'bg-civic-dark text-lime hover:bg-zinc-800'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'REDEEM →' : 'LOCKED'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1 font-sans">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              Demo Redemption — Prototype Concept for Future Municipal Partnership.
            </p>
            <p className="text-[11px] text-amber-800">
              CIVICX Points have no real-world monetary value in this prototype and cannot be exchanged for currency. All balances and transactions are simulated demonstration records.
            </p>
          </div>
        </div>

        {/* 2-COLUMN SECTION: PENDING REWARDS & CIVIC IMPACT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Contributions Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-mono">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="font-display font-bold text-lg text-slate-900">
                Pending Contributions
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Points currently reserved in the municipal review queue awaiting milestone completion.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Waiting for Report Validation</span>
                  <span className="text-[10px] text-slate-500 font-sans">7-Signal verification queue</span>
                </div>
                <span className="font-mono font-bold text-amber-600 text-sm">
                  +{wallet.pendingBreakdown?.waitingForValidation || 0} Pts
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Waiting for Municipal Action</span>
                  <span className="text-[10px] text-slate-500 font-sans">Work order dispatch</span>
                </div>
                <span className="font-mono font-bold text-amber-600 text-sm">
                  +{wallet.pendingBreakdown?.waitingForMunicipalAction || 0} Pts
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Waiting for Defect Resolution</span>
                  <span className="text-[10px] text-slate-500 font-sans">Field repair sign-off</span>
                </div>
                <span className="font-mono font-bold text-amber-600 text-sm">
                  +{wallet.pendingBreakdown?.waitingForResolution || 0} Pts
                </span>
              </div>
            </div>
          </div>

          {/* Civic Impact Summary */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-mono">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-700" />
              <h2 className="font-display font-bold text-lg text-slate-900">
                Your Civic Impact
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Measurable infrastructure improvements driven by your submitted observations.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-[10px] text-purple-800 uppercase font-bold block">SUBMITTED</span>
                <span className="text-2xl font-bold text-purple-900">{impact?.reportsSubmitted ?? 6}</span>
                <span className="text-[10px] text-purple-700 font-sans block mt-0.5">Total reports</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] text-blue-800 uppercase font-bold block">VALIDATED</span>
                <span className="text-2xl font-bold text-blue-900">{impact?.reportsValidated ?? 4}</span>
                <span className="text-[10px] text-blue-700 font-sans block mt-0.5">Passed screening</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-[10px] text-indigo-800 uppercase font-bold block">ROADS IMPROVED</span>
                <span className="text-2xl font-bold text-indigo-900">{impact?.roadsImproved ?? 3}</span>
                <span className="text-[10px] text-indigo-700 font-sans block mt-0.5">Corridors repaired</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">RESOLVED</span>
                <span className="text-2xl font-bold text-emerald-900">{impact?.issuesResolved ?? 2}</span>
                <span className="text-[10px] text-emerald-700 font-sans block mt-0.5">Full sign-off</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deterministic Reward Rules */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-700" />
            <h2 className="font-display font-bold text-xl text-slate-900">
              Deterministic CIVICX Point Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-2xl">📝</span>
              <p className="text-xs font-bold text-slate-900">REPORT SUBMITTED</p>
              <p className="font-display font-black text-xl text-blue-600">+10 Points</p>
              <p className="text-[10px] text-slate-500 font-sans">Awarded once per valid observation submission.</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-2">
              <span className="text-2xl">🔍</span>
              <p className="text-xs font-bold text-purple-900">REPORT VALIDATED</p>
              <p className="font-display font-black text-xl text-purple-700">+50 Points</p>
              <p className="text-[10px] text-purple-600 font-sans">Awarded when CIVICX 7-signal screening verifies defect.</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-2">
              <span className="text-2xl">👷</span>
              <p className="text-xs font-bold text-blue-900">GOV ACTION STARTED</p>
              <p className="font-display font-black text-xl text-blue-700">+100 Points</p>
              <p className="text-[10px] text-blue-600 font-sans">Awarded when municipal work order is assigned & active.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
              <span className="text-2xl">🎉</span>
              <p className="text-xs font-bold text-emerald-900">ISSUE RESOLVED</p>
              <p className="font-display font-black text-xl text-emerald-700">+250 Points</p>
              <p className="text-[10px] text-emerald-600 font-sans">Awarded upon municipal engineer's verified completion.</p>
            </div>
          </div>
        </div>

        {/* CIVIC CHAMPIONS LEADERBOARD & REWARD HISTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Civic Champions Leaderboard */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 font-mono">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="font-display font-bold text-lg text-slate-900">
                Civic Champions
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Privacy-safe anonymized rankings of top municipal contributors.
            </p>

            <div className="space-y-2.5 pt-2">
              {leaderboard.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      item.rank === 1 ? 'bg-amber-400 text-slate-900' :
                      item.rank === 2 ? 'bg-slate-300 text-slate-900' :
                      item.rank === 3 ? 'bg-amber-600 text-white' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      #{item.rank}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-sans">{item.badge}</span>
                    </div>
                  </div>
                  <span className="font-bold text-purple-700">{item.civicxPoints.toLocaleString()} Pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reward History Table */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-slate-900">
                Transaction Ledger
              </h2>
              <span className="text-xs font-mono text-slate-500">{wallet.rewards.length} recorded events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-3">DATE</th>
                    <th className="py-3 px-3">REPORT</th>
                    <th className="py-3 px-3">REASON</th>
                    <th className="py-3 px-3">POINTS</th>
                    <th className="py-3 px-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {wallet.rewards.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-purple-700 whitespace-nowrap">
                        {r.reportId ? `CIV-2026-${String(r.reportId).padStart(5, '0')}` : 'PROTOTYPE REDEEM'}
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium max-w-[200px] truncate">
                        {r.reason}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                        <span className={r.points >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {r.points >= 0 ? `+${r.points}` : r.points}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'REDEEMED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* SIMULATED REDEMPTION CONFIRMATION MODAL */}
      <AnimatePresence>
        {showRedeemModal && selectedOption && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-lime-600">
                  <Gift className="w-5 h-5" />
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Redeem {selectedOption.title}?
                  </h3>
                </div>
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!redeemSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Points Cost:</span>
                      <span className="font-bold text-slate-900">-{selectedOption.pointsCost.toLocaleString()} Pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Civic Voucher Value:</span>
                      <span className="font-bold text-emerald-700">₹{selectedOption.demoValueInr} Civic Credit</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2">
                      <span className="text-slate-500">Remaining Balance:</span>
                      <span className="font-bold text-purple-700">
                        {Math.max(0, wallet.currentBalance - selectedOption.pointsCost).toLocaleString()} Pts
                      </span>
                    </div>
                  </div>

                  {redeemError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans">
                      {redeemError}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-sans">
                    <strong>Voucher Redemption:</strong> Civic points represent verified citizen participation in urban infrastructure monitoring.
                  </div>

                  <div className="flex gap-2 font-mono text-xs">
                    <button
                      onClick={handleConfirmRedeem}
                      disabled={isRedeeming || wallet.currentBalance < selectedOption.pointsCost}
                      className="flex-1 py-3 rounded-xl bg-civic-dark text-lime font-bold hover:bg-zinc-800 transition-colors shadow-md disabled:opacity-50"
                    >
                      {isRedeeming ? 'PROCESSING...' : 'CONFIRM REDEEM'}
                    </button>
                    <button
                      onClick={() => setShowRedeemModal(false)}
                      className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-lg text-slate-900">
                      Redemption Successful!
                    </h4>
                    <p className="text-xs text-slate-600 font-sans">
                      Civic voucher for <strong>₹{selectedOption.demoValueInr}</strong> created. Updated balance: <strong>{wallet.currentBalance.toLocaleString()} Pts</strong>.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowRedeemModal(false)}
                    className="w-full py-3 rounded-xl bg-civic-dark text-lime font-mono text-xs font-bold"
                  >
                    CLOSE
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESOLUTION CELEBRATION MODAL */}
      <ResolutionRewardModal
        isOpen={showAnimationModal}
        onClose={() => setShowAnimationModal(false)}
        reportId="CIV-2026-00003"
        points={250}
      />
    </div>
  );
};
