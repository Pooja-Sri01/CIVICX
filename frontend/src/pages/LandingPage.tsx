import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
  Sparkles
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';

export const LandingPage: React.FC = () => {
  const pipelineSteps = [
    { label: 'Data Ingestion', desc: 'IoT sensors, citizen logs, drone video' },
    { label: 'Vision Detect', desc: 'RDD2022 computer vision defects' },
    { label: 'Risk Predict', desc: 'Normalized multi-criteria deterioration' },
    { label: 'Priority Rank', desc: 'Explainable ROI-weighted queue' },
    { label: 'Explainability', desc: 'Transparent factor breakdown' },
    { label: 'Optimize', desc: 'Knapsack capital budget allocation' },
    { label: 'Simulate', desc: 'City Time Machine decay horizons' },
    { label: 'Act & Audit', desc: 'Formal municipal executive brief' },
  ];

  return (
    <div className="min-h-screen bg-canvas overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-lime/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-civic-border text-xs font-semibold text-civic-dark shadow-subtle"
          >
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="font-mono text-zinc-500 uppercase tracking-wider text-[11px]">CivicX 1.0</span>
            <span className="text-zinc-300">|</span>
            <span>Decision Intelligence for Municipalities</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-civic-dark tracking-tight leading-[1.08]"
          >
            Predict the Risk. <br />
            Prioritize the Fix. <br />
            <span className="text-zinc-500 italic font-normal">Simulate the Future.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            CivicX transforms fragmented infrastructure data into explainable, predictive, and budget-aware maintenance decisions for smarter cities.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-civic-dark text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-card hover:gap-3.5 group"
            >
              <span>Enter Command Center</span>
              <ArrowRight className="w-4 h-4 text-lime group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#pipeline"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-civic-border text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-civic-dark transition-all shadow-subtle"
            >
              <span>Explore How It Works</span>
            </a>
          </motion.div>
        </div>

        {/* Live Interactive Hero Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 glass-panel rounded-3xl p-6 sm:p-8 shadow-elevated border border-civic-border max-w-5xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono">
                  Live Municipal Intelligence Stream
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Coimbatore Central
                </span>
              </div>
              <h2 className="font-display font-bold text-xl text-civic-dark mt-1">
                Gandhipuram Underpass Inbound Arterial (RD-1042)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <RiskBadge level="Critical" score={93} size="lg" />
              <Link
                to="/assets/civicx-ast-001"
                className="text-xs font-semibold text-civic-dark bg-lime hover:bg-lime-hover px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <span>View Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/80 p-4 rounded-2xl border border-zinc-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                <Cpu className="w-4 h-4 text-civic-dark" />
                <span>AI Vision Detections</span>
              </div>
              <p className="text-sm font-semibold text-zinc-800">
                Severe Pothole Cluster & Fatigue Shear
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Confidence: <span className="font-mono font-bold text-zinc-700">96.2%</span> via RDD2022
              </p>
            </div>

            <div className="bg-white/80 p-4 rounded-2xl border border-zinc-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span>Delay 6 Months Impact</span>
              </div>
              <p className="text-sm font-semibold text-red-700">
                +52% Cost Escalation (₹28.1L)
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Risk compounds from 93 to 98 (Subgrade failure)
              </p>
            </div>

            <div className="bg-white/80 p-4 rounded-2xl border border-zinc-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Optimized Action</span>
              </div>
              <p className="text-sm font-semibold text-zinc-800">
                Full-Depth Milling & Overlay
              </p>
              <p className="text-xs text-emerald-700 font-semibold mt-1">
                ROI: 4.97x Cost Savings vs Delayed Fix
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Decision Pipeline Section */}
      <section id="pipeline" className="py-20 bg-white/70 border-y border-civic-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono">
              The CivicX Decision Architecture
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-civic-dark">
              From Raw Infrastructure Data to Actionable Municipal ROI
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              CivicX is not a simple damage detector. It is an end-to-end decision intelligence pipeline.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {pipelineSteps.map((step, idx) => (
              <div
                key={idx}
                className="glass-panel p-5 rounded-2xl border border-civic-border shadow-subtle hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-lime-dark bg-lime-light px-2 py-0.5 rounded">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-zinc-400">Step</span>
                </div>
                <h3 className="font-display font-bold text-base text-civic-dark mb-1">
                  {step.label}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Differentiators Grid */}
      <section id="platform" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Transparent Deterministic Risk */}
          <div className="glass-panel p-8 rounded-3xl border border-civic-border shadow-subtle hover:shadow-card transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-civic-dark text-lime flex items-center justify-center shadow-subtle">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-civic-dark">
              Explainable Risk Engine
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              No black-box hallucinations. Deterministic scoring weighting condition deficit, damage severity, network criticality, and traffic density with full factor breakdown.
            </p>
            <div className="pt-2">
              <Link to="/priorities" className="text-xs font-semibold text-civic-dark hover:text-zinc-600 inline-flex items-center gap-1">
                <span>View Priority Queue</span>
                <ArrowRight className="w-3.5 h-3.5 text-lime" />
              </Link>
            </div>
          </div>

          {/* Card 2: Knapsack Budget Optimizer */}
          <div className="glass-panel p-8 rounded-3xl border border-civic-border shadow-subtle hover:shadow-card transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-civic-dark text-lime flex items-center justify-center shadow-subtle">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-civic-dark">
              Knapsack Budget Optimizer
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Dynamically maximizes citywide risk mitigation under strict municipal fiscal caps. Instantly proves value gains versus naive FIFO reactive patching.
            </p>
            <div className="pt-2">
              <Link to="/budget" className="text-xs font-semibold text-civic-dark hover:text-zinc-600 inline-flex items-center gap-1">
                <span>Test Budget Slider</span>
                <ArrowRight className="w-3.5 h-3.5 text-lime" />
              </Link>
            </div>
          </div>

          {/* Card 3: City Time Machine */}
          <div className="glass-panel p-8 rounded-3xl border border-civic-border shadow-subtle hover:shadow-card transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-civic-dark text-lime flex items-center justify-center shadow-subtle">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-civic-dark">
              City Time Machine
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Simulate the future before committing capital. Compare immediate repair vs 6-month delay penalties and 12-month catastrophic failure projections.
            </p>
            <div className="pt-2">
              <Link to="/simulation" className="text-xs font-semibold text-civic-dark hover:text-zinc-600 inline-flex items-center gap-1">
                <span>Launch Time Machine</span>
                <ArrowRight className="w-3.5 h-3.5 text-lime" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-civic-dark text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-elevated">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-lime/20 rounded-full blur-3xl" />
          
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Ready to Explore the Coimbatore Prototype?
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto mt-3 mb-8">
            Experience the complete decision journey: from AI vision damage detection to budget optimization and predictive scenario modeling.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-lime text-civic-dark font-bold text-sm hover:bg-lime-hover transition-all shadow-lime-glow group"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};
