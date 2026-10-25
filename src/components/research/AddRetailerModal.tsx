import React, { useState } from 'react';
import {
  JourneyStageId,
  RetailerSegment,
  RetailerOnboardingProfile
} from '../../types/journey';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Plus
} from 'lucide-react';

interface AddRetailerModalProps {
  onClose: () => void;
  onAddRetailer: (retailer: RetailerOnboardingProfile) => void;
}

export const AddRetailerModal: React.FC<AddRetailerModalProps> = ({
  onClose,
  onAddRetailer
}) => {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [segment, setSegment] = useState<RetailerSegment>('kirana');
  const [skuCountApprox, setSkuCountApprox] = useState<number>(1200);
  const [currentStage, setCurrentStage] = useState<JourneyStageId>('awareness');
  const [onboardingManager, setOnboardingManager] = useState('Priya Sen (Tech Lead)');
  const [targetGoLiveDate, setTargetGoLiveDate] = useState('2026-09-30');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !ownerName.trim()) return;

    const newRetailer: RetailerOnboardingProfile = {
      id: `ret-${Date.now()}`,
      storeName: storeName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      email: email.trim() || `${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
      city: city.trim(),
      segment,
      skuCountApprox: Number(skuCountApprox) || 1000,
      currentStage,
      stageProgress: 15,
      daysInCurrentStage: 1,
      status: 'on_track',
      onboardingManager,
      targetGoLiveDate,
      joinedDate: new Date().toISOString().split('T')[0],
      completedMilestones: ['ms-aw-1'],
      activePainPointIds: currentStage === 'awareness' ? ['pp-aw-1'] : [],
      mitigatedPainPointIds: [],
      notes: notes.trim() || 'New merchant enrolled into onboarding tracking system.',
      touchpointHistory: [
        {
          id: `th-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          touchpointTitle: 'Store Profile Initial Intake & Registration',
          channel: 'Android App',
          performedBy: onboardingManager,
          notes: 'Enrolled into onboarding pipeline.'
        }
      ]
    };

    onAddRetailer(newRetailer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        id="add-retailer-modal"
        className="relative w-full max-w-xl glass-panel border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Enroll New Retailer</h3>
              <p className="text-xs text-slate-400">Add store to active onboarding tracking pipeline</p>
            </div>
          </div>

          <button
            id="btn-close-add-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Store / Outlet Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Mart Supermarket"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Owner / Key Contact *</label>
              <input
                type="text"
                required
                placeholder="e.g. Suresh Agarwal"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">City / Market Location</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Surat, Pune"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Retail Segment</label>
              <select
                value={segment}
                onChange={e => setSegment(e.target.value as RetailerSegment)}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium"
              >
                <option value="kirana">Kirana / Independent</option>
                <option value="supermarket">Supermarket</option>
                <option value="pharmacy">Pharmacy & Health</option>
                <option value="electronics">Electronics & FMCG</option>
                <option value="general_trade">General Trade</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Est. SKU Count</label>
              <input
                type="number"
                value={skuCountApprox}
                onChange={e => setSkuCountApprox(Number(e.target.value))}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Initial Stage</label>
              <select
                value={currentStage}
                onChange={e => setCurrentStage(e.target.value as JourneyStageId)}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium"
              >
                <option value="awareness">Awareness</option>
                <option value="evaluation">Evaluation</option>
                <option value="onboarding">Onboarding & Setup</option>
                <option value="adoption">Adoption</option>
                <option value="advocacy">Advocacy</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Assigned Onboarding Lead</label>
              <select
                value={onboardingManager}
                onChange={e => setOnboardingManager(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium"
              >
                <option value="Priya Sen (Tech Lead)">Priya Sen (Tech Lead)</option>
                <option value="Rohan Varma">Rohan Varma (Field Specialist)</option>
                <option value="Ananya Roy">Ananya Roy (Onboarding Mgr)</option>
                <option value="Vikram Malhotra">Vikram Malhotra (Retail Lead)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Target Go-Live Date</label>
              <input
                type="date"
                value={targetGoLiveDate}
                onChange={e => setTargetGoLiveDate(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Initial Store Context / Specific Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Needs printer pairing help, migrating from handwritten paper register..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Merchant</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
