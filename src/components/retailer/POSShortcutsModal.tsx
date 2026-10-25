import React from 'react';
import { X, Keyboard, Zap, Sparkles, Check, CornerDownLeft } from 'lucide-react';

export interface POSShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  key: string;
  action: string;
  description: string;
  badgeColor?: string;
  category: 'Billing & Checkout' | 'Product Search' | 'Navigation & Modals';
}

const SHORTCUTS: ShortcutItem[] = [
  {
    key: 'F2',
    action: 'Start New Sale',
    description: 'Clears current cart, resets form, and places focus into the product search bar.',
    category: 'Billing & Checkout',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
  },
  {
    key: 'F8',
    action: 'Complete Sale & Checkout',
    description: 'Finalizes the transaction, records invoice to store database, and opens the bill.',
    category: 'Billing & Checkout',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
  },
  {
    key: 'F4',
    action: 'Select Cash Payment',
    description: 'Instantly sets the transaction payment method to Cash for quick customer checkout.',
    category: 'Billing & Checkout',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
  },
  {
    key: 'F9',
    action: 'Select UPI / QR Payment',
    description: 'Switches payment method to Dynamic UPI QR code for instant digital settlement.',
    category: 'Billing & Checkout',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  },
  {
    key: 'F10',
    action: 'Select Card Payment',
    description: 'Switches payment method to Credit / Debit Card swipe terminal.',
    category: 'Billing & Checkout',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
  },
  {
    key: 'F3',
    action: 'Focus Product Search',
    description: 'Instantly focuses and selects the search input so you can type immediately.',
    category: 'Product Search',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  {
    key: 'Enter',
    action: 'Quick Add / Barcode Scan',
    description: 'When in search, adds exact barcode match or single matching product to cart.',
    category: 'Product Search',
    badgeColor: 'bg-slate-700 text-slate-200 border-slate-600'
  },
  {
    key: 'F7',
    action: 'Toggle Barcode Scanner',
    description: 'Opens or closes the live camera barcode scanner modal.',
    category: 'Product Search',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  },
  {
    key: 'F1',
    action: 'Keyboard Shortcuts Guide',
    description: 'Opens or dismisses this POS keyboard shortcuts quick reference cheatsheet.',
    category: 'Navigation & Modals',
    badgeColor: 'bg-slate-700 text-slate-200 border-slate-600'
  },
  {
    key: 'Esc',
    action: 'Close Modal / Cancel',
    description: 'Dismisses open dialogs, cancels customer quick-add, or closes current modal.',
    category: 'Navigation & Modals',
    badgeColor: 'bg-slate-700 text-slate-200 border-slate-600'
  }
];

export const POSShortcutsModal: React.FC<POSShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = ['Billing & Checkout', 'Product Search', 'Navigation & Modals'] as const;

  return (
    <div
      id="pos-keyboard-shortcuts-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A0E1A]/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="pos-keyboard-shortcuts-modal-content"
        className="relative w-full max-w-2xl bg-[#161D2C] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-[#121826] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-sm">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">POS Keyboard Shortcuts</h3>
                <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-black uppercase tracking-wider">
                  Speed Checkout
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Handy keys designed for fast, mouse-free supermarket and kirana billing
              </p>
            </div>
          </div>

          <button
            id="btn-close-pos-shortcuts"
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts guide"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Pro Cashier Tip Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/50 via-blue-950/30 to-[#121826] border border-sky-500/30 flex items-start gap-3">
            <Zap className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white">Cashier Flow: </span>
              <span>
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300 font-mono text-[10px]">F2</kbd> for a new customer &rarr; type or scan barcode with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300 font-mono text-[10px]">Enter</kbd> &rarr; press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300 font-mono text-[10px]">F8</kbd> to complete sale!
              </span>
            </div>
          </div>

          {/* Categorized Shortcuts */}
          {categories.map(cat => {
            const items = SHORTCUTS.filter(s => s.category === cat);
            return (
              <div key={cat} className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  {cat}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map(item => (
                    <div
                      key={item.key + item.action}
                      className="p-3 rounded-xl bg-[#121826] border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{item.action}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{item.description}</p>
                      </div>

                      <kbd
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border shrink-0 shadow-sm ${
                          item.badgeColor || 'bg-slate-700 text-slate-200 border-slate-600'
                        }`}
                      >
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#121826] flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
              Esc
            </kbd>
            <span>to close this guide</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
          >
            Got it, return to POS
          </button>
        </div>
      </div>
    </div>
  );
};
