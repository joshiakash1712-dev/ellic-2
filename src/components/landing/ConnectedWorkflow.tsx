import React, { useState } from 'react';
import {
  Tag,
  Users,
  Receipt,
  CreditCard,
  Boxes,
  FileText,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface WorkflowStage {
  id: string;
  number: string;
  name: string;
  icon: React.ElementType;
  tagline: string;
  summary: string;
  rippleEffect: string;
  mockupSnippet: {
    title: string;
    badge: string;
    lines: Array<{ label: string; value: string }>;
  };
}

const stages: WorkflowStage[] = [
  {
    id: 'products',
    number: '01',
    name: 'Products',
    icon: Tag,
    tagline: 'Catalog & Barcodes',
    summary: 'Add SKUs once with barcode, purchase price, selling price, and GST tax slab.',
    rippleEffect: 'Immediately ready for counter barcode scanners and stock tracking.',
    mockupSnippet: {
      title: 'Catalog Record',
      badge: 'Active SKU',
      lines: [
        { label: 'Item', value: 'Basmati Rice Superior 5kg' },
        { label: 'Barcode', value: '8901234567890 (EAN-13)' },
        { label: 'Retail Price', value: '₹480.00 (Margin: +26%)' },
      ],
    },
  },
  {
    id: 'customers',
    number: '02',
    name: 'Customers',
    icon: Users,
    tagline: 'Profiles & Khata',
    summary: 'Identify repeat buyers by phone number and manage customer credit limits.',
    rippleEffect: 'Links purchase history and credit balance to the customer’s profile.',
    mockupSnippet: {
      title: 'Customer Profile',
      badge: 'VIP Member',
      lines: [
        { label: 'Name', value: 'Rahul Deshmukh (+91 98765 43210)' },
        { label: 'Khata Balance', value: '₹420.00 Outstanding' },
        { label: 'Credit Limit', value: '₹5,000 Safe Cap' },
      ],
    },
  },
  {
    id: 'billing',
    number: '03',
    name: 'Billing',
    icon: Receipt,
    tagline: 'Counter Scan-to-Bill',
    summary: 'Scan items in sub-seconds with optical laser or keyboard search.',
    rippleEffect: 'Generates instant GST-compliant thermal receipts or WhatsApp bills.',
    mockupSnippet: {
      title: 'POS Active Invoice',
      badge: 'INV-2026-0842',
      lines: [
        { label: 'Cart Items', value: '3 Line Items Scanned' },
        { label: 'Total', value: '₹880.00 (CGST + SGST included)' },
        { label: 'Speed', value: '< 0.2s per barcode scan' },
      ],
    },
  },
  {
    id: 'payments',
    number: '04',
    name: 'Payments',
    icon: CreditCard,
    tagline: 'Cash, UPI QR, Cards & Split',
    summary: 'Accept any tender: dynamic scan-and-pay UPI QR, cards, cash, or credit Khata.',
    rippleEffect: 'Settles payment instantly and flags any remaining credit balance.',
    mockupSnippet: {
      title: 'Payment Settlement',
      badge: 'Split Tender Ready',
      lines: [
        { label: 'Paid via UPI QR', value: '₹500.00 (Instant)' },
        { label: 'Added to Khata', value: '₹380.00 (Due Recorded)' },
        { label: 'Status', value: 'Verified & Closed' },
      ],
    },
  },
  {
    id: 'inventory',
    number: '05',
    name: 'Inventory',
    icon: Boxes,
    tagline: 'Live Stock Deduction',
    summary: 'Stock automatically deducts across registers the instant a bill is completed.',
    rippleEffect: 'Warns you before shelves run empty and drafts wholesale reorders.',
    mockupSnippet: {
      title: 'Live Stock Engine',
      badge: 'Real-Time Sync',
      lines: [
        { label: 'Rice 5kg Pool', value: '42 → 41 units remaining' },
        { label: 'Threshold Alert', value: 'Healthy (> 10 units min)' },
        { label: 'Batch Expiry', value: 'Dec 2027 (FIFO Tracked)' },
      ],
    },
  },
  {
    id: 'records',
    number: '06',
    name: 'Records',
    icon: FileText,
    tagline: 'Reports, GST & Audit Logs',
    summary: 'Sales, drawer cash, and GST tax schedules update without manual tallying.',
    rippleEffect: 'No late-night spreadsheets. End-of-day Z-reports are ready in 60 seconds.',
    mockupSnippet: {
      title: 'Daily Business Summary',
      badge: 'Automated Record',
      lines: [
        { label: 'Gross Sales Today', value: '₹48,920 (84 Invoices)' },
        { label: 'Drawer Cash Tally', value: 'Exact match (0 variance)' },
        { label: 'GST Export', value: 'GSTR-1 Ready (1-Click CSV)' },
      ],
    },
  },
];

export const ConnectedWorkflow: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(2); // Start on Billing
  const currentStage = stages[activeStageIndex];

  return (
    <section
      id="workflow"
      className="py-12 sm:py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest text-blue-600 dark:text-sky-400 uppercase select-none mb-2.5 sm:mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 shadow-[0_0_8px_rgba(37,99,235,0.7)]" />
            <span>Connected Workflow</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold normal-case tracking-normal">
              One Connected Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight break-words">
            How data flows through your store.
          </h2>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Every action triggers the next step automatically. No duplicate entries, no manual bookkeeping.
          </p>
        </div>

        {/* 6-Step Visual Sequence Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6 sm:mb-8">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx === activeStageIndex;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStageIndex(idx)}
                className={`p-2.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span
                    className={`text-[10px] sm:text-[11px] font-mono font-bold ${
                      isActive ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {stage.number}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      isActive ? 'text-white' : 'text-blue-600 dark:text-sky-400'
                    }`}
                  />
                </div>
                <div className="text-xs sm:text-sm font-bold truncate">{stage.name}</div>
                <div
                  className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${
                    isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {stage.tagline}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Interactive Showcase Card */}
        <div className="p-4 sm:p-8 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
          {/* Left: Stage Explanation */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                Stage {currentStage.number} of 06
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {currentStage.tagline}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white">
              {currentStage.name}
            </h3>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentStage.summary}
            </p>

            <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-sky-50 dark:bg-blue-950/40 border border-sky-200/80 dark:border-sky-800/60 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                <strong className="text-blue-700 dark:text-sky-300">Automated ripple:</strong>{' '}
                {currentStage.rippleEffect}
              </div>
            </div>

            {/* Quick Flow Navigator */}
            <div className="pt-2 flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={activeStageIndex === 0}
                onClick={() => setActiveStageIndex((prev) => Math.max(0, prev - 1))}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-initial text-center"
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={activeStageIndex === stages.length - 1}
                onClick={() => setActiveStageIndex((prev) => Math.min(stages.length - 1, prev + 1))}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 flex-1 sm:flex-initial"
              >
                <span>Next Stage</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Crisp Mockup Preview Card */}
          <div className="lg:col-span-5 w-full">
            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-800 shadow-md dark:shadow-xl space-y-3 font-sans transition-colors duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span className="truncate">{currentStage.mockupSnippet.title}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-700/60 shrink-0 font-bold">
                  {currentStage.mockupSnippet.badge}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {currentStage.mockupSnippet.lines.map((l, i) => (
                  <div
                    key={i}
                    className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 transition-colors duration-200"
                  >
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0 font-medium">{l.label}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-right break-words">{l.value}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center pt-1 font-medium">
                Data flows in real time without manual re-entry
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
