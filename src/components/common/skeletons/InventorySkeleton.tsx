import React from 'react';
import { Skeleton } from './SkeletonBase';
import { useStore } from '../../../context/StoreContext';
import { Store as StoreIcon, Loader2 } from 'lucide-react';

export const InventorySkeleton: React.FC = () => {
  const { activeStore } = useStore();

  return (
    <div
      id="inventory-skeleton-view"
      className="space-y-6 w-full max-w-full min-w-0 pb-12"
      aria-busy="true"
      aria-label="Loading Inventory Data"
    >
      {/* Active Store Loading Banner */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <StoreIcon className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="font-extrabold text-white flex items-center gap-2 truncate">
              <span className="truncate">{activeStore?.name || 'Active Store'}</span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                Inventory Active Store
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">Loading product stock, thresholds and suppliers...</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold shrink-0">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="hidden sm:inline">Loading inventory...</span>
        </div>
      </div>
      {/* 1. Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl glass-panel shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton variant="rounded" className="w-6 h-6 rounded-lg" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-72 sm:w-96 max-w-full" />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* 2. Four Inventory Status Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((c) => (
          <div
            key={c}
            className="p-4 rounded-xl glass-panel border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3"
          >
            <Skeleton variant="rounded" className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Search and Category Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel shadow-md space-y-3.5 border border-slate-200/60 dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="flex items-center gap-2 overflow-x-hidden pt-1">
          {[20, 28, 24, 32, 22, 26, 30].map((w, idx) => (
            <Skeleton key={idx} className="h-7 rounded-lg shrink-0" style={{ width: `${w * 4}px` }} />
          ))}
        </div>
      </div>

      {/* 4. Full Inventory Table Placeholder */}
      <div className="rounded-2xl glass-panel shadow-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
        {/* Table Column Headers */}
        <div className="bg-slate-100/70 dark:bg-slate-900/60 px-5 py-3.5 border-b border-slate-200/60 dark:border-slate-800/80 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-4 flex items-center gap-2">
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="col-span-2 hidden md:block">
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="col-span-2 hidden lg:block">
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-3.5 w-16" />
          </div>
          <div className="col-span-2 text-right">
            <Skeleton className="h-3.5 w-16 ml-auto" />
          </div>
        </div>

        {/* Simulated Table Rows */}
        <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="px-5 py-4 grid grid-cols-12 gap-3 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
            >
              {/* Product Info (Col 4) */}
              <div className="col-span-4 flex items-center gap-3">
                <Skeleton variant="rounded" className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-36 max-w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Category & SKU (Col 2) */}
              <div className="col-span-2 hidden md:block space-y-1.5">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-3 w-16" />
              </div>

              {/* Price Values (Col 2) */}
              <div className="col-span-2 hidden lg:block space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>

              {/* Stock Status Bar (Col 2) */}
              <div className="col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>

              {/* Actions Toolbar (Col 2) */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <Skeleton variant="rounded" className="w-8 h-8 rounded-lg" />
                <Skeleton variant="rounded" className="w-8 h-8 rounded-lg" />
                <Skeleton variant="rounded" className="w-8 h-8 rounded-lg hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
