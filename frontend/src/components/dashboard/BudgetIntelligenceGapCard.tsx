import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  Sliders,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  PieChart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/formatters';

interface BudgetIntelligenceGapCardProps {
  availableBudget?: number;
  requiredBudget?: number;
  unfundedGap?: number;
}

export const BudgetIntelligenceGapCard: React.FC<BudgetIntelligenceGapCardProps> = ({
  availableBudget = 50000000.0, // ₹5.0 Cr standard
  requiredBudget = 77176000.0, // ₹7.71 Cr
  unfundedGap = 27176000.0 // ₹2.71 Cr
}) => {
  const navigate = useNavigate();
  const [testBudget, setTestBudget] = useState<number>(availableBudget);

  const fundedPercentage = Math.min(100, Math.round((testBudget / requiredBudget) * 100));

  return (
    <div className="p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-4 font-mono text-xs shadow-subtle flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-lime" />
          <span className="font-bold text-xs uppercase text-white tracking-wide">
            BUDGET DECISION INTELLIGENCE & GAP ANALYSIS
          </span>
        </div>
        <span className="bg-lime text-civic-dark text-[9px] font-black px-1.5 py-0.2 rounded">
          OPTIMIZER LINKED
        </span>
      </div>

      {/* 3 Metrics Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[9px] text-zinc-400 block font-bold uppercase">Available Budget</span>
          <span className="font-display font-black text-sm text-lime block mt-0.5">
            {formatINR(testBudget)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[9px] text-zinc-400 block font-bold uppercase">Priority Needs</span>
          <span className="font-display font-black text-sm text-white block mt-0.5">
            {formatINR(requiredBudget)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[9px] text-zinc-400 block font-bold uppercase">Municipal Gap</span>
          <span className="font-display font-black text-sm text-rose-400 block mt-0.5">
            {formatINR(Math.max(0, requiredBudget - testBudget))}
          </span>
        </div>
      </div>

      {/* Interactive Budget Scenario Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-sans">
          <span>Explore Capital Allocation: <strong>{formatINR(testBudget)}</strong></span>
          <span>Coverage: <strong>{fundedPercentage}% of Portfolio</strong></span>
        </div>

        <input
          type="range"
          min="10000000"
          max="100000000"
          step="5000000"
          value={testBudget}
          onChange={(e) => setTestBudget(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9FFF00]"
        />

        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden flex">
          <div
            className="bg-lime h-full transition-all duration-300"
            style={{ width: `${fundedPercentage}%` }}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-300"
            style={{ width: `${100 - fundedPercentage}%` }}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 font-sans">
          Knapsack Optimizer maximizes risk reduction per rupee.
        </span>
        <button
          onClick={() => navigate(`/budget`)}
          className="px-3 py-1.5 rounded-xl bg-lime text-civic-dark font-mono text-xs font-bold hover:bg-lime-light transition-all flex items-center gap-1 shadow-sm"
        >
          <span>Run Knapsack Optimizer</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
