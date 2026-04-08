interface StatusMessageProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export default function StatusMessage({ type, message }: StatusMessageProps) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${styles[type]}`}>
      <span>{icons[type]}</span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
