import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  CheckCircle2,
  ShieldCheck,
  Building2,
  TrendingUp,
  Coins,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  HardHat,
  FileCheck2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CitizenNavbar } from '../../components/citizen/CitizenNavbar';
import { ApiService } from '../../services/api';
import { CitizenImpact } from '../../types';

export const CitizenImpactPage: React.FC = () => {
  const [impact, setImpact] = useState<CitizenImpact | null>(null);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const data = await ApiService.getCitizenImpact();
        setImpact(data);
      } catch (err) {
        console.error('Failed to load impact', err);
      }
    };
    fetchImpact();
  }, []);

  return (
    <div className="min-h-screen bg-[#EDEEF5] text-slate-900 flex flex-col">
      <CitizenNavbar />

      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 font-mono text-xs font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>CIVIC IMPACT</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900">
            YOUR CIVIC IMPACT
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            "Your observations contributed to identifying infrastructure problems that entered the CIVICX municipal workflow."
          </p>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              📝
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
              REPORTS SUBMITTED
            </span>
            <p className="font-display font-black text-3xl text-slate-900">
              {impact?.reportsSubmitted ?? 5}
            </p>
            <span className="text-[10px] text-blue-600 font-sans block font-medium">Spatial civic observations</span>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              🔍
            </div>
            <span className="text-[10px] text-purple-700 uppercase tracking-wider font-bold block">
              REPORTS VALIDATED
            </span>
            <p className="font-display font-black text-3xl text-purple-700">
              {impact?.reportsValidated ?? 4}
            </p>
            <span className="text-[10px] text-purple-600 font-sans block font-medium">7-signal screened evidence</span>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              ✅
            </div>
            <span className="text-[10px] text-emerald-700 uppercase tracking-wider font-bold block">
              ISSUES RESOLVED
            </span>
            <p className="font-display font-black text-3xl text-emerald-600">
              {impact?.issuesResolved ?? 1}
            </p>
            <span className="text-[10px] text-emerald-600 font-sans block font-medium">Completed municipal repairs</span>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              🪙
            </div>
            <span className="text-[10px] text-amber-700 uppercase tracking-wider font-bold block">
              CIVICX POINTS EARNED
            </span>
            <p className="font-display font-black text-3xl text-amber-600">
              {impact?.pointsEarned ?? 1250}
            </p>
            <span className="text-[10px] text-amber-600 font-sans block font-medium">Active wallet balance</span>
          </div>
        </div>

        {/* CITY IMPACT & INFRASTRUCTURE CATEGORIES CONTRIBUTED */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-civic-dark" />
              <h2 className="font-display font-bold text-xl text-slate-900">
                CITY IMPACT & CONTRIBUTED INFRASTRUCTURE
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">Coimbatore Spatial Network</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
            Your observations contributed to identifying infrastructure problems that entered the CIVICX municipal workflow. Here is the breakdown of civic domains where your evidence assisted engineering teams:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            {(impact?.categoriesContributed && impact.categoriesContributed.length > 0 ? impact.categoriesContributed : [
              { category: 'Roads & Corridors', count: 3 },
              { category: 'Drainage & Stormwater', count: 1 },
              { category: 'Bridges & Flyovers', count: 1 },
              { category: 'Street Infrastructure', count: 1 }
            ]).map((cat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-900">{cat.category}</span>
                <p className="font-display font-black text-2xl text-purple-700">{cat.count} Reports</p>
                <span className="text-[10px] text-slate-500 font-sans block">Evidence fused with digital twins</span>
              </div>
            ))}
          </div>
        </div>

        {/* PERSONAL IMPACT TIMELINE: YOUR CONTRIBUTION JOURNEY */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-700" />
              <h2 className="font-display font-bold text-xl text-slate-900">
                YOUR CONTRIBUTION JOURNEY
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              TOTAL: +410 CIVICX POINTS
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-slate-900 text-sm font-sans block">Report Submitted</span>
                  <span className="text-slate-500 text-[11px]">CIV-2026-00001 (Avinashi Road Potholes)</span>
                </div>
                <span className="text-blue-600 font-bold text-sm">+10 CIVICX Points</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
              <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-purple-900 text-sm font-sans block">Report Validated</span>
                  <span className="text-purple-700 text-[11px]">7-signal deterministic verification passed</span>
                </div>
                <span className="text-purple-700 font-bold text-sm">+50 CIVICX Points</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
              <div className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-indigo-900 text-sm font-sans block">Government Action Started</span>
                  <span className="text-indigo-700 text-[11px]">Work order dispatched to Central Zone Field Division</span>
                </div>
                <span className="text-indigo-700 font-bold text-sm">+100 CIVICX Points</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-emerald-900 text-sm font-sans block">Issue Resolved</span>
                  <span className="text-emerald-700 text-[11px]">Road pothole cluster patched & leveled</span>
                </div>
                <span className="text-emerald-700 font-bold text-sm">+250 CIVICX Points</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div>
              <span className="text-lime font-bold text-sm block">CONTINUE YOUR CIVIC PARTICIPATION</span>
              <span className="text-zinc-400 text-[11px] font-sans">Every verified observation directly strengthens municipal asset intelligence.</span>
            </div>
            <Link
              to="/citizen/report"
              className="px-4 py-2.5 rounded-xl bg-lime text-civic-dark font-bold hover:bg-lime-dark transition-all inline-flex items-center gap-1.5 shrink-0"
            >
              <span>REPORT NEW DEFECT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
