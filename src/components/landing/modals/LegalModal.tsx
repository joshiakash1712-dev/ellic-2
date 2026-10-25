import React from 'react';
import { MarketingModal } from './MarketingModal';
import { EllixConnectLogo } from '../../branding/EllixConnectLogo';
import { ShieldCheck, FileText } from 'lucide-react';
import { LEGAL_CONFIG } from '../../../config/legal.config';

export type LegalDocType = 'privacy' | 'terms';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  const isPrivacy = type === 'privacy';

  return (
    <MarketingModal
      isOpen={isOpen}
      onClose={onClose}
      title={isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
      subtitle={`Effective: ${LEGAL_CONFIG.effectiveDate} · Version ${isPrivacy ? LEGAL_CONFIG.privacyPolicyVersion : LEGAL_CONFIG.termsVersion} · ${LEGAL_CONFIG.brandName}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
        {/* Brand Logo Header */}
        <div className="flex justify-center pb-1">
          <EllixConnectLogo size="sm" />
        </div>

        {isPrivacy ? (
          <>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <span>
                <strong>Your Business Data Belongs to You:</strong> Ellic does not sell, monetize, or share merchant customer lists, transaction ledgers, or inventory margins with third parties.
              </span>
            </div>

            <section className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                1. Information We Collect
              </h4>
              <p>
                When you use Ellic, we collect information necessary to operate your retail workspace, including store name, business identification, user account credentials, inventory catalog items, and sales transaction metadata.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                2. Data Storage, Residency &amp; Security
              </h4>
              <p>
                Data in transit between your device and Ellic services is protected using encrypted HTTPS/TLS connections, and cloud records stored in Supabase are protected at rest by provider-level infrastructure encryption. Cloud storage and processing occur on Supabase infrastructure under the platform’s project configuration (without customer-selectable regional residency options or an India-only storage guarantee), while offline counter transactions, preferences, and downloaded CSV/PDF exports remain on your local device.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                3. Customer Khata & Contact Information
              </h4>
              <p>
                Phone numbers and names collected at your register for digital receipts and credit Khata ledgers are used exclusively to deliver merchant billing notifications on your behalf.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                4. Data Portability & Export
              </h4>
              <p>
                Store owners maintain full rights to export their complete inventory catalog, customer transaction history, and tax ledger sheets at any time in standard CSV or PDF formats.
              </p>
            </section>
          </>
        ) : (
          <>
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
              <FileText className="w-4 h-4 shrink-0 text-slate-900 dark:text-white mt-0.5" />
              <span>
                <strong>Merchant Terms Summary:</strong> Reliable, continuous retail operations backed by our 99.99% core platform availability SLA.
              </span>
            </div>

            <section className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                1. Acceptance of Terms
              </h4>
              <p>
                By enrolling your store in Ellic or accessing the counter register software, you agree to these commercial terms governing multi-register licensing, support commitments, and operational policies.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                2. Subscription & Counter Licensing
              </h4>
              <p>
                Ellic is provided on a flexible month-to-month or annual store license. Each license allows unlimited product catalog entries, digital bills, and offline register caching.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                3. Operational Reliability & Offline Mode
              </h4>
              <p>
                While Ellic operates resilience mechanisms enabling continued billing during local network outages, merchants are responsible for maintaining compliant hardware (scanners, printers, power backup) at physical store counters.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                4. Tax Calculation Disclaimer
              </h4>
              <p>
                Ellic generates tax summaries according to the rates configured by the store owner. Merchants remain legally responsible for the final audit and submission of their local statutory tax filings.
              </p>
            </section>
          </>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </MarketingModal>
  );
};
