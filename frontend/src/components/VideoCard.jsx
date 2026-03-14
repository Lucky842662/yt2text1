import { Link } from 'react-router-dom';
import { Trash2, Heart, Clock, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatRelative, formatWordCount, getStatusColor, truncate } from '../utils/formatters.js';
import { useVideos } from '../context/VideoContext.jsx';

const StatusBadge = ({ status }) => {
  const cls = getStatusColor(status);
  const icons = {
    completed: <CheckCircle size={11} />,
    processing: <Loader2 size={11} className="animate-spin" />,
    failed: <AlertCircle size={11} />,
    pending: <Clock size={11} />,
  };
  return (
    <span className={`badge border ${cls}`}>
      {icons[status]}
      {status}
    </span>
  );
};

export default function VideoCard({ video, onDelete }) {
  const { toggleFavorite } = useVideos();

  return (
    <div className="card group flex flex-col overflow-hidden hover:border-slate-700
      transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/50">
      {/* Thumbnail */}
      <Link to={`/video/${video._id}`} className="block relative aspect-video overflow-hidden bg-slate-800">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText size={32} className="text-slate-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 left-2">
          <StatusBadge status={video.status} />
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div>
          <Link to={`/video/${video._id}`}>
            <h3 className="font-semibold text-slate-100 leading-snug hover:text-brand-400
              transition-colors line-clamp-2 text-sm">
              {video.title || 'Untitled'}
            </h3>
          </Link>
          {video.channelName && (
            <p className="text-xs text-slate-500 mt-1">{video.channelName}</p>
          )}
        </div>

        {video.summary && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {truncate(video.summary, 120)}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {video.wordCount > 0 && (
              <span className="flex items-center gap-1">
                <FileText size={11} /> {formatWordCount(video.wordCount)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={11} /> {formatRelative(video.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFavorite(video._id, video.isFavorite)}
              className={`p-1.5 rounded-lg transition-colors ${
                video.isFavorite
                  ? 'text-rose-400 hover:text-rose-300'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
              title={video.isFavorite ? 'Unfavorite' : 'Favorite'}
            >
              <Heart size={13} fill={video.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => onDelete(video._id)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
