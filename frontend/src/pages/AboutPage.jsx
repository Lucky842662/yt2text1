import { Link } from 'react-router-dom';
import { Zap, FileText, Sparkles, Shield, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About Transcribe</h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Transcribe helps you extract knowledge from YouTube videos using AI — 
          saving you hours of watching and note-taking.
        </p>
      </div>

      <div className="space-y-6 mb-16">
        {[
          {
            icon: Zap,
            title: 'Instant transcription',
            body: "We use YouTube's native caption data when available, extracting full word-for-word transcripts in under 10 seconds."
          },
          {
            icon: Sparkles,
            title: 'AI-powered summaries',
            body: "Our AI (powered by Google Gemini or OpenAI) reads the full transcript and produces a concise summary with the most important key points."
          },
          {
            icon: FileText,
            title: 'Save and search',
            body: "Every transcript is stored in your private library. Search by title, filter by favorites, and revisit any time."
          },
          {
            icon: Shield,
            title: 'Privacy first',
            body: "Your library is private by default. We don't sell your data or use it to train AI models."
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-6 flex gap-5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-brand-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Ready to try it?</h2>
        <p className="text-slate-500 text-sm mb-6">It's free to get started.</p>
        <Link to="/register" className="btn-primary">
          Get started <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
