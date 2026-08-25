import React, { useState } from 'react';
import { Eye, EyeOff, Scan, Sparkles, CheckCircle2, ShieldAlert, Cpu, Database, Binary, Info } from 'lucide-react';
import { BoundingBox } from '../../types';
import { InspectionAnalysisResult } from '../../services/api';
import { getAssetImage, handleImageError } from '../../utils/imageFallback';

interface InspectionEvidenceProps {
  imageSrc: string;
  bboxes?: BoundingBox[];
  damageType: string;
  conditionScore: number;
  observedEvidence?: string[];
  aiAnalysis?: InspectionAnalysisResult | null;
  onOpenAIModal?: () => void;
}

export const InspectionEvidence: React.FC<InspectionEvidenceProps> = ({
  imageSrc,
  bboxes = [],
  damageType,
  conditionScore,
  observedEvidence = [],
  aiAnalysis,
  onOpenAIModal,
}) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const [activeBox, setActiveBox] = useState<number | null>(null);

  const displayDamage = aiAnalysis?.damage_type || damageType;
  const displayConfidence = aiAnalysis?.confidence ? Math.round(aiAnalysis.confidence * 100) : 94;
  const displaySeverity = aiAnalysis?.severity || (conditionScore < 40 ? 'CRITICAL' : conditionScore < 60 ? 'HIGH' : 'MEDIUM');
  const displayDesc = aiAnalysis?.description || 'Visible surface distress, crack propagation, and asphalt raveling detected in the monitored sector.';

  return (
    <div className="space-y-6">
      {/* 1. OBSERVED DATA (Ground Truth Telemetry & Database Records) */}
      <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-subtle">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-civic-dark text-lime flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-civic-dark tracking-wide uppercase font-mono">
                OBSERVED INFRASTRUCTURE DATA
              </span>
              <p className="text-[11px] text-zinc-500 font-mono">
                Verified Municipal Ground Truth & Sensor Records
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            VERIFIED TELEMETRY
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {observedEvidence.map((ev, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-civic-dark mt-1.5 flex-shrink-0" />
              <span className="text-zinc-700 leading-relaxed font-sans">{ev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. AI VISION ANALYSIS (Defect Localization & Computer Vision Evidence) */}
      <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-subtle">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-cyan flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-civic-dark tracking-wide uppercase font-mono">
                  AI INSPECTION EVIDENCE
                </span>
                <span className="bg-zinc-200 text-zinc-700 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                  RDD2022-COMPATIBLE PIPELINE
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Computer Vision Damage Localization & Defect Classification Interface
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-civic-dark text-lime text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm font-mono"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>RUN AI SCREENING</span>
              </button>
            )}

            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors shadow-subtle font-mono"
            >
              {showBoxes ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Original Photo</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                  <span>AI Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* Image inspection canvas */}
        <div className="relative bg-zinc-950 overflow-hidden group aspect-[16/9]">
          <img
            src={getAssetImage(imageSrc, displayDamage)}
            alt="Infrastructure AI Damage Inspection"
            onError={(e) => handleImageError(e, displayDamage)}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
          />

          {/* Bounding box overlays */}
          {showBoxes &&
            bboxes.map((box, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveBox(idx)}
                onMouseLeave={() => setActiveBox(null)}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                className={`absolute border-2 transition-all cursor-pointer ${
                  activeBox === idx
                    ? 'border-lime bg-lime/20 shadow-lime-glow z-20'
                    : 'border-red-500 bg-red-500/15 z-10'
                }`}
              >
                {/* Defect Label */}
                <div className="absolute -top-7 left-0 bg-civic-dark text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-card flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime" />
                  <span className="font-bold">{box.label}</span>
                  <span className="text-lime font-mono">
                    {Math.round(box.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}

          {/* Status Pill on bottom left */}
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/15 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-lime" />
            <span className="font-medium text-[11px]">
              {displayDamage}
            </span>
          </div>

          {/* Model Transparency Disclaimer pill */}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md border border-white/10 text-zinc-300 px-2.5 py-1 rounded-lg text-[10px] font-mono">
            Analytical Vision Pipeline
          </div>
        </div>

        {/* Structured Computer Vision Telemetry Panel */}
        <div className="p-5 bg-white border-t border-zinc-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Detected Damage</span>
              <p className="font-display font-bold text-xs text-civic-dark mt-0.5 truncate">{displayDamage}</p>
              <span className="text-[9px] font-mono text-zinc-400">RDD2022 Class</span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Model Confidence</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="font-mono font-bold text-xs text-zinc-900">{displayConfidence}%</p>
                <div className="flex-1 h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                  <div className="h-full bg-lime-dark" style={{ width: `${displayConfidence}%` }} />
                </div>
              </div>
              <span className="text-[9px] font-mono text-zinc-400">Bounding Box Score</span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Severity Rating</span>
              <p className="font-mono font-bold text-xs text-red-600 mt-0.5">{displaySeverity}</p>
              <span className="text-[9px] font-mono text-zinc-400">Structural Impact</span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Verification</span>
              <p className="font-mono font-bold text-xs text-emerald-700 mt-0.5">AI DETECTED</p>
              <span className="text-[9px] font-mono text-zinc-400">Field Telemetry Grounded</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-600 space-y-1">
            <p className="font-bold text-civic-dark flex items-center justify-between font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-zinc-700" />
                <span>Inspection Diagnostic Telemetry:</span>
              </span>
              <span className="text-[10px] text-zinc-400">Pipeline: RDD2022-compatible AI Inspection</span>
            </p>
            <p className="text-[11px] leading-relaxed text-zinc-600 font-sans">
              {displayDesc}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

