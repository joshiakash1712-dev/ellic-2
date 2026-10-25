import React from 'react';
import { Skeleton } from './SkeletonBase';
import { useStore } from '../../../context/StoreContext';
import { Store as StoreIcon, Loader2 } from 'lucide-react';

export const POSSkeleton: React.FC = () => {
  const { activeStore } = useStore();

  return (
    <div
      id="pos-skeleton-view"
      className="w-full max-w-full min-w-0 pb-10 space-y-4"
      aria-busy="true"
      aria-label="Loading POS Terminal Data"
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
                POS Active Store
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">Loading catalog, inventory and POS terminal session...</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold shrink-0">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="hidden sm:inline">Loading catalog...</span>
        </div>
      </div>
      {/* Mobile Tab Toggle Placeholder (shown on smaller screens) */}
      <div className="lg:hidden mb-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-1">
        <Skeleton className="h-9 rounded-lg" />
        <Skeleton className="h-9 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: PRODUCT CATALOG & SEARCH                     */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Search & Scan Controls */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <Skeleton variant="rounded" className="w-11 h-11 rounded-xl shrink-0" />
            <Skeleton variant="rounded" className="w-11 h-11 rounded-xl shrink-0 hidden sm:block" />
          </div>

          {/* Category Chips Scroll Container */}
          <div className="flex items-center gap-2 overflow-x-hidden py-1">
            {[96, 112, 80, 128, 104, 120, 88].map((widthPx, idx) => (
              <Skeleton key={idx} className="h-8 rounded-lg shrink-0" style={{ width: `${widthPx}px` }} />
            ))}
          </div>

          {/* Product Grid (3 columns on md/lg, 2 on mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="p-3.5 rounded-2xl glass-panel shadow-md flex flex-col justify-between gap-3 border border-slate-200/60 dark:border-slate-800/80"
              >
                {/* Product Thumbnail Placeholder */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center">
                  <Skeleton className="w-full h-full rounded-xl" />
                </div>

                {/* Info Lines */}
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>

                {/* Price & Add to Cart button */}
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: ACTIVE CART & CHECKOUT TERMINAL            */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl glass-panel shadow-xl space-y-5 border border-slate-200/60 dark:border-slate-800/80">
            {/* Customer Selector Dropdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>

            {/* Current Bill Header */}
            <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Cart Line Items (Simulated 3 items) */}
            <div className="space-y-2.5 py-1">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  {/* Stepper Buttons Placeholder */}
                  <div className="flex items-center gap-1.5">
                    <Skeleton variant="rounded" className="w-6 h-6 rounded" />
                    <Skeleton className="w-5 h-4" />
                    <Skeleton variant="rounded" className="w-6 h-6 rounded" />
                  </div>
                  <Skeleton className="h-4 w-12 text-right shrink-0" />
                </div>
              ))}
            </div>

            {/* Pricing & GST Tax Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 space-y-2 text-xs">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-14" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>

            {/* Payment Method Selector Pills */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-9 rounded-xl" />
                <Skeleton className="h-9 rounded-xl" />
                <Skeleton className="h-9 rounded-xl" />
              </div>
            </div>

            {/* Primary Action Button (Complete Checkout) */}
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
