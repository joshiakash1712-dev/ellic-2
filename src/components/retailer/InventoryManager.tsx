import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Product, normalizeCanonicalRole } from '../../types';
import { BarcodeGeneratorModal } from '../common/BarcodeGeneratorModal';
import { RestockModal } from './RestockModal';
import { InventorySkeleton } from '../common/skeletons/InventorySkeleton';
import { StockStatusBadge } from '../common/StockStatusBadge';
import {
  Package,
  Plus,
  Search,
  Filter,
  QrCode,
  Share2,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Zap,
  Building,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Download,
  FileSpreadsheet,
  FileDown,
  AlertCircle
} from 'lucide-react';

export interface InventoryManagerProps {
  isLoading?: boolean;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ isLoading }) => {
  const {
    products,
    wholesalers,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductSharing,
    sendRestockRequest,
    activeStore,
    currentUser,
    isDataLoading
  } = useStore();
  const { userProfile, currentUser: authUser } = useAuth();

  const isActuallyLoading = isLoading ?? isDataLoading;
  const canonicalRole = normalizeCanonicalRole(currentUser?.role || userProfile?.role);
  const isCrew = canonicalRole === 'crew';
  const isOwnerOrAdmin = canonicalRole === 'super_admin' || canonicalRole === 'ellix_admin' || canonicalRole === 'client';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // CSV Export State
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodeTarget, setBarcodeTarget] = useState<Product | null>(null);
  const [restockTargetProduct, setRestockTargetProduct] = useState<Product | null>(null);

  // Form State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    category: 'Dairy & Eggs',
    brand: '',
    unit: 'pcs',
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    stock: 50,
    minThreshold: 10,
    barcode: '',
    qrCode: '',
    expiryDate: '',
    batchNumber: '',
    warehouseLocation: 'Shelf A-01',
    taxRate: 5,
    sharedWithWholesalers: true,
    description: ''
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = p.stock > 0 && p.stock <= p.minThreshold;
    if (stockFilter === 'out') matchesStock = p.stock === 0;

    return matchesCat && matchesSearch && matchesStock;
  });

  const exportToCSV = (onlyFiltered: boolean = false) => {
    setShowExportMenu(false);
    const listToExport = onlyFiltered ? filteredProducts : products;
    if (listToExport.length === 0) {
      setExportFeedback('No products match current filters to export.');
      setTimeout(() => setExportFeedback(null), 3000);
      return;
    }

    const headers = [
      'Product ID',
      'Product Name',
      'Barcode / SKU',
      'Brand',
      'Category',
      'Stock Quantity',
      'Unit',
      'Min Reorder Threshold',
      'Purchase Price (INR)',
      'Selling Price (INR)',
      'MRP (INR)',
      'GST Tax Rate (%)',
      'Batch Number',
      'Expiry Date',
      'Warehouse Location',
      'Stock Status',
      'Total Valuation (INR)',
      'Shared with Wholesalers'
    ];

    const escapeCsvField = (field: string | number | boolean | undefined | null): string => {
      if (field === undefined || field === null) return '""';
      const str = String(field);
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = listToExport.map(p => {
      const stockStatus = p.stock === 0 ? 'Out of Stock' : p.stock <= p.minThreshold ? 'Low Stock' : 'In Stock';
      const valuation = (p.stock * p.purchasePrice).toFixed(2);
      return [
        escapeCsvField(p.id),
        escapeCsvField(p.name),
        escapeCsvField(p.barcode),
        escapeCsvField(p.brand),
        escapeCsvField(p.category),
        p.stock,
        escapeCsvField(p.unit),
        p.minThreshold,
        p.purchasePrice,
        p.sellingPrice,
        p.mrp,
        p.taxRate,
        escapeCsvField(p.batchNumber),
        escapeCsvField(p.expiryDate),
        escapeCsvField(p.warehouseLocation),
        escapeCsvField(stockStatus),
        valuation,
        escapeCsvField(p.sharedWithWholesalers ? 'Yes' : 'No')
      ].join(',');
    });

    // Prepend UTF-8 BOM so Excel and spreadsheet applications open with proper encoding
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    const sanitizedStore = (activeStore.name || 'Store').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filterTag = onlyFiltered && filteredProducts.length !== products.length ? '-filtered' : '';
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-${sanitizedStore}${filterTag}-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportFeedback(`Exported ${listToExport.length} products to CSV for offline retail management.`);
    setTimeout(() => setExportFeedback(null), 4000);
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      category: 'Dairy & Eggs',
      brand: '',
      unit: 'pcs',
      purchasePrice: 100,
      sellingPrice: 140,
      mrp: 150,
      stock: 40,
      minThreshold: 10,
      barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      qrCode: `ELLIC-P-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: '2027-12-31',
      batchNumber: `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      warehouseLocation: 'Shelf A-02',
      taxRate: 12,
      sharedWithWholesalers: true,
      description: ''
    });
    setEditingProduct(null);
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormErrors({});
    setFormData({
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      unit: prod.unit,
      purchasePrice: prod.purchasePrice,
      sellingPrice: prod.sellingPrice,
      mrp: prod.mrp,
      stock: prod.stock,
      minThreshold: prod.minThreshold,
      barcode: prod.barcode,
      qrCode: prod.qrCode,
      expiryDate: prod.expiryDate || '',
      batchNumber: prod.batchNumber || '',
      warehouseLocation: prod.warehouseLocation || '',
      taxRate: prod.taxRate,
      sharedWithWholesalers: prod.sharedWithWholesalers,
      description: prod.description || ''
    });
    setIsAddModalOpen(true);
  };

  const validateInventoryForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = 'Enter a product name.';
    }
    const numSelling = Number(formData.sellingPrice);
    if (isNaN(numSelling) || numSelling <= 0) {
      errs.sellingPrice = 'Selling price must be greater than 0.';
    }
    const numPurchase = Number(formData.purchasePrice);
    if (isNaN(numPurchase) || numPurchase < 0) {
      errs.purchasePrice = 'Purchase price cannot be negative.';
    }
    const numMrp = Number(formData.mrp);
    if (isNaN(numMrp) || numMrp < 0) {
      errs.mrp = 'MRP cannot be negative.';
    }
    const numStock = Number(formData.stock);
    if (isNaN(numStock) || numStock < 0) {
      errs.stock = 'Stock cannot be negative.';
    }
    const numThreshold = Number(formData.minThreshold);
    if (isNaN(numThreshold) || numThreshold < 0) {
      errs.minThreshold = 'Threshold cannot be negative.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInventoryForm()) return;
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        storeId: activeStore.id,
        clientId: activeStore.clientId || 'client-001'
      });
    } else {
      addProduct({
        ...formData,
        storeId: activeStore.id,
        clientId: activeStore.clientId || 'client-001',
        createdBy: userProfile?.name || currentUser?.name || authUser?.displayName || 'Store Staff',
        createdById: authUser?.uid || currentUser?.id || 'staff'
      });
    }
    setIsAddModalOpen(false);
  };

  if (isActuallyLoading) {
    return <InventorySkeleton />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>Enterprise Inventory Engine</span>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold tabular-nums">
              {products.length} Products
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Warehouse location tracking, batch numbers, barcode labels & wholesaler auto-restock triggers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export Button & Menu for Offline Retail Management */}
          <div className="relative">
            <div className="flex items-center rounded-lg bg-slate-800 border border-slate-700/90 shadow-sm overflow-hidden">
              <button
                id="btn-export-inventory-csv"
                onClick={() => exportToCSV(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-700 flex items-center gap-2 transition-all"
                title="Export entire inventory as CSV for offline retail management"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export CSV</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0A0E1A] text-emerald-300 font-mono tabular-nums">
                  {products.length}
                </span>
              </button>
              
              {filteredProducts.length !== products.length && (
                <button
                  id="btn-export-csv-options"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-2 py-2 border-l border-slate-700/80 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Export options (All vs Filtered)"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Menu for Filtered vs All */}
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-[#161D2C] border border-slate-700 shadow-2xl py-1.5 z-30 space-y-1">
                <button
                  onClick={() => exportToCSV(false)}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>All Products</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 tabular-nums">{products.length} items</span>
                </button>
                <button
                  onClick={() => exportToCSV(true)}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-slate-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Current Filtered View</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold tabular-nums">{filteredProducts.length} items</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Export Confirmation Feedback */}
      {exportFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{exportFeedback}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/20 px-2 py-0.5 rounded-lg">
            UTF-8 Excel / POS Ready
          </span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#121826] border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter by Product Name, SKU Barcode, or Brand..."
            className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border ${
              stockFilter === 'all'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            All Products
          </button>

          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border ${
              stockFilter === 'low'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Low Stock
          </button>

          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border ${
              stockFilter === 'out'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Out of Stock
          </button>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-emerald-500 shrink-0"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {filteredProducts.length !== products.length && (
            <button
              id="btn-export-filtered-csv-chip"
              onClick={() => exportToCSV(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all shrink-0"
              title="Export only these filtered items as CSV"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Filtered ({filteredProducts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Inventory Display Section */}
      <div className="p-3 sm:p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-xl overflow-hidden">
        
        {/* Mobile Product Card Layout (Visible on small screens) */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filteredProducts.map(prod => {
            const isLowStock = prod.stock <= prod.minThreshold;

            return (
              <div
                key={prod.id}
                className={`p-3.5 rounded-xl border bg-slate-950/80 space-y-3 ${
                  isLowStock ? 'border-amber-500/40' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-sm flex flex-wrap items-center gap-1.5">
                      <span>{prod.name}</span>
                      {prod.stock <= 10 && (
                        <StockStatusBadge stock={prod.stock} />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {prod.category} • <span className="text-slate-300 font-semibold">{prod.brand}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-emerald-400 text-sm">₹{prod.sellingPrice}</div>
                    <div className="text-[10px] text-slate-500">MRP: ₹{prod.mrp}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Stock Level</span>
                    <div className="font-black text-slate-200">
                      {prod.stock} {prod.unit}
                    </div>
                    <div className="mt-1">
                      <StockStatusBadge stock={prod.stock} />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Min: {prod.minThreshold}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Barcode & Shelf</span>
                    <span className="font-mono text-emerald-400 font-bold block truncate">{prod.barcode}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Building className="w-2.5 h-2.5" />
                      <span>{prod.warehouseLocation || 'Shelf A'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 gap-2">
                  <button
                    onClick={() => isOwnerOrAdmin && toggleProductSharing(prod.id)}
                    disabled={!isOwnerOrAdmin}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                      prod.sharedWithWholesalers
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    } ${!isOwnerOrAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {prod.sharedWithWholesalers ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{prod.sharedWithWholesalers ? 'Shared' : 'Private'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setRestockTargetProduct(prod)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all ${
                        isLowStock
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                      title="Restock Product & Log Intake"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Restock</span>
                    </button>

                    <button
                      onClick={() => setBarcodeTarget(prod)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-300 active:scale-95"
                      title="Print / View Barcode"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {isOwnerOrAdmin && (
                      <>
                        <button
                          onClick={() => handleEditProduct(prod)}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 active:scale-95"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="p-2 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 active:scale-95"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Product Name</th>
                <th className="pb-3">Category & Brand</th>
                <th className="pb-3">Barcode / Location</th>
                <th className="pb-3">Stock & Threshold</th>
                <th className="pb-3">Buy / Sell Price</th>
                <th className="pb-3">Wholesaler Sync</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map(prod => {
                const isLowStock = prod.stock <= prod.minThreshold;

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3">
                      <div className="font-bold text-white flex flex-wrap items-center gap-1.5">
                        <span>{prod.name}</span>
                        {prod.stock <= 10 && (
                          <StockStatusBadge stock={prod.stock} />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">Batch: {prod.batchNumber || 'N/A'} | Tax: {prod.taxRate}%</div>
                    </td>

                    <td className="py-3">
                      <span className="font-semibold text-slate-200">{prod.category}</span>
                      <div className="text-[10px] text-slate-400">{prod.brand}</div>
                    </td>

                    <td className="py-3">
                      <div className="font-mono text-emerald-400 font-semibold">{prod.barcode}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Building className="w-2.5 h-2.5" />
                        <span>{prod.warehouseLocation || 'Shelf A'}</span>
                      </div>
                    </td>

                    <td className="py-3 tabular-nums">
                      <div className="flex flex-col gap-1 items-start">
                        <div className="font-black text-sm text-white">
                          {prod.stock} {prod.unit}
                        </div>
                        <StockStatusBadge stock={prod.stock} />
                        <div className="text-[10px] text-slate-500">Min: {prod.minThreshold} {prod.unit}</div>
                      </div>
                    </td>

                    <td className="py-3 tabular-nums">
                      <div className="font-bold text-slate-200">₹{prod.sellingPrice}</div>
                      <div className="text-[10px] text-slate-500">Cost: ₹{prod.purchasePrice}</div>
                    </td>

                    <td className="py-3">
                      <button
                        onClick={() => isOwnerOrAdmin && toggleProductSharing(prod.id)}
                        disabled={!isOwnerOrAdmin}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-colors ${
                          prod.sharedWithWholesalers
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        } ${!isOwnerOrAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title={isOwnerOrAdmin ? 'Click to toggle sharing stock visibility with connected Wholesalers' : 'Only store owner can change wholesaler sharing'}
                      >
                        {prod.sharedWithWholesalers ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
                        <span>{prod.sharedWithWholesalers ? 'Shared' : 'Private'}</span>
                      </button>
                    </td>

                    <td className="py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setRestockTargetProduct(prod)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm ${
                            isLowStock
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40'
                          }`}
                          title="Restock Product Inventory"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Restock</span>
                        </button>

                        <button
                          onClick={() => setBarcodeTarget(prod)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
                          title="Print / View Barcode"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {isOwnerOrAdmin && (
                          <>
                            <button
                              onClick={() => handleEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => deleteProduct(prod.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0E1A]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#161D2C] border border-slate-700/80 text-slate-100 rounded-2xl w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#121826] shrink-0">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Edit Product Details' : 'Add Product to Inventory'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors(prev => { const n = { ...prev }; delete n.name; return n; });
                    }}
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-white transition-colors ${
                      formErrors.name
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Grains & Pulses">Grains & Pulses</option>
                    <option value="Oils & Spices">Oils & Spices</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Snacks & Nuts">Snacks & Nuts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs, kg, ltr, box"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Tax Rate %</label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Purchase Price ₹</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.purchasePrice}
                    onChange={e => {
                      setFormData({ ...formData, purchasePrice: Number(e.target.value) });
                      if (formErrors.purchasePrice) setFormErrors(prev => { const n = { ...prev }; delete n.purchasePrice; return n; });
                    }}
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-white transition-colors ${
                      formErrors.purchasePrice
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.purchasePrice && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.purchasePrice}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Selling Price ₹ *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={e => {
                      setFormData({ ...formData, sellingPrice: Number(e.target.value) });
                      if (formErrors.sellingPrice) setFormErrors(prev => { const n = { ...prev }; delete n.sellingPrice; return n; });
                    }}
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-white transition-colors ${
                      formErrors.sellingPrice
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.sellingPrice && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.sellingPrice}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">MRP ₹</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.mrp}
                    onChange={e => {
                      setFormData({ ...formData, mrp: Number(e.target.value) });
                      if (formErrors.mrp) setFormErrors(prev => { const n = { ...prev }; delete n.mrp; return n; });
                    }}
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-white transition-colors ${
                      formErrors.mrp
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.mrp && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.mrp}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={e => {
                      setFormData({ ...formData, stock: Number(e.target.value) });
                      if (formErrors.stock) setFormErrors(prev => { const n = { ...prev }; delete n.stock; return n; });
                    }}
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-white transition-colors ${
                      formErrors.stock
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.stock && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.stock}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minThreshold}
                    onChange={e => {
                      setFormData({ ...formData, minThreshold: Number(e.target.value) });
                      if (formErrors.minThreshold) setFormErrors(prev => { const n = { ...prev }; delete n.minThreshold; return n; });
                    }}
                    className={`w-full bg-slate-800 border rounded-lg p-2 text-white transition-colors ${
                      formErrors.minThreshold
                        ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                        : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.minThreshold && (
                    <p className="text-[10px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.minThreshold}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Warehouse Location</label>
                  <input
                    type="text"
                    value={formData.warehouseLocation}
                    onChange={e => setFormData({ ...formData, warehouseLocation: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sharedWithWholesalers}
                    onChange={e => setFormData({ ...formData, sharedWithWholesalers: e.target.checked })}
                    className="accent-emerald-500 rounded"
                  />
                  <span>Share stock visibility with connected Wholesalers</span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Barcode SVG Generator Modal */}
      <BarcodeGeneratorModal
        product={barcodeTarget}
        isOpen={!!barcodeTarget}
        onClose={() => setBarcodeTarget(null)}
      />

      {/* Real Manual Restock & Intake Audit Modal */}
      <RestockModal
        product={restockTargetProduct}
        isOpen={!!restockTargetProduct}
        onClose={() => setRestockTargetProduct(null)}
        onSuccess={msg => setExportFeedback(msg)}
      />

    </div>
  );
};
