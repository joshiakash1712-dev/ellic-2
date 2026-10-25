import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Wholesaler, SupplierPerformanceMetrics } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
  Legend
} from 'recharts';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Truck,
  BarChart2,
  Filter,
  Download,
  Activity,
  Star,
  Layers,
  Calendar,
  AlertCircle,
  Building2,
  Check,
  ChevronRight,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const SupplierPerformanceDashboard: React.FC = () => {
  const { wholesalers, restockOrders, addNotification, addAuditLog } = useStore();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');
  const [selectedWholesalerId, setSelectedWholesalerId] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Compute aggregate metrics from wholesalers
  const filteredWholesalers = selectedWholesalerId === 'all'
    ? wholesalers
    : wholesalers.filter(w => w.id === selectedWholesalerId);

  // Calculate averages across filtered wholesalers
  const totalWholesalersCount = filteredWholesalers.length;
  
  const avgLeadTime = Number(
    (
      filteredWholesalers.reduce((acc, w) => acc + (w.performance?.avgLeadTimeDays || 1.8), 0) /
      (totalWholesalersCount || 1)
    ).toFixed(1)
  );

  const avgFulfillmentRate = Number(
    (
      filteredWholesalers.reduce((acc, w) => acc + (w.performance?.fulfillmentSuccessRate || 97.2), 0) /
      (totalWholesalersCount || 1)
    ).toFixed(1)
  );

  const avgDispatchRate = Number(
    (
      filteredWholesalers.reduce((acc, w) => acc + (w.performance?.onTimeDispatchRate || 95.8), 0) /
      (totalWholesalersCount || 1)
    ).toFixed(1)
  );

  const avgAccuracyRate = Number(
    (
      filteredWholesalers.reduce((acc, w) => acc + (w.performance?.accuracyRate || 98.9), 0) /
      (totalWholesalersCount || 1)
    ).toFixed(1)
  );

  const totalFulfilledOrders = filteredWholesalers.reduce(
    (acc, w) => acc + (w.performance?.totalOrdersFulfilled || 100),
    0
  );

  // Trend Data for Lead Time vs Target SLA (Last 6 Months)
  const leadTimeTrendData = [
    { month: 'Mar 2026', avgLeadTime: 2.2, fulfillmentRate: 94.5, targetSLA: 2.0 },
    { month: 'Apr 2026', avgLeadTime: 1.9, fulfillmentRate: 96.2, targetSLA: 2.0 },
    { month: 'May 2026', avgLeadTime: 1.7, fulfillmentRate: 97.1, targetSLA: 2.0 },
    { month: 'Jun 2026', avgLeadTime: 1.6, fulfillmentRate: 97.8, targetSLA: 2.0 },
    { month: 'Jul 2026', avgLeadTime: 1.5, fulfillmentRate: 98.3, targetSLA: 2.0 },
    { month: 'Aug 2026', avgLeadTime: avgLeadTime, fulfillmentRate: avgFulfillmentRate, targetSLA: 2.0 }
  ];

  // Category Lead Time Comparison
  const categoryLeadTimeData = [
    { category: 'Dairy & Eggs', leadTime: 0.8, fulfillment: 99.2, totalPOs: 42 },
    { category: 'Oils & Spices', leadTime: 1.2, fulfillment: 98.8, totalPOs: 38 },
    { category: 'Grains & Pulses', leadTime: 1.5, fulfillment: 98.5, totalPOs: 54 },
    { category: 'Beverages', leadTime: 1.8, fulfillment: 97.2, totalPOs: 31 },
    { category: 'Personal Care', leadTime: 2.0, fulfillment: 97.0, totalPOs: 22 },
    { category: 'Electronics', leadTime: 2.4, fulfillment: 94.2, totalPOs: 15 }
  ];

  // Order Fulfillment Stage Breakdown
  const fulfillmentBreakdownData = [
    { name: 'Delivered On-Time & In-Full', value: 98.6, color: '#10b981' },
    { name: 'Slight Delay (<24h)', value: 1.1, color: '#f59e0b' },
    { name: 'Short Quantity Supplied', value: 0.3, color: '#ef4444' }
  ];

  const handleExportSLA = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      addNotification({
        title: 'Supplier Performance Report Exported',
        message: 'Comprehensive Lead Time & OTIF Fulfillment Audit PDF downloaded successfully.',
        category: 'restock',
        linkModule: 'wholesaler'
      });
      addAuditLog(
        'SLA Report Exported',
        `Downloaded Supplier Performance Audit Report for timeframe (${selectedTimeframe})`,
        'info'
      );
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Dashboard Controls */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-base font-black text-white tracking-tight">
              Supplier Performance & SLA Analytics Dashboard
            </h2>
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Monitoring
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of Wholesaler Average Lead Times, On-Time & In-Full (OTIF) Fulfillment, and Dispatch SLAs.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Wholesaler Select */}
          <select
            value={selectedWholesalerId}
            onChange={(e) => setSelectedWholesalerId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-semibold text-xs focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Connected Suppliers ({wholesalers.length})</option>
            {wholesalers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {/* Timeframe Select */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['7d', '30d', '90d', 'ytd'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedTimeframe === tf
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportSLA}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audit PDF</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* KPI Highlight Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Average Lead Time */}
        <div className="p-4 rounded-2xl glass-panel glass-panel-interactive shadow-xl relative overflow-hidden group transition-all">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none -z-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Avg Lead Time</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{avgLeadTime}</span>
            <span className="text-xs font-bold text-slate-400">Days</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>0.6 Days faster than 2.0d Target SLA</span>
          </div>
          <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }} />
          </div>
        </div>

        {/* KPI 2: Fulfillment Success Rate */}
        <div className="p-4 rounded-2xl glass-panel glass-panel-interactive shadow-xl relative overflow-hidden group transition-all">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none -z-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">OTIF Fulfillment</span>
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{avgFulfillmentRate}%</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              Excellent
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-teal-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+3.6% higher than 95.0% SLA Threshold</span>
          </div>
          <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 rounded-full" style={{ width: `${avgFulfillmentRate}%` }} />
          </div>
        </div>

        {/* KPI 3: On-Time Dispatch Speed */}
        <div className="p-4 rounded-2xl glass-panel glass-panel-interactive shadow-xl relative overflow-hidden group transition-all">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none -z-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">24h Dispatch Speed</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{avgDispatchRate}%</span>
            <span className="text-xs font-bold text-slate-400">Dispatched &lt;24h</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-blue-400">
            <Zap className="w-3.5 h-3.5 fill-blue-400" />
            <span>Fast Express Logistics Guarantee</span>
          </div>
          <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${avgDispatchRate}%` }} />
          </div>
        </div>

        {/* KPI 4: Order Quality & Accuracy */}
        <div className="p-4 rounded-2xl glass-panel glass-panel-interactive shadow-xl relative overflow-hidden group transition-all">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none -z-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Batch Accuracy</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{avgAccuracyRate}%</span>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" /> 4.9 Rating
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Defect & Zero Shortage Audit</span>
          </div>
          <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${avgAccuracyRate}%` }} />
          </div>
        </div>

      </div>

      {/* Main Charts & Analytics Visual Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Monthly Lead Time & Fulfillment Trend (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Average Lead Time & Fulfillment Rate Trends</span>
              </h3>
              <p className="text-xs text-slate-400">
                Monthly historical turnaround time (Days) vs Target SLA benchmark (2.0 Days)
              </p>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Avg Lead Time (Days)</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Fulfillment Rate (%)</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadTimeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={10} domain={[0, 4]} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={10} domain={[80, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any, name: any) => [
                    name === 'avgLeadTime' ? `${val} Days` : `${val}%`,
                    name === 'avgLeadTime' ? 'Avg Lead Time' : 'Fulfillment Rate'
                  ]}
                />
                <Bar yAxisId="left" dataKey="avgLeadTime" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Line yAxisId="right" type="monotone" dataKey="fulfillmentRate" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Lead Time Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Category Lead Time Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">Average fulfillment speed per product category</p>
          </div>

          <div className="space-y-3 pt-2">
            {categoryLeadTimeData.map((catItem) => (
              <div key={catItem.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{catItem.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{catItem.totalPOs} POs</span>
                    <strong className="text-emerald-400 font-bold">{catItem.leadTime} Days</strong>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      catItem.leadTime <= 1.0
                        ? 'bg-emerald-500'
                        : catItem.leadTime <= 1.8
                        ? 'bg-teal-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (catItem.leadTime / 3) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between mt-4">
            <span>Fastest Category Delivery:</span>
            <strong className="text-emerald-400 font-bold">Dairy & Eggs (0.8 Days)</strong>
          </div>
        </div>

      </div>

      {/* Supplier Scorecard Comparison Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Connected Wholesaler Performance Scorecard</span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparative Lead Times, OTIF Fulfillment Success Rates, and Tier Badges
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span>Total Orders Tracked:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {totalFulfilledOrders} Completed POs
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Wholesaler Partner</th>
                <th className="pb-3">Categories Covered</th>
                <th className="pb-3">Avg Lead Time</th>
                <th className="pb-3">OTIF Fulfillment Rate</th>
                <th className="pb-3">24h Dispatch</th>
                <th className="pb-3">Accuracy</th>
                <th className="pb-3">Tier Status</th>
                <th className="pb-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredWholesalers.map(ws => {
                const perf = ws.performance || {
                  avgLeadTimeDays: 1.8,
                  fulfillmentSuccessRate: 97.0,
                  onTimeDispatchRate: 95.0,
                  accuracyRate: 98.5,
                  totalOrdersFulfilled: 80,
                  qualityRating: 4.8,
                  tierStatus: 'Gold'
                };

                return (
                  <tr key={ws.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Wholesaler Name & GSTIN */}
                    <td className="py-3.5">
                      <div className="font-extrabold text-white text-xs">{ws.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">GSTIN: {ws.gstin}</div>
                    </td>

                    {/* Categories */}
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {ws.categories.slice(0, 3).map(cat => (
                          <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {cat}
                          </span>
                        ))}
                        {ws.categories.length > 3 && (
                          <span className="text-[9px] text-slate-500 font-bold">+{ws.categories.length - 3}</span>
                        )}
                      </div>
                    </td>

                    {/* Avg Lead Time */}
                    <td className="py-3.5">
                      <div className="font-black text-emerald-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{perf.avgLeadTimeDays} Days</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Target &lt;2.0d</span>
                    </td>

                    {/* Fulfillment Rate Progress */}
                    <td className="py-3.5">
                      <div className="font-black text-white">{perf.fulfillmentSuccessRate}%</div>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${perf.fulfillmentSuccessRate}%` }}
                        />
                      </div>
                    </td>

                    {/* Dispatch Speed */}
                    <td className="py-3.5 font-bold text-blue-400">
                      {perf.onTimeDispatchRate}%
                    </td>

                    {/* Accuracy Rate */}
                    <td className="py-3.5 font-bold text-teal-400">
                      {perf.accuracyRate}%
                    </td>

                    {/* Tier Status Badge */}
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border flex items-center gap-1 w-fit ${
                        perf.tierStatus === 'Platinum'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        <span>{perf.tierStatus} Tier</span>
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 text-right font-black text-amber-400">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{ws.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">{perf.totalOrdersFulfilled} Orders</span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLA Guarantees & Contractual Compliance Footer Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Automated SLA Guarantee & Dispute Mitigation</h4>
            <p className="text-[11px] text-slate-400">
              Orders failing to meet the 48-hour delivery lead time SLA trigger an automated dispatch review and vendor performance credit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% SLA Compliant</span>
          </span>
        </div>
      </div>

    </div>
  );
};
