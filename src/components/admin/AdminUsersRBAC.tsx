import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import {
  ShieldCheck,
  Users,
  Plus,
  Trash2,
  Edit,
  KeyRound,
  Lock,
  Building2,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
  Layers,
  UserCheck,
  UserX,
  Shield,
  Clock,
  RotateCcw,
  List,
  LayoutGrid,
  CheckSquare,
  Square,
  MinusSquare,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Employee, UserRole } from '../../types';

export const AdminUsersRBAC: React.FC = () => {
  const {
    employees,
    stores,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    batchUpdateEmployees,
    batchDeleteEmployees,
    addAuditLog
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Batch Action Modals & Confirmation States
  const [batchActionType, setBatchActionType] = useState<
    'role' | 'deactivate' | 'activate' | 'store' | 'shift' | 'reset_pin' | 'delete' | '2fa' | null
  >(null);
  const [batchRoleStep, setBatchRoleStep] = useState<'select' | 'confirm'>('select');
  const [batchRole, setBatchRole] = useState<UserRole>('cashier');
  const [batchStoreId, setBatchStoreId] = useState<string>(stores[0]?.id || 'store-101');
  const [batchShift, setBatchShift] = useState<string>('Morning (09:00 AM - 05:00 PM)');
  const [batchFeedback, setBatchFeedback] = useState<string | null>(null);

  // Safety Confirmation Checkboxes
  const [batchRoleCheck, setBatchRoleCheck] = useState<boolean>(false);
  const [batchDeactivateCheck, setBatchDeactivateCheck] = useState<boolean>(false);
  const [batchDeleteCheck, setBatchDeleteCheck] = useState<boolean>(false);

  // Helper to safely close batch modal and reset confirmation states
  const closeBatchModal = () => {
    setBatchActionType(null);
    setBatchRoleStep('select');
    setBatchRoleCheck(false);
    setBatchDeactivateCheck(false);
    setBatchDeleteCheck(false);
  };

  const openBatchModal = (type: 'role' | 'deactivate' | 'activate' | 'store' | 'shift' | 'reset_pin' | 'delete' | '2fa') => {
    setBatchRoleStep('select');
    setBatchRoleCheck(false);
    setBatchDeactivateCheck(false);
    setBatchDeleteCheck(false);
    setBatchActionType(type);
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    role: 'cashier' as UserRole,
    phone: '',
    email: '',
    pin: '1234',
    shift: 'Morning (09:00 AM - 05:00 PM)',
    storeId: stores[0]?.id || 'store-101',
    active: true,
    totalSalesHandled: 0,
    twoFactorEnabled: false
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery);
      const matchRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && emp.active) ||
        (statusFilter === 'suspended' && !emp.active);
      return matchSearch && matchRole && matchStatus;
    });
  }, [employees, searchQuery, roleFilter, statusFilter]);

  const selectedEmployees = useMemo(() => {
    return employees.filter(emp => selectedIds.includes(emp.id));
  }, [employees, selectedIds]);

  // Selection helpers
  const isAllFilteredSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every(emp => selectedIds.includes(emp.id));

  const isSomeFilteredSelected =
    filteredEmployees.some(emp => selectedIds.includes(emp.id)) && !isAllFilteredSelected;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filteredEmployees.map(e => e.id));
      setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      const combined = Array.from(new Set([...selectedIds, ...filteredEmployees.map(e => e.id)]));
      setSelectedIds(combined);
    }
  };

  const handleToggleSelectUser = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleQuickSelect = (type: 'all' | 'active' | 'suspended' | 'cashiers' | 'none') => {
    if (type === 'none') {
      setSelectedIds([]);
    } else if (type === 'all') {
      setSelectedIds(employees.map(e => e.id));
    } else if (type === 'active') {
      setSelectedIds(employees.filter(e => e.active).map(e => e.id));
    } else if (type === 'suspended') {
      setSelectedIds(employees.filter(e => !e.active).map(e => e.id));
    } else if (type === 'cashiers') {
      setSelectedIds(employees.filter(e => e.role === 'cashier').map(e => e.id));
    }
  };

  // Trigger feedback toast
  const showFeedback = (msg: string) => {
    setBatchFeedback(msg);
    setTimeout(() => setBatchFeedback(null), 4000);
  };

  // Batch Execution Handlers
  const handleExecuteBatchRole = () => {
    if (selectedIds.length === 0) return;
    batchUpdateEmployees(
      selectedIds,
      { role: batchRole },
      `Assigned role "${batchRole.replace('_', ' ')}" to ${selectedIds.length} staff accounts`
    );
    showFeedback(`Successfully updated role to "${batchRole.replace('_', ' ')}" for ${selectedIds.length} staff member(s).`);
    closeBatchModal();
    setSelectedIds([]);
  };

  const handleExecuteBatchDeactivate = () => {
    if (selectedIds.length === 0) return;
    batchUpdateEmployees(
      selectedIds,
      { active: false, status: 'inactive' },
      `Deactivated ${selectedIds.length} staff accounts (revoked POS login credentials)`
    );
    showFeedback(`Deactivated ${selectedIds.length} staff accounts. Access has been suspended.`);
    closeBatchModal();
    setSelectedIds([]);
  };

  const handleExecuteBatchActivate = () => {
    if (selectedIds.length === 0) return;
    batchUpdateEmployees(
      selectedIds,
      { active: true, status: 'active' },
      `Re-activated ${selectedIds.length} staff accounts and restored terminal permissions`
    );
    showFeedback(`Activated ${selectedIds.length} staff accounts. Terminal access restored.`);
    closeBatchModal();
    setSelectedIds([]);
  };

  const handleExecuteBatchStore = () => {
    if (selectedIds.length === 0) return;
    const targetStore = stores.find(s => s.id === batchStoreId);
    batchUpdateEmployees(
      selectedIds,
      { storeId: batchStoreId },
      `Reassigned ${selectedIds.length} staff to outlet "${targetStore?.name || batchStoreId}"`
    );
    showFeedback(`Reassigned ${selectedIds.length} staff members to ${targetStore?.name || 'Selected Outlet'}.`);
    closeBatchModal();
    setSelectedIds([]);
  };

  const handleExecuteBatchShift = () => {
    if (selectedIds.length === 0) return;
    batchUpdateEmployees(
      selectedIds,
      { shift: batchShift },
      `Assigned shift "${batchShift}" to ${selectedIds.length} staff accounts`
    );
    showFeedback(`Updated shift schedule to "${batchShift}" for ${selectedIds.length} staff accounts.`);
    closeBatchModal();
    setSelectedIds([]);
  };

  const handleExecuteBatchResetPin = () => {
    if (selectedIds.length === 0) return;
    // Generate individual random pins
    selectedIds.forEach(id => {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      updateEmployee(id, { pin: newPin });
    });
    addAuditLog('Batch PIN Reset', `Generated fresh security PINs for ${selectedIds.length} staff accounts`);
    showFeedback(`Reset terminal security PINs for ${selectedIds.length} staff accounts.`);
    closeBatchModal();
    setSelectedIds([]);
  };

  const handleExecuteBatch2FA = (enable: boolean) => {
    if (selectedIds.length === 0) return;
    batchUpdateEmployees(
      selectedIds,
      { twoFactorEnabled: enable },
      `${enable ? 'Enforced' : 'Disabled'} 2FA policy for ${selectedIds.length} staff accounts`
    );
    showFeedback(`${enable ? 'Enforced' : 'Disabled'} Two-Factor Authentication for ${selectedIds.length} accounts.`);
    closeBatchModal();
    setSelectedIds([]);
  };

  const handleExecuteBatchDelete = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    batchDeleteEmployees(selectedIds);
    showFeedback(`Permanently removed ${count} staff account(s) from system roster.`);
    closeBatchModal();
    setSelectedIds([]);
  };

  // Single User Handlers
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      role: 'cashier',
      phone: '+91 98111 22334',
      email: 'staff@ellic.com',
      pin: '2580',
      shift: 'General (10:00 AM - 07:00 PM)',
      storeId: stores[0]?.id || 'store-101',
      active: true,
      totalSalesHandled: 0,
      twoFactorEnabled: true
    });
    setIsAddModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    addEmployee(formData);
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      role: emp.role,
      phone: emp.phone,
      email: emp.email,
      pin: emp.pin,
      shift: emp.shift,
      storeId: emp.storeId,
      active: emp.active,
      totalSalesHandled: emp.totalSalesHandled,
      twoFactorEnabled: (emp as any).twoFactorEnabled ?? true
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !formData.name.trim()) return;

    updateEmployee(editingEmployee.id, formData);
    setEditingEmployee(null);
  };

  const handleToggleActive = (emp: Employee) => {
    const nextState = !emp.active;
    updateEmployee(emp.id, { active: nextState, status: nextState ? 'active' : 'inactive' });
    addAuditLog('Staff Status Changed', `${emp.name} set to ${nextState ? 'Active' : 'Suspended'}`);
  };

  const handleDelete = (id: string, name: string) => {
    deleteEmployee(id);
    setSelectedIds(prev => prev.filter(item => item !== id));
    showFeedback(`Removed staff record for "${name}".`);
  };

  const handleResetPin = (emp: Employee) => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    updateEmployee(emp.id, { pin: randomPin });
    showFeedback(`Security PIN for ${emp.name} reset to: ${randomPin}`);
  };

  // RBAC Matrix definitions
  const rbacMatrix = [
    { module: 'Point of Sale (POS) Billing', owner: true, manager: true, cashier: true, inventory_manager: false, wholesaler_admin: false },
    { module: 'Price & Discount Overrides', owner: true, manager: true, cashier: false, inventory_manager: false, wholesaler_admin: false },
    { module: 'Inventory Stock In / Adjustments', owner: true, manager: true, cashier: false, inventory_manager: true, wholesaler_admin: true },
    { module: 'Wholesale Restock PO Approval', owner: true, manager: true, cashier: false, inventory_manager: false, wholesaler_admin: true },
    { module: 'GST Ledger & Tax Reports Export', owner: true, manager: true, cashier: false, inventory_manager: false, wholesaler_admin: true },
    { module: 'Staff PIN & Permission Control', owner: true, manager: false, cashier: false, inventory_manager: false, wholesaler_admin: false },
    { module: 'Hardware Thermal Printer Config', owner: true, manager: true, cashier: false, inventory_manager: false, wholesaler_admin: false },
    { module: 'Database Backup & JSON Snapshot Restore', owner: true, manager: false, cashier: false, inventory_manager: false, wholesaler_admin: false }
  ];

  return (
    <div className="space-y-6 tabular-nums">
      
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <span>Staff Roster & Role-Based Access Control ({employees.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage permissions, perform multi-account batch updates (role reassignment, bulk deactivation), and configure enterprise access hierarchies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {batchFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{batchFeedback}</span>
            </div>
            <button
              onClick={() => setBatchFeedback(null)}
              className="text-sky-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search, Filters, Selection & View Controls */}
      <div className="p-4 rounded-xl bg-[#121826] border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by full name, email, phone number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0A0E1A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 placeholder-slate-500 shadow-sm"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-[#0A0E1A] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 shadow-sm capitalize w-full sm:w-auto"
          >
            <option value="all">All Roles</option>
            <option value="owner">Franchise Owner</option>
            <option value="manager">Store Manager</option>
            <option value="cashier">POS Cashier</option>
            <option value="inventory_manager">Inventory Specialist</option>
            <option value="wholesaler_admin">Wholesale Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-[#0A0E1A] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 shadow-sm w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts Only</option>
            <option value="suspended">Suspended Accounts Only</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#0A0E1A] p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Detailed Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Master Selection & Quick Presets Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            {/* Select All Checkbox Button */}
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold cursor-pointer group select-none"
            >
              <span className="text-sky-400">
                {isAllFilteredSelected ? (
                  <CheckSquare className="w-4 h-4" />
                ) : isSomeFilteredSelected ? (
                  <MinusSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                )}
              </span>
              <span>
                {selectedIds.length > 0
                  ? `Selected (${selectedIds.length} of ${employees.length})`
                  : 'Select All Visible'}
              </span>
            </button>

            {/* Quick Preset Badges */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-slate-600">|</span>
              <span>Quick Select:</span>
              <button
                onClick={() => handleQuickSelect('active')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-400 transition-colors"
              >
                Active
              </button>
              <button
                onClick={() => handleQuickSelect('suspended')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition-colors"
              >
                Suspended
              </button>
              <button
                onClick={() => handleQuickSelect('cashiers')}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-400 transition-colors"
              >
                Cashiers
              </button>
              {selectedIds.length > 0 && (
                <button
                  onClick={() => handleQuickSelect('none')}
                  className="px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors font-semibold"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Showing <span className="font-bold text-white">{filteredEmployees.length}</span> of {employees.length} staff
          </div>
        </div>
      </div>

      {/* FLOATING / STICKY BATCH ACTIONS BAR (Appears when 1+ users are selected) */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            className="p-4 rounded-xl bg-gradient-to-r from-blue-950 via-[#121826] to-[#121826] border-2 border-sky-500/60 shadow-2xl shadow-blue-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">
                    {selectedIds.length} Staff Member{selectedIds.length > 1 ? 's' : ''} Selected
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Batch Actions Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Apply role promotions, bulk account deactivations, branch transfers, or security policies.
                </p>
              </div>
            </div>

            {/* Batch Action Buttons Group */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Batch Role Assignment */}
              <button
                onClick={() => openBatchModal('role')}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 shadow-sm flex items-center gap-1.5 transition-colors"
                title="Assign role to all selected users"
              >
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>Assign Role</span>
              </button>

              {/* Batch Deactivate */}
              <button
                onClick={() => openBatchModal('deactivate')}
                className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 shadow-sm flex items-center gap-1.5 transition-colors"
                title="Suspend access for selected users"
              >
                <UserX className="w-3.5 h-3.5 text-rose-400" />
                <span>Deactivate</span>
              </button>

              {/* Batch Activate */}
              <button
                onClick={() => openBatchModal('activate')}
                className="px-3 py-2 rounded-lg bg-sky-500/10 hover:bg-blue-500/20 text-sky-300 text-xs font-bold border border-sky-500/30 shadow-sm flex items-center gap-1.5 transition-colors"
                title="Re-enable access for selected users"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Activate</span>
              </button>

              {/* Batch Branch Assign */}
              <button
                onClick={() => openBatchModal('store')}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm flex items-center gap-1.5 transition-colors"
                title="Reassign selected users to outlet"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Transfer Branch</span>
              </button>

              {/* Batch Shift Assign */}
              <button
                onClick={() => openBatchModal('shift')}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm flex items-center gap-1.5 transition-colors"
                title="Assign shift schedule"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Set Shift</span>
              </button>

              {/* Batch Reset PIN */}
              <button
                onClick={() => openBatchModal('reset_pin')}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm flex items-center gap-1.5 transition-colors"
                title="Bulk reset POS security PINs"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset PINs</span>
              </button>

              {/* Batch Delete */}
              <button
                onClick={() => openBatchModal('delete')}
                className="px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs font-bold border border-rose-800/60 shadow-sm flex items-center gap-1.5 transition-colors"
                title="Bulk delete selected users"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>

              {/* Cancel Selection */}
              <button
                onClick={() => setSelectedIds([])}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Deselect All"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER VIEW: CARD GRID OR DETAILED TABLE */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => {
            const isSelected = selectedIds.includes(emp.id);
            const storeAssigned = stores.find(s => s.id === emp.storeId) || stores[0];

            return (
              <div
                key={emp.id}
                onClick={() => handleToggleSelectUser(emp.id)}
                className={`p-5 rounded-xl bg-[#121826] border transition-all flex flex-col justify-between gap-4 shadow-lg cursor-pointer select-none relative ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-blue-500/40 bg-blue-950/20'
                    : emp.active
                    ? 'border-slate-800 hover:border-slate-700'
                    : 'border-rose-900/40 bg-rose-950/10 hover:border-rose-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Header Row with Checkbox */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {/* Checkbox Trigger */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleSelectUser(emp.id, e)}
                        className="mt-0.5 p-1 rounded-lg hover:bg-slate-800 transition-colors text-sky-400"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-sky-400 fill-sky-500/20" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 hover:text-slate-400" />
                        )}
                      </button>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white tracking-tight">{emp.name}</h3>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${
                            emp.role === 'owner'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : emp.role === 'manager'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : emp.role === 'inventory_manager'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : emp.role === 'wholesaler_admin'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          }`}>
                            {emp.role.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block">{emp.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit staff details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Details Pills */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#0A0E1A] border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Assigned Branch</span>
                      <span className="font-bold text-slate-200 truncate block">{storeAssigned?.name || 'Main Branch'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0A0E1A] border border-slate-800" onClick={e => e.stopPropagation()}>
                      <span className="text-[10px] text-slate-400 block font-semibold">Terminal PIN</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sky-400">•••• ({emp.pin})</span>
                        <button
                          onClick={() => handleResetPin(emp)}
                          className="text-[10px] text-slate-400 hover:text-white underline"
                          title="Reset PIN"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Shift & Sales */}
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Shift Schedule:</span>
                      <span className="text-slate-300 font-medium">{emp.shift}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lifetime Invoices Handled:</span>
                      <span className="font-mono font-bold text-white">₹{(emp.totalSalesHandled || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="text-slate-300 font-medium">{emp.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Status Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleActive(emp)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1.5 ${
                      emp.active
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-blue-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${emp.active ? 'bg-sky-400' : 'bg-rose-400'}`} />
                    {emp.active ? 'Active & Authorized' : 'Access Suspended'}
                  </button>

                  <span className="text-[10px] text-slate-400 font-mono">UID: {emp.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW WITH MULTI-SELECTION */
        <div className="rounded-xl bg-[#121826] border border-slate-800 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0E1A]/90 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5 w-10">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-sky-400 hover:text-sky-300"
                    >
                      {isAllFilteredSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : isSomeFilteredSelected ? (
                        <MinusSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Staff Member</th>
                  <th className="p-3.5">Role Hierarchy</th>
                  <th className="p-3.5">Assigned Outlet</th>
                  <th className="p-3.5">Shift Schedule</th>
                  <th className="p-3.5">Terminal PIN</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No matching staff members found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => {
                    const isSelected = selectedIds.includes(emp.id);
                    const storeAssigned = stores.find(s => s.id === emp.storeId) || stores[0];

                    return (
                      <tr
                        key={emp.id}
                        onClick={() => handleToggleSelectUser(emp.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-950/30 hover:bg-blue-950/40'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="p-3.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleSelectUser(emp.id)}
                            className="text-sky-400 hover:text-sky-300"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 fill-sky-500/20" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{emp.name}</div>
                          <div className="text-[11px] text-slate-400">{emp.email} • {emp.phone}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${
                            emp.role === 'owner'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : emp.role === 'manager'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : emp.role === 'inventory_manager'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : emp.role === 'wholesaler_admin'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          }`}>
                            {emp.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-200">
                          {storeAssigned?.name || 'Main Branch'}
                        </td>
                        <td className="p-3.5 text-slate-300 text-[11px]">
                          {emp.shift}
                        </td>
                        <td className="p-3.5 font-mono text-sky-400" onClick={e => e.stopPropagation()}>
                          •••• ({emp.pin})
                        </td>
                        <td className="p-3.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleActive(emp)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1.5 ${
                              emp.active
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-blue-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${emp.active ? 'bg-sky-400' : 'bg-rose-400'}`} />
                            {emp.active ? 'Active' : 'Suspended'}
                          </button>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Edit user"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id, emp.name)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Remove staff"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RBAC PERMISSION MATRIX SECTION */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#121826] border border-slate-800 shadow-lg space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-400" />
            <span>Role-Based Access Control (RBAC) Permission Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict granular security matrix defining operation rights across POS, Back-Office, and Wholesale modules.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0E1A]/90 text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Security Domain & Operation</th>
                <th className="p-3.5 text-center">Owner</th>
                <th className="p-3.5 text-center">Manager</th>
                <th className="p-3.5 text-center">Cashier</th>
                <th className="p-3.5 text-center">Inventory Lead</th>
                <th className="p-3.5 text-center">Wholesale Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {rbacMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-semibold text-slate-200">{item.module}</td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-sky-500/20 text-sky-400">
                      ✓
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    {item.manager ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-sky-500/20 text-sky-400">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-slate-800 text-slate-500">
                        -
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {item.cashier ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-sky-500/20 text-sky-400">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-slate-800 text-slate-500">
                        -
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {item.inventory_manager ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-sky-500/20 text-sky-400">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-slate-800 text-slate-500">
                        -
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {item.wholesaler_admin ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-sky-500/20 text-sky-400">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-slate-800 text-slate-500">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: BATCH ROLE ASSIGNMENT & CONFIRMATION ================= */}
      <AnimatePresence>
        {batchActionType === 'role' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#161D2C] border border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border ${
                    batchRoleStep === 'confirm' 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                      : 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {batchRoleStep === 'confirm' ? 'Confirm Batch Role Change' : 'Batch Role Assignment'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {batchRoleStep === 'confirm'
                        ? `Review changes for ${selectedEmployees.length} staff account(s)`
                        : `Select target role for ${selectedEmployees.length} selected accounts`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeBatchModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step 1: Role Selection */}
              {batchRoleStep === 'select' && (
                <div className="space-y-4 text-xs overflow-y-auto pr-1">
                  <div className="p-3 rounded-xl bg-[#121826] border border-slate-800">
                    <span className="text-slate-400 block text-[11px] mb-1">Target Personnel:</span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {selectedEmployees.map(emp => (
                        <span
                          key={emp.id}
                          className="px-2 py-0.5 rounded-lg bg-[#0A0E1A] text-slate-200 text-[11px] font-medium border border-slate-800 flex items-center gap-1"
                        >
                          <span>{emp.name}</span>
                          <span className="text-[9px] text-slate-400 capitalize">({emp.role.replace('_', ' ')})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-200 font-bold block mb-2">
                      Select New System Role:
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          id: 'cashier',
                          name: 'POS Cashier',
                          desc: 'Point-of-sale checkout, barcode scanning, cash tender & receipt printing',
                          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        },
                        {
                          id: 'manager',
                          name: 'Store Manager',
                          desc: 'Price overrides, refunds, discount approvals, and cashier supervision',
                          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        },
                        {
                          id: 'inventory_manager',
                          name: 'Inventory Specialist',
                          desc: 'Barcode labeling, stock intake, audit counts, restock purchase orders',
                          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        },
                        {
                          id: 'wholesaler_admin',
                          name: 'Wholesale Admin',
                          desc: 'B2B order dispatch, trade catalogues, credit limit overrides',
                          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        },
                        {
                          id: 'owner',
                          name: 'Franchise Owner',
                          desc: 'Unrestricted administrative access to financial logs, RBAC, and all outlets',
                          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        }
                      ].map(r => (
                        <label
                          key={r.id}
                          onClick={() => setBatchRole(r.id as UserRole)}
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            batchRole === r.id
                              ? 'bg-sky-500/15 border-sky-500 text-white shadow-sm'
                              : 'bg-[#121826] border-slate-800 text-slate-300 hover:bg-slate-800/70'
                          }`}
                        >
                          <input
                            type="radio"
                            name="batchRoleRadio"
                            checked={batchRole === r.id}
                            onChange={() => setBatchRole(r.id as UserRole)}
                            className="mt-0.5 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold block text-slate-100">{r.name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${r.badgeColor}`}>
                                {r.id.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{r.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Role Confirmation Dialog */}
              {batchRoleStep === 'confirm' && (
                <div className="space-y-4 text-xs overflow-y-auto pr-1">
                  {/* Warning Header Alert */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-200">Confirmation Required</span>
                      <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
                        You are about to reassign the security role of <strong className="text-white font-bold">{selectedEmployees.length}</strong> staff member(s) to <strong className="text-white uppercase underline">{batchRole.replace('_', ' ')}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Visual Diff Table of Users */}
                  <div>
                    <span className="text-slate-300 font-bold block mb-2">
                      Roster Impact Preview ({selectedEmployees.length} users):
                    </span>
                    <div className="rounded-xl border border-slate-800 bg-[#0A0E1A] max-h-48 overflow-y-auto divide-y divide-slate-800/60">
                      {selectedEmployees.map(emp => (
                        <div key={emp.id} className="p-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-200 truncate">{emp.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{emp.email}</div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 capitalize">
                              {emp.role.replace('_', ' ')}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">
                              {batchRole.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Role Capabilities Note */}
                  <div className="p-3 rounded-xl bg-[#121826] border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <span className="font-bold text-slate-200 block">Security & RBAC Enforcement:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                      <li>New terminal capabilities take effect immediately on next token refresh.</li>
                      <li>Audit logs will record this batch role reassignment with administrative timestamp.</li>
                    </ul>
                  </div>

                  {/* Safety Checkbox */}
                  <label className="p-3 rounded-xl bg-[#121826] border border-slate-800 flex items-start gap-2.5 cursor-pointer hover:bg-slate-800/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={batchRoleCheck}
                      onChange={e => setBatchRoleCheck(e.target.checked)}
                      className="mt-0.5 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-[#0A0E1A]"
                    />
                    <span className="text-[11px] text-slate-200 leading-snug">
                      I verify and approve the role update to <strong>{batchRole.replace('_', ' ').toUpperCase()}</strong> for all {selectedEmployees.length} selected accounts.
                    </span>
                  </label>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800 mt-auto">
                {batchRoleStep === 'confirm' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setBatchRoleStep('select');
                      setBatchRoleCheck(false);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Back to Role Selection
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeBatchModal}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                )}

                <div className="flex items-center gap-2">
                  {batchRoleStep === 'select' ? (
                    <button
                      type="button"
                      onClick={() => setBatchRoleStep('confirm')}
                      className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <span>Review & Confirm Role Change</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!batchRoleCheck}
                      onClick={handleExecuteBatchRole}
                      className={`px-4 py-2.5 rounded-lg font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ${
                        batchRoleCheck
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm & Apply Role to {selectedEmployees.length} Accounts</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: BATCH DEACTIVATION CONFIRMATION DIALOG ================= */}
      <AnimatePresence>
        {batchActionType === 'deactivate' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#161D2C] border border-rose-600/60 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              {/* Danger Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                      Confirm Bulk Account Deactivation
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Suspension of POS login credentials for {selectedEmployees.length} staff member(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeBatchModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="space-y-3.5 text-xs overflow-y-auto pr-1">
                {/* Warning Summary Banner */}
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 space-y-1.5">
                  <div className="font-bold flex items-center gap-2 text-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>Immediate Action & Security Consequences:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-300/90">
                    <li>Active POS cashier terminal sessions will be terminated immediately.</li>
                    <li>Security PINs and passwords will be blocked from logging in.</li>
                    <li>
                      <strong className="text-rose-100">Data Preservation:</strong> Past invoices, sales records, and audit trails remain completely preserved.
                    </li>
                  </ul>
                </div>

                {/* Affected Users Roster Preview */}
                <div>
                  <span className="text-slate-300 font-bold block mb-1.5">
                    Accounts To Be Suspended ({selectedEmployees.length}):
                  </span>
                  <div className="rounded-xl border border-slate-800 bg-[#0A0E1A] max-h-40 overflow-y-auto divide-y divide-slate-800/60">
                    {selectedEmployees.map(emp => {
                      const empStore = stores.find(s => s.id === emp.storeId) || stores[0];
                      return (
                        <div key={emp.id} className="p-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-200 truncate">{emp.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{emp.email} • {empStore.name}</div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase flex-shrink-0">
                            {emp.role.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mandatory Safety Checkbox */}
                <label className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-start gap-2.5 cursor-pointer hover:bg-rose-950/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={batchDeactivateCheck}
                    onChange={e => setBatchDeactivateCheck(e.target.checked)}
                    className="mt-0.5 rounded border-rose-700 text-rose-600 focus:ring-rose-500 bg-[#0A0E1A]"
                  />
                  <span className="text-[11px] text-rose-200 leading-snug">
                    I confirm that I want to deactivate <strong>{selectedEmployees.length} staff account(s)</strong> immediately and revoke terminal login rights.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-auto">
                <button
                  type="button"
                  onClick={closeBatchModal}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!batchDeactivateCheck}
                  onClick={handleExecuteBatchDeactivate}
                  className={`px-4 py-2.5 rounded-lg font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 ${
                    batchDeactivateCheck
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <UserX className="w-4 h-4" />
                  <span>Confirm & Deactivate {selectedEmployees.length} Accounts</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: BATCH ACTIVATION CONFIRMATION DIALOG ================= */}
      <AnimatePresence>
        {batchActionType === 'activate' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#161D2C] border border-sky-500/50 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-sky-400">
                      Confirm Account Activation
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Restoring access for {selectedEmployees.length} staff member(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeBatchModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs overflow-y-auto pr-1">
                <p className="text-slate-300">
                  You are about to re-authorize and enable terminal access for <strong className="text-white font-bold">{selectedEmployees.length}</strong> accounts:
                </p>

                <div className="rounded-xl border border-slate-800 bg-[#0A0E1A] max-h-36 overflow-y-auto divide-y divide-slate-800/60">
                  {selectedEmployees.map(emp => (
                    <div key={emp.id} className="p-2 flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-200 truncate">{emp.name}</span>
                      <span className="text-[10px] text-sky-400 font-bold capitalize">{emp.role.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px]">
                  Staff members will immediately be able to log in to point-of-sale terminals using their existing credentials and PINs.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-auto">
                <button
                  onClick={closeBatchModal}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteBatchActivate}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Re-Activate ({selectedEmployees.length} Accounts)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: BATCH BRANCH REASSIGNMENT ================= */}
      <AnimatePresence>
        {batchActionType === 'store' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#161D2C] border border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Confirm Branch Transfer
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Reassigning {selectedEmployees.length} staff member(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeBatchModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs overflow-y-auto pr-1">
                <label className="text-slate-300 font-bold block">Select Destination Branch Outlet:</label>
                <select
                  value={batchStoreId}
                  onChange={e => setBatchStoreId(e.target.value)}
                  className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500 text-xs"
                >
                  {stores.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.city}, {st.type})
                    </option>
                  ))}
                </select>

                <div className="rounded-xl border border-slate-800 bg-[#0A0E1A] max-h-32 overflow-y-auto divide-y divide-slate-800/60 p-2">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Affected Staff:</span>
                  {selectedEmployees.map(emp => (
                    <div key={emp.id} className="py-1 text-slate-300 text-[11px] truncate">
                      • {emp.name} ({emp.role.replace('_', ' ')})
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-auto">
                <button
                  onClick={closeBatchModal}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteBatchStore}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Branch Reassignment</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: BATCH SHIFT ASSIGNMENT ================= */}
      <AnimatePresence>
        {batchActionType === 'shift' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#161D2C] border border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Confirm Shift Timetable Update
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Assigning schedule to {selectedEmployees.length} staff member(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeBatchModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs overflow-y-auto pr-1">
                <label className="text-slate-300 font-bold block">Choose Shift Timetable:</label>
                <select
                  value={batchShift}
                  onChange={e => setBatchShift(e.target.value)}
                  className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500 text-xs"
                >
                  <option value="Morning (09:00 AM - 05:00 PM)">Morning (09:00 AM - 05:00 PM)</option>
                  <option value="Evening (02:00 PM - 10:00 PM)">Evening (02:00 PM - 10:00 PM)</option>
                  <option value="General (10:00 AM - 07:00 PM)">General (10:00 AM - 07:00 PM)</option>
                  <option value="Night (10:00 PM - 06:00 AM)">Night (10:00 PM - 06:00 AM)</option>
                  <option value="Weekend Special (11:00 AM - 09:00 PM)">Weekend Special (11:00 AM - 09:00 PM)</option>
                </select>

                <div className="rounded-xl border border-slate-800 bg-[#0A0E1A] max-h-32 overflow-y-auto divide-y divide-slate-800/60 p-2">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Affected Staff:</span>
                  {selectedEmployees.map(emp => (
                    <div key={emp.id} className="py-1 text-slate-300 text-[11px] truncate">
                      • {emp.name} ({emp.shift})
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-auto">
                <button
                  onClick={closeBatchModal}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteBatchShift}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Shift Schedule</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: BATCH PIN RESET CONFIRMATION ================= */}
      <AnimatePresence>
        {batchActionType === 'reset_pin' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#161D2C] border border-amber-500/50 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-amber-400">
                      Confirm Bulk Terminal PIN Reset
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Randomizing PINs for {selectedEmployees.length} staff member(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeBatchModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs overflow-y-auto pr-1">
                <p className="text-slate-300">
                  Generate fresh, unique 4-digit security PINs for <strong className="text-white font-bold">{selectedEmployees.length}</strong> staff accounts.
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                  Existing PINs will immediately become invalid. Staff will be prompted to use their updated temporary PIN on their next cashier login.
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0A0E1A] max-h-32 overflow-y-auto divide-y divide-slate-800/60 p-2">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Affected Staff:</span>
                  {selectedEmployees.map(emp => (
                    <div key={emp.id} className="py-1 text-slate-300 text-[11px] truncate">
                      • {emp.name} ({emp.email})
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-auto">
                <button
                  onClick={closeBatchModal}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteBatchResetPin}
                  className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Confirm & Generate New PINs</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: BATCH DELETE CONFIRMATION ================= */}
      <AnimatePresence>
        {batchActionType === 'delete' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#161D2C] border border-rose-800 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-rose-400">
                      Permanent Account Removal
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Purging {selectedEmployees.length} staff account(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeBatchModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-[11px] space-y-1">
                  <span className="font-bold block text-rose-200">Warning: Irreversible Deletion</span>
                  <p>
                    All active credentials, PINs, and permissions for the selected accounts will be permanently removed from the franchise database.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0A0E1A] max-h-36 overflow-y-auto divide-y divide-slate-800/60 p-2">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Accounts to be purged:</span>
                  {selectedEmployees.map(emp => (
                    <div key={emp.id} className="py-1 text-slate-300 text-[11px] truncate flex justify-between">
                      <span>• {emp.name}</span>
                      <span className="text-slate-500">{emp.email}</span>
                    </div>
                  ))}
                </div>

                <label className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-start gap-2.5 cursor-pointer hover:bg-rose-950/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={batchDeleteCheck}
                    onChange={e => setBatchDeleteCheck(e.target.checked)}
                    className="mt-0.5 rounded border-rose-700 text-rose-600 focus:ring-rose-500 bg-[#0A0E1A]"
                  />
                  <span className="text-[11px] text-rose-200 leading-snug">
                    I understand that this action is irreversible and permanently removes these {selectedEmployees.length} staff accounts.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-auto">
                <button
                  type="button"
                  onClick={closeBatchModal}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!batchDeleteCheck}
                  onClick={handleExecuteBatchDelete}
                  className={`px-4 py-2.5 rounded-lg font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 ${
                    batchDeleteCheck
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Delete {selectedEmployees.length} Accounts</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: ADD EMPLOYEE ================= */}
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
                  <Users className="w-5 h-5 text-sky-400" />
                  <span>Provision New Staff Account</span>
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
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kulkarni"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Assigned Role</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="cashier">POS Cashier</option>
                      <option value="manager">Store Manager</option>
                      <option value="inventory_manager">Inventory Specialist</option>
                      <option value="owner">Franchise Owner</option>
                      <option value="wholesaler_admin">Wholesaler Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Assigned Outlet</label>
                    <select
                      value={formData.storeId}
                      onChange={e => setFormData(prev => ({ ...prev, storeId: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    >
                      {stores.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="ramesh@ellic.com"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98000 11223"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Quick Terminal PIN (4-Digits)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={formData.pin}
                      onChange={e => setFormData(prev => ({ ...prev, pin: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white font-mono text-center tracking-widest focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Shift Schedule</label>
                    <input
                      type="text"
                      value={formData.shift}
                      onChange={e => setFormData(prev => ({ ...prev, shift: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
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
                    Provision Staff
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: EDIT EMPLOYEE ================= */}
      <AnimatePresence>
        {editingEmployee && (
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
                  <span>Edit Profile: {editingEmployee.name}</span>
                </h3>
                <button
                  onClick={() => setEditingEmployee(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Full Name</label>
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
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Role Hierarchy</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="cashier">POS Cashier</option>
                      <option value="manager">Store Manager</option>
                      <option value="inventory_manager">Inventory Specialist</option>
                      <option value="owner">Franchise Owner</option>
                      <option value="wholesaler_admin">Wholesaler Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Assigned Store</label>
                    <select
                      value={formData.storeId}
                      onChange={e => setFormData(prev => ({ ...prev, storeId: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    >
                      {stores.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Shift</label>
                    <input
                      type="text"
                      value={formData.shift}
                      onChange={e => setFormData(prev => ({ ...prev, shift: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={formData.pin}
                      onChange={e => setFormData(prev => ({ ...prev, pin: e.target.value }))}
                      className="w-full bg-[#0A0E1A] border border-slate-800 rounded-lg px-3.5 py-2.5 text-white font-mono text-center tracking-widest focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
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
