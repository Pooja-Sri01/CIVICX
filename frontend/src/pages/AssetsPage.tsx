import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Layers, 
  ShieldAlert,
  ArrowUpDown,
  Building2,
  Wrench,
  MapPin
} from 'lucide-react';
import { ApiService } from '../services/api';
import { Asset, AssetType, RiskLevel } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { ErrorState } from '../components/common/ErrorState';
import { formatINR } from '../utils/formatters';

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'risk' | 'condition' | 'cost' | 'priority'>('priority');

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getAssets();
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets', err);
      setError('Could not retrieve infrastructure assets from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // Filter & Sort Assets
  const filtered = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(search.toLowerCase()) ||
      asset.location.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === 'All' || asset.type === selectedType;
    const matchesRisk = selectedRisk === 'All' || asset.riskLevel === selectedRisk;
    const matchesZone = selectedZone === 'All' || asset.zone === selectedZone;

    return matchesSearch && matchesType && matchesRisk && matchesZone;
  }).sort((a, b) => {
    if (sortBy === 'priority') return a.priorityRank - b.priorityRank;
    if (sortBy === 'risk') return b.riskScore - a.riskScore;
    if (sortBy === 'condition') return a.conditionScore - b.conditionScore;
    if (sortBy === 'cost') return b.estimatedRepairCost - a.estimatedRepairCost;
    return 0;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-10 bg-zinc-200 animate-pulse rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-6 w-20 bg-zinc-200 rounded" />
                <div className="h-6 w-16 bg-zinc-200 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-zinc-200 rounded" />
              <div className="h-4 w-1/2 bg-zinc-200 rounded" />
              <div className="h-16 bg-zinc-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState message={error} onRetry={loadAssets} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Citywide Portfolio
            </span>
            <span className="bg-lime text-civic-dark text-[10px] font-mono font-bold px-2 py-0.5 rounded">
              78 MONITORED ASSETS
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-civic-dark tracking-tight mt-1">
            ASSET INTELLIGENCE REGISTRY
          </h1>
          <p className="text-xs text-zinc-500">
            Real-time multi-criteria telemetry, decay curves, and intervention planning.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <ArrowUpDown className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-mono text-zinc-500">SORT BY:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 shadow-subtle focus:outline-none focus:ring-2 focus:ring-lime"
          >
            <option value="priority">Priority Rank (#1 to #78)</option>
            <option value="risk">Highest Risk Score</option>
            <option value="condition">Lowest Condition Score</option>
            <option value="cost">Highest Estimated Cost</option>
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-civic-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset ID, corridor name, road, or zone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-medium text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-lime"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime"
            >
              <option value="All">All Asset Types</option>
              <option value="Road">Roads & Corridors</option>
              <option value="Bridge">Bridges & Structures</option>
              <option value="Flyover">Flyovers</option>
              <option value="Drainage">Stormwater Drainage</option>
              <option value="Culvert">Culverts</option>
              <option value="Public Facility">Public Facilities</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime"
            >
              <option value="All">All Risk Tiers</option>
              <option value="Critical">Critical (75-100)</option>
              <option value="High">High (50-74)</option>
              <option value="Medium">Medium (25-49)</option>
              <option value="Low">Low (0-24)</option>
            </select>
          </div>
        </div>

        {/* Quick Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 text-xs">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">Zones:</span>
          {['All', 'Central Zone', 'East Zone', 'West Zone', 'North Zone', 'South Zone'].map((z) => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedZone === z
                  ? 'bg-civic-dark text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Clean Data-First Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((asset) => {
          return (
            <div
              key={asset.id}
              onClick={() => navigate(`/assets/${asset.id}`)}
              className="glass-panel rounded-2xl border border-civic-border bg-white hover:border-zinc-300 hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group p-5 space-y-4"
            >
              <div className="space-y-3.5">
                {/* Header: Asset ID, Type, Zone & Risk Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-civic-dark text-lime font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                      {asset.assetId}
                    </span>
                    <span className="bg-zinc-100 text-zinc-800 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border border-zinc-200">
                      {asset.type}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {asset.zone}
                    </span>
                  </div>
                  <RiskBadge level={asset.riskLevel} score={asset.riskScore} size="sm" />
                </div>

                {/* Primary Hero Focus: Asset Name */}
                <div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-civic-dark tracking-tight leading-snug group-hover:text-lime-dark transition-colors">
                    {asset.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-sans mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span className="truncate">{asset.location}</span>
                  </p>
                </div>

                {/* 3-Column Metrics: Condition, Estimated Cost, Priority Rank */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Condition</span>
                    <p className="font-mono font-black text-sm text-zinc-900 mt-0.5">{asset.conditionScore}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Est. Cost</span>
                    <p className="font-mono font-black text-sm text-zinc-900 mt-0.5">{formatINR(asset.estimatedRepairCost)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">Priority</span>
                    <p className="font-mono font-black text-sm text-civic-dark mt-0.5">#{asset.priorityRank}</p>
                  </div>
                </div>

                {/* Identified Defect */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                    Identified Defect
                  </span>
                  <p className="text-xs font-semibold text-zinc-800 bg-amber-50/60 border border-amber-200/80 px-2.5 py-1.5 rounded-lg truncate">
                    {asset.damageType}
                  </p>
                </div>
              </div>

              {/* Footer: Recommended Action & Inspect Button */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-500 truncate max-w-[200px]" title={asset.recommendedAction}>
                  {asset.recommendedAction}
                </span>
                <span className="text-xs font-bold text-civic-dark group-hover:text-lime-dark flex items-center gap-1 font-mono whitespace-nowrap flex-shrink-0">
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
