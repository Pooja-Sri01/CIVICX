import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  Sliders, 
  Clock, 
  AlertTriangle, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Cpu,
  Database,
  Scan,
  AlertOctagon,
  FileCheck2,
  Compass,
  RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';

import { 
  ApiService, 
  InspectionAnalysisResult, 
  AssetInspectionDetail, 
  RiskExplanationDetail 
} from '../services/api';
import { Asset, MaintenanceLog } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { InspectionEvidence } from '../components/common/InspectionEvidence';
import { ExplainableRiskCard } from '../components/common/ExplainableRiskCard';
import { AssetDetailSkeleton } from '../components/common/AssetDetailSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { AssetDecisionChain } from '../components/common/AssetDecisionChain';
import { DecisionAuditTrail } from '../components/common/DecisionAuditTrail';
import { formatINR } from '../utils/formatters';

export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [inspectionDetail, setInspectionDetail] = useState<AssetInspectionDetail | null>(null);
  const [riskExplanation, setRiskExplanation] = useState<RiskExplanationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadAssetIntelligence = async () => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    setError(null);

    try {
      const [assetData, assetsList] = await Promise.all([
        ApiService.getAssetById(id),
        ApiService.getPriorities(),
      ]);

      if (!assetData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setAsset(assetData);
      setAllAssets(assetsList);

      const [mLogs, inspDetail, riskExp] = await Promise.all([
        ApiService.getAssetMaintenance(assetData.id),
        ApiService.getAssetInspection(assetData.id),
        ApiService.getAssetRiskExplanation(assetData.id),
      ]);

      setMaintenance(mLogs.length > 0 ? mLogs : assetData.maintenanceHistory || []);
      setInspectionDetail(inspDetail);
      setRiskExplanation(riskExp);
    } catch (err) {
      console.error('Failed to load asset intelligence', err);
      setError('Unable to retrieve inspection and explainable risk analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssetIntelligence();
  }, [id]);

  if (loading) {
    return <AssetDetailSkeleton />;
  }

  if (notFound || !asset) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl border border-zinc-200 bg-white text-center space-y-4 shadow-elevated">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display font-bold text-lg text-civic-dark">
            ASSET NOT FOUND
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            CivicX could not locate asset identifier '{id}' in the municipal database.
          </p>
        </div>
        <button
          onClick={() => navigate('/map')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-subtle font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-lime" />
          <span>Return to Risk Map</span>
        </button>
      </div>
    );
  }

  if (error && !inspectionDetail) {
    return (
      <ErrorState 
        title="INSPECTION ANALYSIS UNAVAILABLE"
        message={error}
        onRetry={loadAssetIntelligence}
      />
    );
  }

  const currentIndex = allAssets.findIndex((a) => a.id === asset.id || a.assetId === asset.assetId);
  const prevAsset = currentIndex > 0 ? allAssets[currentIndex - 1] : null;
  const nextAsset = currentIndex >= 0 && currentIndex < allAssets.length - 1 ? allAssets[currentIndex + 1] : null;

  const condRating = inspectionDetail?.condition_rating || 
    (asset.conditionScore >= 80 ? 'GOOD' : asset.conditionScore >= 60 ? 'FAIR' : asset.conditionScore >= 40 ? 'POOR' : 'CRITICAL');

  const deteriorationSignal = inspectionDetail?.deterioration_signal || 
    (maintenance.length > 0 ? 'Deteriorating' : 'INSUFFICIENT HISTORY');

  const deteriorationReason = inspectionDetail?.deterioration_reason || 
    (maintenance.length > 0 
      ? `Condition deficit observed vs prior post-maintenance benchmark.`
      : `No prior maintenance records logged in municipal database for historical trend analysis.`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Stepper Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-200 text-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 font-bold text-zinc-600 hover:text-civic-dark transition-colors font-mono"
          >
            <Compass className="w-3.5 h-3.5 text-zinc-500" />
            <span>COMMAND CENTER</span>
          </Link>
          <span className="text-zinc-300">•</span>
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 font-bold text-zinc-600 hover:text-civic-dark transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RISK MAP</span>
          </Link>
          <span className="text-zinc-300">•</span>
          <Link
            to="/priorities"
            className="inline-flex items-center gap-1.5 font-bold text-zinc-600 hover:text-civic-dark transition-colors font-mono"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PRIORITY QUEUE</span>
          </Link>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-2">
          {prevAsset && (
            <button
              onClick={() => navigate(`/assets/${prevAsset.id}`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-mono font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>#{prevAsset.priorityRank} {prevAsset.assetId}</span>
            </button>
          )}
          {nextAsset && (
            <button
              onClick={() => navigate(`/assets/${nextAsset.id}`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-mono font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <span>#{nextAsset.priorityRank} {nextAsset.assetId}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Asset Header & Condition Instrument */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-subtle space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-civic-dark text-lime font-mono font-bold text-xs flex items-center justify-center">
                #{asset.priorityRank < 10 ? `0${asset.priorityRank}` : asset.priorityRank}
              </span>
              <span className="font-mono text-xs font-bold text-zinc-500 uppercase">
                {asset.assetId} • {asset.type}
              </span>
              <RiskBadge level={asset.riskLevel} score={asset.riskScore} />
              
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                condRating === 'GOOD' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                condRating === 'FAIR' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                condRating === 'POOR' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                'bg-red-100 text-red-800 border border-red-300'
              }`}>
                Condition: {condRating} ({asset.conditionScore}%)
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-civic-dark tracking-tight">
              {asset.name}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 flex items-center gap-1.5 font-mono">
              <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span>{asset.location} {asset.ward ? `• ${asset.ward}` : ''} {asset.zone ? `(${asset.zone})` : ''}</span>
            </p>
          </div>

          {/* Calibrated Risk & Condition Instrument Gauge */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Condition Gauge */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 min-w-[170px] space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                CONDITION INTEGRITY
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-3xl text-zinc-900">
                  {asset.conditionScore}
                </span>
                <span className="text-zinc-400 font-mono text-xs">/ 100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    condRating === 'GOOD' ? 'bg-emerald-500' :
                    condRating === 'FAIR' ? 'bg-amber-500' :
                    condRating === 'POOR' ? 'bg-orange-500' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${asset.conditionScore}%` }}
                />
              </div>
            </div>

            {/* Composite Risk Gauge */}
            <div className="p-4 rounded-2xl bg-zinc-900 text-white min-w-[190px] space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400 uppercase font-bold">COMPOSITE RISK</span>
                <span className="text-lime font-bold">{asset.riskLevel}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-3xl text-white">
                  {asset.riskScore}
                </span>
                <span className="text-zinc-400 font-mono text-xs">/ 100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${asset.riskScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5. Decision Chain — the central intelligence differentiator */}
      <AssetDecisionChain
        assetId={asset.id}
        className=""
      />

      {/* 3. Core AI Inspection Workspace (Observed Data vs AI Vision Analysis + Explainable Risk) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: AI Inspection Evidence (Ground Truth + Computer Vision) */}
        <div className="lg:col-span-7 space-y-6">
          <InspectionEvidence
            imageSrc={asset.image}
            bboxes={asset.detectedBBoxes}
            damageType={asset.damageType}
            conditionScore={asset.conditionScore}
            observedEvidence={inspectionDetail?.observed_evidence}
            aiAnalysis={inspectionDetail?.ai_vision}
          />
        </div>

        {/* Right Column: Explainable Risk Decomposition + Audit Trail */}
        <div className="lg:col-span-5 space-y-6">
          {riskExplanation ? (
            <ExplainableRiskCard 
              explanation={riskExplanation} 
              assetName={asset.name}
            />
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-zinc-200 text-center text-xs text-zinc-500 font-mono">
              Loading explainable risk breakdown...
            </div>
          )}

          {/* Decision Audit Trail */}
          <DecisionAuditTrail
            assetId={asset.assetId}
            riskScore={riskExplanation?.risk_score ?? asset.riskScore}
            riskLevel={riskExplanation?.risk_level ?? asset.riskLevel.toUpperCase()}
            priorityRank={asset.priorityRank}
            recommendedAction={asset.recommendedAction}
            estimatedCost={asset.estimatedRepairCost}
            lastInspection={asset.lastInspection}
          />

          {/* Deterioration Trajectory Signal Card */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-subtle space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="text-xs font-mono uppercase font-bold text-zinc-500">
                HISTORICAL TRAJECTORY SIGNAL
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                deteriorationSignal === 'Improving' ? 'bg-emerald-100 text-emerald-800' :
                deteriorationSignal === 'Stable' ? 'bg-zinc-100 text-zinc-800' :
                deteriorationSignal === 'Deteriorating' ? 'bg-red-100 text-red-800' :
                'bg-zinc-100 text-zinc-600'
              }`}>
                {deteriorationSignal.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
              {deteriorationReason}
            </p>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] font-mono text-zinc-600 space-y-1">
              <span className="text-[10px] uppercase text-zinc-400 font-bold block">Next Inspection Protocol:</span>
              <p className="text-zinc-800 font-medium font-sans">
                {inspectionDetail?.next_inspection_recommendation || 'Priority non-destructive survey recommended.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Full-Width Section: DETECTED ISSUES TABLE */}
      <div className="rounded-3xl bg-white border border-zinc-200 shadow-subtle overflow-hidden">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-civic-dark" />
            <h3 className="font-display font-extrabold text-base text-civic-dark">
              DETECTED ISSUES & STRUCTURAL DEFECTS
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 font-bold">
            {inspectionDetail?.detected_issues.length || 1} Issue(s) Identified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4">Identified Issue</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Observed Evidence</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Structural Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 bg-white">
              {(inspectionDetail?.detected_issues || []).map((issue, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-civic-dark">
                    {issue.issue}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      issue.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      issue.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-600 font-mono text-[11px]">
                    {issue.evidence}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-900 font-bold">
                    {issue.confidence ? `${Math.round(issue.confidence * 100)}%` : 'Analytical'}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-700 font-medium">
                    {issue.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Inspection Timeline & Historical Records */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-600" />
            <h3 className="font-display font-bold text-base text-civic-dark">
              Inspection & Intervention Timeline
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 font-bold">
            {maintenance.length} Verified Records
          </span>
        </div>

        {maintenance.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-xs text-zinc-500 font-mono space-y-1">
            <p className="font-bold text-zinc-700">NO HISTORICAL INTERVENTION RECORDS LOGGED</p>
            <p className="text-[11px] text-zinc-400">Baseline telemetry established on first municipal inspection cycle ({asset.lastInspection || '2026-08-14'}).</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
            {maintenance.map((log, idx) => (
              <div key={idx} className="relative space-y-1">
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-civic-dark border-2 border-white" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div>
                    <span className="font-mono text-[10px] text-zinc-400 font-bold block">{log.date}</span>
                    <span className="font-bold text-civic-dark">{log.action}</span>
                    <span className="text-[11px] text-zinc-500 font-mono ml-2">({log.vendor})</span>
                  </div>
                  <div className="font-mono font-bold text-zinc-900 text-right">
                    {formatINR(log.cost)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. CIVICX ACTION & DECISION RECOMMENDATION */}
      <div className="p-6 rounded-3xl bg-white border-2 border-civic-dark shadow-elevated space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
            RECOMMENDED INTERVENTION & NEXT STEPS
          </span>
          <span className="bg-lime text-civic-dark text-[10px] font-bold px-2 py-0.5 rounded font-mono">
            ENGINEERING RECOMMENDATION
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h4 className="font-display font-extrabold text-lg text-civic-dark">
              {asset.recommendedAction}
            </h4>
            <p className="text-xs text-zinc-600 mt-1 font-mono">
              Estimated Budget Impact: <span className="font-bold text-zinc-900">{formatINR(asset.estimatedRepairCost)}</span>
            </p>
          </div>
        </div>

        {/* Connected Navigation Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => navigate(`/simulation?asset=${asset.id}`)}
            className="py-2.5 px-4 rounded-xl bg-civic-dark text-white text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-subtle font-mono"
          >
            <span>SIMULATE DECISION (CITY TIME MACHINE)</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime" />
          </button>

          <button
            onClick={() => navigate(`/budget?asset=${asset.id}`)}
            className="py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-bold transition-colors flex items-center justify-center gap-2 font-mono"
          >
            <span>EVALUATE IN BUDGET OPTIMIZER</span>
            <Sliders className="w-3.5 h-3.5 text-zinc-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

