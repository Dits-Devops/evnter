import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export default function StatusMessage({ type, message }: StatusMessageProps) {
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-500',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
  };
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 shrink-0" />,
    info: <Info className="w-4 h-4 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
  };
  return (
    <div className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-bold shadow-sm transition-all ${styles[type]}`}>
      {icons[type]}
      <p className="flex-1">{message}</p>
    </div>
  );
}
