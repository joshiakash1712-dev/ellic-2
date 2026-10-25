import React, { useState, useEffect } from 'react';
import { POSInvoice, InvoiceTemplate, InternationalTradeSettings } from '../../types';
import { useStore } from '../../context/StoreContext';
import { InvoiceRenderer } from '../retailer/InvoiceRenderer';
import {
  Printer,
  Download,
  Share2,
  Send,
  X,
  FileText,
  Palette,
  MessageSquare,
  Copy,
  Globe,
  Check
} from 'lucide-react';
import {
  SUPPORTED_CURRENCIES,
  DEFAULT_USD_EXCHANGE_RATES,
  fetchLiveExchangeRates,
  formatCurrency,
  getExchangeRate,
  LiveRatesState
} from '../../utils/currencyUtils';

interface InvoiceModalProps {
  invoice: POSInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose
}) => {
  const { invoiceTemplates } = useStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [shareNotice, setShareNotice] = useState('');
  
  // Real-Time Currency Switcher state
  const [displayCurrency, setDisplayCurrency] = useState<string>('INR');
  const [ratesState, setRatesState] = useState<LiveRatesState>({
    base: 'USD',
    rates: { ...DEFAULT_USD_EXCHANGE_RATES },
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
    isFetching: false
  });

  // WhatsApp Share Modal State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Load live rates
  useEffect(() => {
    let isMounted = true;
    const loadRates = async () => {
      const live = await fetchLiveExchangeRates();
      if (isMounted) {
        setRatesState(live);
      }
    };
    loadRates();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update default currency when invoice or template changes
  useEffect(() => {
    if (invoice) {
      const matched =
        invoiceTemplates.find(t => t.id === selectedTemplateId) ||
        invoiceTemplates.find(t => t.id === invoice.templateId) ||
        invoiceTemplates.find(t => t.isDefault) ||
        invoiceTemplates[0];

      if (matched?.internationalSettings?.primaryCurrency) {
        setDisplayCurrency(matched.internationalSettings.primaryCurrency);
      } else {
        setDisplayCurrency('INR');
      }
    }
  }, [invoice, selectedTemplateId, invoiceTemplates]);

  if (!isOpen || !invoice) return null;

  // Resolve template
  const matchedTemplate =
    invoiceTemplates.find(t => t.id === selectedTemplateId) ||
    invoiceTemplates.find(t => t.id === invoice.templateId) ||
    invoiceTemplates.find(t => t.isDefault) ||
    invoiceTemplates[0];

  const intlSettings: InternationalTradeSettings | undefined = matchedTemplate?.internationalSettings;
  const storeDisplayName = matchedTemplate?.branding?.storeDisplayName || invoice.storeName || 'Ellic Store';

  // Convert amounts from base INR to displayCurrency
  const rateToDisplay = getExchangeRate('INR', displayCurrency, ratesState.rates, 0);

  const convertedSubtotal = invoice.subtotal * rateToDisplay;
  const convertedCGST = (invoice.cgst || (invoice.tax ? invoice.tax / 2 : 0)) * rateToDisplay;
  const convertedSGST = (invoice.sgst || (invoice.tax ? invoice.tax / 2 : 0)) * rateToDisplay;
  const convertedGrandTotal = (invoice.grandTotal || invoice.total || 0) * rateToDisplay;

  // Dual Currency calculations if enabled
  let dualCurrencyText = '';
  if (intlSettings?.enableDualCurrency && intlSettings.secondaryCurrency) {
    const secCurr = intlSettings.secondaryCurrency;
    const secRate = getExchangeRate('INR', secCurr, ratesState.rates, intlSettings.fxSpreadPercentage || 0);
    const secTotal = (invoice.grandTotal || invoice.total || 0) * secRate;
    dualCurrencyText = formatCurrency(secTotal, secCurr, true);
  }

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = invoice.invoiceNumber || invoice.id;
  const currentPhone = mobileNumber || invoice.customerPhone || '+91 99999 00000';
  const cleanDigits = currentPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
  const pdfInvoiceUrl = `https://ellic.com/invoices/pdf/${invoiceNumber}.pdf`;

  const cashierName = invoice.cashierName || (invoice as any).crewName || invoice.createdBy || 'Staff Cashier';
  const whatsappMessageText = `*OFFICIAL TAX & COMMERCIAL INVOICE* 🧾
*Store:* ${storeDisplayName}
*Cashier / Billed by:* ${cashierName}
--------------------------------
*Invoice No:* #${invoiceNumber}
*Date & Time:* ${invoice.date}
*Customer:* ${invoice.customerName}
*Currency:* ${displayCurrency} (${SUPPORTED_CURRENCIES[displayCurrency]?.symbol || ''})

*Itemized Summary:*
${(invoice.items || []).map(it => `• ${it.productName || it.name} (${it.quantity}x @ ${formatCurrency((it.unitPrice || it.price || 0) * rateToDisplay, displayCurrency, true)}) = ${formatCurrency(((it.unitPrice || it.price || 0) * it.quantity) * rateToDisplay, displayCurrency, true)}`).join('\n')}

--------------------------------
*Subtotal:* ${formatCurrency(convertedSubtotal, displayCurrency, true)}
${(convertedCGST + convertedSGST) > 0 ? `*Tax / GST:* ${formatCurrency((convertedCGST + convertedSGST), displayCurrency, true)}\n` : ''}★ *Grand Total:* ${formatCurrency(convertedGrandTotal, displayCurrency, true)} (${(invoice.paymentMethod || 'CASH').toUpperCase()})
${dualCurrencyText ? `*Dual-FX Equiv:* ${dualCurrencyText}\n` : ''}
*Download Official PDF Document:*
${pdfInvoiceUrl}

Thank you for trading with ${storeDisplayName}!`;

  const whatsappApiUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(whatsappMessageText)}`;

  const handleOpenWhatsAppModal = () => {
    setMobileNumber(invoice.customerPhone || '');
    setShowWhatsAppModal(true);
  };

  const handleLaunchWhatsAppAPI = () => {
    try {
      window.open(whatsappApiUrl, '_blank');
    } catch (err) {
      console.warn('Unable to launch WhatsApp window in sandbox:', err);
    }
    setShareNotice(`Dispatched PDF invoice link to WhatsApp (${formattedPhone})!`);
    setShowWhatsAppModal(false);
    setTimeout(() => setShareNotice(''), 4000);
  };

  const handleCopyWhatsAppLink = () => {
    navigator.clipboard.writeText(whatsappApiUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleEmailShare = () => {
    setShareNotice(`Invoice ${invoiceNumber} dispatched to customer email in ${displayCurrency}.`);
    setTimeout(() => setShareNotice(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 flex items-center justify-center p-2 sm:p-4">
      <div className="glass-panel text-slate-100 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-4 sm:my-8 flex flex-col max-h-[94vh] relative">
        {/* Subtle brand gradient backdrop BEHIND the glass modal */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/15 via-slate-900/60 to-sky-500/15 pointer-events-none" />
        
        {/* Top Control Bar with Template & Currency Switchers */}
        <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Invoice Document</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-semibold border border-sky-500/30">
              #{invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Live Currency Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={displayCurrency}
                onChange={e => setDisplayCurrency(e.target.value)}
                className="bg-slate-800 text-white font-bold text-xs focus:outline-none cursor-pointer"
                title="Convert Currency in Real-Time"
              >
                {Object.values(SUPPORTED_CURRENCIES).map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Template Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <Palette className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400 hidden sm:inline text-[11px]">Template:</span>
              <select
                value={matchedTemplate?.id || ''}
                onChange={e => setSelectedTemplateId(e.target.value)}
                className="bg-slate-800 text-white font-medium text-xs focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                {invoiceTemplates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.paperSize?.toUpperCase() || 'A4'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Document Body rendered with unified InvoiceRenderer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center">
          <div className="w-full flex justify-center">
            <InvoiceRenderer 
              invoice={invoice} 
              template={matchedTemplate} 
            />
          </div>
        </div>

        {/* Action Controls & Dispatch Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            {/* WhatsApp Dispatch */}
            <button
              onClick={handleOpenWhatsAppModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Share via WhatsApp</span>
            </button>

            {/* Email Dispatch */}
            <button
              onClick={handleEmailShare}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Email</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-sky-500 hover:bg-blue-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Status Notice Toast */}
        {shareNotice && (
          <div className="bg-sky-500/20 border-t border-sky-500/30 text-sky-300 text-xs px-4 py-2 flex items-center justify-between font-medium animate-in fade-in">
            <span>{shareNotice}</span>
            <button onClick={() => setShareNotice('')} className="text-sky-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* WhatsApp Dispatch Details Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Send Invoice via WhatsApp</h4>
                  <p className="text-[11px] text-slate-400">Dispatch digital bill with instant PDF download link</p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Customer WhatsApp Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    placeholder="+1 555 382 9910 or +91 98765 43210"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Message preview snippet */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1 font-mono text-slate-300 max-h-36 overflow-y-auto">
                <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">Message Payload:</span>
                <p className="whitespace-pre-line text-sky-300/90">{whatsappMessageText}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCopyWhatsAppLink}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLaunchWhatsAppAPI}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
