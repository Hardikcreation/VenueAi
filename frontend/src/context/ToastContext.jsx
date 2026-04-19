import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

const ToastContext = createContext({ showToast: () => {} });

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-50',
  },
  error: {
    icon: TriangleAlert,
    className: 'border-red-400/30 bg-red-500/15 text-red-50',
  },
  info: {
    icon: Info,
    className: 'border-sky-400/30 bg-sky-500/15 text-sky-50',
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, 3500);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-3">
        {toasts.map((toast) => {
          const config = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${config.className}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="flex-1 text-sm leading-6">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
