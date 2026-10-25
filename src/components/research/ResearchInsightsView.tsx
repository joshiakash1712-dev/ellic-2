import React, { useState } from 'react';
import {
  JourneyStage,
  JourneyPainPoint,
  PainPointSeverity
} from '../../types/journey';
import {
  researchStatsSummary
} from '../../data/journeyData';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import {
  AlertTriangle,
  Quote,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  FileText,
  Download,
  Users,
  Building2,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';

interface ResearchInsightsViewProps {
  stages: JourneyStage[];
}

export const ResearchInsightsView: React.FC<ResearchInsightsViewProps> = ({ stages }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Aggregate all pain points across stages
  const allPainPoints: JourneyPainPoint[] = stages.flatMap(s => s.painPoints);

  // Emotional curve chart data
  const sentimentChartData = stages.map(s => ({
    stage: s.label,
    score: s.sentimentScore,
    dropoff: s.dropoffRate,
    days: s.avgDaysInStage
  }));

  // Friction by category chart data
  const frictionCategoriesData = researchStatsSummary.keyFrictionCategories;

  const filteredPainPoints = allPainPoints.filter(pp => {
    if (selectedCategory !== 'all' && pp.category !== selectedCategory) return false;
    return true;
  });

  const categories = ['all', 'Tech & Usability', 'Operations & Time', 'Financial & Pricing', 'Data & Inventory', 'Trust & Compliance'];

  return (
    <div className="space-y-6">
      
      {/* Research Methodology Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Field Research & Onboarding Telemetry
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Retailer Behavioral Friction & Onboarding Study
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Synthesizing qualitative observations and quantitative telemetry from 340+ independent kiranas, multi-counter supermarkets, and wholesale buyers across urban and suburban commercial corridors.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-2xl font-black text-white">{researchStatsSummary.totalRetailersSurveyed}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Retailers Surveyed
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-2xl font-black text-emerald-400">{researchStatsSummary.inDepthFieldInterviews}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Field On-Site Audits
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Retailer Emotional & Confidence Curve Across Journey Stages */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Retailer Sentiment & Confidence Trajectory</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Emotional score (-5 to +5) illustrating the 'Evaluation Anxiety Dip' and 'Adoption Recovery'
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[-3, 6]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Sentiment Score"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#sentimentGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-1.5" />
            <p>
              <strong className="text-white">Critical Finding:</strong> The steepest emotional drop occurs during <strong className="text-amber-300">Evaluation (-2)</strong> due to fears of messy catalog imports and peak rush disruptions. Once the retailer passes 10 mock bills, confidence rebounds rapidly to <strong className="text-emerald-300">+4 in Adoption</strong>.
            </p>
          </div>
        </div>

        {/* Chart 2: Top Retailer Friction Points by Category */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Friction Prevalence by Operational Category</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Percentage of surveyed retailers actively flagging this as an onboarding blocker
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frictionCategoriesData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="category" type="category" width={110} stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar dataKey="frictionScore" name="Friction Prevalence (%)" radius={[0, 6, 6, 0]}>
                  {frictionCategoriesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.frictionScore >= 80 ? '#ef4444' : entry.frictionScore >= 70 ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
            <p>
              <strong className="text-white">Product Response:</strong> 88% friction in <strong className="text-red-300">Catalog Ingestion</strong> was neutralized by integrating pre-mapped 45,000 FMCG master codes and handwritten bill photo OCR.
            </p>
          </div>
        </div>

      </div>

      {/* Category Filter & Qualitative Pain Point Library */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Quote className="w-4 h-4 text-emerald-400" />
              <span>Field Research Qualitative Quotes & Solved Mitigations</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct statements captured during store owner interviews, mapped to root causes and platform solutions
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Research Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pain Point Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPainPoints.map(pp => (
            <div
              key={pp.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    pp.severity === 'critical'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : pp.severity === 'high'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  }`}
                >
                  {pp.severity} Severity • {pp.prevalencePercentage}% Prevalence
                </span>

                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Stage: {pp.stageId}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white leading-snug">
                {pp.title}
              </h4>

              {/* Verbatim quote block */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 italic flex gap-2">
                <Quote className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 opacity-60" />
                <p className="leading-relaxed">{pp.retailerQuote}</p>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Root Cause:
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{pp.rootCause}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block flex items-center gap-1 mb-0.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Engineered Product Mitigation:</span>
                  </span>
                  <p className="text-[11px] leading-relaxed">{pp.mitigationSolution}</p>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 italic">
                Context: {pp.sourceContext}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
