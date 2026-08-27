import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  AlertTriangle,
  PlusCircle,
  Coins,
  ArrowRight,
  Filter,
  Search,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { CitizenReport, CitizenReportStatus } from '../../types';
import { isUserUploadedPhoto, handleImageError } from '../../utils/imageFallback';

export const CitizenReportsPage: React.FC = () => {
  const { user, isCitizen } = useAuth();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedReportId, setExpandedReportId] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        if (isCitizen && user?.email) {
          const myData = await ApiService.getMyCitizenReports(user.email, user.id);
          setReports(myData);
        } else {
          const data = await ApiService.getCitizenReports();
          setReports(data);
        }
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user, isCitizen]);

  const filtered = reports.filter((r) => {
    const matchesCat = categoryFilter === 'All' || r.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStat = statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesCat && matchesStat;
  });

  const getTimelineSteps = (status: CitizenReportStatus) => {
    const isSubmitted = true;
    const isUnderReview = ['UNDER_REVIEW', 'VALIDATED', 'PRIORITIZED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(status);
    const isValidated = ['VALIDATED', 'PRIORITIZED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(status);
    const isGovAction = ['PRIORITIZED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(status);
    const isResolved = status === 'RESOLVED';
    const isRejected = status === 'REJECTED';
    const isDuplicate = status === 'DUPLICATE';

    return { isSubmitted, isUnderReview, isValidated, isGovAction, isResolved, isRejected, isDuplicate };
  };

  return (
    <div className="min-h-screen bg-[#EDEEF5] text-slate-900 flex flex-col">
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold mb-2">
              <ListTodo className="w-3.5 h-3.5" />
              <span>INCIDENT AUDIT & TRACKER</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
              {isCitizen ? 'My Civic Reports' : 'Civic Observations & Repair Tracker'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {isCitizen 
                ? 'Track the live verification and resolution progress of your personal municipal observations.'
                : 'Public municipal incident logs and live verification timeline across Coimbatore.'}
            </p>
          </div>

          <Link
            to="/citizen/report"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-civic-dark text-white font-mono text-xs font-bold hover:bg-zinc-800 transition-colors shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-lime" />
            <span>Report New Issue</span>
          </Link>
        </div>

        {/* Public Notice Banner if Unauthenticated */}
        {!isCitizen && (
          <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-lime/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lime font-bold">ℹ PUBLIC VIEW:</span>
              <span className="text-zinc-300">You are browsing citywide public observations. Sign in to view and track your personally filed complaints.</span>
            </div>
            <Link
              to="/login?mode=CITIZEN&redirect=/citizen/reports"
              className="px-3.5 py-1.5 rounded-xl bg-lime text-civic-dark font-bold hover:bg-lime-light transition-all whitespace-nowrap shadow-sm text-center"
            >
              Sign In to Track Mine →
            </Link>
          </div>
        )}

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-mono font-bold text-slate-500 text-[11px] uppercase">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VALIDATED">Validated</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Pothole">Pothole</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Drainage / Flooding">Drainage / Flooding</option>
              <option value="Bridge / Flyover Damage">Bridge / Flyover Damage</option>
              <option value="Street Infrastructure">Street Infrastructure</option>
            </select>
          </div>

          <div className="font-mono text-xs text-slate-500 font-bold">
            Showing {filtered.length} of {reports.length} reports
          </div>
        </div>

        {/* Report Cards List */}
        <div className="space-y-4">
          {filtered.map((rep) => {
            const { isSubmitted, isUnderReview, isValidated, isGovAction, isResolved, isRejected, isDuplicate } =
              getTimelineSteps(rep.status);
            const isExpanded = expandedReportId === rep.id;

            return (
              <div
                key={rep.id}
                className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300"
              >
                <div className="p-6 space-y-4">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        {rep.reportId}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{rep.category}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                          rep.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rep.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : rep.status === 'VALIDATED'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rep.status}
                      </span>

                      <button
                        onClick={() => setExpandedReportId(isExpanded ? null : rep.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Description & Location */}
                  <div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{rep.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rep.locationName}</span>
                    </div>
                  </div>

                  {/* Visual 5-Stage Lifecycle Timeline */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="grid grid-cols-5 gap-2 text-center font-mono text-[10px] sm:text-xs">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                          ✓
                        </div>
                        <span className="font-bold text-slate-800">Submitted</span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center space-y-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            isUnderReview
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isUnderReview ? '✓' : '2'}
                        </div>
                        <span className={isUnderReview ? 'font-bold text-slate-800' : 'text-slate-400'}>
                          Under Review
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center space-y-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            isValidated
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isValidated ? '✓' : '3'}
                        </div>
                        <span className={isValidated ? 'font-bold text-slate-800' : 'text-slate-400'}>
                          Validated
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div className="flex flex-col items-center space-y-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            isGovAction
                              ? 'bg-blue-600 text-white animate-pulse'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isResolved ? '✓' : isGovAction ? '●' : '4'}
                        </div>
                        <span className={isGovAction ? 'font-bold text-blue-700' : 'text-slate-400'}>
                          Gov Action
                        </span>
                      </div>

                      {/* Step 5 */}
                      <div className="flex flex-col items-center space-y-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            isResolved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isResolved ? '✓' : '○'}
                        </div>
                        <span className={isResolved ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                          Resolved
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Celebration Callout when Resolved */}
                  {isResolved && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2.5 text-emerald-800">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                        <div>
                          <strong className="block text-emerald-900">
                            "Your report helped CIVICX identify and resolve this issue."
                          </strong>
                          <span className="text-[11px] text-emerald-700">
                            {rep.actionNotes || 'Municipal engineering team completed scheduled resurfacing.'}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold shrink-0">
                        🪙 +250 Points
                      </span>
                    </div>
                  )}

                  {/* Expanded Details Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 border-t border-slate-100 space-y-4"
                      >
                        <div className={`grid gap-4 ${isUserUploadedPhoto(rep.photoUrl) ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                          {isUserUploadedPhoto(rep.photoUrl) && (
                            <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                              <img
                                src={rep.photoUrl}
                                alt={rep.category}
                                onError={(e) => handleImageError(e, rep.category)}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-white font-mono text-[9px]">
                                Citizen Uploaded Evidence
                              </div>
                            </div>
                          )}

                          <div className={`space-y-3 font-mono text-xs ${!isUserUploadedPhoto(rep.photoUrl) ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-0' : ''}`}>
                            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
                              <span className="text-[10px] text-purple-700 font-bold block">
                                DETERMINISTIC VALIDATION
                              </span>
                              <p className="text-base font-black text-purple-900">
                                {rep.validationScore} / 100 ({rep.validationStatus})
                              </p>
                              <span className="text-[10px] text-purple-600 block">
                                Screened via 7-signal infrastructure verification
                              </span>
                            </div>

                            {rep.nearestAssetId && (
                              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                                <span className="text-[10px] text-blue-700 font-bold block">
                                  CORRELATED CIVICX ASSET
                                </span>
                                <p className="text-base font-black text-blue-900">
                                  {rep.nearestAssetId}
                                </p>
                                <span className="text-[10px] text-blue-600 block">
                                  Distance: ~{rep.nearestAssetDistanceM ?? 184}m from observation
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CIVIC CONTRIBUTION BREAKDOWN */}
                        <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <span className="text-lime font-bold text-xs uppercase tracking-wider">
                              CIVIC CONTRIBUTION
                            </span>
                            <span className="text-lime font-bold text-sm">
                              +{isResolved ? 410 : isGovAction ? 160 : isValidated ? 60 : 10} CIVICX POINTS
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                              <span className="text-[10px] text-zinc-400 block">Submission</span>
                              <span className="font-bold text-white">+10</span>
                            </div>
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                              <span className="text-[10px] text-zinc-400 block">Validation</span>
                              <span className={`font-bold ${isValidated ? 'text-purple-300' : 'text-zinc-500'}`}>
                                {isValidated ? '+50' : '0'}
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                              <span className="text-[10px] text-zinc-400 block">Gov Action</span>
                              <span className={`font-bold ${isGovAction ? 'text-blue-300' : 'text-zinc-500'}`}>
                                {isGovAction ? '+100' : '0'}
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                              <span className="text-[10px] text-zinc-400 block">Resolution</span>
                              <span className={`font-bold ${isResolved ? 'text-emerald-300' : 'text-zinc-500'}`}>
                                {isResolved ? '+250' : '0'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {rep.validationFactors && rep.validationFactors.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                              Verification Signal Breakdown
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                              {rep.validationFactors.map((f, i) => (
                                <div
                                  key={i}
                                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between"
                                >
                                  <div>
                                    <span className="font-bold text-slate-800">{f.signal}</span>
                                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">{f.detail}</p>
                                  </div>
                                  <span className="text-emerald-600 font-bold">+{f.score}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <Link
                            to={`/citizen/report/${rep.reportId || rep.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
                          >
                            <span>Open Dedicated Tracking Page</span>
                            <ArrowRight className="w-3.5 h-3.5 text-lime" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
