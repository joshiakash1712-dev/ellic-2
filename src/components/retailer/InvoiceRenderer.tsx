import React from 'react';
import { InvoiceTemplate, POSInvoice } from '../../types';
import { numberToIndianWords } from '../../utils/numberToWords';
import { CheckCircle2, ShieldCheck, QrCode, Phone, Mail, Globe, MapPin, Building2, Landmark, Clock, Calendar } from 'lucide-react';

interface InvoiceRendererProps {
  template: InvoiceTemplate;
  invoice: POSInvoice;
  printMode?: boolean;
}

export const InvoiceRenderer: React.FC<InvoiceRendererProps> = ({ template, invoice, printMode = false }) => {
  const { branding, variableFields, columnSettings, additionalInfo, internationalSettings, templateStyle, paperSize } = template;
  
  // Normalize items using actual invoice item GST rates and amounts
  const items = (invoice.items || []).map((item: any, idx: number) => {
    const quantity = Number(item.quantity ?? 1);
    const price = Number(item.unitPrice ?? item.price ?? 0);
    const discount = Number(item.discount ?? item.discountAmount ?? 0);
    const taxRate = invoice.isGSTInvoice === false ? 0 : Number(item.taxRate ?? 0);
    const taxableValue = Number(Math.max(0, price * quantity - discount).toFixed(2));

    let cgstAmount: number;
    let sgstAmount: number;
    let taxAmount: number;

    if (invoice.isGSTInvoice === false) {
      cgstAmount = 0;
      sgstAmount = 0;
      taxAmount = 0;
    } else if (typeof item.taxAmount === 'number' && Number.isFinite(item.taxAmount)) {
      taxAmount = Number(item.taxAmount.toFixed(2));
      cgstAmount = Number((taxAmount / 2).toFixed(2));
      sgstAmount = Number((taxAmount - cgstAmount).toFixed(2));
    } else {
      const rawTax = (taxableValue * taxRate) / 100;
      cgstAmount = Number((rawTax / 2).toFixed(2));
      sgstAmount = Number((rawTax / 2).toFixed(2));
      taxAmount = Number((cgstAmount + sgstAmount).toFixed(2));
    }

    const lineTotal =
      typeof item.total === 'number' && Number.isFinite(item.total)
        ? Number(item.total.toFixed(2))
        : Number((taxableValue + taxAmount).toFixed(2));

    return {
      id: item.productId || item.id || `ITEM-${idx + 1}`,
      name: item.productName || item.name || 'Product Item',
      quantity,
      unitPrice: price,
      price,
      discount,
      taxableValue,
      taxRate,
      cgstAmount,
      sgstAmount,
      taxAmount,
      lineTotal,
      hsnCode: item.hsnCode || item.hsn || '2106',
      unit: item.unit || 'PCS'
    };
  });

  // Calculate item summaries from actual invoice fields and item data
  const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalDiscount = Number(
    (invoice.discountTotal ?? items.reduce((acc, item) => acc + (item.discount || 0), 0)).toFixed(2)
  );
  const subtotal = Number(
    (invoice.subtotal ?? items.reduce((acc, item) => acc + item.price * item.quantity, 0)).toFixed(2)
  );
  const taxableAmount = Number(
    ((invoice as any).taxableAmount ?? Math.max(0, subtotal - totalDiscount)).toFixed(2)
  );

  const cgstAmount =
    invoice.isGSTInvoice === false
      ? 0
      : typeof invoice.cgst === 'number'
      ? Number(invoice.cgst.toFixed(2))
      : Number(items.reduce((acc, item) => acc + item.cgstAmount, 0).toFixed(2));
  const sgstAmount =
    invoice.isGSTInvoice === false
      ? 0
      : typeof invoice.sgst === 'number'
      ? Number(invoice.sgst.toFixed(2))
      : Number(items.reduce((acc, item) => acc + item.sgstAmount, 0).toFixed(2));
  const igstAmount =
    invoice.isGSTInvoice === false
      ? 0
      : typeof invoice.igst === 'number'
      ? Number(invoice.igst.toFixed(2))
      : 0;
  const totalTax =
    invoice.isGSTInvoice === false
      ? 0
      : typeof (invoice as any).tax === 'number'
      ? Number((invoice as any).tax.toFixed(2))
      : typeof invoice.cgst === 'number' || typeof invoice.sgst === 'number' || typeof invoice.igst === 'number'
      ? Number((cgstAmount + sgstAmount + igstAmount).toFixed(2))
      : Number(items.reduce((acc, item) => acc + item.taxAmount, 0).toFixed(2));
  const grandTotal = Number(
    (invoice.grandTotal ?? (invoice as any).total ?? taxableAmount + totalTax).toFixed(2)
  );

  // Distinct GST rates & half-rates (CGST/SGST) for dynamic labels
  const distinctTaxRates = Array.from(
    new Set<number>(items.map(item => Number(item.taxRate) || 0))
  ).sort((a, b) => a - b);
  const halfRateSlabsLabel =
    distinctTaxRates.length > 0
      ? distinctTaxRates.map(r => `${Number((r / 2).toFixed(2))}%`).join(', ')
      : '0%';

  // Group items by taxRate for Tax Slabs Breakdown
  interface TaxSlabEntry {
    taxRate: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    taxAmount: number;
  }
  const taxSlabBreakdown: TaxSlabEntry[] = Array.from<TaxSlabEntry>(
    items
      .reduce((map, item) => {
        const rate = Number(item.taxRate) || 0;
        const existing: TaxSlabEntry = map.get(rate) || {
          taxRate: rate,
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          taxAmount: 0
        };
        existing.taxableAmount = Number((existing.taxableAmount + item.taxableValue).toFixed(2));
        existing.cgstAmount = Number((existing.cgstAmount + item.cgstAmount).toFixed(2));
        existing.sgstAmount = Number((existing.sgstAmount + item.sgstAmount).toFixed(2));
        existing.taxAmount = Number((existing.taxAmount + item.taxAmount).toFixed(2));
        map.set(rate, existing);
        return map;
      }, new Map<number, TaxSlabEntry>())
      .values()
  ).sort((a, b) => a.taxRate - b.taxRate);
  
  const invoiceId = invoice.invoiceNumber || invoice.id || 'INV-2026-0801';
  const customerName = invoice.customerName || 'Cash Customer';
  const customerPhone = invoice.customerPhone || '';
  const paymentMethod = (invoice.paymentMethod || 'cash').toUpperCase();
  const invoiceDate = invoice.date || '2026-08-01';
  const invoiceTime = (invoice as any).time || (invoice.date?.includes(' ') ? invoice.date.split(' ')[1] : '') || '14:30 PM';
  const cashierName = invoice.cashierName || (invoice as any).crewName || invoice.createdBy || 'Staff Cashier';
  const storeName = invoice.storeName || branding.storeDisplayName || 'Ellic Store';

  const previousBalance = additionalInfo?.previousBalance ?? 0;
  const receivedAmount = additionalInfo?.receivedAmount ?? (paymentMethod === 'CASH' || paymentMethod === 'UPI' ? grandTotal : 0);
  const balanceDue = Math.max(0, grandTotal + previousBalance - receivedAmount);
  const currentBalance = previousBalance + grandTotal - receivedAmount;

  // Custom column toggles with sensible defaults
  const cols = {
    sNo: columnSettings?.showSNo ?? true,
    name: columnSettings?.showItemName ?? true,
    desc: columnSettings?.showItemDesc ?? true,
    hsn: columnSettings?.showHSN ?? true,
    batch: columnSettings?.showBatchNo ?? false,
    exp: columnSettings?.showExpDate ?? false,
    mfg: columnSettings?.showMfgDate ?? false,
    qty: columnSettings?.showQuantity ?? true,
    mrp: columnSettings?.showMRP ?? false,
    price: columnSettings?.showUnitPrice ?? true,
    discount: columnSettings?.showDiscount ?? (variableFields.showItemDiscount ?? true),
    tax: columnSettings?.showTax ?? (variableFields.showItemTaxBreakdown ?? true),
    amount: columnSettings?.showAmount ?? true,
  };

  // Determine effective template style
  const effectiveStyle = templateStyle || (
    paperSize === 'thermal' || paperSize === 'thermal_3inch' ? 'thermal_3inch' :
    paperSize === 'thermal_2inch' ? 'thermal_2inch' :
    paperSize === 'a5_landscape' || paperSize === 'a5' ? 'a5_compact_box' :
    'a4_luxury_gold'
  );

  // -------------------------------------------------------------
  // 1. A4 LUXURY GOLD GST TAX INVOICE (With Vintage Ornament)
  // -------------------------------------------------------------
  if (effectiveStyle === 'a4_luxury_gold') {
    return (
      <div 
        id="invoice-print-area"
        className={`w-full bg-white text-slate-900 font-sans ${printMode ? 'p-4 print:p-0' : 'p-6 max-w-4xl mx-auto shadow-lg border border-amber-200'}`}
        style={{ minHeight: printMode ? 'auto' : '1050px' }}
      >
        {/* Luxury Gold Border Container */}
        <div className="relative border-2 border-amber-600/80 p-5 rounded-sm bg-gradient-to-b from-amber-50/20 via-white to-amber-50/10">
          
          {/* Corner Ornamental Accents */}
          <div className="absolute top-1 left-1 text-amber-600 text-xs select-none">❖━━━━</div>
          <div className="absolute top-1 right-1 text-amber-600 text-xs select-none">━━━━❖</div>
          <div className="absolute bottom-1 left-1 text-amber-600 text-xs select-none">❖━━━━</div>
          <div className="absolute bottom-1 right-1 text-amber-600 text-xs select-none">━━━━❖</div>

          {/* Top Header Row */}
          <div className="flex items-start justify-between border-b-2 border-amber-600/60 pb-4 mb-4">
            <div className="flex items-start gap-4">
              {branding.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt="Store Logo" 
                  className="w-16 h-16 object-contain rounded border border-amber-300 p-1 bg-white"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-800 font-bold text-xl">
                  {branding.storeDisplayName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-amber-900 uppercase">
                  {branding.storeDisplayName}
                </h1>
                {branding.headerTagline && (
                  <p className="text-xs font-semibold text-amber-700 mt-0.5">{branding.headerTagline}</p>
                )}
                <div className="mt-1 text-xs text-slate-600 space-y-0.5">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-700" /> Prasad Salai, Block 9, Chennai - 600006</p>
                  <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-amber-700" /> +91 98765 43210 &nbsp;|&nbsp; <Mail className="w-3 h-3 text-amber-700" /> billing@sktrading.com</p>
                  <div className="flex items-center gap-3 pt-0.5 text-slate-700">
                    {variableFields.showGSTIN && (
                      <span className="font-semibold text-amber-950">GSTIN: <span className="font-mono">33AAGCV9438G1Z7</span></span>
                    )}
                    {additionalInfo?.panNo && (
                      <span className="font-semibold text-amber-950">PAN: <span className="font-mono">{additionalInfo.panNo}</span></span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Title Badge */}
            <div className="text-right">
              <div className="inline-block bg-amber-700 text-white px-4 py-1.5 rounded font-black text-sm uppercase tracking-wider shadow-sm">
                {additionalInfo?.documentType || 'TAX INVOICE'}
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                {additionalInfo?.recipientType || 'ORIGINAL FOR RECIPIENT'}
              </p>
              <div className="mt-2 text-right text-xs space-y-0.5">
                <p><span className="text-slate-500 font-medium">Invoice No:</span> <span className="font-mono font-bold text-amber-950">{invoiceId}</span></p>
                <p><span className="text-slate-500 font-medium">Invoice Date:</span> <span className="font-bold">{invoiceDate}</span></p>
                <p><span className="text-slate-500 font-medium">Time:</span> <span className="font-mono">{invoiceTime}</span></p>
                <p><span className="text-slate-500 font-medium">Billed By:</span> <span className="font-bold text-amber-950">{cashierName}</span></p>
                <p><span className="text-slate-500 font-medium">Store:</span> <span className="font-semibold text-slate-800">{storeName}</span></p>
                {additionalInfo?.dueDate && (
                  <p><span className="text-slate-500 font-medium">Due Date:</span> <span className="font-bold text-rose-700">{additionalInfo.dueDate}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Bill To & Info Box */}
          <div className="grid grid-cols-2 gap-4 mb-4 bg-amber-50/50 p-3 rounded border border-amber-200 text-xs">
            <div>
              <p className="font-bold text-amber-900 uppercase tracking-wide text-[11px] mb-1">BILL TO (BUYER DETAILS)</p>
              <p className="font-bold text-sm text-slate-900">{customerName}</p>
              {customerPhone && (
                <p className="text-slate-600 mt-0.5">Phone: <span className="font-mono">{customerPhone}</span></p>
              )}
              <p className="text-slate-600">Address: 42 Market Yard Road, South Extension, New Delhi</p>
              <p className="text-slate-600">State / Code: Delhi (07)</p>
            </div>
            <div className="text-right flex flex-col justify-between">
              <div>
                <p className="font-bold text-amber-900 uppercase tracking-wide text-[11px] mb-1">PAYMENT & DISPATCH</p>
                <p className="text-slate-700">Mode of Payment: <span className="font-semibold text-slate-900">{paymentMethod}</span></p>
                {additionalInfo?.vehicleNo && (
                  <p className="text-slate-700">Vehicle No: <span className="font-mono font-semibold">{additionalInfo.vehicleNo}</span></p>
                )}
                {additionalInfo?.ewayBillNo && (
                  <p className="text-slate-700">E-Way Bill: <span className="font-mono font-semibold">{additionalInfo.ewayBillNo}</span></p>
                )}
              </div>
              {variableFields.customHeaderFieldLabel && (
                <div className="mt-1 pt-1 border-t border-amber-200/60">
                  <span className="text-amber-800 font-medium">{variableFields.customHeaderFieldLabel}: </span>
                  <span className="font-bold text-amber-950">{variableFields.customHeaderFieldValue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-4 border border-amber-400 rounded-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-amber-600 text-white font-bold text-[11px] uppercase tracking-wider">
                  {cols.sNo && <th className="py-2 px-2 border-r border-amber-500 w-10 text-center">S.No</th>}
                  {cols.name && <th className="py-2 px-3 border-r border-amber-500">Items / Particulars</th>}
                  {cols.hsn && <th className="py-2 px-2 border-r border-amber-500 text-center w-16">HSN</th>}
                  {cols.qty && <th className="py-2 px-2 border-r border-amber-500 text-center w-14">Qty</th>}
                  {cols.mrp && <th className="py-2 px-2 border-r border-amber-500 text-right w-16">MRP</th>}
                  {cols.price && <th className="py-2 px-2 border-r border-amber-500 text-right w-16">Rate (₹)</th>}
                  {cols.discount && <th className="py-2 px-2 border-r border-amber-500 text-right w-14">Disc</th>}
                  {cols.tax && <th className="py-2 px-2 border-r border-amber-500 text-right w-16">Tax %</th>}
                  {cols.amount && <th className="py-2 px-3 text-right w-24">Amount (₹)</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/60">
                {items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/25'}>
                    {cols.sNo && <td className="py-2 px-2 border-r border-amber-200/60 text-center text-slate-500 font-mono">{idx + 1}</td>}
                    {cols.name && (
                      <td className="py-2 px-3 border-r border-amber-200/60 font-semibold text-slate-900">
                        {item.name}
                        {cols.desc && (
                          <div className="text-[10px] text-slate-500 font-normal">
                            Premium pack • Batch #{item.id.slice(0, 5).toUpperCase()}
                          </div>
                        )}
                      </td>
                    )}
                    {cols.hsn && <td className="py-2 px-2 border-r border-amber-200/60 text-center text-slate-600 font-mono text-[11px]">{item.hsnCode || '2106'}</td>}
                    {cols.qty && <td className="py-2 px-2 border-r border-amber-200/60 text-center font-bold text-slate-800">{item.quantity} {item.unit || 'PCS'}</td>}
                    {cols.mrp && <td className="py-2 px-2 border-r border-amber-200/60 text-right text-slate-500 line-through">₹{(item.price * 1.15).toFixed(2)}</td>}
                    {cols.price && <td className="py-2 px-2 border-r border-amber-200/60 text-right font-mono text-slate-700">₹{item.price.toFixed(2)}</td>}
                    {cols.discount && <td className="py-2 px-2 border-r border-amber-200/60 text-right text-emerald-700 font-medium">₹{(item.discount || 0).toFixed(2)}</td>}
                    {cols.tax && <td className="py-2 px-2 border-r border-amber-200/60 text-right text-slate-600">{item.taxRate}%</td>}
                    {cols.amount && <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">₹{((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}</td>}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-amber-100/70 border-t-2 border-amber-400 font-bold text-slate-900">
                  <td colSpan={cols.sNo ? 2 : 1} className="py-2 px-3 border-r border-amber-300 uppercase tracking-wide text-amber-900">
                    Total Item Units: {totalQty}
                  </td>
                  {cols.hsn && <td className="border-r border-amber-300"></td>}
                  {cols.qty && <td className="py-2 px-2 border-r border-amber-300 text-center font-bold text-amber-950">{totalQty}</td>}
                  {cols.mrp && <td className="border-r border-amber-300"></td>}
                  {cols.price && <td className="border-r border-amber-300"></td>}
                  {cols.discount && <td className="py-2 px-2 border-r border-amber-300 text-right text-emerald-700">₹{totalDiscount.toFixed(2)}</td>}
                  {cols.tax && <td className="py-2 px-2 border-r border-amber-300 text-right">₹{totalTax.toFixed(2)}</td>}
                  {cols.amount && <td className="py-2 px-3 text-right text-sm font-black text-amber-950 font-mono">₹{grandTotal.toFixed(2)}</td>}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount In Words Banner */}
          {additionalInfo?.showAmountInWords !== false && (
            <div className="mb-4 bg-amber-50 p-2.5 rounded border border-amber-200 text-xs">
              <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Total Amount in Words: </span>
              <span className="font-bold text-amber-950 italic">{numberToIndianWords(grandTotal)}</span>
            </div>
          )}

          {/* Calculations & Settlement Block */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* Left Box: Terms & Conditions */}
            <div className="col-span-7 bg-white p-3 rounded border border-amber-200 text-[11px] space-y-1">
              <p className="font-bold text-amber-900 uppercase tracking-wide text-[10px]">Terms & Conditions</p>
              <div className="text-slate-600 whitespace-pre-line leading-relaxed text-[10px]">
                {branding.termsAndConditions}
              </div>
            </div>

            {/* Right Box: Tax & Final Calculation */}
            <div className="col-span-5 bg-amber-50/70 p-3 rounded border border-amber-300 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount:</span>
                <span className="font-mono font-medium">₹{taxableAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST ({halfRateSlabsLabel}):</span>
                <span className="font-mono font-medium">₹{cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST ({halfRateSlabsLabel}):</span>
                <span className="font-mono font-medium">₹{sgstAmount.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Total Savings / Discount:</span>
                  <span className="font-mono">-₹{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-1.5 border-t-2 border-amber-400 flex justify-between text-base font-black text-amber-950">
                <span>Grand Total:</span>
                <span className="font-mono text-lg">₹{grandTotal.toFixed(2)}</span>
              </div>
              
              {/* Settlement summary */}
              <div className="pt-1.5 border-t border-dashed border-amber-300 text-[11px] space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Received Amount:</span>
                  <span className="font-mono font-semibold text-emerald-700">₹{receivedAmount.toFixed(2)}</span>
                </div>
                {previousBalance > 0 && (
                  <div className="flex justify-between">
                    <span>Previous Balance:</span>
                    <span className="font-mono text-slate-600">₹{previousBalance.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-amber-950">
                  <span>Current Balance Due:</span>
                  <span className="font-mono">₹{currentBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Grid: Bank Details + UPI QR Code + Signatory */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t-2 border-amber-600/60 text-xs">
            {/* Bank Details */}
            <div className="bg-amber-50/40 p-2.5 rounded border border-amber-200">
              <p className="font-bold text-amber-900 uppercase tracking-wide text-[10px] mb-1 flex items-center gap-1">
                <Landmark className="w-3 h-3 text-amber-700" /> Bank Account Details
              </p>
              <div className="text-[11px] text-slate-700 space-y-0.5 font-mono">
                <p><span className="text-slate-500 font-sans font-normal">Bank:</span> {additionalInfo?.bankName || 'State Bank of India, NARAINA'}</p>
                <p><span className="text-slate-500 font-sans font-normal">A/C Name:</span> {additionalInfo?.accountHolder || 'SK TRADING COMPANY'}</p>
                <p><span className="text-slate-500 font-sans font-normal">A/C No:</span> <span className="font-bold text-amber-950">{additionalInfo?.accountNo || '3425322435376423'}</span></p>
                <p><span className="text-slate-500 font-sans font-normal">IFSC:</span> <span className="font-bold text-amber-950">{additionalInfo?.ifscCode || 'SBIN0001703'}</span></p>
              </div>
            </div>

            {/* UPI QR Code */}
            <div className="bg-amber-50/40 p-2.5 rounded border border-amber-200 flex items-center gap-3">
              <div className="w-16 h-16 bg-white p-1 rounded border border-amber-300 shadow-sm flex-shrink-0 flex items-center justify-center">
                <QrCode className="w-14 h-14 text-amber-900" />
              </div>
              <div className="text-[10px] text-slate-700 space-y-0.5">
                <p className="font-bold text-amber-900 uppercase tracking-wide text-[10px]">Scan & Pay via UPI</p>
                <div className="flex items-center gap-1.5 py-0.5 text-slate-600 font-bold text-[9px]">
                  <span className="bg-amber-100 text-amber-800 px-1 rounded">GPay</span>
                  <span className="bg-purple-100 text-purple-800 px-1 rounded">PhonePe</span>
                  <span className="bg-sky-100 text-sky-800 px-1 rounded">Paytm</span>
                </div>
                <p className="font-mono text-slate-800 font-semibold break-all">{additionalInfo?.upiId || '3425322435376423@ybl'}</p>
              </div>
            </div>

            {/* Authorized Signatory */}
            <div className="bg-amber-50/40 p-2.5 rounded border border-amber-200 flex flex-col justify-between text-right">
              <p className="text-[10px] text-slate-600 font-medium uppercase">
                For <span className="font-bold text-amber-950">{branding.storeDisplayName}</span>
              </p>
              <div className="py-2 flex justify-end">
                <div className="font-serif italic text-amber-800 text-lg font-bold select-none pr-4">
                  Rohit Prasad
                </div>
              </div>
              <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider border-t border-amber-300 pt-1">
                Authorized Signatory
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="mt-3 pt-2 text-center text-[10px] text-slate-500 border-t border-amber-200 font-medium">
            {branding.footerNote}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. A4 MODERN CUSTOMIZABLE BLUEPRINT TEMPLATE (Image 3 style)
  // -------------------------------------------------------------
  if (effectiveStyle === 'a4_modern_custom') {
    return (
      <div 
        id="invoice-print-area"
        className={`w-full bg-white text-slate-900 font-sans ${printMode ? 'p-4 print:p-0' : 'p-6 max-w-4xl mx-auto shadow-md border border-slate-200'}`}
        style={{ minHeight: printMode ? 'auto' : '1050px' }}
      >
        {/* Header with Blueprint Tag */}
        <div className="flex items-start justify-between border-b-2 border-sky-600 pb-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {branding.storeDisplayName.charAt(0)}
            </div>
            <div>
              <div className="inline-block bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                Business Details
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{branding.storeDisplayName}</h1>
              <p className="text-xs text-slate-600 font-medium">{branding.headerTagline}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">GSTIN: 07AAGCV9438G1Z7 • State: Delhi (07)</p>
            </div>
          </div>

          <div className="text-right">
            <div className="bg-slate-900 text-white px-3 py-1 rounded text-sm font-black uppercase tracking-wider inline-block">
              TAX INVOICE
            </div>
            <div className="mt-2 text-xs space-y-0.5 text-right font-medium">
              <p><span className="text-slate-500">Invoice No:</span> <span className="font-bold font-mono">{invoiceId}</span></p>
              <p><span className="text-slate-500">Date:</span> <span className="font-bold">{invoiceDate}</span></p>
              <p><span className="text-slate-500">Time:</span> <span className="font-mono text-slate-600">{invoiceTime}</span></p>
              <p><span className="text-slate-500">Cashier:</span> <span className="font-bold text-sky-800">{cashierName}</span></p>
              <p><span className="text-slate-500">Store:</span> <span className="font-medium text-slate-800">{storeName}</span></p>
            </div>
          </div>
        </div>

        {/* 2-Column Parties */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-1">BILL TO (PARTY)</p>
            <p className="font-bold text-sm text-slate-900">{customerName}</p>
            {customerPhone && <p className="text-slate-600 mt-0.5 font-mono">Phone: {customerPhone}</p>}
            <p className="text-slate-600">Address: 12 Commercial Complex, Connaught Place, New Delhi</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-1">SHIP TO / DISPATCH</p>
            <p className="font-bold text-sm text-slate-900">{customerName}</p>
            <p className="text-slate-600 mt-0.5">Shipping Method: Express Surface Courier</p>
            <p className="text-slate-600">Place of Supply: Delhi (07)</p>
          </div>
        </div>

        {/* Multi-Column Item Table */}
        <div className="overflow-x-auto mb-4 border border-slate-300 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sky-700 text-white font-bold text-[11px] uppercase tracking-wider">
                {cols.sNo && <th className="py-2.5 px-2 text-center w-10 border-r border-sky-600">NO.</th>}
                {cols.name && <th className="py-2.5 px-3 border-r border-sky-600">ITEMS</th>}
                {cols.hsn && <th className="py-2.5 px-2 text-center w-16 border-r border-sky-600">HSN</th>}
                {cols.batch && <th className="py-2.5 px-2 text-center w-16 border-r border-sky-600">BATCH</th>}
                {cols.exp && <th className="py-2.5 px-2 text-center w-16 border-r border-sky-600">EXP.</th>}
                {cols.mfg && <th className="py-2.5 px-2 text-center w-16 border-r border-sky-600">MFG.</th>}
                {cols.qty && <th className="py-2.5 px-2 text-center w-16 border-r border-sky-600">QUANTITY</th>}
                {cols.price && <th className="py-2.5 px-2 text-right w-20 border-r border-sky-600">PRICE/ITEM</th>}
                {cols.discount && <th className="py-2.5 px-2 text-right w-16 border-r border-sky-600">DISCOUNT</th>}
                {cols.amount && <th className="py-2.5 px-3 text-right w-24">TOTAL (₹)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  {cols.sNo && <td className="py-2 px-2 text-center font-mono text-slate-500 border-r border-slate-200">{idx + 1}</td>}
                  {cols.name && (
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900">
                      {item.name}
                      {cols.desc && <div className="text-[10px] text-slate-500 font-normal">Standard packaging item</div>}
                    </td>
                  )}
                  {cols.hsn && <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-200">{item.hsnCode || '8471'}</td>}
                  {cols.batch && <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-200">B-{idx + 101}</td>}
                  {cols.exp && <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-200">12/28</td>}
                  {cols.mfg && <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-200">01/26</td>}
                  {cols.qty && <td className="py-2 px-2 text-center font-bold text-slate-800 border-r border-slate-200">{item.quantity} {item.unit || 'PCS'}</td>}
                  {cols.price && <td className="py-2 px-2 text-right font-mono text-slate-700 border-r border-slate-200">₹{item.price.toFixed(2)}</td>}
                  {cols.discount && <td className="py-2 px-2 text-right font-mono text-emerald-600 border-r border-slate-200">₹{(item.discount || 0).toFixed(2)}</td>}
                  {cols.amount && <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}</td>}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-sky-50 border-t-2 border-sky-300 font-bold text-slate-900">
                <td colSpan={cols.sNo ? 2 : 1} className="py-2.5 px-3 border-r border-sky-200 uppercase text-sky-900">
                  Sub Total
                </td>
                {cols.hsn && <td className="border-r border-sky-200"></td>}
                {cols.batch && <td className="border-r border-sky-200"></td>}
                {cols.exp && <td className="border-r border-sky-200"></td>}
                {cols.mfg && <td className="border-r border-sky-200"></td>}
                {cols.qty && <td className="py-2 px-2 text-center border-r border-sky-200 font-bold text-sky-950">{totalQty}</td>}
                {cols.price && <td className="border-r border-sky-200"></td>}
                {cols.discount && <td className="py-2 px-2 text-right border-r border-sky-200 text-emerald-700">₹{totalDiscount.toFixed(2)}</td>}
                {cols.amount && <td className="py-2.5 px-3 text-right font-black text-sky-950 font-mono text-sm">₹{grandTotal.toFixed(2)}</td>}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* GST Tax Slabs & Total */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Tax Slabs Breakdown</p>
            <div className="text-[11px] space-y-1 text-slate-600">
              {taxSlabBreakdown.map(slab => {
                const halfRate = Number((slab.taxRate / 2).toFixed(2));
                return (
                  <div key={slab.taxRate} className="flex justify-between">
                    <span>
                      {igstAmount > 0
                        ? `IGST @ ${slab.taxRate}%:`
                        : `GST @ ${slab.taxRate}% (CGST ${halfRate}%: ₹${slab.cgstAmount.toFixed(2)} + SGST ${halfRate}%: ₹${slab.sgstAmount.toFixed(2)}):`}
                    </span>
                    <span className="font-mono">₹{slab.taxAmount.toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-200">
                <span>Total Tax Amount:</span> <span className="font-mono">₹{totalTax.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 text-white flex flex-col justify-between">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Payment Mode:</span>
              <span className="font-bold uppercase text-sky-300">{paymentMethod}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-700">
              <span className="text-sm font-bold text-slate-200 uppercase">Grand Total:</span>
              <span className="text-xl font-black font-mono text-sky-400">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-300 text-xs">
          <div className="p-2.5 rounded border border-slate-200">
            <p className="font-bold text-slate-800 uppercase text-[10px] mb-1">Bank Information</p>
            <p className="text-[11px] text-slate-600 font-mono">HDFC Bank • A/C 50200012345678 • HDFC0000123</p>
          </div>
          <div className="p-2.5 rounded border border-slate-200 flex items-center gap-2">
            <QrCode className="w-8 h-8 text-sky-800" />
            <div className="text-[10px] text-slate-600">
              <p className="font-bold text-slate-800">Scan & Pay UPI</p>
              <p className="font-mono font-semibold">business@okhdfcbank</p>
            </div>
          </div>
          <div className="p-2.5 rounded border border-slate-200 text-right">
            <p className="text-[10px] text-slate-500 uppercase">Authorized Signature</p>
            <p className="font-serif italic font-bold text-slate-800 text-base mt-1">Verified Manager</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. A5 LANDSCAPE COMPACT BOX GRID ("Shree Raju Agencies" format)
  // -------------------------------------------------------------
  if (effectiveStyle === 'a5_compact_box') {
    return (
      <div 
        id="invoice-print-area"
        className={`w-full bg-white text-slate-900 font-sans ${printMode ? 'p-3 print:p-0' : 'p-5 max-w-4xl mx-auto shadow-md border-2 border-slate-800'}`}
        style={{ minHeight: printMode ? 'auto' : '620px' }}
      >
        {/* Top Header Bar */}
        <div className="flex justify-between items-center bg-slate-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
          <span>{additionalInfo?.documentType || 'BILL OF SUPPLY'}</span>
          <span className="text-slate-300">{additionalInfo?.recipientType || 'ORIGINAL FOR RECIPIENT'}</span>
          <span className="text-amber-400 font-medium">Trusted for quality</span>
        </div>

        {/* Store Details Box */}
        <div className="flex items-center justify-between border-2 border-slate-800 p-2.5 mb-2 bg-slate-50/50">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-12 h-12 bg-slate-800 text-white rounded flex items-center justify-center font-black text-lg">
                {branding.storeDisplayName.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">{branding.storeDisplayName}</h2>
              <p className="text-[11px] text-slate-600">Prasad Salai, Block 9, Chennai - 600006</p>
              <p className="text-[11px] text-slate-600">Mobile: <span className="font-mono font-semibold">+91 98765 43210</span> &nbsp;|&nbsp; PAN: <span className="font-mono font-bold text-slate-900">{additionalInfo?.panNo || 'GGSDU9603R'}</span></p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold text-slate-700">Invoice Date: <span className="font-mono text-slate-900">{invoiceDate}</span></p>
            <p className="text-slate-600">Time: <span className="font-mono text-slate-900">{invoiceTime}</span></p>
            <p className="text-slate-600">Due Date: <span className="font-mono text-slate-900">{additionalInfo?.dueDate || '07/12/2026'}</span></p>
          </div>
        </div>

        {/* 2-Box Split Row: BILL TO | INVOICE DETAILS */}
        <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
          <div className="border-2 border-slate-800 p-2">
            <p className="font-bold text-[10px] uppercase tracking-wider text-slate-600 mb-0.5">BILL TO</p>
            <p className="font-black text-sm text-slate-900">{customerName}</p>
            {customerPhone && <p className="text-slate-600 font-mono">Mobile: {customerPhone}</p>}
            <p className="text-slate-600">Chennai, Tamil Nadu</p>
          </div>
          <div className="border-2 border-slate-800 p-2 text-right">
            <p className="font-bold text-[10px] uppercase tracking-wider text-slate-600 mb-0.5">INVOICE METADATA</p>
            <p className="text-slate-700">Invoice No: <span className="font-mono font-bold text-sm text-slate-900">{invoiceId}</span></p>
            <p className="text-slate-600">Payment: <span className="font-semibold text-slate-900">{paymentMethod}</span></p>
            <p className="text-slate-600">Cashier: <span className="font-bold text-slate-900">{cashierName}</span></p>
            <p className="text-slate-600">Store: <span className="font-medium text-slate-800">{storeName}</span></p>
          </div>
        </div>

        {/* Compact Table */}
        <div className="border-2 border-slate-800 mb-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white font-bold text-[10px] uppercase">
                <th className="py-1.5 px-2 text-center w-12 border-r border-slate-700">S.NO.</th>
                <th className="py-1.5 px-3 border-r border-slate-700">ITEMS</th>
                <th className="py-1.5 px-3 text-center w-20 border-r border-slate-700">QTY.</th>
                <th className="py-1.5 px-3 text-right w-28">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {items.map((item, idx) => (
                <tr key={idx} className="text-slate-900">
                  <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300">{idx + 1}</td>
                  <td className="py-1.5 px-3 border-r border-slate-300 font-semibold">{item.name}</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono border-r border-slate-300">{item.quantity} {item.unit || 'PCS'}</td>
                  <td className="py-1.5 px-3 text-right font-bold font-mono">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-800 font-black text-slate-900">
                <td colSpan={2} className="py-1.5 px-3 border-r border-slate-800 uppercase">TOTAL UNITS: {totalQty}</td>
                <td className="py-1.5 px-3 text-center border-r border-slate-800 font-mono">{totalQty}</td>
                <td className="py-1.5 px-3 text-right font-mono text-sm">₹{grandTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 4-Box Settlement Bar */}
        <div className="grid grid-cols-4 gap-2 mb-2 text-xs">
          <div className="border-2 border-slate-800 p-1.5 text-center bg-slate-50">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">Received Amount</span>
            <span className="font-mono font-black text-emerald-700 text-sm">₹{receivedAmount.toFixed(2)}</span>
          </div>
          <div className="border-2 border-slate-800 p-1.5 text-center bg-slate-50">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">Balance Amount</span>
            <span className="font-mono font-black text-rose-700 text-sm">₹{balanceDue.toFixed(2)}</span>
          </div>
          <div className="border-2 border-slate-800 p-1.5 text-center bg-slate-50">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">Previous Balance</span>
            <span className="font-mono font-bold text-slate-700 text-sm">₹{previousBalance.toFixed(2)}</span>
          </div>
          <div className="border-2 border-slate-800 p-1.5 text-center bg-slate-900 text-white">
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Current Balance</span>
            <span className="font-mono font-black text-amber-400 text-sm">₹{currentBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* 3-Box Footer Grid: Bank | QR | Terms */}
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="border-2 border-slate-800 p-2">
            <p className="font-bold text-slate-900 uppercase text-[9px] mb-0.5">Bank Details</p>
            <p className="font-mono text-slate-700 leading-tight">SBI • A/C: {additionalInfo?.accountNo || '377244297135925'}</p>
            <p className="font-mono text-slate-700">IFSC: {additionalInfo?.ifscCode || 'SBIN0000800'}</p>
          </div>
          <div className="border-2 border-slate-800 p-2 flex items-center gap-2">
            <QrCode className="w-8 h-8 text-slate-800 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 uppercase text-[9px]">Payment QR</p>
              <p className="font-mono font-semibold text-slate-800">{additionalInfo?.upiId || '7777333333@ybl'}</p>
            </div>
          </div>
          <div className="border-2 border-slate-800 p-2">
            <p className="font-bold text-slate-900 uppercase text-[9px] mb-0.5">Terms and Conditions</p>
            <p className="text-slate-600 text-[9px] leading-tight">Goods once sold will not be returned. Subject to Chennai jurisdiction.</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. A5 LANDSCAPE HARDWARE & TRANSPORT GRID ("Shree Balaji Hardware")
  // -------------------------------------------------------------
  if (effectiveStyle === 'a5_hardware_transport') {
    return (
      <div 
        id="invoice-print-area"
        className={`w-full bg-white text-slate-900 font-sans ${printMode ? 'p-3 print:p-0' : 'p-5 max-w-4xl mx-auto shadow-md border-2 border-sky-800'}`}
        style={{ minHeight: printMode ? 'auto' : '640px' }}
      >
        {/* Top Header Bar */}
        <div className="flex justify-between items-center bg-sky-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
          <span>TAX INVOICE</span>
          <span className="text-sky-200">ORIGINAL FOR RECIPIENT</span>
          <span className="text-amber-300 font-medium">Most affordable Hardware store in town</span>
        </div>

        {/* Store Details Header */}
        <div className="border-2 border-sky-800 p-2.5 mb-2 flex items-center justify-between bg-sky-50/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-sky-700 text-white flex items-center justify-center font-black text-xl">
              {branding.storeDisplayName.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-sky-950 tracking-tight">{branding.storeDisplayName}</h2>
              <p className="text-[11px] text-slate-600">Gol Chauraha, Indore, Madhya Pradesh</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-700 pt-0.5">
                <span>GSTIN: <span className="font-mono font-bold text-sky-950">23YTERW9603R1Z4</span></span>
                <span>PAN: <span className="font-mono font-bold text-sky-950">{additionalInfo?.panNo || 'YTERW9603R'}</span></span>
              </div>
            </div>
          </div>
          <div className="text-right text-xs space-y-0.5">
            <p><span className="text-slate-500">Invoice No:</span> <span className="font-mono font-bold text-sky-950">{invoiceId}</span></p>
            <p><span className="text-slate-500">Invoice Date:</span> <span className="font-bold">{invoiceDate}</span></p>
            <p><span className="text-slate-500">Time:</span> <span className="font-mono text-slate-700">{invoiceTime}</span></p>
            <p><span className="text-slate-500">Cashier:</span> <span className="font-bold text-sky-900">{cashierName}</span></p>
            <p><span className="text-slate-500">Store:</span> <span className="font-medium text-slate-800">{storeName}</span></p>
            <p><span className="text-slate-500">Due Date:</span> <span className="font-bold text-rose-700">{additionalInfo?.dueDate || '28/01/2026'}</span></p>
          </div>
        </div>

        {/* Transport & Metadata Grid */}
        <div className="grid grid-cols-4 gap-2 mb-2 text-xs border-2 border-sky-800 p-2 bg-slate-50">
          <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Challan No:</span> <span className="font-mono font-bold text-slate-900">{additionalInfo?.challanNo || '10147'}</span></div>
          <div><span className="text-slate-500 block text-[10px] uppercase font-bold">P.O. No:</span> <span className="font-mono font-bold text-slate-900">{additionalInfo?.poNo || 'PN-122'}</span></div>
          <div><span className="text-slate-500 block text-[10px] uppercase font-bold">E-Way Bill:</span> <span className="font-mono font-bold text-slate-900">{additionalInfo?.ewayBillNo || '223'}</span></div>
          <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Vehicle No:</span> <span className="font-mono font-bold text-sky-950">{additionalInfo?.vehicleNo || 'MP-09-HG-4821'}</span></div>
        </div>

        {/* 2-Box Split Row: BILL TO | SHIP TO */}
        <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
          <div className="border-2 border-sky-800 p-2 bg-white">
            <p className="font-bold text-[10px] uppercase text-sky-800 mb-0.5">BILL TO (PARTY DETAILS)</p>
            <p className="font-black text-sm text-slate-900">{customerName}</p>
            {customerPhone && <p className="text-slate-600 font-mono">Mobile: {customerPhone}</p>}
            <p className="text-slate-600">Industrial Area Sector 3, Indore, MP</p>
          </div>
          <div className="border-2 border-sky-800 p-2 bg-white">
            <p className="font-bold text-[10px] uppercase text-sky-800 mb-0.5">SHIP TO (DELIVERY SITE)</p>
            <p className="font-black text-sm text-slate-900">{customerName}</p>
            <p className="text-slate-600">Site Warehouse 4B, Indore</p>
            <p className="text-slate-600">State: Madhya Pradesh (23)</p>
          </div>
        </div>

        {/* Tax Item Table */}
        <div className="border-2 border-sky-800 mb-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sky-800 text-white font-bold text-[10px] uppercase">
                <th className="py-1.5 px-2 text-center w-10 border-r border-sky-700">S.NO.</th>
                <th className="py-1.5 px-3 border-r border-sky-700">ITEMS</th>
                <th className="py-1.5 px-2 text-center w-16 border-r border-sky-700">HSN</th>
                <th className="py-1.5 px-2 text-center w-14 border-r border-sky-700">QTY.</th>
                <th className="py-1.5 px-2 text-right w-16 border-r border-sky-700">SGST ({halfRateSlabsLabel})</th>
                <th className="py-1.5 px-2 text-right w-16 border-r border-sky-700">CGST ({halfRateSlabsLabel})</th>
                <th className="py-1.5 px-3 text-right w-24">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-200">
              {items.map((item, idx) => (
                <tr key={idx} className="text-slate-900">
                  <td className="py-1 px-2 text-center font-mono border-r border-sky-200">{idx + 1}</td>
                  <td className="py-1 px-3 border-r border-sky-200 font-semibold">{item.name}</td>
                  <td className="py-1 px-2 text-center font-mono text-[11px] border-r border-sky-200">{item.hsnCode || '7318'}</td>
                  <td className="py-1 px-2 text-center font-bold font-mono border-r border-sky-200">{item.quantity} {item.unit || 'PCS'}</td>
                  <td className="py-1 px-2 text-right font-mono border-r border-sky-200">₹{item.sgstAmount.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right font-mono border-r border-sky-200">₹{item.cgstAmount.toFixed(2)}</td>
                  <td className="py-1 px-3 text-right font-bold font-mono">₹{item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-sky-100/70 border-t-2 border-sky-800 font-black text-slate-900">
                <td colSpan={3} className="py-1.5 px-3 border-r border-sky-800 uppercase">GRAND TOTAL ROW</td>
                <td className="py-1.5 px-2 text-center border-r border-sky-800 font-mono">{totalQty}</td>
                <td className="py-1.5 px-2 text-right border-r border-sky-800 font-mono">₹{sgstAmount.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right border-r border-sky-800 font-mono">₹{cgstAmount.toFixed(2)}</td>
                <td className="py-1.5 px-3 text-right font-mono text-sm text-sky-950">₹{grandTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Settlement Summary Bar */}
        <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
          <div className="border-2 border-sky-800 p-1.5 text-center bg-sky-50">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">Received Amount</span>
            <span className="font-mono font-black text-emerald-700">₹{receivedAmount.toFixed(2)}</span>
          </div>
          <div className="border-2 border-sky-800 p-1.5 text-center bg-sky-50">
            <span className="text-[10px] text-slate-600 uppercase font-bold block">Previous Balance</span>
            <span className="font-mono font-bold text-slate-700">₹{previousBalance.toFixed(2)}</span>
          </div>
          <div className="border-2 border-sky-800 p-1.5 text-center bg-sky-900 text-white">
            <span className="text-[10px] text-sky-300 uppercase font-bold block">Current Balance</span>
            <span className="font-mono font-black text-amber-300">₹{currentBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* 3-Box Footer Grid */}
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="border-2 border-sky-800 p-2">
            <p className="font-bold text-sky-900 uppercase text-[9px] mb-0.5">Bank Details</p>
            <p className="font-mono text-slate-700">HDFC Bank • A/C: {additionalInfo?.accountNo || '6345464664664'}</p>
            <p className="font-mono text-slate-700">IFSC: {additionalInfo?.ifscCode || 'HDFC0000036'}</p>
          </div>
          <div className="border-2 border-sky-800 p-2 flex items-center gap-2">
            <QrCode className="w-7 h-7 text-sky-900 flex-shrink-0" />
            <div>
              <p className="font-bold text-sky-900 uppercase text-[9px]">Payment QR</p>
              <p className="font-mono font-semibold text-slate-800">{additionalInfo?.upiId || '5345535555@ybl'}</p>
            </div>
          </div>
          <div className="border-2 border-sky-800 p-2">
            <p className="font-bold text-sky-900 uppercase text-[9px] mb-0.5">Terms and Conditions</p>
            <p className="text-slate-600 text-[9px] leading-tight">Goods once sold will not be returned. Subject to Indore jurisdiction.</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. THERMAL ROLL RECEIPTS (3-Inch 80mm & 2-Inch 58mm)
  // -------------------------------------------------------------
  const is2Inch = effectiveStyle === 'thermal_2inch' || paperSize === 'thermal_2inch';
  
  return (
    <div 
      id="invoice-print-area"
      className={`bg-white text-slate-900 font-mono mx-auto shadow-md border border-slate-300 ${is2Inch ? 'max-w-[280px] p-3 text-[11px]' : 'max-w-[360px] p-4 text-xs'}`}
    >
      {/* Centered Store Header */}
      <div className="text-center pb-2 border-b border-dashed border-slate-400 mb-2">
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-1" referrerPolicy="no-referrer" />
        )}
        <h2 className="font-black text-sm uppercase tracking-tight text-slate-900">{branding.storeDisplayName}</h2>
        {branding.headerTagline && (
          <p className="text-[10px] text-slate-600 font-sans mt-0.5">{branding.headerTagline}</p>
        )}
        {variableFields.showGSTIN && (
          <p className="text-[10px] text-slate-700 mt-0.5">GSTIN: 07AAGCV9438G1Z7</p>
        )}
        <p className="text-[10px] text-slate-600">Ph: +91 98765 43210</p>
      </div>

      {/* Invoice Title & Info */}
      <div className="text-center font-bold text-[11px] uppercase tracking-wider pb-1.5 border-b border-dashed border-slate-400 mb-2">
        TAX INVOICE
      </div>
      <div className="text-[10px] space-y-0.5 pb-2 border-b border-dashed border-slate-400 mb-2">
        <div className="flex justify-between"><span>Inv No: {invoiceId}</span> <span>{invoiceDate}</span></div>
        <div className="flex justify-between"><span>Time: {invoiceTime}</span> <span>Pay: {paymentMethod}</span></div>
        <div className="flex justify-between"><span>Store: {storeName}</span> <span>Cashier: {cashierName}</span></div>
        <div className="flex justify-between font-semibold pt-0.5">
          <span>Bill To: {customerName}</span>
          {customerPhone && <span>{customerPhone}</span>}
        </div>
      </div>

      {/* Item List */}
      <div className="pb-2 border-b border-dashed border-slate-400 mb-2">
        <div className="flex justify-between font-bold text-[10px] uppercase border-b border-slate-300 pb-1 mb-1">
          <span className="w-6">#</span>
          <span className="flex-1 text-left">Item</span>
          <span className="w-8 text-center">Qty</span>
          <span className="w-12 text-right">Rate</span>
          <span className="w-14 text-right">Amt</span>
        </div>

        <div className="space-y-1.5 text-[10px]">
          {items.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline font-medium">
                <span className="w-6 text-slate-500">{idx + 1}</span>
                <span className="flex-1 font-bold text-slate-900 truncate pr-1">{item.name}</span>
                <span className="w-8 text-center">{item.quantity}</span>
                <span className="w-12 text-right">₹{item.price.toFixed(0)}</span>
                <span className="w-14 text-right font-bold">₹{((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}</span>
              </div>
              {!is2Inch && (
                <div className="text-[9px] text-slate-500 pl-6 flex justify-between">
                  <span>HSN:{item.hsnCode || '2106'}</span>
                  <span>Disc: ₹{(item.discount || 0).toFixed(0)}</span>
                  <span>Tax: {item.taxRate}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Totals Summary */}
      <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-400 mb-2">
        <div className="flex justify-between">
          <span>Total Items / Qty:</span>
          <span className="font-bold">{items.length} / {totalQty}</span>
        </div>
        <div className="flex justify-between">
          <span>Sub Total:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-600">
          <span>CGST:</span>
          <span>₹{cgstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-600">
          <span>SGST:</span>
          <span>₹{sgstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300 text-slate-950">
          <span>GRAND TOTAL:</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Highlighted Savings Tag (from thermal-print.webp) */}
      {totalDiscount > 0 && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-1.5 rounded text-center font-bold text-[11px] mb-2">
          🎉 YOU SAVED: ₹{totalDiscount.toFixed(2)}
        </div>
      )}

      {/* Received & Balance */}
      <div className="text-[10px] space-y-0.5 pb-2 border-b border-dashed border-slate-400 mb-2">
        <div className="flex justify-between">
          <span>Received Amount:</span>
          <span className="font-bold text-emerald-700">₹{receivedAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Balance Due:</span>
          <span className="font-bold text-slate-800">₹{balanceDue.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer Notes & Terms */}
      <div className="text-center text-[9px] text-slate-600 space-y-1 pt-1">
        <p className="font-bold text-slate-800">{branding.footerNote}</p>
        <p className="whitespace-pre-line leading-tight">{branding.termsAndConditions}</p>
        <p className="font-bold text-slate-900 pt-1">*** THANK YOU FOR SHOPPING ***</p>
      </div>
    </div>
  );
};
