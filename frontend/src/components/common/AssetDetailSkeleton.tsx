import React from 'react';

export const AssetDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Back button & top bar skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div className="h-4 w-32 bg-zinc-200 rounded" />
        <div className="h-4 w-40 bg-zinc-200 rounded" />
      </div>

      {/* Editorial Header Skeleton */}
      <div className="p-8 rounded-3xl bg-white border border-zinc-200 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-zinc-200 rounded" />
            <div className="h-8 w-80 bg-zinc-300 rounded-xl" />
            <div className="h-4 w-48 bg-zinc-200 rounded" />
          </div>
          <div className="h-16 w-44 bg-zinc-200 rounded-2xl" />
        </div>
      </div>

      {/* 2-Column Main Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="h-80 w-full bg-zinc-200 rounded-3xl" />
          <div className="h-64 w-full bg-zinc-200 rounded-3xl" />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="h-72 w-full bg-zinc-200 rounded-3xl" />
          <div className="h-48 w-full bg-zinc-200 rounded-3xl" />
        </div>
      </div>
    </div>
  );
};
