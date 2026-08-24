import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ShieldAlert, 
  TrendingUp, 
  Sliders, 
  Clock, 
  CheckCircle2, 
  Cpu, 
  Activity, 
  Layers, 
  BarChart3, 
  MapPin, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  Eye, 
  AlertTriangle, 
  FileSpreadsheet, 
  Database, 
  Building2, 
  PieChart, 
  Radio, 
  Navigation, 
  Crosshair, 
  Gauge, 
  Wifi, 
  Waves,
  Maximize2,
  HardDrive,
  Compass,
  Map as MapIcon,
  ShieldCheck,
  Check
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  // Map Layer View Mode (Risk, Monsoon, Traffic)
  const [mapLayerMode, setMapLayerMode] = useState<'risk' | 'monsoon' | 'traffic'>('risk');

  // Smart City Digital Twin Corridor Inspector State
  const [selectedCorridor, setSelectedCorridor] = useState(0);
  const corridors = [
    {
      id: 'RD-1042',
      name: 'Gandhipuram Underpass Inbound',
      zone: 'Central Zone (Ward 42)',
      type: 'Primary Urban Arterial',
      riskScore: 93,
      riskLevel: 'CRITICAL',
      defectCode: 'D40 (Pothole Cluster)',
      confidence: 96.4,
      pcuTraffic: '48,500 PCU/day',
      sensorTelemetry: { vibration: '4.8 mm/s', moisture: '78% (Waterlogged)', deflection: '3.4 mm' },
      immediateFixCost: '₹18.5 Lakhs',
      delay6MoCost: '₹28.1 Lakhs (+52%)',
      recommendedAction: 'Full-Depth Milling & Polymer Modified Overlay',
      coordinates: '11.0168° N, 76.9558° E'
    },
    {
      id: 'BR-0201',
      name: 'Avinashi Road Express Flyover Pier 14',
      zone: 'East Zone (Ward 58)',
      type: 'Grade-Separated Flyover',
      riskScore: 89,
      riskLevel: 'HIGH',
      defectCode: 'D10 (Transverse Shear)',
      confidence: 94.8,
      pcuTraffic: '82,000 PCU/day',
      sensorTelemetry: { vibration: '6.2 mm/s (Elevated)', moisture: '42%', deflection: '4.1 mm' },
      immediateFixCost: '₹34.0 Lakhs',
      delay6MoCost: '₹51.7 Lakhs (+52%)',
      recommendedAction: 'Elastomeric Bearing Replacement & Joint Seal',
      coordinates: '11.0285° N, 77.0012° E'
    },
    {
      id: 'RD-1015',
      name: 'Mettupalayam Corridor Heavy Transit',
      zone: 'North Zone (Ward 14)',
      type: 'Freight Logistics Highway',
      riskScore: 95,
      riskLevel: 'CRITICAL',
      defectCode: 'D20 (Alligator Fatigue Spalling)',
      confidence: 97.1,
      pcuTraffic: '64,200 PCU/day',
      sensorTelemetry: { vibration: '5.1 mm/s', moisture: '65%', deflection: '4.8 mm (Subgrade Failure)' },
      immediateFixCost: '₹24.5 Lakhs',
      delay6MoCost: '₹37.2 Lakhs (+52%)',
      recommendedAction: 'Subgrade Stabilization & Bituminous Base Course',
      coordinates: '11.0521° N, 76.9410° E'
    },
    {
      id: 'RD-1089',
      name: 'Trichy Road Bypass Ch. 4+200',
      zone: 'South Zone (Ward 72)',
      type: 'Suburban Expressway',
      riskScore: 78,
      riskLevel: 'MEDIUM',
      defectCode: 'D00 (Longitudinal Wheelpath Crack)',
      confidence: 91.2,
      pcuTraffic: '38,000 PCU/day',
      sensorTelemetry: { vibration: '2.9 mm/s', moisture: '34%', deflection: '1.8 mm' },
      immediateFixCost: '₹12.0 Lakhs',
      delay6MoCost: '₹18.2 Lakhs (+52%)',
      recommendedAction: 'Preventative Crack Micro-Surfacing',
      coordinates: '10.9840° N, 76.9950° E'
    }
  ];

  // Smart Knapsack Budget Sandbox State
  const [budgetCr, setBudgetCr] = useState<number>(4.0);
  const scheduledAssets = Math.min(78, Math.round(budgetCr * 6.5));
  const riskMitigatedPct = Math.min(100, Math.round(budgetCr * 17.5));
  const savingsCr = (budgetCr * 3.42).toFixed(1);
  const roiMultiplier = (3.4 + (budgetCr / 15) * 1.9).toFixed(2);
  const citizensProtected = Math.round(budgetCr * 2.1 * 10) / 10;

  // 4D City Time Machine Decay State
  const [simulationHorizon, setSimulationHorizon] = useState<'0' | '3' | '6' | '12'>('6');
  const horizonMatrix = {
    '0': {
      title: 'Present Day (T = 0 Months)',
      statusBadge: 'Preventative Window Active',
      statusColor: 'text-emerald-700 border-emerald-200 bg-emerald-50',
      repairCost: '₹18.5 Lakhs',
      costPenalty: '0% (Baseline)',
      riskIndex: 84,
      conditionStatus: 'Surface micro-fissures & surface raveling',
      structuralImpact: 'Subgrade intact. Minor hydro-planing hazard during monsoons.',
      intervention: 'Preventative Surface Milling & Polymer Sealing'
    },
    '3': {
      title: 'Monsoon Cycle (+3 Months)',
      statusBadge: 'Moisture Penetration Active',
      statusColor: 'text-amber-800 border-amber-200 bg-amber-50',
      repairCost: '₹22.4 Lakhs',
      costPenalty: '+21% Delay Penalty',
      riskIndex: 89,
      conditionStatus: 'Water ingress into granular base layer',
      structuralImpact: 'Pothole expansion accelerates 3.2x under bus axle loading.',
      intervention: 'Base Course Patching & Crack Injection'
    },
    '6': {
      title: 'Subgrade Decay (+6 Months)',
      statusBadge: 'Critical Subgrade Collapse',
      statusColor: 'text-orange-800 border-orange-200 bg-orange-50',
      repairCost: '₹28.1 Lakhs',
      costPenalty: '+52% Escalation Penalty',
      riskIndex: 93,
      conditionStatus: 'Shear failure & alligatored structural fatigue',
      structuralImpact: 'Frequent traffic gridlock, axle damage claims & localized inundation.',
      intervention: 'Full-Depth Milling & Pavement Reconstruction'
    },
    '12': {
      title: 'Catastrophic Rupture (+12 Months)',
      statusBadge: 'Emergency Failure Protocol',
      statusColor: 'text-rose-800 border-rose-200 bg-rose-50',
      repairCost: '₹45.3 Lakhs',
      costPenalty: '+145% Emergency Surge',
      riskIndex: 98,
      conditionStatus: 'Complete structural foundation collapse',
      structuralImpact: 'Emergency arterial road closure required during peak corporate hours.',
      intervention: 'Total Subbase Re-engineering & Structural Rebuild'
    }
  };

  const decisionPipeline = [
    {
      step: '01',
      title: 'IoT & Telemetry Ingestion',
      category: 'Smart Sensor Grid',
      desc: '78 geocoded IoT nodes, citizen mobile alerts & drone GIS video streams unified into real-time spatial digital twin telemetry.',
      icon: Wifi,
      accent: 'text-blue-600 border-blue-200 bg-blue-50'
    },
    {
      step: '02',
      title: 'Vision Defect Localization',
      category: 'Deep Learning (RDD2022)',
      desc: 'Automated defect detection bounding boxes with sub-pixel severity estimation across D00-D40 distress categories.',
      icon: Crosshair,
      accent: 'text-emerald-600 border-emerald-200 bg-emerald-50'
    },
    {
      step: '03',
      title: 'Deterministic Risk Engine',
      category: 'Zero Hallucination MCDA',
      desc: '6-factor multi-criteria mathematical scoring weighting condition deficit, damage, network criticality, and traffic loading.',
      icon: ShieldAlert,
      accent: 'text-indigo-600 border-indigo-200 bg-indigo-50'
    },
    {
      step: '04',
      title: 'Explainable Priority Queue',
      category: 'Algorithmic Ranking',
      desc: 'Dynamic urgency-to-cost scaling ranking interventions by lifecycle ROI instead of subjective political FIFO queues.',
      icon: Activity,
      accent: 'text-amber-600 border-amber-200 bg-amber-50'
    },
    {
      step: '05',
      title: 'Natural Language Justifications',
      category: 'Audit Explainability',
      desc: 'Automated natural language justifications explaining exactly why Ward A receives capital prior to Ward B for total governance transparency.',
      icon: Sparkles,
      accent: 'text-purple-600 border-purple-200 bg-purple-50'
    },
    {
      step: '06',
      title: 'Knapsack Budget Optimizer',
      category: '0/1 Optimization Engine',
      desc: 'Mathematical solver finding optimal capital allocation portfolios to maximize citywide risk mitigation under strict fiscal caps.',
      icon: Sliders,
      accent: 'text-blue-600 border-blue-200 bg-blue-50'
    },
    {
      step: '07',
      title: 'City Time Machine',
      category: '5-Year Infrastructure Simulation',
      desc: 'Projects 3, 6, and 12-month decay curves and quantifies severe monetary delay penalties versus immediate preventative fixes.',
      icon: Clock,
      accent: 'text-orange-600 border-orange-200 bg-orange-50'
    },
    {
      step: '08',
      title: 'Executive Municipal Brief',
      category: 'Audit-Ready Reports',
      desc: 'Generates official work orders, zone-wise budget allocations, and 1-click committee-ready PDF executive briefings.',
      icon: FileSpreadsheet,
      accent: 'text-teal-600 border-teal-200 bg-teal-50'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden relative selection:bg-blue-600 selection:text-white">
      {/* Precision Blueprint Grid Pattern Background */}
      <div className="absolute inset-0 motion-grid-pattern pointer-events-none opacity-60 -z-10" />

      {/* Hero Section: Smart City Digital Twin Command Center */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Mission Control Pitch */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Micro Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold tracking-wide">DECISION INTELLIGENCE 2.0</span>
              <span className="text-blue-300">•</span>
              <span className="text-slate-600 font-normal">Coimbatore Smart City Pilot</span>
            </motion.div>

            {/* Smart City Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-black text-4xl sm:text-6xl text-slate-900 tracking-tight leading-[1.08]"
            >
              Autonomous Infrastructure <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600">
                Risk & Digital Twin Platform
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed"
            >
              Transform municipal inspection data, RDD2022-compatible AI vision telemetry, and field surveys into explainable 6-factor MCDA risk rankings, greedy knapsack budget allocation, and multi-year decay curve forecasting.
            </motion.p>

            {/* Action Group */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3.5 pt-2"
            >
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-sm transition-all shadow-md shadow-blue-500/25 group"
              >
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#corridor-inspector"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 transition-all shadow-sm"
              >
                <Crosshair className="w-4 h-4 text-blue-600" />
                <span>Inspect Digital Twin Corridor</span>
              </a>
            </motion.div>

            {/* Live City KPIs Grid */}
            <div className="grid grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Monitored Assets</span>
                <span className="font-display font-black text-2xl text-slate-900">78 Units</span>
                <span className="text-[11px] text-blue-600 font-mono mt-0.5 block font-semibold">5 Coimbatore Zones</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">AI Model Confidence</span>
                <span className="font-display font-black text-2xl text-emerald-600">96.4%</span>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">RDD2022 Benchmark</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Capital Efficiency</span>
                <span className="font-display font-black text-2xl text-blue-600">4.97x ROI</span>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">Preventative Savings</span>
              </div>
            </div>
          </div>

          {/* Right Column: Finished High-Resolution Vector GIS Map of Coimbatore */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xl overflow-hidden"
            >
              {/* Map Header with Layer Switchers */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-900 font-bold tracking-wide">COIMBATORE GIS TWIN</span>
                </div>
                
                {/* Map Layer Switcher Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[10px]">
                  {(['risk', 'monsoon', 'traffic'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setMapLayerMode(mode)}
                      className={`px-2.5 py-1 rounded font-bold transition-all uppercase ${
                        mapLayerMode === mode
                          ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed SVG Vector Map of Coimbatore City (Light Theme) */}
              <div className="mt-3 relative h-72 rounded-xl bg-[#F1F5F9] border border-slate-200 overflow-hidden flex flex-col justify-between p-3 select-none">
                {/* Subtle Cartographic Grid */}
                <div className="absolute inset-0 motion-grid-pattern opacity-40 pointer-events-none" />

                {/* SVG Cartographic Layer */}
                <svg className="w-full h-full absolute inset-0 z-10" viewBox="0 0 500 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Municipal Corporation Boundary Polygon */}
                  <path d="M 50 80 Q 150 40 250 50 T 420 80 L 450 220 Q 350 320 250 310 T 50 250 Z" 
                        fill="rgba(255, 255, 255, 0.7)" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />
                  
                  {/* Coimbatore Lakes & Reservoirs */}
                  {/* Valankulam Lake */}
                  <ellipse cx="255" cy="210" rx="22" ry="12" fill={mapLayerMode === 'monsoon' ? '#7DD3FC' : '#BAE6FD'} stroke="#0284C7" strokeWidth="1.2" />
                  <text x="255" y="213" fill="#0369A1" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Valankulam</text>

                  {/* Singanallur Lake */}
                  <ellipse cx="375" cy="225" rx="30" ry="16" fill={mapLayerMode === 'monsoon' ? '#7DD3FC' : '#BAE6FD'} stroke="#0284C7" strokeWidth="1.2" />
                  <text x="375" y="228" fill="#0369A1" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Singanallur Lake</text>

                  {/* Ukkadam Big Tank */}
                  <ellipse cx="195" cy="235" rx="24" ry="14" fill={mapLayerMode === 'monsoon' ? '#7DD3FC' : '#BAE6FD'} stroke="#0284C7" strokeWidth="1.2" />
                  <text x="195" y="238" fill="#0369A1" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Ukkadam Tank</text>

                  {/* Muthannan Kulam (RS Puram West) */}
                  <ellipse cx="110" cy="180" rx="16" ry="10" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.2" />

                  {/* Primary Arterial Expressways (Clean Light Roads) */}
                  {/* Avinashi Road NH-544 (Gandhipuram to Airport/KMCH) */}
                  <path d="M 230 170 L 310 145 L 390 120 L 465 95" 
                        stroke={mapLayerMode === 'traffic' ? '#E11D48' : '#2563EB'} 
                        strokeWidth={mapLayerMode === 'traffic' ? '4' : '2.5'} 
                        strokeLinecap="round" />
                  <text x="380" y="108" fill="#1E293B" fontSize="6.5" fontFamily="monospace" fontWeight="bold" transform="rotate(-18 380 108)">Avinashi Rd (NH-544)</text>

                  {/* Trichy Road SH-162 (Townhall to Singanallur) */}
                  <path d="M 215 195 L 290 205 L 370 215 L 450 230" 
                        stroke={mapLayerMode === 'traffic' ? '#EA580C' : '#3B82F6'} 
                        strokeWidth="2.2" strokeLinecap="round" />
                  <text x="320" y="198" fill="#1E293B" fontSize="6.5" fontFamily="monospace" fontWeight="bold" transform="rotate(8 320 198)">Trichy Rd (SH-162)</text>

                  {/* Mettupalayam Road NH-181 (RS Puram to Thudiyalur) */}
                  <path d="M 175 190 L 160 120 L 145 60 L 135 20" 
                        stroke={mapLayerMode === 'traffic' ? '#E11D48' : '#2563EB'} 
                        strokeWidth="2.8" strokeLinecap="round" />
                  <text x="135" y="80" fill="#1E293B" fontSize="6.5" fontFamily="monospace" fontWeight="bold" transform="rotate(-78 135 80)">MTP Rd (NH-181)</text>

                  {/* Sathy Road NH-948 (Gandhipuram to Saravanampatti) */}
                  <path d="M 235 160 L 265 105 L 295 50" 
                        stroke="#64748B" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="280" y="75" fill="#1E293B" fontSize="6.5" fontFamily="monospace" fontWeight="bold" transform="rotate(-62 280 75)">Sathy Rd</text>

                  {/* Pollachi Road (Southbound) */}
                  <path d="M 210 240 L 195 300 L 180 350" 
                        stroke="#64748B" strokeWidth="2" strokeLinecap="round" />

                  {/* Gandhipuram Tiered Flyover Hub */}
                  <circle cx="230" cy="170" r="8" fill="rgba(37, 99, 235, 0.15)" stroke="#2563EB" strokeWidth="1.5" />

                  {/* Interactive Asset Hotspots */}
                  {/* Node 1: Gandhipuram Underpass (RD-1042) */}
                  <g className="cursor-pointer group" onClick={() => setSelectedCorridor(0)}>
                    <circle cx="230" cy="170" r="10" fill="rgba(225, 29, 72, 0.2)" className="animate-ping" />
                    <circle cx="230" cy="170" r="5" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1.5" />
                    <rect x="238" y="158" width="62" height="15" rx="3" fill="#FFFFFF" stroke="#E11D48" strokeWidth="1" />
                    <text x="242" y="169" fill="#E11D48" fontSize="7.5" fontFamily="monospace" fontWeight="bold">RD-1042 (93)</text>
                  </g>

                  {/* Node 2: Avinashi Flyover Pier 14 (BR-0201) */}
                  <g className="cursor-pointer group" onClick={() => setSelectedCorridor(1)}>
                    <circle cx="350" cy="132" r="8" fill="rgba(234, 88, 12, 0.2)" className="animate-ping" />
                    <circle cx="350" cy="132" r="4.5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.5" />
                    <rect x="358" y="122" width="62" height="15" rx="3" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1" />
                    <text x="362" y="133" fill="#EA580C" fontSize="7.5" fontFamily="monospace" fontWeight="bold">BR-0201 (89)</text>
                  </g>

                  {/* Node 3: Mettupalayam Arterial (RD-1015) */}
                  <g className="cursor-pointer group" onClick={() => setSelectedCorridor(2)}>
                    <circle cx="155" cy="95" r="9" fill="rgba(225, 29, 72, 0.2)" className="animate-ping" />
                    <circle cx="155" cy="95" r="5" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1.5" />
                    <rect x="85" y="86" width="64" height="15" rx="3" fill="#FFFFFF" stroke="#E11D48" strokeWidth="1" />
                    <text x="89" y="97" fill="#E11D48" fontSize="7.5" fontFamily="monospace" fontWeight="bold">RD-1015 (95)</text>
                  </g>

                  {/* Node 4: Trichy Road Bypass (RD-1089) */}
                  <g className="cursor-pointer group" onClick={() => setSelectedCorridor(3)}>
                    <circle cx="340" cy="210" r="4.5" fill="#D97706" stroke="#FFFFFF" strokeWidth="1.2" />
                    <rect x="348" y="202" width="62" height="15" rx="3" fill="#FFFFFF" stroke="#D97706" strokeWidth="1" />
                    <text x="352" y="213" fill="#D97706" fontSize="7.5" fontFamily="monospace" fontWeight="bold">RD-1089 (78)</text>
                  </g>

                  {/* Node 5: RS Puram Commercial Hub (RD-1011) */}
                  <g className="cursor-pointer">
                    <circle cx="150" cy="190" r="3.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1" />
                    <text x="135" y="205" fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold">RS Puram</text>
                  </g>
                </svg>

                {/* Top Corner Mode Callout */}
                <div className="relative z-20 flex justify-between items-start pointer-events-none">
                  <div className="px-2.5 py-1 rounded bg-white/95 border border-slate-200 text-[10px] font-mono text-blue-700 shadow-sm font-bold">
                    <span>LAYER: {mapLayerMode.toUpperCase()} VIEW</span>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-white/95 border border-slate-200 text-[10px] font-mono text-slate-600 shadow-sm font-semibold">
                    <span>78 ASSETS GEOCODED</span>
                  </div>
                </div>

                {/* Bottom Active Corridor Quick Readout */}
                <div className="relative z-20 flex justify-between items-end text-[10px] font-mono text-slate-600 bg-white/95 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-blue-700 font-bold truncate max-w-[210px]">
                    FOCUS: {corridors[selectedCorridor].name}
                  </span>
                  <span className="text-rose-600 font-bold shrink-0">
                    RISK {corridors[selectedCorridor].riskScore}/100
                  </span>
                </div>
              </div>

              {/* Bottom Real-time Telemetry Indicators */}
              <div className="grid grid-cols-3 gap-2.5 mt-3 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Vibration Peak</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-amber-600">{corridors[selectedCorridor].sensorTelemetry.vibration}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Subgrade Wet</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-blue-600">{corridors[selectedCorridor].sensorTelemetry.moisture.split(' ')[0]}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Monsoon Surge</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-rose-600">+52% Delay</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Smart City Digital Twin Corridor Inspector */}
      <section id="corridor-inspector" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold">
            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
            <span>INTERACTIVE ARTERIAL INSPECTOR</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            Digital Twin Corridor Telemetry
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Select a critical municipal transit corridor to inspect real-time AI vision bounding boxes, structural sensor telemetry, and financial delay escalation penalties.
          </p>
        </div>

        {/* Corridor Selection Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {corridors.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setSelectedCorridor(idx)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 border ${
                selectedCorridor === idx
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-slate-900 shadow-sm'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${c.riskScore >= 90 ? 'bg-rose-500' : 'bg-amber-500'}`} />
              <span>{c.name} ({c.id})</span>
            </button>
          ))}
        </div>

        {/* Active Corridor Digital Twin Display Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          {/* Left Column: Corridor Vision & AI Diagnostic HUD (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                    AI VISION INFERENCE (RDD2022)
                  </span>
                  <span className="text-xs font-mono text-slate-500">{corridors[selectedCorridor].zone}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-1">
                  {corridors[selectedCorridor].name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                  corridors[selectedCorridor].riskScore >= 90
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  RISK INDEX: {corridors[selectedCorridor].riskScore}/100 ({corridors[selectedCorridor].riskLevel})
                </span>
              </div>
            </div>

            {/* Defect Localization Blueprint Screen */}
            <div className="relative h-64 sm:h-72 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
              <div className="absolute inset-0 motion-grid-pattern-dark opacity-25 pointer-events-none" />

              {/* Simulated Defect Video Stage */}
              <div className="text-center space-y-2 z-10 px-4">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-cyan-400">
                  <Crosshair className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="font-display font-bold text-base text-white">{corridors[selectedCorridor].name}</p>
                <p className="text-xs font-mono text-slate-400">GPS: {corridors[selectedCorridor].coordinates} • {corridors[selectedCorridor].pcuTraffic}</p>
              </div>

              {/* Animated AI Defect Bounding Box */}
              <div className="absolute top-[28%] left-[30%] w-[42%] h-[44%] border-2 border-lime-400 rounded-lg bg-lime-500/10 backdrop-blur-sm z-20 pointer-events-none shadow-sm">
                <div className="absolute -top-6 left-0 px-2 py-0.5 bg-lime-400 text-slate-900 font-mono text-[10px] font-black rounded flex items-center gap-1">
                  <span>{corridors[selectedCorridor].defectCode} • {corridors[selectedCorridor].confidence}% CONFIDENCE</span>
                </div>
                <div className="absolute bottom-1 right-2 font-mono text-[10px] text-lime-300 font-bold">
                  SEVERITY: CRITICAL
                </div>
              </div>
            </div>

            {/* IoT Sensor Telemetry Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Vibration Frequency</span>
                <span className="font-mono font-bold text-sm text-amber-700">{corridors[selectedCorridor].sensorTelemetry.vibration}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Moisture Content</span>
                <span className="font-mono font-bold text-sm text-blue-700">{corridors[selectedCorridor].sensorTelemetry.moisture}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Pavement Deflection</span>
                <span className="font-mono font-bold text-sm text-rose-700">{corridors[selectedCorridor].sensorTelemetry.deflection}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Capital Decision & Delay Escalation Impact (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-500 pb-3 border-b border-slate-100 font-bold">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span>DECISION INTELLIGENCE RECOMMENDATION</span>
              </div>

              {/* Recommended Fix */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Target Intervention</span>
                <h4 className="font-display font-bold text-base sm:text-lg text-slate-900">
                  {corridors[selectedCorridor].recommendedAction}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Calculated via 6-factor MCDA engine prioritizing immediate structural integrity before monsoon rain infiltration.
                </p>
              </div>

              {/* Financial Delay Escalation Metric */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Delay Penalty Comparison</span>
                
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-600 font-mono">Immediate Preventative Cost:</span>
                  <span className="font-mono font-bold text-emerald-600">{corridors[selectedCorridor].immediateFixCost}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-mono">Cost at 6-Month Inaction:</span>
                  <span className="font-mono font-bold text-rose-600">{corridors[selectedCorridor].delay6MoCost}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={`/assets/${corridors[selectedCorridor].id.toLowerCase()}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-mono transition-all shadow-md"
              >
                <span>View Complete Telemetry Dossier ({corridors[selectedCorridor].id})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Smart City Time Machine 5-Year Decay Simulation Sandbox */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>CITY TIME MACHINE · 5-YEAR SIMULATION</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            Simulate Non-Linear Infrastructure Decay
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Infrastructure deterioration compounds non-linearly. Explore how delaying preventative fixes escalates costs by +52% at 6 months and +145% at 12 months.
          </p>
        </div>

        {/* Time Horizon Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {(['0', '3', '6', '12'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setSimulationHorizon(h)}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                simulationHorizon === h
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:text-slate-900 shadow-sm'
              }`}
            >
              {h === '0' ? 'Day 0 (Present Window)' : `+${h} Months Horizon`}
            </button>
          ))}
        </div>

        {/* Time Machine Horizon Matrix Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-mono font-bold border mb-2 ${horizonMatrix[simulationHorizon].statusColor}`}>
                {horizonMatrix[simulationHorizon].statusBadge}
              </span>
              <h3 className="font-display font-bold text-2xl text-slate-900">
                {horizonMatrix[simulationHorizon].title}
              </h3>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Projected Capital Cost</span>
              <span className="font-display font-black text-3xl text-slate-900">{horizonMatrix[simulationHorizon].repairCost}</span>
              <span className="text-xs font-mono text-rose-600 font-bold block mt-0.5">{horizonMatrix[simulationHorizon].costPenalty}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Compound Risk Score</span>
              <p className="font-display font-black text-3xl text-rose-600">{horizonMatrix[simulationHorizon].riskIndex} / 100</p>
              <p className="text-xs text-slate-600">{horizonMatrix[simulationHorizon].conditionStatus}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Structural Impact</span>
              <p className="text-sm font-semibold text-slate-800 mt-1 leading-relaxed">{horizonMatrix[simulationHorizon].structuralImpact}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Required Municipal Action</span>
              <p className="text-sm font-bold text-blue-700 mt-1">{horizonMatrix[simulationHorizon].intervention}</p>
              <Link
                to="/simulation"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-600 hover:underline"
              >
                <span>Launch Full Simulation Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Knapsack Budget Allocator Sandbox */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 border-t border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold">
              <Sliders className="w-3.5 h-3.5" />
              <span>0/1 KNAPSACK OPTIMIZER</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
              Dynamic Municipal Capital Allocation Sandbox
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Drag the municipal capital allocation slider to calculate the mathematically optimal subset of infrastructure repairs that maximizes citywide risk mitigation under strict fiscal caps.
            </p>

            {/* Interactive Slider */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center font-mono">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Available Municipal Budget:</span>
                <span className="text-2xl font-display font-black text-blue-600">₹{budgetCr.toFixed(1)} Crores</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15.0"
                step="0.5"
                value={budgetCr}
                onChange={(e) => setBudgetCr(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer bg-slate-200 h-2 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Min ₹0.5 Cr</span>
                <span>Fiscal Target ₹7.5 Cr</span>
                <span>Max ₹15.0 Cr</span>
              </div>
            </div>
          </div>

          {/* Dynamic Outputs Matrix */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Prioritized Repairs</span>
              <p className="font-display font-black text-2xl sm:text-3xl text-slate-900">{scheduledAssets} / 78</p>
              <span className="text-xs text-blue-600 font-mono block font-semibold">Assets Scheduled</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Risk Points Mitigated</span>
              <p className="font-display font-black text-2xl sm:text-3xl text-emerald-600">-{riskMitigatedPct}%</p>
              <span className="text-xs text-emerald-600 font-mono block font-semibold">Citywide Deficit Drop</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Preventative ROI</span>
              <p className="font-display font-black text-2xl sm:text-3xl text-blue-600">{roiMultiplier}x</p>
              <span className="text-xs text-slate-500 font-mono block">Vs Reactive FIFO</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Net Municipal Savings</span>
              <p className="font-display font-black text-2xl sm:text-3xl text-indigo-600">₹{savingsCr} Cr</p>
              <span className="text-xs text-slate-500 font-mono block">{citizensProtected}L Citizens Protected</span>
            </div>

            <div className="col-span-2 pt-2">
              <Link
                to="/budget"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono transition-all shadow-sm"
              >
                <span>Launch Enterprise Knapsack Optimizer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Stage Smart City Decision Architecture */}
      <section id="pipeline" className="py-20 bg-slate-50 border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono">
              Smart City Decision Pipeline
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
              End-to-End Decision Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              How CIVICX transforms raw municipal telemetry into explainable risk rankings and committee-ready work orders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {decisionPipeline.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-600 text-white">
                      STAGE {step.step}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${step.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {step.title}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mt-0.5 font-semibold">
                      {step.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Launch Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-semibold mb-4 backdrop-blur-md">
            <Building2 className="w-3.5 h-3.5" />
            <span>COIMBATORE MUNICIPAL CORPORATION PILOT</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight">
            Ready to Explore the Smart City Command Center?
          </h2>

          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto mt-3 mb-8 leading-relaxed">
            Gain immediate spatial visibility across 78 geocoded infrastructure assets, execute knapsack capital optimization, and simulate non-linear decay horizons.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-display font-bold text-sm transition-all shadow-lg group"
            >
              <span>Enter Municipal Command Center</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-sm transition-all backdrop-blur-md"
            >
              <MapIcon className="w-4 h-4 text-emerald-300" />
              <span>Open Spatial Risk Map</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};



