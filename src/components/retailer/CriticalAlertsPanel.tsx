import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  AlertTriangle,
  Zap,
  CheckCircle2,
  PackageCheck,
  ShoppingCart,
  ChevronRight,
  TrendingDown,
  Building2,
  Clock,
  RefreshCw,
  Plus,
  Minus,
  Sparkles,
  Search,
  Filter,
  Check
} from 'lucide-react';

interface CriticalAlertsPanelProps {
  onNavigateToRestock?: () => void;
}

export const CriticalAlertsPanel: React.FC<CriticalAlertsPanelProps> = ({ onNavigateToRestock }) => {
  const {
    products,
    wholesalers,
    connections,
    restockOrders,
    sendRestockRequest,
    addNotification,
    addAuditLog
  } = useStore();

  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'nearing'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Custom quick order quantities per product
  const [orderQtyMap, setOrderQtyMap] = useState<Record<string, number>>({});
  // Selected wholesaler per product
  const [selectedWholesalerMap, setSelectedWholesalerMap] = useState<Record<string, string>>({});
  // Feedback status for quick order clicks
  const [recentlyOrderedIds, setRecentlyOrderedIds] = useState<string[]>([]);
  const [isBatchOrdering, setIsBatchOrdering] = useState(false);

  // Connected wholesalers list
  const connectedWholesalerIds = connections
    .filter(c => c.status === 'connected')
    .map(c => c.wholesalerId);

  const connectedWholesalers = wholesalers.filter(w => connectedWholesalerIds.includes(w.id));
  const defaultWholesaler = connectedWholesalers[0] || wholesalers[0] || {
    id: 'ws-101',
    name: 'Metro Mega Distribution Pvt Ltd'
  };

  // Identify products nearing or below reorder threshold
  // Critical: stock <= minThreshold
  // Nearing: stock > minThreshold && stock <= minThreshold * 1.3
  const alertProducts = products.filter(p => {
    const isCritical = p.stock <= p.minThreshold;
    const isNearing = p.stock > p.minThreshold && p.stock <= Math.ceil(p.minThreshold * 1.35);
    return isCritical || isNearing;
  });

  // Unique categories in alert items
  const alertCategories = Array.from(new Set(alertProducts.map(p => p.category)));

  // Filtered list
  const filteredProducts = alertProducts.filter(p => {
    const isCritical = p.stock <= p.minThreshold;
    const isNearing = p.stock > p.minThreshold && p.stock <= Math.ceil(p.minThreshold * 1.35);

    if (alertFilter === 'critical' && !isCritical) return false;
    if (alertFilter === 'nearing' && !isNearing) return false;

    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCat) return false;
    }

    return true;
  });

  const criticalCount = alertProducts.filter(p => p.stock <= p.minThreshold).length;
  const nearingCount = alertProducts.filter(p => p.stock > p.minThreshold && p.stock <= Math.ceil(p.minThreshold * 1.35)).length;

  const getQtyForProduct = (pId: string, minThreshold: number, currentStock: number) => {
    if (orderQtyMap[pId] !== undefined) return orderQtyMap[pId];
    // Default recommended restock quantity = max(20, minThreshold * 3 - currentStock)
    return Math.max(15, (minThreshold * 3) - currentStock);
  };

  const setQtyForProduct = (pId: string, val: number) => {
    setOrderQtyMap(prev => ({ ...prev, [pId]: Math.max(1, val) }));
  };

  const getWholesalerForProduct = (pId: string) => {
    return selectedWholesalerMap[pId] || defaultWholesaler.id;
  };

  const setWholesalerForProduct = (pId: string, wsId: string) => {
    setSelectedWholesalerMap(prev => ({ ...prev, [pId]: wsId }));
  };

  // Find if there's an active PO for a product
  const getActivePOForProduct = (productId: string) => {
    return restockOrders.find(
      ro => ro.productId === productId && ro.status !== 'rejected' && ro.status !== 'delivered'
    );
  };

  // Handle single Quick Order
  const handleQuickOrder = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const qty = getQtyForProduct(productId, product.minThreshold, product.stock);
    const wholesalerId = getWholesalerForProduct(productId);
    const targetWs = wholesalers.find(w => w.id === wholesalerId) || defaultWholesaler;

    sendRestockRequest(productId, qty, wholesalerId);

    setRecentlyOrderedIds(prev => [...prev, productId]);
    setTimeout(() => {
      setRecentlyOrderedIds(prev => prev.filter(id => id !== productId));
    }, 4000);
  };

  // Handle Batch Quick Order All Critical Items
  const handleBatchQuickOrderAll = async () => {
    const criticalItems = alertProducts.filter(p => p.stock <= p.minThreshold);
    if (criticalItems.length === 0) return;

    setIsBatchOrdering(true);
    let count = 0;

    for (const prod of criticalItems) {
      // Check if already has an active PO
      const existingPO = getActivePOForProduct(prod.id);
      if (!existingPO) {
        const qty = getQtyForProduct(prod.id, prod.minThreshold, prod.stock);
        const wsId = getWholesalerForProduct(prod.id);
        sendRestockRequest(prod.id, qty, wsId);
        count++;
      }
    }

    setTimeout(() => {
      setIsBatchOrdering(false);
      addNotification({
        title: 'Batch Quick Orders Submitted',
        message: `Successfully generated ${count} restock PO(s) for critical low-stock products.`,
        category: 'restock',
        linkModule: 'retailer'
      });
      addAuditLog(
        'Batch Quick Restock Submitted',
        `Generated ${count} quick restock purchase orders from Critical Alerts Panel`,
        'success'
      );
    }, 1200);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden transition-all">
      
      {/* Panel Header */}
      <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0 relative mt-0.5">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>Critical Inventory & Reorder Alerts</span>
              </h2>

              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${
                criticalCount > 0
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {criticalCount > 0 ? `${criticalCount} Critical Low` : 'Healthy Stock'}
              </span>

              {nearingCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {nearingCount} Nearing Limit
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Real-time threshold monitoring connected with</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Building2 className="w-3.0 h-3.0" />
                {connectedWholesalers.length} Wholesaler(s)
              </span>
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          {criticalCount > 0 && (
            <button
              onClick={handleBatchQuickOrderAll}
              disabled={isBatchOrdering}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
              title="1-Click Quick Order restock for all critical low-stock products"
            >
              {isBatchOrdering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Submitting POs...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                  <span>Quick Order All Critical ({criticalCount})</span>
                </>
              )}
            </button>
          )}

          {onNavigateToRestock && (
            <button
              onClick={onNavigateToRestock}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <span>Full Restock Hub</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setAlertFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              alertFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Alerts ({alertProducts.length})
          </button>
          <button
            onClick={() => setAlertFilter('critical')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              alertFilter === 'critical'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Critical Low ({criticalCount})
          </button>
          <button
            onClick={() => setAlertFilter('nearing')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              alertFilter === 'nearing'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nearing Limit ({nearingCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          {alertCategories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 font-semibold focus:outline-none focus:border-amber-500/50 text-xs"
            >
              <option value="all">All Categories</option>
              {alertCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 w-36 sm:w-48 placeholder-slate-500"
            />
          </div>
        </div>

      </div>

      {/* Main Alerts List */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center space-y-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div>
              <div className="text-sm font-bold text-white">No Critical Low Stock Alerts</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {alertFilter !== 'all' || searchQuery || selectedCategory !== 'all'
                  ? 'No products match your active search or filter criteria.'
                  : 'All inventory items are currently above their reorder safety thresholds. Live supply chain monitoring active.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredProducts.map(p => {
              const isCritical = p.stock <= p.minThreshold;
              const stockPercent = Math.min(100, Math.round((p.stock / p.minThreshold) * 100));
              const currentQty = getQtyForProduct(p.id, p.minThreshold, p.stock);
              const selectedWholesalerId = getWholesalerForProduct(p.id);
              const activePO = getActivePOForProduct(p.id);
              const isJustOrdered = recentlyOrderedIds.includes(p.id);

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isCritical
                      ? 'bg-slate-950/90 border-red-500/40 hover:border-red-500/70 shadow-lg shadow-red-950/20'
                      : 'bg-slate-950/80 border-amber-500/30 hover:border-amber-500/60'
                  }`}
                >
                  
                  {/* Top Product Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0 font-bold text-sm">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {p.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">{p.brand}</span>
                        </div>

                        <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">{p.name}</h3>

                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>Unit Price: ₹{p.purchasePrice}</span>
                          <span>•</span>
                          <span>SKU: {p.barcode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Status Pill */}
                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg border uppercase inline-flex items-center gap-1 ${
                        isCritical
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        <TrendingDown className="w-3 h-3" />
                        <span>{p.stock} {p.unit}</span>
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Min Threshold: <strong className="text-slate-200">{p.minThreshold} {p.unit}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Stock Level Progress Gauge */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Stock Safety Gauge</span>
                      <span className={isCritical ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                        {isCritical ? `Deficit: -${p.minThreshold - p.stock} ${p.unit}` : `${stockPercent}% of Min Threshold`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical ? 'bg-gradient-to-r from-red-600 to-amber-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(8, stockPercent))}%` }}
                      />
                    </div>
                  </div>

                  {/* Wholesaler Selection & Quantity Adjuster */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
                    
                    {/* Select Wholesaler */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        Select Wholesaler:
                      </label>
                      <select
                        value={selectedWholesalerId}
                        onChange={(e) => setWholesalerForProduct(p.id, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-semibold text-xs focus:outline-none focus:border-amber-500/50 truncate"
                      >
                        {connectedWholesalers.length === 0 ? (
                          <option value="ws-101">Metro Mega Distribution</option>
                        ) : (
                          connectedWholesalers.map(ws => (
                            <option key={ws.id} value={ws.id}>
                              {ws.name} ({ws.rating}★)
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Quantity Selector */}
                    <div className="shrink-0">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 text-center">
                        Order Qty ({p.unit}):
                      </label>
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => setQtyForProduct(p.id, currentQty - 5)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Decrease 5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={currentQty}
                          onChange={(e) => setQtyForProduct(p.id, parseInt(e.target.value) || 1)}
                          className="w-12 bg-transparent text-center font-bold text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => setQtyForProduct(p.id, currentQty + 5)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Increase 5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* One-Click Quick Order Button */}
                    <div className="shrink-0 self-end sm:self-auto">
                      {isJustOrdered ? (
                        <div className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 animate-in zoom-in-95">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>PO Submitted!</span>
                        </div>
                      ) : activePO ? (
                        <div className="px-3 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-xs flex items-center gap-1.5">
                          <PackageCheck className="w-4 h-4 text-blue-400" />
                          <span>PO Pending (#{activePO.id.slice(0, 7)})</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleQuickOrder(p.id)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                          title="Instant 1-Click Quick Order from Wholesaler"
                        >
                          <Zap className="w-3.5 h-3.5 fill-emerald-200 text-emerald-200" />
                          <span>Quick Order</span>
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

    </div>
  );
};
