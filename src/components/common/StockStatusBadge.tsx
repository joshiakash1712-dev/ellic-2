import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldAlert,
  Lock,
  PauseCircle
} from 'lucide-react';

export type StockStatusLevel = 'normal' | 'low' | 'critical' | 'out_of_stock';

export type SystemStatusType =
  | 'active'
  | 'inactive'
  | 'normal'
  | 'low_stock'
  | 'critical'
  | 'out_of_stock'
  | 'paid'
  | 'pending'
  | 'past_due'
  | 'grace_period'
  | 'blocked'
  | 'cancelled';

export interface StockStatusInfo {
  level: StockStatusLevel;
  label: string;
  badgeClass: string;
  textClass: string;
  dotClass: string;
  icon: React.ReactNode;
}

export interface SystemStatusInfo {
  status: SystemStatusType;
  label: string;
  badgeClass: string;
  textClass: string;
  dotClass: string;
  icon: React.ReactNode;
}

export function getSystemStatusInfo(status: SystemStatusType): SystemStatusInfo {
  switch (status) {
    case 'active':
      return {
        status,
        label: 'Active',
        badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        textClass: 'text-sky-400',
        dotClass: 'bg-sky-400',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
      };
    case 'inactive':
      return {
        status,
        label: 'Inactive',
        badgeClass: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
        textClass: 'text-slate-400',
        dotClass: 'bg-slate-400',
        icon: <PauseCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      };
    case 'normal':
      return {
        status,
        label: 'Normal',
        badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        textClass: 'text-sky-400',
        dotClass: 'bg-sky-400',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
      };
    case 'low_stock':
      return {
        status,
        label: 'Low Stock',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        textClass: 'text-amber-400',
        dotClass: 'bg-amber-400',
        icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      };
    case 'critical':
      return {
        status,
        label: 'Critical',
        badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
        textClass: 'text-rose-400',
        dotClass: 'bg-rose-400',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      };
    case 'out_of_stock':
      return {
        status,
        label: 'Out of Stock',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        textClass: 'text-rose-400',
        dotClass: 'bg-rose-500',
        icon: <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      };
    case 'paid':
      return {
        status,
        label: 'Paid',
        badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        textClass: 'text-sky-400',
        dotClass: 'bg-sky-400',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
      };
    case 'pending':
      return {
        status,
        label: 'Pending',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        textClass: 'text-amber-400',
        dotClass: 'bg-amber-400',
        icon: <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      };
    case 'past_due':
      return {
        status,
        label: 'Past Due',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
        textClass: 'text-amber-400',
        dotClass: 'bg-amber-400',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      };
    case 'grace_period':
      return {
        status,
        label: 'Grace Period',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
        textClass: 'text-amber-400',
        dotClass: 'bg-amber-400',
        icon: <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      };
    case 'blocked':
      return {
        status,
        label: 'Blocked',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        textClass: 'text-rose-400',
        dotClass: 'bg-rose-500',
        icon: <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      };
    case 'cancelled':
      return {
        status,
        label: 'Cancelled',
        badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
        textClass: 'text-rose-400',
        dotClass: 'bg-rose-400',
        icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      };
  }
}

export const SystemStatusBadge: React.FC<{
  status: SystemStatusType;
  customLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ status, customLabel, size = 'sm', className = '' }) => {
  const info = getSystemStatusInfo(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg border transition-colors select-none ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${info.badgeClass} ${className}`}
    >
      {info.icon}
      <span className="tracking-tight">{customLabel || info.label}</span>
    </span>
  );
};

/**
 * Returns structured stock status according to Ellix Connect thresholds:
 * - Stock > 10: Normal (CheckCircle2, sapphire/sky)
 * - Stock 4-10: Low Stock (AlertCircle, amber)
 * - Stock 1-3: Critical (AlertTriangle, rose)
 * - Stock = 0: Out of Stock (XCircle, red)
 */
export function getStockStatus(stock: number): StockStatusInfo {
  const num = Number(stock) || 0;

  if (num <= 0) {
    return {
      level: 'out_of_stock',
      label: 'Out of Stock',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
      textClass: 'text-rose-400',
      dotClass: 'bg-rose-500',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
    };
  }

  if (num >= 1 && num <= 3) {
    return {
      level: 'critical',
      label: 'Critical',
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/35',
      textClass: 'text-red-400',
      dotClass: 'bg-red-500',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
    };
  }

  if (num >= 4 && num <= 10) {
    return {
      level: 'low',
      label: 'Low Stock',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
      textClass: 'text-amber-400',
      dotClass: 'bg-amber-500',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
    };
  }

  return {
    level: 'normal',
    label: 'Normal',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/35',
    textClass: 'text-sky-400',
    dotClass: 'bg-sky-500',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
  };
}

interface StockStatusBadgeProps {
  stock: number;
  unit?: string;
  showQuantity?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({
  stock,
  unit,
  showQuantity = false,
  size = 'sm',
  className = ''
}) => {
  const status = getStockStatus(stock);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg border transition-colors select-none ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${status.badgeClass} ${className}`}
      title={`Stock: ${stock} ${unit || 'units'} (${status.label})`}
    >
      {status.icon}
      {showQuantity && (
        <span className="font-mono font-extrabold mr-0.5">
          {stock} {unit ? unit : ''}
        </span>
      )}
      <span className="tracking-tight">{status.label}</span>
    </span>
  );
};
