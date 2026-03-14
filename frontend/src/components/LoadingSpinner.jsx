import { Loader2, AlertTriangle } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', full = false }) {
  if (full) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={36} className="animate-spin text-brand-500" />
        <p className="text-slate-400 text-sm">{text}</p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm">
      <Loader2 size={16} className="animate-spin text-brand-500" />
      {text}
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
        <AlertTriangle size={22} className="text-red-400" />
      </div>
      <div>
        <p className="text-slate-300 font-medium mb-1">Something went wrong</p>
        <p className="text-slate-500 text-sm max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Try again
        </button>
      )}
    </div>
  );
}
