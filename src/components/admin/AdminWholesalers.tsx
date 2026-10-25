import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import {
  Truck,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  X,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Wholesaler } from '../../types';

export const AdminWholesalers: React.FC = () => {
  const {
    wholesalers,
    wholesalerProducts,
    connections,
    toggleConnectionStatus,
    addWholesaler,
    updateWholesaler,
    deleteWholesaler
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWholesaler, setEditingWholesaler] = useState<Wholesaler | null>(null);

  // New Wholesaler Form
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Mumbai',
    gstin: '',
    category: 'Groceries & Staples',
    minOrderValue: 5000,
    deliveryDays: 2,
    rating: 4.8,
    isVerified: true
  });

  const categories = useMemo(() => {
    const list = Array.from(new Set(wholesalers.map(w => w.category)));
    return ['all', ...list];
  }, [wholesalers]);

  const filteredWholesalers = useMemo(() => {
    return wholesalers.filter(w => {
      const matchSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'all' || w.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [wholesalers, searchQuery, categoryFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      contactPerson: 'Anand Kumar',
      phone: '+91 98330 44556',
      email: 'vendor@b2bdistributors.in',
      address: 'APMC Grain Market, Vashi',
      city: 'Navi Mumbai',
      gstin: '27AABCB1234F1Z1',
      category: 'Groceries & Staples',
      minOrderValue: 5000,
      deliveryDays: 2,
      rating: 4.9,
      isVerified: true
    });
    setIsAddModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.gstin.trim()) return;

    addWholesaler(formData);
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (ws: Wholesaler) => {
    setEditingWholesaler(ws);
    setFormData({
      name: ws.name,
      contactPerson: ws.contactPerson,
      phone: ws.phone,
      email: ws.email,
      address: ws.address,
      city: ws.city,
      gstin: ws.gstin,
      category: ws.category,
      minOrderValue: ws.minOrderValue,
      deliveryDays: ws.deliveryDays,
      rating: ws.rating,
      isVerified: ws.isVerified
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWholesaler || !formData.name.trim()) return;

    updateWholesaler(editingWholesaler.id, formData);
    setEditingWholesaler(null);
  };

  const handleDelete = (id: string, name: string) => {
    deleteWholesaler(id);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Onboard Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-400" />
            <span>B2B Wholesale Supplier Directory ({wholesalers.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage authorized B2B wholesale distributors, catalog links, lead-time SLAs, and trade credit terms.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Onboard Supplier</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, GSTIN, representative, category, or city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0A0E1A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 placeholder-slate-500 shadow-sm"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 shadow-sm capitalize w-full sm:w-auto"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Wholesalers Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWholesalers.map(ws => {
          const catalogCount = wholesalerProducts.filter(p => p.wholesalerId === ws.id).length || 12;
          const activeConn = connections.find(c => c.wholesalerId === ws.id);

          return (
            <div
              key={ws.id}
              className="p-5 rounded-xl bg-[#121826] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 shadow-lg"
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-white tracking-tight">{ws.name}</h3>
                      {ws.isVerified && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-400 font-extrabold flex items-center gap-1 border border-sky-500/30">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-sky-400 block">{ws.category}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(ws)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit vendor profile"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ws.id, ws.name)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div className="p-2 rounded-lg bg-[#0A0E1A] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Min Order</span>
                    <span className="font-bold text-slate-200">₹{ws.minOrderValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0A0E1A] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Lead TAT</span>
                    <span className="font-bold text-slate-200">{ws.deliveryDays} Days</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0A0E1A] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Quality Score</span>
                    <span className="font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {ws.rating}
                    </span>
                  </div>
                </div>

                {/* Contact & GSTIN */}
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-mono text-[10px]">GSTIN:</span>
                    <span className="font-mono font-bold text-slate-300">{ws.gstin}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{ws.phone} • {ws.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{ws.address}, {ws.city}</span>
                  </div>
                </div>
              </div>

              {/* Status & Connection Switch */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300 font-semibold">{catalogCount} Bulk SKUs</span>
                </div>

                {activeConn && (
                  <button
                    onClick={() => toggleConnectionStatus(activeConn.id, activeConn.status === 'approved' ? 'pending' : 'approved')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      activeConn.status === 'approved'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    {activeConn.status === 'approved' ? '✓ Trade Approved' : 'Trade Pending'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ONBOARD WHOLESALER */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#161D2C] border border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-sky-400" />
                  <span>Onboard B2B Wholesale Partner</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Company / Entity Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex FMCG Mega Distributors"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">GSTIN Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="27AABCB1234F1Z1"
                      value={formData.gstin}
                      onChange={e => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Supply Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Groceries & Staples">Groceries & Staples</option>
                      <option value="Beverages & Dairy">Beverages & Dairy</option>
                      <option value="Personal Care & Hygiene">Personal Care & Hygiene</option>
                      <option value="Snacks & Confectionery">Snacks & Confectionery</option>
                      <option value="Household & Cleaning">Household & Cleaning</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Key Account Rep</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={e => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Contact Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Min Order Value (₹)</label>
                    <input
                      type="number"
                      value={formData.minOrderValue}
                      onChange={e => setFormData(prev => ({ ...prev, minOrderValue: Number(e.target.value) }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Dispatch Lead (Days)</label>
                    <input
                      type="number"
                      value={formData.deliveryDays}
                      onChange={e => setFormData(prev => ({ ...prev, deliveryDays: Number(e.target.value) }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Warehouse Address & City</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Onboard Partner
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT WHOLESALER */}
      <AnimatePresence>
        {editingWholesaler && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#161D2C] border border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-sky-400" />
                  <span>Edit Partner: {editingWholesaler.name}</span>
                </h3>
                <button
                  onClick={() => setEditingWholesaler(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">GSTIN</label>
                    <input
                      type="text"
                      required
                      value={formData.gstin}
                      onChange={e => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Min Order (₹)</label>
                    <input
                      type="number"
                      value={formData.minOrderValue}
                      onChange={e => setFormData(prev => ({ ...prev, minOrderValue: Number(e.target.value) }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Lead TAT (Days)</label>
                    <input
                      type="number"
                      value={formData.deliveryDays}
                      onChange={e => setFormData(prev => ({ ...prev, deliveryDays: Number(e.target.value) }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingWholesaler(null)}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
