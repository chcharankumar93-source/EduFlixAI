import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none" role="status" aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg bg-[#181818] border border-white/10 text-sm text-white animate-fade-in min-w-[240px] max-w-sm"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="text-gray-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
