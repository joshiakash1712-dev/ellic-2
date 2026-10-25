import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Layers,
  Lock,
  MessageSquare,
  Minus,
  Package,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';

const DemoBadge: React.FC<{ label?: string }> = ({ label = 'DEMO · SAMPLE DATA' }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-sky-300 text-[10px] font-mono font-bold uppercase tracking-wider">
    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
    {label}
  </span>
);

/* ========================================================================== */
/* STEP 01 DEMO: MEET ELLIX CONNECT (BEFORE -> ELLIX CONNECT -> CONNECTED)   */
/* ========================================================================== */
export const Step01MeetDemo: React.FC = () => {
  const [viewMode, setViewMode] = useState<'before' | 'connected'>('connected');

  const disconnectedItems = [
    { title: 'Paper bills', detail: 'Handwritten or separate counter slips' },
    { title: 'Manual stock tracking', detail: 'Counted separately on shelves or registers' },
    { title: 'Scattered customer information', detail: 'Phone numbers & notes in different places' },
    { title: 'Separate records', detail: 'Payments & credit (Khata) tracked in separate books' },
  ];

  const connectedNodes = [
    { label: 'Bills', sub: 'Created at counter' },
    { label: 'Stock', sub: 'Updated with sales' },
    { label: 'Customers', sub: 'Linked to purchases' },
    { label: 'Payments', sub: 'Cash, Card, UPI, Split' },
    { label: 'Credit / Khata', sub: 'Balance tracked' },
    { label: 'Business Information', sub: 'Daily visibility' },
  ];

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Visual Transformation
          </span>
          <DemoBadge label="INTERACTIVE PREVIEW" />
        </div>
        <div className="inline-flex rounded-lg bg-[#0A0E1A] p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('before')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'before'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Before (Disconnected)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('connected')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'connected'
                ? 'bg-blue-500/20 text-sky-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            With Ellic
          </button>
        </div>
      </div>

      {/* Transformation Diagram: BEFORE -> ELLIC -> CONNECTED WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-3 items-center">
        {/* BEFORE Column */}
        <div
          onClick={() => setViewMode('before')}
          className={`lg:col-span-4 p-4 rounded-xl border transition-all cursor-pointer ${
            viewMode === 'before'
              ? 'bg-rose-950/25 border-rose-500/40 shadow-lg'
              : 'bg-[#0A0E1A]/80 border-slate-800/80 opacity-80 hover:opacity-100'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-2">
            BEFORE · DISCONNECTED METHODS
          </div>
          <div className="space-y-2">
            {disconnectedItems.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#121826] border border-slate-800/90">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>{item.title}</span>
                  {idx < disconnectedItems.length - 1 && (
                    <span className="text-[10px] font-mono text-rose-400">+</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Bridge: ELLIC */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center py-2 text-center">
          <div className="hidden lg:flex items-center justify-center w-full mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-rose-500/30 via-blue-500/60 to-sky-400" />
          </div>
          <ArrowDown className="w-4 h-4 text-sky-400 lg:hidden mb-1" />
          <div className="px-3.5 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/40 shadow-[0_0_20px_rgba(37,99,235,0.18)]">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-300">
              ELLIC
            </div>
            <div className="text-xs font-bold text-white mt-0.5">Unified Platform</div>
          </div>
          <ArrowDown className="w-4 h-4 text-sky-400 lg:hidden mt-1" />
          <div className="text-[10px] text-slate-400 mt-1.5">
            Links everyday operations together
          </div>
        </div>

        {/* AFTER Column: CONNECTED BUSINESS WORKFLOW */}
        <div
          onClick={() => setViewMode('connected')}
          className={`lg:col-span-4 p-4 rounded-xl border transition-all cursor-pointer ${
            viewMode === 'connected'
              ? 'bg-blue-950/25 border-blue-500/50 shadow-[0_0_24px_rgba(37,99,235,0.12)]'
              : 'bg-[#0A0E1A]/80 border-slate-800/80 opacity-80 hover:opacity-100'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center justify-between">
            <span>CONNECTED BUSINESS WORKFLOW</span>
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {connectedNodes.map((node, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#121826] border border-blue-500/25 flex flex-col justify-between"
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{node.label}</span>
                  <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{node.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* STEP 02 DEMO: SET UP YOUR BUSINESS (7-STAGE CONCEPTUAL SETUP FLOW)        */
/* ========================================================================== */
export const Step02SetupDemo: React.FC = () => {
  const setupStages = [
    {
      id: 'business',
      label: 'Business',
      icon: Building2,
      summary: 'Establish store name, address, contact details, and tax configuration.',
      sample: 'Store: Example General Store · City: Pune · Currency: INR (₹)',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      summary: 'Add the items you sell with unit prices, categories, and SKU/barcode codes.',
      sample: 'Catalog: Basmati Rice 5kg (₹540), Sunflower Oil 1L (₹165)',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Layers,
      summary: 'Set starting stock quantities and low-stock alert thresholds.',
      sample: 'Starting Stock: 25 units · Low-Stock Alert Threshold: 10 units',
    },
    {
      id: 'crew',
      label: 'Crew',
      icon: Users,
      summary: 'Add store staff members with role permissions for counter operations.',
      sample: 'Crew Role: Counter Cashier (Can create bills & record payments)',
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: Truck,
      summary: 'Maintain supplier records for restocking products when inventory runs low.',
      sample: 'Supplier: Metro Wholesale Distributors · Linked Categories: Grocery',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      summary: 'Keep customer contact records and optional Khata credit accounts organized.',
      sample: 'Customer Profile: Walk-in & Regular Store Customers',
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: Receipt,
      summary: 'Your counter is ready to generate bills and update connected records.',
      sample: 'Status: Ready for daily counter billing & payment recording',
    },
  ];

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const activeStage = setupStages[selectedIdx];

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="text-xs font-bold text-white">
            Business Owner Environment Setup Sequence
          </div>
          <div className="text-[11px] text-slate-400">
            Representative demonstration: actual private onboarding forms are only shown during client setup.
          </div>
        </div>
        <DemoBadge />
      </div>

      {/* 7-Step Flow Pills (Vertical on small screens, horizontal chain on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {setupStages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = idx === selectedIdx;
          const isPassed = idx <= selectedIdx;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.2)]'
                  : isPassed
                  ? 'bg-[#0A0E1A] border-blue-500/30 text-slate-200 hover:border-blue-500/50'
                  : 'bg-[#0A0E1A]/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-sky-400">
                  0{idx + 1}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
              </div>
              <div className="text-xs font-bold truncate">{stage.label}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Setup Stage Inspector */}
      <div className="p-4 rounded-xl bg-[#0A0E1A] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 text-[10px] font-mono font-bold">
              STAGE 0{selectedIdx + 1} OF 07
            </span>
            <h4 className="text-sm font-bold text-white">{activeStage.label}</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{activeStage.summary}</p>
          <div className="text-[11px] font-mono text-sky-400 pt-1">{activeStage.sample}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={selectedIdx === 0}
            onClick={() => setSelectedIdx((prev) => Math.max(0, prev - 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 disabled:opacity-40 cursor-pointer"
          >
            ← Prev Stage
          </button>
          <button
            type="button"
            onClick={() => setSelectedIdx((prev) => (prev + 1) % setupStages.length)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white cursor-pointer flex items-center gap-1"
          >
            <span>{selectedIdx === setupStages.length - 1 ? 'Restart Flow' : 'Next Stage'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* STEP 03 DEMO: PRODUCTS & INVENTORY (SALE 10 -> 9, RESTOCK 9 -> 19)        */
/* ========================================================================== */
export const Step03ProductsInventoryDemo: React.FC = () => {
  const [stock, setStock] = useState<number>(10);
  const [lastAction, setLastAction] = useState<string>('Initial sample stock loaded (10 units)');
  const minThreshold = 9;
  const isLowStock = stock <= minThreshold;

  const handleSimulateSale = () => {
    setStock((prev) => {
      const next = Math.max(0, prev - 1);
      setLastAction(`Sale recorded: ${prev} → ${next} units (-1 unit sold)`);
      return next;
    });
  };

  const handleSimulateRestock = () => {
    setStock((prev) => {
      const next = prev + 10;
      setLastAction(`Restock recorded: ${prev} → ${next} units (+10 units added)`);
      return next;
    });
  };

  const handleReset = () => {
    setStock(10);
    setLastAction('Reset to starting sample state (10 units)');
  };

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">
            Interactive Product & Stock Demonstration
          </span>
        </div>
        <DemoBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Sample Product Card */}
        <div className="md:col-span-7 p-4 rounded-xl bg-[#0A0E1A] border border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                SKU: DEMO-PRD-01 · Sample Item
              </span>
              <h4 className="text-base font-extrabold text-white mt-0.5">Example Product</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Unit Price: <strong className="text-white">₹1,000</strong> · Low-Stock Alert at ≤ {minThreshold} units
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                isLowStock
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-blue-500/15 border-blue-500/40 text-sky-300'
              }`}
            >
              {isLowStock ? 'Low Stock Alert' : 'In Stock (Healthy)'}
            </span>
          </div>

          {/* Live Stock Meter */}
          <div className="p-3 rounded-lg bg-[#121826] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Current Available Stock</div>
              <div className="text-xs font-mono text-sky-400 mt-0.5">{lastAction}</div>
            </div>
            <motion.div
              key={stock}
              initial={{ scale: 1.15, color: '#34d399' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.25 }}
              className="text-2xl sm:text-3xl font-black tabular-nums text-white"
            >
              {stock} <span className="text-xs font-normal text-slate-400">units</span>
            </motion.div>
          </div>
        </div>

        {/* Interactive Controls: Sale (10 -> 9) & Restock (9 -> 19) */}
        <div className="md:col-span-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleSimulateSale}
            disabled={stock === 0}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center justify-between transition-all cursor-pointer active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <Minus className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Sale (-1 unit)</span>
            </span>
            <span className="font-mono text-amber-300">
              {stock} → {Math.max(0, stock - 1)}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSimulateRestock}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-md shadow-blue-600/20 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Restock (+10 units)</span>
            </span>
            <span className="font-mono text-emerald-100">
              {stock} → {stock + 10}
            </span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2 px-3 rounded-lg bg-[#0A0E1A] hover:bg-slate-800/70 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to 10 Units</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* STEP 04 DEMO: CREATE A BILL & DIGITAL BILL DELIVERY                       */
/* ========================================================================== */
export const Step04CreateBillDemo: React.FC = () => {
  const [quantity, setQuantity] = useState<number>(1);
  const [applyDemoTax, setApplyDemoTax] = useState<boolean>(true);
  const [applyDiscount, setApplyDiscount] = useState<boolean>(false);
  const [deliveryMode, setDeliveryMode] = useState<'print' | 'digital'>('digital');

  const unitPrice = 1000;
  const lineSubtotal = unitPrice * quantity;
  const discountAmount = applyDiscount ? Math.round(lineSubtotal * 0.05) : 0;
  const taxableAmount = lineSubtotal - discountAmount;
  const taxAmount = applyDemoTax ? Math.round(taxableAmount * 0.18) : 0;
  const grandTotal = taxableAmount + taxAmount;

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">
            Interactive Bill Calculation & Delivery Preview
          </span>
        </div>
        <DemoBadge />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Bill Calculation Controls & Breakdown */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#0A0E1A] border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div>
              <div className="text-xs font-bold text-white">1. Selected: Example Product</div>
              <div className="text-[11px] text-slate-400">Base Price: ₹1,000 per unit</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">2. Qty:</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-bold text-white tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Optional Rule Toggles */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setApplyDemoTax((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                applyDemoTax
                  ? 'bg-blue-500/15 border-blue-500/40 text-sky-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              4. Demo Tax (18% Sample): {applyDemoTax ? 'Included' : 'Off'}
            </button>
            <button
              type="button"
              onClick={() => setApplyDiscount((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                applyDiscount
                  ? 'bg-blue-500/15 border-blue-500/40 text-sky-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              5. Sample 5% Discount Rule: {applyDiscount ? 'Applied' : 'Off'}
            </button>
          </div>

          {/* Live Calculation Lines */}
          <div className="p-3 rounded-lg bg-[#121826] border border-slate-800 space-y-1.5 text-xs tabular-nums">
            <div className="flex justify-between text-slate-300">
              <span>3. Product Line Total ({quantity} × ₹1,000)</span>
              <span className="font-bold text-white">₹{lineSubtotal.toLocaleString('en-IN')}</span>
            </div>
            {applyDiscount && (
              <div className="flex justify-between text-sky-400">
                <span>5. Sample Discount (5%)</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>4. Applicable Tax (Sample 18% Demonstration)</span>
              <span className="font-semibold text-white">₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline text-sm font-black text-white">
              <span>6. Total Generated</span>
              <span className="text-lg text-sky-400">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            * Tax calculation shown above is a sample demonstration. Applicable tax treatment depends on your specific business registration and product configuration.
          </p>
        </div>

        {/* Right: 7. Bill Ready & Digital / Print Delivery */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#0A0E1A] border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">7. Bill / Invoice Ready</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/15 text-sky-300 text-[10px] font-bold">
                BILL CREATED
              </span>
            </div>

            {/* Delivery Mode Selector */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeliveryMode('print')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  deliveryMode === 'print'
                    ? 'bg-blue-500/15 border-blue-500 text-white'
                    : 'bg-[#121826] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Printer className="w-4 h-4 text-sky-400 mb-1" />
                <div className="text-xs font-bold">Print Bill</div>
                <div className="text-[10px] text-slate-400">Thermal / standard print</div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMode('digital')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  deliveryMode === 'digital'
                    ? 'bg-blue-500/15 border-blue-500 text-white'
                    : 'bg-[#121826] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-sky-400 mb-1" />
                <div className="text-xs font-bold">Digital Delivery</div>
                <div className="text-[10px] text-slate-400">Digital / WhatsApp*</div>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#121826] border border-blue-500/30 text-xs space-y-1">
            <div className="font-bold text-sky-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                {deliveryMode === 'print'
                  ? 'Sample Print Preview Active'
                  : 'Sample Digital Invoice Preview Active'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              {deliveryMode === 'print'
                ? `Formatted receipt for ₹${grandTotal.toLocaleString('en-IN')} ready for counter printer.`
                : `Digital invoice summary for ₹${grandTotal.toLocaleString('en-IN')} ready to share (WhatsApp delivery available where required integration is configured).`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* STEP 05 DEMO: PAYMENTS (PENDING -> PAYMENT RECORDED -> COMPLETED)         */
/* ========================================================================== */
export const Step05PaymentsDemo: React.FC = () => {
  const paymentMethods = [
    { id: 'UPI', label: 'UPI', icon: QrCode, desc: 'Dynamic QR / UPI ID' },
    { id: 'Cash', label: 'Cash', icon: Wallet, desc: 'Counter cash drawer' },
    { id: 'Card', label: 'Card', icon: CreditCard, desc: 'Debit / Credit terminal' },
    { id: 'Split Payment', label: 'Split Payment', icon: Layers, desc: 'Combine Cash + UPI/Card' },
  ];

  const [selectedMethod, setSelectedMethod] = useState<string>('UPI');
  const [status, setStatus] = useState<'pending' | 'recorded' | 'completed'>('completed');

  const handleRecordPayment = (methodId: string) => {
    setSelectedMethod(methodId);
    setStatus('recorded');
    window.setTimeout(() => {
      setStatus('completed');
    }, 320);
  };

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">
            Payment Method & Transaction Status Demonstration
          </span>
        </div>
        <DemoBadge />
      </div>

      {/* Supported Payment Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {paymentMethods.map((pm) => {
          const Icon = pm.icon;
          const isSelected = selectedMethod === pm.id;
          return (
            <button
              key={pm.id}
              type="button"
              onClick={() => handleRecordPayment(pm.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                  : 'bg-[#0A0E1A] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className="w-4 h-4 text-sky-400" />
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
              </div>
              <div className="text-xs font-bold">{pm.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{pm.desc}</div>
            </button>
          );
        })}
      </div>

      {/* State Flow: Payment Pending -> Payment Recorded -> Completed */}
      <div className="p-3.5 rounded-xl bg-[#0A0E1A] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setStatus('pending')}
            className={`px-2.5 py-1 rounded-lg font-semibold border cursor-pointer transition-colors ${
              status === 'pending'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-[#121826] border-slate-800 text-slate-400'
            }`}
          >
            1. Payment Pending
          </button>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span
            className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors ${
              status === 'recorded'
                ? 'bg-blue-500/20 border-blue-500/50 text-sky-300'
                : 'bg-[#121826] border-slate-800 text-slate-400'
            }`}
          >
            2. Payment Recorded ({selectedMethod})
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span
            className={`px-2.5 py-1 rounded-lg font-bold border flex items-center gap-1.5 transition-all ${
              status === 'completed'
                ? 'bg-blue-500/20 border-blue-500 text-sky-300 shadow-[0_0_12px_rgba(37,99,235,0.25)]'
                : 'bg-[#121826] border-slate-800 text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            <span>3. Completed</span>
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Sample Bill ₹1,180 · Mode: <strong className="text-sky-400">{selectedMethod}</strong>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* STEP 06 DEMO: CUSTOMERS & KHATA (PREV ₹2,000 + ₹500 = ₹2,500)             */
/* ========================================================================== */
export const Step06CustomersKhataDemo: React.FC = () => {
  const [previousBalance, setPreviousBalance] = useState<number>(2000);
  const [transactionAmount, setTransactionAmount] = useState<number>(500);
  const [txType, setTxType] = useState<'credit' | 'repayment'>('credit');

  const updatedBalance =
    txType === 'credit'
      ? previousBalance + transactionAmount
      : Math.max(0, previousBalance - transactionAmount);

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">
            Customer Record & Khata Balance Demonstration
          </span>
        </div>
        <DemoBadge />
      </div>

      {/* Customer -> Purchase -> Transaction -> Customer Record */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        <div className="md:col-span-7 p-4 rounded-xl bg-[#0A0E1A] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-mono text-sky-400 uppercase">
                SAMPLE CUSTOMER RECORD
              </div>
              <div className="text-sm font-bold text-white">Example Customer</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1">
              <Lock className="w-3 h-3 text-sky-400" />
              Role-Scoped Access
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center tabular-nums">
            <div className="p-2.5 rounded-lg bg-[#121826] border border-slate-800">
              <div className="text-[10px] text-slate-400">Previous Balance</div>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                ₹{previousBalance.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#121826] border border-slate-800">
              <div className="text-[10px] text-slate-400">
                {txType === 'credit' ? 'Credit Purchase' : 'Repayment'}
              </div>
              <div
                className={`text-sm sm:text-base font-bold mt-0.5 ${
                  txType === 'credit' ? 'text-amber-400' : 'text-sky-400'
                }`}
              >
                {txType === 'credit' ? '+' : '-'}₹{transactionAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/40">
              <div className="text-[10px] text-sky-300 font-semibold">Updated Balance</div>
              <motion.div
                key={updatedBalance}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-sm sm:text-base font-black text-white mt-0.5"
              >
                ₹{updatedBalance.toLocaleString('en-IN')}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="md:col-span-5 p-4 rounded-xl bg-[#0A0E1A] border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="text-xs font-bold text-white">Simulate Khata Ledger Entry:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setTxType('credit');
                setTransactionAmount(500);
              }}
              className={`p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                txType === 'credit'
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                  : 'bg-[#121826] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              + ₹500 Credit Bill
            </button>
            <button
              type="button"
              onClick={() => {
                setTxType('repayment');
                setTransactionAmount(500);
              }}
              className={`p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                txType === 'repayment'
                  ? 'bg-blue-500/15 border-blue-500/50 text-sky-300'
                  : 'bg-[#121826] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              - ₹500 Repayment
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Customer information is strictly scoped to the business and accessible only according to assigned user role and permissions.
          </p>
        </div>
      </div>
    </div>
  );
};
