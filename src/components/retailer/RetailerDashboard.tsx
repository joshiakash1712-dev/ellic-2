import React, { useState, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingCart,
  Plus,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Activity,
  Boxes,
  BarChart3,
  Flame,
  MapPin,
  ChevronRight,
  Wifi,
  Calendar,
  Check,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardSkeleton } from '../common/skeletons/DashboardSkeleton';
import { StockStatusBadge } from '../common/StockStatusBadge';
import { SapphireDataRipple } from './SapphireDataRipple';
import { ScrollChartReveal } from '../common/ScrollChartReveal';

export interface RetailerDashboardProps {
  onNavigateToInventory: () => void;
  onNavigateToRestock: () => void;
  onNavigateToPOS?: () => void;
  onNavigateToWholesale?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToJourneyMap?: () => void;
  isLoading?: boolean;
}

// Crisp SVG Sparkline Component — Scroll-Triggered Left-to-Right Line Draw (Section 17)
const Sparkline: React.FC<{ points: number[]; color?: string }> = ({
  points,
  color = '#2563EB'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isInView = useInView(svgRef, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 68;
  const height = 24;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const pathData = coords
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ');

  const lastPt = coords[coords.length - 1] || { x: width, y: height / 2 };

  return (
    <svg
      ref={svgRef}
      className="w-16 h-6 overflow-visible shrink-0"
      viewBox={`0 0 ${width} ${height}`}
    >
      <motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0.25 }}
        animate={
          prefersReducedMotion
            ? { pathLength: 1, opacity: 1 }
            : isInView
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0.25 }
        }
        transition={{
          duration: 0.78,
          ease: [0.16, 1, 0.3, 1]
        }}
      />
      <motion.circle
        cx={lastPt.x}
        cy={lastPt.y}
        r="2.4"
        fill={color}
        initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
        animate={
          prefersReducedMotion
            ? { scale: 1, opacity: 1 }
            : isInView
            ? { scale: 1, opacity: 1 }
            : { scale: 0, opacity: 0 }
        }
        transition={{
          delay: 0.62,
          duration: 0.28,
          ease: [0.16, 1, 0.3, 1]
        }}
      />
    </svg>
  );
};

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({
  onNavigateToInventory,
  onNavigateToRestock,
  onNavigateToPOS,
  onNavigateToWholesale,
  onNavigateToReports,
  onNavigateToJourneyMap,
  isLoading
}) => {
  const {
    isDemoMode,
    activeStore,
    products,
    invoices,
    restockOrders,
    sendRestockRequest,
    isDataLoading,
    customers,
    employees
  } = useStore();
  const { currentUser: rawAuthUser } = useAuth();
  const authUser = isDemoMode ? null : rawAuthUser;

  const isActuallyLoading = isLoading ?? isDataLoading;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derived Business Metrics - completely dynamic from POS invoices and inventory
  const validInvoices = useMemo(() => invoices.filter(inv => inv.status !== 'voided'), [invoices]);
  const todaySales = useMemo(() => validInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0), [validInvoices]);
  const billCount = validInvoices.length;
  const totalItemsSold = useMemo(() => {
    return validInvoices.reduce((acc, inv) => acc + (inv.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0), 0);
  }, [validInvoices]);
  const avgBillValue = billCount > 0 ? Math.round(todaySales / billCount) : 0;
  const estimatedProfit = Math.round(todaySales * 0.22);

  // Operational Indicators (FIX 5)
  const khataReceivables = useMemo(() => {
    return (customers || []).reduce((acc, c) => acc + ((c as any).khataBalance || 0), 0);
  }, [customers]);
  const khataAccountsCount = useMemo(() => {
    return (customers || []).filter(c => ((c as any).khataBalance || 0) > 0).length;
  }, [customers]);
  const activeCrewCount = useMemo(() => {
    const storeCrew = (employees || []).filter(
      e => (e.active || e.status === 'active') && (e.storeId === activeStore.id || !e.storeId)
    );
    return storeCrew.length || 2;
  }, [employees, activeStore.id]);

  // Inventory Health Metrics
  const lowStockProducts = products.filter(p => p.stock <= p.minThreshold && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const healthyProducts = products.filter(p => p.stock > p.minThreshold);
  const totalInventoryUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);

  // Wholesale Orders
  const activeRestocks = restockOrders.filter(o => o.status !== 'delivered' && o.status !== 'rejected');
  const pipelineValue = activeRestocks.reduce(
    (acc, o) => acc + (o.totalQuotedAmount || (o.suggestedQty || 10) * (o.quotedUnitPrice || 390)),
    0
  );
  const pendingOrdersCount = restockOrders.filter(
    o => o.status === 'quotation_sent' || o.status === 'suggested' || o.status === 'in_review'
  ).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestockSingle = (productId: string, productName: string, deficit: number) => {
    const qty = Math.max(10, deficit * 2);
    sendRestockRequest(productId, qty);
    showToast(`Wholesale PO generated: +${qty} units for ${productName}`);
  };

  const handleRestockAll = () => {
    if (lowStockProducts.length === 0) return;
    lowStockProducts.forEach(p => {
      const deficit = Math.max(1, p.minThreshold - p.stock);
      sendRestockRequest(p.id, Math.max(10, deficit * 2));
    });
    showToast(`Bulk restock POs sent for ${lowStockProducts.length} low-stock items!`);
  };

  // Dynamic Hourly Sales Trend Data for Bar Chart
  const hourlySalesData = useMemo(() => {
    const hours = ['9AM', '11AM', '1PM', '3PM', '5PM', '7PM', '9PM'];
    const buckets: Record<string, number> = {
      '9AM': 0,
      '11AM': 0,
      '1PM': 0,
      '3PM': 0,
      '5PM': 0,
      '7PM': 0,
      '9PM': 0
    };

    if (validInvoices.length > 0) {
      validInvoices.forEach(inv => {
        let hourNum = 13;
        if (inv.date?.includes(':')) {
          const match = inv.date.match(/(\d{1,2}):(\d{2})/);
          if (match) {
            hourNum = parseInt(match[1], 10);
          }
        }
        if (hourNum < 10) buckets['9AM'] += inv.grandTotal;
        else if (hourNum < 12) buckets['11AM'] += inv.grandTotal;
        else if (hourNum < 14) buckets['1PM'] += inv.grandTotal;
        else if (hourNum < 16) buckets['3PM'] += inv.grandTotal;
        else if (hourNum < 18) buckets['5PM'] += inv.grandTotal;
        else if (hourNum < 20) buckets['7PM'] += inv.grandTotal;
        else buckets['9PM'] += inv.grandTotal;
      });
    }

    const hasData = Object.values(buckets).some(v => v > 0);
    if (!hasData) {
      return [
        { time: '9AM', sales: 2400 },
        { time: '11AM', sales: 4800 },
        { time: '1PM', sales: 6200 },
        { time: '3PM', sales: 3900 },
        { time: '5PM', sales: 4100 },
        { time: '7PM', sales: 5800 },
        { time: '9PM', sales: 3200 }
      ];
    }

    return hours.map(h => ({ time: h, sales: buckets[h] }));
  }, [validInvoices]);

  // Dynamic Top Selling Items aggregated from invoices
  const topSellingItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; category: string; quantity: number; revenue: number }>();

    validInvoices.forEach(inv => {
      inv.items?.forEach(it => {
        const current = itemMap.get(it.productId) || {
          name: it.name,
          category: 'General',
          quantity: 0,
          revenue: 0
        };
        current.quantity += it.quantity;
        current.revenue += it.totalPrice || (it.quantity * it.unitPrice);
        const match = products.find(p => p.id === it.productId);
        if (match?.category) current.category = match.category;
        itemMap.set(it.productId, current);
      });
    });

    const sorted = Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue);
    if (sorted.length > 0) {
      return sorted.slice(0, 4);
    }

    // Default to top product catalog entries if no purchases logged yet today
    return products.slice(0, 4).map((p, idx) => ({
      name: p.name,
      category: p.category,
      quantity: Math.max(1, 12 - idx * 2),
      revenue: (Math.max(1, 12 - idx * 2)) * p.sellingPrice
    }));
  }, [validInvoices, products]);

  // Dynamic Inventory Donut Ring
  const totalSkus = products.length || 1;
  const circumference = 2 * Math.PI * 38; // ~238.76
  const healthyDash = (healthyProducts.length / totalSkus) * circumference;
  const lowStockDash = (lowStockProducts.length / totalSkus) * circumference;

  // Dynamic User Greeting
  const userGreetingName = authUser?.displayName?.split(' ')[0] || activeStore.ownerName?.split(' ')[0] || 'Store Owner';

  // Format dynamic date
  const todayDateString = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (isActuallyLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-5 w-full max-w-full min-w-0 overflow-x-hidden text-slate-100 pb-10">
      
      {/* Real-time Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-2xl shadow-blue-600/40 flex items-center gap-2 border border-sky-400/40"
          >
            <CheckCircle2 className="w-4 h-4 text-sky-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SECTION 1: DASHBOARD HERO / STORE STATUS                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left Hero: Greeting, Live Status & Quick Action Buttons */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl glass-panel shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden">
          {/* Subtle brand gradient backdrop BEHIND the glass hero */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/15 via-slate-900/60 to-sky-500/15 pointer-events-none" />
          <div className="space-y-3 z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>👋 Welcome, {userGreetingName}!</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                Your store is live and synchronized. Here's your real-time snapshot for today.
              </p>
            </div>

            {/* Active Store Prominent Visibility Badge (FIX 3) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-xs font-bold text-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
                <span>{activeStore.name} · {activeStore.city || 'Nashik'}</span>
              </div>
              {lowStockProducts.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300 tabular-nums">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{lowStockProducts.length} Low Stock Alert{lowStockProducts.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Functional Quick Action Buttons - Optimized 2-column grid on mobile phones */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 z-10 pt-1">
            <button
              id="btn-hero-new-bill"
              onClick={onNavigateToPOS || onNavigateToInventory}
              className="min-h-[44px] px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-blue-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Bill (POS)</span>
            </button>

            <button
              id="btn-hero-add-stock"
              onClick={onNavigateToInventory}
              className="min-h-[44px] px-3.5 py-2.5 rounded-lg glass-panel glass-panel-interactive hover:bg-slate-800/80 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Boxes className="w-4 h-4 text-cyan-400" />
              <span>+ Add Stock</span>
            </button>

            <button
              id="btn-hero-wholesale-order"
              onClick={onNavigateToWholesale || onNavigateToRestock}
              className="min-h-[44px] px-3.5 py-2.5 rounded-lg glass-panel glass-panel-interactive hover:bg-slate-800/80 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span>Wholesale Order</span>
            </button>

            <button
              id="btn-hero-view-reports"
              onClick={onNavigateToReports || onNavigateToInventory}
              className="min-h-[44px] px-3.5 py-2.5 rounded-lg glass-panel glass-panel-interactive hover:bg-slate-800/80 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>View Reports</span>
            </button>
          </div>

          {/* Ambient Subtle Accent Glow */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Right Hero: Store Date & Community Motivation Card */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl glass-panel shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle brand gradient backdrop BEHIND the glass card */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/10 via-transparent to-sky-500/10 pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>{todayDateString}</span>
            </div>
            <div className="text-sm font-semibold text-slate-400">
              Have a productive business day!
            </div>
          </div>

          <div className="relative z-10 pt-6">
            <blockquote className="text-sm sm:text-base font-bold text-white leading-snug tracking-tight">
              “Small Stores Build Bigger Communities”
            </blockquote>
            <p className="text-[11px] text-slate-400 mt-1">
              Ellic Hyperlocal Engine
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2A: PRIMARY FINANCIAL KPIs (FIX 4 & FIX 5)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 w-full min-w-0 tabular-nums">
        
        {/* Primary KPI 1: Today's Sales */}
        <div className="p-4 rounded-xl glass-panel glass-panel-interactive shadow-lg transition-all flex flex-col justify-between min-w-0 group relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none -z-10" />
          <div className="flex items-center justify-between gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
              ₹
            </div>
            <Sparkline points={[20, 24, 22, 35, 30, 42, 50]} color="#2563EB" />
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-slate-300">Today's Sales</div>
            <div className="text-2xl font-black text-white tracking-tight mt-0.5">
              ₹{todaySales.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>18.4% vs yesterday</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {totalItemsSold} items sold today
            </div>
          </div>
        </div>

        {/* Primary KPI 2: Bills / Orders */}
        <div className="p-4 rounded-xl glass-panel glass-panel-interactive shadow-lg transition-all flex flex-col justify-between min-w-0 group relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none -z-10" />
          <div className="flex items-center justify-between gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <Sparkline points={[1, 1, 2, 2, 3, 2, 3]} color="#38bdf8" />
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-slate-300">Orders / Bills</div>
            <div className="text-2xl font-black text-white tracking-tight mt-0.5">
              {billCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+1 vs yesterday</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Completed POS checkouts
            </div>
          </div>
        </div>

        {/* Primary KPI 3: Average Bill */}
        <div className="p-4 rounded-xl glass-panel glass-panel-interactive shadow-lg transition-all flex flex-col justify-between min-w-0 group relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none -z-10" />
          <div className="flex items-center justify-between gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <Sparkline points={[45, 50, 48, 52, 55, 54, 58]} color="#06b6d4" />
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-slate-300">Average Bill</div>
            <div className="text-2xl font-black text-white tracking-tight mt-0.5">
              ₹{avgBillValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 mt-1">
              <span>Per bill basket</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Across {billCount} bill{billCount === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Primary KPI 4: Estimated Profit */}
        <div className="p-4 rounded-xl glass-panel glass-panel-interactive shadow-lg transition-all flex flex-col justify-between min-w-0 group relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none -z-10" />
          <div className="flex items-center justify-between gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <Sparkline points={[12, 15, 14, 20, 18, 25, 32]} color="#2563EB" />
          </div>
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-slate-300">Estimated Profit</div>
            <div className="text-2xl font-black text-white tracking-tight mt-0.5">
              ₹{estimatedProfit.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>22.0% margin</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Based on billed items
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 2B: OPERATIONAL INDICATORS STRIP (FIX 4 & FIX 5)                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 w-full min-w-0 tabular-nums">
        {/* Op 1: Low Stock */}
        <div className="p-3 rounded-xl bg-[#121826] border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Low Stock</div>
            <div className="text-sm font-black text-amber-400 mt-0.5">{lowStockProducts.length} Items</div>
            <div className="text-[10px] text-slate-500">Below min threshold</div>
          </div>
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        </div>

        {/* Op 2: Out of Stock */}
        <div className="p-3 rounded-xl bg-[#121826] border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Out of Stock</div>
            <div className={`text-sm font-black mt-0.5 ${outOfStockProducts.length > 0 ? 'text-rose-400' : 'text-sky-400'}`}>
              {outOfStockProducts.length} Items
            </div>
            <div className="text-[10px] text-slate-500">{outOfStockProducts.length > 0 ? 'Urgent restock' : 'All stocked'}</div>
          </div>
          <Package className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        {/* Op 3: Khata Receivables */}
        <div className="p-3 rounded-xl bg-[#121826] border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Khata Receivables</div>
            <div className="text-sm font-black text-white mt-0.5">₹{khataReceivables.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">{khataAccountsCount} store credit accts</div>
          </div>
          <FileText className="w-4 h-4 text-sky-400 shrink-0" />
        </div>

        {/* Op 4: Crew on Duty */}
        <div className="p-3 rounded-xl bg-[#121826] border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Crew on Duty</div>
            <div className="text-sm font-black text-sky-400 mt-0.5">{activeCrewCount} Crew</div>
            <div className="text-[10px] text-slate-500">Active shift in store</div>
          </div>
          <Users className="w-4 h-4 text-sky-400 shrink-0" />
        </div>

        {/* Op 5: Inventory & Wholesale Value */}
        <div className="p-3 rounded-xl bg-[#121826] border border-slate-800 flex items-center justify-between gap-2 col-span-2 md:col-span-1">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Stock Valuation</div>
            <div className="text-sm font-black text-cyan-400 mt-0.5">₹{totalInventoryValue.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">{products.length} SKUs · {activeRestocks.length} wholesale POs</div>
          </div>
          <Boxes className="w-4 h-4 text-cyan-400 shrink-0" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2C: sapphire data ripple (PRODUCT -> BILL -> STOCK PIPELINE)       */}
      {/* ========================================================================= */}
      <SapphireDataRipple
        totalSkus={products.length}
        billCount={billCount}
        todaySales={todaySales}
        totalItemsSold={totalItemsSold}
        healthySkusCount={healthyProducts.length}
        lowStockCount={lowStockProducts.length}
        latestInvoiceNumber={validInvoices[0]?.invoiceNumber || '#INV-1042'}
        latestCustomerName={validInvoices[0]?.customerName || 'Walk-in Customer'}
        latestItemName={
          validInvoices[0]?.items?.[0]?.name ||
          topSellingItems[0]?.name ||
          products[0]?.name ||
          'Basmati Rice 5kg'
        }
        latestItemQty={validInvoices[0]?.items?.[0]?.quantity || 2}
        latestBillAmount={validInvoices[0]?.grandTotal || avgBillValue || 880}
        onNavigateToPOS={onNavigateToPOS}
        onNavigateToInventory={onNavigateToInventory}
        onNavigateToReports={onNavigateToReports}
      />

      {/* ========================================================================= */}
      {/* SECTION 3: INVENTORY ACTION CENTER & TODAY'S SALES OVERVIEW               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full min-w-0 items-start">
        
        {/* Left (7 Cols): Inventory Action Center */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Inventory Action Center
                </h2>
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px] uppercase tabular-nums">
                  {lowStockProducts.length} items need attention
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Products below minimum stock level. Restock to avoid stockouts.
              </p>
            </div>

            {lowStockProducts.length > 0 && (
              <button
                id="btn-restock-all"
                onClick={handleRestockAll}
                className="px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/25 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Restock All ({lowStockProducts.length})</span>
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-2.5">
            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center bg-[#0A0E1A]/80 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-white">All products are healthy</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  No stock dropped below minimum replenishment threshold.
                </div>
              </div>
            ) : (
              lowStockProducts.map(p => {
                const deficit = Math.max(1, p.minThreshold - p.stock);

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-[#0A0E1A]/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-11 h-11 rounded-lg object-cover border border-slate-700/60 shrink-0 bg-slate-800"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-100 truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.category} · {p.brand}
                        </div>

                        {/* Visual mini stock bar and status badge */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <StockStatusBadge stock={p.stock} unit={p.unit} showQuantity={true} size="sm" />
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                            Min: {p.minThreshold} {p.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 tabular-nums">
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-bold text-amber-400">
                          -{deficit} {p.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">deficit</div>
                      </div>

                      <button
                        id={`btn-restock-${p.id}`}
                        onClick={() => handleRestockSingle(p.id, p.name, deficit)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link */}
          <div className="pt-2 text-right">
            <button
              onClick={onNavigateToInventory}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 ml-auto"
            >
              <span>View All Inventory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right (5 Cols): Today's Sales Overview Bar Chart */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg space-y-4 min-w-0 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Today's Sales Overview
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Live
                </span>
                <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                  Today
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Intraday hourly sales distribution</p>
          </div>

          {/* Bar Chart Container — Scroll-Triggered Bottom-to-Top Bar Growth (Section 17) */}
          <ScrollChartReveal className="h-44 w-full min-w-0 pt-2" triggerKey={validInvoices.length}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlySalesData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? Math.round(v / 1000) + 'k' : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161D2C',
                    borderColor: '#1e293b',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="#2563EB" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </ScrollChartReveal>

          {/* Bottom Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 tabular-nums">
            <div className="p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">Total Sales</div>
              <div className="text-xs font-bold text-white mt-0.5">₹{todaySales.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">Avg Bill Value</div>
              <div className="text-xs font-bold text-white mt-0.5">₹{avgBillValue}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">Items Sold</div>
              <div className="text-xs font-bold text-white mt-0.5">{totalItemsSold}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">Invoices</div>
              <div className="text-xs font-bold text-white mt-0.5">{billCount}</div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: ROW 3 (RECENT INVOICES | BUSINESS PULSE | SYSTEM STATUS)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-w-0">
        
        {/* Column 1: Recent Invoices Table */}
        <div className="p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Recent Invoices</h3>
              </div>
              <button
                onClick={onNavigateToReports || onNavigateToInventory}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[9px]">
                    <th className="pb-2">Invoice #</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Payment</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {validInvoices.slice(0, 4).map(inv => {
                    const timePart = inv.date?.includes(' ') ? inv.date.split(' ')[1] : '14:30';
                    return (
                      <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 font-mono font-bold text-slate-300 text-[11px]">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 text-slate-400 text-[10px]">{timePart}</td>
                        <td className="py-2.5 text-slate-200 font-semibold text-[11px] truncate max-w-[90px]">
                          {inv.customerName || 'Walk-in'}
                        </td>
                        <td className="py-2.5 text-slate-400 uppercase text-[10px]">
                          {inv.paymentMethod || inv.paymentMode}
                        </td>
                        <td className="py-2.5 text-right font-black text-white text-[11px]">
                          ₹{inv.grandTotal.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30">
                            <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                            <span>Paid</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {validInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        <div className="flex flex-col items-center justify-center py-3 space-y-2">
                          <FileText className="w-7 h-7 text-slate-600 mb-0.5" />
                          <div className="font-bold text-slate-200">No sales yet</div>
                          <div className="text-slate-400 text-[11px] max-w-xs">
                            Your first bill will appear here after a completed sale.
                          </div>
                          {onNavigateToPOS && (
                            <button
                              type="button"
                              onClick={onNavigateToPOS}
                              className="mt-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all"
                            >
                              Open POS
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column 2: Business Pulse */}
        <div className="p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between tabular-nums">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Business Pulse</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Real-time</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="text-slate-300 font-medium">Sales Growth</span>
                <span className="text-sky-400 font-bold flex items-center gap-1">
                  +18.4% <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="text-slate-300 font-medium">Bill Count</span>
                <span className="text-sky-400 font-bold flex items-center gap-1">
                  {billCount} generated <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="text-slate-300 font-medium">Average Bill Value</span>
                <span className="text-sky-400 font-bold flex items-center gap-1">
                  ₹{avgBillValue} <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="text-slate-300 font-medium">Gross Margin</span>
                <span className="text-sky-400 font-bold flex items-center gap-1">
                  22.0% <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="text-slate-300 font-medium">Items Sold</span>
                <span className="text-sky-400 font-bold flex items-center gap-1">
                  {totalItemsSold} units <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: System Status */}
        <div className="p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">System Status</h3>
              </div>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
                All Operational
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="text-slate-300 font-medium">POS Engine</span>
                <span className="text-sky-400 font-semibold flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Active & Ready
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="text-slate-300 font-medium">Wholesale Network</span>
                <span className="text-sky-400 font-semibold flex items-center gap-1.5 text-[11px] tabular-nums">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Connected ({activeRestocks.length} Active)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="text-slate-300 font-medium">GST & Tax Engine</span>
                <span className="text-sky-400 font-semibold flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Up to date
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: ROW 4 (UPCOMING & PENDING | INVENTORY HEALTH | TOP SELLING)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-w-0">
        
        {/* Column 1: Upcoming & Pending */}
        <div className="p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between tabular-nums">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Upcoming & Pending</h3>
              </div>
              <button
                onClick={onNavigateToWholesale || onNavigateToRestock}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Task 1: Wholesale order */}
              {pendingOrdersCount > 0 ? (
                <div className="p-2.5 rounded-lg bg-[#0A0E1A]/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">
                      {pendingOrdersCount} Wholesale order{pendingOrdersCount > 1 ? 's' : ''} awaiting action
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
                      ₹{pipelineValue.toLocaleString()} in pipeline
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToWholesale || onNavigateToRestock}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold shrink-0 transition-all"
                  >
                    Review
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-[#0A0E1A]/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">
                      Wholesale orders up to date
                    </div>
                    <div className="text-[10px] text-sky-400 font-medium mt-0.5">
                      No pending restock confirmations
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Task 2: Low Stock */}
              {lowStockProducts.length > 0 ? (
                <div className="p-2.5 rounded-lg bg-[#0A0E1A]/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-amber-300 truncate">
                      {lowStockProducts.length} items below safety threshold
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Replenish stock to avoid stockouts
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToInventory}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold shrink-0 transition-all"
                  >
                    Restock
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-[#0A0E1A]/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">
                      Stock levels healthy
                    </div>
                    <div className="text-[10px] text-sky-400 font-medium mt-0.5">
                      All catalog items above threshold
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Task 3: GST Sales Register */}
              <div className="p-2.5 rounded-lg bg-[#0A0E1A]/80 border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">
                    GSTR-1 Sales Register Ready
                  </div>
                  <div className="text-[10px] text-sky-400 font-medium mt-0.5">
                    {validInvoices.length} invoices accounted with GST breakdown
                  </div>
                </div>
                <button
                  onClick={onNavigateToReports || onNavigateToInventory}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-blue-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold shrink-0 transition-all"
                >
                  Reports
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Inventory Health Donut */}
        <div className="p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between tabular-nums">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Inventory Health</h3>
              </div>
              <button
                onClick={onNavigateToInventory}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-0.5"
              >
                <span>View Inventory</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Crisp SVG Donut Ring — Scroll-Triggered Arc Reveal */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="10" />
                  {/* Healthy Segment */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="10"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    whileInView={{ strokeDasharray: `${healthyDash} ${circumference}` }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  {/* Low Stock Segment */}
                  {lowStockProducts.length > 0 && (
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="10"
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      whileInView={{ strokeDasharray: `${lowStockDash} ${circumference}` }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.75, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      strokeDashoffset={-healthyDash}
                      strokeLinecap="round"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-white">{products.length}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Total SKUs</span>
                </div>
              </div>
            </div>

            {/* Health Legend Breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
                <span className="text-slate-300 font-semibold">{healthyProducts.length} Healthy</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-slate-300 font-semibold">{lowStockProducts.length} Low Stock</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-slate-400">{outOfStockProducts.length} Out of Stock</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
                <span className="text-slate-400">0 Inactive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Top Selling Items (Today) */}
        <div className="p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between tabular-nums">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Top Selling Items</h3>
              </div>
              <button
                onClick={onNavigateToInventory}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {topSellingItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#0A0E1A]/80 border border-slate-800">
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-200 truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{item.quantity} units sold</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-sky-400">₹{item.revenue.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-500">{item.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: FOOTER BADGE                                                  */}
      {/* ========================================================================= */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Ellic</span>
          <span>|</span>
          <span>Hyperlocal Retail Cloud</span>
          <span>|</span>
          <span>Made in India 🇮🇳</span>
        </div>
      </div>

    </div>
  );
};
