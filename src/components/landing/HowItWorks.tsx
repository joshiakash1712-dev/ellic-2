import React, { useState } from 'react';
import { Store, Receipt, TrendingUp, CheckCircle2 } from 'lucide-react';

interface Step {
  step: string;
  title: string;
  time: string;
  description: string;
  icon: React.ElementType;
  preview: {
    heading: string;
    items: string[];
  };
}

const steps: Step[] = [
  {
    step: '01',
    title: 'Add your products',
    time: '< 5 Minutes',
    description: 'Import your catalog via spreadsheet or scan items on your counter. Set selling prices and GST slabs once.',
    icon: Store,
    preview: {
      heading: 'Catalog Ready',
      items: [
        'Scan EAN/UPC barcodes',
        'Auto-calculate margin (+26%)',
        'Assign 5/12/18% GST slab',
      ],
    },
  },
  {
    step: '02',
    title: 'Bill in sub-seconds',
    time: 'Daily Counter',
    description: 'Cashiers scan items with any USB/Bluetooth scanner. Print thermal receipts or send digital bills via WhatsApp.',
    icon: Receipt,
    preview: {
      heading: 'Sub-0.2s POS',
      items: [
        'Plug-and-play barcode input',
        'Dynamic UPI QR code checkout',
        'Split cash, card, & credit Khata',
      ],
    },
  },
  {
    step: '03',
    title: 'Stay in sync automatically',
    time: 'Always Live',
    description: 'Every sale automatically decrements stock, updates customer Khata balances, and prepares your daily Z-report.',
    icon: TrendingUp,
    preview: {
      heading: 'Auto-Reconciliation',
      items: [
        'Live inventory count updated',
        'Zero-paper customer credit logged',
        '60-second shift drawer close',
      ],
    },
  },
];

export const HowItWorks: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  return (
    <section
      id="how-it-works"
      className="py-12 sm:py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest text-blue-600 dark:text-sky-400 uppercase select-none mb-2.5 sm:mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 shadow-[0_0_8px_rgba(37,99,235,0.7)]" />
            <span>How Ellic Works</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold normal-case tracking-normal">
              3 Simple Steps
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight break-words">
            Up and running in minutes.
          </h2>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            No expensive IT consultants, no long training sessions.
          </p>
        </div>

        {/* 3 Visual Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStepIndex === idx;
            return (
              <div
                key={s.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4.5 sm:p-6 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-50/50 dark:bg-blue-950/20 border-blue-500/50 dark:border-blue-700/60 shadow-md ring-1 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-900">
                      Step {s.step}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {s.time}
                    </span>
                  </div>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-sky-400 flex items-center justify-center mb-3 sm:mb-4">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white mb-1.5 sm:mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 sm:mb-6">
                    {s.description}
                  </p>
                </div>

                {/* Micro Visual Card */}
                <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:text-sky-400" />
                    <span className="truncate">{s.preview.heading}</span>
                  </div>
                  {s.preview.items.map((it, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
