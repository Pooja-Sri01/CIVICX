import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-zinc-200 rounded-xl" />
          <div className="h-4 w-96 bg-zinc-200/70 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-zinc-200 rounded-xl" />
          <div className="h-9 w-32 bg-zinc-200 rounded-xl" />
        </div>
      </div>

      {/* 4 Key Metrics Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white/80 border border-zinc-200/80 space-y-3 shadow-subtle">
            <div className="h-3 w-24 bg-zinc-200 rounded" />
            <div className="h-8 w-20 bg-zinc-300 rounded-lg" />
            <div className="h-3 w-32 bg-zinc-200/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Chart Skeleton */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white/80 border border-zinc-200/80 space-y-4 shadow-subtle">
          <div className="h-5 w-40 bg-zinc-200 rounded" />
          <div className="h-56 w-full bg-zinc-100 rounded-2xl flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-8 border-zinc-200/60" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-4 bg-zinc-200/60 rounded" />
            ))}
          </div>
        </div>

        {/* Priority Table Skeleton */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/80 border border-zinc-200/80 space-y-4 shadow-subtle">
          <div className="h-5 w-48 bg-zinc-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((k) => (
              <div key={k} className="h-12 w-full bg-zinc-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
