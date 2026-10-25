import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Award,
  ShieldCheck,
  Network,
  CheckCircle2,
  ArrowRight,
  MousePointer2,
  Terminal,
  WifiOff,
  RefreshCw,
  Keyboard
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface BenefitItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  expandedDetails: string;
  icon: React.ElementType;
  keyMetric: string;
  bullets: string[];
  metrics: Array<{ label: string; value: string }>;
  previewData: {
    badgeText: string;
    headline: string;
    statusText: string;
    snippet: React.ReactNode;
  };
}

const benefits: BenefitItem[] = [
  {
    id: 'simple',
    title: 'Simple',
    subtitle: 'Zero Learning Curve',
    description: 'Designed for everyday business owners and staff, not software engineers. If you know how to use a smartphone, you already know how to run Ellic.',
    expandedDetails: 'Every workflow has been trimmed down to the minimum necessary taps. With intuitive search, standard keyboard shortcuts (F2 for bill, F4 for cash, F8 for barcode search), and zero obscure database settings, new cashiers become fully productive on their very first shift.',
    icon: Sparkles,
    keyMetric: '< 2 min onboarding',
    bullets: [
      'Clean, distraction-free interfaces',
      'No specialized IT training needed',
      'One-click item selection & keyboard hotkeys'
    ],
    metrics: [
      { label: 'Staff Onboarding', value: '< 2 Minutes' },
      { label: 'Checkout Steps', value: '3 Taps / Hotkeys' },
      { label: 'IT Overhead', value: 'Zero Setup' }
    ],
    previewData: {
      badgeText: 'Zero-Friction Cashier HUD',
      headline: 'One-Tap Hotkey & Smart Search Workflow',
      statusText: 'First-shift ready without training',
      snippet: (
        <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-2.5 border border-slate-800 shadow-inner">
          <div className="flex justify-between items-center text-sky-400 border-b border-slate-800 pb-1.5 font-bold">
            <span className="flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              <span>INTUITIVE COUNTER SHORTCUTS</span>
            </span>
            <span className="text-[10px] bg-blue-950/80 px-2 py-0.5 rounded text-sky-300 border border-sky-800/60">
              ACTIVE MODE
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="text-sky-400 font-bold">[F2] New Bill</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Auto-focus scanner</div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="text-sky-400 font-bold">[F4] Quick Cash</div>
              <div className="text-slate-400 text-[10px] mt-0.5">1-tap exact tender</div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="text-sky-400 font-bold">[F8] Item Lookup</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Fuzzy name/SKU</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
            <span>Cashier Prompt: &quot;Scan item or press Enter to print&quot;</span>
            <span className="text-sky-400 font-bold">0 Config Needed</span>
          </div>
        </div>
      )
    }
  },
  {
    id: 'fast',
    title: 'Fast',
    subtitle: 'High-Speed Counter Ops',
    description: 'Never keep a line waiting. High-frequency barcode scanning, quick-touch favorites, and 3-tap checkout ensure lightning-fast customer throughput.',
    expandedDetails: 'Our rendering engine eliminates counter stutter. Barcode readers trigger asynchronous cache lookups in under 15ms, thermal receipts print instantly via direct USB/network socket spooling, and dynamic UPI QR codes generate in under 200ms.',
    icon: Zap,
    keyMetric: '0.4s barcode response',
    bullets: [
      'Sub-second SKU lookups (< 15ms local cache)',
      'Instant UPI dynamic QR generation (< 200ms)',
      'Rapid thermal receipt dispatch with zero lag'
    ],
    metrics: [
      { label: 'SKU Cache Lookup', value: '< 15ms Memory' },
      { label: 'Barcode Response', value: '0.4s End-to-End' },
      { label: 'Dynamic UPI QR', value: '< 200ms Render' }
    ],
    previewData: {
      badgeText: 'High-Frequency POS Engine',
      headline: 'Sub-Second Scanner & Spooler Benchmark',
      statusText: 'Peak Rush-Hour Certified',
      snippet: (
        <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
          <div className="flex justify-between items-center text-sky-400 border-b border-slate-800 pb-1.5 font-bold">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>COUNTER LATENCY TELEMETRY</span>
            </span>
            <span className="text-[10px] bg-blue-950/80 px-2 py-0.5 rounded text-sky-300 border border-sky-800/60">
              120 FPS UI
            </span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span>1. Optical Barcode Decode → Local SKU Cache</span>
              <span className="text-sky-400 font-bold">12 ms</span>
            </div>
            <div className="flex justify-between">
              <span>2. GST Slab & Cart Total Recalculation</span>
              <span className="text-sky-400 font-bold">4 ms</span>
            </div>
            <div className="flex justify-between">
              <span>3. Dynamic Exact-Amount UPI QR Payload</span>
              <span className="text-sky-400 font-bold">165 ms</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-white font-bold">
              <span>Total Queue Turnaround Time</span>
              <span className="text-sky-400">&lt; 8.5s / Customer</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: 'professional',
    title: 'Professional',
    subtitle: 'Elevate Customer Trust',
    description: 'Give customers a polished experience with branded GST invoices, paperless WhatsApp bills, accurate loyalty point receipts, and clear itemized totals.',
    expandedDetails: 'Impress your customers with beautifully formatted bills displaying your logo, custom greetings, GSTIN, HSN summaries, and dynamic QR verification codes. Customers appreciate paperless WhatsApp invoices and clear digital Khata balance notifications.',
    icon: Award,
    keyMetric: '100% Tax Compliant',
    bullets: [
      'Clean branded PDF & 80mm thermal bills',
      'Automated WhatsApp digital billing updates',
      'Transparent itemized GST & customer Khata ledgers'
    ],
    metrics: [
      { label: 'Tax Compliance', value: '100% GST / HSN' },
      { label: 'Digital Delivery', value: '1-Tap WhatsApp' },
      { label: 'Brand Identity', value: 'Custom Store Header' }
    ],
    previewData: {
      badgeText: 'Branded Tax Invoice Engine',
      headline: 'Verified GST Receipt & WhatsApp Dispatch',
      statusText: 'GSTR-1 & HSN Compliant',
      snippet: (
        <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <div>
              <div className="font-bold text-white">SHARMA SUPERMART · GSTIN 27AABCS1429B1Z</div>
              <div className="text-[10px] text-slate-400">Tax Invoice #INV-2026-4910 · HSN Verified</div>
            </div>
            <span className="text-[10px] bg-blue-950/80 px-2 py-0.5 rounded text-sky-300 border border-sky-800/60 font-bold">
              WHATSAPP SENT
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span>Itemized Subtotal (4 Items · HSN 1006/1514)</span>
              <span>₹1,240.00</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>CGST (2.5%): ₹31.00  |  SGST (2.5%): ₹31.00</span>
              <span>₹62.00</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-white font-bold">
              <span>Grand Total (Loyalty Earned: +13 Pts)</span>
              <span className="text-sky-400">₹1,302.00</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: 'reliable',
    title: 'Reliable',
    subtitle: 'Offline-First Resilience',
    description: 'Your business cannot afford downtime. Built with local data caching and automatic cloud sync, sales continue smoothly even during power or internet drops.',
    expandedDetails: 'The cash register never halts. If your broadband or mobile hotspot drops, Ellic seamlessly switches to local IndexedDB caching. Invoices, cash receipts, and inventory deductions continue locally and reconcile the second connectivity returns.',
    icon: ShieldCheck,
    keyMetric: '99.99% Uptime Guarantee',
    bullets: [
      'Works seamlessly during internet drops',
      'Automatic background cloud queue reconciliation',
      'Bank-grade multi-tenant encrypted records'
    ],
    metrics: [
      { label: 'Counter Uptime', value: '99.99% Resilient' },
      { label: 'Offline Engine', value: 'Local Queue Cache' },
      { label: 'Cloud Recovery', value: 'Auto-Reconcile' }
    ],
    previewData: {
      badgeText: 'Offline-First Sync Engine',
      headline: 'Zero-Downtime Local Queue & Auto-Recovery',
      statusText: 'Zero Lost Bills Guaranteed',
      snippet: (
        <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 font-bold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <WifiOff className="w-3.5 h-3.5" />
              <span>NETWORK DROP DETECTED → LOCAL MODE</span>
            </span>
            <span className="text-[10px] bg-blue-950/80 px-2 py-0.5 rounded text-sky-300 border border-sky-800/60">
              POS UNINTERRUPTED
            </span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span>Local Encrypted Queue (Invoices #1042–#1048)</span>
              <span className="text-white font-bold">7 Bills Cached</span>
            </div>
            <div className="flex justify-between items-center text-sky-400">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                <span>Connection Restored → Atomic Cloud Flush</span>
              </span>
              <span className="font-bold">Synced in 180ms ✓</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: 'connected',
    title: 'Connected',
    subtitle: 'One Unified Source of Truth',
    description: 'Say goodbye to isolated software silos. Stock, billing, customers, cashier shifts, and tax reports are permanently wired into a single synchronized hub.',
    expandedDetails: 'No more spreadsheets or duplicate entry. When an item is billed at the till, stock is decremented immediately, loyalty points are added to the customer ledger, shift drawer balances increment, and day-end tax ledgers update in a single transaction.',
    icon: Network,
    keyMetric: 'Unified Architecture',
    bullets: [
      'Automatic stock decrements on every sale',
      'Zero manual spreadsheet reconciliation',
      'Real-time multi-store & multi-register sync'
    ],
    metrics: [
      { label: 'Architecture', value: 'Single Source Hub' },
      { label: 'Manual Re-Entry', value: '0 Spreadsheets' },
      { label: 'Store Sync', value: 'Real-Time Live' }
    ],
    previewData: {
      badgeText: 'Unified Event Bus Architecture',
      headline: 'Single-Sale Multi-Module Synchronization',
      statusText: 'All Store Modules Linked',
      snippet: (
        <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
          <div className="flex justify-between items-center text-sky-400 border-b border-slate-800 pb-1.5 font-bold">
            <span>EVENT: SALE_COMMITTED (#INV-2026-884)</span>
            <span className="text-[10px] bg-blue-950/80 px-2 py-0.5 rounded text-sky-300 border border-sky-800/60">
              5/5 MODULES SYNCED
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between">
              <span>Inventory Stock</span>
              <span className="text-sky-400 font-bold">-3 Units ✓</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between">
              <span>Shift Cash Till</span>
              <span className="text-sky-400 font-bold">+₹880.00 ✓</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between">
              <span>Customer Khata</span>
              <span className="text-sky-400 font-bold">Ledger Updated ✓</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between">
              <span>GSTR-1 Tax P&amp;L</span>
              <span className="text-sky-400 font-bold">+₹40.00 GST ✓</span>
            </div>
          </div>
        </div>
      )
    }
  }
];

export const WhyEllixConnect: React.FC = () => {
  const [selectedBenefitId, setSelectedBenefitId] = useState<string>('simple');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [originIndex, setOriginIndex] = useState<number>(0);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  const selectedBenefit = benefits.find((b) => b.id === selectedBenefitId) || benefits[0];
  const SelectedIcon = selectedBenefit.icon;

  // Spatial transform-origin mapped to the 3-top + 2-bottom card layout
  const getOrigin = (index: number) => {
    switch (index) {
      case 0:
        return '16.6% 25%'; // Top-left card (Simple)
      case 1:
        return '50.0% 25%'; // Top-center card (Fast)
      case 2:
        return '83.3% 25%'; // Top-right card (Professional)
      case 3:
        return '25.0% 75%'; // Bottom-left card (Reliable)
      case 4:
        return '75.0% 75%'; // Bottom-right card (Connected)
      default:
        return '50.0% 50%';
    }
  };

  const handleCardMouseEnter = (id: string, index: number) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // 50ms intentional buffer to prevent rapid accidental flickering
    hoverTimeoutRef.current = setTimeout(() => {
      setSelectedBenefitId(id);
      setOriginIndex(index);
      setIsHovered(true);
    }, 50);
  };

  const handleSectionMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // 160ms grace buffer before returning to the 5-pillar card composition
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 160);
  };

  const handleSectionMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, id: string, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedBenefitId(id);
      setOriginIndex(index);
      setIsHovered(true);
    } else if (e.key === 'Escape' && isHovered) {
      e.preventDefault();
      setIsHovered(false);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (index + 1) % benefits.length;
      setSelectedBenefitId(benefits[nextIdx].id);
      setOriginIndex(nextIdx);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (index - 1 + benefits.length) % benefits.length;
      setSelectedBenefitId(benefits[prevIdx].id);
      setOriginIndex(prevIdx);
    }
  };

  return (
    <section
      id="why-ellix"
      className="py-20 md:py-28 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-blue-600 dark:text-sky-400 uppercase select-none mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 shadow-[0_0_8px_rgba(37,99,235,0.7)]" />
            <span>Why Ellic</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold normal-case tracking-normal">Built for Reliability</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Built for modern retail. Built to last.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Five architectural pillars engineered so store owners and counter staff can run their entire business with confidence.
            <span className="hidden lg:inline text-blue-600 dark:text-sky-400 font-semibold ml-1">
              Hover over any pillar below to explore its live architectural deep dive in-place.
            </span>
          </p>
        </div>

        {/* ============================================================ */}
        {/* DESKTOP EXPERIENCE (lg: screens and wider): MORPHING WORKSPACE */}
        {/* ============================================================ */}
        <div
          className="hidden lg:grid lg:grid-cols-1 items-stretch relative box-border"
          onMouseEnter={handleSectionMouseEnter}
          onMouseLeave={handleSectionMouseLeave}
        >
          {/* Layer 1: Background 5-Pillar Card Composition (3 Top + 2 Bottom) */}
          <div
            className={`col-start-1 row-start-1 w-full h-full min-h-[580px] space-y-6 transition-all duration-200 ease-out will-change-transform ${
              isHovered
                ? 'opacity-20 scale-[0.99] pointer-events-auto'
                : 'opacity-100 scale-100'
            }`}
          >
            {/* Top Row: First 3 Pillars */}
            <div className="grid grid-cols-3 gap-6">
              {benefits.slice(0, 3).map((benefit, index) => {
                const Icon = benefit.icon;
                const isSelected = selectedBenefitId === benefit.id;

                return (
                  <div
                    key={benefit.id}
                    id={`benefit-${benefit.id}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    data-cursor="card"
                    onMouseEnter={() => handleCardMouseEnter(benefit.id, index)}
                    onClick={() => handleCardMouseEnter(benefit.id, index)}
                    onKeyDown={(e) => handleCardKeyDown(e, benefit.id, index)}
                    className={`website-card-hover p-6 rounded-2xl text-left flex flex-col justify-between cursor-pointer border transition-all duration-200 ${
                      isSelected && !isHovered
                        ? 'bg-white dark:bg-slate-900 border-sky-500/60 ring-2 ring-blue-500/30 shadow-md text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 hover:shadow-lg text-slate-900 dark:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          data-icon-box
                          className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center transition-all duration-200"
                        >
                          <Icon className="w-5 h-5 transition-transform duration-200" />
                        </div>
                        <span
                          data-card-badge
                          className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-sky-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors duration-200"
                        >
                          {benefit.keyMetric}
                        </span>
                      </div>

                      <div className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-sky-400 mb-1">
                        {benefit.subtitle}
                      </div>
                      <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                        {benefit.description}
                      </p>
                    </div>

                    <div
                      data-card-support
                      className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 transition-transform duration-200"
                    >
                      {benefit.bullets.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span className="truncate">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Row: Remaining 2 Pillars */}
            <div className="grid grid-cols-2 gap-6">
              {benefits.slice(3, 5).map((benefit, offset) => {
                const index = offset + 3;
                const Icon = benefit.icon;
                const isSelected = selectedBenefitId === benefit.id;

                return (
                  <div
                    key={benefit.id}
                    id={`benefit-${benefit.id}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    data-cursor="card"
                    onMouseEnter={() => handleCardMouseEnter(benefit.id, index)}
                    onClick={() => handleCardMouseEnter(benefit.id, index)}
                    onKeyDown={(e) => handleCardKeyDown(e, benefit.id, index)}
                    className={`website-card-hover p-6 rounded-2xl text-left flex flex-row justify-between gap-6 cursor-pointer border transition-all duration-200 ${
                      isSelected && !isHovered
                        ? 'bg-white dark:bg-slate-900 border-sky-500/60 ring-2 ring-blue-500/30 shadow-md text-slate-900 dark:text-white'
                        : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 hover:shadow-lg text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          data-icon-box
                          className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center transition-all duration-200"
                        >
                          <Icon className="w-5 h-5 transition-transform duration-200" />
                        </div>
                        <span
                          data-card-badge
                          className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-sky-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors duration-200"
                        >
                          {benefit.keyMetric}
                        </span>
                      </div>

                      <div className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-sky-400 mb-1">
                        {benefit.subtitle}
                      </div>
                      <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>

                    <div
                      data-card-support
                      className="w-60 pl-6 border-l border-slate-100 dark:border-slate-800/80 flex flex-col justify-center space-y-2 text-[11px] text-slate-500 dark:text-slate-400 transition-transform duration-200"
                    >
                      {benefit.bullets.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Layer 2: Morphing Interactive Architectural Workspace */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                key="why-ellix-expanded-workspace"
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.97,
                        transformOrigin: getOrigin(originIndex)
                      }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        scale: 1,
                        transformOrigin: getOrigin(originIndex)
                      }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.97,
                        transformOrigin: getOrigin(originIndex)
                      }
                }
                transition={{
                  duration: 0.32,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="col-start-1 row-start-1 z-20 w-full h-full min-h-[580px] box-border overflow-hidden p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-sky-500/40 dark:border-sky-500/30 shadow-2xl ring-1 ring-blue-500/20 flex flex-col justify-between gap-5"
              >
                {/* Top Interactive Pillar Switcher Ribbon */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                        Architectural Deep-Dive Workspace
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-sky-100 dark:bg-blue-950/80 text-blue-800 dark:text-sky-300 text-[11px] font-mono font-bold border border-sky-300/60 dark:border-sky-800/60">
                        {selectedBenefit.keyMetric}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <MousePointer2 className="w-3.5 h-3.5 text-sky-500" />
                      <span>Hover any pillar pill to transform workspace</span>
                    </div>
                  </div>

                  {/* 5 Pillar Dock Pills */}
                  <div className="grid grid-cols-5 gap-2 mb-6 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200/90 dark:border-slate-800/80 shadow-inner">
                    {benefits.map((b, idx) => {
                      const PillarIcon = b.icon;
                      const isActive = b.id === selectedBenefitId;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          data-cursor="hover"
                          aria-pressed={isActive}
                          onMouseEnter={() => handleCardMouseEnter(b.id, idx)}
                          onClick={() => handleCardMouseEnter(b.id, idx)}
                          className={`relative py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                            isActive
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 border border-sky-500/50 shadow-sm ring-1 ring-blue-500/20'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/60 border border-transparent'
                          }`}
                        >
                          <PillarIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-500' : 'text-slate-400'}`} />
                          <span className="truncate">{b.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Workspace Content: Two-Column Fluid Morphing State */}
                <div className="flex-1 flex flex-col lg:flex-row items-start justify-between gap-8">
                  {/* Left: Architectural Deep Dive, Checklist & Key Metrics */}
                  <motion.div
                    key={`why-left-${selectedBenefit.id}`}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full lg:w-[48%] space-y-4"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-blue-950/80 text-blue-800 dark:text-sky-300 text-xs font-bold border border-sky-300/60 dark:border-sky-800/60">
                      <SelectedIcon className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                      <span>{selectedBenefit.subtitle}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                      How &ldquo;{selectedBenefit.title}&rdquo; is engineered in Ellic
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {selectedBenefit.expandedDetails}
                    </p>

                    {/* Pillar Checklist */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        Core Architectural Guarantees:
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                        {selectedBenefit.bullets.map((point, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metric Badges */}
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      {selectedBenefit.metrics.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs"
                        >
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold truncate">
                            {item.label}
                          </div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Right: Live Architectural Simulation Preview */}
                  <motion.div
                    key={`why-right-${selectedBenefit.id}`}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full lg:w-[52%]"
                  >
                    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3.5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            {selectedBenefit.previewData.badgeText}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-sky-400 bg-sky-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-800/60">
                          {selectedBenefit.keyMetric}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                          {selectedBenefit.previewData.headline}
                        </h4>
                        {selectedBenefit.previewData.snippet}
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                        <span>Key Performance Target: {selectedBenefit.keyMetric}</span>
                        <span className="text-sky-500 font-semibold">
                          {selectedBenefit.previewData.statusText}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================ */}
        {/* MOBILE & TABLET EXPERIENCE (< lg screens): CLEAN & ACCESSIBLE */}
        {/* ============================================================ */}
        <div className="block lg:hidden space-y-4">
          <div className="flex sm:grid sm:grid-cols-2 gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              const isSelected = selectedBenefitId === benefit.id;

              return (
                <button
                  key={benefit.id}
                  id={`mobile-benefit-${benefit.id}`}
                  type="button"
                  onClick={() => setSelectedBenefitId(benefit.id)}
                  aria-pressed={isSelected}
                  className={`snap-start shrink-0 w-[250px] sm:w-auto p-4 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-sky-500 ring-2 ring-blue-500/40 shadow-md text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-blue-950 text-blue-600 dark:text-sky-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-sky-400">
                        {benefit.keyMetric}
                      </span>
                    </div>

                    <div className="text-[10px] font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider mb-0.5">
                      {benefit.subtitle}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {benefit.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-sky-400">
                    <span>{isSelected ? 'Viewing architectural details ↓' : 'Tap to preview'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobile Detail Panel */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-blue-950 text-blue-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800">
                <SelectedIcon className="w-3.5 h-3.5" />
                <span>{selectedBenefit.subtitle}</span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">
                {selectedBenefit.keyMetric}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
              How &ldquo;{selectedBenefit.title}&rdquo; is engineered in Ellic
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedBenefit.expandedDetails}
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Core Architectural Guarantees:
              </div>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {selectedBenefit.bullets.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              {selectedBenefit.previewData.snippet}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

