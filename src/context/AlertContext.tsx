'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import Button from '@/components/Button';

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AlertOptions {
  title: string;
  text: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => Promise<boolean>;
  success: (title: string, text: string) => Promise<boolean>;
  error: (title: string, text: string) => Promise<boolean>;
  warning: (title: string, text: string) => Promise<boolean>;
  confirm: (title: string, text: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<(AlertOptions & { resolve: (val: boolean) => void }) | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    return new Promise<boolean>((resolve) => {
      setAlert({ ...options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    if (alert) {
      alert.resolve(result);
      setAlert(null);
    }
  };

  const value = {
    showAlert,
    success: (title: string, text: string) => showAlert({ title, text, type: 'success', confirmText: 'OK' }),
    error: (title: string, text: string) => showAlert({ title, text, type: 'error', confirmText: 'Tutup' }),
    warning: (title: string, text: string) => showAlert({ title, text, type: 'warning', confirmText: 'OK' }),
    confirm: (title: string, text: string) => showAlert({ title, text, type: 'confirm', confirmText: 'Ya', cancelText: 'Batal' }),
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      {alert && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-card border border-border/80 text-card-foreground rounded-[2rem] p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${
              alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
              alert.type === 'error' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
              alert.type === 'warning' || alert.type === 'confirm' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
              'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              {alert.type === 'success' && <CheckCircle2 className="w-8 h-8" />}
              {alert.type === 'error' && <XCircle className="w-8 h-8" />}
              {(alert.type === 'warning' || alert.type === 'confirm') && <AlertTriangle className="w-8 h-8" />}
              {alert.type === 'info' && <Info className="w-8 h-8" />}
            </div>
            
            <h2 className="text-xl font-black text-foreground mb-1.5">{alert.title}</h2>
            <p className="text-xs text-muted-foreground font-medium mb-6 px-2">{alert.text}</p>
            
            <div className="flex gap-3 w-full">
              {alert.type === 'confirm' && (
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={() => handleClose(false)}
                >
                  {alert.cancelText || 'Batal'}
                </Button>
              )}
              <Button 
                variant={alert.type === 'error' ? 'danger' : 'primary'}
                fullWidth 
                onClick={() => handleClose(true)}
              >
                {alert.confirmText || 'OK'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within AlertProvider');
  return context;
}
