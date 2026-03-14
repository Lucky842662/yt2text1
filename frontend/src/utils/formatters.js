import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy');

export const formatRelative = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatWordCount = (count) => {
  if (!count) return '0 words';
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k words` : `${count} words`;
};

export const truncate = (str, length = 100) =>
  str && str.length > length ? str.substring(0, length) + '…' : str;

export const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'text-brand-400 bg-brand-500/10 border-brand-500/20';
    case 'processing': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
    default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
};
