import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  Search,
  Globe,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Layers,
  X,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Store } from '../../types';

interface AdminStoresProps {
  onOpenAddStore?: () => void;
}

export const AdminStores: React.FC<AdminStoresProps> = () => {
  const {
    stores,
    activeStore,
    setActiveStore,
    addStore,
    updateStore,
    deleteStore,
    products,
    invoices,
    employees
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [selectedStoreDetail, setSelectedStoreDetail] = useState<Store | null>(null);

  // New store form state
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Mumbai',
    gstin: '',
    timings: '09:00 AM - 10:00 PM',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=60',
    latitude: 19.0760,
    longitude: 72.8777,
    isOnline: true
  });

  const cities = useMemo(() => {
    const list = Array.from(new Set(stores.map(s => s.city)));
    return ['all', ...list];
  }, [stores]);

  const filteredStores = useMemo(() => {
    return stores.filter(s => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = cityFilter === 'all' || s.city === cityFilter;
      return matchSearch && matchCity;
    });
  }, [stores, searchQuery, cityFilter]);

  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const showStatusFeedback = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      ownerName: 'Vikram Patel',
      phone: '+91 98200 11223',
      email: 'branch@ellic.in',
      address: 'Main Commercial High Street',
      city: 'Mumbai',
      gstin: '27AAAAA0000A1Z5',
      timings: '09:00 AM - 10:00 PM',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=60',
      latitude: 19.0760,
      longitude: 72.8777,
      isOnline: true
    });
    setIsAddModalOpen(true);
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.gstin.trim()) return;

    addStore(formData);
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      ownerName: store.ownerName,
      phone: store.phone,
      email: store.email,
      address: store.address,
      city: store.city,
      gstin: store.gstin,
      timings: store.timings,
      image: store.image || '',
      latitude: store.latitude,
      longitude: store.longitude,
      isOnline: store.isOnline
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore || !formData.name.trim()) return;

    updateStore(editingStore.id, formData);
    setEditingStore(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (stores.length <= 1) {
      showStatusFeedback('Cannot decommission the only registered store outlet.');
      return;
    }
    deleteStore(id);
    showStatusFeedback(`Decommissioned store outlet "${name}".`);
  };

  return (
    <div className="space-y-6">
      {statusFeedback && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>{statusFeedback}</span>
          <button onClick={() => setStatusFeedback(null)} className="text-amber-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span>Multi-Branch Outlet Fleet ({stores.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Provision branch locations, allocate GSTIN credentials, assign store managers, and inspect store metrics.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Provision Branch</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search branches by store name, GSTIN, city, manager, or address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0A0E1A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 placeholder-slate-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 shadow-sm capitalize w-full sm:w-auto"
          >
            {cities.map(c => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Cities' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map(st => {
          const isCurrent = activeStore.id === st.id;
          const storeSkusCount = products.filter(p => p.storeId === st.id).length || products.length;
          const storeEmployeesCount = employees.filter(e => e.storeId === st.id).length || 1;

          return (
            <div
              key={st.id}
              className={`p-5 rounded-xl bg-[#121826] border transition-all flex flex-col justify-between gap-4 shadow-lg ${
                isCurrent ? 'border-sky-500/60 shadow-blue-500/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Store Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white tracking-tight">{st.name}</h3>
                      {isCurrent && (
                        <span className="text-[9px] px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-400 font-extrabold border border-sky-500/30">
                          Active Branch
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{st.city} • {st.timings}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(st)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit branch details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {stores.length > 1 && (
                      <button
                        onClick={() => handleDelete(st.id, st.name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Decommission branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0A0E1A] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">GSTIN Registered</span>
                    <span className="font-mono font-bold text-slate-200 text-[11px] truncate block">{st.gstin}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0A0E1A] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Store Manager</span>
                    <span className="font-bold text-slate-200 truncate block">{st.ownerName}</span>
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{st.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{st.address}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${st.isOnline ? 'bg-sky-400' : 'bg-slate-500'}`} />
                  <span className="text-slate-300 font-medium">{st.isOnline ? 'POS Online' : 'Offline'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStoreDetail(st)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                  >
                    Quick Specs
                  </button>
                  {!isCurrent && (
                    <button
                      onClick={() => setActiveStore(st)}
                      className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-sky-300 hover:text-white border border-sky-500/30 text-[11px] font-bold transition-all"
                    >
                      Switch To
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD STORE */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#161D2C] border border-slate-700/80 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-400" />
                  <span>Provision New Store Outlet</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateStore} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Store / Outlet Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ellic Supermart - Bandra West"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">GSTIN Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="27AAAAA0000A1Z5"
                      value={formData.gstin}
                      onChange={e => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Branch Manager</label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={e => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Operating Hours</label>
                    <input
                      type="text"
                      value={formData.timings}
                      onChange={e => setFormData(prev => ({ ...prev, timings: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
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
                    Provision Branch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT STORE */}
      <AnimatePresence>
        {editingStore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#161D2C] border border-slate-700/80 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-sky-400" />
                  <span>Edit Branch: {editingStore.name}</span>
                </h3>
                <button
                  onClick={() => setEditingStore(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Store / Outlet Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">GSTIN</label>
                    <input
                      type="text"
                      required
                      value={formData.gstin}
                      onChange={e => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Branch Manager</label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={e => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingStore(null)}
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

      {/* QUICK SPECS DRAWER MODAL */}
      <AnimatePresence>
        {selectedStoreDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#161D2C] border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-400" />
                  <span>Branch Specs: {selectedStoreDetail.name}</span>
                </h3>
                <button
                  onClick={() => setSelectedStoreDetail(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0A0E1A] border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold">Store Tenant UID</div>
                  <div className="font-mono text-slate-200 font-bold">{selectedStoreDetail.id}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[#0A0E1A] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">POS Terminals</span>
                    <span className="text-base font-black text-white">2 Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0A0E1A] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Staff Assigned</span>
                    <span className="text-base font-black text-white">
                      {employees.filter(e => e.storeId === selectedStoreDetail.id).length || 2} Users
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0A0E1A] border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold">Physical Dispatch Address</div>
                  <div className="text-slate-200">{selectedStoreDetail.address}, {selectedStoreDetail.city}</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStoreDetail(null)}
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                Close Specs
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
