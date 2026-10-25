import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Code,
  FileText,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Database,
  Eye,
  Layers,
  X,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface AiMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiMetadataModal: React.FC<AiMetadataModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'llmstxt' | 'api'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const schemaJsonString = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://ellic.ai.studio/#organization",
          "name": "Ellic",
          "url": "https://ellic.ai.studio/",
          "logo": "https://ellic.ai.studio/logo.svg",
          "image": "https://ellic.ai.studio/og-image.png",
          "description": "A modern business management platform for local retailers and small businesses."
        },
        {
          "@type": "WebSite",
          "@id": "https://ellic.ai.studio/#website",
          "url": "https://ellic.ai.studio/",
          "name": "Ellic",
          "description": "Business management, without the complexity. Ellic brings billing, inventory, customers, payments, transactions, and business insights into one connected platform for local retailers and small businesses.",
          "publisher": {
            "@id": "https://ellic.ai.studio/#organization"
          }
        },
        {
          "@type": "SoftwareApplication",
          "@id": "https://ellic.ai.studio/#software",
          "name": "Ellic",
          "url": "https://ellic.ai.studio/",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "Business management, without the complexity. A modern business management platform for local retailers and small businesses (excluding restaurants) that unifies billing, inventory, customers, payments, transactions, and business insights.",
          "featureList": [
            "Billing and GST invoice generation",
            "Inventory and stock management",
            "Customer ledger (Khata) and relationship management",
            "Payments and multi-tender recording",
            "Transaction history and day-end tracking",
            "Business insights and sales analytics"
          ],
          "publisher": {
            "@id": "https://ellic.ai.studio/#organization"
          }
        }
      ]
    },
    null,
    2
  );

  const llmsTxtContent = `# Ellic

> Business management, without the complexity. Ellic brings billing, inventory, customers, payments, transactions, and business insights into one connected platform for local retailers and small businesses.

## Project Summary
Ellic is a modern web-based business management platform designed for local retailers, supermarkets, and wholesalers in India (excluding restaurants).

## Core Capabilities & Modules
- Billing & GST Invoice Generation (Itemized CGST/SGST/IGST breakdowns, printable/downloadable invoices)
- Inventory & Stock Management (SKUs, barcodes, automatic stock updates, low-stock threshold alerts)
- Customer Ledger (Khata) & Relationship Management (Customer profiles, credit tracking, WhatsApp reminders)
- Payments & Multi-Tender Recording (Cash, Card, Khata credit, direct merchant UPI QR codes)
- Transaction History & Day-End Tracking (Searchable invoices, payment filtering, day-end sales summaries)
- Business Insights & Sales Analytics (Revenue trends, product performance, CSV/PDF exports)`;

  return (
    <div
      id="ai-metadata-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      <div
        id="ai-metadata-modal-card"
        className="glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="ai-modal-title" className="text-base font-bold tracking-tight">
                  AI & Machine Discoverability
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 dark:bg-blue-950/70 text-blue-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  <CheckCircle2 className="w-3 h-3" /> Fully Configured
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live metadata, Schema.org JSON-LD, llms.txt standard, and open API data
              </p>
            </div>
          </div>
          <button
            id="ai-modal-close-button"
            type="button"
            onClick={onClose}
            aria-label="Close AI metadata modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-1 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium">
          <button
            id="ai-tab-overview"
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-sky-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Overview & Readiness
          </button>
          <button
            id="ai-tab-schema"
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-sky-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Schema.org (JSON-LD)
          </button>
          <button
            id="ai-tab-llmstxt"
            type="button"
            onClick={() => setActiveTab('llmstxt')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'llmstxt'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-sky-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            llms.txt Standard
          </button>
          <button
            id="ai-tab-api"
            type="button"
            onClick={() => setActiveTab('api')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-sky-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Live Machine API (/api/about)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-blue-600 dark:text-sky-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      Production Metadata & OpenGraph
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Verified title, meta description, canonical URL, OpenGraph, and Twitter/X card metadata configured.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-blue-600 dark:text-sky-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      Search & Crawler Indexing Rules
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Public website and legal routes allowed in <code className="font-mono">robots.txt</code> and <code className="font-mono">sitemap.xml</code>; internal app routes excluded.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-blue-600 dark:text-sky-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      llms.txt & llms-full.txt Ready
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Standardized Markdown specification describing modules, architecture, and public routes.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-blue-600 dark:text-sky-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      Live JSON API Endpoint
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <code className="text-blue-600 dark:text-sky-400">/api/about</code> returns structured application and route metadata.
                    </p>
                  </div>
                </div>
              </div>

              {/* What AIs See Summary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Live Data Seen by AI Models & Search Engines
                  </span>
                  <span className="text-xs text-blue-600 dark:text-sky-400 font-medium flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Verified Production Spec
                  </span>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-medium text-slate-500 dark:text-slate-400">App Name:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Ellic</span>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Canonical Origin:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-100">https://ellic.ai.studio/</span>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Primary Category:</span>
                    <span className="text-slate-900 dark:text-slate-100">BusinessApplication (Web)</span>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Core Capabilities:</span>
                    <span className="text-slate-900 dark:text-slate-100 text-right">
                      Billing, Inventory, Customers (Khata), Payments, Transactions, Insights
                    </span>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Storage Architecture:</span>
                    <span className="text-slate-900 dark:text-slate-100 text-right">
                      Browser local storage cache + Supabase synchronization
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Embedded directly in <code className="text-slate-800 dark:text-slate-200">index.html</code> for Google, Bing, Perplexity, and AI Overviews.
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(schemaJsonString, 'schema')}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'schema' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'schema' ? 'Copied' : 'Copy JSON-LD'}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-sky-400 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
                {schemaJsonString}
              </pre>
            </div>
          )}

          {activeTab === 'llmstxt' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Served publicly at <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-sky-400 underline inline-flex items-center gap-0.5">/llms.txt <ExternalLink className="w-3 h-3" /></a> for LLM agents.
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(llmsTxtContent, 'llms')}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'llms' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'llms' ? 'Copied' : 'Copy llms.txt'}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap">
                {llmsTxtContent}
              </pre>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Machine-readable REST endpoint responding to AI agents at <code className="text-blue-600 dark:text-sky-400">GET /api/about</code>.
                </p>
                <a
                  href="/api/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Live Endpoint
                </a>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Live Endpoint Structure:</div>
                <div className="text-slate-600 dark:text-slate-400">
                  Returns: <span className="font-mono text-blue-600 dark:text-sky-400">schema_version</span>, <span className="font-mono text-blue-600 dark:text-sky-400">name_for_model</span>, <span className="font-mono text-blue-600 dark:text-sky-400">description_for_model</span>, <span className="font-mono text-blue-600 dark:text-sky-400">features</span>, <span className="font-mono text-blue-600 dark:text-sky-400">specifications</span>, and documentation links.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>Structured Data adheres to Schema.org, OpenGraph & llmstxt.org standards</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
