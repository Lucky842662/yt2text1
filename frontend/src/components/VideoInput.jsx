import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideos } from '../context/VideoContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateYouTubeUrl } from '../utils/validators.js';
import { ArrowRight, Link2, Loader2 } from 'lucide-react';

export default function VideoInput({ compact = false }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const { processVideo, processing } = useVideos();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/register');
      return;
    }

    if (!url.trim()) {
      setError('Please paste a YouTube URL');
      return;
    }
    if (!validateYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL (e.g. youtube.com/watch?v=...)');
      return;
    }

    try {
      const video = await processVideo(url);
      setUrl('');
      navigate(`/video/${video._id}`);
    } catch {
      // Error handled in context
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? '' : 'w-full max-w-2xl mx-auto'}>
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1">
          <Link2
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder="Paste a YouTube URL..."
            className={`input pl-10 pr-4 ${compact ? 'py-2.5' : 'py-4 text-base'} ${error ? 'border-red-500/60 focus:ring-red-500/30' : ''}`}
            disabled={processing}
          />
        </div>
        <button
          type="submit"
          disabled={processing}
          className={`btn-primary shrink-0 ${compact ? 'py-2.5 px-4' : 'py-4 px-6 text-base'}`}
        >
          {processing ? (
            <><Loader2 size={16} className="animate-spin" /> Processing</>
          ) : (
            <><span className="hidden sm:inline">Transcribe</span><ArrowRight size={16} /></>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
          {error}
        </p>
      )}
    </form>
  );
}
