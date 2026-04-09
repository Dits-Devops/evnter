'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = {
    toast: addToast,
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    warning: (msg: string) => addToast('warning', msg),
    info: (msg: string) => addToast('info', msg),
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-safe-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4 mt-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border animate-in slide-in-from-top-5 fade-in duration-300 max-w-sm w-full ${
              t.type === 'success' ? 'bg-emerald-50 border-emerald-200/50 text-emerald-800' :
              t.type === 'error' ? 'bg-rose-50 border-rose-200/50 text-rose-800' :
              t.type === 'warning' ? 'bg-amber-50 border-amber-200/50 text-amber-800' :
              'bg-blue-50 border-blue-200/50 text-blue-800'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 shrink-0 text-rose-600" />}
            {t.type === 'warning' && <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />}
            {t.type === 'info' && <Info className="w-5 h-5 shrink-0 text-blue-600" />}
            
            <p className="text-sm font-semibold flex-1 leading-snug">{t.message}</p>
            
            <button onClick={() => removeToast(t.id)} className="p-1 opacity-50 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
