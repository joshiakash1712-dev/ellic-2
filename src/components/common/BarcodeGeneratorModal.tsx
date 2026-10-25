import React from 'react';
import { Product } from '../../types';
import { QrCode, Printer, Download, X, Copy, Check } from 'lucide-react';

interface BarcodeGeneratorModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !product) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(product.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 flex items-center justify-center p-4">
      <div className="glass-panel text-slate-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 relative">
        {/* Subtle brand gradient backdrop BEHIND the glass modal */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/15 via-slate-900/60 to-sky-500/15 pointer-events-none" />
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">Barcode & QR Label Generator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center bg-slate-950">
          <div className="w-full bg-white p-6 rounded-xl text-slate-900 shadow-inner flex flex-col items-center border-2 border-slate-300">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Ellic Retail Tag
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 mb-1 max-w-[240px] truncate">
              {product.name}
            </h4>
            <div className="text-xs text-slate-600 font-semibold mb-3">
              MRP: ₹{product.mrp} | Selling: ₹{product.sellingPrice}
            </div>

            {/* SVG Simulated Barcode Stripes */}
            <div className="w-full h-16 bg-white border border-slate-200 p-2 flex items-center justify-center gap-1 my-2">
              {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6].map((w, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 h-full"
                  style={{ width: `${(w % 3) + 2}px` }}
                />
              ))}
            </div>
            <div className="font-mono text-xs font-extrabold tracking-widest text-slate-900 mt-1">
              {product.barcode}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 w-full flex items-center justify-between text-[10px] text-slate-500">
              <span>Batch: {product.batchNumber || 'BT-REG-2026'}</span>
              <span>Exp: {product.expiryDate || 'N/A'}</span>
            </div>
          </div>

          <div className="w-full mt-4 flex items-center justify-between gap-2">
            <button
              onClick={handleCopyCode}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Code Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handlePrintLabel}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
