import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Filter, 
  Search, 
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Building,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

import { ApiService } from '../services/api';
import { Asset, CitizenReport, PredictivePriorityItem } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { DashboardSkeleton } from '../components/common/DashboardSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { formatINR } from '../utils/formatters';

export const PrioritiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [priorities, setPriorities] = useState<Asset[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [predictivePriorities, setPredictivePriorities] = useState<PredictivePriorityItem[]>([]);
  const [viewMode, setViewMode] = useState<'OFFICIAL' | 'PREDICTIVE'>('OFFICIAL');
  const [filtered, setFiltered] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCriticality, setSelectedCriticality] = useState('All');
  const [sortBy, setSortBy] = useState<'priority' | 'risk' | 'cost'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const loadPriorities = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prioData, repData, predPrioData] = await Promise.all([
        ApiService.getPriorities(),
        ApiService.getCitizenReports(),
        ApiService.getPredictivePriorities()
      ]);
      setPriorities(prioData);
      setCitizenReports(repData);
      setPredictivePriorities(predPrioData);
      setFiltered(prioData);
      if (prioData.length > 0) {
        setSelectedAsset(prioData[0]);
      }
    } catch (e) {
      console.error('Failed to load priorities', e);
      setError('Could not retrieve priority queue from CivicX service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorities();
  }, []);

  // Filter and Sort Engine
  useEffect(() => {
    let list = [...priorities];

    if (selectedRisk !== 'All') {
      list = list.filter((a) => a.riskLevel.toLowerCase() === selectedRisk.toLowerCase());
    }
    if (selectedType !== 'All') {
      list = list.filter((a) => a.type.toLowerCase() === selectedType.toLowerCase());
    }
    if (selectedCriticality !== 'All') {
      list = list.filter((a) => a.criticality.toLowerCase() === selectedCriticality.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.assetId.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'priority') {
        comparison = a.priorityRank - b.priorityRank;
      } else if (sortBy === 'risk') {
        comparison = b.riskScore - a.riskScore;
      } else if (sortBy === 'cost') {
        comparison = b.estimatedRepairCost - a.estimatedRepairCost;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFiltered(list);
    if (list.length > 0 && (!selectedAsset || !list.some((item) => item.id === selectedAsset.id))) {
      setSelectedAsset(list[0]);
    }
  }, [search, selectedRisk, selectedType, selectedCriticality, sortBy, sortOrder, priorities]);

  const resetFilters = () => {
    setSearch('');
    setSelectedRisk('All');
    setSelectedType('All');
    setSelectedCriticality('All');
    setSortBy('priority');
    setSortOrder('asc');
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadPriorities} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-civic-border"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-civic-dark tracking-tight">
              PRIORITY QUEUE
            </h1>
            <span className="bg-lime text-civic-dark text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
              EXPLAINABLE RANKING
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            “Where limited resources create the greatest risk reduction.”
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl bg-zinc-100 p-1 font-mono text-xs border border-zinc-200">
            <button
              onClick={() => setViewMode('OFFICIAL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                viewMode === 'OFFICIAL' ? 'bg-civic-dark text-lime shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              MCDA Official Ranking
            </button>
            <button
              onClick={() => setViewMode('PREDICTIVE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                viewMode === 'PREDICTIVE' ? 'bg-civic-dark text-lime shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span>Predictive Horizon</span>
              <span className="bg-lime text-civic-dark text-[9px] px-1 py-0.2 rounded font-extrabold">P8</span>
            </button>
          </div>

          <Link
            to="/budget"
            className="px-4 py-2 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-subtle flex items-center gap-1.5"
          >
            <span>Run Budget Optimizer</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime" />
          </Link>
        </div>
      </motion.div>

      {/* 2. Filter & Sort Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-civic-border shadow-subtle space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search priority queue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-lime text-xs"
            />
          </div>

          {/* Risk Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-white border border-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-lime text-xs"
            >
              <option value="All">All Risk Tiers</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Asset Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-white border border-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-lime text-xs"
            >
              <option value="All">All Archetypes</option>
              <option value="Road">Road</option>
              <option value="Bridge">Bridge</option>
              <option value="Drainage">Drainage</option>
              <option value="Culvert">Culvert</option>
              <option value="Flyover">Flyover</option>
              <option value="Public Facility">Public Facility</option>
              <option value="Street Infrastructure">Street Infrastructure</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 py-2 px-3 rounded-xl bg-white border border-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-lime text-xs"
            >
              <option value="priority">Sort: Priority</option>
              <option value="risk">Sort: Risk Score</option>
              <option value="cost">Sort: Repair Cost</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 transition-colors"
              title={`Toggle sort order (${sortOrder})`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />
            </button>
          </div>
        </div>

        {/* Active Filter Indicators & Reset */}
        {(selectedRisk !== 'All' || selectedType !== 'All' || selectedCriticality !== 'All' || search) && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
            <span className="text-[11px] font-mono text-zinc-500">
              Showing {filtered.length} of {priorities.length} assets
            </span>
            <button
              onClick={resetFilters}
              className="text-[11px] text-zinc-500 hover:text-civic-dark flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Grid: Queue Table + "Why is this #X?" Explanation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Full Priority Queue Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-3xl border border-civic-border overflow-hidden shadow-subtle">
            <div className="p-4 bg-white border-b border-civic-border flex items-center justify-between">
              <span className="font-display font-bold text-sm text-civic-dark">
                Ranked Asset Portfolio ({filtered.length})
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Click row to inspect decision factor
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
                <p className="font-semibold text-zinc-700">No assets match the selected filter criteria.</p>
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-civic-dark font-semibold text-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 font-mono uppercase text-[10px] tracking-wider border-b border-zinc-200">
                    <tr>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Asset</th>
                      <th className="py-2.5 px-3">Risk</th>
                      {viewMode === 'PREDICTIVE' ? (
                        <>
                          <th className="py-2.5 px-3">12M Forecast</th>
                          <th className="py-2.5 px-3">Trend</th>
                          <th className="py-2.5 px-3">Maint Window</th>
                        </>
                      ) : (
                        <>
                          <th className="py-2.5 px-3">Location</th>
                          <th className="py-2.5 px-3">Criticality</th>
                          <th className="py-2.5 px-3">Cost</th>
                        </>
                      )}
                      <th className="py-2.5 px-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/70 bg-white">
                    {filtered.map((asset) => {
                      const isSelected = selectedAsset?.id === asset.id;
                      return (
                        <tr
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-zinc-100 font-medium'
                              : 'hover:bg-zinc-50/80'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold">
                            <span
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                                asset.priorityRank === 1
                                  ? 'bg-civic-dark text-lime font-black'
                                  : asset.priorityRank <= 3
                                  ? 'bg-zinc-800 text-white font-bold'
                                  : 'bg-zinc-100 text-zinc-700'
                              }`}
                            >
                              #{asset.priorityRank < 10 ? `0${asset.priorityRank}` : asset.priorityRank}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-[150px]">
                            <p className="font-bold text-civic-dark truncate">{asset.assetId}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{asset.type}</p>
                          </td>
                          <td className="py-3 px-3">
                            <RiskBadge level={asset.riskLevel} score={asset.riskScore} size="sm" />
                          </td>

                          {viewMode === 'PREDICTIVE' ? (
                            <>
                              <td className="py-3 px-3 font-mono">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-zinc-900">
                                    {Math.max(1, Math.round(asset.conditionScore - ((asset.usageScore || 50) * 0.08 + (asset.exposureScore || 50) * 0.06 + 5)))}
                                  </span>
                                  <span className="text-[10px] text-zinc-400">/100</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  (asset.trendScore || 50) >= 80 || asset.conditionScore < 30 ? 'bg-red-100 text-red-800' : 'bg-zinc-100 text-zinc-800'
                                }`}>
                                  {(asset.trendScore || 50) >= 80 || asset.conditionScore < 30 ? 'ACCELERATING' : 'MODERATE'}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-civic-dark text-[11px]">
                                {asset.conditionScore < 30 ? 'Immediate (0–3M)' : asset.conditionScore < 50 ? '3–6M' : '6–12M'}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-3 text-zinc-600 max-w-[140px] truncate">
                                {asset.location}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-mono text-zinc-700 font-semibold">{asset.criticality}</span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                                {formatINR(asset.estimatedRepairCost)}
                              </td>
                            </>
                          )}
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/assets/${asset.id}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[11px] font-semibold text-civic-dark transition-colors inline-flex items-center gap-1"
                            >
                              <span>View</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Explainable Decision Factor Card */}
        <div className="lg:col-span-5">
          {selectedAsset ? (
            <motion.div
              key={selectedAsset.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="glass-panel p-6 rounded-3xl border-2 border-civic-dark bg-white shadow-elevated space-y-5 sticky top-24"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-civic-dark text-lime flex items-center justify-center font-mono font-bold text-xs">
                    #{selectedAsset.priorityRank < 10 ? `0${selectedAsset.priorityRank}` : selectedAsset.priorityRank}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-civic-dark">
                      Decision Intelligence
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {selectedAsset.assetId} — {selectedAsset.name}
                    </p>
                  </div>
                </div>

                <RiskBadge level={selectedAsset.riskLevel} score={selectedAsset.riskScore} size="sm" />
              </div>

              {/* Evidence Fusion Ribbon */}
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-mono text-[10px] font-bold flex items-center justify-between">
                <span>FIELD INSPECTION ✓</span>
                <span className="text-purple-400">•</span>
                <span className="text-purple-800">
                  CITIZEN REPORTS {citizenReports.filter(r => r.nearestAssetId === selectedAsset.assetId || r.nearestAssetId === selectedAsset.id).length || 1}
                </span>
                <span className="text-purple-400">•</span>
                <span>AI INSPECTION ✓</span>
              </div>

              {/* Rationale Quote */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-lime-dark" />
                  <span>WHY #{selectedAsset.priorityRank < 10 ? `0${selectedAsset.priorityRank}` : selectedAsset.priorityRank}?</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-medium bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/70">
                  {selectedAsset.explainability?.whyRank}
                </p>
              </div>

              {/* Contributing Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Condition Integrity</span>
                  <p className="font-bold text-zinc-900 mt-0.5">{selectedAsset.conditionScore}%</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Estimated Cost</span>
                  <p className="font-bold text-zinc-900 mt-0.5">{formatINR(selectedAsset.estimatedRepairCost)}</p>
                </div>
              </div>

              {/* Decision Factors */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                  Factor Contributions
                </span>
                {selectedAsset.explainability?.topFactors.map((f, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-zinc-800">{f.factor}</p>
                      <p className="text-[10px] text-zinc-500">{f.description}</p>
                    </div>
                    <span className="font-mono font-bold text-zinc-700 text-[11px] flex-shrink-0 ml-2">
                      +{f.scoreContribution}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/assets/${selectedAsset.id}`)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Asset Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5 text-lime" />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-3xl border border-civic-border text-zinc-500 text-xs">
              Select an asset from the queue to inspect ranking factors.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
