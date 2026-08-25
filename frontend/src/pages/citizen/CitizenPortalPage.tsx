import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Coins,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Trophy,
  Award,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  User,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { CitizenReport, CitizenImpact, CitizenLeaderboardItem } from '../../types';
import { getAssetImage, handleImageError } from '../../utils/imageFallback';

export const CitizenPortalPage: React.FC = () => {
  const { user, isAuthenticated, isCitizen, isMunicipal } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [myReports, setMyReports] = useState<CitizenReport[]>([]);
  const [impact, setImpact] = useState<CitizenImpact | null>(null);
  const [leaderboard, setLeaderboard] = useState<CitizenLeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMunicipal) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const loadCitizenData = async () => {
      setLoading(true);
      try {
        const [repData, leadData] = await Promise.all([
          ApiService.getCitizenReports(),
          ApiService.getCitizenLeaderboard()
        ]);
        setReports(repData);
        setLeaderboard(leadData);

        if (isAuthenticated && user?.email) {
          const [myRepData, impData] = await Promise.all([
            ApiService.getMyCitizenReports(user.email, user.id),
            ApiService.getCitizenImpact(user.id)
          ]);
          setMyReports(myRepData);
          setImpact(impData);
        }
      } catch (err) {
        console.error('Failed to load citizen portal data', err);
      } finally {
        setLoading(false);
      }
    };
    loadCitizenData();
  }, [user, isAuthenticated, isMunicipal]);

  const activeMyReports = myReports.filter(r => r.status !== 'RESOLVED' && r.status !== 'REJECTED');
  const resolvedMyReports = myReports.filter(r => r.status === 'RESOLVED');

  const displayedReports = (isAuthenticated && myReports.length > 0) ? myReports : reports;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* 1. Citizen Welcome Header — Authenticated vs Unauthenticated */}
      {isAuthenticated && user ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Coimbatore Citizen Civic Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              {user.ward || 'Coimbatore Resident'} • Verified Citizen Stewardship Contributor
            </p>
          </div>

          {/* Citizen Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[130px]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">CIVICX POINTS</span>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="font-display font-black text-2xl text-white">
                  {user.pointsBalance ?? impact?.currentBalance ?? 100}
                </span>
              </div>
              <Link to="/citizen/rewards" className="text-[10px] text-lime hover:underline font-bold block mt-0.5">
                Redeem Rewards →
              </Link>
            </div>

            <Link
              to="/citizen/report"
              className="px-5 py-4 rounded-2xl bg-lime text-civic-dark font-display font-black text-sm hover:bg-lime-light transition-all shadow-lime-glow flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span>Report Defect</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Unauthenticated Public Portal Header */
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Coimbatore Citizen Civic Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Public Infrastructure Intelligence & Reporting
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
              Empowering Coimbatore residents to report road potholes, waterlogging, and infrastructure hazards directly to municipal engineering teams. Earn civic rewards for verified contributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/login?mode=CITIZEN"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/login?mode=CITIZEN"
              className="px-5 py-3.5 rounded-2xl bg-lime text-civic-dark font-display font-black text-xs hover:bg-lime-light transition-all shadow-lime-glow flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account (+100 Pts)</span>
            </Link>
          </div>
        </div>
      )}

      {/* 2. Primary 3-Card Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Submit Issue */}
        <Link
          to="/citizen/report"
          className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-subtle hover:border-zinc-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-lime/20 text-civic-dark flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-lg text-civic-dark group-hover:text-lime-dark transition-colors">
              Report Infrastructure Defect
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Snap a photo of potholes, waterlogging, or broken infrastructure with GPS location to alert municipal teams.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between font-mono text-xs font-bold text-civic-dark">
            <span>+10 Pts on Submit • +50 on Validation</span>
            <ArrowRight className="w-4 h-4 text-lime-dark group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Track Reports */}
        <Link
          to="/citizen/reports"
          className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-subtle hover:border-zinc-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-lg text-civic-dark group-hover:text-blue-600 transition-colors">
              {isAuthenticated ? `My Active Complaints (${activeMyReports.length})` : `Track City Observations (${reports.length})`}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {isAuthenticated 
                ? 'Track live progression of your complaints from engineering intake and crew dispatch to verified resolution.'
                : 'Explore live municipal workflow progression and citywide repair logs across all 5 municipal zones.'}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between font-mono text-xs font-bold text-blue-600">
            <span>{isAuthenticated ? `${resolvedMyReports.length} Issues Resolved` : 'Explore Live Tracker'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Civic Rewards & Leaderboard */}
        <Link
          to="/citizen/rewards"
          className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-subtle hover:border-zinc-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-lg text-civic-dark group-hover:text-amber-600 transition-colors">
              {isAuthenticated ? `Rewards & Wallet (${user?.pointsBalance ?? 100} Pts)` : 'Civic Rewards & Impact'}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Earn civic tokens for verified reports and redeem for municipal vouchers, transit credits, and community honors.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between font-mono text-xs font-bold text-amber-600">
            <span>{isAuthenticated ? 'Redeem Vouchers →' : 'View Leaderboard →'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 3. Active Complaints / Citywide Observations Live Tracker */}
      <div className="rounded-3xl bg-white border border-zinc-200 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-600" />
            <h2 className="font-display font-black text-base text-civic-dark">
              {isAuthenticated && myReports.length > 0 ? 'My Recent Complaints' : 'Recent City Observations & Repair Status'}
            </h2>
          </div>
          <Link to="/citizen/reports" className="text-xs text-lime-dark hover:underline font-mono font-bold flex items-center gap-1">
            View All ({displayedReports.length}) →
          </Link>
        </div>

        <div className="divide-y divide-zinc-100">
          {displayedReports.slice(0, 4).map((r) => (
            <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs ${
                  r.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                  r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {r.status === 'RESOLVED' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-zinc-900">{r.reportId || (r as any).report_id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700">
                      {r.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 font-medium line-clamp-1">{r.description}</p>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3" />
                    {r.locationName || (r as any).location_name}
                  </span>
                </div>
              </div>

              {/* Status Badge & Action */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                  r.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  r.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  r.status === 'VALIDATED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {r.status.replace('_', ' ')}
                </span>
                <Link
                  to={`/citizen/report/${r.reportId || (r as any).report_id || r.id}`}
                  className="px-3 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono text-xs font-bold transition-colors"
                >
                  Track
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
