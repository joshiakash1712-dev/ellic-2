import React, { useState } from 'react';
import {
  ShieldCheck,
  Scale,
  FileText,
  Cookie,
  UserCheck,
  CheckCircle2,
  ArrowUpRight,
  Info,
  HelpCircle,
  Lock,
  HardDrive,
  Globe,
  Server,
  Users,
  KeyRound,
  AlertTriangle,
  History,
} from 'lucide-react';
import {
  LEGAL_CONFIG,
  COMPLIANCE_APPLICABILITY_CONFIG,
  LegalPageSlug,
} from '../../config/legal.config';

export interface SecurityComplianceSectionProps {
  onOpenLegalPage?: (slug: LegalPageSlug) => void;
  onOpenContact?: () => void;
}

type PostureCategoryId =
  | 'all'
  | 'formal-certifications'
  | 'regulatory-frameworks'
  | 'internal-practices'
  | 'general-commitments';

interface PostureCategoryMeta {
  id: Exclude<PostureCategoryId, 'all'>;
  number: string;
  title: string;
  shortLabel: string;
  description: string;
}

interface TrustPostureItem {
  id: string;
  categoryId: Exclude<PostureCategoryId, 'all'>;
  categoryLabel: string;
  name: string;
  scopeMeta: string;
  explanation: string;
  referenceLabel: string;
  referenceDetail: string;
  legalSlug: LegalPageSlug;
  icon: React.ElementType;
  isHonestDisclosure?: boolean;
}

const POSTURE_CATEGORIES: PostureCategoryMeta[] = [
  {
    id: 'formal-certifications',
    number: '01',
    title: 'Formal Certifications',
    shortLabel: 'Formal Certifications',
    description:
      'External third-party security audits, accreditations, or government certifications.',
  },
  {
    id: 'regulatory-frameworks',
    number: '02',
    title: 'Regulatory & Privacy Frameworks',
    shortLabel: 'Regulatory Frameworks',
    description:
      'Indian statutory privacy, grievance, and commercial invoicing frameworks our workflows are structured around.',
  },
  {
    id: 'internal-practices',
    number: '03',
    title: 'Internal Security Practices',
    shortLabel: 'Internal Practices',
    description:
      'Day-to-day product practices for responsible data handling, payment routing, and consent transparency.',
  },
  {
    id: 'general-commitments',
    number: '04',
    title: 'General Security Commitments',
    shortLabel: 'Security Commitments',
    description:
      'Core promises to small-business owners regarding data ownership, portability, and plain-language policies.',
  },
];

