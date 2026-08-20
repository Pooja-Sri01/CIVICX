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
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';

import { ApiService, InspectionAnalysisResult } from '../services/api';
import { Asset, MaintenanceLog } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { InspectionEvidence } from '../components/common/InspectionEvidence';
import { AssetDetailSkeleton } from '../components/common/AssetDetailSkeleton';
import { formatINR } from '../utils/formatters';

export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<InspectionAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadAssetIntelligence = async () => {
      if (!id) return;
      setLoading(true);
      setNotFound(false);

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

        const [mLogs, aiResult] = await Promise.all([
          ApiService.getAssetMaintenance(assetData.id),
          ApiService.analyzeInspection(assetData.assetId, assetData.image),
        ]);

        setMaintenance(mLogs.length > 0 ? mLogs : assetData.maintenanceHistory);
        setAiAnalysis(aiResult);
      } catch (err) {
        console.error('Failed to load asset intelligence', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

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
          <p className="text-xs text-zinc-500">
            CivicX could not locate this infrastructure asset identifier in the municipal database.
          </p>
        </div>
        <button
          onClick={() => navigate('/map')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-subtle"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-lime" />
          <span>Return to Risk Map</span>
        </button>
      </div>
    );
  }

  const currentIndex = allAssets.findIndex((a) => a.id === asset.id || a.assetId === asset.assetId);
  const prevAsset = currentIndex > 0 ? allAssets[currentIndex - 1] : null;
  const nextAsset = currentIndex >= 0 && currentIndex < allAssets.length - 1 ? allAssets[currentIndex + 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Stepper Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-200 text-xs">
        <div className="flex items-center gap-3">
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

      {/* 2. Editorial Header & Risk Meter */}
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
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-civic-dark tracking-tight">
              {asset.name}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span>{asset.location} {asset.ward ? `• ${asset.ward}` : ''} {asset.zone ? `(${asset.zone})` : ''}</span>
            </p>
          </div>

          {/* Calibrated Risk Instrument Gauge */}
          <div className="p-5 rounded-2xl bg-zinc-900 text-white min-w-[240px] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400 uppercase font-bold">COMPOSITE RISK</span>
              <span className="text-lime font-bold">{asset.riskLevel}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-4xl text-white">
                {asset.riskScore}
              </span>
              <span className="text-zinc-400 font-mono text-sm">/ 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${asset.riskScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Investigation Grid (AI Vision Evidence + Sequential Explainability + Vertical Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Inspection Evidence & Vertical Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <InspectionEvidence
            imageSrc={asset.image}
            bboxes={asset.detectedBBoxes}
            damageType={asset.damageType}
            conditionScore={asset.conditionScore}
            aiAnalysis={aiAnalysis}
          />

          {/* Elegant Vertical Maintenance Timeline */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-600" />
                <h3 className="font-display font-bold text-base text-civic-dark">
                  Intervention & Inspection Timeline
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 font-bold">
                {maintenance.length} Events Verified
              </span>
            </div>

            {maintenance.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-4">
                Limited historical intervention records available for this asset.
              </p>
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
        </div>

        {/* Right Column: Sequential Factor Decomposition & Decision Recommendation */}
        <div className="lg:col-span-5 space-y-6">
          {/* WHY IS THIS ASSET HIGH RISK? (Factor Decomposition) */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-display font-extrabold text-base text-civic-dark">
                WHY IS THIS ASSET HIGH RISK?
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                MCDA Decomposed
              </span>
            </div>

            <p className="text-xs text-zinc-700 leading-relaxed font-medium bg-zinc-50 p-4 rounded-2xl border border-zinc-200/70">
              {asset.explainability?.summary ||
                `Asset combines significant condition deficit (${asset.conditionScore}%) with ${asset.criticality.toLowerCase()} strategic corridor importance and high daily vehicle usage.`}
            </p>

            {/* Sequential Factor Additions */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                Factor Contribution Additions
              </span>
              <div className="space-y-2">
                {asset.explainability?.topFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-zinc-900 font-bold font-sans block">{factor.factor}</span>
                      <span className="text-[10px] text-zinc-500 font-sans">{factor.description}</span>
                    </div>
                    <span className="font-bold text-red-600 text-xs ml-2">
                      +{factor.scoreContribution}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CIVICX RECOMMENDATION BANNER */}
          <div className="p-6 rounded-3xl bg-white border-2 border-civic-dark shadow-elevated space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                CIVICX RECOMMENDATION
              </span>
              <span className="bg-lime text-civic-dark text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                IMMEDIATE INTERVENTION
              </span>
            </div>

            <div>
              <h4 className="font-display font-extrabold text-lg text-civic-dark">
                {asset.recommendedAction}
              </h4>
              <p className="text-xs text-zinc-600 mt-1 font-mono">
                Estimated Cost: <span className="font-bold text-zinc-900">{formatINR(asset.estimatedRepairCost)}</span>
              </p>
            </div>

            {/* Connected Decision Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate(`/simulation?asset=${asset.id}`)}
                className="w-full py-2.5 px-4 rounded-xl bg-civic-dark text-white text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-subtle font-mono"
              >
                <span>SIMULATE DECISION (CITY TIME MACHINE)</span>
                <ArrowRight className="w-3.5 h-3.5 text-lime" />
              </button>

              <button
                onClick={() => navigate(`/budget?asset=${asset.id}`)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-civic-dark text-xs font-bold transition-colors flex items-center justify-center gap-2 font-mono"
              >
                <span>EVALUATE IN BUDGET OPTIMIZER</span>
                <Sliders className="w-3.5 h-3.5 text-zinc-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
