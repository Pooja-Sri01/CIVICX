import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  Share2
} from 'lucide-react';

import { ApiService } from '../services/api';
import { Asset, SimulationResult } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { formatINR, formatINRFull } from '../utils/formatters';

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const assetParam = searchParams.get('asset');

  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await ApiService.getAssets();
        setAssets(data);
        const initialId = assetParam || (data.length > 0 ? data[0].id : '');
        setSelectedAssetId(initialId);
      } catch (e) {
        console.error('Failed to load assets', e);
      }
    }
    load();
  }, [assetParam]);

  useEffect(() => {
    async function fetchReport() {
      if (!selectedAssetId) return;
      setLoading(true);
      try {
        const res = await ApiService.generateReport(selectedAssetId);
        setReportData(res);
      } catch (e) {
        console.error('Failed to generate report', e);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [selectedAssetId]);

  const handlePrint = () => {
    window.print();
  };

  if (!reportData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-3 border-civic-dark border-t-lime rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Compiling Official Decision Intelligence Brief...
        </p>
      </div>
    );
  }

  const { asset, simulation } = reportData;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Export Controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-civic-border no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-civic-dark tracking-tight">
              Municipal Decision Report
            </h1>
            <span className="bg-lime text-civic-dark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
              EXECUTIVE BRIEF
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Formal technical dossier ready for municipal approval and contractor tender dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="py-2 px-3 rounded-xl bg-white border border-civic-border text-xs font-semibold text-civic-dark shadow-subtle focus:outline-none focus:ring-2 focus:ring-lime max-w-xs truncate"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.assetId} — {a.name}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-subtle flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-lime" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Printable Document Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-civic-border shadow-elevated space-y-8 printable-document">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-civic-dark">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-civic-dark flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-lime" />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight text-civic-dark">
                CIVICX DECISION BRIEF
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              Coimbatore City Corporation • Department of Municipal Roads & Infrastructure
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs space-y-0.5">
            <p className="font-bold text-civic-dark">REPORT REF: {reportData.reportId}</p>
            <p className="text-zinc-500">DATE: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className="text-emerald-700 font-semibold">STATUS: VERIFIED RECOMMENDATION</p>
          </div>
        </div>

        {/* Section 1: Asset Identification */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            1. Asset Telemetry & Classification
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Asset Identifier</span>
              <p className="font-mono font-bold text-zinc-900 mt-0.5">{asset.assetId}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Category</span>
              <p className="font-semibold text-zinc-900 mt-0.5">{asset.type}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Jurisdiction</span>
              <p className="font-semibold text-zinc-900 mt-0.5">{asset.ward}, {asset.zone}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Coordinates</span>
              <p className="font-mono text-zinc-700 mt-0.5">{asset.latitude}° N, {asset.longitude}° E</p>
            </div>
          </div>
        </div>

        {/* Section 2: Executive Assessment */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            2. Multi-Criteria Risk Assessment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50/50">
              <span className="text-[10px] text-red-600 font-mono uppercase font-bold">Composite Risk Score</span>
              <p className="font-display font-bold text-2xl text-red-700 mt-1">{asset.riskScore}/100</p>
              <p className="text-[11px] text-red-600 font-semibold">{asset.riskLevel} Urgency Classification</p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50">
              <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Physical Condition</span>
              <p className="font-display font-bold text-2xl text-zinc-900 mt-1">{asset.conditionScore}%</p>
              <p className="text-[11px] text-zinc-500 font-medium">Remaining Structural Base</p>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50">
              <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Priority Rank</span>
              <p className="font-display font-bold text-2xl text-civic-dark mt-1">#{asset.priorityRank}</p>
              <p className="text-[11px] text-zinc-500 font-medium">Citywide Municipal Queue</p>
            </div>
          </div>
        </div>

        {/* Section 3: AI Inspection & Root Cause */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            3. AI Vision Telemetry & Defect Identification
          </h2>
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900">Detected Structural Defect:</span>
              <span className="font-mono text-zinc-600 font-bold">{asset.damageType}</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              {asset.explainability?.summary}
            </p>
          </div>
        </div>

        {/* Section 4: Recommended Action & Fiscal Allocation */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            4. Recommended Action & Capital Allocation
          </h2>
          <div className="p-5 rounded-2xl bg-zinc-900 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-lime">Recommended Technical Intervention</span>
                <p className="font-display font-bold text-base text-white mt-0.5">{asset.recommendedAction}</p>
              </div>
              <div className="sm:text-right font-mono">
                <span className="text-[10px] text-zinc-400 uppercase">Estimated Budget</span>
                <p className="font-bold text-xl text-lime">{formatINRFull(asset.estimatedRepairCost)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
              <div>
                <span className="text-zinc-400 font-mono text-[10px] uppercase">Why CivicX Recommends Immediate Action:</span>
                <p className="mt-1 leading-relaxed text-zinc-200">{simulation.scenarios.repairNow.rationale}</p>
              </div>
              <div>
                <span className="text-zinc-400 font-mono text-[10px] uppercase">Delay Penalty if Deferred by 6 Months:</span>
                <p className="mt-1 leading-relaxed text-red-300">{simulation.scenarios.delaySixMonths.rationale}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Official Sign-off Box */}
        <div className="pt-8 border-t border-zinc-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div>
            <p className="text-[10px] uppercase text-zinc-400">Prepared By</p>
            <p className="font-bold text-zinc-800 mt-4 border-b border-zinc-300 pb-1">CivicX Decision Engine</p>
            <p className="text-[10px] text-zinc-500 mt-1">Autonomous Analytics</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-400">Chief Municipal Engineer</p>
            <p className="font-bold text-zinc-800 mt-4 border-b border-zinc-300 pb-1">Approved for Tender</p>
            <p className="text-[10px] text-zinc-500 mt-1">Coimbatore Corp</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] uppercase text-zinc-400">Audit Stamp</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OFFICIALLY VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
