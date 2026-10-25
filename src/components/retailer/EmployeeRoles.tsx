import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Employee } from '../../types';
import {
  ShieldCheck,
  Plus,
  UserCheck,
  Lock,
  Mail,
  Phone,
  CheckCircle,
  X,
  Edit,
  Key,
  AlertCircle
} from 'lucide-react';

export const EmployeeRoles: React.FC = () => {
  const { employees, addEmployee, updateEmployee, activeStore } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Employee['role']>('manager');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [permissions, setPermissions] = useState({
    inventoryEdit: true,
    reports: true,
    employeeManagement: false,
    restockOrders: true
  });

  const handleRoleChange = (newRole: Employee['role']) => {
    setRole(newRole);
    if (newRole === 'owner') {
      setPermissions({ inventoryEdit: true, reports: true, employeeManagement: true, restockOrders: true });
    } else if (newRole === 'manager') {
      setPermissions({ inventoryEdit: true, reports: true, employeeManagement: false, restockOrders: true });
    } else {
      setPermissions({ inventoryEdit: true, reports: false, employeeManagement: false, restockOrders: false });
    }
  };

  const validateEmployee = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Enter crew member full name.';
    }
    if (!email.trim()) {
      errs.email = 'Enter email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (phone.trim() && cleanPhone.length < 10) {
      errs.phone = 'Enter a valid 10-digit phone number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmployee()) return;
    addEmployee({
      storeId: activeStore.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      permissions,
      status: 'active'
    });
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setErrors({});
  };

  const toggleStatus = (emp: Employee) => {
    updateEmployee(emp.id, {
      status: emp.status === 'active' ? 'inactive' : 'active'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Store Crew & Access Roles</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Define role permissions for Store Owners, Managers, and Crew members.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Crew Member</span>
        </button>
      </div>

      {/* Crew Directory Table */}
      <div className="p-5 rounded-xl bg-[#121826] border border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Crew Member</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Permissions Matrix</th>
                <th className="pb-3 text-right">Status / Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{emp.name}</span>
                      {emp.role === 'owner' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                          STORE OWNER
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 uppercase font-extrabold text-slate-200">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px]">
                      {emp.role === 'owner' ? 'Store Owner' : emp.role.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 text-slate-400">
                    <div>{emp.email}</div>
                    <div className="text-[10px] text-slate-500">{emp.phone}</div>
                  </td>

                  <td className="py-3">
                    <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                      <span className={`px-1.5 py-0.5 rounded-md ${emp.permissions.inventoryEdit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-600'}`}>
                        Inventory Control
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-md ${emp.permissions.reports ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-600'}`}>
                        Reports & GST
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-md ${emp.permissions.employeeManagement ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-600'}`}>
                        Crew Management
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-md ${emp.permissions.restockOrders ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-600'}`}>
                        Wholesale Restock
                      </span>
                    </div>
                  </td>

                  <td className="py-3 text-right">
                    <button
                      onClick={() => toggleStatus(emp)}
                      disabled={emp.role === 'owner'}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border inline-flex items-center gap-1 transition-all ${
                        emp.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 shrink-0" />
                      <span>{emp.status === 'active' ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Crew Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0E1A]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#161D2C] border border-slate-700/80 text-slate-100 rounded-2xl w-full max-w-md max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#121826] shrink-0">
              <h3 className="text-base font-bold text-white">Add Crew Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 sm:p-6 space-y-3 text-xs overflow-y-auto flex-1">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => { const n = { ...prev }; delete n.name; return n; });
                  }}
                  placeholder="e.g. Kavita Vernekar"
                  className={`w-full bg-[#0A0E1A] border rounded-lg p-2.5 text-white transition-colors ${
                    errors.name
                      ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                      : 'border-slate-700/80 focus:border-emerald-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-[10px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => { const n = { ...prev }; delete n.email; return n; });
                  }}
                  placeholder="e.g. kavita@company.com"
                  className={`w-full bg-[#0A0E1A] border rounded-lg p-2.5 text-white transition-colors ${
                    errors.email
                      ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                      : 'border-slate-700/80 focus:border-emerald-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-[10px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => { const n = { ...prev }; delete n.phone; return n; });
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full bg-[#0A0E1A] border rounded-lg p-2.5 text-white transition-colors ${
                    errors.phone
                      ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                      : 'border-slate-700/80 focus:border-emerald-500'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[10px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Role Type</label>
                <select
                  value={role}
                  onChange={e => handleRoleChange(e.target.value as any)}
                  className="w-full bg-[#0A0E1A] border border-slate-700/80 rounded-lg p-2.5 text-white"
                >
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="inventory_staff">Inventory Staff</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors active:scale-[0.99]"
              >
                Add Crew Member
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
