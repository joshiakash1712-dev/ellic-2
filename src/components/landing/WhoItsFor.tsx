import React, { useState } from 'react';
import {
  ShoppingBag,
  Shirt,
  Wrench,
  Pill,
  Truck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface Vertical {
  id: string;
  name: string;
  icon: React.ElementType;
  tagline: string;
  summary: string;
  keyFeatures: string[];
}

const verticals: Vertical[] = [
  {
    id: 'grocery',
    name: 'Supermarkets & Grocery',
    icon: ShoppingBag,
    tagline: 'High Volume & Quick Queues',
    summary: 'Speed through evening counter rushes with sub-second optical scanning and automated batch expiry monitoring.',
    keyFeatures: [
      'Sub-0.2s barcode scanning for long counter queues',
      'First-in-first-out (FIFO) batch tracking with expiry alerts',
      'Dynamic UPI QR codes for instant contactless payments',
    ],
  },
  {
    id: 'fashion',
    name: 'Retail & Fashion',
    icon: Shirt,
    tagline: 'Apparel, Footwear & Variants',
    summary: 'Manage complex size, fit, and color variants without clutter. Print custom thermal barcode hang-tags.',
    keyFeatures: [
      'Parent-child variant matrix (Sizes & Colors under 1 master SKU)',
      'Built-in thermal barcode price tag & hang-tag generator',
      'Seasonal promotional discounts & customer loyalty points',
    ],
  },
  {
    id: 'hardware',
    name: 'Hardware & Electricals',
    icon: Wrench,
    tagline: 'Tools, Multi-Unit & Contractor Khata',
    summary: 'Handle versatile measurement units and maintain flexible credit Khata accounts for local contractors.',
    keyFeatures: [
      'Multi-unit packaging (pieces, meters, kg, boxes)',
      'Digital contractor Khata with WhatsApp payment reminders',
      'Serial number & warranty tracking on appliances',
    ],
  },
  {
    id: 'pharmacy',
    name: 'Pharmacies & Wellness',
    icon: Pill,
    tagline: 'Batch Numbers & Regulation',
    summary: 'Track medication batches, expiry alerts, and maintain 100% compliant statutory GST records.',
    keyFeatures: [
      'Batch-wise stock tracking with automated 30-day expiry flags',
      'Accurate HSN codes and GST slab mapping',
      'Fast counter lookup by brand or generic molecule name',
    ],
  },
  {
    id: 'wholesale',
    name: 'Wholesale & B2B Supply',
    icon: Truck,
    tagline: 'Trade Invoices & Tiered Pricing',
    summary: 'Run bulk trade with merchant pricing tiers, credit limit enforcement, and GST e-invoices.',
    keyFeatures: [
      'Distributor vs Retailer vs Walk-in price tiers',
      'Credit limit safeguards that block billing over credit caps',
      'Full B2B tax invoice and delivery challan printing',
    ],
  },
];

export const WhoItsFor: React.FC = () => {
  const [selectedVerticalId, setSelectedVerticalId] = useState('grocery');
  const selectedVertical =
    verticals.find((v) => v.id === selectedVerticalId) || verticals[0];

  return (
    <section
      id="who-its-for"
      className="py-12 sm:py-16 md:py-24 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest text-blue-600 dark:text-sky-400 uppercase select-none mb-2.5 sm:mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 shadow-[0_0_8px_rgba(37,99,235,0.7)]" />
            <span>Tailored for Retail</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold normal-case tracking-normal">
              Industry Fit
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight break-words">
            Built for local retailers and small businesses.
          </h2>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Tailored workflows for your specific inventory, customers, and checkout needs.
          </p>
        </div>

        {/* Vertical Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 mb-6 sm:mb-8">
          {verticals.map((vert) => {
            const Icon = vert.icon;
            const isSelected = vert.id === selectedVerticalId;
            return (
              <button
                key={vert.id}
                type="button"
                onClick={() => setSelectedVerticalId(vert.id)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-sky-400'}`} />
                <span>{vert.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Vertical Detail Card */}
        <div className="max-w-4xl mx-auto p-4 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
          <div className="md:col-span-7 space-y-3 sm:space-y-4">
            <span className="inline-block text-[11px] sm:text-xs font-mono font-bold text-blue-600 dark:text-sky-400 px-2 sm:px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900">
              {selectedVertical.tagline}
            </span>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-950 dark:text-white">
              {selectedVertical.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedVertical.summary}
            </p>
            <div className="space-y-2 sm:space-y-2.5 pt-1 sm:pt-2">
              {selectedVertical.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 text-center space-y-2.5 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-900">
              {React.createElement(selectedVertical.icon, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Configured Out of the Box
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              No custom coding or software development needed. Select your store category during onboarding to get pre-configured presets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
