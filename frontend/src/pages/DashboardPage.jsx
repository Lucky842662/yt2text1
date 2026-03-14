import { useEffect, useState } from 'react';
import { useVideos } from '../context/VideoContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import VideoInput from '../components/VideoInput.jsx';
import VideoList from '../components/VideoList.jsx';
import { Search, Film } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { videos, pagination, loading, fetchVideos, deleteVideo } = useVideos();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchVideos({ page, search });
    }, search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [page, search, fetchVideos]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this video?')) {
      await deleteVideo(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 text-sm">
          {pagination?.total ?? 0} transcripts in your library
        </p>
      </div>

      {/* Add new */}
      <div className="card p-5 mb-8">
        <p className="text-sm font-medium text-slate-400 mb-3">Add a new video</p>
        <VideoInput compact />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by title or channel..."
          className="input pl-10"
        />
      </div>

      {/* Videos */}
      <VideoList videos={videos} loading={loading} onDelete={handleDelete} />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1
                  ? 'bg-brand-500 text-slate-950'
                  : 'btn-secondary !px-0 !py-0 flex items-center justify-center'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
