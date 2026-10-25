import React, { useState } from 'react';
import {
  Receipt,
  Boxes,
  Users,
  LayoutDashboard,
  BarChart3,
  CheckCircle2,
  ScanLine,
  Search,
  Sparkles,
} from 'lucide-react';

type TabKey = 'pos' | 'inventory' | 'khata' | 'dashboard' | 'reports';

interface TabItem {
  id: TabKey;
  label: string;
  badge: string;
  icon: React.ElementType;
  headline: string;
  description: string;
}

const tabs: TabItem[] = [
  {
    id: 'pos',
    label: 'Billing POS',
    badge: 'Sub-0.2s',
    icon: Receipt,
    headline: 'Express Optical Checkout',
    description: 'Instant barcode scanning, dynamic UPI QR code generation, and 1-click thermal printing.',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    badge: 'Live Sync',
    icon: Boxes,
    headline: 'Real-Time Batch Control',
    description: 'Automatic stock deductions on every sale with proactive low-stock alerts and expiry monitoring.',
  },
  {
    id: 'khata',
    label: 'Khata CRM',
    badge: 'Zero-Paper',
    icon: Users,
    headline: 'Digital Customer Credit Book',
    description: 'Enforce safety credit limits and send automated WhatsApp payment reminders with UPI links.',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    badge: 'Real-Time',
    icon: LayoutDashboard,
    headline: 'Live Store Command',
    description: 'Monitor daily sales revenue, net profit margins, completed bills, and active registers.',
  },
  {
    id: 'reports',
    label: 'Reports & GST',
    badge: '1-Click Export',
    icon: BarChart3,
    headline: 'Automated Tax & Z-Reports',
    description: 'Statutory GSTR-1 sales schedules, gross margin audits, and end-of-day register balancing.',
  },
];

export const ProductPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('pos');
  const activeTabMeta = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section
      id="product"
      className="py-12 sm:py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 md:mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-blue-600 dark:text-sky-400 uppercase select-none mb-2.5 sm:mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 shadow-[0_0_8px_rgba(37,99,235,0.7)]" />
            <span>Interactive Interface</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold normal-case tracking-normal">
              Product Experience
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Designed for speed at the counter.
          </h2>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            See the actual interface your counter staff and managers use every day.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-sky-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Product Window Shell */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-slate-300/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
          {/* Window Header */}
          <div className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-400 shrink-0" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 shrink-0" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 shrink-0" />
              <span className="ml-1 sm:ml-2 text-[11px] sm:text-xs font-mono font-bold text-slate-600 dark:text-slate-300 truncate">
                Ellic Enterprise • {activeTabMeta.label}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-blue-900 shrink-0 whitespace-nowrap">
              {activeTabMeta.badge}
            </span>
          </div>

          {/* Module Content */}
          <div className="p-3.5 sm:p-5 md:p-7 space-y-4 sm:space-y-5">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white">
                {activeTabMeta.headline}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {activeTabMeta.description}
              </p>
            </div>

            {/* TAB 1: POS BILLING SCREEN */}
            {activeTab === 'pos' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span>Scanned Items (3)</span>
                    <span className="text-blue-600 dark:text-sky-400">Register #01</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Basmati Rice Superior 5kg</div>
                        <div className="text-[10px] text-slate-500 font-mono">8901234567890 • 1 unit</div>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">₹480.00</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Organic Turmeric Powder 500g</div>
                        <div className="text-[10px] text-slate-500 font-mono">8904567890123 • 2 units</div>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">₹240.00</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Cold-Pressed Mustard Oil 1L</div>
                        <div className="text-[10px] text-slate-500 font-mono">8909876543210 • 1 unit</div>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">₹160.00</div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-sky-400">
                      Payment Settlement
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>₹838.10</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>GST (5%)</span>
                      <span>₹41.90</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-950 dark:text-white pt-2 border-t border-blue-200 dark:border-blue-800">
                      <span>Grand Total</span>
                      <span className="text-blue-700 dark:text-sky-300">₹880.00</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all text-center"
                    >
                      Instant UPI QR Checkout (₹880)
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Cash (F1)
                      </button>
                      <button
                        type="button"
                        className="flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Khata (F3)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INVENTORY SCREEN */}
            {activeTab === 'inventory' && (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Catalog SKUs (1,240 Total)</span>
                  <span className="text-sky-600 dark:text-sky-400 font-medium">Automatic stock decrements on sale</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Basmati Rice Superior 5kg</div>
                      <div className="text-[10px] text-slate-500">Batch #BT-902 • Expiry Dec 2027</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-700 dark:text-slate-300">41 units in stock</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        In Stock
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Aashirvaad Whole Wheat Atta 10kg</div>
                      <div className="text-[10px] text-slate-500">Batch #BT-881 • Expiry Nov 2026</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">4 units remaining</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Low Stock Alert
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: KHATA CRM SCREEN */}
            {activeTab === 'khata' && (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Customer Credit Book (Khata)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Zero-Paper</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Rahul Deshmukh</div>
                      <div className="text-[10px] text-slate-500">+91 98765 43210 • Regular Customer</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-rose-600 dark:text-rose-400">₹420.00 Due</div>
                        <div className="text-[10px] text-slate-400">Limit: ₹5,000</div>
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                      >
                        Send WhatsApp Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DASHBOARD SCREEN */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[11px]">Today’s Gross Revenue</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">₹48,920</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+18.4% vs yesterday</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[11px]">Invoices Completed</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">84 Bills</div>
                  <div className="text-[10px] text-blue-600 dark:text-sky-400 font-semibold">Avg ₹582 / bill</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[11px]">Gross Profit Margin</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">25.4%</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">₹12,425 profit</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[11px]">Active Registers</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">2 Online</div>
                  <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Cash drawer balanced</div>
                </div>
              </div>
            )}

            {/* TAB 5: REPORTS & GST SCREEN */}
            {activeTab === 'reports' && (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Statutory Tax & Day-End Summaries</span>
                  <span className="text-blue-600 dark:text-sky-400 font-medium">Ready for GSTR-1 Portal</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-500 text-[10px]">CGST + SGST Collected</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">₹2,329.50</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-500 text-[10px]">Shift Z-Report Status</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Drawer Balanced</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-500 text-[10px]">1-Click Portal Export</div>
                    <div className="text-base font-bold text-blue-600 dark:text-sky-400 mt-0.5">Download CSV / PDF</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
