import React from 'react';
import {
  Receipt,
  Boxes,
  Users,
  CreditCard,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

interface CapabilityCard {
  id: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  points: string[];
}

const capabilities: CapabilityCard[] = [
  {
    id: 'billing',
    title: 'Billing & POS',
    badge: 'Sub-0.2s Checkout',
    icon: Receipt,
    description: 'Fast counter checkout with USB/Bluetooth optical barcode scanners and instant thermal printing.',
    points: [
      'Sub-second barcode scan & keyboard shortcuts',
      'Instant 58mm/80mm thermal receipts & PDF bills',
      'Direct WhatsApp digital bills sent to shoppers',
    ],
  },
  {
    id: 'inventory',
    title: 'Products & Inventory',
    badge: 'Real-Time Sync',
    icon: Boxes,
    description: 'Track stock across registers with automatic deductions on every sale and proactive restock alerts.',
    points: [
      'Automatic stock deduction on every sale',
      'Batch tracking with 30-day expiry warnings',
      'Built-in barcode generator & label printing',
    ],
  },
  {
    id: 'customers',
    title: 'Customers & Khata',
    badge: 'Zero-Paper Ledger',
    icon: Users,
    description: 'Replace paper diaries with a digital Khata credit book and automated payment reminders.',
    points: [
      'Customer credit limits to prevent overdue exposure',
      '1-tap WhatsApp balance reminders with UPI payment links',
      'Full purchase history & loyalty points per buyer',
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Settlements',
    badge: 'Multi-Tender',
    icon: CreditCard,
    description: 'Accept any tender: dynamic exact-amount UPI QR codes, debit/credit cards, cash, and split bills.',
    points: [
      'Dynamic UPI QR generated per invoice for scan-and-pay',
      'Split payments (e.g. part cash + part UPI + part credit)',
      'Cash drawer reconciliation on shift handover',
    ],
  },
  {
    id: 'team',
    title: 'Team & Access Control',
    badge: '4-Digit PINs',
    icon: ShieldCheck,
    description: 'Keep your cash register secure with role-based access control and rapid cashier switching.',
    points: [
      'Quick 4-digit PIN login for counter cashiers',
      'Shift opening and closing drawer cash balancing',
      'Protect discount approval & wholesale buying prices',
    ],
  },
  {
    id: 'reports',
    title: 'Reports & Records',
    badge: 'Audit Ready',
    icon: BarChart3,
    description: 'Daily Z-reports, gross profit margins, and GST tax breakdowns generated without manual calculation.',
    points: [
      'End-of-day Z-reports generated in 60 seconds',
      'GSTR-1 sales schedules with HSN summary export',
      'Tamper-evident audit logs of every price override',
    ],
  },
];

export const CoreCapabilities: React.FC = () => {
  return (
    <section
      id="features"
      className="py-12 sm:py-16 md:py-24 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12 md:mb-16">
          <div className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400 mb-3">
            Core Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 dark:text-white tracking-[-0.02em] leading-[1.12] break-words">
            Six tools unified into one platform.
          </h2>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Everything your store needs to operate efficiently every day—without the bloat.
          </p>
        </div>

        {/* 6 Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                      {cap.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white mb-1.5 sm:mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3 sm:mb-4">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  {cap.points.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{point}</span>
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
