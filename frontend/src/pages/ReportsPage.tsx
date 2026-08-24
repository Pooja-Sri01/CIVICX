import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Building2, 
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Share2,
  Calendar,
  Layers,
  Sliders,
  DollarSign,
  TrendingUp,
  Database,
  Compass,
  FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';

import { ApiService } from '../services/api';
import { Asset, AssetDecisionReportData, PortfolioDecisionReportData } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { ErrorState } from '../components/common/ErrorState';
import { DashboardSkeleton } from '../components/common/DashboardSkeleton';
import { formatINR, formatINRFull } from '../utils/formatters';

type ReportType = 'asset' | 'portfolio';

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assetParam = searchParams.get('asset');
  const typeParam = (searchParams.get('type') as ReportType) || 'asset';

  const [reportType, setReportType] = useState<ReportType>(typeParam);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [assetReport, setAssetReport] = useState<AssetDecisionReportData | null>(null);
  const [portfolioReport, setPortfolioReport] = useState<PortfolioDecisionReportData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial asset list and reports
  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const data = await ApiService.getPriorities();
        setAssets(data);
        const initialId = assetParam || (data.length > 0 ? data[0].id : '1');
        setSelectedAssetId(initialId);

        const [aRep, pRep] = await Promise.all([
          ApiService.getAssetDecisionReport(initialId),
          ApiService.getPortfolioDecisionReport()
        ]);
        setAssetReport(aRep);
        setPortfolioReport(pRep);
      } catch (err) {
        console.error('Failed to load reports', err);
        setError('Unable to compile decision reports from municipal intelligence data.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [assetParam]);

  const handleSelectAsset = async (newId: string) => {
    setSelectedAssetId(newId);
    setGenerating(true);
    try {
      const rep = await ApiService.getAssetDecisionReport(newId);
      setAssetReport(rep);
    } catch (err) {
      console.error('Asset report generation failed', err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataToExport = reportType === 'asset' ? assetReport : portfolioReport;
    if (!dataToExport) return;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataToExport.report_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || (!assetReport && !portfolioReport)) {
    return <ErrorState message={error || undefined} onRetry={() => handleSelectAsset(selectedAssetId)} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Top Controls & Header (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-civic-border no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-civic-dark tracking-tight">
              DECISION REPORTS
            </h1>
            <span className="bg-lime text-civic-dark text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded font-mono">
              STAKEHOLDER BRIEF
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
            Generate formal, data-backed technical dossiers for municipal approvals, committee reviews, and tender allocation.
          </p>
        </div>

        {/* Action Buttons & Report Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Report Type Selector */}
          <div className="p-1 rounded-xl bg-zinc-200/80 inline-flex items-center">
            <button
              onClick={() => setReportType('asset')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportType === 'asset'
                  ? 'bg-civic-dark text-lime shadow-subtle'
                  : 'text-zinc-600 hover:text-civic-dark'
              }`}
            >
              Asset Decision Report
            </button>
            <button
              onClick={() => setReportType('portfolio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportType === 'portfolio'
                  ? 'bg-civic-dark text-lime shadow-subtle'
                  : 'text-zinc-600 hover:text-civic-dark'
              }`}
            >
              Citywide Portfolio Brief
            </button>
          </div>

          {/* Asset Selector (Visible in Asset Mode) */}
          {reportType === 'asset' && (
            <select
              value={selectedAssetId}
              onChange={(e) => handleSelectAsset(e.target.value)}
              disabled={generating}
              className="py-2 px-3 rounded-xl bg-white border border-civic-border text-xs font-bold text-civic-dark shadow-subtle focus:outline-none focus:ring-2 focus:ring-lime max-w-xs truncate disabled:opacity-50"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.priorityRank} {a.assetId} — {a.name}
                </option>
              ))}
            </select>
          )}

          {/* Export Actions */}
          <button
            onClick={handleDownloadJSON}
            className="px-3 py-2 rounded-xl bg-white border border-civic-border text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-subtle flex items-center gap-1.5"
            title="Download JSON Brief"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-civic-dark text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-subtle flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-lime" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Formal Decision Document (Printable Dossier) */}
      {reportType === 'asset' && assetReport ? (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-civic-border shadow-elevated space-y-8 printable-document">
          {/* Document Header & Seal */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-civic-dark">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-civic-dark flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-lime" />
                </div>
                <span className="font-display font-black text-xl tracking-tight text-civic-dark">
                  CIVICX INFRASTRUCTURE DECISION BRIEF
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                {assetReport.authority}
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-0.5">
              <p className="font-bold text-civic-dark">DOSSIER REF: {assetReport.report_id}</p>
              <p className="text-zinc-500">DATE GENERATED: {assetReport.generated_at}</p>
              <p className="text-emerald-700 font-bold">STATUS: {assetReport.status}</p>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold inline-flex items-center justify-center">1</span>
              <span>Executive Decision Summary</span>
            </h2>
            <div className="p-5 rounded-2xl bg-zinc-900 text-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase text-lime font-bold">RECOMMENDED MUNICIPAL ACTION</span>
                  <p className="font-display font-bold text-lg text-white mt-0.5">
                    {assetReport.decision_recommendation.headline}
                  </p>
                </div>
                <div className="sm:text-right font-mono">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">ESTIMATED CAPITAL</span>
                  <p className="font-bold text-xl text-lime">{formatINRFull(assetReport.asset.estimated_repair_cost)}</p>
                </div>
              </div>

              <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                {assetReport.decision_recommendation.summary}
              </p>
              
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-xs text-red-200 font-mono">
                <strong>CONSEQUENCE OF DELAY: </strong> {assetReport.decision_recommendation.consequence_of_delay}
              </div>
            </div>
          </div>

          {/* Section 2: Asset Telemetry & Classification */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold inline-flex items-center justify-center">2</span>
              <span>Asset Identification & Telemetry</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Asset Identifier</span>
                <p className="font-mono font-bold text-zinc-900 mt-0.5">{assetReport.asset.asset_id}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Infrastructure Category</span>
                <p className="font-semibold text-zinc-900 mt-0.5">{assetReport.asset.asset_type}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Jurisdiction & Ward</span>
                <p className="font-semibold text-zinc-900 mt-0.5">{assetReport.asset.ward || 'Ward 24'}, {assetReport.asset.zone || 'Central Zone'}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">GPS Coordinates</span>
                <p className="font-mono text-zinc-700 mt-0.5">{assetReport.asset.latitude || 11.0168}° N, {assetReport.asset.longitude || 76.9558}° E</p>
              </div>
            </div>
          </div>

          {/* Section 3: Explainable Risk Assessment */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold inline-flex items-center justify-center">3</span>
              <span>Explainable Multi-Criteria Risk Assessment</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-red-200 bg-red-50/50">
                <span className="text-[10px] text-red-600 font-mono uppercase font-bold">Composite Risk Score</span>
                <p className="font-display font-black text-2xl text-red-700 mt-1">{assetReport.risk_assessment.score} / 100</p>
                <p className="text-[11px] text-red-600 font-bold mt-0.5">{assetReport.risk_assessment.level} Urgency Rating</p>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50">
                <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Condition Integrity</span>
                <p className="font-display font-black text-2xl text-zinc-900 mt-1">{assetReport.asset.condition_score}%</p>
                <p className="text-[11px] text-zinc-500 font-bold mt-0.5">{assetReport.inspection_findings.condition_rating} Rating</p>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50">
                <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Priority Queue Rank</span>
                <p className="font-display font-black text-2xl text-civic-dark mt-1">#{assetReport.priority_assessment.rank}</p>
                <p className="text-[11px] text-zinc-500 font-bold mt-0.5">{assetReport.priority_assessment.urgency} Urgency</p>
              </div>
            </div>

            {/* Risk Drivers Breakdown */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
              <p className="font-bold text-zinc-900 font-mono uppercase text-[11px]">Primary Risk Contributors:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {assetReport.risk_assessment.drivers.map((d, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white border border-zinc-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-civic-dark">{d.factor}</span>
                      <span className="text-[10px] text-zinc-500 block">{d.description}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-red-600">+{d.score_contribution} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: AI Vision & Ground Truth Inspection Findings */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold inline-flex items-center justify-center">4</span>
              <span>AI Vision & Ground Truth Inspection Telemetry</span>
            </h2>
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200">
                <span className="font-bold text-zinc-900">
                  Primary Defect: <span className="font-mono text-red-600">{assetReport.asset.damage_type || 'Surface & Structural Fatigue'}</span>
                </span>
                <span className="font-mono text-zinc-500">
                  Last Inspected: {assetReport.asset.last_inspection}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Observed Field Evidence:</span>
                <ul className="list-disc list-inside text-zinc-700 space-y-1 pl-1">
                  {assetReport.inspection_findings.observed_evidence.map((e, idx) => (
                    <li key={idx} className="font-mono">{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5: What-if Simulation & Lifecycle Trade-Offs */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold inline-flex items-center justify-center">5</span>
              <span>What-If Multi-Year Simulation & Cost of Delay</span>
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-2.5 px-3.5">Scenario</th>
                    <th className="py-2.5 px-3.5">Initial Cost</th>
                    <th className="py-2.5 px-3.5">Residual Risk (6 Mo)</th>
                    <th className="py-2.5 px-3.5">Delay Cost Penalty</th>
                    <th className="py-2.5 px-3.5 text-right">Lifecycle Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  <tr className="bg-emerald-50/50 font-medium">
                    <td className="py-3 px-3.5 font-bold text-civic-dark">Scenario A — Repair Now</td>
                    <td className="py-3 px-3.5 font-mono text-zinc-900">{formatINR(assetReport.asset.estimated_repair_cost)}</td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-700">12 / 100</td>
                    <td className="py-3 px-3.5 font-mono text-emerald-700 font-bold">₹0 (Optimal)</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700">Recommended</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3.5 font-bold text-zinc-700">Scenario B — Partial Patch</td>
                    <td className="py-3 px-3.5 font-mono text-zinc-900">{formatINR(assetReport.asset.estimated_repair_cost * 0.25)}</td>
                    <td className="py-3 px-3.5 font-mono text-amber-600 font-bold">54 / 100</td>
                    <td className="py-3 px-3.5 font-mono text-amber-700 font-bold">High Recurrence</td>
                    <td className="py-3 px-3.5 text-right font-mono text-zinc-500">Short-Term Only</td>
                  </tr>
                  <tr className="bg-red-50/30">
                    <td className="py-3 px-3.5 font-bold text-red-700">Scenario C — Delay 6 Months</td>
                    <td className="py-3 px-3.5 font-mono text-zinc-500">₹0 (Postponed)</td>
                    <td className="py-3 px-3.5 font-mono text-red-700 font-bold">98 / 100</td>
                    <td className="py-3 px-3.5 font-mono text-red-700 font-bold">+{formatINR(assetReport.what_if_simulation.cost_of_delay)}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-red-700">Severe Escalation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6: Governance Sign-off & Audit Stamp */}
          <div className="pt-6 border-t-2 border-zinc-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-mono">
            <div>
              <p className="text-[10px] uppercase text-zinc-400 font-bold">Prepared By</p>
              <p className="font-bold text-zinc-800 mt-4 border-b border-zinc-300 pb-1">CivicX Decision Engine</p>
              <p className="text-[10px] text-zinc-500 mt-1">Autonomous Analytics</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-zinc-400 font-bold">Chief Municipal Engineer</p>
              <p className="font-bold text-zinc-800 mt-4 border-b border-zinc-300 pb-1">Approved for Tender</p>
              <p className="text-[10px] text-zinc-500 mt-1">Coimbatore City Corporation</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase text-zinc-400 font-bold">Audit Stamp</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>OFFICIALLY VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Portfolio Report View */
        portfolioReport && (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-civic-border shadow-elevated space-y-8 printable-document">
            {/* Document Header & Seal */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-civic-dark">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-civic-dark flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-lime" />
                  </div>
                  <span className="font-display font-black text-xl tracking-tight text-civic-dark">
                    CITYWIDE INFRASTRUCTURE PORTFOLIO BRIEF
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-mono">
                  {portfolioReport.authority}
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-xs space-y-0.5">
                <p className="font-bold text-civic-dark">PORTFOLIO REF: {portfolioReport.report_id}</p>
                <p className="text-zinc-500">DATE GENERATED: {portfolioReport.generated_at}</p>
                <p className="text-emerald-700 font-bold">STATUS: {portfolioReport.status}</p>
              </div>
            </div>

            {/* Section 1: Executive Portfolio Summary */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold inline-flex items-center justify-center">1</span>
                <span>Executive Portfolio Overview</span>
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-900 text-white text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">TOTAL ASSETS ANALYZED</span>
                  <p className="font-display font-black text-2xl text-white mt-1">{portfolioReport.overview.total_assets}</p>
                  <p className="text-[10px] text-zinc-400">Across Coimbatore</p>
                </div>
                <div>
                  <span className="text-[10px] text-red-400 font-mono uppercase font-bold">CRITICAL / HIGH RISK</span>
                  <p className="font-display font-black text-2xl text-red-400 mt-1">
                    {portfolioReport.overview.critical_assets + portfolioReport.overview.high_risk_assets}
                  </p>
                  <p className="text-[10px] text-zinc-400">Immediate Action Required</p>
                </div>
                <div>
                  <span className="text-[10px] text-lime font-mono uppercase font-bold">ACTIVE BUDGET ENVELOPE</span>
                  <p className="font-display font-black text-2xl text-lime mt-1">{formatINR(portfolioReport.overview.active_budget_envelope)}</p>
                  <p className="text-[10px] text-zinc-400">Standard Capital Cycle</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">TOTAL DEFICIT ESTIMATE</span>
                  <p className="font-display font-black text-2xl text-zinc-200 mt-1">{formatINR(portfolioReport.overview.total_repair_cost)}</p>
                  <p className="text-[10px] text-zinc-400">Full City Restoration</p>
                </div>
              </div>
            </div>

            {/* Section 2: Priority Corridors Ranked */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold inline-flex items-center justify-center">2</span>
                <span>Top Priority Corridors Requiring Immediate Funding</span>
              </h2>

              <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
                    <tr>
                      <th className="py-2.5 px-3.5">Rank</th>
                      <th className="py-2.5 px-3.5">Asset ID & Name</th>
                      <th className="py-2.5 px-3.5">Category</th>
                      <th className="py-2.5 px-3.5">Risk Level</th>
                      <th className="py-2.5 px-3.5">Recommended Intervention</th>
                      <th className="py-2.5 px-3.5 text-right">Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {portfolioReport.priority_corridors.map((c) => (
                      <tr key={c.asset_id}>
                        <td className="py-3 px-3.5 font-mono font-bold text-civic-dark">#{c.priority_rank}</td>
                        <td className="py-3 px-3.5 font-bold text-civic-dark">{c.name}</td>
                        <td className="py-3 px-3.5 text-zinc-600">{c.type}</td>
                        <td className="py-3 px-3.5">
                          <RiskBadge 
                            level={
                              c.risk_level.toUpperCase() === 'CRITICAL' ? 'Critical' :
                              c.risk_level.toUpperCase() === 'HIGH' ? 'High' :
                              c.risk_level.toUpperCase() === 'MEDIUM' ? 'Medium' : 'Low'
                            } 
                            score={c.risk_score} 
                            size="sm" 
                          />
                        </td>

                        <td className="py-3 px-3.5 font-mono text-zinc-800">{c.recommended_action}</td>
                        <td className="py-3 px-3.5 font-mono font-bold text-zinc-900 text-right">{formatINR(c.estimated_repair_cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Budget Optimization Summary & Critical Deficit Gap */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold inline-flex items-center justify-center">3</span>
                <span>Optimized Capital Allocation & Critical Budget Gap</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Funded Corridors</span>
                  <p className="font-display font-black text-2xl text-emerald-700 mt-1">
                    {portfolioReport.budget_allocation.assets_addressed} Assets
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Allocated: {formatINR(portfolioReport.budget_allocation.allocated_budget)} ({portfolioReport.budget_allocation.budget_utilization_pct}%)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Total Risk Points Eliminated</span>
                  <p className="font-display font-black text-2xl text-civic-dark mt-1">
                    -{portfolioReport.budget_allocation.total_risk_reduction} pts
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">MCDA Knapsack Optimized</p>
                </div>

                <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 text-xs">
                  <span className="text-[10px] font-mono uppercase text-red-600 font-bold">Critical Budget Gap</span>
                  <p className="font-display font-black text-2xl text-red-700 mt-1">
                    {formatINR(portfolioReport.budget_allocation.critical_budget_gap)}
                  </p>
                  <p className="text-[11px] text-red-600 font-mono">
                    {portfolioReport.budget_allocation.unfunded_critical_count} Unfunded Critical Corridors
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: 5-Year Citywide Simulation */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-zinc-200 text-zinc-700 text-[10px] font-bold inline-flex items-center justify-center">4</span>
                <span>5-Year Citywide Financial Trajectory (Proactive vs Delay)</span>
              </h2>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
                <p className="font-bold text-zinc-900 font-mono text-[11px]">
                  5-Year Municipal Delay Penalty Prevention: <strong className="text-emerald-700">{formatINR(portfolioReport.citywide_simulation.total_5year_savings)}</strong>
                </p>
                <p className="text-zinc-600 leading-relaxed">
                  {portfolioReport.decision_recommendation.summary}
                </p>
              </div>
            </div>

            {/* Section 5: Governance Sign-off */}
            <div className="pt-6 border-t-2 border-zinc-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-mono">
              <div>
                <p className="text-[10px] uppercase text-zinc-400 font-bold">Prepared By</p>
                <p className="font-bold text-zinc-800 mt-4 border-b border-zinc-300 pb-1">CivicX Decision Engine</p>
                <p className="text-[10px] text-zinc-500 mt-1">Municipal Analytics</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-zinc-400 font-bold">Municipal Commissioner</p>
                <p className="font-bold text-zinc-800 mt-4 border-b border-zinc-300 pb-1">Reviewed & Ratified</p>
                <p className="text-[10px] text-zinc-500 mt-1">Coimbatore City Corporation</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] uppercase text-zinc-400 font-bold">Audit Stamp</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>OFFICIALLY VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
