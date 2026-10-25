import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Check, Loader2, AlertCircle } from 'lucide-react';

export const SaveStatusToast: React.FC = () => {
  const { saveFeedback } = useStore();

  if (!saveFeedback || saveFeedback.status === 'idle') {
    return null;
  }

  return (
    <div
      id="save-status-toast"
      aria-live="polite"
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 pointer-events-none transition-all duration-300 ease-out"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur border border-slate-700/70 shadow-lg text-xs">
        {saveFeedback.status === 'saving' && (
          <>
            <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span className="text-slate-300 font-medium">
              {saveFeedback.message || 'Saving changes...'}
            </span>
          </>
        )}

        {saveFeedback.status === 'saved' && (
          <>
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-2.5 h-2.5" />
            </div>
            <span className="text-emerald-300 font-medium">
              {saveFeedback.message || 'Saved'}
            </span>
          </>
        )}

        {saveFeedback.status === 'error' && (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-medium">
              {saveFeedback.message || 'Saved offline'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
