import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  Filter,
  Search,
  RotateCcw,
  Layers,
  Building2,
  Zap,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  HardHat,
  XCircle,
  Copy,
  X,
  Eye,
  Activity,
  Calendar,
  Camera,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  FileText,
  Check,
  Scan
} from 'lucide-react';
import { ApiService } from '../services/api';
import { CitizenReport, Asset, CivicReportStats, CitizenReportEvent } from '../types';
import { formatINR } from '../utils/formatters';
import { AssetDecisionChain } from '../components/common/AssetDecisionChain';
import { AIInspectionModal } from '../components/inspection/AIInspectionModal';
import { getAssetImage, handleImageError } from '../utils/imageFallback';

export const CivicReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<CivicReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedValidation, setSelectedValidation] = useState('All');
  const [selectedAssetStatus, setSelectedAssetStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Selected Report for Drawer
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<CitizenReportEvent[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Action Modals State
  const [activeModal, setActiveModal] = useState<'VALIDATE' | 'DUPLICATE' | 'REJECT' | 'PRIORITIZE' | 'ASSIGN' | 'START_WORK' | 'RESOLVE' | 'MANUALLY_LINK_ASSET' | null>(null);

  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Form states for modals
  const [duplicateTargetId, setDuplicateTargetId] = useState('');
  const [targetAssetOverride, setTargetAssetOverride] = useState('');
  const [rejectReason, setRejectReason] = useState('Insufficient photographic evidence or non-municipal jurisdiction.');
  const [assignDept, setAssignDept] = useState('Road Maintenance');
  const [assignEngineer, setAssignEngineer] = useState('Central Zone Field Division');
  const [assignPriority, setAssignPriority] = useState('HIGH');
  const [assignTargetDate, setAssignTargetDate] = useState('2026-08-28');
  const [resolveDescription, setResolveDescription] = useState('Road pothole cluster patched, leveled, and bitumen surface restored to standard municipal grade.');
  const [resolvePhoto, setResolvePhoto] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [repData, assetData, statsData] = await Promise.all([
        ApiService.getGovernmentCivicReports(),
        ApiService.getAssets(),
        ApiService.getCivicReportStats()
      ]);
      setReports(repData);
      setAssets(assetData);
      setStats(statsData);

      if (selectedReport) {
        const updatedSelected = repData.find(r => r.id === selectedReport.id || r.reportId === selectedReport.reportId);
        if (updatedSelected) setSelectedReport(updatedSelected);
      }
    } catch (err) {
      console.error('Failed to load civic reports queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // When drawer opens, load timeline events
  useEffect(() => {
    if (selectedReport) {
      ApiService.getCivicReportTimeline(selectedReport.id).then(setTimelineEvents).catch(() => {});
      setTargetAssetOverride(selectedReport.nearestAssetId || '');
    }
  }, [selectedReport]);

  // Correlated Asset for Selected Report
  const correlatedAsset = useMemo(() => {
    if (!selectedReport || !selectedReport.nearestAssetId) return null;
    return assets.find((a) => a.assetId === selectedReport.nearestAssetId || a.id === selectedReport.nearestAssetId) || null;
  }, [selectedReport, assets]);

  // Map from asset ID to asset object for table lookup
  const assetMap = useMemo(() => {
    const map = new Map<string, Asset>();
    assets.forEach(a => {
      map.set(a.assetId, a);
      map.set(a.id, a);
    });
    return map;
  }, [assets]);

  // Filtered reports with sorting
  const filteredReports = useMemo(() => {
    const result = reports.filter((r) => {
      const matchesZone = selectedZone === 'All' || r.zone?.toLowerCase() === selectedZone.toLowerCase();
      const matchesCategory = selectedCategory === 'All' || r.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesStatus = selectedStatus === 'All' || r.status.toLowerCase() === selectedStatus.toLowerCase();
      
      const linkedAsset = r.nearestAssetId ? assetMap.get(r.nearestAssetId) : null;
      const assetRisk = linkedAsset ? linkedAsset.riskLevel : 'Medium';
      const matchesRisk = selectedRisk === 'All' || assetRisk.toLowerCase() === selectedRisk.toLowerCase();

      const matchesValidation =
        selectedValidation === 'All' ||
        (selectedValidation === 'High' && r.validationScore >= 80) ||
        (selectedValidation === 'Medium' && r.validationScore >= 50 && r.validationScore < 80) ||
        (selectedValidation === 'Low' && r.validationScore < 50);

      const matchesAsset =
        selectedAssetStatus === 'All' ||
        (r.assetLinkStatus && r.assetLinkStatus.toLowerCase() === selectedAssetStatus.toLowerCase()) ||
        (selectedAssetStatus === 'Linked' && r.nearestAssetId);

      const matchesSearch =
        !search.trim() ||
        r.reportId.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.locationName.toLowerCase().includes(search.toLowerCase()) ||
        (r.nearestAssetId && r.nearestAssetId.toLowerCase().includes(search.toLowerCase()));

      return matchesZone && matchesCategory && matchesStatus && matchesRisk && matchesValidation && matchesAsset && matchesSearch;
    });

    // Sort
    if (selectedSort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (selectedSort === 'highest_risk') {
      result.sort((a, b) => {
        const aRisk = a.nearestAssetId && assetMap.get(a.nearestAssetId) ? assetMap.get(a.nearestAssetId)!.riskScore : 50;
        const bRisk = b.nearestAssetId && assetMap.get(b.nearestAssetId) ? assetMap.get(b.nearestAssetId)!.riskScore : 50;
        return bRisk - aRisk;
      });
    } else if (selectedSort === 'highest_priority') {
      const pMap: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      result.sort((a, b) => (pMap[b.priority] || 1) - (pMap[a.priority] || 1));
    } else if (selectedSort === 'lowest_validation') {
      result.sort((a, b) => a.validationScore - b.validationScore);
    } else if (selectedSort === 'longest_pending') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [reports, selectedZone, selectedCategory, selectedStatus, selectedRisk, selectedValidation, selectedAssetStatus, selectedSort, search, assetMap]);

  // Modal Handlers
  const handleConfirmValidate = async () => {
    if (!selectedReport) return;
    setIsSubmittingAction(true);
    try {
      const updated = await ApiService.validateCivicReport(selectedReport.id, actionNotes || 'Municipal Engineer confirmed validation.');
      setSelectedReport(updated);
      await fetchAllData();
      setActiveModal(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmPrioritize = async () => {
    if (!selectedReport) return;
    setIsSubmittingAction(true);
    try {
      const updated = await ApiService.prioritizeCivicReport(selectedReport.id, assignPriority, actionNotes || 'Prioritized for municipal dispatch.');
      setSelectedReport(updated);
      await fetchAllData();
      setActiveModal(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmAssetLink = async () => {
    if (!selectedReport || !targetAssetOverride) return;
    setIsSubmittingAction(true);
    try {
      const updated = await ApiService.manuallyLinkReportAsset(selectedReport.id, targetAssetOverride, actionNotes || 'Manually confirmed by Municipal Engineer.');
      setSelectedReport(updated);
      await fetchAllData();
      setActiveModal(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!selectedReport) return;
    setIsSubmittingAction(true);
    try {
      const updated = await ApiService.markCivicReportDuplicate(selectedReport.id, duplicateTargetId || 'CIV-2026-00001', actionNotes);
      setSelectedReport(updated);
      await fetchAllData();
      setActiveModal(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedReport) return;
    setIsSubmittingAction(true);
    try {
      const updated = await ApiService.rejectCivicReport(selectedReport.id, rejectReason, actionNotes);
      setSelectedReport(updated);
      await fetchAllData();
      setActiveModal(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedReport) return;
    setIsSubmittingAction(true);
    try {
      const updated = await ApiService.assignCivicReportWorkflow(
        selectedReport.id,
        assignDept,
        assignEngineer,
        assignPriority,
        assignTargetDate,
        actionNotes
      );
      setSelectedReport(updated);
      await fetchAllData();
      setActiveModal(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmStartWork = async () => {
    if (!selectedReport) return;
    setIsSubmittingAction(true);
    try {
      const updated = await ApiService.startWorkOnCivicReport(selectedReport.id, actionNotes || 'Field crew on-site.');
      setSelectedReport(updated);
      await fetchAllData();
      setActiveModal(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!selectedReport) return;
    setIsSubmittingAction(true);
    try {
      const updated = await ApiService.resolveCivicReport(
        selectedReport.id,
        resolveDescription,
        new Date().toISOString().split('T')[0],
        resolvePhoto,
        actionNotes
      );
      setSelectedReport(updated);
      await fetchAllData();
      setActiveModal(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedZone('All');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedRisk('All');
    setSelectedValidation('All');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ASSIGNED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'VALIDATED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'UNDER_REVIEW':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'DUPLICATE':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-900 border-orange-300 font-bold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEEF5] text-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[11px] font-mono font-bold border border-purple-200">
                GOVERNMENT CIVIC REPORT CENTER
              </span>
              <span className="text-xs font-mono text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-600 font-semibold">Municipal Operations Console</span>
            </div>
            <h1 className="font-display font-black text-3xl text-slate-900 mt-1 tracking-tight">
              Citizen Intelligence & Decision Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
              Screen citizen-reported infrastructure evidence, evaluate 7-signal deterministic verification, correlate with monitored digital twins, and authorize municipal work orders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-mono font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* 6 TOP KPI CARDS (Actual Backend Data) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
          <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">NEW REPORTS</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl text-slate-900">
                {stats?.newReports ?? reports.filter(r => r.status === 'SUBMITTED').length}
              </span>
              <span className="text-[10px] text-slate-500 font-sans">Submitted</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-1">
            <span className="text-[10px] text-amber-800 uppercase tracking-wider font-bold block">UNDER REVIEW</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl text-amber-700">
                {stats?.underReview ?? reports.filter(r => r.status === 'UNDER_REVIEW').length}
              </span>
              <span className="text-[10px] text-amber-800 font-sans">Screening</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-1">
            <span className="text-[10px] text-purple-800 uppercase tracking-wider font-bold block">VALIDATED</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl text-purple-700">
                {stats?.validated ?? reports.filter(r => ['VALIDATED', 'PRIORITIZED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(r.status)).length}
              </span>
              <span className="text-[10px] text-purple-800 font-sans">Evidence</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-1">
            <span className="text-[10px] text-rose-800 uppercase tracking-wider font-bold block">HIGH-RISK LINKED</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl text-rose-700">
                {stats?.highRiskLinked ?? reports.filter(r => {
                  const ast = r.nearestAssetId ? assetMap.get(r.nearestAssetId) : null;
                  return ast ? (ast.riskLevel === 'Critical' || ast.riskLevel === 'High') : (r.severity === 'High' || r.severity === 'Critical');
                }).length}
              </span>
              <span className="text-[10px] text-rose-800 font-sans">Critical corridors</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-1">
            <span className="text-[10px] text-blue-800 uppercase tracking-wider font-bold block">IN PROGRESS</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl text-blue-700">
                {stats?.inProgress ?? reports.filter(r => r.status === 'IN_PROGRESS' || r.status === 'PRIORITIZED').length}
              </span>
              <span className="text-[10px] text-blue-800 font-sans">Field crews</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-1">
            <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold block">RESOLVED</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl text-emerald-600">
                {stats?.resolved ?? reports.filter(r => r.status === 'RESOLVED').length}
              </span>
              <span className="text-[10px] text-emerald-800 font-sans">Completed</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px] flex-wrap">
            {/* Search */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search report ID, asset, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VALIDATED">Validated</option>
              <option value="PRIORITIZED">Prioritized</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DUPLICATE">Duplicate</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-700 focus:outline-none hidden sm:block"
            >
              <option value="All">All Categories</option>
              <option value="Pothole">Pothole</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Drainage / Flooding">Drainage / Flooding</option>
              <option value="Bridge / Flyover Damage">Bridge / Flyover Damage</option>
              <option value="Street Infrastructure">Street Infrastructure</option>
            </select>

            {/* Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-700 focus:outline-none hidden lg:block"
            >
              <option value="All">All Risk</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Asset Link Status Filter */}
            <select
              value={selectedAssetStatus}
              onChange={(e) => setSelectedAssetStatus(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-700 focus:outline-none hidden xl:block"
            >
              <option value="All">All Asset Links</option>
              <option value="Linked">Any Linked Asset</option>
              <option value="POTENTIAL_MATCH">Potential Match</option>
              <option value="MANUALLY_LINKED">Manually Linked</option>
              <option value="NO_ASSET_FOUND">No Asset</option>
            </select>

            {/* Sort Order */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-700 focus:outline-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="highest_risk">Sort: Highest Risk</option>
              <option value="highest_priority">Sort: Highest Priority</option>
              <option value="lowest_validation">Sort: Lowest Screening</option>
              <option value="longest_pending">Sort: Longest Pending</option>
            </select>
          </div>

          {(selectedZone !== 'All' || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedRisk !== 'All' || selectedValidation !== 'All' || selectedAssetStatus !== 'All' || search) && (
            <button
              onClick={resetFilters}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* HIGH-DENSITY REPORT TABLE */}
        <div className="rounded-3xl bg-white border border-slate-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-100 border-b border-slate-300 font-mono text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">REPORT ID</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">LOCATION</th>
                  <th className="py-3 px-4">NEAREST CIVICX ASSET</th>
                  <th className="py-3 px-4">VALIDATION</th>
                  <th className="py-3 px-4">RISK</th>
                  <th className="py-3 px-4">PRIORITY</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">SUBMITTED</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReports.map((rep) => {
                  const linked = rep.nearestAssetId ? assetMap.get(rep.nearestAssetId) : null;
                  const riskLevel = linked ? linked.riskLevel : 'Medium';
                  const isSelected = selectedReport?.id === rep.id;

                  return (
                    <tr
                      key={rep.id}
                      onClick={() => setSelectedReport(rep)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-purple-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-purple-700 whitespace-nowrap">
                        {rep.reportId}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {rep.category}
                      </td>

                      <td className="py-3 px-4 max-w-[200px] truncate font-mono text-slate-600">
                        {rep.locationName}
                      </td>

                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        {rep.nearestAssetId ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-blue-700">{rep.nearestAssetId}</span>
                            <span className="text-[10px] text-slate-400">({rep.nearestAssetDistanceM ?? 184}m)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">None detected</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        <span className="font-bold text-slate-900">{rep.validationScore}%</span>
                      </td>

                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${getRiskBadge(riskLevel)}`}>
                          {riskLevel.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] border font-bold ${getStatusBadge(rep.status)}`}>
                          {rep.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(rep);
                          }}
                          className="px-3 py-1 rounded-xl bg-civic-dark text-lime hover:bg-zinc-800 font-mono text-[11px] font-bold transition-colors"
                        >
                          VIEW →
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

      {/* REPORT DETAIL DRAWER (SLIDE-OUT OPERATION CONSOLE) */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 500 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 500 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Scrollable Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                      {selectedReport.reportId}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-xl text-slate-900">
                        {selectedReport.category}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">{selectedReport.locationName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReport(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 1. CITIZEN REPORT */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    CITIZEN REPORT INTAKE
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">SUBMITTED</span>
                      <span className="font-bold text-slate-900">{new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">CONTRIBUTOR</span>
                      <span className="font-bold text-slate-900">{selectedReport.userName || 'Citizen'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">ZONE</span>
                      <span className="font-bold text-slate-900">{selectedReport.zone || 'Central Zone'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">CURRENT STATUS</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getStatusBadge(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 block mb-1">OBSERVED DESCRIPTION</span>
                    <p className="text-xs font-sans text-slate-800 leading-relaxed font-normal">
                      "{selectedReport.description}"
                    </p>
                  </div>
                </div>

                {/* 2. PHOTO EVIDENCE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-500 block">
                      PHOTO EVIDENCE
                    </span>
                    <button
                      onClick={() => setIsAIModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 text-lime hover:bg-zinc-800 text-[11px] font-mono font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>RUN AI SCREENING</span>
                    </button>
                  </div>
                  {selectedReport.photoUrl ? (
                    <div className="h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 relative group">
                      <img
                        src={getAssetImage(selectedReport.photoUrl, selectedReport.category)}
                        alt={selectedReport.category}
                        onError={(e) => handleImageError(e, selectedReport.category)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-mono">
                        Citizen Photographic Telemetry
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <button
                          onClick={() => setIsAIModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-lime font-mono text-[11px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all shadow-md"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Defect Localization →</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs font-mono text-slate-500">
                      No photo evidence provided
                    </div>
                  )}
                </div>


                {/* 3. LOCATION & COORDINATES */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900">{selectedReport.locationName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {selectedReport.latitude.toFixed(4)}° N, {selectedReport.longitude.toFixed(4)}° E
                    </span>
                  </div>
                </div>

                {/* 4. CIVICX VALIDATION SCORE & FACTORS */}
                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-purple-700 block">
                        CIVICX VALIDATION SCORE
                      </span>
                      <p className="font-display font-black text-2xl text-purple-900 mt-0.5">
                        {selectedReport.validationScore} / 100
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-purple-200 text-purple-900 text-xs font-bold">
                      {selectedReport.validationStatus}
                    </span>
                  </div>

                  {selectedReport.validationFactors && selectedReport.validationFactors.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-purple-200">
                      {selectedReport.validationFactors.map((f, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white/80 border border-purple-100 flex items-start justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{f.signal}</span>
                            <p className="text-[10px] text-slate-500 font-sans mt-0.5">{f.detail}</p>
                          </div>
                          <span className="text-emerald-700 font-bold">+{f.score}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] font-sans text-purple-800 font-medium">
                    <em>CIVICX screening result — final validation remains a municipal decision.</em>
                  </p>
                </div>

                {/* 5. IMPORTANT RISK RULE: CITIZEN SEVERITY VS CIVICX ASSESSED RISK */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-lime">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="font-bold uppercase tracking-wider text-[11px]">EVIDENCE SIGNAL VS OFFICIAL RISK</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-zinc-400 block">Citizen Reported Severity:</span>
                      <span className="font-display font-bold text-sm text-amber-300">
                        {selectedReport.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-zinc-400 block">CIVICX Assessed Risk:</span>
                      <span className="font-display font-bold text-sm text-lime">
                        {correlatedAsset ? `${correlatedAsset.riskLevel.toUpperCase()} — ${correlatedAsset.riskScore}/100` : 'HIGH — 86/100'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed font-normal">
                    "Citizen severity is treated as an evidence signal. Official CIVICX risk is calculated by the deterministic 6-factor risk engine."
                  </p>
                </div>

                {/* 6. NEAREST CIVICX ASSET MATCHING */}
                {correlatedAsset && (
                  <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-blue-700 block">
                          POTENTIALLY LINKED ASSET
                        </span>
                        <h4 className="font-display font-black text-xl text-blue-900 mt-0.5">
                          {correlatedAsset.assetId} — {correlatedAsset.name}
                        </h4>
                        <span className="text-xs text-blue-600 font-sans">{correlatedAsset.type} • {correlatedAsset.location}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 text-xs font-bold">
                        Distance: {selectedReport.nearestAssetDistanceM ?? 184} m
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                        <span className="text-[9px] text-slate-400 block font-bold">RISK</span>
                        <span className="font-bold text-rose-600">{correlatedAsset.riskScore} / 100</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                        <span className="text-[9px] text-slate-400 block font-bold">PRIORITY</span>
                        <span className="font-bold text-slate-900">#{correlatedAsset.priorityRank}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                        <span className="text-[9px] text-slate-400 block font-bold">CONDITION</span>
                        <span className="font-bold text-slate-900">{correlatedAsset.conditionScore} / 100</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-sans">
                        Cost: <strong>{formatINR(correlatedAsset.estimatedRepairCost)}</strong>
                      </span>
                      <button
                        onClick={() => navigate(`/assets/${correlatedAsset.id}`)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <span>VIEW ASSET INTELLIGENCE</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. EVIDENCE FUSION & 10-STEP DECISION CHAIN */}
                {correlatedAsset && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    {/* Fusion Badge */}
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-mono text-xs font-bold text-center">
                      CITIZEN EVIDENCE + EXISTING INFRASTRUCTURE EVIDENCE
                    </div>

                    <span className="text-xs font-mono font-bold uppercase text-slate-500 block">
                      10-Step Municipal Decision Chain
                    </span>
                    <AssetDecisionChain assetId={correlatedAsset.id} />
                  </div>
                )}

                {/* 7.5. CITIZEN CONTRIBUTION & RECOGNITION */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-lime font-bold uppercase tracking-wider text-[11px]">
                      CITIZEN CONTRIBUTION & RECOGNITION
                    </span>
                    <span className="text-lime font-bold">
                      +{selectedReport.status === 'RESOLVED' ? 410 : ['ASSIGNED', 'IN_PROGRESS'].includes(selectedReport.status) ? 160 : selectedReport.status === 'VALIDATED' ? 60 : 10} PTS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Contributor:</span>
                      <span className="font-bold text-white">{selectedReport.userName || 'Civic Contributor'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Report Ref:</span>
                      <span className="font-bold text-purple-300">{selectedReport.reportId}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[9px] text-zinc-400 block">SUBMIT</span>
                      <span className="font-bold text-emerald-400">+10 ✓</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[9px] text-zinc-400 block">VALIDATE</span>
                      <span className={`font-bold ${['VALIDATED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(selectedReport.status) ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {['VALIDATED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(selectedReport.status) ? '+50 ✓' : '+50'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[9px] text-zinc-400 block">ACTION</span>
                      <span className={`font-bold ${['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(selectedReport.status) ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(selectedReport.status) ? '+100 ✓' : '+100'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                      <span className="text-[9px] text-zinc-400 block">RESOLVE</span>
                      <span className={`font-bold ${selectedReport.status === 'RESOLVED' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {selectedReport.status === 'RESOLVED' ? '+250 ✓' : '+250'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans">
                    <em>Points calculated automatically from municipal operational transitions.</em>
                  </p>
                </div>

                {/* 8. GOVERNMENT AUDIT TRAIL / TIMELINE */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono">
                  <span className="text-xs font-bold uppercase text-slate-500 block">
                    GOVERNMENT AUDIT TRAIL
                  </span>

                  <div className="space-y-3">
                    {timelineEvents.map((ev) => (
                      <div key={ev.id} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-bold text-purple-700">{ev.eventType}</span>
                            <span className="text-slate-400">by {ev.actorId}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-sans mt-0.5">{ev.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STICKY BOTTOM ACTION SECTION */}
              <div className="p-6 bg-slate-100 border-t border-slate-300 space-y-3 sticky bottom-0 z-10">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-600 block">
                  GOVERNMENT OPERATIONS ACTIONS
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  {/* Validate */}
                  <button
                    onClick={() => setActiveModal('VALIDATE')}
                    disabled={selectedReport.status !== 'SUBMITTED' && selectedReport.status !== 'UNDER_REVIEW'}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VALIDATE</span>
                  </button>

                  {/* Prioritize */}
                  <button
                    onClick={() => setActiveModal('PRIORITIZE')}
                    disabled={selectedReport.status !== 'VALIDATED'}
                    className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>PRIORITIZE</span>
                  </button>

                  {/* Assign */}
                  <button
                    onClick={() => setActiveModal('ASSIGN')}
                    disabled={!['VALIDATED', 'PRIORITIZED'].includes(selectedReport.status)}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <HardHat className="w-3.5 h-3.5" />
                    <span>ASSIGN</span>
                  </button>

                  {/* Start Work */}
                  <button
                    onClick={() => setActiveModal('START_WORK')}
                    disabled={selectedReport.status !== 'ASSIGNED'}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>START WORK</span>
                  </button>

                  {/* Mark Resolved */}
                  <button
                    onClick={() => setActiveModal('RESOLVE')}
                    disabled={selectedReport.status !== 'IN_PROGRESS'}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>RESOLVE</span>
                  </button>

                  {/* Link / Override Asset */}
                  <button
                    onClick={() => setActiveModal('MANUALLY_LINK_ASSET')}
                    disabled={selectedReport.status === 'RESOLVED'}
                    className="p-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>LINK ASSET</span>
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => setActiveModal('DUPLICATE')}
                    disabled={selectedReport.status === 'RESOLVED'}
                    className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>DUPLICATE</span>
                  </button>

                  {/* Reject */}
                  <button
                    onClick={() => setActiveModal('REJECT')}
                    disabled={selectedReport.status === 'RESOLVED'}
                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed text-rose-700 border border-rose-200 font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>REJECT</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRIORITIZE MODAL */}
      <AnimatePresence>
        {activeModal === 'PRIORITIZE' && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Prioritize Report for Action
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Priority Tier</label>
                  <select
                    value={assignPriority}
                    onChange={(e) => setAssignPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800"
                  >
                    <option value="CRITICAL">P1 — Critical (Immediate Hazard)</option>
                    <option value="HIGH">P2 — High Priority (Within 48h)</option>
                    <option value="MEDIUM">P3 — Medium Priority (Scheduled Maintenance)</option>
                    <option value="LOW">P4 — Low Priority (Routine)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Prioritization Notes</label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter dispatch notes or municipal justification..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmPrioritize}
                  disabled={isSubmittingAction}
                  className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold transition-colors shadow-md"
                >
                  {isSubmittingAction ? 'PRIORITIZING...' : 'CONFIRM PRIORITIZATION'}
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUALLY LINK ASSET MODAL */}
      <AnimatePresence>
        {activeModal === 'MANUALLY_LINK_ASSET' && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-blue-700">
                  <Layers className="w-5 h-5" />
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Link / Override Infrastructure Asset
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Select Monitored Asset</label>
                  <select
                    value={targetAssetOverride}
                    onChange={(e) => setTargetAssetOverride(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800"
                  >
                    <option value="">Select infrastructure corridor...</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.assetId}>
                        {a.assetId} — {a.name} ({a.type}, Risk: {a.riskScore}/100)
                      </option>
                    ))}
                    <option value="UNLINK">Unlink from any asset</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Reason / Survey Note</label>
                  <input
                    type="text"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="e.g. Verified structural correlation via field inspection"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-sans"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmAssetLink}
                  disabled={isSubmittingAction || !targetAssetOverride}
                  className="flex-1 py-3 rounded-xl bg-civic-dark text-white font-mono text-xs font-bold transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmittingAction ? 'LINKING ASSET...' : 'CONFIRM ASSET LINK'}
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. VALIDATION MODAL */}
      <AnimatePresence>
        {activeModal === 'VALIDATE' && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-purple-700">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Validate this citizen report?
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Report ID:</span>
                  <span className="font-bold text-purple-700">{selectedReport.reportId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-bold text-slate-900">{selectedReport.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nearest Asset:</span>
                  <span className="font-bold text-blue-700">{selectedReport.nearestAssetId || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validation Score:</span>
                  <span className="font-bold text-emerald-700">{selectedReport.validationScore} / 100</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmValidate}
                  disabled={isSubmittingAction}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold transition-colors shadow-md"
                >
                  {isSubmittingAction ? 'VALIDATING...' : 'CONFIRM VALIDATION'}
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 11. DUPLICATE MODAL */}
      <AnimatePresence>
        {activeModal === 'DUPLICATE' && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800">
                  <Copy className="w-5 h-5" />
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Link this report to existing report?
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <label className="text-[11px] text-slate-600 font-bold block">
                  Select Existing Active Report ID:
                </label>
                <select
                  value={duplicateTargetId}
                  onChange={(e) => setDuplicateTargetId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800"
                >
                  <option value="">Select target report...</option>
                  {reports.filter(r => r.id !== selectedReport.id).map(r => (
                    <option key={r.id} value={r.reportId}>
                      {r.reportId} — {r.category} ({r.locationName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDuplicate}
                  disabled={isSubmittingAction || !duplicateTargetId}
                  className="flex-1 py-3 rounded-xl bg-civic-dark text-white font-mono text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmittingAction ? 'LINKING DUPLICATE...' : 'CONFIRM DUPLICATE LINK'}
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 12. ASSIGNMENT MODAL */}
      <AnimatePresence>
        {activeModal === 'ASSIGN' && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-blue-700">
                  <HardHat className="w-5 h-5" />
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Assign Municipal Work Order
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Department</label>
                  <select
                    value={assignDept}
                    onChange={(e) => setAssignDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold"
                  >
                    <option value="Road Maintenance">Road Maintenance</option>
                    <option value="Stormwater Drainage">Stormwater Drainage</option>
                    <option value="Bridge Maintenance">Bridge Maintenance</option>
                    <option value="Public Works">Public Works</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Engineer / Team</label>
                  <input
                    type="text"
                    value={assignEngineer}
                    onChange={(e) => setAssignEngineer(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Priority</label>
                    <select
                      value={assignPriority}
                      onChange={(e) => setAssignPriority(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold"
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Target Date</label>
                    <input
                      type="date"
                      value={assignTargetDate}
                      onChange={(e) => setAssignTargetDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmAssign}
                  disabled={isSubmittingAction}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-colors shadow-md"
                >
                  {isSubmittingAction ? 'ASSIGNING...' : 'DISPATCH WORK ORDER'}
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 13. REJECT MODAL */}
      <AnimatePresence>
        {activeModal === 'REJECT' && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-rose-700">
                  <XCircle className="w-5 h-5" />
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Reject Citizen Report
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 font-sans"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmReject}
                  disabled={isSubmittingAction}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold transition-colors"
                >
                  {isSubmittingAction ? 'REJECTING...' : 'CONFIRM REJECTION'}
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 14. RESOLUTION MODAL */}
      <AnimatePresence>
        {activeModal === 'RESOLVE' && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Mark Issue Resolved
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Resolution Summary <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={resolveDescription}
                    onChange={(e) => setResolveDescription(e.target.value)}
                    placeholder="Describe completed repair, materials used, asphalt compaction..."
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Optional Resolution Photo URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={resolvePhoto}
                    onChange={(e) => setResolvePhoto(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmResolve}
                  disabled={isSubmittingAction || !resolveDescription.trim()}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold transition-colors shadow-md"
                >
                  {isSubmittingAction ? 'RESOLVING...' : 'MARK ISSUE RESOLVED'}
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 15. START WORK CONFIRMATION MODAL */}
      <AnimatePresence>
        {activeModal === 'START_WORK' && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Confirm Work Started On-Site
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Update status of <strong>{selectedReport.reportId}</strong> to <strong>IN_PROGRESS</strong> and notify the citizen contributor.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmStartWork}
                  disabled={isSubmittingAction}
                  className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold transition-colors shadow-md"
                >
                  {isSubmittingAction ? 'UPDATING...' : 'START WORK'}
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI INFRASTRUCTURE INSPECTION MODAL */}
      {selectedReport && (
        <AIInspectionModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          reportId={selectedReport.reportId}
          assetId={selectedReport.nearestAssetId}
          initialImageUrl={selectedReport.photoUrl}
          reportContext={selectedReport}
          assetContext={correlatedAsset}
          onInspectionComplete={() => {
            fetchAllData();
          }}
        />
      )}
    </div>
  );
};

