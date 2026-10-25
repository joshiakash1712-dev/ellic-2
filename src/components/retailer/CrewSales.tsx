import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { POSInvoice } from '../../types';
import { InvoiceModal } from '../common/InvoiceModal';
import {
  Receipt,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Eye,
  MessageSquare,
  Clock,
  User,
  ShoppingBag,
  ArrowUpDown,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const CrewSales: React.FC = () => {
  const { invoices, activeStore } = useStore();
  const { userProfile, currentUser: authUser } = useAuth();

  const crewUid = userProfile?.uid || authUser?.uid || '';
  const crewName = userProfile?.name || authUser?.displayName || 'Crew Cashier';

  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | 'month' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<POSInvoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Strict isolation: only show invoices where cashierId matches the authenticated Crew member
  const crewInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Primary check: cashierId matches crew's UID
      if (inv.cashierId && crewUid) {
        return inv.cashierId === crewUid;
      }
      // Fallback: cashierName matches crew's display name if cashierId not present
      if (inv.cashierName && crewName) {
        return inv.cashierName.toLowerCase() === crewName.toLowerCase();
      }
      return false;
    });
  }, [invoices, crewUid, crewName]);

  // Date filtering
  const filteredInvoices = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

    return crewInvoices.filter(inv => {
      const invDate = inv.date?.slice(0, 10) || '';

      if (dateFilter === 'today' && invDate !== today) return false;
      if (dateFilter === 'yesterday' && invDate !== yesterdayDate) return false;
      if (dateFilter === '7days' && invDate < sevenDaysAgo) return false;
      if (dateFilter === 'month' && invDate < startOfMonth) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNo = inv.invoiceNumber?.toLowerCase().includes(query);
        const matchesCust = inv.customerName?.toLowerCase().includes(query);
        const matchesPhone = inv.customerPhone?.includes(query);
        return matchesNo || matchesCust || matchesPhone;
      }

      return true;
    });
  }, [crewInvoices, dateFilter, searchQuery]);

  // Key KPI metrics for this Crew member
  const totalSalesAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.grandTotal || inv.total || 0), 0);
  }, [filteredInvoices]);

  const totalTransactions = filteredInvoices.length;

  const averageTicket = totalTransactions > 0
    ? Math.round(totalSalesAmount / totalTransactions)
    : 0;

  const handleOpenReceipt = (invoice: POSInvoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleShareWhatsApp = (inv: POSInvoice) => {
    const targetPhone = inv.customerPhone || '';
    const cleanDigits = targetPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const pdfInvoiceUrl = `https://ellic.com/invoices/pdf/${inv.invoiceNumber}.pdf`;

    const text = `*OFFICIAL TAX RECEIPT* 🧾\n*Store:* ${inv.storeName || activeStore.name}\n*Cashier:* ${inv.cashierName || crewName}\n*Invoice No:* #${inv.invoiceNumber}\n*Date:* ${inv.date}\n*Customer:* ${inv.customerName}\n\n*Items:*\n${inv.items.map(it => `• ${it.productName} (${it.quantity}x) = ₹${it.total}`).join('\n')}\n\n*Grand Total:* ₹${inv.grandTotal} (${(inv.paymentMethod || 'cash').toUpperCase()})\n\n*Download PDF:*\n${pdfInvoiceUrl}\n\nThank you for shopping with us!`;

    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Crew Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121826] p-4 sm:p-5 rounded-xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Shift Sales Record • {activeStore.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            My Sales & Receipts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Logged in as <strong className="text-slate-200">{crewName}</strong>. Showing transactions processed by you.
          </p>
        </div>

        {/* Date Filter Segment */}
        <div className="flex items-center bg-[#0A0E1A] p-1 rounded-lg border border-slate-800 shrink-0 overflow-x-auto">
          {(['today', 'yesterday', '7days', 'month', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setDateFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                dateFilter === tab
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === '7days' ? 'Last 7 Days' : tab === 'month' ? 'This Month' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121826] border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Total Sales</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 tabular-nums">
            ₹{totalSalesAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Processed during {dateFilter.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="bg-[#121826] border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transactions Processed</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 tabular-nums">
            {totalTransactions}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Verified sale invoices generated
          </div>
        </div>

        <div className="bg-[#121826] border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Ticket Size</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2 tabular-nums">
            ₹{averageTicket.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Average per customer checkout
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121826] p-3.5 rounded-xl border border-slate-800 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, customer name, phone..."
            className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 self-end sm:self-center">
          <span>{filteredInvoices.length} transactions found</span>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-[#121826] rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-400">No sales recorded for this period</p>
            <p className="text-xs text-slate-500">Sales you process at the POS will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0A0E1A]/60 text-slate-400 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Sold</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Receipt & Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      #{inv.invoiceNumber || inv.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{inv.date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{inv.customerName || 'Walk-in'}</div>
                      <div className="text-[10px] text-slate-500">{inv.customerPhone || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inv.items?.reduce((s, i) => s + i.quantity, 0) || inv.items?.length || 0} items</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-[10px]">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                        {inv.paymentMethod || 'cash'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white text-sm tabular-nums">
                      ₹{(inv.grandTotal || inv.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenReceipt(inv)}
                          title="View Receipt & Print"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 text-[11px] font-semibold transition-all active:scale-95"
                        >
                          <Eye className="w-3 h-3 text-emerald-400" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(inv)}
                          title="Send to Customer via WhatsApp"
                          className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 text-[11px] font-semibold transition-all active:scale-95"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Receipt Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
