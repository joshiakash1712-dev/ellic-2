import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const problems = [
  {
    pain: 'Paper Khata & Lost Credit',
    painDesc: 'Customer dues recorded in paper diaries get forgotten, disputed, or lost over time.',
    solution: 'Digital Khata with instant WhatsApp balance reminders and direct UPI payment links.',
  },
  {
    pain: 'Blind Stock Discrepancies',
    painDesc: 'The billing machine doesn’t talk to the stockroom. Shelves run empty without warning.',
    solution: 'Live inventory deduction on every barcode scan with automated low-stock reorder alerts.',
  },
  {
    pain: 'Slow Counter Queues',
    painDesc: 'Clunky POS software freezes during evening rush, causing frustrated shoppers to walk away.',
    solution: 'Sub-second optical barcode checkout that runs smoothly even when internet drops.',
  },
  {
    pain: 'Late-Night Spreadsheet Clutter',
    painDesc: 'Shop owners spend hours after closing manually tallying drawer cash, bills, and GST sheets.',
    solution: 'Single-click day-end Z-reports and export-ready GST summaries generated in real time.',
  },
];

export const ProblemSection: React.FC = () => {
  return (
    <section
      id="problem"
      className="py-12 sm:py-16 md:py-24 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12 md:mb-16">
          <div className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400 mb-3">
            The Retail Reality
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 dark:text-white tracking-[-0.02em] leading-[1.12] break-words">
            Stop running your shop across disconnected tools.
          </h2>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Local retail shouldn’t require juggling paper notebooks, separate billing machines, and manual spreadsheets.
          </p>
        </div>

        {/* 4 Contrast Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
          {problems.map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
            >
              {/* Problem (The Old Way) */}
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-0.5">
                    The Problem
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {item.pain}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.painDesc}
                  </p>
                </div>
              </div>

              {/* Arrow Connector */}
              <div className="flex items-center gap-2 pl-2 sm:pl-3 text-slate-400 dark:text-slate-600 text-xs">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 dark:text-sky-400 flex items-center gap-1">
                  How Ellic fixes it <ArrowRight className="w-3 h-3" />
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Solution (The Ellic Way) */}
              <div className="flex items-start gap-2.5 sm:gap-3 bg-sky-50/50 dark:bg-blue-950/20 p-3 sm:p-3.5 rounded-lg sm:rounded-xl border border-sky-100 dark:border-blue-900/40">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-blue-600/10 dark:bg-sky-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {item.solution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
