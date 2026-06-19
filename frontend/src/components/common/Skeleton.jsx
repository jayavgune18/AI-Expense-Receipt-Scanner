import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`}>&nbsp;</div>
);

export const CardSkeleton = () => (
  <div className="glass-card p-6 space-y-4">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/6" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-6">
    <Skeleton className="h-4 w-1/4 mb-6" />
    <Skeleton className="h-64 w-full" />
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="glass-card p-5 space-y-3">
    <Skeleton className="h-3 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);