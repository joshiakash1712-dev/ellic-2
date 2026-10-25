import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  RefreshCw,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  Percent,
  Copy,
  Check,
  Building2,
  FileText,
  ShieldCheck,
  Calculator,
  Sliders,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Info,
  Layers,
  CheckCircle2
} from 'lucide-react';
import {
  SUPPORTED_CURRENCIES,
  DEFAULT_USD_EXCHANGE_RATES,
  fetchLiveExchangeRates,
  convertCurrency,
  formatCurrency,
  getExchangeRate,
  INCOTERMS_OPTIONS,
  LiveRatesState
} from '../../utils/currencyUtils';
import { CurrencyInfo } from '../../types';

interface CurrencyConverterToolProps {
  initialAmount?: number;
  initialBaseCurrency?: string;
  initialTargetCurrency?: string;
  onApplyToTemplate?: (settings: {
    primaryCurrency: string;
    secondaryCurrency: string;
    fxSpread: number;
  }) => void;
  className?: string;
}

export const CurrencyConverterTool: React.FC<CurrencyConverterToolProps> = ({
  initialAmount = 1374,
  initialBaseCurrency = 'USD',
  initialTargetCurrency = 'AED',
  onApplyToTemplate,
  className = ''
}) => {
  const [ratesState, setRatesState] = useState<LiveRatesState>({
    base: 'USD',
    rates: { ...DEFAULT_USD_EXCHANGE_RATES },
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
    isFetching: false
  });

  const [baseCurrency, setBaseCurrency] = useState<string>(initialBaseCurrency);
  const [targetCurrency, setTargetCurrency] = useState<string>(initialTargetCurrency);
  const [amount, setAmount] = useState<number>(initialAmount);
  const [wholesaleDiscountPercent, setWholesaleDiscountPercent] = useState<number>(0);
  const [fxSpreadPercent, setFxSpreadPercent] = useState<number>(0.5);
  const [includeTax, setIncludeTax] = useState<boolean>(true);
  const [customTaxRate, setCustomTaxRate] = useState<number>(
    SUPPORTED_CURRENCIES[initialTargetCurrency]?.defaultTaxRate ?? 5.0
  );
  const [useCustomTax, setUseCustomTax] = useState<boolean>(false);
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'converter' | 'matrix' | 'incoterms'>('converter');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Fetch real-time exchange rates on mount
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

  // Update target default tax rate when target currency changes
  useEffect(() => {
    if (!useCustomTax) {
      const defaultRate = SUPPORTED_CURRENCIES[targetCurrency]?.defaultTaxRate ?? 0;
      setCustomTaxRate(defaultRate);
    }
  }, [targetCurrency, useCustomTax]);

  const handleRefreshRates = async () => {
    setRatesState(prev => ({ ...prev, isFetching: true }));
    const live = await fetchLiveExchangeRates();
    setRatesState(live);
  };

  const handleSwapCurrencies = () => {
    const temp = baseCurrency;
    setBaseCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  const baseCurrInfo: CurrencyInfo = SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES.USD;
  const targetCurrInfo: CurrencyInfo = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.AED;

  // Calculation logic
  const discountAmountBase = (amount * wholesaleDiscountPercent) / 100;
  const netAmountBase = Math.max(0, amount - discountAmountBase);

  // Conversion with spread
  const spotRate = getExchangeRate(baseCurrency, targetCurrency, ratesState.rates, 0);
  const effectiveRate = getExchangeRate(baseCurrency, targetCurrency, ratesState.rates, fxSpreadPercent);
  const inverseRate = effectiveRate > 0 ? 1 / effectiveRate : 0;

  const convertedGross = amount * effectiveRate;
  const convertedDiscount = discountAmountBase * effectiveRate;
  const convertedNet = netAmountBase * effectiveRate;

  const appliedTaxRate = includeTax
    ? useCustomTax
      ? customTaxRate
      : (targetCurrInfo.defaultTaxRate ?? 0)
    : 0;

  const convertedTaxAmount = (convertedNet * appliedTaxRate) / 100;
  const convertedGrandTotal = convertedNet + convertedTaxAmount;

  // Multi-currency matrix data
  const matrixCurrencies = useMemo(() => {
    const list = Object.values(SUPPORTED_CURRENCIES);
    if (!searchFilter.trim()) return list;
    const q = searchFilter.toLowerCase();
    return list.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  const handleCopyQuotation = () => {
    const text = `🌐 *INTERNATIONAL WHOLESALE PRICE QUOTATION*
=========================================
• Base Currency: ${baseCurrInfo.code} (${baseCurrInfo.symbol})
• Target Currency: ${targetCurrInfo.code} (${targetCurrInfo.symbol} - ${targetCurrInfo.country})
• Live Exchange Rate: 1 ${baseCurrInfo.code} = ${effectiveRate.toFixed(4)} ${targetCurrInfo.code}
• Spot Interbank Rate: 1 ${baseCurrInfo.code} = ${spotRate.toFixed(4)} ${targetCurrInfo.code} (Spread: +${fxSpreadPercent}%)
-----------------------------------------
• Base Subtotal: ${formatCurrency(amount, baseCurrency, true)}
${wholesaleDiscountPercent > 0 ? `• Wholesale Discount (${wholesaleDiscountPercent}%): -${formatCurrency(discountAmountBase, baseCurrency, true)}\n` : ''}• Net Payable (${baseCurrency}): ${formatCurrency(netAmountBase, baseCurrency, true)}
-----------------------------------------
• Converted Net Total: ${formatCurrency(convertedNet, targetCurrency, true)}
${includeTax && appliedTaxRate > 0 ? `• ${targetCurrInfo.taxLabel || 'VAT/GST'} (${appliedTaxRate}%): +${formatCurrency(convertedTaxAmount, targetCurrency, true)}\n` : ''}★ FINAL PAYABLE TOTAL: ${formatCurrency(convertedGrandTotal, targetCurrency, true)}
=========================================
Generated via Ellic Global Wholesale Engine
Rates synced at: ${new Date(ratesState.lastUpdated).toLocaleDateString()} ${new Date(ratesState.lastUpdated).toLocaleTimeString()}`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  const handleApply = () => {
    if (onApplyToTemplate) {
      onApplyToTemplate({
        primaryCurrency: baseCurrency,
        secondaryCurrency: targetCurrency,
        fxSpread: fxSpreadPercent
      });
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Real-Time Currency & FX Wholesale Hub</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Spot FX
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cross-border price conversions, dual-currency billing, and international wholesale quotation calculations.
            </p>
          </div>
        </div>

        {/* Live sync status & refresh */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block">
              FX Source: <strong className="text-slate-200 uppercase">{ratesState.source}</strong>
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              {new Date(ratesState.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefreshRates}
            disabled={ratesState.isFetching}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-all flex items-center gap-1 text-xs font-semibold"
            title="Refresh Live Exchange Rates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${ratesState.isFetching ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="text-[11px]">Sync Rates</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('converter')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'converter'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Interactive Converter</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'matrix'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Multi-Currency Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('incoterms')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'incoterms'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Incoterms & Wire Guidelines</span>
        </button>
      </div>

      {/* Tab 1: Interactive Converter */}
      {activeTab === 'converter' && (
        <div className="p-5 space-y-5 bg-slate-900/60">
          
          {/* Main Currency Input & Output Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Base Currency Box */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Base (Source) Currency
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {baseCurrInfo.country}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={baseCurrency}
                    onChange={e => setBaseCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white font-bold rounded-xl py-2 pl-3 pr-8 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.flag} {curr.code} - {curr.name} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Invoice Subtotal Amount ({baseCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                    {baseCurrInfo.symbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Quick Amount Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[9px] text-slate-500 font-semibold">Presets:</span>
                {[500, 1374, 5000, 10000, 25000, 50000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                      amount === val
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {baseCurrInfo.symbol}{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Swap Button Center */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleSwapCurrencies}
                className="p-3 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500 transition-all shadow-lg hover:scale-110 group"
                title="Swap Base and Target Currency"
              >
                <ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="text-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 block">
                  1 {baseCurrency} =
                </span>
                <span className="text-xs font-mono font-black text-emerald-400">
                  {effectiveRate.toFixed(4)} {targetCurrency}
                </span>
              </div>
            </div>

            {/* Target Currency Box */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Target (Quoted) Currency
                </span>
                <span className="text-xs font-semibold text-teal-400">
                  {targetCurrInfo.country}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={targetCurrency}
                    onChange={e => setTargetCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white font-bold rounded-xl py-2 pl-3 pr-8 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.flag} {curr.code} - {curr.name} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Converted Payable ({targetCurrency})
                </label>
                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">{targetCurrInfo.code}</span>
                  <span className="text-lg font-mono font-black text-emerald-300">
                    {formatCurrency(convertedGrandTotal, targetCurrency)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Spot: 1 {baseCurrency} = {spotRate.toFixed(4)} {targetCurrency}</span>
                <span className="text-amber-400 font-medium">Spread Buffer: +{fxSpreadPercent}%</span>
              </div>
            </div>

          </div>

          {/* Wholesale Trade Parameters & Spread Sliders */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Wholesale Tier Discount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Wholesale Tier Discount:</span>
                </label>
                <span className="font-mono font-bold text-emerald-400">{wholesaleDiscountPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={wholesaleDiscountPercent}
                onChange={e => setWholesaleDiscountPercent(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0% (Retail)</span>
                <span>10% (B2B Bulk)</span>
                <span>25% (Distributor)</span>
              </div>
            </div>

            {/* Bank Forex Spread / Volatility Buffer */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Forex Margin / Buffer:</span>
                </label>
                <span className="font-mono font-bold text-amber-400">+{fxSpreadPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={fxSpreadPercent}
                onChange={e => setFxSpreadPercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0% (Exact Spot)</span>
                <span>0.5% (Standard)</span>
                <span>2.0% (High Volatility)</span>
              </div>
            </div>

            {/* Tax / VAT Estimation */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>Destination Tax / VAT:</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-400">
                  <input
                    type="checkbox"
                    checked={includeTax}
                    onChange={e => setIncludeTax(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span>Apply</span>
                </label>
              </div>

              {includeTax ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={appliedTaxRate}
                    onChange={e => {
                      setUseCustomTax(true);
                      setCustomTaxRate(Number(e.target.value) || 0);
                    }}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white"
                  />
                  <span className="text-[10px] text-slate-400 truncate">
                    % {targetCurrInfo.taxLabel || 'VAT'} ({targetCurrInfo.country})
                  </span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 py-1 italic">
                  Tax exempt / Zero-rated cross border supply
                </div>
              )}
            </div>

          </div>

          {/* Breakdown Ledger & Quotation Actions */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Detailed converted line items */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs flex-1">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Base Subtotal:</span>
                <span className="font-mono font-bold text-slate-200">
                  {formatCurrency(amount, baseCurrency, true)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Wholesale Discount:</span>
                <span className="font-mono font-bold text-rose-400">
                  -{formatCurrency(discountAmountBase, baseCurrency, true)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  {targetCurrInfo.taxLabel || 'VAT'} ({appliedTaxRate}%):
                </span>
                <span className="font-mono font-bold text-slate-300">
                  {formatCurrency(convertedTaxAmount, targetCurrency, true)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-emerald-400 block uppercase font-black">Final Quoted Total:</span>
                <span className="font-mono font-black text-emerald-300 text-sm">
                  {formatCurrency(convertedGrandTotal, targetCurrency, true)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyQuotation}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copiedQuote ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Quotation Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Quotation</span>
                  </>
                )}
              </button>

              {onApplyToTemplate && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply to Template</span>
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Multi-Currency Matrix */}
      {activeTab === 'matrix' && (
        <div className="p-5 space-y-4 bg-slate-900/60">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Global Multi-Currency Price Grid</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Live converted valuation of <strong className="text-white">{formatCurrency(netAmountBase, baseCurrency, true)}</strong> across all 20 international trading currencies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search currency or country..."
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[55vh] overflow-y-auto pr-1">
            {matrixCurrencies.map(curr => {
              const rate = getExchangeRate(baseCurrency, curr.code, ratesState.rates, fxSpreadPercent);
              const convertedVal = netAmountBase * rate;
              const isBase = curr.code === baseCurrency;
              const isTarget = curr.code === targetCurrency;

              return (
                <div
                  key={curr.code}
                  className={`p-3 rounded-xl border transition-all relative ${
                    isTarget
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : isBase
                      ? 'bg-blue-950/30 border-blue-500/50'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{curr.flag}</span>
                      <span className="text-xs font-bold text-white">{curr.code}</span>
                    </div>
                    {isBase && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-extrabold uppercase">
                        Base
                      </span>
                    )}
                    {isTarget && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold uppercase">
                        Quoted
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-400 truncate">{curr.name}</div>
                    <div className="text-sm font-mono font-black text-emerald-300">
                      {formatCurrency(convertedVal, curr.code)}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      1 {baseCurrency} = {rate.toFixed(curr.decimals > 2 ? curr.decimals : 3)} {curr.code}
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">{curr.taxLabel || 'Tax'}: {curr.defaultTaxRate}%</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetCurrency(curr.code);
                        setActiveTab('converter');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
                    >
                      <span>Select</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Tab 3: Incoterms & Wire Guidelines */}
      {activeTab === 'incoterms' && (
        <div className="p-5 space-y-4 bg-slate-900/60">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>International Wholesale Incoterms 2020 & Wire Compliance</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Standard commercial trade rules defining cost, risk, and insurance responsibilities for cross-border shipments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {INCOTERMS_OPTIONS.map(inco => (
              <div key={inco.code} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-500/30">
                    {inco.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{inco.name}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                  {inco.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Wire Transfer Box info */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">International Wire (SWIFT / BIC & IBAN) Settlement Best Practices:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When billing international corporate wholesalers, enable the <strong>SWIFT / IBAN Variable Field</strong> in your Invoice Template. Foreign financial institutions require exact BIC/SWIFT routing codes and IBAN formats for cross-border telegraphic transfer clearance.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
