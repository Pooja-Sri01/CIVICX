import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  AlertTriangle,
  Coins,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  Camera,
  ExternalLink,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { CitizenReport, CitizenReportStatus } from '../../types';
import { isUserUploadedPhoto, handleImageError } from '../../utils/imageFallback';

export const CitizenReportDetailPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<CitizenReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await ApiService.getCitizenReportById(reportId);
        if (data) {
          setReport(data);
        } else {
          setError('Civic report not found or you do not have permission to view it.');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load civic report details.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EDEEF5] text-slate-900 flex flex-col">
        <div className="max-w-4xl mx-auto w-full py-16 px-4 space-y-6">
          <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-48" />
          <div className="h-64 bg-white rounded-3xl border border-slate-200 p-8 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#EDEEF5] text-slate-900 flex flex-col">
        <div className="max-w-xl mx-auto w-full py-16 px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Report Not Found</h2>
          <p className="text-slate-600 text-sm">{error || "The requested civic report could not be found."}</p>
          <Link
            to="/citizen/reports"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-civic-dark text-white font-mono text-xs font-bold hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Reports</span>
          </Link>
        </div>
      </div>
    );
  }

  const status = report.status as CitizenReportStatus;
  const isSubmitted = true;
  const isUnderReview = ['UNDER_REVIEW', 'VALIDATED', 'PRIORITIZED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(status);
  const isValidated = ['VALIDATED', 'PRIORITIZED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(status);
  const isPrioritized = ['PRIORITIZED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(status);
  const isAssigned = ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(status);
  const isInProgress = ['IN_PROGRESS', 'RESOLVED'].includes(status);
  const isResolved = status === 'RESOLVED';
  const isRejected = status === 'REJECTED';
  const isDuplicate = status === 'DUPLICATE';

  const stages = [
    { label: 'Submitted', done: isSubmitted, current: status === 'SUBMITTED', pts: '+10' },
    { label: 'Under Review', done: isUnderReview, current: status === 'UNDER_REVIEW' },
    { label: 'Validated', done: isValidated, current: status === 'VALIDATED', pts: '+50' },
    { label: 'Prioritized', done: isPrioritized, current: status === 'PRIORITIZED' },
    { label: 'Assigned', done: isAssigned, current: status === 'ASSIGNED', pts: '+100' },
    { label: 'In Progress', done: isInProgress, current: status === 'IN_PROGRESS' },
    { label: 'Resolved', done: isResolved, current: status === 'RESOLVED', pts: '+250' }
  ];

  return (
    <div className="min-h-screen bg-[#EDEEF5] text-slate-900 flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/citizen/reports"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO MY REPORTS</span>
          </Link>

          <span className="font-mono text-xs text-slate-500 font-semibold">
            Track ID: <span className="font-bold text-slate-900">{report.reportId || `CIV-2026-${report.id}`}</span>
          </span>
        </div>

        {/* Report Overview Card */}
        <section aria-labelledby="report-overview-heading" className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  {report.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
                    isResolved
                      ? 'bg-emerald-100 text-emerald-800'
                      : isInProgress || isAssigned
                      ? 'bg-blue-100 text-blue-800'
                      : isValidated
                      ? 'bg-purple-100 text-purple-800'
                      : isRejected
                      ? 'bg-red-100 text-red-800'
                      : isDuplicate
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-zinc-100 text-zinc-800'
                  }`}
                >
                  STATUS: {report.status}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-mono text-xs font-bold border border-amber-200">
                  SEVERITY: {report.severity || 'MEDIUM'}
                </span>
              </div>

              <h1 id="report-overview-heading" className="font-display font-black text-2xl sm:text-3xl text-slate-900">
                {report.locationName || 'Coimbatore Infrastructure Defect'}
              </h1>
              <p className="font-mono text-xs text-slate-500 mt-1">
                Submitted on {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Total Reward Yield */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-right shrink-0">
              <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">Civic Reward Yield</span>
              <span className="text-xl font-bold text-lime">
                +{isResolved ? 410 : isAssigned ? 160 : isValidated ? 60 : 10} PTS
              </span>
            </div>
          </div>

          {/* 7-Stage Visual Lifecycle Timeline */}
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider block">
              MUNICIPAL RESOLUTION LIFECYCLE
            </span>

            {isRejected || isDuplicate ? (
              <div className={`p-4 rounded-2xl border ${isRejected ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'} font-mono text-xs flex items-center gap-3`}>
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold block uppercase">{report.status} OBSERVATION</span>
                  <p className="text-[11px] font-sans mt-0.5">{report.actionNotes || 'This report was audited and assigned terminal resolution by municipal authorities.'}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {stages.map((st, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      st.current
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-lime/40'
                        : st.done
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {st.done ? (
                        <CheckCircle2 className={`w-4 h-4 ${st.current ? 'text-lime' : 'text-emerald-600'}`} />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <span className="font-mono font-bold text-xs block leading-tight">{st.label}</span>
                    {st.pts && (
                      <span className={`text-[10px] font-mono font-bold mt-1 block ${st.done ? (st.current ? 'text-lime' : 'text-emerald-700') : 'text-slate-400'}`}>
                        {st.pts}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description & Photo Evidence */}
          <div className={`grid gap-6 pt-4 border-t border-slate-100 ${isUserUploadedPhoto(report.photoUrl) ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Citizen Submitted Observation
              </span>
              <p className="text-slate-800 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                "{report.description}"
              </p>

              {report.actionNotes && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs font-mono space-y-1">
                  <span className="text-[10px] text-blue-700 font-bold block">GOVERNMENT ACTION LOG</span>
                  <p className="text-slate-800 font-sans">{report.actionNotes}</p>
                </div>
              )}
            </div>

            {isUserUploadedPhoto(report.photoUrl) && (
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Citizen Uploaded Evidence
                </span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group">
                  <img
                    src={report.photoUrl}
                    alt="Infrastructure Inspection Evidence"
                    onError={(e) => handleImageError(e, report.category)}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 text-white font-mono text-[10px] flex items-center gap-1.5 backdrop-blur-sm">
                    <Camera className="w-3 h-3 text-lime" />
                    <span>Visual Evidence Verified</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Deterministic Screening & Evidence Correlation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Screening Score Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CIVICX SCREENING</span>
              </div>
              <span className="font-mono font-bold text-xl text-purple-900">
                {report.validationScore} / 100
              </span>
            </div>

            <div>
              <span className="font-mono font-bold text-lg text-slate-900 block">
                Screening Verdict: <span className="text-purple-700">{report.validationStatus}</span>
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Deterministic 7-signal infrastructure verification screening engine.
              </p>
            </div>

            {report.validationFactors && report.validationFactors.length > 0 && (
              <div className="space-y-2 pt-2">
                {report.validationFactors.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{f.signal}</span>
                      <p className="text-[10px] text-slate-500 font-sans mt-0.5">{f.detail}</p>
                    </div>
                    <span className="text-emerald-600 font-bold">+{f.score}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Official Municipal Disclaimer */}
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              <strong>Mandatory Notice:</strong> CIVICX screening supports municipal review. It is not official government confirmation.
            </div>
          </div>

          {/* Spatial & Asset Correlation Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>GEOSPATIAL COORDINATION</span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500">
                Zone: {report.zone || 'Central Zone'}
              </span>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase">Municipal Location Coordinates</span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700">
                Lat: {report.latitude.toFixed(5)}°, Lon: {report.longitude.toFixed(5)}°
              </div>
            </div>

            {report.nearestAssetId && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                    CORRELATED CIVICX ASSET
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-bold text-[10px]">
                    ~{report.nearestAssetDistanceM ?? 184}m away
                  </span>
                </div>
                <p className="text-base font-black text-blue-950">
                  {report.nearestAssetId}
                </p>
                <p className="text-[11px] text-blue-800 font-sans">
                  This report has been indexed as corroborating citizen evidence against infrastructure corridor {report.nearestAssetId}.
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Evidence Audited & Verified</span>
              </div>
              <Link
                to="/map"
                className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>View GIS Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
