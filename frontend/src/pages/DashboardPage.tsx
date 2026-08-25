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
  ChevronRight,
  Map as MapIcon,
  Zap,
  RotateCcw,
  BarChart3,
  Compass,
  FileText,
  Database,
  ListTodo
} from 'lucide-react';
import { motion } from 'motion/react';

import { ApiService, RiskDistributionData } from '../services/api';
import { Asset, DashboardSummary, AIDecisionInsightsResponse, CivicReportStats, PredictiveSummary, CityRecommendationsSummary, DecisionRecommendation } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { DashboardSkeleton } from '../components/common/DashboardSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { AIDecisionInsightsCard } from '../components/copilot/AIDecisionInsightsCard';
import { AssetDecisionChain } from '../components/common/AssetDecisionChain';
import { AttentionVsMonitorPanel } from '../components/dashboard/AttentionVsMonitorPanel';
import { BudgetIntelligenceGapCard } from '../components/dashboard/BudgetIntelligenceGapCard';
import { CivicDecisionChainRibbon } from '../components/common/CivicDecisionChainRibbon';
import { formatINR } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [riskDist, setRiskDist] = useState<RiskDistributionData | null>(null);
  const [priorities, setPriorities] = useState<Asset[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<Asset | null>(null);
  const [insights, setInsights] = useState<AIDecisionInsightsResponse | null>(null);
  const [civicStats, setCivicStats] = useState<CivicReportStats | null>(null);
  const [predictiveSummary, setPredictiveSummary] = useState<PredictiveSummary | null>(null);
  const [recommendationsSummary, setRecommendationsSummary] = useState<CityRecommendationsSummary | null>(null);
  const [dataHealth, setDataHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, distData, prioData, insData, statsData, predData, recData] = await Promise.all([
        ApiService.getDashboardSummary(),
        ApiService.getRiskDistribution(),
        ApiService.getPriorities(),
        ApiService.getAIDecisionInsights(),
        ApiService.getCivicReportStats(),
        ApiService.getPredictiveSummary(),
        ApiService.getCityRecommendationsSummary()
      ]);
      setSummary(sumData);
      setRiskDist(distData);
      setPriorities(prioData);
      setInsights(insData);
      setCivicStats(statsData);
      setPredictiveSummary(predData);
      setRecommendationsSummary(recData);
      if (prioData.length > 0) {
        setSelectedPriority(prioData[0]);
      }
      // Load data health asynchronously (non-blocking)
      ApiService.getDataHealth().then(setDataHealth).catch(() => {});
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError('Unable to retrieve the latest infrastructure analysis.');
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
    return (
      <ErrorState 
        title="CIVICX DATA UNAVAILABLE"
        message={error || 'Unable to retrieve the latest infrastructure analysis.'} 
        onRetry={loadDashboardData} 
      />
    );
  }

  const total = Math.max(1, summary.totalAssets);
  const criticalPct = Math.round((summary.criticalAssets / total) * 100);
  const highPct = Math.round((summary.highRiskAssets / total) * 100);
  const mediumPct = Math.round((summary.mediumRiskAssets / total) * 100);
  const lowPct = Math.round((summary.lowRiskAssets / total) * 100);

  const urgentAttentionCount = summary.criticalAssets + summary.highRiskAssets;
  const activeAsset = selectedPriority || priorities[0] || null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
    >
      {/* ============================================================ */}
      {/* SECTION A: Header / System Context                           */}
      {/* ============================================================ */}
      <motion.div variants={itemVariants} className="space-y-3">
        {/* Diagnostic Telemetry Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-zinc-600">
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
              <span>ACTIVE HORIZONS</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <span className="text-[11px] font-sans text-zinc-500 hidden md:inline">
                Operator: <span className="font-bold text-civic-dark">{user.name}</span>
              </span>
            )}
            <span className="bg-zinc-200/80 text-zinc-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              DEMO ENVIRONMENT
            </span>
          </div>
        </div>

        {/* System Title & Supporting Context */}
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider">
                CIVICX
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-xs font-mono text-lime-dark font-bold">
                Infrastructure Intelligence
              </span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-civic-dark tracking-tight mt-0.5">
              COMMAND CENTER
            </h1>
          </div>

          <p className="text-xs font-mono text-zinc-500">
            Current Analysis / Coimbatore Municipal Jurisdiction (TN-India)
          </p>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* SECTION B: Infrastructure Overview (High-Density Telemetry)  */}
      {/* ============================================================ */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Assets */}
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-subtle flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            TOTAL ASSETS
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display font-black text-2xl sm:text-3xl text-civic-dark">
              {summary.totalAssets}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">units</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">100% Citywide Monitored</span>
        </div>

        {/* Critical Risk (Strong Visual Hierarchy) */}
        <div className="p-3.5 rounded-xl bg-red-50/80 border-2 border-red-500 shadow-subtle flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              CRITICAL
            </span>
            <span className="text-[10px] font-mono font-bold text-red-600 bg-red-100 px-1.5 py-0.2 rounded">
              {criticalPct}%
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display font-black text-2xl sm:text-3xl text-red-600">
              {summary.criticalAssets}
            </span>
            <span className="text-[11px] text-red-500 font-mono">Immediate Action</span>
          </div>
          <span className="text-[10px] text-red-700 font-mono mt-1 font-semibold">Priority #1-#19 Failure Risk</span>
        </div>

        {/* High Risk (Strong Visual Hierarchy) */}
        <div className="p-3.5 rounded-xl bg-orange-50/80 border-2 border-orange-400 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              HIGH RISK
            </span>
            <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded">
              {highPct}%
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display font-black text-2xl sm:text-3xl text-orange-600">
              {summary.highRiskAssets}
            </span>
            <span className="text-[11px] text-orange-500 font-mono">Accelerating</span>
          </div>
          <span className="text-[10px] text-orange-700 font-mono mt-1 font-semibold">Pre-monsoon Vulnerable</span>
        </div>

        {/* Medium Risk */}
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              MEDIUM RISK
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {mediumPct}%
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display font-black text-2xl sm:text-3xl text-amber-600">
              {summary.mediumRiskAssets}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">Monitored</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">Routine Inspection Cycle</span>
        </div>

        {/* Low Risk */}
        <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-subtle flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              LOW RISK
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {lowPct}%
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display font-black text-2xl sm:text-3xl text-emerald-600">
              {summary.lowRiskAssets}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">Stable</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">Standard Lifecycle</span>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* SECTION B.2: AI DECISION INSIGHTS + PREDICTIVE OUTLOOK       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {insights && (
          <motion.div variants={itemVariants} className={`${predictiveSummary ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
            <AIDecisionInsightsCard insightsData={insights} />
          </motion.div>
        )}

        {predictiveSummary && (
          <motion.div variants={itemVariants} className="lg:col-span-4 p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-3 font-mono shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                  PREDICTIVE OUTLOOK
                </span>
              </div>
              <span className="bg-lime text-civic-dark text-[9px] font-bold px-1.5 py-0.2 rounded">
                PROMPT 8
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-zinc-400 block font-bold uppercase">Accelerating</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-xl text-red-400">
                    {predictiveSummary.accelerating_count}
                  </span>
                  <span className="text-[10px] text-zinc-400">assets</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-zinc-400 block font-bold uppercase">Critical &lt;12M</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-xl text-rose-400">
                    {predictiveSummary.critical_under_12m}
                  </span>
                  <span className="text-[10px] text-zinc-400">assets</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-zinc-400 block font-bold uppercase">Maint &lt;6M</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-xl text-amber-400">
                    {predictiveSummary.maintenance_under_6m}
                  </span>
                  <span className="text-[10px] text-zinc-400">urgent</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-zinc-400 block font-bold uppercase">Low Baseline</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-display font-black text-xl text-zinc-300">
                    {predictiveSummary.low_data_confidence_count}
                  </span>
                  <span className="text-[10px] text-zinc-400">survey</span>
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-900">
              <span>Avg 12M Loss: <strong>-{predictiveSummary.avg_projected_loss_12m} pts</strong></span>
              <Link to="/priorities" className="text-lime hover:underline font-bold flex items-center gap-1">
                Predictive Queue →
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECTION B.3: ATTENTION REQUIRED VS WHAT CAN WAIT (PROMPT 10) */}
      {/* ============================================================ */}
      {recommendationsSummary && (
        <motion.div variants={itemVariants}>
          <AttentionVsMonitorPanel
            attentionList={recommendationsSummary.attention_required}
            monitorList={recommendationsSummary.can_wait_monitor}
            onSelectAction={(rec) => navigate(`/assets/${rec.asset_id}#digital-twin`)}
          />
        </motion.div>
      )}

      {/* ============================================================ */}
      {/* SECTION B.4: BUDGET GAP ANALYSIS + DATA HEALTH              */}
      {/* ============================================================ */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Budget Intelligence Gap Card */}
        <div className="lg:col-span-7">
          <BudgetIntelligenceGapCard
            availableBudget={50000000.0}
            requiredBudget={recommendationsSummary?.total_recommended_budget || 77176000.0}
            unfundedGap={recommendationsSummary?.unfunded_priority_budget || 27176000.0}
          />
        </div>

        {/* Data Health Mini-Panel */}
        {dataHealth && (
          <div className="lg:col-span-5 p-5 rounded-3xl bg-white border border-zinc-200 space-y-3 shadow-subtle">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
              <Database className="w-4 h-4 text-zinc-500" />
              <h3 className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-widest">DATA HEALTH</h3>
              <span className={`ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                dataHealth.health_score >= 70 ? 'bg-emerald-50 text-emerald-700' :
                dataHealth.health_score >= 40 ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-700'
              }`}>
                {dataHealth.health_score.toFixed(0)}% QUALITY
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Recent (≤30d)', value: dataHealth.recent_inspections, color: 'text-emerald-600' },
                { label: 'Moderate (≤90d)', value: dataHealth.moderate_age_inspections, color: 'text-amber-600' },
                { label: 'Outdated (>90d)', value: dataHealth.outdated_inspections, color: 'text-orange-600' },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-50 rounded-xl p-2 text-center">
                  <div className={`text-sm font-bold font-mono ${item.color}`}>{item.value}</div>
                  <div className="text-[9px] text-zinc-500">{item.label}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 font-sans leading-snug">{dataHealth.summary}</p>
          </div>
        )}
      </motion.div>

      {/* ============================================================ */}
      {/* SECTION C: 3-Column Instrumentation Matrix                     */}
      {/* 1. Risk Intelligence Spectrum (lg:col-4)                     */}
      {/* 2. Top Risk Asset Spotlight (lg:col-5)                       */}
      {/* 3. Decision Snapshot & Action Panel (lg:col-3)               */}
      {/* ============================================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ------------------------------------------------------------ */}
        {/* Col 1: RISK INTELLIGENCE                                     */}
        {/* ------------------------------------------------------------ */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 p-5 rounded-2xl bg-white border border-zinc-200 shadow-subtle space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-civic-dark" />
                <h3 className="text-xs font-mono uppercase font-bold text-civic-dark">
                  RISK INTELLIGENCE
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-500">
                {summary.totalAssets} Monitored
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 mt-2">
              Citywide risk spectrum based on multi-criteria structural telemetry:
            </p>

            {/* Ranked Horizontal Risk Spectrum Bands */}
            <div className="space-y-3 mt-3">
              {/* Critical Band */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-red-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    CRITICAL (76-100)
                  </span>
                  <span className="text-zinc-900 font-bold">{summary.criticalAssets} ({criticalPct}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${criticalPct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full bg-red-600 rounded-full" 
                  />
                </div>
              </div>

              {/* High Band */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-orange-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-600" />
                    HIGH RISK (51-75)
                  </span>
                  <span className="text-zinc-900 font-bold">{summary.highRiskAssets} ({highPct}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${highPct}%` }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="h-full bg-orange-500 rounded-full" 
                  />
                </div>
              </div>

              {/* Medium Band */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-amber-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    MEDIUM (26-50)
                  </span>
                  <span className="text-zinc-900 font-bold">{summary.mediumRiskAssets} ({mediumPct}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${mediumPct}%` }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="h-full bg-amber-500 rounded-full" 
                  />
                </div>
              </div>

              {/* Low Band */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    LOW / STABLE (0-25)
                  </span>
                  <span className="text-zinc-900 font-bold">{summary.lowRiskAssets} ({lowPct}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${lowPct}%` }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    className="h-full bg-emerald-500 rounded-full" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Real Backend Trend Summary & Map Quick Link */}
          <div className="pt-3 border-t border-zinc-100 space-y-2">
            <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">
              {riskDist?.historical_trend_summary || 
                `${urgentAttentionCount} assets (${criticalPct + highPct}% of network) require prioritized interventions.`}
            </p>

            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-civic-dark hover:text-zinc-600 font-mono group"
            >
              <span>VIEW RISK MAP</span>
              <ArrowRight className="w-3 h-3 text-lime-dark group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* ------------------------------------------------------------ */}
        {/* Col 2: TOP RISK ASSET SPOTLIGHT & WHY THIS MATTERS           */}
        {/* ------------------------------------------------------------ */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-5 p-5 rounded-2xl bg-white border-2 border-civic-dark shadow-subtle space-y-3.5 flex flex-col justify-between"
        >
          {activeAsset ? (
            <>
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-civic-dark text-lime font-mono font-bold text-[11px] flex items-center justify-center">
                      #{activeAsset.priorityRank < 10 ? `0${activeAsset.priorityRank}` : activeAsset.priorityRank}
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">
                      TOP RISK ASSET SPOTLIGHT
                    </span>
                  </div>
                  <RiskBadge level={activeAsset.riskLevel} score={activeAsset.riskScore} size="sm" />
                </div>

                {/* Asset Header Info */}
                <div className="mt-2.5 space-y-1">
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-civic-dark leading-snug">
                    {activeAsset.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono">
                    <span className="font-bold text-civic-dark">{activeAsset.assetId}</span>
                    <span>•</span>
                    <span>{activeAsset.type}</span>
                    <span>•</span>
                    <span>{activeAsset.location}</span>
                  </div>
                </div>

                {/* Condition & Criticality Snapshot Grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
                    <span className="text-[10px] text-zinc-400 block">CONDITION</span>
                    <span className="font-bold text-zinc-900 text-sm">{activeAsset.conditionScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
                    <span className="text-[10px] text-zinc-400 block">CRITICALITY</span>
                    <span className="font-bold text-zinc-900 text-sm">{activeAsset.criticality}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
                    <span className="text-[10px] text-zinc-400 block">EST. REPAIR</span>
                    <span className="font-bold text-zinc-900 text-sm">{formatINR(activeAsset.estimatedRepairCost)}</span>
                  </div>
                </div>

                {/* WHY THIS MATTERS */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-zinc-500">
                    <ShieldAlert className="w-3 h-3 text-red-600" />
                    <span>WHY THIS MATTERS</span>
                  </div>
                  <p className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200/70 leading-relaxed font-medium">
                    {activeAsset.explainability?.whyRank || 
                      `Ranked #${activeAsset.priorityRank} due to critical arterial traffic load combined with condition deficit (${activeAsset.conditionScore}%) and high preventative ROI.`}
                  </p>

                  {/* Factor decomposition additions if present */}
                  {activeAsset.explainability?.topFactors && (
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {activeAsset.explainability.topFactors.slice(0, 2).map((factor, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-zinc-50 border border-zinc-100 text-[10px] font-mono flex items-center justify-between">
                          <span className="text-zinc-600 truncate">{factor.factor}</span>
                          <span className="font-bold text-red-600">+{factor.scoreContribution}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500">
                  Lifecycle Priority: <span className="font-bold text-zinc-900">Rank #{activeAsset.priorityRank}</span>
                </span>
                <Link
                  to={`/assets/${activeAsset.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-lime text-civic-dark text-xs font-bold hover:bg-lime-hover transition-colors flex items-center gap-1 font-mono shadow-sm"
                >
                  <span>INSPECT ASSET</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500 font-mono">
              Select an asset from the priority queue to inspect risk factors.
            </div>
          )}
        </motion.div>

        {/* ------------------------------------------------------------ */}
        {/* Col 3: DECISION SNAPSHOT & WHAT SHOULD WE DO NEXT?           */}
        {/* ------------------------------------------------------------ */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-3 p-5 rounded-2xl bg-zinc-900 text-white shadow-subtle flex flex-col justify-between space-y-4"
        >
          {/* Decision Snapshot Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                DECISION SNAPSHOT
              </span>
              <span className="text-[10px] font-mono text-lime font-bold">
                FY26 ACTIVE
              </span>
            </div>

            {/* Assets Requiring Immediate Attention */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-zinc-400 block font-mono">ASSETS REQUIRING ATTENTION</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-2xl text-white">
                  {urgentAttentionCount}
                </span>
                <span className="text-[11px] text-red-400 font-mono font-bold">
                  ({summary.criticalAssets} Critical + {summary.highRiskAssets} High)
                </span>
              </div>
            </div>

            {/* Potential Maintenance Cost vs Capital Envelope */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-zinc-400 block font-mono">ESTIMATED REPAIR BURDEN</span>
              <span className="font-display font-black text-xl text-white font-mono">
                {formatINR(summary.activeRepairPlanCost)}
              </span>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Against <span className="text-zinc-200 font-bold font-mono">{formatINR(summary.availableBudget)}</span> capital envelope
              </p>
            </div>
          </div>

          {/* ACTION PANEL: WHAT SHOULD WE DO NEXT? */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
              WHAT SHOULD WE DO NEXT?
            </span>

            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/priorities"
                className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex items-center justify-between font-mono"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-lime" />
                  <span>VIEW PRIORITIES</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </Link>

              {activeAsset && (
                <Link
                  to={`/assets/${activeAsset.id}`}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-lime" />
                    <span>INSPECT ASSET #{activeAsset.priorityRank}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                </Link>
              )}

              <Link
                to="/budget"
                className="w-full py-2 px-3 rounded-xl bg-lime text-civic-dark text-xs font-bold hover:bg-lime-hover transition-colors flex items-center justify-between font-mono shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>OPTIMIZE BUDGET</span>
                </div>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <Link
                to="/simulation"
                className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex items-center justify-between font-mono"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan" />
                  <span>SIMULATE SCENARIO</span>
                </div>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* SECTION: CITIZEN INTELLIGENCE                                */}
      {/* ============================================================ */}
      <motion.div 
        variants={itemVariants}
        className="p-5 rounded-2xl bg-white border border-purple-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold">
                CITIZEN INTELLIGENCE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="font-display font-extrabold text-base text-slate-900">
              Verified Citizen Infrastructure Evidence
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-8 font-mono text-xs">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block font-bold">NEW REPORTS</span>
            <span className="font-display font-black text-xl text-slate-900">{civicStats?.newReports ?? 1}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block font-bold">VALIDATED</span>
            <span className="font-display font-black text-xl text-purple-700">{civicStats?.validated ?? 2}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block font-bold">IN PROGRESS</span>
            <span className="font-display font-black text-xl text-blue-700">{civicStats?.inProgress ?? 1}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block font-bold">RESOLVED</span>
            <span className="font-display font-black text-xl text-emerald-600">{civicStats?.resolved ?? 1}</span>
          </div>
        </div>

        <Link
          to="/civic-reports"
          className="px-4 py-2.5 rounded-xl bg-civic-dark text-lime hover:bg-zinc-800 font-mono text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 shrink-0"
        >
          <span>REVIEW CITIZEN REPORTS →</span>
        </Link>
      </motion.div>

      {/* ============================================================ */}
      {/* SECTION D: Operational Priority Queue (Full-Width Table)     */}
      {/* ============================================================ */}
      <motion.div 
        variants={itemVariants}
        className="rounded-2xl bg-white border border-zinc-200 shadow-subtle overflow-hidden"
      >
        <div className="p-4 bg-white border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-civic-dark" />
              <h3 className="font-display font-extrabold text-base text-civic-dark">
                PRIORITY QUEUE
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Ranked by multi-factor lifecycle ROI and failure consequence
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/priorities"
              className="text-xs font-bold text-civic-dark hover:text-zinc-600 inline-flex items-center gap-1 font-mono"
            >
              <span>VIEW FULL QUEUE ({priorities.length} ASSETS)</span>
              <ArrowRight className="w-3.5 h-3.5 text-lime-dark" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Asset</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Risk Score</th>
                <th className="py-2.5 px-4">Criticality</th>
                <th className="py-2.5 px-4">Estimated Cost</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 bg-white">
              {priorities.slice(0, 6).map((asset) => {
                const isSelected = activeAsset?.id === asset.id;
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
                    <td className="py-3 px-4 max-w-[200px]">
                      <p className="font-bold text-civic-dark truncate">{asset.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{asset.assetId}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-700">
                      {asset.type}
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
      </motion.div>
    </motion.div>
  );
};

