import React, { useState } from 'react';
import {
  JourneyStage,
  JourneyStageId,
  RetailerOnboardingProfile,
  OnboardingStatus,
  RetailerSegment
} from '../../types/journey';
import {
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Phone,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface RetailerTrackerKanbanProps {
  stages: JourneyStage[];
  retailers: RetailerOnboardingProfile[];
  onSelectRetailer: (retailer: RetailerOnboardingProfile) => void;
  onMoveRetailerStage: (retailerId: string, targetStageId: JourneyStageId) => void;
  onOpenAddModal: () => void;
  statusFilter: OnboardingStatus | 'all';
  segmentFilter: RetailerSegment | 'all';
  searchQuery: string;
}

export const RetailerTrackerKanban: React.FC<RetailerTrackerKanbanProps> = ({
  stages,
  retailers,
  onSelectRetailer,
  onMoveRetailerStage,
  onOpenAddModal,
  statusFilter,
  segmentFilter,
  searchQuery
}) => {
  const getNextStageId = (currentStageId: JourneyStageId): JourneyStageId | null => {
    const stageOrder: JourneyStageId[] = ['awareness', 'evaluation', 'onboarding', 'adoption', 'advocacy'];
    const idx = stageOrder.indexOf(currentStageId);
    if (idx !== -1 && idx < stageOrder.length - 1) {
      return stageOrder[idx + 1];
    }
    return null;
  };

  const getPrevStageId = (currentStageId: JourneyStageId): JourneyStageId | null => {
    const stageOrder: JourneyStageId[] = ['awareness', 'evaluation', 'onboarding', 'adoption', 'advocacy'];
    const idx = stageOrder.indexOf(currentStageId);
    if (idx > 0) {
      return stageOrder[idx - 1];
    }
    return null;
  };

  const filteredRetailers = retailers.filter(ret => {
    if (statusFilter !== 'all' && ret.status !== statusFilter) return false;
    if (segmentFilter !== 'all' && ret.segment !== segmentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ret.storeName.toLowerCase().includes(q) ||
        ret.ownerName.toLowerCase().includes(q) ||
        ret.city.toLowerCase().includes(q) ||
        ret.onboardingManager.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Pipeline Summary Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="text-xs font-bold text-slate-400">Total In Pipeline</div>
          <div className="text-2xl font-black text-white mt-1">{retailers.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Active retail merchants
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="text-xs font-bold text-slate-400">On Track / Healthy</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {retailers.filter(r => r.status === 'on_track' || r.status === 'completed').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Smooth progression</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="text-xs font-bold text-slate-400">At Risk or Blocked</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {retailers.filter(r => r.status === 'at_risk' || r.status === 'blocked').length}
          </div>
          <div className="text-[11px] text-red-400 mt-1">Require research mitigation</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="text-xs font-bold text-slate-400">Adoption & Advocacy</div>
          <div className="text-2xl font-black text-teal-300 mt-1">
            {retailers.filter(r => r.currentStage === 'adoption' || r.currentStage === 'advocacy').length}
          </div>
          <div className="text-[11px] text-teal-400 mt-1">Live billing champions</div>
        </div>
      </div>

      {/* Kanban Board Stage Columns */}
      <div className="overflow-x-auto pb-6">
        <div className="grid grid-cols-5 gap-4 min-w-[1280px]">
          {stages.map(stage => {
            const stageRetailers = filteredRetailers.filter(r => r.currentStage === stage.id);
            const totalStageRetailers = retailers.filter(r => r.currentStage === stage.id).length;

            return (
              <div
                key={stage.id}
                id={`kanban-column-${stage.id}`}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between shadow-xl min-h-[560px]"
              >
                {/* Stage Header */}
                <div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 mb-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Step 0{stage.stepNumber}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {totalStageRetailers}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white truncate">{stage.label}</h3>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>{stage.timeframe}</span>
                      <span className="text-slate-400">Avg {stage.avgDaysInStage}d</span>
                    </div>
                  </div>

                  {/* Retailer Cards List */}
                  <div className="space-y-3">
                    {stageRetailers.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                        No retailers in this stage
                      </div>
                    ) : (
                      stageRetailers.map(retailer => {
                        const nextStage = getNextStageId(retailer.currentStage);
                        const prevStage = getPrevStageId(retailer.currentStage);
                        const isDelayed = retailer.daysInCurrentStage > stage.avgDaysInStage;

                        return (
                          <div
                            key={retailer.id}
                            id={`kanban-card-${retailer.id}`}
                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 shadow-md hover:shadow-xl transition-all space-y-3"
                          >
                            {/* Card Top: Store Name & Status */}
                            <div className="flex items-start justify-between gap-1">
                              <div
                                onClick={() => onSelectRetailer(retailer)}
                                className="cursor-pointer group flex-1"
                              >
                                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                                  {retailer.storeName}
                                </h4>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {retailer.ownerName} • {retailer.city}
                                </div>
                              </div>

                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${
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

                            {/* Segment & Time in Stage */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                              <span className="capitalize font-medium text-slate-300">
                                {retailer.segment.replace('_', ' ')} (~{retailer.skuCountApprox} SKUs)
                              </span>

                              <span
                                className={`font-mono font-semibold flex items-center gap-1 ${
                                  isDelayed ? 'text-amber-400' : 'text-slate-400'
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>{retailer.daysInCurrentStage}d in stage</span>
                              </span>
                            </div>

                            {/* Active Pain Points Warning Pill */}
                            {retailer.activePainPointIds.length > 0 && (
                              <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40 text-[10px] text-amber-300 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                <span className="truncate font-semibold">
                                  {retailer.activePainPointIds.length} Research Pain Point Active
                                </span>
                              </div>
                            )}

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-400">Milestone Progress</span>
                                <span className="font-bold text-emerald-400">{retailer.stageProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    retailer.status === 'blocked'
                                      ? 'bg-red-500'
                                      : retailer.status === 'at_risk'
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${retailer.stageProgress}%` }}
                                />
                              </div>
                            </div>

                            {/* Assigned Manager & Action Buttons */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                              <div className="text-[10px] text-slate-400 truncate max-w-[110px]" title={retailer.onboardingManager}>
                                {retailer.onboardingManager}
                              </div>

                              <div className="flex items-center gap-1">
                                {prevStage && (
                                  <button
                                    id={`btn-prev-stage-${retailer.id}`}
                                    onClick={() => onMoveRetailerStage(retailer.id, prevStage)}
                                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
                                    title="Move to Previous Stage"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>
                                )}

                                {nextStage && (
                                  <button
                                    id={`btn-next-stage-${retailer.id}`}
                                    onClick={() => onMoveRetailerStage(retailer.id, nextStage)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                                    title="Advance to Next Stage"
                                  >
                                    <span>Advance</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}

                                <button
                                  id={`btn-view-retailer-${retailer.id}`}
                                  onClick={() => onSelectRetailer(retailer)}
                                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700/60"
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Quick Add at bottom of column */}
                <div className="pt-3 mt-3 border-t border-slate-800/60">
                  <button
                    onClick={onOpenAddModal}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Merchant</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
