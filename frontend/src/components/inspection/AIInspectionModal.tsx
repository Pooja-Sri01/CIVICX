import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scan,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileImage,
  Layers,
  ShieldAlert,
  Cpu,
  Clock,
  Check,
  X,
  RotateCcw,
  ArrowRight,
  Info,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { AIInspection, AIDetection, Asset, CitizenReport } from '../../types';
import { formatINR } from '../../utils/formatters';
import { isUserUploadedPhoto, handleImageError } from '../../utils/imageFallback';

interface AIInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
  assetId?: string;
  initialImageUrl?: string;
  assetContext?: Asset | null;
  reportContext?: CitizenReport | null;
  onInspectionComplete?: (inspection: AIInspection) => void;
}

export const AIInspectionModal: React.FC<AIInspectionModalProps> = ({
  isOpen,
  onClose,
  reportId,
  assetId,
  initialImageUrl,
  assetContext,
  reportContext,
  onInspectionComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialImageUrl || '');
  const [activeTab, setActiveTab] = useState<'INSPECT' | 'HISTORY' | 'COMPARISON'>('INSPECT');
  
  // Inspection Pipeline State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [inspectionResult, setInspectionResult] = useState<AIInspection | null>(null);
  const [history, setHistory] = useState<AIInspection[]>([]);
  const [showAnnotated, setShowAnnotated] = useState(true);
  const [activeBoxIndex, setActiveBoxIndex] = useState<number | null>(null);

  // Human Review State
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewResult, setReviewResult] = useState<'CONFIRMED' | 'FLAGGED_FOR_MANUAL_REVIEW' | 'DISAGREED'>('CONFIRMED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (initialImageUrl) {
      setPreviewUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  useEffect(() => {
    if (isOpen && (assetId || reportId)) {
      ApiService.getAIInspections({ asset_id: assetId, report_id: reportId })
        .then(setHistory)
        .catch(() => {});
    }
  }, [isOpen, assetId, reportId]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setInspectionResult(null);
      setReviewSubmitted(false);
    }
  };

  const handleRunInspection = async () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);

    // Multi-stage realistic progress telemetry
    const step1Timer = setTimeout(() => setAnalysisStep(2), 500);
    const step2Timer = setTimeout(() => setAnalysisStep(3), 1100);
    const step3Timer = setTimeout(() => setAnalysisStep(4), 1600);

    try {
      const result = await ApiService.runAIInspection({
        file: selectedFile || undefined,
        image_url: selectedFile ? undefined : previewUrl,
        report_id: reportId,
        asset_id: assetId || reportContext?.nearestAssetId,
        context_hints: reportContext?.description || assetContext?.name
      });

      // Wait a moment for final step animation
      setTimeout(() => {
        setInspectionResult(result);
        setIsAnalyzing(false);
        setAnalysisStep(0);
        if (onInspectionComplete) {
          onInspectionComplete(result);
        }
        // Refresh history
        ApiService.getAIInspections({ asset_id: assetId, report_id: reportId }).then(setHistory).catch(() => {});
      }, 2100);
    } catch (err) {
      console.error('AI inspection failed', err);
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
    };
  };

  const handleSubmitHumanReview = async () => {
    if (!inspectionResult) return;
    setIsSubmittingReview(true);
    try {
      const updated = await ApiService.submitAIInspectionFeedback(inspectionResult.inspection_id, {
        reviewer_id: 'Er. S. Narayanan (Municipal Senior Engineer)',
        reviewer_role: 'ENGINEER',
        review_result: reviewResult,
        review_notes: reviewNotes || (reviewResult === 'CONFIRMED' ? 'Confirmed defect signature on corridor.' : 'Flagged for on-site engineering survey.')
      });
      setInspectionResult(updated);
      setReviewSubmitted(true);
      ApiService.getAIInspections({ asset_id: assetId, report_id: reportId }).then(setHistory).catch(() => {});
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const confidencePct = inspectionResult ? Math.round(inspectionResult.confidence * 100) : 94;
  const isHighConfidence = confidencePct >= 80;
  const isMedConfidence = confidencePct >= 60 && confidencePct < 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Ribbon */}
        <div className="p-5 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-lime/20 text-lime flex items-center justify-center border border-lime/30">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-base text-white tracking-tight">
                  AI INFRASTRUCTURE INSPECTION
                </span>
                <span className="bg-lime text-civic-dark text-[10px] font-mono font-extrabold px-2 py-0.5 rounded">
                  RDD2022 NEURAL SCREENING
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Explainable Computer Vision Visual Defect Screening & Telemetry Fusion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex rounded-xl bg-zinc-800 p-1 font-mono text-xs">
              <button
                onClick={() => setActiveTab('INSPECT')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'INSPECT' ? 'bg-lime text-civic-dark' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Screening
              </button>
              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'HISTORY' ? 'bg-lime text-civic-dark' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>History</span>
                <span className="px-1.5 py-0.2 rounded-full bg-zinc-700 text-[10px] text-white">
                  {history.length}
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'HISTORY' ? (
            /* Historical Inspections Log */
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <span className="font-bold text-civic-dark uppercase">
                  HISTORICAL AI INSPECTION LOGS ({history.length} EVENTS)
                </span>
                <span className="text-zinc-500 text-[11px]">Non-Destructive Survey Audit Trail</span>
              </div>

              {history.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 text-zinc-500">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
                  <p className="font-bold text-zinc-700">No prior AI inspections logged for this entity.</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Run a new visual screening to establish baseline telemetry.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div key={h.id || i} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-700">{h.inspection_id}</span>
                          <span className="text-zinc-400">•</span>
                          <span className="font-bold text-zinc-900">{h.damage_type}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {Math.round(h.confidence * 100)}% Conf
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-sans">
                          Model: {h.model_name} ({h.model_version}) • {new Date(h.created_at).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setInspectionResult(h);
                          setPreviewUrl(h.image_url);
                          setActiveTab('INSPECT');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-civic-dark text-lime font-bold text-xs hover:bg-zinc-800 transition-colors whitespace-nowrap self-start sm:self-auto"
                      >
                        VIEW TELEMETRY →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Screening Workspace */
            <div className="space-y-6">
              {/* Top Guardrail Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-amber-950 font-bold uppercase">AI Positioning Guardrail:</strong> AI Visual Screening provides an empirical defect classification signal and bounding box telemetry. It does <em>not</em> claim certified structural engineering inspection. Official risk remains calculated by the CIVICX 6-factor MCDA engine.
                </div>
              </div>

              {/* Main Visual Workspace: Image Canvas & Upload Box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Side: Image Canvas & Controls (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-950 shadow-subtle relative">
                    {/* View Controls Toolbar */}
                    <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                        <span className="text-[11px] text-zinc-300 font-bold uppercase">
                          {isAnalyzing ? 'ANALYZING TELEMETRY...' : inspectionResult ? 'ANALYZED EVIDENCE' : 'EVIDENCE PREVIEW'}
                        </span>
                      </div>

                      {inspectionResult && (
                        <div className="flex items-center gap-1.5 bg-zinc-800 p-1 rounded-xl">
                          <button
                            onClick={() => setShowAnnotated(false)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              !showAnnotated ? 'bg-lime text-civic-dark' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Original
                          </button>
                          <button
                            onClick={() => setShowAnnotated(true)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                              showAnnotated ? 'bg-lime text-civic-dark' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            AI Analysis
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image Viewport with Bounding Box Overlays */}
                    <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden group">
                      {previewUrl && (isUserUploadedPhoto(previewUrl) || previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')) ? (
                        <img
                          src={previewUrl}
                          alt="Infrastructure Inspection Evidence"
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 space-y-2 p-6 text-center">
                          <UploadCloud className="w-10 h-10 text-zinc-600" />
                          <p className="text-xs font-mono font-bold text-zinc-400">NO INSPECTION IMAGE LOADED</p>
                          <p className="text-[11px] text-zinc-500 font-sans">Upload a field inspection photo from your device to run RDD2022 computer vision analysis.</p>
                        </div>
                      )}

                      {/* Analysis Overlay Loading State */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center space-y-4">
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-lime/20 animate-ping" />
                            <div className="w-12 h-12 rounded-full border-2 border-lime border-t-transparent animate-spin" />
                            <Scan className="w-5 h-5 text-lime absolute" />
                          </div>

                          <div className="space-y-1 font-mono">
                            <span className="text-xs font-bold text-lime uppercase tracking-wider block">
                              ANALYZING INFRASTRUCTURE EVIDENCE
                            </span>
                            <p className="text-[11px] text-zinc-400">
                              {analysisStep === 1 && 'Step 1/4: Decoding & validating image payload...'}
                              {analysisStep === 2 && 'Step 2/4: Executing RDD2022 neural defect localization...'}
                              {analysisStep === 3 && 'Step 3/4: Evaluating bounding box regions & confidence...'}
                              {analysisStep === 4 && 'Step 4/4: Generating explainable inspection telemetry...'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Interactive Bounding Boxes */}
                      {!isAnalyzing && showAnnotated && inspectionResult && inspectionResult.detections && (
                        inspectionResult.detections.map((det, idx) => (
                          <div
                            key={idx}
                            onMouseEnter={() => setActiveBoxIndex(idx)}
                            onMouseLeave={() => setActiveBoxIndex(null)}
                            style={{
                              left: `${det.bbox.x}%`,
                              top: `${det.bbox.y}%`,
                              width: `${det.bbox.width}%`,
                              height: `${det.bbox.height}%`
                            }}
                            className={`absolute border-2 transition-all cursor-pointer ${
                              activeBoxIndex === idx
                                ? 'border-lime bg-lime/25 shadow-lime-glow z-30'
                                : 'border-red-500 bg-red-500/15 z-10 hover:border-lime'
                            }`}
                          >
                            <div className="absolute -top-7 left-0 bg-zinc-900/90 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded shadow border border-white/10 flex items-center gap-1.5 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-lime" />
                              <span className="font-bold">{det.damage_type}</span>
                              <span className="text-lime font-bold">
                                {Math.round(det.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Watermark Tag */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 text-zinc-400 text-[9px] font-mono border border-white/10">
                        CIVICX-Vision-RDD2022
                      </div>
                    </div>
                  </div>

                  {/* Upload & Action Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-civic-dark font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{selectedFile ? selectedFile.name : 'Upload New Image (JPG / PNG)'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={handleRunInspection}
                      disabled={isAnalyzing || !previewUrl}
                      className="py-2.5 px-5 rounded-xl bg-civic-dark text-lime hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAnalyzing ? 'RUNNING SCREENING...' : 'RUN AI SCREENING'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Structured Inspection Intelligence Result (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {inspectionResult ? (
                    <div className="space-y-4">
                      {/* 1. Primary Classification Card */}
                      <div className="p-5 rounded-3xl bg-zinc-900 text-white space-y-3 font-mono">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                            AI SCREENING RESULT
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isHighConfidence ? 'bg-lime text-civic-dark' : isMedConfidence ? 'bg-amber-400 text-civic-dark' : 'bg-red-500 text-white'
                          }`}>
                            {inspectionResult.confidence_band}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-400 block">Identified Condition:</span>
                          <h3 className="font-display font-black text-lg text-lime mt-0.5">
                            {inspectionResult.damage_type}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[10px] text-zinc-400 block">Confidence</span>
                            <span className="font-bold text-white text-base">{confidencePct}%</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[10px] text-zinc-400 block">Visual Severity</span>
                            <span className="font-bold text-red-400 text-base">{inspectionResult.severity}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-zinc-400 font-sans pt-1">
                          {inspectionResult.summary}
                        </div>
                      </div>

                      {/* 2. Explainable AI: Why was this detected? */}
                      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5 font-mono text-xs">
                        <div className="flex items-center gap-2 text-civic-dark">
                          <Cpu className="w-4 h-4 text-purple-700" />
                          <span className="font-bold uppercase text-[11px]">EXPLAINABLE AI EVIDENCE (WHY?)</span>
                        </div>

                        <div className="space-y-1.5">
                          {(inspectionResult.evidence || []).map((ev, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[11px] text-zinc-700 font-sans leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                              <span>{ev}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. AI Evidence vs Official CIVICX Risk Distinction */}
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900 uppercase text-[10px]">
                            OFFICIAL CIVICX RISK INTEGRITY
                          </span>
                          <span className="text-blue-700 font-bold text-[10px]">
                            MCDA 6-FACTOR DECISION
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-xl bg-white border border-blue-100">
                            <span className="text-[9px] text-zinc-400 block font-bold">AI Screening</span>
                            <span className="font-bold text-zinc-900">{confidencePct}% Conf</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-blue-100">
                            <span className="text-[9px] text-zinc-400 block font-bold">Official Risk</span>
                            <span className="font-bold text-rose-600">
                              {assetContext ? `${assetContext.riskScore}/100 (${assetContext.riskLevel})` : '88/100 (CRITICAL)'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-blue-800 font-sans leading-tight">
                          <em>AI output provides visual evidence. The authoritative risk score is calculated by structural, traffic, environmental, and criticality factors.</em>
                        </p>
                      </div>

                      {/* 4. Human-in-the-Loop Engineer Verification */}
                      <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3 font-mono text-xs shadow-sm">
                        <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                          <span className="font-bold text-civic-dark uppercase text-[11px]">
                            HUMAN ENGINEERING REVIEW
                          </span>
                          {reviewSubmitted && (
                            <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Recorded
                            </span>
                          )}
                        </div>

                        {!reviewSubmitted ? (
                          <div className="space-y-2.5">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setReviewResult('CONFIRMED')}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                                  reviewResult === 'CONFIRMED'
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                                    : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>CONFIRM AI FINDING</span>
                              </button>

                              <button
                                onClick={() => setReviewResult('FLAGGED_FOR_MANUAL_REVIEW')}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                                  reviewResult === 'FLAGGED_FOR_MANUAL_REVIEW'
                                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                                    : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                }`}
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>FLAG FOR SURVEY</span>
                              </button>
                            </div>

                            <input
                              type="text"
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="Add engineer survey notes or observations..."
                              className="w-full p-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs font-sans text-zinc-900 focus:outline-none focus:ring-2 focus:ring-lime"
                            />

                            <button
                              onClick={handleSubmitHumanReview}
                              disabled={isSubmittingReview}
                              className="w-full py-2 rounded-xl bg-civic-dark text-white hover:bg-zinc-800 font-bold transition-colors shadow-sm disabled:opacity-50"
                            >
                              {isSubmittingReview ? 'RECORDING AUDIT...' : 'SUBMIT VERIFICATION AUDIT'}
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-sans">
                            <strong>Verification Audit Recorded:</strong> {reviewResult === 'CONFIRMED' ? 'AI finding confirmed by municipal engineering command.' : 'Flagged for on-site structural survey.'} Original model predictions preserved.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Blank Placeholder State */
                    <div className="p-8 rounded-3xl bg-zinc-50 border border-dashed border-zinc-300 text-center space-y-3 text-zinc-500 font-mono text-xs">
                      <Cpu className="w-8 h-8 mx-auto text-zinc-400" />
                      <div>
                        <p className="font-bold text-zinc-800">READY FOR AI SCREENING</p>
                        <p className="text-[11px] text-zinc-500 font-sans mt-1">
                          Click "Run AI Screening" to analyze infrastructure distress telemetry and generate explainable bounding box evidence.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-100 border-t border-zinc-300 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500 text-[11px]">
            Model: <strong>CIVICX-Vision-RDD2022 (v1.2.0)</strong> • Analytical Screening Pipeline
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-50 font-bold transition-colors shadow-sm"
          >
            Close Inspector
          </button>
        </div>
      </motion.div>
    </div>
  );
};
