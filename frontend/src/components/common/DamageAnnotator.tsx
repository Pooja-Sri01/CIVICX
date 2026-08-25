import React, { useState } from 'react';
import { BoundingBox } from '../../types';
import { Eye, EyeOff, Sparkles, CheckCircle2, Scan } from 'lucide-react';
import { getAssetImage, handleImageError } from '../../utils/imageFallback';

interface DamageAnnotatorProps {
  imageSrc: string;
  bboxes: BoundingBox[];
  damageType: string;
  conditionScore: number;
}

export const DamageAnnotator: React.FC<DamageAnnotatorProps> = ({
  imageSrc,
  bboxes,
  damageType,
  conditionScore,
}) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const [activeBox, setActiveBox] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-civic-border bg-white overflow-hidden shadow-subtle">
      {/* Header controls */}
      <div className="p-3.5 bg-zinc-50 border-b border-civic-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-civic-dark text-lime flex items-center justify-center">
            <Scan className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-civic-dark uppercase tracking-wider font-mono">
              AI Vision Telemetry
            </span>
            <span className="text-[10px] text-zinc-500 ml-2 font-mono">
              RDD2022 Benchmark
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            {showBoxes ? (
              <>
                <EyeOff className="w-3 h-3 text-zinc-500" />
                <span>Hide Bounding Boxes</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-zinc-500" />
                <span>Show Bounding Boxes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Image with bounding box annotations */}
      <div className="relative bg-zinc-900 overflow-hidden group aspect-[16/10] sm:aspect-[16/9]">
        <img
          src={getAssetImage(imageSrc, damageType)}
          alt="Infrastructure Damage Inspection"
          onError={(e) => handleImageError(e, damageType)}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
        />

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
                  : 'border-red-500 bg-red-500/10 z-10'
              }`}
            >
              {/* Tag Label */}
              <div className="absolute -top-6 left-0 bg-civic-dark text-white text-[10px] font-mono px-2 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-lime" />
                <span>{box.label}</span>
                <span className="text-lime font-bold">
                  {Math.round(box.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}

        {/* Floating AI Scan Status Indicator */}
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-lime" />
          <span className="font-medium text-[11px]">
            {bboxes.length > 0
              ? `${bboxes.length} Structural Defect(s) Isolated`
              : 'Nominal Profile — No Critical Defects Isolated'}
          </span>
        </div>
      </div>

      {/* Defect Summary Footer */}
      <div className="p-4 bg-white border-t border-civic-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase text-zinc-500 tracking-wider">
              Primary Identified Defect
            </p>
            <p className="text-sm font-semibold text-civic-dark">{damageType}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-zinc-400 font-mono uppercase">Condition Index</p>
              <p className="text-sm font-mono font-bold text-civic-dark">
                {conditionScore}/100
              </p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Inspection Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
