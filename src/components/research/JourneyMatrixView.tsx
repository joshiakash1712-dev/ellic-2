import React, { useState } from 'react';
import {
  JourneyStage,
  JourneyStageId,
  JourneyPainPoint,
  JourneyTouchpoint,
  RetailerOnboardingProfile,
  PainPointSeverity
} from '../../types/journey';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Quote,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Users,
  Building2,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Package,
  Compass,
  FileSpreadsheet,
  Check
} from 'lucide-react';

interface JourneyMatrixViewProps {
  stages: JourneyStage[];
  retailers: RetailerOnboardingProfile[];
  selectedStageId: JourneyStageId | 'all';
  onSelectStage: (stageId: JourneyStageId) => void;
  onSelectRetailer: (retailer: RetailerOnboardingProfile) => void;
  severityFilter: PainPointSeverity | 'all';
  searchQuery: string;
}

export const JourneyMatrixView: React.FC<JourneyMatrixViewProps> = ({
  stages,
  retailers,
  selectedStageId,
  onSelectStage,
  onSelectRetailer,
  severityFilter,
  searchQuery
}) => {
  const [expandedPainPointId, setExpandedPainPointId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<{ [key: string]: boolean }>({
    touchpoints: true,
    painpoints: true,
    kpis: true
  });

  const toggleSection = (section: string) => {
    setExpandedSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getSeverityBadgeClass = (sev: PainPointSeverity) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getSentimentColor = (score: number) => {
    if (score <= -2) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (score < 2) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (score < 4) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    return 'text-teal-300 bg-teal-500/10 border-teal-500/20';
  };

  const getSentimentTrendIcon = (trend: JourneyStage['sentimentTrend']) => {
    switch (trend) {
      case 'peak':
      case 'rising':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
      case 'dip':
        return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const filteredStages = stages.filter(st => {
    if (selectedStageId !== 'all' && st.id !== selectedStageId) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Visual Roadmap Stepper Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-x-auto">
        <div className="min-w-[760px] flex items-center justify-between gap-2">
          {stages.map((st, idx) => {
            const isSelected = selectedStageId === st.id;
            const retailerCount = retailers.filter(r => r.currentStage === st.id).length;
            const blockedCount = retailers.filter(r => r.currentStage === st.id && (r.status === 'blocked' || r.status === 'at_risk')).length;

            return (
              <React.Fragment key={st.id}>
                <button
                  id={`stage-stepper-btn-${st.id}`}
                  onClick={() => onSelectStage(st.id)}
                  className={`flex-1 text-left p-3 rounded-xl border transition-all relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                      Stage 0{st.stepNumber}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSentimentColor(st.sentimentScore)} flex items-center gap-1`}>
                      {getSentimentTrendIcon(st.sentimentTrend)}
                      <span>Score: {st.sentimentScore > 0 ? `+${st.sentimentScore}` : st.sentimentScore}</span>
                    </span>
                  </div>

                  <div className="text-sm font-bold text-white mb-1 flex items-center justify-between">
                    <span className="truncate">{st.label}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 mb-2 truncate">
                    {st.timeframe} • Avg {st.avgDaysInStage}d
                  </div>

                  {/* Active Retailers In Stage Pill */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span className="font-semibold text-white">{retailerCount}</span> in onboarding
                    </span>

                    {blockedCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {blockedCount} flagged
                      </span>
                    )}
                  </div>
                </button>

                {idx < stages.length - 1 && (
                  <div className="text-slate-600 flex items-center px-1 shrink-0">
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Horizontal Multi-Column Journey Matrix */}
      <div className="overflow-x-auto pb-6">
        <div
          className={`grid gap-4 min-w-[1020px]`}
          style={{
            gridTemplateColumns: `repeat(${filteredStages.length}, minmax(320px, 1fr))`
          }}
        >
          {filteredStages.map(stage => {
            const stageRetailers = retailers.filter(r => r.currentStage === stage.id);

            // Filter pain points based on query and severity
            const filteredPainPoints = stage.painPoints.filter(pp => {
              if (severityFilter !== 'all' && pp.severity !== severityFilter) return false;
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                  pp.title.toLowerCase().includes(q) ||
                  pp.retailerQuote.toLowerCase().includes(q) ||
                  pp.category.toLowerCase().includes(q) ||
                  pp.mitigationSolution.toLowerCase().includes(q)
                );
              }
              return true;
            });

            // Filter touchpoints based on search query
            const filteredTouchpoints = stage.touchpoints.filter(tp => {
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                  tp.title.toLowerCase().includes(q) ||
                  tp.channel.toLowerCase().includes(q) ||
                  tp.description.toLowerCase().includes(q)
                );
              }
              return true;
            });

            return (
              <div
                key={stage.id}
                id={`journey-column-${stage.id}`}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-xl overflow-hidden"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                        {stage.stepNumber}
                      </span>
                      <h3 className="font-bold text-white text-base">{stage.label}</h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                      {stage.timeframe}
                    </span>
                  </div>

                  {/* Emotional Sentiment Banner */}
                  <div className={`p-2 rounded-xl text-xs flex items-center justify-between border ${getSentimentColor(stage.sentimentScore)}`}>
                    <div className="flex items-center gap-1.5 font-medium">
                      {getSentimentTrendIcon(stage.sentimentTrend)}
                      <span>{stage.sentimentLabel}</span>
                    </div>
                    <span className="font-mono font-bold">
                      Drop-off: {stage.dropoffRate}%
                    </span>
                  </div>

                  {/* Retailer Mindset Quote */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 italic flex gap-2">
                    <Quote className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 opacity-70" />
                    <p className="leading-snug">{stage.mindset}</p>
                  </div>
                </div>

                {/* Column Body */}
                <div className="p-4 space-y-5 flex-1">
                  
                  {/* Currently Enrolled Retailers in Stage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tracked Retailers ({stageRetailers.length})</span>
                      </span>
                    </div>

                    {stageRetailers.length === 0 ? (
                      <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-500 text-center">
                        No active merchants currently in this stage
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {stageRetailers.map(ret => (
                          <button
                            key={ret.id}
                            id={`ret-card-matrix-${ret.id}`}
                            onClick={() => onSelectRetailer(ret)}
                            className="w-full text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700 transition-all group"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                                {ret.storeName}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border shrink-0 ${
                                  ret.status === 'blocked'
                                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                    : ret.status === 'at_risk'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : ret.status === 'completed'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                }`}
                              >
                                {ret.status.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>{ret.city} • {ret.segment}</span>
                              <span className="font-semibold text-emerald-400">{ret.stageProgress}% done</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  ret.status === 'blocked' ? 'bg-red-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${ret.stageProgress}%` }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Research Pain Points */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Research Pain Points ({filteredPainPoints.length})</span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {filteredPainPoints.map(pp => {
                        const isExpanded = expandedPainPointId === pp.id;

                        return (
                          <div
                            key={pp.id}
                            id={`painpoint-${pp.id}`}
                            className={`p-3 rounded-xl border transition-all ${
                              pp.severity === 'critical'
                                ? 'bg-red-950/20 border-red-900/40 hover:border-red-800/60'
                                : pp.severity === 'high'
                                ? 'bg-amber-950/20 border-amber-900/40 hover:border-amber-800/60'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span
                                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${getSeverityBadgeClass(
                                  pp.severity
                                )}`}
                              >
                                {pp.severity}
                              </span>

                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                {pp.prevalencePercentage}% prevalence
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-white mb-1.5 leading-snug">
                              {pp.title}
                            </h4>

                            {/* Direct Research Quote */}
                            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-300 italic mb-2">
                              {pp.retailerQuote}
                            </div>

                            {/* Mitigation preview or expand */}
                            <div className="flex items-center justify-between text-[10px] pt-1">
                              <span className="text-emerald-400 font-semibold truncate flex items-center gap-1">
                                <Sparkles className="w-3 h-3 shrink-0" />
                                <span className="truncate">{pp.productFeatureKey || 'Product Solution'}</span>
                              </span>

                              <button
                                id={`btn-expand-pp-${pp.id}`}
                                onClick={() => setExpandedPainPointId(isExpanded ? null : pp.id)}
                                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                                title="Expand research findings"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            {/* Expanded Deep-Dive Research Details */}
                            {isExpanded && (
                              <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-[11px] space-y-2 text-slate-300">
                                <div>
                                  <span className="font-bold text-slate-400 uppercase text-[9px] block">
                                    Root Cause:
                                  </span>
                                  <p className="text-slate-300 mt-0.5">{pp.rootCause}</p>
                                </div>

                                <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-200">
                                  <span className="font-bold text-emerald-300 uppercase text-[9px] block mb-0.5">
                                    Ellix Product Solution:
                                  </span>
                                  {pp.mitigationSolution}
                                </div>

                                <div className="text-[10px] text-slate-500 italic">
                                  Source: {pp.sourceContext}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Touchpoints */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-teal-400" />
                      <span>Key Touchpoints ({filteredTouchpoints.length})</span>
                    </span>

                    <div className="space-y-2">
                      {filteredTouchpoints.map(tp => (
                        <div
                          key={tp.id}
                          className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-white truncate text-[11px]">
                              {tp.title}
                            </span>
                            {tp.isCriticalMilestone && (
                              <span className="text-[9px] font-bold bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/30 shrink-0">
                                Milestone
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 font-medium text-slate-300">
                              {tp.channel}
                            </span>
                            <span className="truncate">• {tp.actor}</span>
                          </div>

                          <p className="text-[10px] text-slate-400 leading-snug">
                            {tp.description}
                          </p>

                          <div className="text-[10px] text-slate-300 font-mono pt-1 border-t border-slate-800/60 flex items-center justify-between">
                            <span className="text-slate-400 truncate">Output: {tp.deliverable}</span>
                            <span className="text-emerald-400 font-bold shrink-0 ml-1">★ {tp.effectivenessScore}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestone Checklist */}
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Stage Checklist</span>
                    </span>

                    <div className="space-y-1.5">
                      {stage.milestoneChecklist.map(ms => (
                        <div key={ms.id} className="flex items-start gap-2 text-[11px]">
                          <div className="w-3.5 h-3.5 rounded border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-300">{ms.label}</span>
                            {ms.isRequired && (
                              <span className="text-[9px] text-amber-400 ml-1.5 font-mono">(Required)</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Column Footer KPIs */}
                <div className="p-3 border-t border-slate-800 bg-slate-950/60">
                  <div className="grid grid-cols-2 gap-2">
                    {stage.kpiMetrics.slice(0, 2).map((kpi, kIdx) => (
                      <div key={kIdx} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <div className="text-[9px] uppercase font-bold text-slate-400 truncate">{kpi.label}</div>
                        <div className="text-xs font-extrabold text-white">{kpi.value}</div>
                        <div className="text-[8px] text-slate-500 truncate">{kpi.benchmark}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