const TRUST_POSTURE_ITEMS: TrustPostureItem[] = [
  // 1. Formal Certifications
  {
    id: 'no-formal-certifications',
    categoryId: 'formal-certifications',
    categoryLabel: 'Formal Certifications',
    name: 'Third-Party Security Certifications & External Audits',
    scopeMeta: 'Status: Not Claimed · No External Audit Badges',
    explanation:
      'Ellic does not currently hold or claim formal third-party certifications such as SOC 2, ISO/IEC 27001, ISO/IEC 27701, PCI DSS, HIPAA, or GDPR certification, nor do we claim government accreditation. Rather than displaying unverified badges, we openly publish the exact data-handling practices and privacy tools available in the product today.',
    referenceLabel: 'View Security & Data Protection Notice',
    referenceDetail: 'Published in Legal & Trust Center (/security)',
    legalSlug: 'security',
    icon: Info,
    isHonestDisclosure: true,
  },

  // 2. Regulatory & Privacy Frameworks
  {
    id: 'dpdpa-2023-framework',
    categoryId: 'regulatory-frameworks',
    categoryLabel: 'Regulatory & Privacy Frameworks',
    name: 'India DPDPA, 2023: Data Principal Rights & Notice',
    scopeMeta: `India Statutory Privacy Alignment · Policy v${LEGAL_CONFIG.privacyPolicyVersion}`,
    explanation:
      'Our privacy disclosures and self-service tools are built around India’s Digital Personal Data Protection Act, 2023 principles. Store owners, staff, and visitors can review clear data collection notices and submit tracked requests for data access summaries, correction, erasure, consent withdrawal, or nominee registration.',
    referenceLabel: 'Open Data & Privacy Rights Center',
    referenceDetail: 'Self-service request form & JSON log export (/data-privacy-rights)',
    legalSlug: 'data-privacy-rights',
    icon: UserCheck,
  },
  {
    id: 'it-act-grievance-framework',
    categoryId: 'regulatory-frameworks',
    categoryLabel: 'Regulatory & Privacy Frameworks',
    name: 'Information Technology Act, 2000: Grievance Redressal',
    scopeMeta: `${COMPLIANCE_APPLICABILITY_CONFIG.timelines.grievanceAcknowledgeHours}h Acknowledgment · ${COMPLIANCE_APPLICABILITY_CONFIG.timelines.grievanceResolutionDays}-Day Resolution Target`,
    explanation:
      'Structured in accordance with Indian Information Technology rules, Ellic provides a dedicated Grievance Redressal mechanism where merchants and users can submit formal privacy, billing, or account complaints and receive a timestamped ticket ID.',
    referenceLabel: 'View Grievance Redressal Mechanism',
    referenceDetail: 'Published officer particulars & ticket form (/grievance-redressal)',
    legalSlug: 'grievance-redressal',
    icon: Scale,
  },
  {
    id: 'gst-invoicing-scope',
    categoryId: 'regulatory-frameworks',
    categoryLabel: 'Regulatory & Privacy Frameworks',
    name: 'GST Invoice & Tax Schedule Formatting Scope',
    scopeMeta: `Merchant-Configured Tax Slabs · Terms v${LEGAL_CONFIG.termsVersion}`,
    explanation:
      'Ellic generates itemized CGST, SGST, and IGST breakdowns and downloadable GSTR-1/GSTR-3B summary sheets based on the product prices, HSN codes, and tax rates you enter. Ellic is business software (not a Chartered Accountant or GST Suvidha Provider, GSP), so merchants remain responsible for verifying tax rates and filing official returns.',
    referenceLabel: 'Read Tax & Invoicing Disclaimer',
    referenceDetail: 'Terms of Service, Section 2 (/terms-of-service)',
    legalSlug: 'terms-of-service',
    icon: FileText,
  },

  // 3. Internal Security Practices
  {
    id: 'direct-upi-settlement',
    categoryId: 'internal-practices',
    categoryLabel: 'Internal Security Practices',
    name: 'Direct Merchant UPI QR Settlement (Zero Fund Custody)',
    scopeMeta: 'Direct Customer-to-Bank UPI · No Intermediary Holding',
    explanation:
      'Dynamic UPI QR codes generated at the billing counter encode standard NPCI UPI intent links using your store’s own configured UPI ID (VPA). Customer payments settle directly between the customer’s UPI app and your bank account; Ellic does not hold, pool, or route your sales funds.',
    referenceLabel: 'Read Electronic Payments Scope',
    referenceDetail: 'Terms of Service, Section 3 (/terms-of-service)',
    legalSlug: 'terms-of-service',
    icon: ShieldCheck,
  },
  {
    id: 'cookie-storage-minimisation',
    categoryId: 'internal-practices',
    categoryLabel: 'Internal Security Practices',
    name: 'Zero Third-Party Ad Trackers & Granular Storage Controls',
    scopeMeta: 'Strictly Necessary POS Storage · User-Toggled Preferences',
    explanation:
      'We do not embed third-party behavioral advertising trackers. Browser cookies and local storage are used strictly for workspace sign-in and offline counter continuity, with transparent controls allowing you to enable or disable optional functional and diagnostic preferences at any time.',
    referenceLabel: 'Manage Cookie & Storage Settings',
    referenceDetail: 'Interactive preference controls (/cookie-policy)',
    legalSlug: 'cookie-policy',
    icon: Cookie,
  },
  {
    id: 'consent-audit-logging',
    categoryId: 'internal-practices',
    categoryLabel: 'Internal Security Practices',
    name: 'Verifiable Consent & Privacy Request Audit Trail',
    scopeMeta: 'Timestamped Local Records · One-Click JSON Export',
    explanation:
      'When you record cookie choices, submit an onboarding or support inquiry, or file a privacy request, Ellic logs a timestamped consent and request record with the active policy version so you can inspect or export your privacy history whenever needed.',
    referenceLabel: 'Inspect or Export Consent Log',
    referenceDetail: 'Data & Privacy Rights Center (/data-privacy-rights)',
    legalSlug: 'data-privacy-rights',
    icon: CheckCircle2,
  },

  // 4. General Security Commitments
  {
    id: 'merchant-data-ownership',
    categoryId: 'general-commitments',
    categoryLabel: 'General Security Commitments',
    name: 'Merchant Data Ownership & No Data Monetization',
    scopeMeta: '100% Store-Owned Records · Never Sold or Rented',
    explanation:
      'Your store catalog, supplier pricing margins, invoices, and customer Khata ledgers belong to your business. We never sell, rent, or monetize your business records or your customers’ contact details to third-party advertisers or data brokers.',
    referenceLabel: 'Review Core Privacy Commitment',
    referenceDetail: `Privacy Policy v${LEGAL_CONFIG.privacyPolicyVersion}, Section 1 (/privacy-policy)`,
    legalSlug: 'privacy-policy',
    icon: ShieldCheck,
  },
  {
    id: 'data-portability-commitment',
    categoryId: 'general-commitments',
    categoryLabel: 'General Security Commitments',
    name: 'Unrestricted Data Export & Post-Cancellation Window',
    scopeMeta: `CSV & PDF Export Anytime · ${COMPLIANCE_APPLICABILITY_CONFIG.timelines.dataExportRetentionDaysAfterCancellation}-Day Export Retention`,
    explanation:
      'Small-business owners should never be locked into their software. You can export your inventory catalog, customer Khata balances, and billing summaries in standard CSV or PDF formats at any time, including a 30-day export window following subscription cancellation.',
    referenceLabel: 'View Cancellation & Export Terms',
    referenceDetail: 'Cancellation & Refund Policy, Section 2 (/cancellation-refund-policy)',
    legalSlug: 'cancellation-refund-policy',
    icon: FileText,
  },
];

