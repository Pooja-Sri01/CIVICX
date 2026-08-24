import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'CIVICX DATA UNAVAILABLE',
  message = 'Unable to retrieve the latest infrastructure analysis.',
  onRetry,
}) => {
  return (
    <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-red-200 bg-white/95 text-center space-y-5 shadow-elevated">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-sm">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-display font-black text-xl text-civic-dark tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-zinc-600 leading-relaxed font-medium">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-civic-dark text-white text-xs font-mono font-bold hover:bg-zinc-800 transition-all shadow-subtle"
          >
            <RotateCcw className="w-3.5 h-3.5 text-lime" />
            <span>RETRY</span>
          </button>
        </div>
      )}
    </div>
  );
};

