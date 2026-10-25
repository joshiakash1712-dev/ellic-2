import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  LogOut,
  HelpCircle,
  ExternalLink,
  Lock,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';

export const SubscriptionPaywall: React.FC = () => {
  const {
    subscription,
    renewSubscription,
    activeStore,
    setIsSettingsModalOpen
  } = useStore();
  const { logout, currentUser: authUser } = useAuth();

  const [isRenewing, setIsRenewing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isBlocked = subscription.status === 'blocked';
  const isCancelled = subscription.status === 'cancelled';
  const isGracePeriod = subscription.status === 'grace_period';

  const handleRenew = async () => {
    setIsRenewing(true);
    setFeedback(null);
    try {
      await renewSubscription();
      setFeedback('Subscription successfully renewed! Full store access restored.');
    } catch (err: any) {
      setFeedback(err?.message || 'Renewal failed. Please check payment method.');
    } finally {
      setIsRenewing(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full rounded-2xl bg-[#161D2C] border border-rose-500/30 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-bold font-mono uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>
                {isBlocked
                  ? 'Access Blocked: Payment Past Due'
                  : isCancelled
                  ? 'Subscription Cancelled'
                  : isGracePeriod
                  ? 'Grace Period Active'
                  : 'Subscription Notice'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Store Operations Suspended
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Access to POS Billing, Inventory, Customer CRM, and Reports for{' '}
              <strong className="text-white">{activeStore.name}</strong> is currently restricted
              due to an unpaid subscription or cancellation.
            </p>
          </div>
        </div>

        {/* Subscription details snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#121826] border border-slate-800 text-xs tabular-nums">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Current Plan</span>
            <span className="font-bold text-white uppercase">{subscription.name || 'Enterprise'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Renewal Due</span>
            <span className="font-mono text-rose-400 font-bold">{subscription.renewalDate || 'Overdue'}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Monthly Charge</span>
            <span className="font-mono text-emerald-400 font-bold">₹{subscription.priceMonthly || 1499} / mo</span>
          </div>
        </div>

        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRenew}
            disabled={isRenewing}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isRenewing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Payment & Renewal...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Renew Subscription (₹{subscription.priceMonthly || 1499})</span>
              </>
            )}
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-2">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              View Billing & Invoice Records
            </button>

            <div className="flex items-center gap-4">
              <a
                href="mailto:support@ellic.com"
                className="text-slate-400 hover:text-slate-300 flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Support</span>
              </a>

              <button
                onClick={() => logout()}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
