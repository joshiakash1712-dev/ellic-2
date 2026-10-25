import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Lock,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { GuideLegalLinkProps, WORKFLOW_SEVEN_NODES } from './guideData';
import { LegalPageSlug } from '../../../config/legal.config';

const DemoBadge: React.FC<{ label?: string }> = ({ label = 'DEMO · SAMPLE DATA' }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-sky-300 text-[10px] font-mono font-bold uppercase tracking-wider">
    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
    {label}
  </span>
);

/* ========================================================================== */
/* STEP 07 DEMO: STOCK & RESTOCKING (10 -> SALE -1 -> 9 LOW STOCK -> 19)     */
/* ========================================================================== */
export const Step07StockRestockDemo: React.FC = () => {
  const [stage, setStage] = useState<'initial' | 'sold' | 'restocked'>('sold');

  const stockValue = stage === 'initial' ? 10 : stage === 'sold' ? 9 : 19;

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">
            Connected Stock & Restocking Demonstration
          </span>
        </div>
        <DemoBadge />
      </div>

      {/* 3-Step Visual Chain */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setStage('initial')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            stage === 'initial'
              ? 'bg-blue-500/15 border-blue-500 text-white'
              : 'bg-[#0A0E1A] border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="text-[10px] font-mono text-slate-400 uppercase">1. Starting Stock</div>
          <div className="text-2xl font-black text-white mt-1 tabular-nums">10 units</div>
          <div className="text-[11px] text-sky-400 mt-1">Ready at counter</div>
        </button>

        <button
          type="button"
          onClick={() => setStage('sold')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            stage === 'sold'
              ? 'bg-amber-500/15 border-amber-500 text-white shadow-[0_0_16px_rgba(245,158,11,0.2)]'
              : 'bg-[#0A0E1A] border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-300 uppercase">2. Sale (-1)</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
              LOW STOCK
            </span>
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1 tabular-nums">
            10 → 9 units
          </div>
          <div className="text-[11px] text-slate-300 mt-1">Remaining: 9 (Threshold reached)</div>
        </button>

        <button
          type="button"
          onClick={() => setStage('restocked')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            stage === 'restocked'
              ? 'bg-blue-500/15 border-blue-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.22)]'
              : 'bg-[#0A0E1A] border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-sky-300 uppercase">3. Restock (+10)</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-sky-300 text-[9px] font-bold">
              REPLENISHED
            </span>
          </div>
          <div className="text-2xl font-black text-sky-400 mt-1 tabular-nums">
            9 → 19 units
          </div>
          <div className="text-[11px] text-slate-300 mt-1">Authorized restock recorded</div>
        </button>
      </div>

      <div className="p-3 rounded-xl bg-[#0A0E1A] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="text-slate-300">
          Current Simulated Stock: <strong className="text-white font-mono">{stockValue} units</strong> · A Business Owner or authorized team member can manage stock and supplier restock orders according to their assigned permissions.
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* STEP 08 DEMO: TEAM & ROLES + CREW PERMISSION INSPECTOR                    */
/* ========================================================================== */
export const Step08TeamRolesDemo: React.FC = () => {
  const roles = [
    {
      level: 'LEVEL 1',
      name: 'SUPER ADMIN',
      scope: 'Platform Level',
      desc: 'Runs the Ellic platform.',
    },
    {
      level: 'LEVEL 2',
      name: 'ELLIC ADMIN',
      scope: 'Platform Level',
      desc: 'Helps manage clients and platform operations according to assigned authority.',
    },
    {
      level: 'LEVEL 3',
      name: 'CLIENT / BUSINESS OWNER',
      scope: 'Store Level',
      desc: 'Runs their own business.',
    },
    {
      level: 'LEVEL 4',
      name: 'CREW',
      scope: 'Store Level',
      desc: 'Helps operate the assigned business/store.',
    },
  ];

  const crewPermissions = [
    { action: 'CREATE BILL', allowed: true, note: 'Select/add products & generate bills' },
    { action: 'RECORD PAYMENT', allowed: true, note: 'Record Cash, Card, UPI, or Split payments' },
    { action: 'VIEW ASSIGNED STORE', allowed: true, note: 'View permitted daily & stock information' },
    { action: 'ADD / RESTOCK PRODUCTS (WHERE AUTHORIZED)', allowed: true, note: 'Update stock when permitted by owner' },
    { action: 'CHANGE PLATFORM ADMIN', allowed: false, note: 'Platform-level control restricted' },
    { action: 'ACCESS ANOTHER BUSINESS', allowed: false, note: 'Strict store/business separation' },
    { action: 'GIVE UNAUTHORIZED DISCOUNTS', allowed: false, note: 'Controlled by business rules' },
    { action: 'DELETE BUSINESS', allowed: false, note: 'Restricted from store crew' },
  ];

  const [selectedRoleIdx, setSelectedRoleIdx] = useState<number>(3);

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">
            4-Level Role Hierarchy & Crew Permission Matrix
          </span>
        </div>
        <DemoBadge label="ROLE PERMISSIONS PREVIEW" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 4-Level Role Hierarchy */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Platform vs. Business Hierarchy
          </div>
          {roles.map((r, idx) => {
            const isSelected = selectedRoleIdx === idx;
            return (
              <button
                key={r.level}
                type="button"
                onClick={() => setSelectedRoleIdx(idx)}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.18)]'
                    : 'bg-[#0A0E1A] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-sky-400 font-bold">{r.level}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {r.scope}
                  </span>
                </div>
                <div className="text-xs font-extrabold text-white mt-1">{r.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{r.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Right: Crew Interactive Permission Experience */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#0A0E1A] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="text-xs font-bold text-white">
                Crew Experience: Available vs. Restricted Actions
              </div>
              <div className="text-[11px] text-slate-400">
                Visualizing what a store Crew member can and cannot do
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-sky-300 text-[10px] font-mono font-bold">
              LEVEL 4 · CREW
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {crewPermissions.map((perm) => (
              <div
                key={perm.action}
                className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                  perm.allowed
                    ? 'bg-blue-950/20 border-blue-500/35'
                    : 'bg-rose-950/15 border-rose-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[11px] font-bold text-white">{perm.action}</span>
                  {perm.allowed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 shrink-0">
                      <Lock className="w-3 h-3" /> Restricted
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{perm.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* STEP 09 DEMO: BUSINESS INSIGHTS (ACTIVITY -> DATA -> INSIGHTS)            */
/* ========================================================================== */
export const Step09InsightsDemo: React.FC = () => {
  const [activityCount, setActivityCount] = useState<number>(0);

  const sampleBars = [
    { day: 'Mon', pct: Math.min(100, 48 + activityCount * 5) },
    { day: 'Tue', pct: Math.min(100, 62 + activityCount * 4) },
    { day: 'Wed', pct: Math.min(100, 55 + activityCount * 6) },
    { day: 'Thu', pct: Math.min(100, 72 + activityCount * 5) },
    { day: 'Fri', pct: Math.min(100, 84 + activityCount * 4) },
    { day: 'Sat', pct: Math.min(100, 92 + activityCount * 3) },
  ];

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">
            How Store Activity Becomes Business Insights (Sample Visualization)
          </span>
        </div>
        <DemoBadge />
      </div>

      {/* Pipeline: Bills + Payments + Inventory + Customers -> BUSINESS DATA -> INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#0A0E1A] border border-slate-800 space-y-2.5">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['Bills', 'Payments', 'Inventory', 'Customers'].map((src) => (
              <div
                key={src}
                className="p-2 rounded-lg bg-[#121826] border border-slate-800 text-center font-bold text-slate-200"
              >
                {src}
              </div>
            ))}
          </div>
          <div className="text-center text-sky-400 text-xs font-mono">↓</div>
          <div className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/40 text-center text-xs font-extrabold text-sky-300">
            BUSINESS DATA → INSIGHTS
          </div>
          <button
            type="button"
            onClick={() => setActivityCount((c) => (c + 1) % 4)}
            className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate New Counter Activity</span>
          </button>
        </div>

        {/* Sample Visualizations */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#0A0E1A] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Sample Sales Trend & Indicators</span>
            <span className="text-[10px] font-mono text-slate-400">
              Demonstration Data Only
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 items-end h-24 pt-2 px-2 bg-[#121826] rounded-lg border border-slate-800">
            {sampleBars.map((bar) => (
              <div key={bar.day} className="flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full h-16 bg-slate-900 rounded-t flex items-end overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${bar.pct}%` }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full bg-gradient-to-t from-blue-600 to-sky-300 rounded-t"
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{bar.day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-[#121826] border border-slate-800">
              <div className="text-slate-400">Top Product (Demo)</div>
              <div className="font-bold text-white truncate">Example Product</div>
            </div>
            <div className="p-2 rounded-lg bg-[#121826] border border-slate-800">
              <div className="text-slate-400">Sample Transactions</div>
              <div className="font-bold text-sky-400">{18 + activityCount} recorded</div>
            </div>
            <div className="p-2 rounded-lg bg-[#121826] border border-slate-800">
              <div className="text-slate-400">Inventory Status</div>
              <div className="font-bold text-white">Connected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* STEP 10 DEMO: THE CONNECTED WORKFLOW (01 PRODUCT -> 07 INSIGHTS RIPPLE)   */
/* ========================================================================== */
export const Step10ConnectedWorkflowDemo: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const transactionConsequences = [
    { step: '01 PRODUCT', action: 'PRODUCT SELECTED', detail: 'Example Product chosen from store catalog' },
    { step: '02 SCANNED', action: 'BILL CREATED', detail: 'Item & quantity added to counter invoice' },
    { step: '03 BILL', action: 'TAX CALCULATED', detail: 'Line total, applicable tax & discounts computed' },
    { step: '04 STOCK', action: 'STOCK UPDATED', detail: 'Available inventory count adjusted (10 → 9)' },
    { step: '05 PAYMENT', action: 'PAYMENT RECORDED', detail: 'Customer payment mode logged & confirmed' },
    { step: '06 KHATA', action: 'CUSTOMER RECORD UPDATED', detail: 'Customer transaction / Khata ledger synced' },
    { step: '07 INSIGHTS', action: 'BUSINESS INSIGHT AVAILABLE', detail: 'Daily sales & product activity updated' },
  ];

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % WORKFLOW_SEVEN_NODES.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const currentConsequence = transactionConsequences[activeIndex];

  return (
    <div className="rounded-2xl bg-[#121826] border border-blue-500/30 p-4 sm:p-5 space-y-4 shadow-[0_0_30px_rgba(37,99,235,0.1)]">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">
            One Customer Purchase Moving Through All 07 Connected Stages
          </span>
        </div>
        <DemoBadge label="CONNECTED SYSTEM RIPPLE" />
      </div>

      {/* 7-Step Connected Sequence */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {WORKFLOW_SEVEN_NODES.map((node, idx) => {
          const isCurrent = idx === activeIndex;
          const isPassed = idx <= activeIndex;
          return (
            <button
              key={node.code}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer overflow-hidden ${
                isCurrent
                  ? 'bg-blue-500/20 border-sky-400 text-white shadow-[0_0_18px_rgba(37,99,235,0.3)]'
                  : isPassed
                  ? 'bg-[#0A0E1A] border-blue-500/35 text-slate-200'
                  : 'bg-[#0A0E1A]/70 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                <span className="text-sky-400">{node.code}</span>
                {isCurrent && <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />}
              </div>
              <div className="text-xs font-extrabold text-white mt-1">{node.label}</div>
              <div className="text-[10px] text-slate-400 truncate">{node.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Live Consequence Readout */}
      <div className="p-4 rounded-xl bg-[#0A0E1A] border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold text-sky-400 uppercase">
            {currentConsequence.step} → {currentConsequence.action}
          </div>
          <div className="text-sm font-bold text-white mt-0.5">{currentConsequence.detail}</div>
        </div>
        <button
          type="button"
          onClick={() => setActiveIndex((prev) => (prev + 1) % WORKFLOW_SEVEN_NODES.length)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <span>Step Ripple Forward</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* STEP 11 DEMO: SECURITY, PRIVACY & CONTROL (WITH LEGAL LINKS)              */
/* ========================================================================== */
export const Step11SecurityPrivacyDemo: React.FC<GuideLegalLinkProps> = ({ onOpenLegalPage }) => {
  const pillars = [
    { title: 'Role-Based Permissions', desc: 'Access scoped to Super Admin, Admin, Business Owner, or Crew.' },
    { title: 'Store / Business Separation', desc: 'Each business operates within its own isolated store records.' },
    { title: 'Secure Authentication', desc: 'Sign-in verification and session controls for authorized users.' },
    { title: 'Controlled Data Access', desc: 'Customer and financial data restricted by role permissions.' },
    { title: 'Audit & Security Controls', desc: 'Activity logging and administrative oversight for critical actions.' },
    { title: 'Privacy & Account Management', desc: 'Documented data handling and account/data deletion processes where applicable.' },
  ];

  const legalLinks: { label: string; slug: LegalPageSlug }[] = [
    { label: 'Privacy Policy', slug: 'privacy-policy' },
    { label: 'Terms of Service', slug: 'terms-of-service' },
    { label: 'Security', slug: 'security' },
    { label: 'Data & Privacy Rights', slug: 'data-privacy-rights' },
    { label: 'Grievance Redressal', slug: 'grievance-redressal' },
  ];

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white">
            Ellic is designed with role-based access and security controls
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {pillars.map((p) => (
          <div key={p.title} className="p-3 rounded-xl bg-[#0A0E1A] border border-slate-800">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{p.title}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Official Policy Links */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">
          Review official platform policies & documentation:
        </span>
        <div className="flex flex-wrap gap-2">
          {legalLinks.map((link) => (
            <button
              key={link.slug}
              type="button"
              onClick={() => onOpenLegalPage?.(link.slug)}
              className="px-2.5 py-1 rounded-lg bg-[#0A0E1A] hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{link.label}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* STEP 12 DEMO: SUBSCRIPTION & ACCOUNT LIFECYCLE                            */
/* ========================================================================== */
export const Step12SubscriptionLifecycleDemo: React.FC<GuideLegalLinkProps> = ({
  onOpenLegalPage,
}) => {
  const lifecycleStages = [
    {
      title: '1. Application / Approval',
      status: 'Onboarding',
      detail: 'Submit your business details to apply for an Ellic merchant account.',
    },
    {
      title: '2. Subscription',
      status: 'Plan Selection',
      detail: 'Select the appropriate subscription plan for your business operations.',
    },
    {
      title: '3. Active',
      status: 'Operational',
      detail: 'Full access to your configured store environment, billing, stock, and insights.',
    },
    {
      title: '4. Renewal',
      status: 'Billing Cycle',
      detail: 'Ongoing subscription renewal keeps your business workspace active.',
    },
    {
      title: '5. Grace Period',
      status: 'If Payment Fails',
      detail: 'If a renewal payment fails, a grace period allows time to resolve billing.',
    },
    {
      title: '6. Restricted / Blocked',
      status: 'If Unresolved',
      detail: 'Access becomes restricted or blocked if subscription payment remains unresolved.',
    },
  ];

  const [selectedStage, setSelectedStage] = useState<number>(2);

  return (
    <div className="rounded-2xl bg-[#121826] border border-slate-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <span className="text-xs font-bold text-white">
          Subscription & Account Lifecycle Overview
        </span>
        <span className="text-[11px] text-slate-400">
          Click any stage to view account status details
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
        {lifecycleStages.map((st, idx) => {
          const isSelected = idx === selectedStage;
          const isWarn = idx >= 4;
          return (
            <button
              key={st.title}
              type="button"
              onClick={() => setSelectedStage(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? isWarn
                    ? 'bg-amber-500/15 border-amber-500 text-white'
                    : 'bg-blue-500/15 border-blue-500 text-white'
                  : 'bg-[#0A0E1A] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono text-sky-400">{st.status}</div>
              <div className="text-xs font-bold text-white mt-0.5">{st.title}</div>
            </button>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-[#0A0E1A] border border-slate-800 space-y-2">
        <div className="text-xs font-bold text-white">
          {lifecycleStages[selectedStage].title}:{' '}
          <span className="text-sky-400">{lifecycleStages[selectedStage].status}</span>
        </div>
        <p className="text-xs text-slate-300">{lifecycleStages[selectedStage].detail}</p>
        <p className="text-[11px] text-slate-400">
          Clients can manage their subscription. Cancellation and data deletion follow the applicable account and data policies.
        </p>
      </div>

      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">Applicable Policies:</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpenLegalPage?.('terms-of-service')}
            className="px-2.5 py-1 rounded-lg bg-[#0A0E1A] hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-sky-400 flex items-center gap-1 cursor-pointer"
          >
            <span>Terms of Service</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onOpenLegalPage?.('cancellation-refund-policy')}
            className="px-2.5 py-1 rounded-lg bg-[#0A0E1A] hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-sky-400 flex items-center gap-1 cursor-pointer"
          >
            <span>Cancellation & Refund Policy</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onOpenLegalPage?.('privacy-policy')}
            className="px-2.5 py-1 rounded-lg bg-[#0A0E1A] hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-sky-400 flex items-center gap-1 cursor-pointer"
          >
            <span>Privacy Policy</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
