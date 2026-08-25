import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, CheckCircle2, X } from 'lucide-react';

interface ResolutionRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
  points?: number;
}

export const ResolutionRewardModal: React.FC<ResolutionRewardModalProps> = ({
  isOpen,
  onClose,
  reportId = 'CIV-2026-00003',
  points = 250
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl p-8 text-center relative overflow-hidden space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Glowing background halo */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-lime/10 rounded-full blur-3xl pointer-events-none" />

          {/* CIVICX Emblem / Coin */}
          <div className="relative flex justify-center pt-2">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, duration: 0.6, type: 'spring', bounce: 0.4 }}
              className="w-24 h-24 rounded-3xl bg-zinc-900 border-2 border-lime/40 shadow-2xl flex items-center justify-center relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center border border-lime/20 shadow-inner">
                <Zap className="w-9 h-9 text-lime" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-zinc-950"
              >
                <CheckCircle2 className="w-4 h-4" />
              </motion.div>
            </motion.div>
          </div>

          {/* Points Announcement */}
          <div className="space-y-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="font-mono text-xs uppercase tracking-widest text-lime font-bold"
            >
              CIVIC RESOLUTION MILESTONE
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight"
            >
              +{points} <span className="text-lime text-2xl sm:text-3xl font-mono">CIVICX POINTS</span>
            </motion.h2>
          </div>

          {/* Impact message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1"
          >
            <p className="font-display font-bold text-base text-zinc-100">
              You made an impact.
            </p>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Your civic observation for <strong>{reportId}</strong> helped surface and resolve infrastructure risk in Coimbatore.
            </p>
          </motion.div>

          {/* Action button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
          >
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-lime hover:bg-lime-dark text-civic-dark font-mono text-xs font-bold transition-all shadow-lg hover:shadow-lime/20"
            >
              VIEW WALLET BALANCE
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
