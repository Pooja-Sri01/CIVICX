import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  Filter,
  RotateCcw,
  Navigation,
  Layers,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Compass,
  Building2,
  Radio,
  Eye,
  ArrowRight,
  ShieldAlert,
  Flame,
  Activity,
  Maximize2,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Asset, CitizenReport } from '../../types';
import { formatINR } from '../../utils/formatters';
import { AssetDecisionChain } from '../common/AssetDecisionChain';
import { isUserUploadedPhoto, handleImageError } from '../../utils/imageFallback';

interface GoogleMapViewProps {
  assets: Asset[];
  citizenReports: CitizenReport[];
  onSelectAsset?: (asset: Asset) => void;
  onSelectCitizenReport?: (report: CitizenReport) => void;
  height?: string;
  initialSelectedAssetId?: string;
  initialSelectedReportId?: string;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  assets,
  citizenReports,
  onSelectAsset,
  onSelectCitizenReport,
  height = 'calc(100vh - 4rem)',
  initialSelectedAssetId,
  initialSelectedReportId
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('leaflet');
  const [isMapReady, setIsMapReady] = useState(false);

  // Layer Visibility Toggles
  const [showAssets, setShowAssets] = useState(true);
  const [showCitizenReports, setShowCitizenReports] = useState(true);
  const [showRiskOverlays, setShowRiskOverlays] = useState(true);
  const [showPriorityOverlays, setShowPriorityOverlays] = useState(true);
  const [showDensityMode, setShowDensityMode] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedReportStatus, setSelectedReportStatus] = useState<string>('All');
  const [selectedReportLink, setSelectedReportLink] = useState<string>('All');
  const [mapStyleMode, setMapStyleMode] = useState<'roadmap' | 'satellite'>('roadmap');

  // Selected Entities
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);

  // References to keep track of map instances, markers & polylines
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const googleMarkersRef = useRef<any[]>([]);
  const googlePolylineRef = useRef<google.maps.Polyline | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletLayerRef = useRef<L.LayerGroup | null>(null);
  const leafletPolylineRef = useRef<L.Polyline | null>(null);

  // Map from asset ID to asset object for fast lookup
  const assetMap = useMemo(() => {
    const map = new Map<string, Asset>();
    assets.forEach(a => {
      map.set(a.assetId, a);
      map.set(String(a.id), a);
    });
    return map;
  }, [assets]);

  // Initialize selected asset/report from props
  useEffect(() => {
    if (initialSelectedAssetId) {
      const found = assets.find(
        (a) => String(a.id) === String(initialSelectedAssetId) || a.assetId === initialSelectedAssetId
      );
      if (found) setSelectedAsset(found);
    }
  }, [initialSelectedAssetId, assets]);

  useEffect(() => {
    if (initialSelectedReportId) {
      const found = citizenReports.find(
        (r) => String(r.id) === String(initialSelectedReportId) || r.reportId === initialSelectedReportId
      );
      if (found) setSelectedReport(found);
    }
  }, [initialSelectedReportId, citizenReports]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    if (!showAssets) return [];
    return assets.filter((asset) => {
      const matchesRisk =
        selectedRisk === 'All' || asset.riskLevel.toLowerCase() === selectedRisk.toLowerCase();
      const matchesType =
        selectedType === 'All' || asset.type.toLowerCase() === selectedType.toLowerCase();
      const matchesPriority =
        selectedPriority === 'All' ||
        `P${asset.priorityRank || 2}`.toLowerCase() === selectedPriority.toLowerCase();

      const matchesSearch =
        !search.trim() ||
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.assetId.toLowerCase().includes(search.toLowerCase()) ||
        asset.location.toLowerCase().includes(search.toLowerCase()) ||
        asset.zone?.toLowerCase().includes(search.toLowerCase());

      return matchesRisk && matchesType && matchesPriority && matchesSearch;
    });
  }, [assets, showAssets, selectedRisk, selectedType, selectedPriority, search]);

  // Filtered Citizen Reports
  const filteredReports = useMemo(() => {
    if (!showCitizenReports) return [];
    return citizenReports.filter((report) => {
      const matchesType =
        selectedType === 'All' ||
        report.category.toLowerCase().includes(selectedType.toLowerCase());

      const matchesStatus =
        selectedReportStatus === 'All' ||
        report.status.toLowerCase() === selectedReportStatus.toLowerCase();

      const linked = report.nearestAssetId ? assetMap.get(report.nearestAssetId) : null;
      const isHighRiskLinked = linked && (linked.riskLevel === 'Critical' || linked.riskLevel === 'High');

      const matchesLink =
        selectedReportLink === 'All' ||
        (selectedReportLink === 'Linked' && report.nearestAssetId) ||
        (selectedReportLink === 'Unlinked' && !report.nearestAssetId) ||
        (selectedReportLink === 'High-Risk Linked' && isHighRiskLinked);

      const matchesSearch =
        !search.trim() ||
        report.reportId.toLowerCase().includes(search.toLowerCase()) ||
        report.description.toLowerCase().includes(search.toLowerCase()) ||
        report.locationName.toLowerCase().includes(search.toLowerCase()) ||
        (report.nearestAssetId && report.nearestAssetId.toLowerCase().includes(search.toLowerCase()));

      return matchesType && matchesStatus && matchesLink && matchesSearch;
    });
  }, [citizenReports, showCitizenReports, selectedType, selectedReportStatus, selectedReportLink, search, assetMap]);

  // Correlated evidence for currently selected asset
  const selectedAssetEvidence = useMemo(() => {
    if (!selectedAsset) return [];
    return citizenReports.filter(r => r.nearestAssetId === selectedAsset.assetId || r.nearestAssetId === String(selectedAsset.id));
  }, [selectedAsset, citizenReports]);

  // Correlated asset for currently selected report
  const selectedReportAsset = useMemo(() => {
    if (!selectedReport || !selectedReport.nearestAssetId) return null;
    return assetMap.get(selectedReport.nearestAssetId) || null;
  }, [selectedReport, assetMap]);

  // Handle Map Initialization (Google Maps if API key is provided, else fallback to Carto/Leaflet)
  useEffect(() => {
    const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
    let isCancelled = false;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' && apiKey.length > 10) {
        try {
          const loader = new Loader({
            apiKey: apiKey,
            version: 'weekly'
          });

          await (loader as any).load();
          if (isCancelled || !mapContainerRef.current || !window.google) return;

          const map = new google.maps.Map(mapContainerRef.current, {
            center: { lat: 11.0168, lng: 76.9673 },
            zoom: 13,
            mapTypeId: mapStyleMode === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          googleMapRef.current = map;
          setMapEngine('google');
          setIsMapReady(true);
          return;
        } catch (err) {
          console.warn('Google Maps API failed to load, switching to GIS fallback layer:', err);
        }
      }

      // Fallback: Leaflet GIS map with light carto layer
      if (!leafletMapRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [11.0168, 76.9673],
          zoom: 13,
          zoomControl: false
        });

        L.tileLayer(
          mapStyleMode === 'satellite'
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          {
            attribution: '&copy; OpenStreetMap &copy; CARTO &copy; Esri',
            maxZoom: 19
          }
        ).addTo(map);

        leafletLayerRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;
        setMapEngine('leaflet');
        setIsMapReady(true);
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Map Style Mode
  useEffect(() => {
    if (mapEngine === 'google' && googleMapRef.current && window.google) {
      googleMapRef.current.setMapTypeId(
        mapStyleMode === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP
      );
    }
  }, [mapStyleMode, mapEngine]);

  // Update Markers & Linking Polyline
  useEffect(() => {
    if (!isMapReady) return;

    if (mapEngine === 'google' && googleMapRef.current && window.google) {
      // Clear previous google markers and polylines
      googleMarkersRef.current.forEach((m) => m.setMap(null));
      googleMarkersRef.current = [];
      if (googlePolylineRef.current) {
        googlePolylineRef.current.setMap(null);
        googlePolylineRef.current = null;
      }

      const map = googleMapRef.current;

      // 1. Render Municipal Assets on Google Maps
      filteredAssets.forEach((asset) => {
        let pinColor = '#059669';
        if (asset.riskLevel.toLowerCase() === 'critical') pinColor = '#DC2626';
        else if (asset.riskLevel.toLowerCase() === 'high') pinColor = '#EA580C';
        else if (asset.riskLevel.toLowerCase() === 'medium') pinColor = '#D97706';

        const isSelected = selectedAsset?.assetId === asset.assetId;

        const marker = new google.maps.Marker({
          position: { lat: asset.latitude, lng: asset.longitude },
          map,
          title: `${asset.assetId} - ${asset.name}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: pinColor,
            fillOpacity: isSelected ? 1 : 0.9,
            strokeColor: isSelected ? '#9FFF00' : '#FFFFFF',
            strokeWeight: isSelected ? 3.5 : 2,
            scale: isSelected ? 11 : 8
          }
        });

        marker.addListener('click', () => {
          setSelectedAsset(asset);
          setSelectedReport(null);
          if (onSelectAsset) onSelectAsset(asset);
        });

        googleMarkersRef.current.push(marker);
      });

      // 2. Render Citizen Reports on Google Maps
      filteredReports.forEach((report) => {
        const isSelected = selectedReport?.reportId === report.reportId;
        const isResolved = report.status === 'RESOLVED';
        const isPending = report.status === 'SUBMITTED' || report.status === 'UNDER_REVIEW';
        const repColor = isResolved ? '#059669' : isPending ? '#8B5CF6' : '#2563EB';

        const marker = new google.maps.Marker({
          position: { lat: report.latitude, lng: report.longitude },
          map,
          title: `Civic Report: ${report.reportId}`,
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: repColor,
            fillOpacity: isSelected ? 1 : 0.85,
            strokeColor: isSelected ? '#9FFF00' : '#FFFFFF',
            strokeWeight: isSelected ? 2.5 : 1.5,
            scale: isSelected ? 1.8 : 1.4,
            anchor: new google.maps.Point(12, 22)
          }
        });

        marker.addListener('click', () => {
          setSelectedReport(report);
          setSelectedAsset(null);
          if (onSelectCitizenReport) onSelectCitizenReport(report);
        });

        googleMarkersRef.current.push(marker);
      });

      // 3. Render Correlation Line if selected report is linked to an asset
      if (selectedReport && selectedReportAsset) {
        googlePolylineRef.current = new google.maps.Polyline({
          path: [
            { lat: selectedReport.latitude, lng: selectedReport.longitude },
            { lat: selectedReportAsset.latitude, lng: selectedReportAsset.longitude }
          ],
          geodesic: true,
          strokeColor: '#8B5CF6',
          strokeOpacity: 0.9,
          strokeWeight: 3,
          map
        });
      }
    } else if (mapEngine === 'leaflet' && leafletMapRef.current && leafletLayerRef.current) {
      leafletLayerRef.current.clearLayers();
      if (leafletPolylineRef.current) {
        leafletPolylineRef.current.remove();
        leafletPolylineRef.current = null;
      }

      // 1. Render Assets on Leaflet
      filteredAssets.forEach((asset) => {
        const isCritical = asset.riskLevel.toLowerCase() === 'critical';
        const isSelected = selectedAsset?.assetId === asset.assetId;
        let color = '#059669';
        if (asset.riskLevel.toLowerCase() === 'critical' || asset.riskScore >= 76) color = '#DC2626';
        else if (asset.riskLevel.toLowerCase() === 'high' || asset.riskScore >= 51) color = '#EA580C';
        else if (asset.riskLevel.toLowerCase() === 'medium' || asset.riskScore >= 26) color = '#D97706';

        const customIcon = L.divIcon({
          className: 'custom-risk-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
              ${
                isCritical
                  ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(220, 38, 38, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                  : ''
              }
              <div style="width: ${isSelected ? '26px' : '22px'}; height: ${isSelected ? '26px' : '22px'}; border-radius: 50%; background: ${color}; border: ${isSelected ? '3px solid #9FFF00' : '2px solid #FFFFFF'}; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-family: monospace; font-size: ${isSelected ? '11px' : '10px'}; font-weight: 800; z-index: 10;">
                ${asset.riskScore}
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([asset.latitude, asset.longitude], { icon: customIcon });
        marker.on('click', () => {
          setSelectedAsset(asset);
          setSelectedReport(null);
          if (onSelectAsset) onSelectAsset(asset);
        });
        leafletLayerRef.current?.addLayer(marker);
      });

      // 2. Render Citizen Reports on Leaflet
      filteredReports.forEach((report) => {
        const isSelected = selectedReport?.reportId === report.reportId;
        const isResolved = report.status === 'RESOLVED';
        const isPending = report.status === 'SUBMITTED' || report.status === 'UNDER_REVIEW';

        const customIcon = L.divIcon({
          className: 'custom-citizen-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
              <div style="width: ${isSelected ? '30px' : '26px'}; height: ${isSelected ? '30px' : '26px'}; border-radius: 8px; background: ${
                isResolved ? '#059669' : isPending ? '#8B5CF6' : '#2563EB'
              }; border: ${isSelected ? '3px solid #9FFF00' : '2px solid #FFFFFF'}; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.45); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 13px; z-index: 10;">
                📍
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });
        marker.on('click', () => {
          setSelectedReport(report);
          setSelectedAsset(null);
          if (onSelectCitizenReport) onSelectCitizenReport(report);
        });
        leafletLayerRef.current?.addLayer(marker);
      });

      // 3. Render Correlation Line in Leaflet
      if (selectedReport && selectedReportAsset && leafletMapRef.current) {
        leafletPolylineRef.current = L.polyline(
          [
            [selectedReport.latitude, selectedReport.longitude],
            [selectedReportAsset.latitude, selectedReportAsset.longitude]
          ],
          { color: '#8B5CF6', weight: 3, dashArray: '6, 6', opacity: 0.85 }
        ).addTo(leafletMapRef.current);
      }
    }
  }, [filteredAssets, filteredReports, selectedAsset, selectedReport, selectedReportAsset, isMapReady, mapEngine, onSelectAsset, onSelectCitizenReport]);

  // Pan to current location
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (mapEngine === 'google' && googleMapRef.current) {
            googleMapRef.current.panTo({ lat, lng });
            googleMapRef.current.setZoom(15);
          } else if (mapEngine === 'leaflet' && leafletMapRef.current) {
            leafletMapRef.current.flyTo([lat, lng], 15);
          }
        },
        () => {
          if (mapEngine === 'google' && googleMapRef.current) {
            googleMapRef.current.panTo({ lat: 11.0168, lng: 76.9673 });
          } else if (mapEngine === 'leaflet' && leafletMapRef.current) {
            leafletMapRef.current.flyTo([11.0168, 76.9673], 13);
          }
        }
      );
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedRisk('All');
    setSelectedType('All');
    setSelectedPriority('All');
    setSelectedReportStatus('All');
    setSelectedReportLink('All');
    setShowAssets(true);
    setShowCitizenReports(true);
  };

  return (
    <div className="relative w-full bg-zinc-100 flex flex-col overflow-hidden" style={{ height }}>
      {/* 1. Top Unified GIS Command Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
        {/* Title & Spatial Engine Pill */}
        <div className="glass-panel px-4 py-2.5 rounded-2xl border border-civic-border shadow-elevated pointer-events-auto flex items-center gap-4 bg-white/95 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-sm sm:text-base text-civic-dark tracking-tight leading-none">
                CIVIC INTELLIGENCE MAP
              </h1>
              <span className="bg-zinc-100 text-zinc-700 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-zinc-200">
                COIMBATORE
              </span>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                mapEngine === 'google' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {mapEngine === 'google' ? 'GOOGLE MAPS ENGINE' : 'GIS VECTOR ENGINE'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5 hidden sm:block">
              “Spatial digital twin fusing municipal assets with citizen observations.”
            </p>
          </div>

          <div className="h-6 w-px bg-zinc-200 hidden sm:block" />

          {/* Counts */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono font-bold">
            <div>
              <span className="text-[10px] text-zinc-400 block font-sans font-normal">ASSETS</span>
              <span className="text-zinc-900">{filteredAssets.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-purple-600 block font-sans font-normal">REPORTS</span>
              <span className="text-purple-600">{filteredReports.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-red-600 block font-sans font-normal">CRITICAL</span>
              <span className="text-red-600">
                {filteredAssets.filter((a) => a.riskLevel.toLowerCase() === 'critical').length}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="glass-panel p-1.5 rounded-2xl border border-civic-border shadow-elevated pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search roads, bridges, reports or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-44 sm:w-56 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-lime"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="py-1.5 px-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 focus:outline-none hidden sm:block"
          >
            <option value="All">All Risk</option>
            <option value="Critical">Critical (🔴)</option>
            <option value="High">High (🟠)</option>
            <option value="Medium">Medium (🟡)</option>
            <option value="Low">Low (🟢)</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="py-1.5 px-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 focus:outline-none hidden md:block"
          >
            <option value="All">All Priority</option>
            <option value="P1">P1 (Immediate)</option>
            <option value="P2">P2 (High)</option>
            <option value="P3">P3 (Medium)</option>
            <option value="P4">P4 (Routine)</option>
          </select>

          {/* Layer Controls Toggle */}
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              showLayerPanel ? 'bg-civic-dark text-lime border-civic-dark' : 'bg-zinc-50 text-zinc-700 border-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layers</span>
          </button>

          {/* Reset button */}
          {(selectedRisk !== 'All' || selectedType !== 'All' || selectedPriority !== 'All' || selectedReportStatus !== 'All' || selectedReportLink !== 'All' || search) && (
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Current Location GPS Button */}
          <button
            onClick={handleCurrentLocation}
            title="Pan to current GPS location"
            className="p-2 rounded-xl bg-civic-dark text-lime hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer Toggles Popup Panel */}
      <AnimatePresence>
        {showLayerPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 right-4 z-[1001] w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 space-y-3 font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 uppercase">Map Layers & Overlays</span>
              <button onClick={() => setShowLayerPanel(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAssets}
                  onChange={(e) => setShowAssets(e.target.checked)}
                  className="rounded text-lime focus:ring-lime"
                />
                <span className="font-bold text-slate-800">Infrastructure Assets (78)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCitizenReports}
                  onChange={(e) => setShowCitizenReports(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-600"
                />
                <span className="font-bold text-purple-700">Citizen Reports ({citizenReports.length})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRiskOverlays}
                  onChange={(e) => setShowRiskOverlays(e.target.checked)}
                  className="rounded text-red-600"
                />
                <span className="text-slate-700">Risk Color Accents</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPriorityOverlays}
                  onChange={(e) => setShowPriorityOverlays(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span className="text-slate-700">Priority Tier Context</span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Citizen Link Filter</span>
              <select
                value={selectedReportLink}
                onChange={(e) => setSelectedReportLink(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold"
              >
                <option value="All">All Reports</option>
                <option value="Linked">Only Linked Reports</option>
                <option value="Unlinked">Only Unlinked Reports</option>
                <option value="High-Risk Linked">High-Risk Linked Only</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Map Canvas (Unified Container) */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full relative z-0" />

      {/* 3. Bottom Layer & Mode Switcher Controls */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none flex items-center gap-3">
        {/* Layer Switcher */}
        <div className="glass-panel p-1 rounded-xl border border-civic-border bg-white/95 shadow-elevated pointer-events-auto flex items-center gap-1 text-[11px] font-mono font-bold">
          <button
            onClick={() => setMapStyleMode('roadmap')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              mapStyleMode === 'roadmap' ? 'bg-civic-dark text-white' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Roadmap
          </button>
          <button
            onClick={() => setMapStyleMode('satellite')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              mapStyleMode === 'satellite' ? 'bg-civic-dark text-white' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Legend */}
        <div className="glass-panel px-3.5 py-1.5 rounded-xl border border-civic-border bg-white/95 shadow-elevated pointer-events-auto flex items-center gap-3 text-xs hidden md:flex">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Legend</span>
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
            <span className="flex items-center gap-1 pl-2 border-l border-zinc-200">
              <span className="w-2.5 h-2.5 rounded bg-purple-600" />
              <span className="text-purple-700 font-bold">Citizen Report</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Slide-Out Asset Decision Chain & Evidence Drawer */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0, x: 380 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 380 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-4 right-4 bottom-4 w-full max-w-lg z-[1050] flex flex-col pointer-events-auto"
          >
            <div className="relative flex-1 overflow-y-auto rounded-3xl bg-white shadow-2xl border border-zinc-200 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9FFF00]" />
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-civic-dark block">
                      ASSET DECISION TWIN
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-900">{selectedAsset.assetId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/assets/${selectedAsset.assetId}#digital-twin`)}
                    className="px-3 py-1 rounded-xl bg-lime text-civic-dark font-mono text-xs font-black hover:bg-lime-light transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Digital Twin</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => navigate(`/assets/${selectedAsset.assetId}`)}
                    className="px-3 py-1 rounded-xl bg-civic-dark text-white font-mono text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1"
                  >
                    <span>Detail</span>
                  </button>
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Predictive Deterioration Forecast Pill (Prompt 8) */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-2 font-mono text-xs shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-lime">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span className="font-bold text-[10px] uppercase tracking-wide">PREDICTIVE DETERIORATION</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-lime text-civic-dark font-extrabold">
                    PROMPT 8
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[9px] text-zinc-400 block">12M Forecast</span>
                    <span className="font-bold text-white text-xs mt-0.5 block">
                      {Math.max(1, Math.round(selectedAsset.conditionScore - ((selectedAsset.usageScore || 50) * 0.08 + (selectedAsset.exposureScore || 50) * 0.06 + 5)))}/100
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[9px] text-zinc-400 block">Trend</span>
                    <span className="font-bold text-red-400 text-[10px] mt-0.5 block">
                      {(selectedAsset.trendScore || 50) >= 80 || selectedAsset.conditionScore < 30 ? 'ACCELERATING' : 'MODERATE'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[9px] text-zinc-400 block">Maint Window</span>
                    <span className="font-bold text-lime text-[10px] mt-0.5 block">
                      {selectedAsset.conditionScore < 30 ? '0–3M' : selectedAsset.conditionScore < 50 ? '3–6M' : '6–12M'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Citizen Evidence Summary on Asset */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    <span className="font-mono font-bold text-xs text-purple-900">CITIZEN EVIDENCE BASE</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900 font-mono text-[11px] font-bold">
                    {selectedAssetEvidence.length} Observations Linked
                  </span>
                </div>

                {selectedAssetEvidence.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {selectedAssetEvidence.slice(0, 3).map((rep) => (
                      <div
                        key={rep.id}
                        onClick={() => {
                          setSelectedReport(rep);
                          setSelectedAsset(null);
                        }}
                        className="p-2.5 rounded-xl bg-white border border-purple-100 hover:border-purple-300 cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-purple-700 block">{rep.reportId}</span>
                          <span className="text-[11px] text-slate-600">{rep.category} — {rep.status}</span>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-700 font-bold">{rep.validationScore}% verified</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-purple-800 font-sans">
                    No active citizen reports currently linked to this infrastructure corridor.
                  </p>
                )}
              </div>

              {/* 10-Step Decision Chain */}
              <AssetDecisionChain assetId={selectedAsset.id} className="!border-0 !p-0 !shadow-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Slide-Out Citizen Report Inspection Drawer */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0, x: 380 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 380 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-4 right-4 bottom-4 w-full max-w-lg z-[1050] flex flex-col pointer-events-auto"
          >
            <div className="relative flex-1 overflow-y-auto rounded-3xl bg-white shadow-2xl border border-zinc-200 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                  <div>
                    <span className="text-xs font-mono font-bold text-purple-700 block">
                      CITIZEN CIVIC OBSERVATION
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-900">{selectedReport.reportId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/citizen/report/${selectedReport.reportId}`)}
                    className="px-3 py-1 rounded-xl bg-purple-600 text-white font-mono text-xs font-bold hover:bg-purple-700 transition-colors flex items-center gap-1"
                  >
                    <span>Citizen View</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Photo Preview if genuine user uploaded evidence exists */}
              {isUserUploadedPhoto(selectedReport.photoUrl) && (
                <div className="relative h-44 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900">
                  <img
                    src={selectedReport.photoUrl}
                    alt={selectedReport.category}
                    onError={(e) => handleImageError(e, selectedReport.category)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white font-mono text-[10px]">
                    Citizen Uploaded Evidence
                  </div>
                </div>
              )}

              {/* Core Attributes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-bold font-mono">
                    {selectedReport.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      selectedReport.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedReport.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    STATUS: {selectedReport.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed font-sans bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  "{selectedReport.description}"
                </p>
                <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{selectedReport.locationName}</span>
                </div>
              </div>

              {/* Deterministic Validation Score Screening Card */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[10px] uppercase font-bold text-purple-700">CIVICX Validation Score</span>
                  <span className="font-display font-black text-lg text-purple-900">
                    {selectedReport.validationScore} / 100
                  </span>
                </div>
                <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedReport.validationScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-purple-800 font-mono">
                  Screening Status: <strong>{selectedReport.validationStatus}</strong>.
                  <span className="block text-[9px] text-purple-600 mt-0.5">
                    Deterministic 7-signal verification screening, not official government confirmation.
                  </span>
                </p>
              </div>

              {/* Linked CIVICX Asset Correlation */}
              {selectedReportAsset && (
                <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-zinc-800">CIVICX Correlated Digital Twin</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-sm text-civic-dark">{selectedReportAsset.assetId} — {selectedReportAsset.name}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        MCDA Risk: <span className="font-bold text-orange-600">{selectedReportAsset.riskScore}/100</span> • Priority: <span className="font-bold text-purple-600">Rank #{selectedReportAsset.priorityRank}</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Distance: ~{selectedReport.nearestAssetDistanceM ?? 184}m from report
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAsset(selectedReportAsset);
                        setSelectedReport(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-civic-dark text-lime text-xs font-mono font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1"
                    >
                      <span>Inspect Asset</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Timeline status indicator */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-mono space-y-1">
                <div className="flex items-center gap-2 text-zinc-600">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Reported on: {new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedReport.assignedTo && (
                  <p className="text-zinc-600">Assigned: {selectedReport.assignedTo}</p>
                )}
                {selectedReport.actionNotes && (
                  <p className="text-emerald-700 font-bold">Notes: {selectedReport.actionNotes}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
