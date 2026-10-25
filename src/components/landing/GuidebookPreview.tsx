import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Receipt,
  Boxes,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  FileCheck,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  X,
  Printer,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GUIDE_CHAPTERS } from './guide/guideData';

export interface GuidebookPreviewProps {
  onOpenInteractiveGuide?: (step?: number) => void;
  guideProgressStep?: number;
  guideCompleted?: boolean;
}

interface GuideItem {
  id: string;
  category: string;
  readTime: string;
  title: string;
  description: string;
  icon: React.ElementType;
  keyTopics: string[];
  docContent: {
    overview: string;
    steps: { title: string; detail: string }[];
    proTip: string;
  };
}

const guides: GuideItem[] = [
  {
    id: 'getting-started',
    category: 'Getting Started',
    readTime: '5 min read',
    title: 'Store Setup & Counter Hardware',
    description: 'A step-by-step walkthrough on configuring your store details, connecting barcode scanners and thermal printers, and setting staff access roles.',
    icon: BookOpen,
    keyTopics: ['USB & Bluetooth scanner pairing', 'Thermal bill printer configuration', 'Role-based cashier permissions'],
    docContent: {
      overview: 'Ellic connects directly with your existing POS peripherals without proprietary drivers or specialized bridge software.',
      steps: [
        {
          title: '1. Store Profile & Tax Initialization',
          detail: 'Navigate to Settings > Business Profile. Enter your legal trade name, GSTIN (optional for unregistered retailers), and store contact address printed on customer receipts.'
        },
        {
          title: '2. Connect Thermal Receipt Printer',
          detail: 'Connect any standard 58mm or 80mm ESC/POS thermal printer via USB or Bluetooth. Ellic natively detects standard print services.'
        },
        {
          title: '3. Test Barcode Scanner',
          detail: 'Plug in any HID USB or 2.4GHz wireless barcode gun. Scan any standard item barcode into the test field to verify automatic return key emulation.'
        }
      ],
      proTip: 'For faster billing, ensure your barcode scanner is configured to send an Enter [CR] suffix after reading.'
    }
  },
  {
    id: 'billing',
    category: 'Billing',
    readTime: '4 min read',
    title: 'Mastering Rapid POS & Digital Billing',
    description: 'How to ring up purchases in under 10 seconds, generate dynamic UPI QR codes, split tenders between cash and card, and share WhatsApp invoices.',
    icon: Receipt,
    keyTopics: ['Keyboard shortcuts [F2 scan, Enter pay]', 'Split payment reconciliation', 'Paperless WhatsApp PDF receipts'],
    docContent: {
      overview: 'The billing terminal is built for high-throughput counters where cashier speed and zero lag are mission-critical.',
      steps: [
        {
          title: '1. Fast Item Lookups & Barcodes',
          detail: 'Press [F2] or click into the scanner field. Scan item barcodes in rapid succession or type item names/SKUs for instant autocomplete.'
        },
        {
          title: '2. Dynamic QR Payment Generation',
          detail: 'When the customer chooses UPI, Ellic renders a dynamic NPCI-compliant QR code with the exact bill amount locked, eliminating manual typing errors.'
        },
        {
          title: '3. Instant Invoice Dispatch',
          detail: 'Collect customer mobile number during or after billing. Click WhatsApp Bill to dispatch an eco-friendly PDF tax invoice automatically.'
        }
      ],
      proTip: 'Press the spacebar to open the payment drawer immediately once all items are scanned.'
    }
  },
  {
    id: 'inventory',
    category: 'Inventory',
    readTime: '6 min read',
    title: 'Real-Time Stock & Batch Management',
    description: 'How to organize products into categories, manage batch expiry dates, set automatic low-stock reorder thresholds, and generate restock drafts.',
    icon: Boxes,
    keyTopics: ['Batch & expiry date tracking', 'Automated restock threshold alerts', 'Wholesale supplier purchase orders'],
    docContent: {
      overview: 'Eliminate stock-outs and inventory shrinkage with live stock counts that auto-deduct with every counter receipt.',
      steps: [
        {
          title: '1. Catalog Organization & Bundles',
          detail: 'Group items by Department and Category. Define individual units (Pcs, Kg, Box, Pack) with accurate conversion ratios.'
        },
        {
          title: '2. Low-Stock Safety Buffers',
          detail: 'Set minimum safety stock thresholds. When items drop below buffer levels, they automatically surface on your Daily Restock Purchase Sheet.'
        },
        {
          title: '3. Batch Expiry Management',
          detail: 'Assign batch numbers and expiry months during Goods Inward. The system applies First-Expired, First-Out (FEFO) logic at POS.'
        }
      ],
      proTip: 'Schedule automated inventory audits for high-value items twice a month using the built-in Cycle Count tool.'
    }
  },
  {
    id: 'customers',
    category: 'Customers',
    readTime: '4 min read',
    title: 'Customer Khata & Loyalty Retention',
    description: 'How to maintain tamper-proof customer credit books, record partial repayments, reward repeat buyers with loyalty points, and send gentle SMS reminders.',
    icon: Users,
    keyTopics: ['Digital Khata credit balancing', 'Automated WhatsApp payment links', 'Loyalty point earning and redemption'],
    docContent: {
      overview: 'Strengthen customer trust with transparent digital credit ledgers and reward programs that turn first-time shoppers into regulars.',
      steps: [
        {
          title: '1. Opening a Customer Khata Ledger',
          detail: 'Select Credit / Khata at checkout. Assign credit limits per customer and record authorized signatures or PIN confirmations.'
        },
        {
          title: '2. Recording Repayments',
          detail: 'When a customer deposits cash or sends UPI, record the repayment against specific bills or overall outstanding balance with instant receipt dispatch.'
        },
        {
          title: '3. Automated Friendly Reminders',
          detail: 'Send polite WhatsApp payment reminders with one tap, including a breakdown of purchases and a secure UPI deep-link.'
        }
      ],
      proTip: 'Loyalty points can be configured to auto-apply as instant cash discounts once a customer passes 100 points.'
    }
  }
];

