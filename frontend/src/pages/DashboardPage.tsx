import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building, 
  AlertOctagon, 
  AlertTriangle, 
  Wallet, 
  ArrowRight, 
  MapPin, 
  Sliders,
  Clock,
  Layers,
  CheckCircle2,
  TrendingUp,
  Activity,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

import { ApiService, RiskDistributionData } from '../services/api';
import { Asset, DashboardSummary } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { DashboardSkeleton } from '../components/common/DashboardSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { formatINR } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [riskDist, setRiskDist] = useState<RiskDistributionData | null>(null);
  const [priorities, setPriorities] = useState<Asset[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, distData, prioData] = await Promise.all([
        ApiService.getDashboardSummary(),
        ApiService.getRiskDistribution(),
        ApiService.getPriorities(),
      ]);
      setSummary(sumData);
      setRiskDist(distData);
      setPriorities(prioData);
      if (prioData.length > 0) {
        setSelectedPriority(prioData[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError('Could not connect to the CivicX intelligence service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !summary) {
    return <ErrorState message={error || undefined} onRetry={loadDashboardData} />;
  }

  const criticalPct = Math.round((summary.criticalAssets / summary.totalAssets) * 100);
  const highPct = Math.round((summary.highRiskAssets / summary.totalAssets) * 100);
  const mediumPct = Math.round((summary.mediumRiskAssets / summary.totalAssets) * 100);
  const lowPct = Math.round((summary.lowRiskAssets / summary.totalAssets) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Operational Status & System Diagnostic Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4 text-zinc-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-civic-dark">DATA STREAM:</span>
            <span>ACTIVE (COIMBATORE)</span>
          </div>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-civic-dark">RISK ENGINE:</span>
            <span>6-FACTOR MCDA READY</span>
          </div>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lime-dark" />
            <span className="font-bold text-civic-dark">SIMULATION:</span>
            <span>3/6/12M HORIZONS ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-zinc-200/80 text-zinc-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            DEMO ENVIRONMENT
          </span>
        </div>
      </div>

      {/* 2. Editorial Headline & Decision Summary */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-civic-dark tracking-tight">
            {summary.criticalAssets} CRITICAL ASSETS REQUIRE INTERVENTION
          </h1>
        </div>
        <p className="text-sm text-zinc-600 max-w-3xl leading-relaxed">
          Coimbatore Municipal Inventory: <span className="font-bold text-civic-dark font-mono">{summary.totalAssets} monitored assets</span> across 5 administrative zones. Immediate capital intervention of <span className="font-bold text-civic-dark font-mono">{formatINR(summary.activeRepairPlanCost)}</span> identified against an active fiscal envelope of <span className="font-bold text-civic-dark font-mono">{formatINR(summary.availableBudget)}</span>.
        </p>
      </div>

      {/* 3. 3-Column Instrumentation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Col 1: Calibrated Horizontal Risk Spectrum */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-zinc-200 shadow-subtle space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                Citywide Risk Spectrum
              </span>
              <span className="text-xs font-mono font-bold text-civic-dark">
                {summary.totalAssets} Units
              </span>
            </div>

            {/* Calibrated Risk Instrument Bands */}
            <div className="space-y-3 mt-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-red-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    CRITICAL (76-100)
                  </span>
                  <span className="text-zinc-900 font-bold">{summary.criticalAssets} ({criticalPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${criticalPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-orange-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-600" />
                    HIGH RISK (51-75)
                  </span>
                  <span className="text-zinc-900 font-bold">{summary.highRiskAssets} ({highPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${highPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-amber-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    MEDIUM (26-50)
                  </span>
                  <span className="text-zinc-900 font-bold">{summary.mediumRiskAssets} ({mediumPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${mediumPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    LOW / STABLE (0-25)
                  </span>
                  <span className="text-zinc-900 font-bold">{summary.lowRiskAssets} ({lowPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lowPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500">
            {riskDist?.historical_trend_summary || '28.4% of municipal network exhibits severe subgrade water infiltration.'}
          </div>
        </div>

        {/* Col 2: Priority #1 Intervention Spotlight */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border-2 border-civic-dark shadow-subtle space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-civic-dark text-lime font-mono font-bold text-[11px] flex items-center justify-center">
                  #1
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">
                  TOP PRIORITY INTERVENTION SPOTLIGHT
                </span>
              </div>
              <RiskBadge level={priorities[0]?.riskLevel || 'Critical'} score={priorities[0]?.riskScore || 93} size="sm" />
            </div>

            <div className="mt-2 space-y-1">
              <h3 className="font-display font-extrabold text-xl text-civic-dark">
                {priorities[0]?.name || 'Gandhipuram Underpass Inbound Arterial'}
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                {priorities[0]?.assetId} • {priorities[0]?.location}
              </p>
            </div>

            {/* Rationale Quote */}
            <p className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200/70 mt-3 leading-relaxed font-medium">
              {priorities[0]?.explainability?.whyRank || 'Ranked #1 due to critical arterial traffic density combined with localized pavement fatigue and high preventative ROI.'}
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-900">
              Est. Cost: {formatINR(priorities[0]?.estimatedRepairCost || 1850000)}
            </span>
            <Link
              to={`/assets/${priorities[0]?.id || '1'}`}
              className="px-3 py-1.5 rounded-lg bg-lime text-civic-dark text-xs font-bold hover:bg-lime-hover transition-colors flex items-center gap-1 font-mono shadow-sm"
            >
              <span>INSPECT EVIDENCE</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Col 3: Capital & Decision Actions */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-zinc-900 text-white shadow-subtle flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
              CAPITAL ENVELOPE (FY26)
            </span>

            <div>
              <span className="font-display font-black text-2xl text-white">
                {formatINR(summary.availableBudget)}
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Cap utilization rate: <span className="text-lime font-mono font-bold">74% Optimal</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
              <span className="text-[10px] text-zinc-400 block font-mono">ESTIMATED REPAIR BURDEN</span>
              <span className="font-bold text-white font-mono">{formatINR(summary.activeRepairPlanCost)}</span>
            </div>
          </div>

          {/* Direct Pipeline Navigation */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <Link
              to="/budget"
              className="w-full py-2 px-3 rounded-xl bg-lime text-civic-dark text-xs font-bold hover:bg-lime-hover transition-colors flex items-center justify-center gap-1.5 font-mono shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>OPTIMIZE BUDGET</span>
            </Link>

            <Link
              to="/map"
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 font-mono"
            >
              <MapPin className="w-3.5 h-3.5 text-lime" />
              <span>EXPLORE RISK MAP</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Operational Priority Queue (Full-Width Data Surface) */}
      <div className="rounded-2xl bg-white border border-zinc-200 shadow-subtle overflow-hidden">
        <div className="p-4 bg-white border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-extrabold text-base text-civic-dark">
              OPERATIONAL PRIORITY QUEUE
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              GET /api/priorities — Multi-Factor ROI-Ranked Intervention Queue
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/priorities"
              className="text-xs font-bold text-civic-dark hover:text-zinc-600 inline-flex items-center gap-1 font-mono"
            >
              <span>VIEW FULL QUEUE ({priorities.length})</span>
              <ArrowRight className="w-3.5 h-3.5 text-lime-dark" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">Asset ID</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Risk</th>
                <th className="py-2.5 px-4">Criticality</th>
                <th className="py-2.5 px-4">Usage</th>
                <th className="py-2.5 px-4">Est. Cost</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 bg-white">
              {priorities.slice(0, 6).map((asset) => {
                const isSelected = selectedPriority?.id === asset.id;
                return (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedPriority(asset)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-zinc-100 font-medium'
                        : 'hover:bg-zinc-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                          asset.priorityRank === 1
                            ? 'bg-civic-dark text-lime font-black'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        #{asset.priorityRank < 10 ? `0${asset.priorityRank}` : asset.priorityRank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-civic-dark">{asset.assetId}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{asset.type}</p>
                    </td>
                    <td className="py-3 px-4 max-w-[180px] truncate text-zinc-700 font-medium">
                      {asset.location}
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={asset.riskLevel} score={asset.riskScore} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-700">
                      {asset.criticality}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      {asset.usageScore}/100
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                      {formatINR(asset.estimatedRepairCost)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/assets/${asset.id}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[11px] font-bold text-civic-dark transition-colors inline-flex items-center gap-1 font-mono"
                      >
                        <span>INSPECT</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