export const SecurityComplianceSection: React.FC<SecurityComplianceSectionProps> = ({
  onOpenLegalPage,
  onOpenContact,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PostureCategoryId>('all');

  const visibleCategories =
    selectedCategory === 'all'
      ? POSTURE_CATEGORIES
      : POSTURE_CATEGORIES.filter((cat) => cat.id === selectedCategory);

  return (
    <section
      id="security-compliance"
      aria-labelledby="security-compliance-heading"
      className="py-20 md:py-28 bg-slate-50/70 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Section Heading Block (first child for GSAP ScrollTrigger compatibility) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lg:mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-blue-600 dark:text-sky-400 uppercase select-none mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 shadow-[0_0_8px_rgba(37,99,235,0.7)]" />
              <span>Security &amp; Compliance</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-slate-500 dark:text-slate-400 font-semibold normal-case tracking-normal">Enterprise Protection</span>
            </div>
            <h2
              id="security-compliance-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight"
            >
              We’re building {LEGAL_CONFIG.brandName} with security and responsible data handling as core principles.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Small-business owners deserve clear, honest answers about how their store records are handled, without confusing legal jargon or unverified badges. Below is our straightforward breakdown separating formal certifications, Indian regulatory frameworks, internal product practices, and core merchant commitments.
            </p>
          </div>

          {onOpenLegalPage && (
            <div className="shrink-0">
              <button
                type="button"
                data-cursor="hover"
                onClick={() => onOpenLegalPage('security')}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all inline-flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Open Legal, Privacy &amp; Trust Center</span>
                <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              </button>
            </div>
          )}
        </div>

        {/* 2. Interactive Category Filter Bar (Segmented Controls) */}
        <div
          role="group"
          aria-label="Filter security and compliance posture by category"
          className="mb-10 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            data-cursor="hover"
            aria-pressed={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white dark:bg-slate-950 text-blue-700 dark:text-sky-400 shadow-xs border border-sky-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border border-transparent'
            }`}
          >
            All Categories (4)
          </button>
          {POSTURE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                data-cursor="hover"
                aria-pressed={isActive}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-white dark:bg-slate-950 text-blue-700 dark:text-sky-400 shadow-xs border border-sky-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border border-transparent'
                }`}
              >
                <span className="font-mono text-[11px] text-blue-600 dark:text-sky-400">
                  {cat.number}
                </span>
                <span>{cat.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Categorized Trust & Compliance Posture Groups */}
        <div className="space-y-10">
          {visibleCategories.map((category) => {
            const items = TRUST_POSTURE_ITEMS.filter(
              (item) => item.categoryId === category.id
            );

            return (
              <div
                key={category.id}
                className="space-y-4"
                aria-labelledby={`posture-cat-${category.id}`}
              >
                {/* Category Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-sky-400">
                      {category.number} /
                    </span>
                    <h3
                      id={`posture-cat-${category.id}`}
                      className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white tracking-tight"
                    >
                      {category.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {category.description}
                  </p>
                </div>

                {/* Category Cards Grid */}
                <div
                  className={
                    items.length === 1
                      ? 'grid grid-cols-1 gap-5'
                      : items.length === 2
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-5'
                      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                  }
                >
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <article
                        key={item.id}
                        className={`website-card-hover rounded-2xl p-5 sm:p-6 border flex flex-col justify-between gap-5 transition-all ${
                          item.isHonestDisclosure
                            ? 'bg-white dark:bg-slate-900/95 border-slate-200/90 dark:border-slate-800 hover:border-blue-500/40'
                            : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Quiet Unboxed Metadata Kicker & Icon */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                              <span className="text-blue-700 dark:text-sky-400 font-semibold">
                                {item.categoryLabel}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{item.scopeMeta}</span>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Primary Title */}
                          <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                            {item.name}
                          </h4>

                          {/* Plain-Language Explanation */}
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>

                        {/* Verification / Reference Footer */}
                        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            Ref: {item.referenceDetail}
                          </span>
                          {onOpenLegalPage && (
                            <button
                              type="button"
                              data-cursor="hover"
                              onClick={() => onOpenLegalPage(item.legalSlug)}
                              className="min-h-[44px] sm:min-h-0 py-1.5 text-xs font-semibold text-blue-700 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 inline-flex items-center gap-1 text-left cursor-pointer shrink-0 group"
                            >
                              <span>{item.referenceLabel}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Dedicated Data Encryption Subsection (Checklist Item #2) */}
        <div
          id="data-encryption"
          aria-labelledby="data-encryption-heading"
          className="mt-14 pt-12 border-t border-slate-200/80 dark:border-slate-800/80 space-y-6"
        >
          {/* Subsection Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                <span className="text-blue-700 dark:text-sky-400 font-bold uppercase tracking-wider">
                  Data Protection Architecture
                </span>
                <span aria-hidden="true">·</span>
                <span>In Transit, At Rest &amp; Local Browser Storage</span>
              </div>
              <h3
                id="data-encryption-heading"
                className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight"
              >
                Data Encryption
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Your information is protected both while it travels to {LEGAL_CONFIG.brandName} and while it is stored by the cloud services that power the platform. Here is a plain-language breakdown of how encryption works across network connections, cloud storage, and your local browser.
              </p>
            </div>

            {onOpenLegalPage && (
              <div className="shrink-0">
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => onOpenLegalPage('security')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Review Security Practices</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                </button>
              </div>
            )}
          </div>

          {/* Two Primary Cards: Encryption in Transit & Encryption at Rest */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Encryption in transit */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      01 · Network Transport
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>HTTPS / TLS Connections</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    Encryption in transit
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Data in transit is protected using encrypted HTTPS/TLS connections when information moves between your device and {LEGAL_CONFIG.brandName} services. This applies whenever your browser communicates with our web application, backend API endpoints, or Supabase cloud services.
                  </p>
                </div>

                {/* Plain-language scope list */}
                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    Where data in transit is protected:
                  </div>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Browser to {LEGAL_CONFIG.brandName}:</strong> Page loads and requests between your browser and our hosted application server travel over HTTPS/TLS in production.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Frontend to Backend &amp; Auth:</strong> Sign-in sessions and authenticated API calls transmit authentication session tokens over encrypted HTTPS connections.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Application to Cloud Database:</strong> Live synchronization of store catalogs, GST bills, and Khata records with Supabase occurs over encrypted HTTPS/TLS channels.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* What this means for non-technical business owners */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider font-mono">
                  What this means for your store
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  When you sign in, generate bills, or sync your catalog over shop Wi-Fi or mobile data, HTTPS/TLS helps prevent others on the network from reading your login details or billing data as it travels across the internet.
                </p>
              </div>
            </article>

            {/* Card 2: Encryption at rest */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      02 · Cloud Infrastructure Storage
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Provider-Managed At Rest</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    Encryption at rest
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Cloud records stored by {LEGAL_CONFIG.brandName} (including your store profile, product inventory, invoices, customer Khata ledgers, and user accounts) are hosted in Supabase (Postgres database and Authentication), where stored data is encrypted at rest by default at the cloud provider level.
                  </p>
                </div>

                {/* Plain-language scope list */}
                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    How stored cloud records are handled:
                  </div>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Provider-Level Encryption at Rest:</strong> Supabase automatically encrypts stored database records and authentication records on its underlying cloud storage infrastructure.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">No Separate Custom App-Layer Encryption:</strong> {LEGAL_CONFIG.brandName} relies on Google Cloud’s infrastructure encryption at rest rather than applying a separate custom or end-to-end encryption layer inside the application.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Account &amp; Role Verification:</strong> When cloud records are read by the application for authorized store owners or staff, the cloud provider decrypts them for delivery over HTTPS/TLS.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* What this means for non-technical business owners */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider font-mono">
                  What this means for your store
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Once your store’s bills, inventory, and customer balances sync to the cloud, they are protected on disk by Google Cloud’s storage infrastructure, while remaining accessible to your authorized account whenever you sign in.
                </p>
              </div>
            </article>
          </div>

          {/* Honest Distinction: Local Browser Storage (Offline POS Cache & Preferences) */}
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      03 · Client-Side Browser Storage Disclosure
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Offline Counter Cache &amp; Workspace Preferences</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                    How Local Browser Storage Differs from Cloud Storage
                  </h4>
                </div>
              </div>

              {onOpenLegalPage && (
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => onOpenLegalPage('cookie-policy')}
                  className="min-h-[44px] sm:min-h-0 py-1.5 text-xs font-semibold text-blue-700 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 inline-flex items-center gap-1 text-left cursor-pointer shrink-0 group"
                >
                  <span>View Cookie &amp; Local Storage Policy</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Because {LEGAL_CONFIG.brandName} is built to keep billing during internet drops, the web application stores active store catalog data, unsynchronized offline counter transactions, and UI preferences (such as dark/light theme and cookie choices) in your browser’s local storage. Unlike cloud records or HTTPS network traffic, <strong className="text-slate-900 dark:text-white">data cached locally in the browser is not encrypted by the application itself</strong>; its protection on your computer or tablet depends on your device login password, operating-system security, and signing out when using shared counter terminals.
            </p>

            {/* 3-Column Summary Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  1. Moving Over the Internet
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Protected in transit by encrypted <strong className="text-slate-800 dark:text-slate-200">HTTPS/TLS</strong> connections between your browser, {LEGAL_CONFIG.brandName} servers, and Supabase cloud services.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  2. Stored in the Cloud
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Protected at rest by <strong className="text-slate-800 dark:text-slate-200">Supabase provider-level encryption</strong> once synchronized to the cloud database.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  3. Stored Locally in Browser
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Stored unencrypted in browser local storage for offline billing continuity and preferences; protect shared shop devices with a screen lock and sign out after shifts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Dedicated Data Residency Subsection (Checklist Item #3) */}
        <div
          id="data-residency"
          aria-labelledby="data-residency-heading"
          className="mt-14 pt-12 border-t border-slate-200/80 dark:border-slate-800/80 space-y-6"
        >
          {/* Subsection Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                <span className="text-blue-700 dark:text-sky-400 font-bold uppercase tracking-wider">
                  Storage, Processing &amp; Regional Scope
                </span>
                <span aria-hidden="true">·</span>
                <span>Google Cloud Infrastructure &amp; Local Device Cache</span>
              </div>
              <h3
                id="data-residency-heading"
                className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight"
              >
                Data Residency
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Where your business and customer information is stored and processed (and whether regional data location options are available), explained in plain language without unverified geographic claims.
              </p>
            </div>

            {onOpenLegalPage && (
              <div className="shrink-0">
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => onOpenLegalPage('privacy-policy')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Read Full Privacy Policy</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                </button>
              </div>
            )}
          </div>

          {/* Two Primary Cards: Where Data Is Stored & Where Data Is Processed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Where customer data is stored */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      01 · Data Storage Locations
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Supabase Database, Supabase Auth &amp; Local Browser</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <HardDrive className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    Where customer and business data is stored
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {LEGAL_CONFIG.brandName} stores active merchant workspace data across Supabase cloud services and on the local device you use at your billing counter. We do not use a separate cloud object-storage bucket for application records.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    Primary storage systems:
                  </div>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Supabase Postgres Database (Structured Store Records):</strong> Store profiles, product catalogs, GST invoices, customer Khata balances, supplier orders, and staff role records are stored in Supabase within the platform’s configured cloud project. The exact database region is governed by the platform’s cloud project configuration and is not verified in the application codebase as an India-only region.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Supabase Authentication (Account Identity):</strong> User login credentials (email/password, Google Sign-In identifiers, and phone authentication records) are managed by Supabase Authentication on Supabase’s cloud identity infrastructure.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Your Local Device &amp; Browser Storage:</strong> Active POS catalog cache, unsynchronized offline counter bills, UI preferences, and any CSV, PDF, or JSON exports you download are stored directly on your own shop computer, tablet, or phone in the physical location where you operate your device.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider font-mono">
                  Honest geographic note
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Although {LEGAL_CONFIG.brandName} is built specifically for Indian retail businesses and GST workflows, we do not claim that cloud-stored records reside exclusively inside India or within a single country.
                </p>
              </div>
            </article>

            {/* Card 2: Where data is processed */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      02 · Data Processing Locations
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Browser POS, Application Server &amp; External APIs</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    Where customer and business data is processed
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Day-to-day billing and reporting happen in your local browser and across our hosted application server and Google Cloud services, with specific optional features invoking external APIs only when you use them.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    How processing is divided:
                  </div>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">In Your Local Browser (Client-Side):</strong> Barcode cart calculations, GST tax splits, dynamic UPI QR code generation (standard NPCI intent links), and PDF/CSV report exports run directly in your browser on your counter device.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Application Server &amp; Cloud Sync:</strong> Authenticated API routes (such as workspace purge, admin team management, and subscription verification) run on our hosted Node.js / Express backend server deployed on Google Cloud infrastructure, communicating with Supabase services.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Feature-Specific External Services:</strong> When you message the website support assistant, your chat prompt is answered by our built-in support knowledge base on our own server and is not sent to a third-party AI service. When paid SaaS subscription checkout is active, subscription order metadata is processed via Razorpay’s payment API. Sharing a bill or reminder on WhatsApp opens a direct link in your own WhatsApp app.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider font-mono">
                  What this means for your store
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Routine counter billing, UPI QR generation, and CSV/PDF exports happen locally on your device and sync to Supabase; your store’s product catalog and customer Khata ledgers are never sent to the website support chatbot or third-party ad networks.
                </p>
              </div>
            </article>
          </div>

          {/* Card 3: Regional Data Residency Options & Honest Availability Disclosure */}
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      03 · Regional Residency Options
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Status: No Customer-Selectable Region Options</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                    Regional Options &amp; Cross-Region Processing Transparency
                  </h4>
                </div>
              </div>

              {onOpenLegalPage && (
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => onOpenLegalPage('security')}
                  className="min-h-[44px] sm:min-h-0 py-1.5 text-xs font-semibold text-blue-700 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 inline-flex items-center gap-1 text-left cursor-pointer shrink-0 group"
                >
                  <span>View Security &amp; Infrastructure Notice</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">{LEGAL_CONFIG.brandName} does not currently offer customer-selectable regional data residency options</strong> (such as choosing between India-only, EU-only, or US-only cloud storage per merchant account). All workspaces operate on the platform’s default Supabase cloud infrastructure deployment, which may store or process data across Google-operated cloud regions outside your immediate state or country.
            </p>

            {/* 3-Column Plain-Language Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  1. Cloud Database &amp; Auth
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Hosted on <strong className="text-slate-800 dark:text-slate-200">Supabase</strong> infrastructure using the platform’s project configuration rather than a custom per-store country setting.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  2. Regional Selection Availability
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">Not currently configurable per merchant.</strong> We do not claim single-country or India-exclusive data residency in the current release.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  3. Local Copies &amp; Exports
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Offline POS browser cache and any <strong className="text-slate-800 dark:text-slate-200">CSV, PDF, or JSON exports</strong> you download stay directly on your own store computer or mobile device.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Dedicated Access Controls Subsection (Checklist Item #4) */}
        <div
          id="access-controls"
          aria-labelledby="access-controls-heading"
          className="mt-14 pt-12 border-t border-slate-200/80 dark:border-slate-800/80 space-y-6"
        >
          {/* Subsection Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                <span className="text-blue-700 dark:text-sky-400 font-bold uppercase tracking-wider">
                  Identity, Role Hierarchy &amp; Store Isolation
                </span>
                <span aria-hidden="true">·</span>
                <span>4-Level Role Model &amp; Database Security Policies</span>
              </div>
              <h3
                id="access-controls-heading"
                className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight"
              >
                Access Controls
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Access to business and customer data in {LEGAL_CONFIG.brandName} is governed by authenticated user accounts and role-based permissions. Every user is assigned a specific role, and access to store records is restricted by both application checks and cloud database security rules.
              </p>
            </div>

            {onOpenLegalPage && (
              <div className="shrink-0">
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => onOpenLegalPage('security')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Review Security &amp; RBAC Policy</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                </button>
              </div>
            )}
          </div>

          {/* Two Primary Cards: Customer / Business Account Access & Internal Platform Access */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Customer & Store Role Hierarchy */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      01 · Merchant &amp; Staff Access
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Client Owner vs. Assigned Store Crew</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    How store owners and crew members access your workspace
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Every store workspace separates full business-owner authority from day-to-day counter operations so cashiers and floor staff can bill customers without accessing owner-only settings or other stores.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    Store-level role separation:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Level 3: Client / Business Owner:</strong> Manages their own store profile, full product pricing and margins, all store invoices, customer Khata ledgers, supplier profiles, staff roster, and audit logs. Database policies and backend checks block one Client from reading or modifying another Client’s store data.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Level 4: Store Crew / Cashier:</strong> Restricted to their assigned store(s). Crew members can create POS bills, view only the invoices they generated themselves (<code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">cashierId == request.auth.uid</code>), add new products or log restock quantities, and handle customer checkout.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Enforced Crew Restrictions:</strong> Database security rules and server routes prevent Crew accounts from applying bill discounts, changing existing product selling prices, deleting products or invoices, managing suppliers or staff roles, viewing store audit logs, or modifying subscription billing.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider font-mono">
                  What this means for your store
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  You can hand a counter terminal to a cashier to scan items and print GST bills knowing they cannot alter your existing selling prices, grant unauthorized discounts, view other cashiers’ bills, or delete store records.
                </p>
              </div>
            </article>

            {/* Card 2: Internal Company & Platform Admin Access */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      02 · Internal Company Access
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Super Admin &amp; Ellic Admin Conditions</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    Who within {LEGAL_CONFIG.brandName} can access data and under what conditions
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Administrative access within {LEGAL_CONFIG.brandName} is restricted to authorized platform administrator accounts for onboarding, subscription administration, and operational governance.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    Internal administrative tiers &amp; limits:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Level 1: Super Admin (System Creator):</strong> Holds root platform authority to provision or revoke Level 2 Ellic Admins via authenticated server endpoints (<code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">/api/admin/team/*</code>) and oversee platform-wide database, security, and RBAC administration.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Level 2: {LEGAL_CONFIG.brandName} Admin:</strong> Authorized for operational workflows including reviewing merchant onboarding applications, provisioning client workspaces, and managing subscription status. Database policies explicitly block Level 2 Admins from granting themselves or others <code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">super_admin</code> or <code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">ellix_admin</code> privileges or modifying Super Admin accounts.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Honest Technical Scope Disclosure:</strong> In the current database policy set and administrative server configuration, authenticated <code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">super_admin</code> and <code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">ellix_admin</code> accounts hold technical read/write permissions across <code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">/stores/&#123;storeId&#125;</code> and <code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">/clients/&#123;clientId&#125;</code> records for platform administration, troubleshooting, and authorized tenant purge requests.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider font-mono">
                  No unverified enterprise claims
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  We do not claim zero-knowledge architecture where administrators are mathematically blocked from viewing cloud records, nor do we claim automated Just-In-Time (JIT) access approval workflows or hardware security keys.
                </p>
              </div>
            </article>
          </div>

          {/* Card 3: Technical Enforcement Mechanisms & Safeguards */}
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      03 · Technical Enforcement &amp; Audit Safeguards
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Supabase Auth, Database Policies &amp; Express Token Verification</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                    What Technical Controls Enforce Access Boundaries
                  </h4>
                </div>
              </div>

              {onOpenLegalPage && (
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => onOpenLegalPage('security')}
                  className="min-h-[44px] sm:min-h-0 py-1.5 text-xs font-semibold text-blue-700 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 inline-flex items-center gap-1 text-left cursor-pointer shrink-0 group"
                >
                  <span>Inspect Full Security Practices</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Rather than relying only on hidden buttons in the user interface, {LEGAL_CONFIG.brandName} enforces access limits across authentication, cloud database security rules, and backend API verification, while providing an isolated public Demo Mode that never connects to live merchant records.
            </p>

            {/* 4-Column Technical Control Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  1. Authenticated Identity &amp; Role Lock
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Users sign in via <strong className="text-slate-800 dark:text-slate-200">Supabase Authentication</strong> (Email/Password, Google Sign-In, or Phone OTP). Self-signup accounts cannot assign themselves <code className="font-mono text-[10px]">super_admin</code> or <code className="font-mono text-[10px]">ellix_admin</code> roles, and manual role switching is disabled in production builds.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  2. Store &amp; Tenant Database Rules
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">Database security policies</strong> default-deny unauthenticated access and verify <code className="font-mono text-[10px]">storeId</code> and <code className="font-mono text-[10px]">clientId</code> bindings on every document read, create, update, and delete so stores remain isolated from one another.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  3. Server Bearer Token Verification
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sensitive backend endpoints (admin team provisioning, subscription payment verification, and workspace purge) verify <strong className="text-slate-800 dark:text-slate-200">Supabase access Bearer tokens</strong> via the Supabase service-role client and reject cross-tenant or Crew requests with HTTP 401/403.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  4. Store Audit Logs &amp; Demo Isolation
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Store operations log events to <code className="font-mono text-[10px]">/stores/&#123;storeId&#125;/auditLogs</code> where database policies block edits (<code className="font-mono text-[10px]">update blocked by policy</code>). Public <strong className="text-slate-800 dark:text-slate-200">Demo Mode</strong> runs entirely on sample data without reading or writing live merchant records.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Dedicated Vulnerability Disclosure Subsection (Checklist Item #5) */}
        <div
          id="vulnerability-disclosure"
          aria-labelledby="vulnerability-disclosure-heading"
          className="mt-14 pt-12 border-t border-slate-200/80 dark:border-slate-800/80 space-y-6"
        >
          {/* Subsection Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                <span className="text-blue-700 dark:text-sky-400 font-bold uppercase tracking-wider">
                  Responsible Security Reporting &amp; Handling
                </span>
                <span aria-hidden="true">·</span>
                <span>Official Reporting Channels &amp; Good-Faith Guidelines</span>
              </div>
              <h3
                id="vulnerability-disclosure-heading"
                className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight"
              >
                Vulnerability Disclosure
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                If a merchant, user, or security researcher discovers a potential security issue in {LEGAL_CONFIG.brandName}, we encourage responsible reporting so the issue can be reviewed and resolved quickly. While {LEGAL_CONFIG.brandName} does not currently operate a paid bug bounty program, security concerns can be reported directly through our official support and grievance channels.
              </p>
            </div>

            {onOpenLegalPage && (
              <div className="shrink-0">
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => onOpenLegalPage('grievance-redressal')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Security &amp; Grievance Report Form</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                </button>
              </div>
            )}
          </div>

          {/* Two Primary Cards: How to Report & Responsible Disclosure Guidelines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: How to Report a Security Issue & What to Include */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      01 · Official Reporting Channels
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>How to Submit a Security Report</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    Where to report a vulnerability and what details to include
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Security reports are received through our verified in-app and website reporting forms so each submission is logged with your contact information for follow-up.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    Verified reporting pathways &amp; helpful details:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Grievance &amp; Security Report Ticket (<code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">/grievance-redressal</code>):</strong> Use our formal ticket form and select the <strong className="text-slate-900 dark:text-white">“Security Vulnerability or Incident Report”</strong> category to generate a timestamped reference ID (<code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">GRV-…</code>).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Website Contact &amp; Support Inquiry:</strong> You can also submit a security concern through the <strong className="text-slate-900 dark:text-white">Contact {LEGAL_CONFIG.brandName}</strong> support modal by starting your message subject or description with <code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">[SECURITY REPORT]</code>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">What to Include in Your Report:</strong> Provide the affected page, URL, or module (for example, POS billing, inventory, or login), clear step-by-step instructions to reproduce the issue, what you observed versus what you expected, and an email address or phone number where we can reach you.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                {onOpenLegalPage && (
                  <button
                    type="button"
                    data-cursor="hover"
                    onClick={() => onOpenLegalPage('grievance-redressal')}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Report a Security Issue</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {onOpenContact && (
                  <button
                    type="button"
                    data-cursor="hover"
                    onClick={onOpenContact}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Contact Support</span>
                  </button>
                )}
              </div>
            </article>

            {/* Card 2: Responsible Disclosure Guidelines */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      02 · Responsible Disclosure Expectations
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Protecting Merchant Data &amp; Store Uptime</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    Guidelines for good-faith security testing and reporting
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Because retail stores rely on {LEGAL_CONFIG.brandName} for daily counter billing and customer Khata records, we ask anyone investigating or reporting a potential security issue to follow basic responsible disclosure practices.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    Responsible reporting rules:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Do Not Access or Modify Another Business’s Data:</strong> Never view, copy, alter, or delete live records belonging to another store or merchant. If you are testing application workflows, use the isolated public <strong className="text-slate-900 dark:text-white">Demo Mode</strong> or your own test account.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Do Not Disrupt Store Operations:</strong> Avoid automated denial-of-service (DoS) testing, high-volume request flooding, credential brute-forcing, or any action that could slow down or interrupt live merchant billing.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Report Promptly &amp; Allow Time for Remediation:</strong> Submit your findings as soon as they are identified and give our team a reasonable opportunity to investigate and deploy a fix before sharing technical details publicly.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider font-mono">
                  Why this matters for small businesses
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Responsible disclosure ensures that potential bugs can be fixed quietly and safely without putting active store inventories, GST invoices, or customer balances at risk.
                </p>
              </div>
            </article>
          </div>

          {/* Card 3: How Reports Are Handled & Bug Bounty Position */}
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      03 · Report Handling &amp; Bug Bounty Status
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Review Process &amp; Honest Program Scope</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                    How Security Reports Are Handled &amp; Current Program Scope
                  </h4>
                </div>
              </div>

              {onOpenLegalPage && (
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => onOpenLegalPage('security')}
                  className="min-h-[44px] sm:min-h-0 py-1.5 text-xs font-semibold text-blue-700 dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 inline-flex items-center gap-1 text-left cursor-pointer shrink-0 group"
                >
                  <span>View Security Practices Document</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">{LEGAL_CONFIG.brandName} does not currently operate a paid bug bounty program</strong> or offer cash rewards for vulnerability submissions. All security reports submitted through our official grievance or support channels are reviewed to protect merchants and improve platform security.
            </p>

            {/* 4-Column Handling & Scope Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  1. Intake &amp; Ticket Reference
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Submitting via the <strong className="text-slate-800 dark:text-slate-200">Grievance Redressal</strong> form under <code className="font-mono text-[10px]">security_concern</code> immediately generates a ticket reference ID (<code className="font-mono text-[10px]">GRV-…</code>), with a target acknowledgment window of {COMPLIANCE_APPLICABILITY_CONFIG.timelines.grievanceAcknowledgeHours} hours.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  2. Technical Review &amp; Triage
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Platform administrators review the reproduction steps to verify whether the report affects authentication, database policies, server endpoints, or client-side workflows.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  3. Prioritization &amp; Fix
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Verified issues are prioritized according to their potential impact on store data isolation and billing integrity, and addressed via code, rule, or configuration updates.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  4. Honest Program Scope
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  We do not claim a 24/7 Security Operations Center (SOC), third-party bug bounty platform, or paid monetary bounty program. Reports are handled through our official support and grievance channels.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Dedicated Incident History Subsection (Checklist Item #6) */}
        <div
          id="incident-history"
          aria-labelledby="incident-history-heading"
          className="mt-14 pt-12 border-t border-slate-200/80 dark:border-slate-800/80 space-y-6"
        >
          {/* Subsection Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                <span className="text-blue-700 dark:text-sky-400 font-bold uppercase tracking-wider">
                  06 · Public Disclosure Log &amp; Resolution Archive
                </span>
                <span aria-hidden="true">·</span>
                <span>Security Incident Transparency</span>
              </div>
              <h3
                id="incident-history-heading"
                className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight"
              >
                Incident History
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                This section records publicly disclosed security incidents, including dates, affected scope, and resolution summaries. Providing an open disclosure record helps business owners evaluate how security events are documented and communicated.
              </p>
            </div>

            {onOpenLegalPage && (
              <div className="shrink-0">
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => onOpenLegalPage('security')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Security Practices &amp; Notices</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                </button>
              </div>
            )}
          </div>

          {/* Two Primary Cards: Current Public Incident Record & How Disclosures Are Documented */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Verified No-Disclosed-Incident Archive State */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      01 · Public Incident Log Status
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Status: No Disclosed Incidents Recorded</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    No publicly disclosed security incidents to date
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    No security incidents have been publicly disclosed by {LEGAL_CONFIG.brandName} to date, and there are currently no historical breach notices, public security advisories, or CVE disclosures recorded in the project’s public security history.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    What this record represents:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Current Archive State:</strong> {LEGAL_CONFIG.brandName} does not currently have any past publicly disclosed data breaches, credential compromises, or customer-data exposure advisories on record.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">No Manufactured Historical Dates:</strong> Because formal commercial publication and legal entity registration fields (<code className="font-mono text-[11px] text-slate-800 dark:text-slate-200">LEGAL_CONFIG.effectiveDate</code>) are currently in pre-launch configuration, we do not claim a multi-year historical audit window or make absolute claims beyond the current documented record.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Ongoing Record Updates:</strong> If a security incident requiring public disclosure occurs in the future, it will be added to this section with factual dates and remediation summaries.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider font-mono">
                  Honest transparency statement
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Stating that no security incidents have been publicly disclosed to date reflects our verified public documentation rather than a claim of permanent immunity from security risks.
                </p>
              </div>
            </article>

            {/* Card 2: How Future Disclosed Incidents Will Be Documented */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      02 · Disclosure Format &amp; Communication
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>What Information Will Be Published</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    How future security disclosures and resolution summaries are structured
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    When a security incident requires customer notification or public disclosure, {LEGAL_CONFIG.brandName} will publish a structured entry here and in the Legal &amp; Trust Center so merchants can understand what happened and how it was resolved.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    Standard disclosure entry fields:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Date, Title &amp; Factual Summary:</strong> The date of the disclosed incident, a clear title, and a plain-language summary of what occurred and which system component or data category was involved.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Merchant Impact &amp; Resolution Summary:</strong> Whether store workspaces or customer records were affected, the technical remediation or configuration steps taken to resolve the issue, and the current status (<strong className="text-slate-900 dark:text-white">Resolved</strong>, <strong className="text-slate-900 dark:text-white">Monitoring</strong>, or <strong className="text-slate-900 dark:text-white">Ongoing</strong>).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Safe Public Summaries Only:</strong> Public incident summaries never expose merchant names, personal contact details, authentication tokens, private logs, or sensitive exploit details that could put stores at risk.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider font-mono">
                  No unverified operational claims
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  We do not claim an automated real-time status page, 24/7 SOC monitoring, or guaranteed custom notification SLAs beyond applicable statutory requirements under Indian law.
                </p>
              </div>
            </article>
          </div>

          {/* Public Incident Timeline / Archive Ledger State */}
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono text-blue-700 dark:text-sky-400 font-semibold uppercase tracking-wider">
                  03 · Disclosed Security Incident Log
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                  Chronological Record of Publicly Disclosed Security Incidents
                </h4>
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Recorded Entries: <strong className="text-slate-900 dark:text-white">0 Disclosed Incidents</strong>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>No publicly disclosed incidents recorded in the current security history</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                  There are currently no disclosed security incident entries to display. If a security incident is publicly disclosed in the future, its date, incident summary, affected scope, resolution details, and status will appear in this chronological log. To report a new potential vulnerability, please refer to the <a href="#vulnerability-disclosure" className="text-blue-700 dark:text-sky-400 font-semibold hover:underline">Vulnerability Disclosure</a> subsection above.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 9. Dedicated Penetration Testing Subsection (Checklist Item #7) */}
        <div
          id="penetration-testing"
          aria-labelledby="penetration-testing-heading"
          className="mt-14 pt-12 border-t border-slate-200/80 dark:border-slate-800/80 space-y-6"
        >
          {/* Subsection Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                <span className="text-blue-700 dark:text-sky-400 font-bold uppercase tracking-wider">
                  07 · Independent Security Assessments &amp; Audit Reports
                </span>
                <span aria-hidden="true">·</span>
                <span>Third-Party Penetration Testing Status</span>
              </div>
              <h3
                id="penetration-testing-heading"
                className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight"
              >
                Penetration Testing
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {LEGAL_CONFIG.brandName} has not completed or publicly disclosed an independent third-party penetration test or external application security audit to date. We state this clearly so business owners can distinguish between our internal engineering controls and formal external security assessments.
              </p>
            </div>

            {onOpenLegalPage && (
              <div className="shrink-0">
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => onOpenLegalPage('security')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Review Security Practices Document</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                </button>
              </div>
            )}
          </div>

          {/* Two Primary Cards: Third-Party Penetration Test Status & Report Availability / Scope Distinction */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Third-Party Penetration Testing Status */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      01 · Third-Party Assessment Status
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Most Recent External Test Date: None Documented</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    No third-party penetration test completed or disclosed to date
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {LEGAL_CONFIG.brandName} has not completed or publicly disclosed a third-party penetration test to date. No external testing organization, assessment date, vulnerability remediation retest, or external audit report is currently on record for the application.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    Verified assessment particulars:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">External Testing Firm &amp; Assessment Date:</strong> None documented. We do not list unverified auditor names, test dates, or assessment scopes.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Internal Checks vs. Independent Penetration Testing:</strong> Internal development reviews, static TypeScript checks, and Database security policy configurations are part of maintaining the codebase, but they are not represented as an independent third-party penetration test.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Cloud Provider Infrastructure Distinction:</strong> Hosting database and authentication services on Supabase does not mean Google Cloud has penetration-tested or audited the {LEGAL_CONFIG.brandName} application code or business logic.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider font-mono">
                  Important security note
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  The absence of a published penetration-test record is a factual disclosure of current assessment status and does not constitute a claim that the application is free of vulnerabilities.
                </p>
              </div>
            </article>

            {/* Card 2: Penetration Test Report Availability & Future Updates */}
            <article className="website-card-hover rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 flex flex-col justify-between gap-5 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-700 dark:text-sky-400 font-semibold">
                      02 · Report Availability &amp; Inquiries
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Status: No External Report Available</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    Availability of third-party security audit or penetration-test reports
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Because no third-party penetration test has been completed to date, <strong className="text-slate-900 dark:text-white">no independent penetration-test report or external audit summary is currently available for download or customer request</strong>.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                    How report availability and inquiries are handled:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">No Unverified Report-Request Portal:</strong> We do not provide a synthetic “Request Penetration Test Report” button because no third-party assessment report currently exists.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">When a Third-Party Assessment Is Completed:</strong> Once an independent security assessment is commissioned and completed, this section will be updated with the testing organization, assessment date, high-level scope, remediation status, and instructions for requesting the summary report.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Architecture &amp; Security Questions:</strong> If your business has questions about our current technical controls or future security assessment plans, you can reach out through our existing Contact Support channel.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Current Report Status: <strong className="text-slate-900 dark:text-white">Not Currently Available</strong>
                </span>
                {onOpenContact && (
                  <button
                    type="button"
                    data-cursor="hover"
                    onClick={onOpenContact}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Ask About Security Assessments</span>
                  </button>
                )}
              </div>
            </article>
          </div>
        </div>

        {/* 7. Bottom Plain-Language Merchant Transparency Callout */}
        <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-blue-950/70 border border-sky-200/70 dark:border-sky-800/70 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-950 dark:text-white">
                Questions about how {LEGAL_CONFIG.brandName} handles your store’s billing or Khata records?
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                We keep our documentation practical and transparent for retail store owners, supermarkets, and wholesalers in India. Contact our team or review our full policy documents anytime.
              </p>
            </div>
          </div>

          {onOpenContact && (
            <button
              type="button"
              data-cursor="hover"
              onClick={onOpenContact}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              Ask a Compliance Question
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
