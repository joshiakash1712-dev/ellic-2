import React, { useState } from 'react';
import {
  JourneyStage,
  JourneyStageId,
  RetailerOnboardingProfile,
  OnboardingStatus,
  JourneyPainPoint
} from '../../types/journey';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  MessageSquare,
  Plus,
  ShieldAlert,
  User,
  Check
} from 'lucide-react';

interface RetailerDetailModalProps {
  retailer: RetailerOnboardingProfile;
  stages: JourneyStage[];
  onClose: () => void;
  onUpdateRetailer: (updated: RetailerOnboardingProfile) => void;
  onAdvanceStage: (retailerId: string) => void;
  onRegressStage: (retailerId: string) => void;
}

export const RetailerDetailModal: React.FC<RetailerDetailModalProps> = ({
  retailer,
  stages,
  onClose,
  onUpdateRetailer,
  onAdvanceStage,
  onRegressStage
}) => {
  const currentStage = stages.find(s => s.id === retailer.currentStage) || stages[0];
  const allPainPoints = stages.flatMap(s => s.painPoints);

  const [newNote, setNewNote] = useState(retailer.notes || '');
  const [showAddTouchpoint, setShowAddTouchpoint] = useState(false);
  const [touchpointTitle, setTouchpointTitle] = useState('');
  const [touchpointChannel, setTouchpointChannel] = useState('WhatsApp');
  const [touchpointNotes, setTouchpointNotes] = useState('');

  // Toggle checklist milestone
  const handleToggleMilestone = (milestoneId: string) => {
    const isCompleted = retailer.completedMilestones.includes(milestoneId);
    const updatedCompleted = isCompleted
      ? retailer.completedMilestones.filter(id => id !== milestoneId)
      : [...retailer.completedMilestones, milestoneId];

    // Recalculate progress for current stage
    const currentStageMilestones = currentStage.milestoneChecklist;
    const stageCompletedCount = currentStageMilestones.filter(m => updatedCompleted.includes(m.id)).length;
    const newProgress = Math.round((stageCompletedCount / (currentStageMilestones.length || 1)) * 100);

    onUpdateRetailer({
      ...retailer,
      completedMilestones: updatedCompleted,
      stageProgress: newProgress
    });
  };

  // Toggle pain point resolution
  const handleResolvePainPoint = (painPointId: string) => {
    const updatedActive = retailer.activePainPointIds.filter(id => id !== painPointId);
    const updatedMitigated = retailer.mitigatedPainPointIds.includes(painPointId)
      ? retailer.mitigatedPainPointIds
      : [...retailer.mitigatedPainPointIds, painPointId];

    onUpdateRetailer({
      ...retailer,
      activePainPointIds: updatedActive,
      mitigatedPainPointIds: updatedMitigated,
      status: updatedActive.length === 0 && retailer.status === 'blocked' ? 'on_track' : retailer.status
    });
  };

  // Log active pain point
  const handleAddPainPoint = (painPointId: string) => {
    if (retailer.activePainPointIds.includes(painPointId)) return;
    onUpdateRetailer({
      ...retailer,
      activePainPointIds: [...retailer.activePainPointIds, painPointId],
      status: 'at_risk'
    });
  };

  // Record a touchpoint
  const handleRecordTouchpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!touchpointTitle.trim()) return;

    const newTp = {
      id: `th-custom-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      touchpointTitle: touchpointTitle.trim(),
      channel: touchpointChannel,
      notes: touchpointNotes.trim() || 'Recorded from Onboarding Manager desk',
      performedBy: retailer.onboardingManager
    };

    onUpdateRetailer({
      ...retailer,
      touchpointHistory: [newTp, ...retailer.touchpointHistory]
    });

    setTouchpointTitle('');
    setTouchpointNotes('');
    setShowAddTouchpoint(false);
  };

  // Update status
  const handleStatusChange = (newStatus: OnboardingStatus) => {
    onUpdateRetailer({
      ...retailer,
      status: newStatus
    });
  };

  // Save notes
  const handleSaveNotes = () => {
    onUpdateRetailer({
      ...retailer,
      notes: newNote
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        id="retailer-detail-modal"
        className="relative w-full max-w-4xl glass-panel border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
              {retailer.storeName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{retailer.storeName}</h3>
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    retailer.status === 'blocked'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : retailer.status === 'at_risk'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : retailer.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {retailer.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {retailer.ownerName} • {retailer.city} • Approx {retailer.skuCountApprox} SKUs • Joined {retailer.joinedDate}
              </p>
            </div>
          </div>

          <button
            id="btn-close-detail-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* Stage Progression Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Current Onboarding Stage
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white">{currentStage.label}</span>
                <span className="text-xs text-slate-400">({currentStage.timeframe})</span>
              </div>
              <p className="text-xs text-slate-400">{currentStage.primaryGoal}</p>
            </div>

            {/* Quick Advance / Regress Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-modal-regress-stage"
                onClick={() => onRegressStage(retailer.id)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev Stage</span>
              </button>

              <button
                id="btn-modal-advance-stage"
                onClick={() => onAdvanceStage(retailer.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <span>Advance Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Key Attributes & Status Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Onboarding Lead</div>
              <div className="text-xs font-bold text-white mt-1">{retailer.onboardingManager}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Target Go-Live</div>
              <div className="text-xs font-bold text-emerald-400 mt-1">{retailer.targetGoLiveDate}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Days in Current Stage</div>
              <div className="text-xs font-bold text-white mt-1">{retailer.daysInCurrentStage} Days</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Change Status</div>
              <select
                id="select-retailer-status"
                value={retailer.status}
                onChange={e => handleStatusChange(e.target.value as OnboardingStatus)}
                className="mt-1 w-full text-xs font-bold bg-slate-900 border border-slate-700 rounded-lg p-1 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="on_track">On Track</option>
                <option value="at_risk">At Risk</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Current Stage Milestone Checklist */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Stage Milestone Checklist ({currentStage.label})</span>
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {retailer.stageProgress}% Completed
              </span>
            </div>

            <div className="space-y-2">
              {currentStage.milestoneChecklist.map(ms => {
                const isChecked = retailer.completedMilestones.includes(ms.id);

                return (
                  <label
                    key={ms.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleMilestone(ms.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{ms.label}</span>
                        {ms.isRequired && (
                          <span className="text-[9px] font-mono text-amber-400 uppercase">Required</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{ms.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Active Research Pain Points & Blocker Log */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Identified Research Pain Points for this Store</span>
              </h4>
              <span className="text-xs text-slate-400">
                {retailer.activePainPointIds.length} Active / {retailer.mitigatedPainPointIds.length} Mitigated
              </span>
            </div>

            {retailer.activePainPointIds.length === 0 ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No active blockers recorded. Store is progressing smoothly through onboarding.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {retailer.activePainPointIds.map(ppId => {
                  const pp = allPainPoints.find(p => p.id === ppId);
                  if (!pp) return null;

                  return (
                    <div
                      key={pp.id}
                      className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {pp.severity}
                            </span>
                            <h5 className="text-xs font-bold text-white">{pp.title}</h5>
                          </div>
                          <p className="text-[11px] text-amber-200/80 italic mt-1">{pp.retailerQuote}</p>
                        </div>

                        <button
                          id={`btn-resolve-pp-${pp.id}`}
                          onClick={() => handleResolvePainPoint(pp.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shrink-0 transition-all shadow"
                        >
                          Mark Mitigated
                        </button>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                        <strong className="text-emerald-400">Recommended Mitigation: </strong>
                        {pp.mitigationSolution}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mitigated list preview */}
            {retailer.mitigatedPainPointIds.length > 0 && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap gap-1.5 items-center">
                <span className="font-semibold text-slate-300">Successfully Mitigated:</span>
                {retailer.mitigatedPainPointIds.map(ppId => {
                  const pp = allPainPoints.find(p => p.id === ppId);
                  return (
                    <span key={ppId} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{pp?.title || ppId}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Touchpoint Audit Trail */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <span>Touchpoint Interaction History ({retailer.touchpointHistory.length})</span>
              </h4>

              <button
                id="btn-toggle-add-touchpoint"
                onClick={() => setShowAddTouchpoint(!showAddTouchpoint)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Touchpoint</span>
              </button>
            </div>

            {/* Add Touchpoint Form */}
            {showAddTouchpoint && (
              <form onSubmit={handleRecordTouchpoint} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Touchpoint Activity</label>
                    <input
                      type="text"
                      placeholder="e.g. Conducted 20-min Cashier POS Drill"
                      value={touchpointTitle}
                      onChange={e => setTouchpointTitle(e.target.value)}
                      required
                      className="mt-1 w-full text-xs p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Channel</label>
                    <select
                      value={touchpointChannel}
                      onChange={e => setTouchpointChannel(e.target.value)}
                      className="mt-1 w-full text-xs p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Field Visit">Field Visit</option>
                      <option value="Phone / Video">Phone / Video</option>
                      <option value="Android App">Android App</option>
                      <option value="Hardware Box">Hardware Box</option>
                      <option value="Peer Network">Peer Network</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Notes & Outcomes</label>
                  <textarea
                    rows={2}
                    placeholder="Key observations, staff feedback, next action item..."
                    value={touchpointNotes}
                    onChange={e => setTouchpointNotes(e.target.value)}
                    className="mt-1 w-full text-xs p-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTouchpoint(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    Save Interaction
                  </button>
                </div>
              </form>
            )}

            {/* Interaction List */}
            <div className="space-y-2">
              {retailer.touchpointHistory.map(th => (
                <div
                  key={th.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">{th.touchpointTitle}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{th.date}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{th.channel}</span>
                    <span>By: {th.performedBy}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{th.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Internal Onboarding Specialist Notes</label>
              <button
                onClick={handleSaveNotes}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                Save Notes
              </button>
            </div>
            <textarea
              rows={3}
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              placeholder="Record custom merchant notes or hardware dispatch numbers..."
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Assigned Lead: <strong className="text-white">{retailer.onboardingManager}</strong>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
