import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Package,
  FileText,
  Boxes,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export interface SapphireDataRippleProps {
  totalSkus: number;
  billCount: number;
  todaySales: number;
  totalItemsSold: number;
  healthySkusCount: number;
  lowStockCount: number;
  latestInvoiceNumber?: string;
  latestCustomerName?: string;
  latestItemName?: string;
  latestItemQty?: number;
  latestBillAmount?: number;
  onNavigateToPOS?: () => void;
  onNavigateToInventory?: () => void;
  onNavigateToReports?: () => void;
}

export type EmeraldDataRippleProps = SapphireDataRippleProps;

interface RippleStage {
  id: 'product' | 'bill' | 'stock';
  stepNumber: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  primaryMetric: string;
  secondaryMetric: string;
  causeEffectText: string;
  actionLabel: string;
  onAction?: () => void;
}

export const SapphireDataRipple: React.FC<SapphireDataRippleProps> = ({
  totalSkus,
  billCount,
  todaySales,
  totalItemsSold,
  healthySkusCount,
  lowStockCount,
  latestInvoiceNumber = '#INV-1042',
  latestCustomerName = 'Walk-in Customer',
  latestItemName = 'Basmati Rice 5kg',
  latestItemQty = 2,
  latestBillAmount = 880,
  onNavigateToPOS,
  onNavigateToInventory,
  onNavigateToReports
}) => {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [pulseCycle, setPulseCycle] = useState<number>(0);
  const prefersReducedMotion = useReducedMotion();

  const stages: RippleStage[] = [
    {
      id: 'product',
      stepNumber: '01',
      title: 'Product',
      subtitle: 'Catalog & Barcode Scan',
      badge: `${totalSkus} Active SKUs`,
      icon: Package,
      primaryMetric: latestItemName,
      secondaryMetric: `Qty × ${latestItemQty} · Instant SKU lookup (<0.2s)`,
      causeEffectText: `Barcode scanned for ${latestItemName} (×${latestItemQty}): pricing & GST slab fetched automatically from ${totalSkus} catalog SKUs.`,
      actionLabel: 'Catalog',
      onAction: onNavigateToInventory
    },
    {
      id: 'bill',
      stepNumber: '02',
      title: 'Bill',
      subtitle: 'POS Invoice & Settlement',
      badge: `${billCount} Bills Today`,
      icon: FileText,
      primaryMetric: `${latestInvoiceNumber} · ₹${latestBillAmount.toLocaleString()}`,
      secondaryMetric: `${latestCustomerName} · Today ₹${todaySales.toLocaleString()}`,
      causeEffectText: `Invoice ${latestInvoiceNumber} (₹${latestBillAmount.toLocaleString()}) committed at counter: GST ledger & daily revenue (₹${todaySales.toLocaleString()}) updated live.`,
      actionLabel: 'Open POS',
      onAction: onNavigateToPOS || onNavigateToReports
    },
    {
      id: 'stock',
      stepNumber: '03',
      title: 'Stock',
      subtitle: 'Atomic Inventory Sync',
      badge: `${healthySkusCount}/${totalSkus} Healthy`,
      icon: Boxes,
      primaryMetric: `-${totalItemsSold} Units Deducted Today`,
      secondaryMetric:
        lowStockCount > 0
          ? `${lowStockCount} low-stock threshold alert${lowStockCount > 1 ? 's' : ''} active`
          : 'All batches above safety threshold',
      causeEffectText: `Inventory decremented by ${latestItemQty} unit${latestItemQty === 1 ? '' : 's'} in real time (${totalItemsSold} total units sold today): reorder watch updated.`,
      actionLabel: 'View Stock',
      onAction: onNavigateToInventory
    }
  ];

  // Continuous sequential sapphire signal propagation: Product (0) -> Bill (1) -> Stock (2)
  useEffect(() => {
    if (prefersReducedMotion || isHovered) return;

    const interval = setInterval(() => {
      setActiveStageIndex((prev) => {
        const next = (prev + 1) % 3;
        if (next === 0) {
          setPulseCycle((c) => c + 1);
        }
        return next;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, isHovered]);

  const handleManualRipple = () => {
    setActiveStageIndex(0);
    setPulseCycle((c) => c + 1);
  };

  const currentStage = stages[activeStageIndex] || stages[0];
  const progressPercentage =
    activeStageIndex === 0 ? 16.6 : activeStageIndex === 1 ? 50 : 100;

  return (
    <div
      id="sapphire-data-ripple"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-4 sm:p-5 rounded-xl bg-[#0E1726] border border-slate-800 shadow-lg relative overflow-hidden space-y-4"
    >
      {/* Subtle Ambient Sapphire Background Glow */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{
          left:
            activeStageIndex === 0
              ? '20%'
              : activeStageIndex === 1
              ? '50%'
              : '80%'
        }}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-sky-400">
            <Zap className="w-3.5 h-3.5" />
            {!prefersReducedMotion && (
              <span className="absolute inset-0 rounded-lg border border-sky-400/50 animate-ping opacity-30" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                Sapphire Data Ripple
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Connected System
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live cause-and-effect pipeline linking every product scan to billing and stock deduction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleManualRipple}
            className="px-2.5 py-1 rounded-lg bg-[#070B14] hover:bg-slate-800/90 text-sky-400 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Replay Sapphire Data Ripple sequence"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Pulse Signal</span>
          </button>
        </div>
      </div>

      {/* Connected Track Bar (Desktop Horizontal Signal) */}
      <div className="hidden md:block relative px-6 pt-1 z-10">
        <div className="relative h-1.5 w-full rounded-full bg-[#070B14] border border-slate-800/90 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-600/40 via-blue-500 to-sky-300 shadow-[0_0_12px_rgba(37,99,235,0.7)]"
            animate={{ width: `${progressPercentage}%` }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.55,
              ease: [0.16, 1, 0.3, 1]
            }}
          />
        </div>

        {/* Connector Labels Between Stages */}
        <div className="grid grid-cols-2 text-center -mt-3 pointer-events-none">
          <div className="flex justify-center">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border transition-all duration-300 ${
                activeStageIndex >= 1
                  ? 'bg-blue-950/90 text-sky-300 border-blue-500/40 shadow-xs shadow-blue-500/20'
                  : 'bg-[#070B14] text-slate-500 border-slate-800'
              }`}
            >
              SKU → Invoice (&lt;0.2s)
            </span>
          </div>
          <div className="flex justify-center">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border transition-all duration-300 ${
                activeStageIndex === 2
                  ? 'bg-blue-950/90 text-sky-300 border-blue-500/40 shadow-xs shadow-blue-500/20'
                  : 'bg-[#070B14] text-slate-500 border-slate-800'
              }`}
            >
              Bill → Stock Deduction (Atomic)
            </span>
          </div>
        </div>
      </div>

      {/* 3 Sequential Stage Nodes: Product -> Bill -> Stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10 tabular-nums">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = idx === activeStageIndex;
          const isPassed = idx < activeStageIndex;

          return (
            <div
              key={stage.id}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              onMouseEnter={() => setActiveStageIndex(idx)}
              onClick={() => setActiveStageIndex(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveStageIndex(idx);
                }
              }}
              className={`relative p-4 rounded-xl border text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex flex-col justify-between gap-3 overflow-hidden ${
                isActive
                  ? 'bg-[#070B14] border-blue-500/60 ring-1 ring-blue-500/30 shadow-lg shadow-blue-950/50 -translate-y-0.5'
                  : isPassed
                  ? 'bg-[#070B14]/90 border-blue-500/25 hover:border-blue-500/40'
                  : 'bg-[#070B14]/70 border-slate-800/90 opacity-85 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              {/* Active Sapphire Ripple Wave Background Effect */}
              <AnimatePresence>
                {isActive && !prefersReducedMotion && (
                  <motion.div
                    key={`ripple-${stage.id}-${pulseCycle}`}
                    initial={{ opacity: 0.35, scale: 0.6 }}
                    animate={{ opacity: 0, scale: 2.1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                    className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-blue-500/20 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <div className="space-y-2.5 relative z-10">
                {/* Top Row: Step Icon with Ripple Ring + Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                            : isPassed
                            ? 'bg-blue-500/15 text-sky-400 border border-blue-500/30'
                            : 'bg-slate-800/90 text-slate-400 border border-slate-700/70'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {/* Expanding Sapphire Ripple Ring on Active Node */}
                      {isActive && !prefersReducedMotion && (
                        <motion.span
                          key={`ring-${stage.id}-${pulseCycle}`}
                          initial={{ scale: 0.95, opacity: 0.75 }}
                          animate={{ scale: 1.55, opacity: 0 }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'easeOut'
                          }}
                          className="absolute inset-0 rounded-lg border-2 border-sky-400 pointer-events-none"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-extrabold text-sky-400">
                          {stage.stepNumber}
                        </span>
                        <span className="text-xs font-black text-white tracking-tight">
                          {stage.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {stage.subtitle}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border transition-colors ${
                      isActive
                        ? 'bg-blue-500/15 text-sky-300 border-blue-500/40'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/70'
                    }`}
                  >
                    {stage.badge}
                  </span>
                </div>

                {/* Live Stage Data Readout */}
                <div className="p-2.5 rounded-lg bg-[#0E1726]/90 border border-slate-800/80 space-y-0.5">
                  <div className="text-xs font-bold text-white truncate">
                    {stage.primaryMetric}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {stage.secondaryMetric}
                  </div>
                </div>
              </div>

              {/* Stage Footer Status & Quick Jump */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] relative z-10">
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    isActive
                      ? 'text-sky-400'
                      : isPassed
                      ? 'text-sky-400/80'
                      : 'text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>
                    {isActive
                      ? 'Signal Active'
                      : isPassed
                      ? 'Synced in Chain'
                      : 'Connected'}
                  </span>
                </span>

                {stage.onAction && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      stage.onAction?.();
                    }}
                    className="font-bold text-slate-300 hover:text-sky-400 flex items-center gap-0.5 transition-colors cursor-pointer"
                  >
                    <span>{stage.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Live Cause & Effect Telemetry Bar */}
      <div className="p-3 rounded-xl bg-[#070B14]/90 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage.id}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 min-w-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-[11px] font-mono text-slate-300 truncate">
              <strong className="text-sky-400 uppercase mr-1.5">
                [{currentStage.stepNumber} {currentStage.title}]
              </strong>
              {currentStage.causeEffectText}
            </span>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 shrink-0">
          <span>Product</span>
          <ArrowRight className="w-2.5 h-2.5 text-sky-400" />
          <span>Bill</span>
          <ArrowRight className="w-2.5 h-2.5 text-sky-400" />
          <span className="text-sky-400 font-bold">Stock Synced</span>
        </div>
      </div>
    </div>
  );
};

export const EmeraldDataRipple = SapphireDataRipple;
