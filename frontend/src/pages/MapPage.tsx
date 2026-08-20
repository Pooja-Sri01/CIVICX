import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Filter, 
  Search, 
  RotateCcw, 
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { ApiService } from '../services/api';
import { Asset } from '../types';
import { formatINR } from '../utils/formatters';

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCriticality, setSelectedCriticality] = useState('All');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const data = await ApiService.getAssets();
        setAssets(data);
      } catch (err) {
        console.error('Failed to load map assets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesRisk =
        selectedRisk === 'All' || asset.riskLevel.toLowerCase() === selectedRisk.toLowerCase();
      const matchesType =
        selectedType === 'All' || asset.type.toLowerCase() === selectedType.toLowerCase();
      const matchesCriticality =
        selectedCriticality === 'All' ||
        asset.criticality.toLowerCase() === selectedCriticality.toLowerCase();
      const matchesSearch =
        !search.trim() ||
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.assetId.toLowerCase().includes(search.toLowerCase()) ||
        asset.location.toLowerCase().includes(search.toLowerCase());

      return matchesRisk && matchesType && matchesCriticality && matchesSearch;
    });
  }, [assets, selectedRisk, selectedType, selectedCriticality, search]);

  const visibleCount = filteredAssets.length;
  const criticalCount = filteredAssets.filter((a) => a.riskLevel.toLowerCase() === 'critical').length;
  const highCount = filteredAssets.filter((a) => a.riskLevel.toLowerCase() === 'high').length;

  const resetFilters = () => {
    setSearch('');
    setSelectedRisk('All');
    setSelectedType('All');
    setSelectedCriticality('All');
  };

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [11.0168, 76.9673],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers dynamically whenever filteredAssets change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredAssets.forEach((asset) => {
      const isCritical = asset.riskLevel.toLowerCase() === 'critical';
      let color = '#059669';
      let ringColor = 'rgba(5, 150, 105, 0.2)';

      if (asset.riskLevel.toLowerCase() === 'critical' || asset.riskScore >= 76) {
        color = '#DC2626';
        ringColor = 'rgba(220, 38, 38, 0.4)';
      } else if (asset.riskLevel.toLowerCase() === 'high' || asset.riskScore >= 51) {
        color = '#EA580C';
        ringColor = 'rgba(234, 88, 12, 0.3)';
      } else if (asset.riskLevel.toLowerCase() === 'medium' || asset.riskScore >= 26) {
        color = '#D97706';
        ringColor = 'rgba(217, 119, 6, 0.2)';
      }

      const customIcon = L.divIcon({
        className: 'custom-risk-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
          ">
            ${
              isCritical
                ? `<div style="
                    position: absolute;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: ${ringColor};
                    animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
                  "></div>`
                : ''
            }
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: ${color};
              border: 2.5px solid #FFFFFF;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-family: monospace;
              font-size: 10px;
              font-weight: 800;
              z-index: 10;
            ">
              ${asset.riskScore}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([asset.latitude, asset.longitude], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 space-y-2.5 font-sans min-w-[220px]';
      popupContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F4F4F5; padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-family: monospace; font-size: 12px; font-weight: bold; color: #1A1A1A;">
              ${asset.assetId}
            </span>
            <span style="font-size: 10px; color: #71717A; font-family: monospace;">
              • ${asset.type}
            </span>
          </div>
          <span style="font-size: 10px; font-weight: bold; font-family: monospace; padding: 2px 6px; border-radius: 4px; background: ${color}20; color: ${color};">
            ${asset.riskLevel.toUpperCase()}
          </span>
        </div>

        <div>
          <p style="font-weight: bold; font-size: 12px; color: #1A1A1A; margin: 0; line-height: 1.3;">
            ${asset.name}
          </p>
          <p style="font-size: 10px; color: #71717A; margin: 2px 0 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${asset.location}
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px 8px; background: #F8FAFC; border-radius: 8px; font-size: 10px; font-family: monospace;">
          <div>
            <span style="color: #94A3B8; display: block;">PRIORITY</span>
            <span style="font-weight: bold; color: #1A1A1A;">#${asset.priorityRank}</span>
          </div>
          <div>
            <span style="color: #94A3B8; display: block;">EST. REPAIR</span>
            <span style="font-weight: bold; color: #0F172A;">${formatINR(asset.estimatedRepairCost)}</span>
          </div>
        </div>

        <button
          id="btn-inspect-${asset.id}"
          style="
            width: 100%;
            padding: 8px 12px;
            border-radius: 10px;
            background: #1A1A1A;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          "
        >
          <span>View Asset Intelligence →</span>
        </button>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${asset.id}`);
        if (btn) {
          btn.onclick = () => navigate(`/assets/${asset.id}`);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredAssets, navigate]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-zinc-100 flex flex-col overflow-hidden">
      {/* 1. Top Minimal Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pointer-events-none">
        {/* Title & Stats Pill */}
        <div className="glass-panel px-4 py-2.5 rounded-2xl border border-civic-border shadow-elevated pointer-events-auto flex items-center gap-4 bg-white/95 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-sm sm:text-base text-civic-dark tracking-tight leading-none">
                INFRASTRUCTURE RISK MAP
              </h1>
              <span className="bg-zinc-100 text-zinc-600 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                COIMBATORE
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5 hidden sm:block">
              “See where infrastructure risk is concentrated.”
            </p>
          </div>

          <div className="h-6 w-px bg-zinc-200" />

          {/* Real-time Dynamic Summary Badges */}
          <div className="flex items-center gap-3 text-xs font-mono font-bold">
            <div>
              <span className="text-[10px] text-zinc-400 block font-sans font-normal">VISIBLE</span>
              <span className="text-zinc-900">{visibleCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-orange-600 block font-sans font-normal">HIGH</span>
              <span className="text-orange-600">{highCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-red-600 block font-sans font-normal">CRITICAL</span>
              <span className="text-red-600">{criticalCount}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Pill */}
        <div className="glass-panel p-1.5 rounded-2xl border border-civic-border shadow-elevated pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search asset or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-44 sm:w-56 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-lime"
            />
          </div>

          {/* Desktop Filter Pills */}
          <div className="hidden lg:flex items-center gap-1.5">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 focus:outline-none"
            >
              <option value="All">All Risk</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Road">Road</option>
              <option value="Bridge">Bridge</option>
              <option value="Drainage">Drainage</option>
              <option value="Culvert">Culvert</option>
              <option value="Flyover">Flyover</option>
              <option value="Public Facility">Public Facility</option>
              <option value="Street Infrastructure">Street Infrastructure</option>
            </select>
          </div>

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 lg:hidden ${
              showFilterDrawer ? 'bg-civic-dark text-lime border-civic-dark' : 'bg-zinc-50 text-zinc-700 border-zinc-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
          </button>

          {(selectedRisk !== 'All' || selectedType !== 'All' || selectedCriticality !== 'All' || search) && (
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Mobile Filter Drawer */}
      <AnimatePresence>
        {showFilterDrawer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-4 right-4 z-[1000] p-4 glass-panel rounded-2xl border border-civic-border bg-white shadow-elevated lg:hidden space-y-3"
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 block mb-1">Risk Level</label>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs"
                >
                  <option value="All">All Risk</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-500 block mb-1">Asset Archetype</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs"
                >
                  <option value="All">All Types</option>
                  <option value="Road">Road</option>
                  <option value="Bridge">Bridge</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Culvert">Culvert</option>
                  <option value="Flyover">Flyover</option>
                  <option value="Public Facility">Public Facility</option>
                  <option value="Street Infrastructure">Street Infrastructure</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Direct Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full relative z-0" />

      {/* 4. Minimal Bottom Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
        <div className="glass-panel px-3.5 py-2 rounded-2xl border border-civic-border bg-white/95 shadow-elevated pointer-events-auto flex items-center gap-3 text-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Risk Legend</span>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span className="text-zinc-700">Critical</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
              <span className="text-zinc-700">High</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span className="text-zinc-700">Medium</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-zinc-700">Low</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
