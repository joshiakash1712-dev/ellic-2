import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Package,
  CreditCard,
  ShieldAlert,
  Trash2,
  ExternalLink,
  CheckCheck,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const {
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setActiveModule,
    activeRole
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'low_stock' | 'restock' | 'payment' | 'security'>('all');
  const [isLowStockGroupExpanded, setIsLowStockGroupExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strict role isolation: Crew members cannot see notifications targeted to 'client' (owner) or admins
  const visibleNotifications = notifications.filter(n => {
    if (n.targetRole && n.targetRole !== 'all') {
      if (activeRole === 'crew' && n.targetRole !== 'crew') {
        return false;
      }
      if (activeRole === 'client' && (n.targetRole === 'ellix_admin' || n.targetRole === 'super_admin')) {
        return false;
      }
    }
    return true;
  });

  const filteredNotifications = visibleNotifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  // Group multiple low-stock notifications into a single aggregate item (FIX 10)
  const { groupedLowStockItems, otherNotifications, hasMultipleLowStock, lowStockUnread } = React.useMemo(() => {
    const lowStockItems = filteredNotifications.filter(n => n.category === 'low_stock');
    const others = filteredNotifications.filter(n => n.category !== 'low_stock');

    if (lowStockItems.length > 1) {
      const parsed = lowStockItems.map(item => {
        const cleanedName = item.title
          .replace(/^🚨\s*CRITICAL Low Stock:\s*/i, '')
          .replace(/^⚠️\s*Low Stock Warning:\s*/i, '')
          .trim();
        const match = item.message.match(/dropped to (\d+\s*\w*)/i);
        const units = match ? match[1] : 'low units';
        return {
          id: item.id,
          name: cleanedName,
          units,
          read: item.read,
          raw: item
        };
      });

      const unread = lowStockItems.some(item => !item.read);

      return {
        groupedLowStockItems: parsed,
        otherNotifications: others,
        hasMultipleLowStock: true,
        lowStockUnread: unread
      };
    }

    return {
      groupedLowStockItems: [],
      otherNotifications: filteredNotifications,
      hasMultipleLowStock: false,
      lowStockUnread: false
    };
  }, [filteredNotifications]);

  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    visibleNotifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'restock':
        return <Package className="w-4 h-4 text-sky-400" />;
      case 'customer_order':
        return <Bell className="w-4 h-4 text-blue-400" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-sky-400" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'low_stock':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">Low Stock</span>;
      case 'restock':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">Restock</span>;
      case 'payment':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">Payment</span>;
      case 'security':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">Security</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">Notice</span>;
    }
  };

  const modalContent = (
    <div
      id="notification-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-[#0A0E1A]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div
        id="notification-modal-dialog"
        className="w-full max-w-xl bg-[#161D2C] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-slate-100 animate-in zoom-in-95 duration-150 relative"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#121826] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600/30 to-sky-400/20 text-sky-400 border border-sky-500/30 shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Notifications & Alerts
                </h2>
                {unreadCount > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 font-extrabold border border-sky-500/40 tabular-nums">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time critical operational alerts, low stock warnings, and B2B updates.
              </p>
            </div>
          </div>

          <button
            id="notification-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills & Actions Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-800/80 bg-[#0A0E1A]/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('low_stock')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'low_stock'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Stock ({notifications.filter(n => n.category === 'low_stock').length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('restock')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'restock'
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3 h-3 text-sky-400" />
              <span>Restock ({notifications.filter(n => n.category === 'restock').length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-slate-400 hover:text-rose-400 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Clear all alerts"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Notification List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800/80 my-2">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">All Caught Up!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {activeFilter === 'all'
                  ? 'No notifications or critical alerts in your inbox.'
                  : `No notifications found under the "${activeFilter}" category.`}
              </p>
            </div>
          ) : (
            <>
              {/* Grouped Low-Stock Notification Card (FIX 10) */}
              {hasMultipleLowStock && (
                <div className={`p-4 rounded-xl border transition-all ${
                  lowStockUnread
                    ? 'bg-amber-950/20 border-amber-500/40 text-slate-100 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-white">
                            Low Stock · {groupedLowStockItems.length} products
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Depleted Stock
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Multiple inventory items have reached or fallen below minimum replenishment threshold.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsLowStockGroupExpanded(prev => !prev)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 flex items-center gap-1 text-xs"
                      title={isLowStockGroupExpanded ? 'Collapse list' : 'Expand list'}
                    >
                      <span className="text-[11px] font-semibold">{isLowStockGroupExpanded ? 'Hide' : 'View'}</span>
                      {isLowStockGroupExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Breakdown */}
                  {isLowStockGroupExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Affected Products & Stock Levels:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {groupedLowStockItems.map(item => (
                          <div
                            key={item.id}
                            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-slate-200"
                          >
                            <span className="font-semibold text-white truncate mr-2">{item.name}</span>
                            <span className="text-amber-400 font-mono font-bold shrink-0">{item.units}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            groupedLowStockItems.forEach(i => markNotificationRead(i.id));
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-200 font-medium"
                        >
                          Mark all {groupedLowStockItems.length} read
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            groupedLowStockItems.forEach(i => markNotificationRead(i.id));
                            setActiveModule('retailer');
                            onClose();
                          }}
                          className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                        >
                          <span>Open Inventory & Restock</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Other notifications */}
              {otherNotifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.linkModule) {
                      setActiveModule(n.linkModule);
                      onClose();
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                    n.read
                      ? 'bg-[#0A0E1A]/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      : 'bg-[#121826] border-slate-700/80 text-slate-100 shadow-md hover:border-blue-500/60'
                  }`}
                >
                  {!n.read && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-sky-400 shadow-lg shadow-sky-400/50" />
                  )}

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#0A0E1A] border border-slate-800 shrink-0 mt-0.5">
                      {getCategoryIcon(n.category)}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white truncate">
                          {n.title}
                        </h4>
                        {getCategoryBadge(n.category)}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
                        <span>{n.timestamp}</span>

                        {n.linkModule && (
                          <span className="font-bold text-sky-400 group-hover:text-sky-300 flex items-center gap-1">
                            <span>Open {n.linkModule.toUpperCase()}</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#121826] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Multi-Channel Dispatch Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
