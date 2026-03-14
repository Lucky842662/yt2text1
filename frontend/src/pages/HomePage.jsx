import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import VideoInput from '../components/VideoInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Zap, FileText, Sparkles, ArrowRight, Shield, Clock } from 'lucide-react';

const Feature = ({ icon: Icon, title, description }) => (
  <div className="card p-6 hover:border-slate-700 transition-colors">
    <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
      <Icon size={18} className="text-brand-400" />
    </div>
    <h3 className="font-semibold text-slate-200 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </div>
);

export default function HomePage() {
  const { user } = useAuth();
  const [visitorCount, setVisitorCount] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const source = new EventSource(`${baseUrl}/api/visitors/stream`);
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.count === 'number') setVisitorCount(data.count);
      } catch {
        // Ignore malformed payloads
      }
    };
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-8">
          <Zap size={11} /> AI-powered transcription
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Turn any YouTube video
          <br />
          <span className="text-brand-400">into searchable text</span>
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Paste a URL, get the full transcript and an AI-generated summary in seconds.
          Save, search, and share your video notes.
        </p>

        <VideoInput />

        {!user && (
          <p className="mt-4 text-sm text-slate-600">
            Free to try —{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors">
              create an account
            </Link>{' '}
            to save your transcripts
          </p>
        )}
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Feature
            icon={FileText}
            title="Full Transcripts"
            description="Get word-for-word transcripts from YouTube's captions in seconds."
          />
          <Feature
            icon={Sparkles}
            title="AI Summaries"
            description="Gemini or GPT-4 distills long videos into concise summaries and key points."
          />
          <Feature
            icon={Shield}
            title="Private Library"
            description="All your transcripts are stored securely and only accessible to you."
          />
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 text-center">
          <div className="card p-10">
            <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
            <p className="text-slate-400 mb-8">
              Join thousands of researchers, students, and content creators.
            </p>
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Create free account <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Support + Live Visitors */}
      <section className="max-w-1xl mx-auto px-4 sm:px-6 pb-12 flex flex-col items-center gap-4">
        <div className="card p-4 w-full sm:w-96 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500">Live Visitors</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">
            {visitorCount === null ? '—' : visitorCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Watching this page now</p>
        </div>

        <div className="card p-4 w-full sm:w-96">
          <button
            type="button"
            className="w-full btn-primary py-2.5 text-sm"
            onClick={() => setShowSupport((v) => !v)}
          >
            {showSupport ? 'Hide Support' : 'Contact Support on WhatsApp'}
          </button>

          {showSupport && (
            <div className="mt-3">
              <label className="block text-xs text-slate-500 mb-2">Message</label>
              <textarea
                rows={3}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Hi, I need help with..."
                className="input w-full resize-none"
              />
              <a
                href={`https://wa.me/919001361980?text=${encodeURIComponent(supportMessage || 'Hi, I need help with...')}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full mt-3 py-2.5 text-sm justify-center"
              >
                Send on WhatsApp
              </a>
              {/* <p className="text-[11px] text-slate-500 mt-2 text-center">
                Your number stays private.
              </p> */}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
