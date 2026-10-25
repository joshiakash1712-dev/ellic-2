import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ScrollChartReveal } from '../common/ScrollChartReveal';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
  Cell
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  Zap,
  Building2,
  CheckCircle2,
  Download,
  Percent,
  Sliders,
  Target,
  FileSpreadsheet
} from 'lucide-react';

interface GrowthGraphsProps {
  storeFilterId?: string;
  className?: string;
}

export type GrowthPeriod = '7d' | '30d' | '6m' | '1y' | 'yoy';
export type GrowthMetricMode = 'revenue_profit' | 'customer_retention' | 'aov_basket' | 'category_velocity' | 'outlet_comparison';

export const GrowthGraphs: React.FC<GrowthGraphsProps> = ({
  storeFilterId,
  className = ''
}) => {
  const { invoices, products, customers, stores, activeStore, addAuditLog, addNotification } = useStore();

  const [period, setPeriod] = useState<GrowthPeriod>('6m');
  const [activeMetric, setActiveMetric] = useState<GrowthMetricMode>('revenue_profit');
  const [projectionRate, setProjectionRate] = useState<number>(25); // percentage for simulator
  const [showProjection, setShowProjection] = useState<boolean>(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filter invoices if a store filter is applied
  const relevantInvoices = useMemo(() => {
    if (!storeFilterId || storeFilterId === 'all') return invoices;
    return invoices.filter(inv => (inv as any).storeId === storeFilterId || inv.storeName === activeStore.name);
  }, [invoices, storeFilterId, activeStore]);

  // Aggregate Baseline Metrics
  const baseRevenue = useMemo(() => {
    return relevantInvoices.reduce((sum, inv) => sum + (inv.grandTotal || inv.total || 0), 0);
  }, [relevantInvoices]);

  // Revenue & Profit Growth Time Series Data based on period
  const revenueGrowthData = useMemo(() => {
    if (period === '7d') {
      return [
        { label: 'Mon', revenue: 14200, profit: 3400, target: 12000, growthRate: 18.3, transactions: 19 },
        { label: 'Tue', revenue: 16800, profit: 4100, target: 13000, growthRate: 29.2, transactions: 24 },
        { label: 'Wed', revenue: 15400, profit: 3800, target: 13500, growthRate: 14.1, transactions: 21 },
        { label: 'Thu', revenue: 19200, profit: 4800, target: 14000, growthRate: 37.1, transactions: 28 },
        { label: 'Fri', revenue: 24600, profit: 6200, target: 18000, growthRate: 36.7, transactions: 35 },
        { label: 'Sat', revenue: 31800, profit: 8100, target: 22000, growthRate: 44.5, transactions: 46 },
        { label: 'Sun (Today)', revenue: baseRevenue > 0 ? baseRevenue : 35200, profit: Math.round((baseRevenue > 0 ? baseRevenue : 35200) * 0.24), target: 24000, growthRate: 46.6, transactions: 51 }
      ];
    }

    if (period === '30d') {
      return [
        { label: 'Week 1', revenue: 84000, profit: 20500, target: 70000, growthRate: 20.0, transactions: 118 },
        { label: 'Week 2', revenue: 96500, profit: 24100, target: 75000, growthRate: 28.7, transactions: 134 },
        { label: 'Week 3', revenue: 112000, profit: 28600, target: 82000, growthRate: 36.6, transactions: 159 },
        { label: 'Week 4', revenue: baseRevenue > 0 ? Math.max(baseRevenue * 4, 134000) : 134000, profit: Math.round((baseRevenue > 0 ? Math.max(baseRevenue * 4, 134000) : 134000) * 0.26), target: 90000, growthRate: 48.9, transactions: 188 }
      ];
    }

    if (period === '1y') {
      return [
        { label: 'Q1 (Jan-Mar)', revenue: 280000, profit: 67200, target: 240000, growthRate: 16.7, transactions: 390 },
        { label: 'Q2 (Apr-Jun)', revenue: 345000, profit: 86250, target: 290000, growthRate: 19.0, transactions: 470 },
        { label: 'Q3 (Jul-Sep)', revenue: 420000, profit: 109200, target: 350000, growthRate: 21.7, transactions: 580 },
        { label: 'Q4 (Forecast)', revenue: 530000, profit: 143100, target: 420000, growthRate: 26.2, transactions: 720 }
      ];
    }

    if (period === 'yoy') {
      return [
        { label: 'Q1', currentYear: 280000, previousYear: 210000, profit: 67200, growthRate: 33.3 },
        { label: 'Q2', currentYear: 345000, previousYear: 250000, profit: 86250, growthRate: 38.0 },
        { label: 'Q3', currentYear: 420000, previousYear: 295000, profit: 109200, growthRate: 42.4 },
        { label: 'Q4 (Est.)', currentYear: 530000, previousYear: 360000, profit: 143100, growthRate: 47.2 }
      ];
    }

    // Default '6m' (Monthly Run-Rate from Mar to Aug 2026)
    return [
      { label: 'Mar 2026', revenue: 78000, profit: 18700, target: 65000, growthRate: 15.2, transactions: 110 },
      { label: 'Apr 2026', revenue: 92000, profit: 22800, target: 72000, growthRate: 17.9, transactions: 128 },
      { label: 'May 2026', revenue: 108000, profit: 27500, target: 80000, growthRate: 17.4, transactions: 152 },
      { label: 'Jun 2026', revenue: 129000, profit: 33800, target: 90000, growthRate: 19.4, transactions: 178 },
      { label: 'Jul 2026', revenue: 154000, profit: 41500, target: 105000, growthRate: 19.4, transactions: 215 },
      { label: 'Aug 2026 (Live)', revenue: baseRevenue > 0 ? Math.max(baseRevenue * 4.5, 186000) : 186000, profit: Math.round((baseRevenue > 0 ? Math.max(baseRevenue * 4.5, 186000) : 186000) * 0.27), target: 120000, growthRate: 20.8, transactions: 260 }
    ];
  }, [period, baseRevenue]);

  // Customer Acquisition & Cohort Growth Data
  const customerGrowthData = useMemo(() => {
    return [
      { month: 'Mar', newCustomers: 24, totalActive: 140, retentionRate: 81.2, repeatOrders: 64 },
      { month: 'Apr', newCustomers: 32, totalActive: 168, retentionRate: 83.5, repeatOrders: 82 },
      { month: 'May', newCustomers: 41, totalActive: 202, retentionRate: 84.8, repeatOrders: 108 },
      { month: 'Jun', newCustomers: 53, totalActive: 246, retentionRate: 86.1, repeatOrders: 139 },
      { month: 'Jul', newCustomers: 68, totalActive: 304, retentionRate: 87.4, repeatOrders: 182 },
      { month: 'Aug', newCustomers: 85, totalActive: 375 + customers.length, retentionRate: 88.9, repeatOrders: 236 }
    ];
  }, [customers]);

  // AOV (Average Order Value) and Basket Size Trajectory
  const aovGrowthData = useMemo(() => {
    return [
      { period: 'Mar 2026', aov: 709, basketUnits: 2.8, targetAOV: 650, repeatRatio: 48 },
      { period: 'Apr 2026', aov: 718, basketUnits: 3.1, targetAOV: 700, repeatRatio: 52 },
      { period: 'May 2026', aov: 710, basketUnits: 3.2, targetAOV: 720, repeatRatio: 56 },
      { period: 'Jun 2026', aov: 724, basketUnits: 3.5, targetAOV: 750, repeatRatio: 61 },
      { period: 'Jul 2026', aov: 716, basketUnits: 3.8, targetAOV: 780, repeatRatio: 66 },
      { period: 'Aug 2026', aov: 715, basketUnits: 4.2, targetAOV: 800, repeatRatio: 72 }
    ];
  }, []);

  // Category-wise Growth & SKU Velocity
  const categoryGrowthData = useMemo(() => {
    return [
      { category: 'Spices & Seasonings', revenueGrowth: 42.8, volumeGrowth: 38.5, grossMargin: 34.2, turnoverRate: 5.4 },
      { category: 'Beverages & Tea', revenueGrowth: 36.4, volumeGrowth: 32.1, grossMargin: 28.6, turnoverRate: 6.2 },
      { category: 'Grains & Pulses', revenueGrowth: 29.5, volumeGrowth: 34.0, grossMargin: 21.4, turnoverRate: 7.1 },
      { category: 'Oils & Ghee', revenueGrowth: 24.2, volumeGrowth: 22.0, grossMargin: 19.8, turnoverRate: 4.8 },
      { category: 'Personal Care', revenueGrowth: 38.9, volumeGrowth: 35.6, grossMargin: 39.5, turnoverRate: 3.9 },
      { category: 'Packaged Foods', revenueGrowth: 31.0, volumeGrowth: 28.4, grossMargin: 26.2, turnoverRate: 5.8 }
    ];
  }, []);

  // Multi-Store Franchise Growth Benchmark
  const multiStoreGrowthData = useMemo(() => {
    return [
      { month: 'Mar', store1: 42000, store2: 24000, store3: 12000 },
      { month: 'Apr', store1: 48000, store2: 29000, store3: 15000 },
      { month: 'May', store1: 56000, store2: 34000, store3: 18000 },
      { month: 'Jun', store1: 67000, store2: 41000, store3: 21000 },
      { month: 'Jul', store1: 79000, store2: 49000, store3: 26000 },
      { month: 'Aug', store1: 94000, store2: 59000, store3: 33000 }
    ];
  }, []);

  // Forecast Simulation Calculation
  const forecastMetrics = useMemo(() => {
    const currentRunRate = revenueGrowthData[revenueGrowthData.length - 1]?.revenue || 186000;
    const projectedNextQ = Math.round(currentRunRate * 3 * (1 + projectionRate / 100));
    const projectedAnnualRunRate = Math.round(currentRunRate * 12 * (1 + projectionRate / 100));
    const projectedGrossProfit = Math.round(projectedNextQ * 0.28);

    return {
      currentRunRate,
      projectedNextQ,
      projectedAnnualRunRate,
      projectedGrossProfit
    };
  }, [revenueGrowthData, projectionRate]);

  // Export Growth Data handler
  const handleExportGrowthCSV = () => {
    const headers = 'Label,Revenue (INR),Profit (INR),Target (INR),Growth Rate (%)\n';
    const rows = revenueGrowthData
      .map(r => `"${r.label}",${r.revenue || (r as any).currentYear || 0},${r.profit || 0},${(r as any).target || (r as any).previousYear || 0},${r.growthRate}%`)
      .join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Growth_Analytics_${period.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    addAuditLog('Growth Analytics Exported', `Exported ${period.toUpperCase()} growth trajectory data to CSV`);
    addNotification({
      title: 'Growth Report Downloaded',
      message: `Exported comprehensive growth trajectory ledger for ${activeStore.name}.`,
      category: 'system',
      linkModule: 'retailer'
    });

    setExportNotice('Growth trajectory CSV successfully exported');
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* 1. Header & Growth Timeline Navigation */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-white tracking-tight">Growth & Sales Trends</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>+34.8% YoY Trajectory</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Performance curves, revenue expansion, customer retention, and estimated sales projections.
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Resolution Pills */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '6m', label: '6 Months' },
              { id: '1y', label: '1 Year' },
              { id: 'yoy', label: 'YoY Comp' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as GrowthPeriod)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  period === p.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportGrowthCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
            title="Download formatted Growth trajectory spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Export Notice Alert */}
      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. Top-Level Growth KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Monthly Run Rate (MRR) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Gross Monthly Run-Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              ₹{(forecastMetrics.currentRunRate).toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +20.8% MoM
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span>Annual Run-Rate (ARR):</span>
            <span className="text-slate-200 font-bold font-mono">₹{((forecastMetrics.currentRunRate * 12) / 100000).toFixed(1)} Lakhs</span>
          </div>
        </div>

        {/* Metric 2: Customer Acquisition Velocity */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Customer Base & Growth</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-300">
              {customers.length > 0 ? 375 + customers.length : 380}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +25.0%
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span>Repeat Customer Rate:</span>
            <span className="text-emerald-400 font-bold">88.9% active</span>
          </div>
        </div>

        {/* Metric 3: Average Order Value (AOV) Growth */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Average Bill (AOV)</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-300">₹715</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span>Items per Bill:</span>
            <span className="text-purple-300 font-bold">4.2 items</span>
          </div>
        </div>

        {/* Metric 4: Net Margin & Profit Expansion */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Estimated Profit Margin</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-300">27.0%</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +3.2 pts
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span>Estimated Profit:</span>
            <span className="text-emerald-400 font-bold font-mono">₹{Math.round(forecastMetrics.currentRunRate * 0.27).toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      {/* 3. Interactive Metric Dimension Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg overflow-x-auto no-scrollbar">
        {[
          { id: 'revenue_profit', label: 'Sales & Estimated Profit', icon: DollarSign },
          { id: 'customer_retention', label: 'Customers & Repeat Visits', icon: Users },
          { id: 'aov_basket', label: 'Average Bill & Basket Size', icon: ShoppingCart },
          { id: 'category_velocity', label: 'Category & Product Sales Speed', icon: Layers },
          { id: 'outlet_comparison', label: 'Multi-Store Comparison', icon: Building2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeMetric === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMetric(tab.id as GrowthMetricMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. PRIMARY DYNAMIC GRAPH DISPLAY CANVAS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        
        {/* GRAPH 1: Revenue & Profit Expansion */}
        {activeMetric === 'revenue_profit' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Revenue & Gross Profit Expansion Curve ({period.toUpperCase()})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Dual-gradient area projection comparing gross billed sales against net margin profitability and SLA targets.
                </p>
              </div>

              {/* Legend & Target toggle */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-teal-400 inline-block" />
                  <span>Gross Profit</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block" />
                  <span>Target SLA</span>
                </div>
              </div>
            </div>

            {/* Recharts Area / Composed Chart Canvas — Scroll-Triggered Reveal (Section 17) */}
            <ScrollChartReveal className="h-72 w-full pt-2" triggerKey={`rev-${period}`}>
              <ResponsiveContainer width="100%" height="100%">
                {period === 'yoy' ? (
                  <BarChart data={revenueGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '14px', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [
                        `₹${Number(val).toLocaleString('en-IN')}`,
                        name === 'currentYear' ? '2026 Revenue' : name === 'previousYear' ? '2025 Revenue' : 'Profit'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="previousYear" fill="#475569" radius={[4, 4, 0, 0]} name="2025 Revenue" isAnimationActive={false} />
                    <Bar dataKey="currentYear" fill="#10b981" radius={[4, 4, 0, 0]} name="2026 Revenue" isAnimationActive={false} />
                    <Bar dataKey="profit" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Gross Profit" isAnimationActive={false} />
                  </BarChart>
                ) : (
                  <AreaChart data={revenueGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '14px', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [
                        `₹${Number(val).toLocaleString('en-IN')}`,
                        name === 'revenue' ? 'Gross Revenue' : name === 'profit' ? 'Gross Profit' : 'Target SLA'
                      ]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revenueGrad)" name="Revenue" isAnimationActive={false} />
                    <Area type="monotone" dataKey="profit" stroke="#14b8a6" strokeWidth={2} fill="url(#profitGrad)" name="Profit" isAnimationActive={false} />
                    <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Target" isAnimationActive={false} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </ScrollChartReveal>

            {/* Quick Micro-Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-800 text-center">
              {revenueGrowthData.map((d, i) => (
                <div key={i} className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block truncate font-medium">{d.label}</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    ₹{((d.revenue || (d as any).currentYear || 0) / 1000).toFixed(1)}k
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">
                    +{d.growthRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GRAPH 2: Customer Acquisition & Retention */}
        {activeMetric === 'customer_retention' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Customer Acquisition & Cohort Retention Curve</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Monthly onboarding velocity vs active repeat buyers and 30-day retention SLA.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  <span>New Signups</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                  <span>Repeat Orders</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
                  <span>Retention %</span>
                </div>
              </div>
            </div>

            <ScrollChartReveal className="h-72 w-full pt-2" triggerKey={`cust-${period}`}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={customerGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '14px', fontSize: '12px' }}
                  />
                  <Bar yAxisId="left" dataKey="newCustomers" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Signups" isAnimationActive={false} />
                  <Bar yAxisId="left" dataKey="repeatOrders" fill="#6366f1" radius={[4, 4, 0, 0]} name="Repeat Orders" isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="retentionRate" stroke="#10b981" strokeWidth={2.5} name="Retention Rate (%)" isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </ScrollChartReveal>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex justify-between items-center">
                <span className="text-slate-400">Total Active Base:</span>
                <span className="font-bold text-white font-mono">{customerGrowthData[customerGrowthData.length - 1].totalActive} accounts</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex justify-between items-center">
                <span className="text-slate-400">Monthly Run Acquisition:</span>
                <span className="font-bold text-blue-400 font-mono">+85 new / mo</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex justify-between items-center">
                <span className="text-slate-400">Average Retention:</span>
                <span className="font-bold text-emerald-400 font-mono">88.9%</span>
              </div>
            </div>
          </div>
        )}

        {/* GRAPH 3: AOV & Basket Size Velocity */}
        {activeMetric === 'aov_basket' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-purple-400" />
                  <span>Average Order Value (AOV) & Basket Size Trajectory</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tracking ticket size expansion and Units Per Transaction (UPT) over the last 6 months.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                  <span>AOV (₹)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block" />
                  <span>Target AOV</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-0.5 bg-teal-400 inline-block" />
                  <span>Items / Basket</span>
                </div>
              </div>
            </div>

            <ScrollChartReveal className="h-72 w-full pt-2" triggerKey={`aov-${period}`}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={aovGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="period" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '14px', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [
                      name === 'AOV' || name === 'Target AOV' ? `₹${Number(val).toFixed(0)}` : `${val} items`,
                      name
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="aov" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="AOV" isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="targetAOV" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" name="Target AOV" isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="basketUnits" stroke="#14b8a6" strokeWidth={2.5} name="Units Per Basket" isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </ScrollChartReveal>
          </div>
        )}

        {/* GRAPH 4: Category & SKU Velocity Matrix */}
        {activeMetric === 'category_velocity' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Category Revenue & Volume Growth Matrix</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Cross-category comparison of revenue expansion rate vs inventory turnover speed.
                </p>
              </div>
            </div>

            <ScrollChartReveal
              className="h-72 w-full pt-2"
              triggerKey={`cat-${period}`}
              barDirection="vertical"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryGrowthData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '14px', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [`${val}%`, name === 'revenueGrowth' ? 'Revenue Growth' : 'Volume Growth']}
                  />
                  <Legend />
                  <Bar dataKey="revenueGrowth" fill="#10b981" radius={[0, 4, 4, 0]} name="Revenue Growth (%)" isAnimationActive={false} />
                  <Bar dataKey="volumeGrowth" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Volume Growth (%)" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </ScrollChartReveal>
          </div>
        )}

        {/* GRAPH 5: Multi-Branch Fleet Comparison */}
        {activeMetric === 'outlet_comparison' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span>Multi-Store Franchise Growth Trajectory</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Comparative performance curves across franchise branches over the past 6 months.
                </p>
              </div>
            </div>

            <ScrollChartReveal className="h-72 w-full pt-2" triggerKey={`outlet-${period}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={multiStoreGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '14px', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [
                      `₹${Number(val).toLocaleString('en-IN')}`,
                      name === 'store1' ? 'Connaught Place Store' : name === 'store2' ? 'South Extension Store' : 'Indiranagar Store'
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="store1" stroke="#10b981" strokeWidth={2.5} name="Connaught Place Store" isAnimationActive={false} />
                  <Line type="monotone" dataKey="store2" stroke="#3b82f6" strokeWidth={2} name="South Extension Store" isAnimationActive={false} />
                  <Line type="monotone" dataKey="store3" stroke="#f59e0b" strokeWidth={2} name="Indiranagar Store" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ScrollChartReveal>
          </div>
        )}

      </div>

      {/* 5. PREDICTIVE GROWTH SIMULATOR & SCENARIO MODELER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Predictive Growth Simulator</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Scenario Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Adjust projected expansion rate to simulate next quarter and annual run-rate targets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Projected Growth Rate:</span>
            <span className="text-xs font-black text-amber-400 px-2 py-1 bg-slate-800 rounded-lg border border-slate-700 font-mono">
              +{projectionRate}%
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-semibold">
            <span>Conservative (+10%)</span>
            <span>Balanced (+25%)</span>
            <span>Aggressive Expansion (+50%)</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={projectionRate}
            onChange={e => setProjectionRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Simulated Projected Outputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">Projected Next Quarter (Q4)</span>
            <span className="text-lg font-black text-white">
              ₹{forecastMetrics.projectedNextQ.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-400 block font-semibold">
              +₹{(forecastMetrics.projectedNextQ - forecastMetrics.currentRunRate * 3).toLocaleString('en-IN')} incremental surge
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">Projected Annual Run-Rate (ARR)</span>
            <span className="text-lg font-black text-emerald-400">
              ₹{(forecastMetrics.projectedAnnualRunRate / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-[10px] text-slate-400 block">
              Calculated at +{projectionRate}% compound run-rate
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">Simulated Gross Margin Pool</span>
            <span className="text-lg font-black text-teal-300">
              ₹{forecastMetrics.projectedGrossProfit.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-teal-400 block font-semibold">
              28.0% estimated net profitability
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
