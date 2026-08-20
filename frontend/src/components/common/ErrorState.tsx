import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'CivicX intelligence service unavailable.',
  onRetry,
}) => {
  return (
    <div className="max-w-md mx-auto my-16 p-8 glass-panel rounded-3xl border border-red-200 bg-white/90 text-center space-y-4 shadow-elevated">
      <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="font-display font-bold text-lg text-civic-dark">
          Intelligence Stream Interrupted
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-civic-dark text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-subtle"
        >
          <RotateCcw className="w-3.5 h-3.5 text-lime" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
