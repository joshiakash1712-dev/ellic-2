import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  Scale,
  Lock,
  Cookie,
  UserCheck,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Send,
  Building2,
  Mail,
  Phone,
  Clock,
  Info,
  RefreshCw,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { EllixConnectLogo } from '../branding/EllixConnectLogo';
import { ThemeToggle } from '../ThemeToggle';
import {
  LEGAL_CONFIG,
  COMPLIANCE_APPLICABILITY_CONFIG,
  LEGAL_PAGE_ROUTES,
  LegalPageSlug,
  isConfiguredLegalValue,
  getConfiguredOrFallback,
  getUnconfiguredLegalKeys,
  isDevelopmentEnvironment,
  getSavedCookiePreferences,
  saveCookiePreferences,
  submitDataPrincipalRequest,
  getDataPrincipalRequests,
  DataPrincipalRequestRecord,
  submitGrievanceTicket,
  getGrievanceTickets,
  GrievanceTicketRecord,
  getConsentAuditHistory,
} from '../../config/legal.config';

interface LegalComplianceHubProps {
  activeSlug: LegalPageSlug;
  onSelectSlug: (slug: LegalPageSlug) => void;
  onBackToWebsite: () => void;
  onOpenContactModal?: () => void;
}

export const LegalComplianceHub: React.FC<LegalComplianceHubProps> = ({
  activeSlug,
  onSelectSlug,
  onBackToWebsite,
  onOpenContactModal,
}) => {
  // Cookie preferences interactive state
  const existingCookies = getSavedCookiePreferences();
  const [functionalEnabled, setFunctionalEnabled] = useState<boolean>(
    existingCookies ? existingCookies.functionalPreferences : true
  );
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(
    existingCookies ? existingCookies.analyticsAndDiagnostics : false
  );
  const [cookieSavedMessage, setCookieSavedMessage] = useState<string | null>(null);

  // Data Principal Request Form state
  const [dpType, setDpType] = useState<DataPrincipalRequestRecord['requestType']>('access_summary');
  const [dpName, setDpName] = useState('');
  const [dpContact, setDpContact] = useState('');
  const [dpRole, setDpRole] = useState('Merchant / Store Owner');
  const [dpDetails, setDpDetails] = useState('');
  const [dpRequests, setDpRequests] = useState<DataPrincipalRequestRecord[]>([]);
  const [dpSubmittedId, setDpSubmittedId] = useState<string | null>(null);

  // Grievance Redressal Form state
  const [grvName, setGrvName] = useState('');
  const [grvContact, setGrvContact] = useState('');
  const [grvCategory, setGrvCategory] = useState<GrievanceTicketRecord['category']>('privacy_dpdpa');
  const [grvSubject, setGrvSubject] = useState('');
  const [grvDescription, setGrvDescription] = useState('');
  const [grvTickets, setGrvTickets] = useState<GrievanceTicketRecord[]>([]);
  const [grvSubmittedTicket, setGrvSubmittedTicket] = useState<string | null>(null);

  // Developer config audit toggle (only shown in dev or when placeholders exist)
  const unconfiguredKeys = getUnconfiguredLegalKeys();
  const isDevEnvironment = isDevelopmentEnvironment();

  useEffect(() => {
    setDpRequests(getDataPrincipalRequests());
    setGrvTickets(getGrievanceTickets());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSlug]);

  const handleSaveCookiePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    saveCookiePreferences({
      functionalPreferences: functionalEnabled,
      analyticsAndDiagnostics: analyticsEnabled,
    });
    setCookieSavedMessage('Your cookie and local storage preferences have been updated.');
    setTimeout(() => setCookieSavedMessage(null), 4000);
  };

  const handleDpRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dpName.trim() || !dpContact.trim() || !dpDetails.trim()) return;
    const created = submitDataPrincipalRequest({
      requestType: dpType,
      requesterName: dpName.trim(),
      requesterEmailOrPhone: dpContact.trim(),
      accountRole: dpRole,
      details: dpDetails.trim(),
    });
    setDpRequests(getDataPrincipalRequests());
    setDpSubmittedId(created.id);
    setDpDetails('');
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grvName.trim() || !grvContact.trim() || !grvSubject.trim() || !grvDescription.trim()) return;
    const created = submitGrievanceTicket({
      complainantName: grvName.trim(),
      complainantContact: grvContact.trim(),
      category: grvCategory,
      subject: grvSubject.trim(),
      description: grvDescription.trim(),
    });
    setGrvTickets(getGrievanceTickets());
    setGrvSubmittedTicket(created.ticketId);
    setGrvSubject('');
    setGrvDescription('');
  };

  const handleExportLocalPrivacySnapshot = () => {
    const payload = {
      platform: LEGAL_CONFIG.brandName,
      exportedAt: new Date().toISOString(),
      privacyPolicyVersion: LEGAL_CONFIG.privacyPolicyVersion,
      termsVersion: LEGAL_CONFIG.termsVersion,
      cookiePreferences: getSavedCookiePreferences(),
      consentAuditHistory: getConsentAuditHistory(),
      submittedDataPrincipalRequests: getDataPrincipalRequests(),
      submittedGrievanceTickets: getGrievanceTickets(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ellic-privacy-records-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navItems: { slug: LegalPageSlug; label: string; icon: React.ReactNode }[] = [
    { slug: 'privacy-policy', label: 'Privacy Policy', icon: <ShieldCheck className="w-4 h-4" /> },
    { slug: 'terms-of-service', label: 'Terms of Service', icon: <FileText className="w-4 h-4" /> },
    { slug: 'cancellation-refund-policy', label: 'Cancellation & Refund Policy', icon: <Scale className="w-4 h-4" /> },
    { slug: 'cookie-policy', label: 'Cookie Policy', icon: <Cookie className="w-4 h-4" /> },
    { slug: 'data-privacy-rights', label: 'Data & Privacy Rights', icon: <UserCheck className="w-4 h-4" /> },
    { slug: 'security', label: 'Security Practices', icon: <Lock className="w-4 h-4" /> },
    { slug: 'grievance-redressal', label: 'Grievance Redressal', icon: <AlertCircle className="w-4 h-4" /> },
    { slug: 'support', label: 'Help / Support', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const effectiveDateDisplay = getConfiguredOrFallback(
    LEGAL_CONFIG.effectiveDate,
    'Effective upon publication (Version ' + LEGAL_CONFIG.privacyPolicyVersion + ')'
  );

  const entityNameDisplay = getConfiguredOrFallback(
    LEGAL_CONFIG.legalBusinessName,
    LEGAL_CONFIG.brandName
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-white">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {LEGAL_CONFIG.brandName}</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">|</span>
            <div className="hidden sm:flex items-center gap-2">
              <EllixConnectLogo size="sm" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Legal, Privacy & Trust Center (India)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onOpenContactModal && (
              <button
                type="button"
                onClick={onOpenContactModal}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors"
              >
                Contact Support
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Navigation */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm">
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Legal & Compliance
              </div>
              <nav className="space-y-1" aria-label="Legal Documents Navigation">
                {navItems.map((item) => {
                  const isActive = activeSlug === item.slug;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => onSelectSlug(item.slug)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Scope & Regulatory Transparency Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Platform Scope & Notice</span>
              </div>
              <p className="leading-relaxed">
                {LEGAL_CONFIG.brandName} is a business-management SaaS platform designed for retail stores, supermarkets, and wholesalers in India (excluding restaurants).
              </p>
              <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
                Privacy Version {LEGAL_CONFIG.privacyPolicyVersion} · Terms Version {LEGAL_CONFIG.termsVersion}
              </p>
            </div>

            {/* Development-only Configuration Readiness Indicator */}
            {isDevEnvironment && unconfiguredKeys.length > 0 && (
              <div className="bg-amber-50/90 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 p-4 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Dev Config Check ({unconfiguredKeys.length} pending)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
                  Update <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 rounded">src/config/legal.config.ts</code> before production deployment. Unconfigured <code className="font-mono">[REPLACE]</code> fields are automatically flagged for review.
                </p>
              </div>
            )}
          </aside>

          {/* Right Document Content Area */}
          <main className="lg:col-span-9 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
            
            {/* ============================================================== */}
            {/* 1. PRIVACY POLICY (/privacy-policy)                            */}
            {/* ============================================================== */}
            {activeSlug === 'privacy-policy' && (
              <article className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Digital Personal Data Protection Act, 2023 (DPDPA) &amp; IT Act Framework
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                    Privacy Policy
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Platform: {LEGAL_CONFIG.brandName}</span>
                    <span aria-hidden="true">·</span>
                    <span>Version: {LEGAL_CONFIG.privacyPolicyVersion}</span>
                    <span aria-hidden="true">·</span>
                    <span>{effectiveDateDisplay}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 space-y-1.5">
                  <div className="font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Core Privacy Commitment</span>
                  </div>
                  <p>
                    {LEGAL_CONFIG.brandName} provides digital billing, inventory management, customer ledger (Khata) management, payment recording, crew role management, and business analytics for small businesses in India (excluding restaurants). We do not sell, rent, or monetize your merchant business ledgers, product pricing margins, or your customers&apos; contact records to third-party advertisers.
                  </p>
                </div>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    1. Who We Are &amp; Role Distinction (Data Fiduciary vs. Data Processor)
                  </h2>
                  <p>
                    This Privacy Policy explains how <strong>{entityNameDisplay}</strong> (&ldquo;{LEGAL_CONFIG.brandName}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, stores, and protects personal data when you visit our website or use the {LEGAL_CONFIG.brandName} application.
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Merchant &amp; Account Holder Data (Data Fiduciary Role):</strong> For personal data of registered merchants, store owners, wholesalers, and website visitors who interact directly with us (such as account registration, onboarding inquiries, and support requests), we determine the purpose and means of processing to deliver and secure the service.
                    </li>
                    <li>
                      <strong>Business Customer, Khata &amp; Invoice Records Entered by Merchants (Processor / Service Provider Role):</strong> When a business user (store owner or authorized crew member) enters customer names, phone numbers, billing history, or credit (Khata) balances into their {LEGAL_CONFIG.brandName} workspace, the business user remains responsible for having a lawful basis or notice to record their customers&apos; billing details. We process and store such records solely on behalf of and under the instructions of the business user.
                    </li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    2. Categories of Personal &amp; Business Data Collected
                  </h2>
                  <p>
                    We collect only the information that corresponds to the actual features you use on the website and application:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        A. Account &amp; Authentication Information
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Full name, email address, mobile phone number (for SMS OTP verification), profile photo URL (if signing in via Google OAuth), authentication provider identifiers, and synchronized password credentials managed via Supabase Authentication.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        B. Business &amp; Store Configuration Data
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Store or enterprise name, business category, city/address, merchant-configured GSTIN (where entered by the business for tax invoices), merchant UPI ID (VPA) used to generate dynamic QR codes at checkout, and invoice template settings.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        C. Customer, Invoice &amp; Transaction Data
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Customer names, mobile numbers, itemized invoice lines, GST tax breakdowns, payment tender modes (Cash, UPI, Card, Khata credit), credit balances, and supplier order records entered by the business user.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        D. Crew / Staff &amp; Role Management Data
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Names, contact details, assigned roles (Manager, Cashier, Crew), shift sales attribution, and store access permissions configured by the store owner or administrator.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        E. Device, Browser, Logs &amp; Offline Storage
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Browser type, operating system, IP address and request timestamps in server/security logs, theme preference, and local browser storage (<code className="font-mono">localStorage</code> / IndexedDB) used for offline POS caching and cloud synchronization.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        F. Support, Onboarding &amp; Chat Inquiries
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Information you submit through onboarding request forms, support contact forms, grievance submissions, or interactive support chat prompts on the website.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    3. Purposes of Processing &amp; Lawful Basis
                  </h2>
                  <p>
                    We process personal data strictly for specified, lawful purposes connected with operating {LEGAL_CONFIG.brandName}, based on your affirmative consent and/or performance of your requested service:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Account Creation &amp; Authentication:</strong> Verifying identity via Google Sign-In, Email/Password, or SMS OTP, and enforcing Role-Based Access Control (RBAC).</li>
                    <li><strong>Providing Core SaaS Functionality:</strong> Generating bills and tax invoices, tracking multi-batch inventory, recording payments, maintaining customer Khata balances, and synchronizing offline transactions across authorized devices.</li>
                    <li><strong>Business Insights &amp; Reporting:</strong> Computing store sales summaries, stock velocity metrics, and downloadable GST/ledger schedules for the business owner.</li>
                    <li><strong>Security, Audit &amp; Fraud Prevention:</strong> Protecting accounts against unauthorized access, enforcing database security policies, and maintaining security logs in line with applicable Indian cyber-security directions.</li>
                    <li><strong>Customer Support &amp; Grievance Redressal:</strong> Responding to onboarding requests, technical queries, Data Principal requests, and formal grievances.</li>
                    <li><strong>Legal &amp; Accounting Obligations:</strong> Complying with applicable statutory requirements under Indian law.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    4. Data Residency, Storage &amp; Third-Party Infrastructure
                  </h2>
                  <p>
                    We rely on Supabase infrastructure and your local browser to store and process workspace data:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Supabase Database &amp; Authentication:</strong> Structured store records (profiles, product catalogs, GST invoices, customer Khata ledgers, and staff roles) are stored in Supabase, and login credentials are managed by Supabase Authentication on Supabase&apos;s cloud infrastructure. The exact database region is governed by the platform&apos;s cloud project configuration; we do not claim India-only or single-country cloud data residency.</li>
                    <li><strong>Local Browser &amp; Device Storage:</strong> Active POS catalog cache, unsynchronized offline counter transactions, UI preferences, and downloaded CSV/PDF/JSON exports are stored locally on your own shop computer, tablet, or mobile device.</li>
                    <li><strong>Application Server &amp; Feature-Specific External APIs:</strong> Server-side API routes run on our hosted Node.js / Express application server on Google Cloud infrastructure. When you voluntarily interact with the website support chatbot, your chat prompt is answered by our built-in support knowledge base on our own server and is not sent to any third-party AI service (do not submit sensitive personal, banking, or confidential customer data in support chat prompts). Where paid SaaS subscription checkout is configured, subscription order metadata is processed via Razorpay&apos;s payment API.</li>
                    <li><strong>Regional Data Residency Options:</strong> {LEGAL_CONFIG.brandName} does not currently offer customer-selectable regional data residency options (such as choosing between India, EU, or US regions per merchant account).</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    5. Data Retention, Export &amp; Deletion
                  </h2>
                  <p>
                    Active workspace records are retained for as long as your merchant account remains active. Store owners can export their inventory, customer ledgers, and billing reports in standard CSV/PDF formats at any time. Upon account closure or verified erasure request, personal data is deleted or anonymized once the purpose is no longer served, subject to any mandatory retention required under applicable Indian tax, accounting, or cybersecurity laws.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    6. Your Rights as a Data Principal (DPDPA, 2023)
                  </h2>
                  <p>
                    Under India&apos;s Digital Personal Data Protection Act, 2023, you have the right to access a summary of your personal data, request correction or erasure, withdraw consent, nominate an individual to exercise your rights in the event of death or incapacity, and seek grievance redressal. Visit our dedicated{' '}
                    <button
                      type="button"
                      onClick={() => onSelectSlug('data-privacy-rights')}
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      Data &amp; Privacy Rights Center
                    </button>{' '}
                    to exercise these rights.
                  </p>
                </section>
              </article>
            )}

            {/* ============================================================== */}
            {/* 2. TERMS OF SERVICE (/terms-of-service)                        */}
            {/* ============================================================== */}
            {activeSlug === 'terms-of-service' && (
              <article className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Commercial SaaS Agreement &amp; Platform Usage Terms
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                    Terms of Service
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Platform: {LEGAL_CONFIG.brandName}</span>
                    <span aria-hidden="true">·</span>
                    <span>Version: {LEGAL_CONFIG.termsVersion}</span>
                    <span aria-hidden="true">·</span>
                    <span>{effectiveDateDisplay}</span>
                  </div>
                </div>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    1. Scope of Service &amp; Eligibility
                  </h2>
                  <p>
                    {LEGAL_CONFIG.brandName} is a business-management software-as-a-service (SaaS) platform designed for small businesses, retail stores, supermarkets, and wholesalers operating in India (explicitly excluding restaurants and food-service dining operations). By registering an account or using the platform, you represent that you are at least 18 years of age and legally competent to enter into a binding contract under the Indian Contract Act, 1872.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    2. GST, Tax Calculation &amp; Invoicing Disclaimer
                  </h2>
                  <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 text-xs sm:text-sm text-amber-950 dark:text-amber-200 space-y-2">
                    <div className="font-bold">Important Tax &amp; Accounting Notice (Requires Merchant Verification)</div>
                    <p>
                      {LEGAL_CONFIG.brandName} provides software tools to generate bills, tax breakdowns (CGST, SGST, IGST), and downloadable summary sheets based strictly on the product prices, HSN/SAC codes, GSTIN, and tax rates configured by the business user.
                    </p>
                    <p>
                      <strong>{LEGAL_CONFIG.brandName} is not a Chartered Accountant, tax advisor, or GST Suvidha Provider (GSP), and is not certified or approved by any government tax authority.</strong> Merchants are solely responsible for verifying the accuracy of their tax rates, invoice serial numbering, e-invoicing or e-way bill applicability (where required by turnover thresholds), and timely filing of statutory returns (such as GSTR-1 and GSTR-3B) on the official GST portal.
                    </p>
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    3. Electronic Payments &amp; Dynamic UPI QR Disclaimer
                  </h2>
                  <p>
                    Where {LEGAL_CONFIG.brandName} generates a Dynamic UPI QR code at the billing counter, the QR code encodes standard NPCI UPI intent parameters using the Merchant VPA (UPI ID) and invoice amount configured by the store owner. Unless a regulated third-party payment gateway is explicitly integrated and contracted, {LEGAL_CONFIG.brandName} does not hold, settle, or route customer funds as a bank or payment aggregator; payments settle directly between the customer&apos;s UPI app and the merchant&apos;s linked bank account. Merchants must verify payment settlement confirmation on their bank/UPI terminal before marking high-value invoices as paid.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    4. Account Security, Crew Roles &amp; Offline Sync Responsibility
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Store owners are responsible for managing access permissions assigned to their crew members (Managers, Cashiers, Staff) and safeguarding login credentials.</li>
                    <li>When using {LEGAL_CONFIG.brandName} in offline counter mode, transactions are cached locally on the device browser storage until internet connectivity is restored. Clearing browser site data or losing an unencrypted device before synchronization is completed may result in loss of unsynchronized local transactions.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    5. Acceptable Use &amp; Prohibited Activities
                  </h2>
                  <p>
                    You agree not to use {LEGAL_CONFIG.brandName} to generate fraudulent invoices, evade statutory taxes, store unlawful or counterfeit inventory records, infringe third-party intellectual property rights, or attempt unauthorized access to another merchant&apos;s workspace or platform security rules.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    6. Intellectual Property
                  </h2>
                  <p>
                    All software code, user interface designs, logos, documentation, and trademarks associated with {LEGAL_CONFIG.brandName} remain the intellectual property of {entityNameDisplay}. Business users retain full ownership of their store catalog data, customer records, and transaction ledgers.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    7. Limitation of Liability &amp; Governing Law
                  </h2>
                  <p>
                    To the maximum extent permitted by applicable Indian law, the platform is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis. We shall not be liable for indirect, consequential, or tax-penalty damages arising from merchant configuration errors, hardware failures, or third-party telecom/payment network outages.
                  </p>
                  <p>
                    These Terms are governed by the laws of India.{' '}
                    {isConfiguredLegalValue(LEGAL_CONFIG.jurisdiction)
                      ? `Any disputes shall be subject to the exclusive jurisdiction of the competent courts in ${LEGAL_CONFIG.jurisdiction}.`
                      : 'Dispute resolution venue and court jurisdiction in India are subject to applicable statutory provisions.'}
                  </p>
                </section>
              </article>
            )}

            {/* ============================================================== */}
            {/* 3. CANCELLATION & REFUND POLICY (/cancellation-refund-policy)  */}
            {/* ============================================================== */}
            {activeSlug === 'cancellation-refund-policy' && (
              <article className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Consumer Protection &amp; Transparent Subscription Billing Terms
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                    Cancellation &amp; Refund Policy
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Platform: {LEGAL_CONFIG.brandName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{effectiveDateDisplay}</span>
                  </div>
                </div>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    1. Free Onboarding Trial &amp; Evaluation
                  </h2>
                  <p>
                    Where {LEGAL_CONFIG.brandName} offers a complimentary trial or onboarding evaluation period, merchants may evaluate billing, inventory, and reporting workflows without upfront subscription charges. If you decide not to continue at the end of the trial period, you will not be charged unless you explicitly opt into a paid subscription plan.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    2. Subscription Cancellation
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Cancel Anytime:</strong> Merchants on monthly or annual subscription plans may request cancellation at any time through their account administrator or by contacting support.</li>
                    <li><strong>Effect of Cancellation:</strong> Cancellation stops future recurring billing cycles. Your workspace remains accessible through the end of the current paid billing period.</li>
                    <li><strong>Data Export Window:</strong> Following cancellation or expiration, merchants are provided at least {COMPLIANCE_APPLICABILITY_CONFIG.timelines.dataExportRetentionDaysAfterCancellation} days to export their product catalogs, customer Khata ledgers, and historical invoices in CSV/PDF format before workspace archival.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    3. Refund Eligibility &amp; Processing
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Duplicate or Erroneous Charges:</strong> In the event of an accidental duplicate deduction or billing error during subscription payment, 100% of the duplicate charge will be refunded to the original payment source within 5–7 business days of verification.</li>
                    <li><strong>Unused Subscription Periods:</strong> Because merchants receive trial access to evaluate the platform prior to paid activation, partial-month fees for active monthly plans are generally non-refundable once the billing cycle has commenced, except where required by applicable Indian consumer protection law or in cases of verified service non-delivery.</li>
                    <li><strong>How to Request a Billing Review:</strong> Submit your invoice reference and registered store email via our Support or Grievance Redressal channel.</li>
                  </ul>
                </section>
              </article>
            )}

            {/* ============================================================== */}
            {/* 4. COOKIE & LOCAL STORAGE POLICY (/cookie-policy)              */}
            {/* ============================================================== */}
            {activeSlug === 'cookie-policy' && (
              <article className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Browser Cookies, LocalStorage &amp; Offline POS Cache Transparency
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                    Cookie &amp; Local Storage Policy
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Platform: {LEGAL_CONFIG.brandName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{effectiveDateDisplay}</span>
                  </div>
                </div>

                <p>
                  {LEGAL_CONFIG.brandName} uses browser cookies, IndexedDB, and <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">localStorage</code> to authenticate users securely and enable offline-first retail billing. We do not use third-party behavioral advertising trackers.
                </p>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-950 dark:text-white">
                        1. Strictly Necessary Authentication &amp; Security Storage
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Required for authentication session tokens, CSRF/session protection, and Role-Based Access Control enforcement. Cannot be disabled if signing into the application.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      Always Active
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-950 dark:text-white">
                        2. Offline-First POS &amp; Inventory Synchronization Cache
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Stores active store catalog, pending counter invoices, and Khata ledger state locally on your device so billing continues without interruption during internet drops.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      Core POS Requirement
                    </span>
                  </div>

                  <form onSubmit={handleSaveCookiePrefs} className="space-y-4 pt-2">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <label htmlFor="toggle-functional-cookies" className="font-bold text-slate-950 dark:text-white cursor-pointer">
                          3. Functional &amp; UI Preferences
                        </label>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Remembers your light/dark theme selection, preferred invoice print format (80mm thermal vs. A4), and dismissed notification banners.
                        </p>
                      </div>
                      <input
                        id="toggle-functional-cookies"
                        type="checkbox"
                        checked={functionalEnabled}
                        onChange={(e) => setFunctionalEnabled(e.target.checked)}
                        className="mt-1 h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <label htmlFor="toggle-analytics-cookies" className="font-bold text-slate-950 dark:text-white cursor-pointer">
                          4. Optional Performance &amp; Diagnostics
                        </label>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Helps us identify UI layout errors and page load performance bottlenecks without profiling individual retail customers.
                        </p>
                      </div>
                      <input
                        id="toggle-analytics-cookies"
                        type="checkbox"
                        checked={analyticsEnabled}
                        onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                        className="mt-1 h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </div>

                    {cookieSavedMessage && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{cookieSavedMessage}</span>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        Save Cookie &amp; Storage Preferences
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            )}

            {/* ============================================================== */}
            {/* 5. DATA & PRIVACY RIGHTS (/data-privacy-rights)                */}
            {/* ============================================================== */}
            {activeSlug === 'data-privacy-rights' && (
              <article className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Digital Personal Data Protection Act, 2023: Data Principal Rights
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                      Data &amp; Privacy Rights Center
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportLocalPrivacySnapshot}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Export Consent &amp; Privacy Log (JSON)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-950 dark:text-white">Right to Access Information</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Obtain a summary of personal data being processed by {LEGAL_CONFIG.brandName}, the processing activities undertaken, and the identities of service providers involved.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-950 dark:text-white">Right to Correction &amp; Erasure</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Request correction of inaccurate or misleading personal data, completion of incomplete data, or erasure of personal data that is no longer necessary for the stated purpose.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-950 dark:text-white">Right to Withdraw Consent</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Withdraw your consent to personal data processing at any time with the same ease with which consent was given. Withdrawal does not affect the lawfulness of prior processing.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-bold text-slate-950 dark:text-white">Right to Nominate</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Nominate another individual who may exercise your Data Principal rights in the event of death or incapacity, in accordance with the DPDPA, 2023.
                    </p>
                  </div>
                </div>

                {/* Interactive Data Principal Request Submission Form */}
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    Submit a Data Principal Request
                  </h2>

                  {dpSubmittedId && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Request Logged (Reference ID: {dpSubmittedId}):</strong> Your Data Principal request has been recorded. You can also export your request confirmation using the JSON export button above.
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleDpRequestSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Request Type *
                        </label>
                        <select
                          value={dpType}
                          onChange={(e) => setDpType(e.target.value as DataPrincipalRequestRecord['requestType'])}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                        >
                          <option value="access_summary">Access Summary of Personal Data</option>
                          <option value="correction_update">Correction / Update of Personal Data</option>
                          <option value="erasure_deletion">Erasure / Account Deletion Request</option>
                          <option value="withdraw_consent">Withdrawal of Consent</option>
                          <option value="nominate_representative">Register a Nominee (DPDPA Sec. 14)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Your Relationship to {LEGAL_CONFIG.brandName} *
                        </label>
                        <select
                          value={dpRole}
                          onChange={(e) => setDpRole(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                        >
                          <option value="Merchant / Store Owner">Merchant / Store Owner</option>
                          <option value="Store Crew / Staff Member">Store Crew / Staff Member</option>
                          <option value="Wholesaler Partner">Wholesaler Partner</option>
                          <option value="Customer of a Merchant Store">Customer of a Merchant Store</option>
                          <option value="Website Visitor">Website Visitor</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={dpName}
                          onChange={(e) => setDpName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Registered Email or Mobile Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={dpContact}
                          onChange={(e) => setDpContact(e.target.value)}
                          placeholder="email@domain.com or +91 ..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Specific Details of Request *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={dpDetails}
                        onChange={(e) => setDpDetails(e.target.value)}
                        placeholder="Describe the personal data, store account, or consent preference your request relates to..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Data Principal Request</span>
                    </button>
                  </form>
                </div>

                {dpRequests.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                      Your Submitted Privacy Requests on This Device
                    </h3>
                    <div className="space-y-2">
                      {dpRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {req.id} · {req.requestType.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400">
                              {req.requesterName} ({req.accountRole}) · {new Date(req.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            )}

            {/* ============================================================== */}
            {/* 6. SECURITY PRACTICES (/security)                              */}
            {/* ============================================================== */}
            {activeSlug === 'security' && (
              <article className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Technical Safeguards, Access Controls &amp; Incident Readiness
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                    Security &amp; Data Protection Practices
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Platform: {LEGAL_CONFIG.brandName}</span>
                    <span aria-hidden="true">·</span>
                    <span>Reasonable Security Practices (IT Act &amp; DPDPA Section 8)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>1. Encryption in Transit &amp; at Rest</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Data in transit between your browser and {LEGAL_CONFIG.brandName} services is protected over encrypted HTTPS/TLS connections. Cloud records stored in Supabase are protected at rest by default provider-level infrastructure encryption. Offline POS cache and workspace preferences stored locally in your browser are not encrypted by the application.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>2. Role-Based Access Control (RBAC) &amp; Store Isolation</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Access is governed by authenticated user identity and a 4-level role hierarchy: Level 1 Super Admin, Level 2 {LEGAL_CONFIG.brandName} Admin, Level 3 Client / Business Owner, and Level 4 Store Crew. Database security policies and backend Bearer token checks enforce store-level tenant isolation, restrict Crew members to their assigned store and their own generated invoices (without discount or price-editing privileges), and restrict platform administration to authorized admin accounts.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>3. Offline-First Sync Safeguards</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Counter transactions recorded during internet disruptions are queued locally and reconciled with cloud ledgers upon reconnection. Store owners should use password-protected devices and sign out on shared terminals.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>4. Vulnerability Disclosure &amp; Incident Reporting</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      We encourage responsible reporting of potential security vulnerabilities. While {LEGAL_CONFIG.brandName} does not currently operate a paid bug bounty program, security issues can be reported through our Grievance Redressal form (under the &ldquo;Security Vulnerability or Incident Report&rdquo; category) or our Contact Support channel. Please do not access another store&apos;s data or disrupt service availability when reporting.
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectSlug('grievance-redressal')}
                      className="pt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Report a Security Issue →</span>
                    </button>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>5. Data Residency, Processing Locations &amp; Regional Options</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Structured store records are stored in Supabase, user sign-in accounts are managed by Supabase Authentication, and server-side API endpoints run on our hosted Node.js / Express backend on cloud infrastructure. Offline POS cache, UI preferences, and downloaded CSV/PDF/JSON exports remain on your local device. Optional website support chat prompts are answered by our own built-in support knowledge base and are not sent to a third-party AI service, and subscription checkout orders use Razorpay&apos;s API (when configured). {LEGAL_CONFIG.brandName} does not currently provide customer-selectable regional data residency options, and we do not claim that cloud-stored data resides exclusively within India or a single country.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>6. Public Security Incident History</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      No security incidents have been publicly disclosed by {LEGAL_CONFIG.brandName} to date, and there are currently no historical breach notices, public security advisories, or CVE disclosures recorded in our public security history. If a security incident requiring customer notification or public disclosure occurs in the future, its date, affected scope, and resolution summary will be documented here and on the main website&apos;s Incident History log without exposing sensitive customer or technical data.
                    </p>
                  </div>
                </div>

                {/* 7. Dedicated Penetration Testing Section (Mirroring SecurityComplianceSection.tsx) */}
                <section
                  id="penetration-testing-legal"
                  aria-labelledby="penetration-testing-legal-heading"
                  className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-5"
                >
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                        07 · Independent Security Assessments &amp; Audit Reports
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Third-Party Penetration Testing Status</span>
                    </div>
                    <h2
                      id="penetration-testing-legal-heading"
                      className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight"
                    >
                      Penetration Testing
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {LEGAL_CONFIG.brandName} has not completed or publicly disclosed an independent third-party penetration test or external application security audit to date. We state this clearly so business owners can distinguish between our internal engineering controls and formal external security assessments.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Card 1: Third-Party Penetration Testing Status */}
                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              01 · Third-Party Assessment Status
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Most Recent External Test Date: None Documented</span>
                          </div>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white leading-snug">
                            No third-party penetration test completed or disclosed to date
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {LEGAL_CONFIG.brandName} has not completed or publicly disclosed a third-party penetration test to date. No external testing organization, assessment date, vulnerability remediation retest, or external audit report is currently on record for the application.
                          </p>
                        </div>

                        <div className="pt-1 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                          <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                            Verified assessment particulars:
                          </div>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-slate-900 dark:text-white">External Testing Firm &amp; Assessment Date:</strong> None documented. We do not list unverified auditor names, test dates, or assessment scopes.
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-slate-900 dark:text-white">Internal Checks vs. Independent Penetration Testing:</strong> Internal development reviews, static TypeScript checks, and Database security policy configurations are part of maintaining the codebase, but they are not represented as an independent third-party penetration test.
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-slate-900 dark:text-white">Cloud Provider Infrastructure Distinction:</strong> Hosting database and authentication services on Supabase does not mean Google Cloud has penetration-tested or audited the {LEGAL_CONFIG.brandName} application code or business logic.
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                        <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
                          Important security note
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          The absence of a published penetration-test record is a factual disclosure of current assessment status and does not constitute a claim that the application is free of vulnerabilities.
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Penetration Test Report Availability & Future Updates */}
                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              02 · Report Availability &amp; Inquiries
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Status: No External Report Available</span>
                          </div>
                          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white leading-snug">
                            Availability of third-party security audit or penetration-test reports
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Because no third-party penetration test has been completed to date, <strong className="text-slate-900 dark:text-white">no independent penetration-test report or external audit summary is currently available for download or customer request</strong>.
                          </p>
                        </div>

                        <div className="pt-1 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                          <div className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider font-mono">
                            How report availability and inquiries are handled:
                          </div>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-slate-900 dark:text-white">No Unverified Report-Request Portal:</strong> We do not provide a synthetic &ldquo;Request Penetration Test Report&rdquo; button because no third-party assessment report currently exists.
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-slate-900 dark:text-white">When a Third-Party Assessment Is Completed:</strong> Once an independent security assessment is commissioned and completed, this section will be updated with the testing organization, assessment date, high-level scope, remediation status, and instructions for requesting the summary report.
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-slate-900 dark:text-white">Architecture &amp; Security Questions:</strong> If your business has questions about our current technical controls or future security assessment plans, you can reach out through our existing Contact Support channel.
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700/80">
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          Current Report Status: <strong className="text-slate-900 dark:text-white">Not Currently Available</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenContactModal) {
                              onOpenContactModal();
                            } else {
                              onSelectSlug('support');
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>Ask About Security Assessments</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                  <strong>Transparency Note:</strong> {LEGAL_CONFIG.brandName} implements industry-standard technical and organizational safeguards. We do not claim government certification, government approval, or absolute immunity from cyber threats, and we encourage merchants to maintain strong passwords and verified recovery credentials.
                </div>
              </article>
            )}

            {/* ============================================================== */}
            {/* 7. GRIEVANCE REDRESSAL (/grievance-redressal)                  */}
            {/* ============================================================== */}
            {activeSlug === 'grievance-redressal' && (
              <article className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Information Technology Rules &amp; DPDPA, 2023 Grievance Redressal Mechanism
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                    Grievance Redressal Mechanism
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Acknowledgment within {COMPLIANCE_APPLICABILITY_CONFIG.timelines.grievanceAcknowledgeHours} hours</span>
                    <span aria-hidden="true">·</span>
                    <span>Target resolution within {COMPLIANCE_APPLICABILITY_CONFIG.timelines.grievanceResolutionDays} days</span>
                  </div>
                </div>

                {/* Grievance Officer Contact Details Card (Pulled dynamically from LEGAL_CONFIG) */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    Grievance Officer &amp; Nodal Contact Particulars
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{LEGAL_CONFIG.grievanceOfficerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Designation:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{LEGAL_CONFIG.grievanceOfficerDesignation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Grievance Email:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{LEGAL_CONFIG.grievanceOfficerEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Grievance Phone:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{LEGAL_CONFIG.grievanceOfficerPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Legal Entity:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{LEGAL_CONFIG.legalBusinessName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Privacy Contact:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{LEGAL_CONFIG.privacyEmail}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 dark:text-slate-400 block">Registered / Business Address:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{LEGAL_CONFIG.businessAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Grievance Ticket Form */}
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    Lodge a Formal Grievance Ticket
                  </h2>

                  {grvSubmittedTicket && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Grievance Acknowledged (Ticket ID: {grvSubmittedTicket}):</strong> Your grievance has been registered with timestamp {new Date().toLocaleString()}. Please retain this Ticket ID for status tracking.
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Complainant Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={grvName}
                          onChange={(e) => setGrvName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Email or Mobile Phone *
                        </label>
                        <input
                          type="text"
                          required
                          value={grvContact}
                          onChange={(e) => setGrvContact(e.target.value)}
                          placeholder="email@domain.com or +91 ..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Grievance Category *
                        </label>
                        <select
                          value={grvCategory}
                          onChange={(e) => setGrvCategory(e.target.value as GrievanceTicketRecord['category'])}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                        >
                          <option value="privacy_dpdpa">Personal Data / Privacy Rights (DPDPA)</option>
                          <option value="billing_subscription">Subscription Billing / Refund Dispute</option>
                          <option value="account_access">Account Access / Role Authorization</option>
                          <option value="security_concern">Security Vulnerability or Incident Report</option>
                          <option value="other_grievance">Other Platform Grievance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Subject / Summary *
                        </label>
                        <input
                          type="text"
                          required
                          value={grvSubject}
                          onChange={(e) => setGrvSubject(e.target.value)}
                          placeholder="Brief summary of the issue"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Detailed Description of Grievance *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={grvDescription}
                        onChange={(e) => setGrvDescription(e.target.value)}
                        placeholder="Provide relevant dates, store account email, or transaction references..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Grievance &amp; Generate Ticket ID</span>
                    </button>
                  </form>
                </div>

                {grvTickets.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                      Your Registered Grievance Tickets
                    </h3>
                    <div className="space-y-2">
                      {grvTickets.map((t) => (
                        <div
                          key={t.ticketId}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {t.ticketId} · {t.subject}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400">
                              {t.complainantName} · {new Date(t.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            )}

            {/* ============================================================== */}
            {/* 8. HELP & SUPPORT CENTER (/support)                            */}
            {/* ============================================================== */}
            {activeSlug === 'support' && (
              <article className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Merchant Assistance, Onboarding &amp; Technical Help
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                    Help &amp; Support Center
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Get assistance with POS billing, barcode setup, offline synchronization, or account management.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div className="font-bold text-slate-950 dark:text-white">Direct Support Inquiry</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Reach our merchant support team for store setup, catalog migration, or billing questions.
                    </p>
                    {onOpenContactModal && (
                      <button
                        type="button"
                        onClick={onOpenContactModal}
                        className="pt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Open Contact Support →
                      </button>
                    )}
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div className="font-bold text-slate-950 dark:text-white">Platform Guidebook</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Explore step-by-step workflows for barcode billing, inventory batches, Khata ledgers, and GST sheets.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onBackToWebsite();
                        setTimeout(() => {
                          document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="pt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      View Interactive Guide →
                    </button>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div className="font-bold text-slate-950 dark:text-white">Formal Grievance Escalation</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      If a support issue or privacy request remains unresolved, escalate via our Grievance Redressal Officer channel.
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectSlug('grievance-redressal')}
                      className="pt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Lodge Grievance Ticket →
                    </button>
                  </div>
                </div>

                {/* Official Business & Support Contact Details (Dynamically rendered from LEGAL_CONFIG) */}
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-base font-bold text-slate-950 dark:text-white">
                      Official Contact &amp; Business Information ({LEGAL_CONFIG.brandName})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Legal Entity Name</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white break-words">
                        {LEGAL_CONFIG.legalBusinessName}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Support Email</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white break-words">
                        {LEGAL_CONFIG.supportEmail}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Support Phone</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white break-words">
                        {LEGAL_CONFIG.supportPhone}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Privacy Contact</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white break-words">
                        {LEGAL_CONFIG.privacyEmail}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold">
                        GSTIN / Corporate IDs
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white font-mono break-words">
                        GSTIN: {LEGAL_CONFIG.gstin}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold">
                        Grievance Officer
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white break-words">
                        {LEGAL_CONFIG.grievanceOfficerName} ({LEGAL_CONFIG.grievanceOfficerDesignation})
                      </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 font-semibold">
                        Registered / Business Address
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white break-words">
                        {LEGAL_CONFIG.businessAddress}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};
