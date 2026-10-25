import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { StockStatusBadge } from '../common/StockStatusBadge';
import {
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  Zap,
  Package,
  ShoppingCart,
  ChevronRight,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  X,
  Building2,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  PackageCheck,
  ChevronDown,
  Layers,
  Search
} from 'lucide-react';

interface StockThresholdAlertBannerProps {
  onNavigateToInventory?: () => void;
  onNavigateToRestock?: () => void;
}

export const StockThresholdAlertBanner: React.FC<StockThresholdAlertBannerProps> = ({
  onNavigateToInventory,
  onNavigateToRestock
}) => {
  const {
    products,
    wholesalers,
    connections,
    restockOrders,
    sendRestockRequest,
    addNotification,
    addAuditLog,
    theme
  } = useStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'nearing' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabCategory, setActiveTabCategory] = useState<string>('All');
  const [orderQtyMap, setOrderQtyMap] = useState<Record<string, number>>({});
  const [orderedProductIds, setOrderedProductIds] = useState<string[]>([]);
  const [isBatchRestocking, setIsBatchRestocking] = useState(false);
  const [showDismissWarning, setShowDismissWarning] = useState(false);
  const [isBannerHidden, setIsBannerHidden] = useState(false);

  // Connected wholesalers list for instant quick order assignment
  const connectedWholesalerIds = connections
    .filter(c => c.status === 'connected')
    .map(c => c.wholesalerId);

  const connectedWholesalers = wholesalers.filter(w => connectedWholesalerIds.includes(w.id));
  const defaultWholesaler = connectedWholesalers[0] || wholesalers[0] || {
    id: 'ws-101',
    name: 'Metro Mega Distribution Pvt Ltd'
  };

  // Categorize products by proximity to minimum stock threshold
  // Pulling live data directly from InventoryManager products state
  const {
    outOfStockProducts,
    criticalLowProducts,
    nearingThresholdProducts,
    allThresholdAlertProducts,
    healthRate
  } = useMemo(() => {
    const out: Product[] = [];
    const critical: Product[] = [];
    const nearing: Product[] = [];

    products.forEach(p => {
      if (p.stock === 0) {
        out.push(p);
      } else if (p.stock <= p.minThreshold) {
        critical.push(p);
      } else if (p.stock > p.minThreshold && p.stock <= Math.ceil(p.minThreshold * 1.35)) {
        // Nearing threshold: within 35% buffer of minimum stock limit
        nearing.push(p);
      }
    });

    const all = [...out, ...critical, ...nearing];
    const totalCount = products.length || 1;
    const healthyCount = totalCount - all.length;
    const rate = Math.round((healthyCount / totalCount) * 100);

    return {
      outOfStockProducts: out,
      criticalLowProducts: critical,
      nearingThresholdProducts: nearing,
      allThresholdAlertProducts: all,
      healthRate: Math.max(0, Math.min(100, rate))
    };
  }, [products]);

  // Categories present in threshold alerts
  const alertCategories = useMemo(() => {
    const cats = new Set<string>();
    allThresholdAlertProducts.forEach(p => cats.add(p.category));
    return ['All', ...Array.from(cats)];
  }, [allThresholdAlertProducts]);

  // Filtered alert products list
  const filteredAlertProducts = useMemo(() => {
    return allThresholdAlertProducts.filter(p => {
      const isOut = p.stock === 0;
      const isCrit = p.stock > 0 && p.stock <= p.minThreshold;
      const isNear = p.stock > p.minThreshold && p.stock <= Math.ceil(p.minThreshold * 1.35);

      if (selectedFilter === 'out' && !isOut) return false;
      if (selectedFilter === 'critical' && !isCrit) return false;
      if (selectedFilter === 'nearing' && !isNear) return false;

      if (activeTabCategory !== 'All' && p.category !== activeTabCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchBarcode = p.barcode.includes(q);
        if (!matchName && !matchBrand && !matchBarcode) return false;
      }

      return true;
    });
  }, [allThresholdAlertProducts, selectedFilter, activeTabCategory, searchQuery]);

  // Pending restock PO lookup
  const getActivePO = (productId: string) => {
    return restockOrders.find(
      ro => ro.productId === productId && ro.status !== 'rejected' && ro.status !== 'delivered'
    );
  };

  const getRecommendedOrderQty = (p: Product) => {
    if (orderQtyMap[p.id] !== undefined) return orderQtyMap[p.id];
    // Dynamic restock heuristic: Fill up to 3x minimum threshold buffer
    const deficit = Math.max(0, (p.minThreshold * 3) - p.stock);
    return Math.max(20, deficit);
  };

  const handleSetOrderQty = (productId: string, qty: number) => {
    setOrderQtyMap(prev => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  const handleQuickRestockItem = (product: Product) => {
    const qty = getRecommendedOrderQty(product);
    sendRestockRequest(product.id, qty, defaultWholesaler.id);

    setOrderedProductIds(prev => [...prev, product.id]);
    addNotification({
      title: 'PO Generated: Stock Threshold Replenishment',
      message: `Placed replenishment order for ${qty} ${product.unit} of "${product.name}" with ${defaultWholesaler.name}.`,
      category: 'restock',
      linkModule: 'retailer'
    });
    addAuditLog(
      'Threshold Restock PO Created',
      `Ordered ${qty} ${product.unit} of ${product.name} (Stock: ${product.stock}, Min: ${product.minThreshold})`,
      'success'
    );

    setTimeout(() => {
      setOrderedProductIds(prev => prev.filter(id => id !== product.id));
    }, 4000);
  };

  const handleBatchRestockAll = async () => {
    const actionable = allThresholdAlertProducts.filter(p => !getActivePO(p.id));
    if (actionable.length === 0) return;

    setIsBatchRestocking(true);
    let count = 0;

    for (const prod of actionable) {
      const qty = getRecommendedOrderQty(prod);
      sendRestockRequest(prod.id, qty, defaultWholesaler.id);
      count++;
    }

    setTimeout(() => {
      setIsBatchRestocking(false);
      addNotification({
        title: 'Batch Threshold Replenishment Triggered',
        message: `Generated ${count} automated purchase orders to restore inventory above safety limits.`,
        category: 'restock',
        linkModule: 'retailer'
      });
      addAuditLog(
        'Batch Threshold Replenishment',
        `Dispatched ${count} restock orders for critical/nearing threshold items.`,
        'success'
      );
    }, 1000);
  };

  if (isBannerHidden) return null;

  const totalAlertCount = allThresholdAlertProducts.length;

  return (
    <div
      id="stock-threshold-notification-system"
      className={`rounded-2xl border transition-all overflow-hidden shadow-2xl relative ${
        totalAlertCount === 0
          ? 'bg-slate-900/90 border-slate-800'
          : outOfStockProducts.length > 0 || criticalLowProducts.length > 0
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-amber-500/40 ring-1 ring-amber-500/20'
          : 'bg-slate-900 border-amber-500/30'
      }`}
    >
      {/* Decorative top alert strip */}
      <div
        className={`h-1.5 w-full ${
          outOfStockProducts.length > 0
            ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-500 animate-pulse'
            : criticalLowProducts.length > 0
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400'
            : totalAlertCount > 0
            ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-emerald-400'
            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
        }`}
      />

      {/* Main Alert Header Banner */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Badge & Context Heading */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl shrink-0 flex items-center justify-center shadow-lg transition-transform ${
              totalAlertCount === 0
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : outOfStockProducts.length > 0
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-red-950/40 animate-pulse'
                : criticalLowProducts.length > 0
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-950/40'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
            }`}
          >
            {totalAlertCount === 0 ? (
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Inventory Minimum Stock Threshold Monitor</span>
              </h2>

              {/* Status Pills */}
              {outOfStockProducts.length > 0 && (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  {outOfStockProducts.length} Out of Stock
                </span>
              )}

              {criticalLowProducts.length > 0 && (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {criticalLowProducts.length} Below Min Threshold
                </span>
              )}

              {nearingThresholdProducts.length > 0 && (
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                  {nearingThresholdProducts.length} Nearing Threshold (&lt;35% buffer)
                </span>
              )}

              {totalAlertCount === 0 && (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  100% Stock Compliant
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
              <span>Synchronized directly with</span>
              <strong className="text-slate-200">InventoryManager live catalog ({products.length} SKUs)</strong>
              <span>•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {healthRate}% Catalog Health
              </span>
            </p>
          </div>
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap">
          {totalAlertCount > 0 && (
            <button
              id="btn-threshold-batch-order"
              onClick={handleBatchRestockAll}
              disabled={isBatchRestocking}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-lg shadow-amber-600/25 flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
              title="Generate replenishment POs for all products below or nearing threshold"
            >
              {isBatchRestocking ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting POs...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
                  <span>Auto-Replenish All ({totalAlertCount})</span>
                </>
              )}
            </button>
          )}

          {onNavigateToInventory && (
            <button
              id="btn-threshold-nav-inventory"
              onClick={onNavigateToInventory}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inventory Manager</span>
            </button>
          )}

          {onNavigateToRestock && (
            <button
              id="btn-threshold-nav-restock"
              onClick={onNavigateToRestock}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" />
              <span>Restock Hub</span>
            </button>
          )}

          <button
            id="btn-toggle-threshold-banner"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
            title={isExpanded ? 'Collapse threshold panel' : 'Expand threshold panel'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

      </div>

      {/* Expandable Notification Content Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-slate-800/80"
          >
            {/* Toolbar Filters: Status chips, category dropdown & live search */}
            <div className="p-3 sm:p-4 bg-slate-950/60 border-b border-slate-800/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              
              {/* Status Segment Controls */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto shrink-0">
                <button
                  id="tab-threshold-all"
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                    selectedFilter === 'all'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Alerts ({totalAlertCount})
                </button>

                <button
                  id="tab-threshold-out"
                  onClick={() => setSelectedFilter('out')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                    selectedFilter === 'out'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Out of Stock ({outOfStockProducts.length})
                </button>

                <button
                  id="tab-threshold-critical"
                  onClick={() => setSelectedFilter('critical')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                    selectedFilter === 'critical'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Below Min ({criticalLowProducts.length})
                </button>

                <button
                  id="tab-threshold-nearing"
                  onClick={() => setSelectedFilter('nearing')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                    selectedFilter === 'nearing'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Nearing Limit ({nearingThresholdProducts.length})
                </button>
              </div>

              {/* Category & Search Input */}
              <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                {alertCategories.length > 1 && (
                  <select
                    id="select-threshold-category"
                    value={activeTabCategory}
                    onChange={(e) => setActiveTabCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 font-semibold text-xs focus:outline-none focus:border-amber-500/50"
                  >
                    {alertCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}

                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="input-threshold-search"
                    type="text"
                    placeholder="Search alert items, brands, barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 placeholder-slate-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* List / Cards of Threshold Alert Products */}
            <div className="p-3 sm:p-4">
              {filteredAlertProducts.length === 0 ? (
                <div className="py-8 px-4 text-center space-y-2.5 bg-slate-950/40 rounded-xl border border-slate-800/50">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-white">All Stock Levels Optimal</div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {searchQuery || activeTabCategory !== 'All' || selectedFilter !== 'all'
                      ? 'No items match your active threshold search criteria.'
                      : 'No inventory items are currently nearing or below their minimum thresholds. The system monitors sales velocity in real-time.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredAlertProducts.map(p => {
                    const isOut = p.stock === 0;
                    const isCritical = p.stock > 0 && p.stock <= p.minThreshold;
                    const isNearing = p.stock > p.minThreshold && p.stock <= Math.ceil(p.minThreshold * 1.35);
                    
                    // Deficit calculation
                    const stockRatio = p.minThreshold > 0 ? (p.stock / p.minThreshold) : 1;
                    const stockPercent = Math.min(100, Math.round(stockRatio * 100));
                    const orderQty = getRecommendedOrderQty(p);
                    const activePO = getActivePO(p.id);
                    const isOrdered = orderedProductIds.includes(p.id);

                    // Estimated days of stock left based on heuristic
                    const estimatedDaysLeft = isOut ? 0 : Math.max(1, Math.round((p.stock / Math.max(1, p.minThreshold)) * 4));

                    return (
                      <div
                        key={p.id}
                        id={`threshold-card-${p.id}`}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                          isOut
                            ? 'bg-slate-950/95 border-red-500/50 shadow-lg shadow-red-950/20 hover:border-red-400'
                            : isCritical
                            ? 'bg-slate-950/90 border-amber-500/40 shadow-lg shadow-amber-950/20 hover:border-amber-400'
                            : 'bg-slate-950/80 border-yellow-500/30 hover:border-yellow-400'
                        }`}
                      >
                        {/* Top: Image, details, stock indicator */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-11 h-11 rounded-lg object-cover border border-slate-800 shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                                {p.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  {p.category}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium truncate">{p.brand}</span>
                              </div>
                              <h4 className="text-xs font-bold text-white mt-0.5 truncate" title={p.name}>
                                {p.name}
                              </h4>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>Unit: ₹{p.sellingPrice}</span>
                                <span>•</span>
                                <span className="font-mono text-slate-500">{p.barcode.slice(-6)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Stock status pill */}
                          <div className="text-right shrink-0 flex flex-col items-end gap-1">
                            <StockStatusBadge stock={p.stock} unit={p.unit} showQuantity={true} size="sm" />
                            <div className="text-[9px] text-slate-500">
                              Min: <strong className="text-slate-300">{p.minThreshold} {p.unit}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Visual Gauge Bar & Deficit Info */}
                        <div className="space-y-1 bg-slate-900/70 p-2 rounded-lg border border-slate-800/60 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Threshold Proximity:</span>
                            <span
                              className={`font-extrabold ${
                                isOut
                                  ? 'text-red-400'
                                  : isCritical
                                  ? 'text-amber-400'
                                  : 'text-yellow-400'
                              }`}
                            >
                              {isOut
                                ? 'OUT OF STOCK (0%)'
                                : isCritical
                                ? `Critical: -${p.minThreshold - p.stock} ${p.unit} Deficit`
                                : `Nearing Threshold: ${p.stock - p.minThreshold} ${p.unit} buffer left`}
                            </span>
                          </div>

                          {/* Progress Meter */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isOut
                                  ? 'bg-red-600'
                                  : isCritical
                                  ? 'bg-gradient-to-r from-red-500 to-amber-500'
                                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              }`}
                              style={{ width: `${Math.max(6, Math.min(100, stockPercent))}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
                            <span>Est. Runway: ~{estimatedDaysLeft} day(s)</span>
                            <span>Target Buffer: {p.minThreshold * 2} {p.unit}</span>
                          </div>
                        </div>

                        {/* Bottom: Inline Quick Restock Action */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                          
                          {/* Qty Counter */}
                          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                            <button
                              onClick={() => handleSetOrderQty(p.id, orderQty - 5)}
                              className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white font-bold"
                              title="Decrease 5"
                            >
                              -
                            </button>
                            <span className="text-[11px] font-bold text-white px-1">
                              {orderQty} {p.unit}
                            </span>
                            <button
                              onClick={() => handleSetOrderQty(p.id, orderQty + 5)}
                              className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white font-bold"
                              title="Increase 5"
                            >
                              +
                            </button>
                          </div>

                          {/* Replenish CTA */}
                          <div>
                            {isOrdered ? (
                              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>PO Placed!</span>
                              </div>
                            ) : activePO ? (
                              <div className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-[10px] flex items-center gap-1">
                                <PackageCheck className="w-3 h-3 text-blue-400" />
                                <span>PO Active</span>
                              </div>
                            ) : (
                              <button
                                id={`btn-quick-restock-${p.id}`}
                                onClick={() => handleQuickRestockItem(p)}
                                className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 active:scale-95 transition-all"
                                title="Instantly generate purchase order for this threshold item"
                              >
                                <Zap className="w-3 h-3 text-emerald-200 fill-emerald-200" />
                                <span>Restock</span>
                              </button>
                            )}
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary Strip */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Threshold Sync Engine • Evaluates every POS scan & inward stock entry</span>
              </div>

              <div className="flex items-center gap-3 font-semibold">
                {onNavigateToInventory && (
                  <button
                    onClick={onNavigateToInventory}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Configure Thresholds in Inventory</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
