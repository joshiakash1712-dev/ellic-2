import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { POSInvoice, Product, Store } from '../types';

// Helper to escape CSV values safely
function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Download helper for browser
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format a timestamp/date string into readable Indian merchant format: DD/MM/YYYY, hh:mm a
 */
function formatReadableDateTime(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
}

/**
 * Export Financial & Sales Report as CSV
 */
export function exportFinancialCSV(
  invoices: POSInvoice[],
  store: Store,
  dateRangeLabel = 'All Time'
) {
  const headers = [
    'Invoice Number',
    'Date',
    'Cashier',
    'Customer Name',
    'Customer Phone',
    'Payment Method',
    'Items',
    'Subtotal (INR)',
    'Discount (INR)',
    'Tax (INR)',
    'Total (INR)'
  ];

  const rows = invoices.map(inv => {
    const totalTax = (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0);
    const cashierLabel = inv.cashierName || (inv as any).cashierId || 'Store Crew';
    const readableDate = formatReadableDateTime(inv.date || (inv as any).createdAt);

    return [
      escapeCSV(inv.invoiceNumber),
      escapeCSV(readableDate),
      escapeCSV(cashierLabel),
      escapeCSV(inv.customerName || 'Walk-in Customer'),
      escapeCSV(inv.customerPhone || 'N/A'),
      escapeCSV((inv.paymentMethod || 'cash').toUpperCase()),
      escapeCSV(inv.items?.length || 0),
      escapeCSV(inv.subtotal.toFixed(2)),
      escapeCSV((inv.discountTotal || 0).toFixed(2)),
      escapeCSV(totalTax.toFixed(2)),
      escapeCSV(inv.grandTotal.toFixed(2))
    ].join(',');
  });

  // Calculate totals
  const totalRevenue = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalTax = invoices.reduce((sum, i) => sum + (i.cgst || 0) + (i.sgst || 0) + (i.igst || 0), 0);
  const totalSubtotal = invoices.reduce((sum, i) => sum + i.subtotal, 0);

  const metaRows = [
    `"--- STORE FINANCIAL REPORT ---"`,
    `"Store Name:",${escapeCSV(store.name)}`,
    `"GSTIN:",${escapeCSV(store.gstin)}`,
    `"Owner / City:",${escapeCSV(`${store.ownerName} - ${store.city}`)}`,
    `"Report Period:",${escapeCSV(dateRangeLabel)}`,
    `"Generated At:",${escapeCSV(new Date().toLocaleString())}`,
    `"Total Bills:",${escapeCSV(invoices.length)}`,
    `"Total Revenue (INR):",${escapeCSV(totalRevenue.toFixed(2))}`,
    `"Total Tax Collected (INR):",${escapeCSV(totalTax.toFixed(2))}`,
    `""`,
    headers.join(',')
  ];

  const footerRow = [
    `"TOTALS"`,
    `""`,
    `""`,
    `""`,
    `""`,
    `""`,
    `""`,
    escapeCSV(totalSubtotal.toFixed(2)),
    `""`,
    escapeCSV(totalTax.toFixed(2)),
    escapeCSV(totalRevenue.toFixed(2))
  ].join(',');

  const csvContent = '\uFEFF' + [...metaRows, ...rows, footerRow].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `Financial_Report_${store.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerDownload(blob, filename);
}

/**
 * Export Inventory Valuation & Stock Ledger as CSV
 */
export function exportInventoryCSV(
  products: Product[],
  store: Store,
  categoryFilter = 'All Categories'
) {
  const headers = [
    'Product ID',
    'Product Name',
    'Category',
    'Brand',
    'Barcode / SKU',
    'Stock Qty',
    'Unit',
    'Min Threshold',
    'Stock Status',
    'Purchase Cost (INR)',
    'Selling Price (INR)',
    'MRP (INR)',
    'GST Rate (%)',
    'Total Cost Valuation (INR)',
    'Total Retail Valuation (INR)',
    'Potential Gross Margin (INR)',
    'Margin (%)'
  ];

  const rows = products.map(p => {
    const costValuation = p.purchasePrice * p.stock;
    const retailValuation = p.sellingPrice * p.stock;
    const grossMargin = retailValuation - costValuation;
    const marginPct = p.sellingPrice > 0 ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(1) : '0.0';
    const status = p.stock <= 0 ? 'Out of Stock' : p.stock <= p.minThreshold ? 'Low Stock Warning' : 'Optimal Stock';

    return [
      escapeCSV(p.id),
      escapeCSV(p.name),
      escapeCSV(p.category),
      escapeCSV(p.brand || 'Generic'),
      escapeCSV(p.barcode || 'N/A'),
      escapeCSV(p.stock),
      escapeCSV(p.unit),
      escapeCSV(p.minThreshold),
      escapeCSV(status),
      escapeCSV(p.purchasePrice.toFixed(2)),
      escapeCSV(p.sellingPrice.toFixed(2)),
      escapeCSV(p.mrp.toFixed(2)),
      escapeCSV(`${p.taxRate}%`),
      escapeCSV(costValuation.toFixed(2)),
      escapeCSV(retailValuation.toFixed(2)),
      escapeCSV(grossMargin.toFixed(2)),
      escapeCSV(`${marginPct}%`)
    ].join(',');
  });

  const totalCostValuation = products.reduce((acc, p) => acc + p.purchasePrice * p.stock, 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minThreshold).length;

  const metaRows = [
    `"--- INVENTORY VALUATION & STOCK LEDGER ---"`,
    `"Store Name:",${escapeCSV(store.name)}`,
    `"GSTIN:",${escapeCSV(store.gstin)}`,
    `"Category Scope:",${escapeCSV(categoryFilter)}`,
    `"Generated At:",${escapeCSV(new Date().toLocaleString())}`,
    `"Total SKUs Tracked:",${escapeCSV(products.length)}`,
    `"Total Units in Stock:",${escapeCSV(totalUnits)}`,
    `"Total Cost Basis Valuation (INR):",${escapeCSV(totalCostValuation.toFixed(2))}`,
    `"Total Retail Value (INR):",${escapeCSV(totalRetailValuation.toFixed(2))}`,
    `"Low Stock Alert Items:",${escapeCSV(lowStockCount)}`,
    `""`,
    headers.join(',')
  ];

  const footerRow = [
    `"TOTALS"`,
    `""`,
    `""`,
    `""`,
    `""`,
    escapeCSV(totalUnits),
    `""`,
    `""`,
    `""`,
    `""`,
    `""`,
    `""`,
    `""`,
    escapeCSV(totalCostValuation.toFixed(2)),
    escapeCSV(totalRetailValuation.toFixed(2)),
    escapeCSV((totalRetailValuation - totalCostValuation).toFixed(2)),
    `""`
  ].join(',');

  const csvContent = '\uFEFF' + [...metaRows, ...rows, footerRow].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `Inventory_Valuation_${store.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerDownload(blob, filename);
}

/**
 * Export Financial & Sales Report as a styled PDF Document
 */
export function exportFinancialPDF(
  invoices: POSInvoice[],
  store: Store,
  dateRangeLabel = 'All Time'
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Decorative Accent line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 42, pageWidth, 2, 'F');

  // Brand & Store Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(store.name, 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`GSTIN: ${store.gstin}  |  Owner: ${store.ownerName}  |  Ph: ${store.phone}`, 14, 23);
  doc.text(`${store.address}, ${store.city}`, 14, 29);

  // Document Title on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('FINANCIAL STATEMENT', pageWidth - 14, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Period: ${dateRangeLabel}`, pageWidth - 14, 23, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 14, 29, { align: 'right' });

  // Summary KPI Cards Box
  const totalRevenue = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalTax = invoices.reduce((acc, i) => acc + (i.cgst || 0) + (i.sgst || 0) + (i.igst || 0), 0);
  const totalSubtotal = invoices.reduce((acc, i) => acc + i.subtotal, 0);
  const totalInvoices = invoices.length;
  const avgOrderValue = totalInvoices > 0 ? Math.round(totalRevenue / totalInvoices) : 0;

  // Box Background
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 49, pageWidth - 28, 22, 2, 2, 'FD');

  const colW = (pageWidth - 28) / 4;
  const metrics = [
    { label: 'TOTAL REVENUE', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: [16, 185, 129] },
    { label: 'TOTAL TAX (GST)', value: `₹${totalTax.toLocaleString('en-IN')}`, color: [30, 41, 59] },
    { label: 'BILLED INVOICES', value: totalInvoices.toString(), color: [30, 41, 59] },
    { label: 'AVG BASKET SIZE', value: `₹${avgOrderValue.toLocaleString('en-IN')}`, color: [59, 130, 246] }
  ];

  metrics.forEach((m, idx) => {
    const xPos = 14 + idx * colW + colW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, xPos, 56, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, xPos, 64, { align: 'center' });
  });

  // Section 1: GST Slab Breakdown Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. GST / Tax Liability Ledger', 14, 78);

  const gstTableHead = [['Tax Rate Slab', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Tax Liability']];
  const slabMap = new Map<
    number,
    {
      rate: number;
      taxRate: string;
      taxable: number;
      cgst: number;
      sgst: number;
      igst: number;
      totalTax: number;
    }
  >();

  invoices.forEach(inv => {
    const isNonGst = inv.isGSTInvoice === false;
    const isIgstInvoice =
      !isNonGst && (inv.igst || 0) > 0 && (inv.cgst || 0) === 0 && (inv.sgst || 0) === 0;

    const parsedLines = (inv.items || []).map(item => {
      const rate = isNonGst ? 0 : Number(item.taxRate ?? 0);
      const quantity = Number(item.quantity ?? 1);
      const unitPrice = Number(item.unitPrice ?? (item as any).price ?? 0);
      const discount = Number(item.discount ?? (item as any).discountAmount ?? 0);

      const rawTaxable =
        typeof (item as any).taxableValue === 'number' && Number.isFinite((item as any).taxableValue)
          ? Number((item as any).taxableValue)
          : Math.max(0, unitPrice * quantity - discount);
      const lineTaxable = Number(rawTaxable.toFixed(2));

      let lineCgst = 0;
      let lineSgst = 0;
      let lineIgst = 0;
      let lineTotalTax = 0;

      if (!isNonGst && rate > 0) {
        if (typeof item.taxAmount === 'number' && Number.isFinite(item.taxAmount)) {
          lineTotalTax = Number(item.taxAmount.toFixed(2));
        } else {
          const rawTax = (lineTaxable * rate) / 100;
          const halfTax = Number((rawTax / 2).toFixed(2));
          lineTotalTax = Number((halfTax * 2).toFixed(2));
        }

        if (isIgstInvoice) {
          lineIgst = lineTotalTax;
        } else {
          lineCgst = Number((lineTotalTax / 2).toFixed(2));
          lineSgst = Number((lineTotalTax - lineCgst).toFixed(2));
        }
      }

      return { rate, lineTaxable, lineCgst, lineSgst, lineIgst, lineTotalTax };
    });

    if (!isNonGst && parsedLines.length > 0) {
      const invCgst = Number((inv.cgst || 0).toFixed(2));
      const invSgst = Number((inv.sgst || 0).toFixed(2));
      const invIgst = Number((inv.igst || 0).toFixed(2));
      const invTotalTax = Number((invCgst + invSgst + invIgst).toFixed(2));

      const sumLineTax = Number(parsedLines.reduce((s, l) => s + l.lineTotalTax, 0).toFixed(2));
      const taxDiff = Number((invTotalTax - sumLineTax).toFixed(2));

      if (invTotalTax > 0 && Math.abs(taxDiff) > 0 && Math.abs(taxDiff) <= 0.02 * parsedLines.length) {
        for (let i = parsedLines.length - 1; i >= 0; i--) {
          if (parsedLines[i].rate > 0) {
            const sumCgst = Number(parsedLines.reduce((s, l) => s + l.lineCgst, 0).toFixed(2));
            const sumSgst = Number(parsedLines.reduce((s, l) => s + l.lineSgst, 0).toFixed(2));
            const sumIgst = Number(parsedLines.reduce((s, l) => s + l.lineIgst, 0).toFixed(2));
            parsedLines[i].lineCgst = Number((parsedLines[i].lineCgst + (invCgst - sumCgst)).toFixed(2));
            parsedLines[i].lineSgst = Number((parsedLines[i].lineSgst + (invSgst - sumSgst)).toFixed(2));
            parsedLines[i].lineIgst = Number((parsedLines[i].lineIgst + (invIgst - sumIgst)).toFixed(2));
            parsedLines[i].lineTotalTax = Number(
              (parsedLines[i].lineCgst + parsedLines[i].lineSgst + parsedLines[i].lineIgst).toFixed(2)
            );
            break;
          }
        }
      }
    }

    parsedLines.forEach(({ rate, lineTaxable, lineCgst, lineSgst, lineIgst, lineTotalTax }) => {
      const existing = slabMap.get(rate) || {
        rate,
        taxRate: `${rate}% GST Slab`,
        taxable: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0
      };

      existing.taxable = Number((existing.taxable + lineTaxable).toFixed(2));
      existing.cgst = Number((existing.cgst + lineCgst).toFixed(2));
      existing.sgst = Number((existing.sgst + lineSgst).toFixed(2));
      existing.igst = Number((existing.igst + lineIgst).toFixed(2));
      existing.totalTax = Number((existing.totalTax + lineTotalTax).toFixed(2));

      slabMap.set(rate, existing);
    });
  });

  const gstSlabRows = Array.from(slabMap.values()).sort((a, b) => a.rate - b.rate);
  const netTaxableTurnover = Number(
    (gstSlabRows.length > 0
      ? gstSlabRows.reduce((acc, row) => acc + row.taxable, 0)
      : invoices.reduce(
          (acc, inv) =>
            acc +
            Math.max(
              0,
              ((inv as any).taxableAmount ?? (inv.subtotal || 0) - (inv.discountTotal || 0))
            ),
          0
        )
    ).toFixed(2)
  );
  const invCgstTotal = Number(
    invoices.reduce((acc, inv) => acc + (inv.isGSTInvoice === false ? 0 : inv.cgst || 0), 0).toFixed(2)
  );
  const invSgstTotal = Number(
    invoices.reduce((acc, inv) => acc + (inv.isGSTInvoice === false ? 0 : inv.sgst || 0), 0).toFixed(2)
  );
  const invIgstTotal = Number(
    invoices.reduce((acc, inv) => acc + (inv.isGSTInvoice === false ? 0 : inv.igst || 0), 0).toFixed(2)
  );
  const slabCgstTotal = Number(gstSlabRows.reduce((acc, row) => acc + row.cgst, 0).toFixed(2));
  const slabSgstTotal = Number(gstSlabRows.reduce((acc, row) => acc + row.sgst, 0).toFixed(2));
  const slabIgstTotal = Number(gstSlabRows.reduce((acc, row) => acc + row.igst, 0).toFixed(2));
  const totalCgst = invCgstTotal > 0 || slabCgstTotal === 0 ? invCgstTotal : slabCgstTotal;
  const totalSgst = invSgstTotal > 0 || slabSgstTotal === 0 ? invSgstTotal : slabSgstTotal;
  const totalIgst = invIgstTotal > 0 || slabIgstTotal === 0 ? invIgstTotal : slabIgstTotal;
  const totalGstLiability = Number((totalCgst + totalSgst + totalIgst).toFixed(2));

  const gstData = [
    ...gstSlabRows.map(row => [
      row.taxRate,
      `₹${row.taxable.toLocaleString('en-IN')}`,
      `₹${row.cgst.toLocaleString('en-IN')}`,
      `₹${row.sgst.toLocaleString('en-IN')}`,
      `₹${row.igst.toLocaleString('en-IN')}`,
      `₹${row.totalTax.toLocaleString('en-IN')}`
    ]),
    [
      'TOTAL',
      `₹${netTaxableTurnover.toLocaleString('en-IN')}`,
      `₹${totalCgst.toLocaleString('en-IN')}`,
      `₹${totalSgst.toLocaleString('en-IN')}`,
      `₹${totalIgst.toLocaleString('en-IN')}`,
      `₹${totalGstLiability.toLocaleString('en-IN')}`
    ]
  ];

  autoTable(doc, {
    startY: 81,
    head: gstTableHead,
    body: gstData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    footStyles: { fillColor: [241, 245, 249], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  // Section 2: POS Invoices Breakdown
  const finalY = (doc as any).lastAutoTable.finalY || 130;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Transaction Sales Ledger (Invoices)', 14, finalY + 10);

  const invoiceTableHead = [['Invoice #', 'Date', 'Customer', 'Payment Mode', 'Items', 'Subtotal', 'Tax', 'Grand Total']];
  const invoiceRows = invoices.map(inv => [
    inv.invoiceNumber,
    inv.date.slice(0, 16),
    inv.customerName || 'Walk-in',
    inv.paymentMethod.toUpperCase(),
    inv.items.length.toString(),
    `₹${inv.subtotal.toLocaleString('en-IN')}`,
    `₹${((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0)).toLocaleString('en-IN')}`,
    `₹${inv.grandTotal.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: finalY + 13,
    head: invoiceTableHead,
    body: invoiceRows,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Generated by Ellic Enterprise ERP • Confidential Report • Page ${data.pageNumber}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }
  });

  const filename = `Financial_Statement_${store.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Export Inventory Valuation & Stock Audit as a styled PDF Document
 */
export function exportInventoryPDF(
  products: Product[],
  store: Store,
  options?: { filterCategory?: string; onlyLowStock?: boolean }
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const filtered = products.filter(p => {
    if (options?.filterCategory && options.filterCategory !== 'All' && p.category !== options.filterCategory) {
      return false;
    }
    if (options?.onlyLowStock && p.stock > p.minThreshold) {
      return false;
    }
    return true;
  });

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Decorative Accent line (Indigo/Blue for inventory)
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 42, pageWidth, 2, 'F');

  // Store Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(store.name, 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`GSTIN: ${store.gstin}  |  Owner: ${store.ownerName}  |  Ph: ${store.phone}`, 14, 23);
  doc.text(`${store.address}, ${store.city}`, 14, 29);

  // Document Title on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(96, 165, 250); // blue-400
  doc.text('INVENTORY VALUATION & STOCK LEDGER', pageWidth - 14, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Scope: ${options?.filterCategory || 'All Categories'}${options?.onlyLowStock ? ' (Low Stock Only)' : ''}`, pageWidth - 14, 23, { align: 'right' });
  doc.text(`Audit Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 14, 29, { align: 'right' });

  // Summary KPI Cards Box
  const totalCostValuation = filtered.reduce((acc, p) => acc + p.purchasePrice * p.stock, 0);
  const totalRetailValuation = filtered.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);
  const totalUnits = filtered.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = filtered.filter(p => p.stock <= p.minThreshold).length;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 49, pageWidth - 28, 22, 2, 2, 'FD');

  const colW = (pageWidth - 28) / 4;
  const metrics = [
    { label: 'COST VALUATION', value: `₹${Math.round(totalCostValuation).toLocaleString('en-IN')}`, color: [30, 41, 59] },
    { label: 'RETAIL VALUE', value: `₹${Math.round(totalRetailValuation).toLocaleString('en-IN')}`, color: [16, 185, 129] },
    { label: 'TOTAL UNITS', value: totalUnits.toLocaleString('en-IN'), color: [59, 130, 246] },
    { label: 'LOW STOCK SKUs', value: lowStockCount.toString(), color: lowStockCount > 0 ? [239, 68, 68] : [16, 185, 129] }
  ];

  metrics.forEach((m, idx) => {
    const xPos = 14 + idx * colW + colW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, xPos, 56, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, xPos, 64, { align: 'center' });
  });

  // Table
  const tableHead = [['Product Name', 'Category', 'SKU / Barcode', 'Stock Qty', 'Cost Price', 'Selling Price', 'Cost Valuation', 'Status']];
  const tableRows = filtered.map(p => {
    const costVal = p.purchasePrice * p.stock;
    const isLow = p.stock <= p.minThreshold;
    const isOut = p.stock <= 0;
    const statusText = isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'OPTIMAL';
    return [
      p.name,
      p.category,
      p.barcode || 'N/A',
      `${p.stock} ${p.unit}`,
      `₹${p.purchasePrice.toLocaleString('en-IN')}`,
      `₹${p.sellingPrice.toLocaleString('en-IN')}`,
      `₹${Math.round(costVal).toLocaleString('en-IN')}`,
      statusText
    ];
  });

  autoTable(doc, {
    startY: 76,
    head: tableHead,
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 28 },
      2: { cellWidth: 26 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 25 },
      7: { cellWidth: 24 }
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      // Highlight low stock status in red/amber
      if (data.column.index === 7 && data.section === 'body') {
        const text = String(data.cell.raw);
        if (text === 'LOW STOCK' || text === 'OUT OF STOCK') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Generated by Ellic Enterprise ERP • Inventory Valuation Ledger • Page ${data.pageNumber}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }
  });

  const filename = `Inventory_Valuation_${store.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Export Combined Financial & Inventory Executive Dashboard (PDF)
 */
export function exportExecutiveAuditPDF(
  invoices: POSInvoice[],
  products: Product[],
  store: Store
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Multi-color stripe
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 42, pageWidth / 2, 2, 'F');
  doc.setFillColor(59, 130, 246);
  doc.rect(pageWidth / 2, 42, pageWidth / 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(store.name, 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`GSTIN: ${store.gstin}  |  Owner: ${store.ownerName}`, 14, 23);
  doc.text(`${store.address}, ${store.city}  |  Ph: ${store.phone}`, 14, 29);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(52, 211, 153);
  doc.text('EXECUTIVE BUSINESS AUDIT', pageWidth - 14, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`All-in-One Financial & Inventory Snapshot`, pageWidth - 14, 23, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 14, 29, { align: 'right' });

  const totalRevenue = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalTax = invoices.reduce((acc, i) => acc + (i.cgst || 0) + (i.sgst || 0) + (i.igst || 0), 0);
  const totalCostValuation = products.reduce((acc, p) => acc + p.purchasePrice * p.stock, 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minThreshold).length;

  // Executive KPI Grid
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 49, pageWidth - 28, 30, 2, 2, 'FD');

  const colW = (pageWidth - 28) / 3;
  const row1 = [
    { label: 'TOTAL SALES REVENUE', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: [16, 185, 129] },
    { label: 'GST TAX LIABILITY', value: `₹${totalTax.toLocaleString('en-IN')}`, color: [30, 41, 59] },
    { label: 'BILLED ORDERS', value: `${invoices.length} Orders`, color: [30, 41, 59] }
  ];

  row1.forEach((m, idx) => {
    const xPos = 14 + idx * colW + colW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, xPos, 56, { align: 'center' });

    doc.setFontSize(10.5);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, xPos, 62, { align: 'center' });
  });

  const row2 = [
    { label: 'INVENTORY VALUATION (COST)', value: `₹${Math.round(totalCostValuation).toLocaleString('en-IN')}`, color: [59, 130, 246] },
    { label: 'POTENTIAL RETAIL REVENUE', value: `₹${Math.round(totalRetailValuation).toLocaleString('en-IN')}`, color: [16, 185, 129] },
    { label: 'LOW STOCK REORDER ALERTS', value: `${lowStockCount} SKUs`, color: lowStockCount > 0 ? [220, 38, 38] : [16, 185, 129] }
  ];

  row2.forEach((m, idx) => {
    const xPos = 14 + idx * colW + colW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, xPos, 69, { align: 'center' });

    doc.setFontSize(10.5);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, xPos, 75, { align: 'center' });
  });

  // Section: Top Selling Items / Invoices Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Recent Billed Sales Ledger', 14, 87);

  const invHead = [['Invoice #', 'Date', 'Customer', 'Mode', 'Items', 'Total']];
  const invRows = invoices.slice(0, 6).map(i => [
    i.invoiceNumber,
    i.date.slice(0, 10),
    i.customerName || 'Walk-in',
    i.paymentMethod.toUpperCase(),
    i.items.length.toString(),
    `₹${i.grandTotal.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: 90,
    head: invHead,
    body: invRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    margin: { left: 14, right: 14 }
  });

  const nextY = (doc as any).lastAutoTable.finalY || 140;

  // Section: Inventory Health & Reorder Attention Items
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Inventory Health & Stock Audit Summary', 14, nextY + 8);

  const stockHead = [['Product Name', 'Category', 'Current Stock', 'Cost Price', 'Selling Price', 'Valuation', 'Stock Status']];
  const stockRows = products.slice(0, 8).map(p => {
    const isLow = p.stock <= p.minThreshold;
    return [
      p.name,
      p.category,
      `${p.stock} ${p.unit}`,
      `₹${p.purchasePrice.toLocaleString('en-IN')}`,
      `₹${p.sellingPrice.toLocaleString('en-IN')}`,
      `₹${Math.round(p.purchasePrice * p.stock).toLocaleString('en-IN')}`,
      isLow ? 'REORDER NEEDED' : 'OPTIMAL'
    ];
  });

  autoTable(doc, {
    startY: nextY + 11,
    head: stockHead,
    body: stockRows,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Generated by Ellic Enterprise ERP • Executive Business Audit • Page ${data.pageNumber}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    }
  });

  const filename = `Executive_Audit_${store.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
