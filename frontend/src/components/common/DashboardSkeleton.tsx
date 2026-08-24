import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
      {/* 1. Header & System Diagnostic Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-4">
          <div className="h-4 w-44 bg-zinc-200 rounded" />
          <div className="h-4 w-40 bg-zinc-200/70 rounded hidden sm:block" />
          <div className="h-4 w-36 bg-zinc-200/50 rounded hidden md:block" />
        </div>
        <div className="h-5 w-32 bg-zinc-200 rounded" />
      </div>

      {/* 2. System Context & Editorial Headline Skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-3/4 sm:w-1/2 bg-zinc-200 rounded-xl" />
        <div className="h-4 w-full sm:w-4/5 bg-zinc-200/60 rounded-lg" />
      </div>

      {/* 3. High-Density Overview Metric Strip Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2 shadow-subtle">
            <div className="h-2.5 w-16 bg-zinc-200 rounded" />
            <div className="h-7 w-20 bg-zinc-300 rounded-lg" />
            <div className="h-2 w-24 bg-zinc-200/60 rounded" />
          </div>
        ))}
      </div>

      {/* 4. 3-Column Instrumentation Matrix Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Col 1: Risk Spectrum Skeleton */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-zinc-200 shadow-subtle space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
            <div className="h-3 w-28 bg-zinc-200 rounded" />
            <div className="h-3 w-16 bg-zinc-200 rounded" />
          </div>
          <div className="space-y-3.5">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-zinc-200 rounded" />
                  <div className="h-3 w-12 bg-zinc-200 rounded" />
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full" />
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-zinc-100">
            <div className="h-3 w-full bg-zinc-200/60 rounded" />
          </div>
        </div>

        {/* Col 2: Top Risk Asset Spotlight Skeleton */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border-2 border-zinc-300 shadow-subtle space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
            <div className="h-4 w-36 bg-zinc-200 rounded" />
            <div className="h-5 w-20 bg-zinc-200 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-zinc-300 rounded" />
            <div className="h-3.5 w-48 bg-zinc-200 rounded" />
          </div>
          <div className="h-16 w-full bg-zinc-100 rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-zinc-100 rounded-lg" />
            <div className="h-10 bg-zinc-100 rounded-lg" />
          </div>
          <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
            <div className="h-4 w-28 bg-zinc-200 rounded" />
            <div className="h-7 w-28 bg-zinc-300 rounded-lg" />
          </div>
        </div>

        {/* Col 3: Decision Snapshot & Action Panel Skeleton */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-zinc-900 shadow-subtle space-y-4">
          <div className="h-3 w-28 bg-zinc-700 rounded" />
          <div className="space-y-1">
            <div className="h-7 w-36 bg-zinc-600 rounded" />
            <div className="h-3 w-24 bg-zinc-700 rounded" />
          </div>
          <div className="h-16 w-full bg-white/5 rounded-xl" />
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="h-8 w-full bg-lime/30 rounded-xl" />
            <div className="h-8 w-full bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 5. Priority Queue Table Skeleton */}
      <div className="rounded-2xl bg-white border border-zinc-200 shadow-subtle overflow-hidden">
        <div className="p-4 bg-white border-b border-zinc-200 flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-4 w-48 bg-zinc-200 rounded" />
            <div className="h-3 w-64 bg-zinc-200/60 rounded" />
          </div>
          <div className="h-4 w-28 bg-zinc-200 rounded" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <div key={k} className="h-11 w-full bg-zinc-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