export const GuidebookPreview: React.FC<GuidebookPreviewProps> = ({
  onOpenInteractiveGuide,
  guideProgressStep = 0,
  guideCompleted = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGuideModal, setActiveGuideModal] = useState<GuideItem | null>(null);

  const categories = ['All', 'Getting Started', 'Billing', 'Inventory', 'Customers'];

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        guide.title.toLowerCase().includes(query) ||
        guide.description.toLowerCase().includes(query) ||
        guide.keyTopics.some((t) => t.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="guide" className="py-20 md:py-28 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-blue-600 dark:text-sky-400 uppercase select-none mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 shadow-[0_0_8px_rgba(37,99,235,0.7)]" />
              <span>Ellic Guidebook</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-500 dark:text-slate-400 font-semibold normal-case tracking-normal">12 Interactive Chapters</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Learn Ellic, step by step.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              We believe business software should be intuitive. Launch the 12-step interactive platform tour or search topics below to view quick documentation walkthroughs.
            </p>
          </div>

          {onOpenInteractiveGuide && (
            <div className="shrink-0">
              <button
                id="btn-guidebook-start-interactive-tour"
                type="button"
                data-cursor="hover"
                data-magnetic="cta"
                onClick={() =>
                  onOpenInteractiveGuide(
                    guideProgressStep > 0 && !guideCompleted ? guideProgressStep : undefined
                  )
                }
                className="website-btn-glow px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer group"
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {guideCompleted
                    ? 'Review 12-Step Interactive Guide →'
                    : guideProgressStep > 0
                    ? `Resume Interactive Guide (Step ${String(guideProgressStep).padStart(2, '0')} of 12) →`
                    : 'Start the 12-Step Interactive Guide →'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 12-Chapter Interactive Journey Quick-Jump Strip */}
        {onOpenInteractiveGuide && (
          <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-sky-50/70 via-white to-sky-100/40 dark:from-blue-950/25 dark:via-slate-900 dark:to-blue-950/20 border border-sky-200/80 dark:border-sky-800/60 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800 dark:text-sky-300">
                  Interactive First-Time User Guide • 12 Connected Chapters
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Select any chapter to jump directly into its interactive simulation
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {GUIDE_CHAPTERS.map((ch) => {
                const isCurrent = guideProgressStep === ch.stepNumber && !guideCompleted;
                const isDone = guideCompleted || (guideProgressStep > ch.stepNumber);
                return (
                  <button
                    key={ch.stepNumber}
                    type="button"
                    data-cursor="hover"
                    onClick={() => onOpenInteractiveGuide(ch.stepNumber)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-sky-500 shadow-sm'
                        : isDone
                        ? 'bg-sky-50/70 dark:bg-blue-950/30 border-sky-300/70 dark:border-sky-800/60 text-slate-900 dark:text-white hover:border-blue-500'
                        : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          isCurrent
                            ? 'text-sky-100'
                            : 'text-blue-600 dark:text-sky-400'
                        }`}
                      >
                        STEP {ch.code}
                      </span>
                      {isDone && !isCurrent && (
                        <CheckCircle2 className="w-3 h-3 text-sky-500 shrink-0" />
                      )}
                    </div>
                    <div
                      className={`text-xs font-bold leading-snug line-clamp-1 ${
                        isCurrent
                          ? 'text-white'
                          : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400'
                      }`}
                    >
                      {ch.shortTitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                data-cursor="hover"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              data-cursor="hover"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides or topics..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-sky-500 transition-colors hover:border-blue-500/40"
            />
          </div>
        </div>

        {/* Guidebook Cards Grid */}
        {filteredGuides.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">No guides matching your search</div>
            <div className="text-xs text-slate-500 mt-1">Try searching for "POS", "barcode", "tax", or reset category filters.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <div
                  key={guide.id}
                  id={`guide-card-${guide.id}`}
                  data-cursor="card"
                  onClick={() => setActiveGuideModal(guide)}
                  className="website-card-hover group p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top Bar: Icon + Read Time */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        data-icon-box
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-slate-800 group-hover:text-sky-400 transition-all duration-200"
                      >
                        <Icon className="w-4 h-4 transition-transform duration-200" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{guide.readTime}</span>
                      </span>
                    </div>

                    {/* Category & Title */}
                    <div className="text-[11px] font-semibold text-blue-700 dark:text-sky-400 uppercase tracking-wider mb-1">
                      {guide.category}
                    </div>
                    <h3 className="text-base font-bold text-slate-950 dark:text-white mb-2.5 group-hover:text-blue-700 dark:group-hover:text-sky-400 transition-colors">
                      {guide.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                      {guide.description}
                    </p>
                  </div>

                  {/* Key Topics Covered */}
                  <div data-card-support className="transition-transform duration-200">
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 mb-4">
                      <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        Key Topics Covered:
                      </div>
                      {guide.keyTopics.map((topic, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <FileCheck className="w-3 h-3 text-blue-600 dark:text-sky-400 shrink-0" />
                          <span className="line-clamp-1">{topic}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-xs font-semibold text-blue-700 dark:text-sky-400 flex items-center gap-1 group-hover:underline">
                      <span>Read full documentation</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Illustrated Callout Card */}
        <div className="mt-10 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Looking for printable staff onboarding cheat-sheets?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Download one-page keyboard shortcut templates and cashier daily opening/closing checklists.
              </p>
            </div>
          </div>
          <button
            type="button"
            data-cursor="hover"
            onClick={() => {
              if (onOpenInteractiveGuide) {
                onOpenInteractiveGuide();
              } else {
                setActiveGuideModal(guides[0]);
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 shrink-0 cursor-pointer"
          >
            <span>Explore Onboarding Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Guide Preview Modal (Requirement #9) */}
      <AnimatePresence>
        {activeGuideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setActiveGuideModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-sky-400 bg-sky-50 dark:bg-blue-950/80 px-2 py-0.5 rounded">
                      {activeGuideModal.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activeGuideModal.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                    {activeGuideModal.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGuideModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 dark:text-slate-300">
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {activeGuideModal.docContent.overview}
                </p>

                <div className="space-y-4">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-400">Implementation Steps</div>
                  {activeGuideModal.docContent.steps.map((step, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {step.title}
                      </div>
                      <div className="leading-relaxed">
                        {step.detail}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pro Tip Box */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pro Tip: </span>
                    <span>{activeGuideModal.docContent.proTip}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-xs text-slate-500">Ellic Official Documentation</span>
                <button
                  type="button"
                  onClick={() => setActiveGuideModal(null)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Walkthrough
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
