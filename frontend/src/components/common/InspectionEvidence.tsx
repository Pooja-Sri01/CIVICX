import React, { useState } from 'react';
import { Eye, EyeOff, Scan, Sparkles, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { BoundingBox } from '../../types';
import { InspectionAnalysisResult } from '../../services/api';

interface InspectionEvidenceProps {
  imageSrc: string;
  bboxes?: BoundingBox[];
  damageType: string;
  conditionScore: number;
  aiAnalysis?: InspectionAnalysisResult | null;
}

export const InspectionEvidence: React.FC<InspectionEvidenceProps> = ({
  imageSrc,
  bboxes = [],
  damageType,
  conditionScore,
  aiAnalysis,
}) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const [activeBox, setActiveBox] = useState<number | null>(null);

  const displayDamage = aiAnalysis?.damage_type || damageType;
  const displayConfidence = aiAnalysis?.confidence ? Math.round(aiAnalysis.confidence * 100) : 94;
  const displaySeverity = aiAnalysis?.severity || (conditionScore < 40 ? 'CRITICAL' : conditionScore < 60 ? 'HIGH' : 'MEDIUM');
  const displayDesc = aiAnalysis?.description || 'Visible surface distress, crack propagation, and asphalt raveling detected in the monitored sector.';

  return (
    <div className="rounded-3xl border border-civic-border bg-white overflow-hidden shadow-subtle">
      {/* Header bar */}
      <div className="p-4 bg-zinc-50 border-b border-civic-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-civic-dark text-lime flex items-center justify-center">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-civic-dark tracking-wide uppercase font-mono">
                DEMO AI INSPECTION
              </span>
              <span className="bg-zinc-200 text-zinc-700 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                RDD2022 READY
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Automated Computer Vision Damage Localization & Classification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {bboxes.length > 0 && (
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors shadow-subtle"
            >
              {showBoxes ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Hide Bounding Boxes</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Show Bounding Boxes</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Image inspection canvas */}
      <div className="relative bg-zinc-900 overflow-hidden group aspect-[16/9]">
        <img
          src={imageSrc}
          alt="Infrastructure AI Damage Inspection"
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
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/15 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-lime" />
          <span className="font-medium text-[11px]">
            {displayDamage}
          </span>
        </div>

        {/* Model Transparency Disclaimer pill */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md border border-white/10 text-zinc-300 px-2.5 py-1 rounded-lg text-[10px] font-mono">
          Prototype Inference Interface
        </div>
      </div>

      {/* Structured Computer Vision Telemetry Panel */}
      <div className="p-5 bg-white border-t border-civic-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Detected Damage</span>
            <p className="font-display font-bold text-sm text-civic-dark mt-0.5 truncate">{displayDamage}</p>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Inference Confidence</span>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="font-mono font-bold text-sm text-zinc-900">{displayConfidence}%</p>
              <div className="flex-1 h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                <div className="h-full bg-lime-dark" style={{ width: `${displayConfidence}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Severity Rating</span>
            <p className="font-mono font-bold text-sm text-red-600 mt-0.5">{displaySeverity}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-600 space-y-1">
          <p className="font-bold text-civic-dark flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-zinc-700" />
            <span>Inspection Diagnostic Description:</span>
          </p>
          <p className="text-[11px] leading-relaxed text-zinc-600">
            {displayDesc}
          </p>
        </div>
      </div>
    </div>
  );
};
