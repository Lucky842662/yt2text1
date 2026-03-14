import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { videoService } from '../services/videoService.js';
import TranscriptViewer from '../components/TranscriptViewer.jsx';
import LoadingSpinner, { ErrorMessage } from '../components/LoadingSpinner.jsx';
import { formatDate, formatWordCount } from '../utils/formatters.js';
import {
  ArrowLeft, ExternalLink, Trash2, RefreshCw, Loader2, Clock, BookOpen
} from 'lucide-react';
import { useVideos } from '../context/VideoContext.jsx';
import toast from 'react-hot-toast';

export default function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteVideo } = useVideos();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await videoService.getVideoById(id);
        setVideo(data.video);
      } catch (err) {
        setError(err.response?.data?.error || 'Video not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this video?')) return;
    await deleteVideo(id);
    navigate('/dashboard');
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const data = await videoService.regenerateSummary(id);
      setVideo(data.video);
      toast.success('Summary regenerated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to regenerate summary');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <LoadingSpinner full text="Loading video..." />;
  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <ErrorMessage message={error} onRetry={() => navigate(-1)} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link to="/dashboard" className="btn-ghost text-sm mb-6 inline-flex">
        <ArrowLeft size={15} /> Back to library
      </Link>

      {/* Header */}
      <div className="flex gap-5 mb-6">
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="hidden sm:block w-40 h-24 rounded-xl object-cover shrink-0 border border-slate-800"
            onError={(e) => e.target.remove()}
          />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-100 leading-tight mb-1">
            {video.title}
          </h1>
          {video.channelName && (
            <p className="text-sm text-slate-500 mb-3">{video.channelName}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {formatDate(video.createdAt)}
            </span>
            {video.wordCount > 0 && (
              <span className="flex items-center gap-1">
                <BookOpen size={11} /> {formatWordCount(video.wordCount)}
              </span>
            )}
            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors"
            >
              <ExternalLink size={11} /> Watch on YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={handleRegenerate}
          disabled={regenerating || !video.transcript}
          className="btn-secondary text-sm"
        >
          {regenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Regenerate summary
        </button>
        <button onClick={handleDelete} className="btn-danger text-sm ml-auto">
          <Trash2 size={14} /> Delete
        </button>
      </div>

      {/* Content */}
      <TranscriptViewer video={video} />
    </div>
  );
}
