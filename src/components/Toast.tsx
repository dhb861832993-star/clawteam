import { useEffect } from 'react';
import { useToastStore } from '../stores/toastStore';
import { clsx } from 'clsx';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  };
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  const colors = {
    success: 'bg-accent-green/20 border-accent-green text-accent-green',
    error: 'bg-accent-red/20 border-accent-red text-accent-red',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400',
    warning: 'bg-accent-orange/20 border-accent-orange text-accent-orange',
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm',
        'animate-slide-in font-mono text-sm',
        colors[toast.type]
      )}
    >
      <span className="text-lg">{icons[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onClose}
        className="hover:opacity-70 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}