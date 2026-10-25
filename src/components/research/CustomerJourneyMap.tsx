import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  JourneyStage,
  JourneyStageId,
  RetailerOnboardingProfile,
  OnboardingStatus,
  RetailerSegment,
  PainPointSeverity
} from '../../types/journey';
import {
  journeyStagesData,
  initialTrackedRetailers,
  researchStatsSummary
} from '../../data/journeyData';
import { JourneyMatrixView } from './JourneyMatrixView';
import { RetailerTrackerKanban } from './RetailerTrackerKanban';
import { ResearchInsightsView } from './ResearchInsightsView';
import { RetailerDetailModal } from './RetailerDetailModal';
import { AddRetailerModal } from './AddRetailerModal';
import {
  Compass,
  Kanban,
  BarChart3,
  Search,
  Plus,
  Download,
  Filter,
  Users,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

export type JourneyViewMode = 'matrix' | 'tracker' | 'insights';

export const CustomerJourneyMap: React.FC = () => {
  const [stages, setStages] = useState<JourneyStage[]>(journeyStagesData);
  const [retailers, setRetailers] = useState<RetailerOnboardingProfile[]>(initialTrackedRetailers);
  const [activeViewMode, setActiveViewMode] = useState<JourneyViewMode>('matrix');

  // Filters
  const [selectedStageId, setSelectedStageId] = useState<JourneyStageId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<OnboardingStatus | 'all'>('all');
  const [segmentFilter, setSegmentFilter] = useState<RetailerSegment | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<PainPointSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerOnboardingProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Stage order helper
  const stageOrder: JourneyStageId[] = ['awareness', 'evaluation', 'onboarding', 'adoption', 'advocacy'];

  // Handle stage transitions
  const handleMoveRetailerStage = (retailerId: string, targetStageId: JourneyStageId) => {
    setRetailers(prev =>
      prev.map(r => {
        if (r.id === retailerId) {
          const targetStage = stages.find(s => s.id === targetStageId);
          return {
            ...r,
            currentStage: targetStageId,
            daysInCurrentStage: 1,
            stageProgress: targetStageId === 'advocacy' ? 100 : Math.max(20, r.stageProgress),
            status: targetStageId === 'advocacy' ? 'completed' : r.status,
            touchpointHistory: [
              {
                id: `th-trans-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                touchpointTitle: `Advanced to ${targetStage?.label || targetStageId}`,
                channel: 'Android App',
                performedBy: r.onboardingManager,
                notes: `Retailer transitioned stage.`
              },
              ...r.touchpointHistory
            ]
          };
        }
        return r;
      })
    );
  };

  const handleAdvanceStage = (retailerId: string) => {
    const retailer = retailers.find(r => r.id === retailerId);
    if (!retailer) return;
    const currentIdx = stageOrder.indexOf(retailer.currentStage);
    if (currentIdx !== -1 && currentIdx < stageOrder.length - 1) {
      const nextStageId = stageOrder[currentIdx + 1];
      handleMoveRetailerStage(retailerId, nextStageId);
      // Update modal state if open
      if (selectedRetailer?.id === retailerId) {
        setSelectedRetailer(prev => (prev ? { ...prev, currentStage: nextStageId, daysInCurrentStage: 1 } : null));
      }
    }
  };

  const handleRegressStage = (retailerId: string) => {
    const retailer = retailers.find(r => r.id === retailerId);
    if (!retailer) return;
    const currentIdx = stageOrder.indexOf(retailer.currentStage);
    if (currentIdx > 0) {
      const prevStageId = stageOrder[currentIdx - 1];
      handleMoveRetailerStage(retailerId, prevStageId);
      // Update modal state if open
      if (selectedRetailer?.id === retailerId) {
        setSelectedRetailer(prev => (prev ? { ...prev, currentStage: prevStageId, daysInCurrentStage: 1 } : null));
      }
    }
  };

  const handleUpdateRetailer = (updated: RetailerOnboardingProfile) => {
    setRetailers(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    setSelectedRetailer(updated);
  };

  const handleAddRetailer = (newRetailer: RetailerOnboardingProfile) => {
    setRetailers(prev => [newRetailer, ...prev]);
  };

  const handleExportData = () => {
    const exportPayload = {
      generatedAt: new Date().toISOString(),
      researchSummary: researchStatsSummary,
      pipelineSummary: {
        totalRetailers: retailers.length,
        byStage: stageOrder.map(s => ({
          stage: s,
          count: retailers.filter(r => r.currentStage === s).length
        }))
      },
      retailers,
      stages
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ellix-retailer-journey-report-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice('Retailer Onboarding & Research Dossier exported successfully.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* 1. Main Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customer Journey Architecture</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Research Grounded</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Retailer Onboarding Journey Map
          </h1>

          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Track new retail merchants advancing through <strong className="text-slate-200">Awareness</strong>, <strong className="text-slate-200">Evaluation</strong>, <strong className="text-slate-200">Onboarding</strong>, and <strong className="text-slate-200">Adoption</strong>. Inspect friction points, touchpoints, and live onboarding telemetry.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-add-retailer"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Retailer</span>
          </button>

          <button
            id="btn-export-dossier"
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700/60 active:scale-95 transition-all"
            title="Download JSON research report"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Export Notification Toast */}
      {exportNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. Mode Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            id="tab-view-matrix"
            onClick={() => setActiveViewMode('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeViewMode === 'matrix'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Journey Blueprint Matrix</span>
          </button>

          <button
            id="tab-view-tracker"
            onClick={() => setActiveViewMode('tracker')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeViewMode === 'tracker'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Onboarding Pipeline ({retailers.length})</span>
          </button>

          <button
            id="tab-view-insights"
            onClick={() => setActiveViewMode('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeViewMode === 'insights'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Research & Friction Radar</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-journey-search"
            placeholder="Search stores, pain points, cities..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 3. Filter Controls (Applicable to Matrix & Tracker) */}
      {activeViewMode !== 'insights' && (
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filters:</span>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Stage:</span>
            <select
              id="filter-stage-select"
              value={selectedStageId}
              onChange={e => setSelectedStageId(e.target.value as JourneyStageId | 'all')}
              className="bg-slate-950 border border-slate-700/80 text-white rounded-lg px-2.5 py-1 text-xs font-medium"
            >
              <option value="all">All 5 Stages</option>
              {stages.map(st => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Segment Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Segment:</span>
            <select
              id="filter-segment-select"
              value={segmentFilter}
              onChange={e => setSegmentFilter(e.target.value as RetailerSegment | 'all')}
              className="bg-slate-950 border border-slate-700/80 text-white rounded-lg px-2.5 py-1 text-xs font-medium"
            >
              <option value="all">All Retail Segments</option>
              <option value="kirana">Kirana / Independent</option>
              <option value="supermarket">Supermarket</option>
              <option value="pharmacy">Pharmacy & Health</option>
              <option value="electronics">Electronics & FMCG</option>
              <option value="general_trade">General Trade</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Status:</span>
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as OnboardingStatus | 'all')}
              className="bg-slate-950 border border-slate-700/80 text-white rounded-lg px-2.5 py-1 text-xs font-medium"
            >
              <option value="all">All Health Statuses</option>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Severity Filter for Matrix */}
          {activeViewMode === 'matrix' && (
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">Pain Point Severity:</span>
              <select
                id="filter-severity-select"
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value as PainPointSeverity | 'all')}
                className="bg-slate-950 border border-slate-700/80 text-white rounded-lg px-2.5 py-1 text-xs font-medium"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          )}

          {/* Reset Filters */}
          {(selectedStageId !== 'all' || statusFilter !== 'all' || segmentFilter !== 'all' || severityFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedStageId('all');
                setStatusFilter('all');
                setSegmentFilter('all');
                setSeverityFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* 4. Active View Stage Rendering */}
      <div>
        {activeViewMode === 'matrix' && (
          <JourneyMatrixView
            stages={stages}
            retailers={retailers}
            selectedStageId={selectedStageId}
            onSelectStage={stId => setSelectedStageId(stId)}
            onSelectRetailer={ret => setSelectedRetailer(ret)}
            severityFilter={severityFilter}
            searchQuery={searchQuery}
          />
        )}

        {activeViewMode === 'tracker' && (
          <RetailerTrackerKanban
            stages={stages}
            retailers={retailers}
            onSelectRetailer={ret => setSelectedRetailer(ret)}
            onMoveRetailerStage={handleMoveRetailerStage}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            statusFilter={statusFilter}
            segmentFilter={segmentFilter}
            searchQuery={searchQuery}
          />
        )}

        {activeViewMode === 'insights' && (
          <ResearchInsightsView stages={stages} />
        )}
      </div>

      {/* 5. Detail Modal */}
      {selectedRetailer && (
        <RetailerDetailModal
          retailer={selectedRetailer}
          stages={stages}
          onClose={() => setSelectedRetailer(null)}
          onUpdateRetailer={handleUpdateRetailer}
          onAdvanceStage={handleAdvanceStage}
          onRegressStage={handleRegressStage}
        />
      )}

      {/* 6. Add Retailer Modal */}
      {isAddModalOpen && (
        <AddRetailerModal
          onClose={() => setIsAddModalOpen(false)}
          onAddRetailer={handleAddRetailer}
        />
      )}

    </div>
  );
};
