import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Layers, 
  ArrowRight, 
  MapPin, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import { ApiService } from '../services/api';
import { Asset, RiskLevel } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { formatINR, getConditionStatus } from '../utils/formatters';

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filtered, setFiltered] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        const data = await ApiService.getAssets();
        setAssets(data);
        setFiltered(data);
      } catch (e) {
        console.error('Failed to load assets', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let list = [...assets];
    if (selectedType !== 'All') list = list.filter((a) => a.type === selectedType);
    if (selectedRisk !== 'All') list = list.filter((a) => a.riskLevel === selectedRisk);
    if (selectedZone !== 'All') list = list.filter((a) => a.zone === selectedZone);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.assetId.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, selectedType, selectedRisk, selectedZone, assets]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-civic-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-civic-dark tracking-tight">
              Municipal Asset Intelligence Catalogue
            </h1>
            <span className="bg-zinc-200 text-zinc-800 text-xs font-bold font-mono px-2 py-0.5 rounded-full">
              {filtered.length} Assets
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Complete inventory of monitored roads, bridges, flyovers, and drainage channels across Coimbatore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/map"
            className="px-4 py-2 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-subtle flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-lime" />
            <span>Switch to Map View</span>
          </Link>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="glass-panel p-4 rounded-2xl border border-civic-border shadow-subtle space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by asset ID, street name, ward..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs text-civic-dark focus:outline-none focus:ring-2 focus:ring-lime"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-white border border-zinc-200 text-xs text-civic-dark focus:outline-none focus:ring-2 focus:ring-lime font-medium"
            >
              <option value="All">All Asset Types</option>
              <option value="Road">Roads</option>
              <option value="Bridge">Bridges</option>
              <option value="Drainage">Drainage</option>
              <option value="Culvert">Culverts</option>
              <option value="Flyover">Flyovers</option>
              <option value="Traffic Corridor">Traffic Corridors</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-white border border-zinc-200 text-xs text-civic-dark focus:outline-none focus:ring-2 focus:ring-lime font-medium"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical (76-100)</option>
              <option value="High">High (51-75)</option>
              <option value="Medium">Medium (26-50)</option>
              <option value="Low">Low (0-25)</option>
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

      {/* Grid of Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((asset) => {
          const conditionStatus = getConditionStatus(asset.conditionScore);
          return (
            <div
              key={asset.id}
              onClick={() => navigate(`/assets/${asset.id}`)}
              className="glass-panel rounded-2xl border border-civic-border overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Image & Risk Banner */}
                <div className="relative h-40 bg-zinc-900 overflow-hidden">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-black/80 backdrop-blur-md text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                      {asset.assetId}
                    </span>
                    <span className="bg-white/90 text-zinc-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {asset.type}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <RiskBadge level={asset.riskLevel} score={asset.riskScore} size="sm" />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs font-bold truncate drop-shadow">{asset.name}</p>
                    <p className="text-[10px] text-zinc-300 truncate">{asset.location}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Condition</span>
                      <p className="font-mono font-bold text-zinc-800">{asset.conditionScore}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Estimated Cost</span>
                      <p className="font-mono font-bold text-zinc-800">{formatINR(asset.estimatedRepairCost)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Priority Rank</span>
                      <p className="font-mono font-bold text-civic-dark">#{asset.priorityRank}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400">Identified Defect</span>
                    <p className="text-xs font-medium text-zinc-700 truncate">{asset.damageType}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 truncate max-w-[190px]">
                  {asset.recommendedAction}
                </span>
                <span className="text-xs font-semibold text-civic-dark group-hover:text-lime-dark flex items-center gap-1">
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
