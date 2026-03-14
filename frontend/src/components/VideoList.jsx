import VideoCard from './VideoCard.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { Film } from 'lucide-react';

export default function VideoList({ videos, loading, onDelete }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="shimmer aspect-video" />
            <div className="p-4 space-y-2">
              <div className="shimmer h-4 rounded w-3/4" />
              <div className="shimmer h-3 rounded w-1/2" />
              <div className="shimmer h-3 rounded w-full mt-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
          <Film size={28} className="text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No videos yet</h3>
        <p className="text-slate-500 text-sm max-w-sm">
          Paste a YouTube URL above to transcribe your first video.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} onDelete={onDelete} />
      ))}
    </div>
  );
}
