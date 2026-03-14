import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Sparkles, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="btn-secondary text-xs py-1.5 px-3">
      {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> {label}</>}
    </button>
  );
};

export default function TranscriptViewer({ video }) {
  const [activeTab, setActiveTab] = useState(video.summary ? 'summary' : 'transcript');
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const PREVIEW_LENGTH = 800;
  const isLong = video.transcript?.length > PREVIEW_LENGTH;
  const displayedTranscript =
    showFullTranscript || !isLong
      ? video.transcript
      : video.transcript?.substring(0, PREVIEW_LENGTH) + '…';

  const tabs = [
    ...(video.summary ? [{ id: 'summary', label: 'AI Summary', icon: Sparkles }] : []),
    { id: 'transcript', label: 'Transcript', icon: AlignLeft },
  ];

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'summary' && video.summary && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Summary
              </h3>
              <CopyButton text={video.summary} />
            </div>
            <div className="prose prose-sm prose-invert max-w-none">
              {video.summary.split('\n\n').map((para, i) => (
                <p key={i} className="text-slate-300 leading-relaxed text-sm mb-3 last:mb-0">
                  {para}
                </p>
              ))}
            </div>

            {video.keyPoints?.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Key Points
                </h3>
                <ul className="space-y-2">
                  {video.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400
                        text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Full Transcript
                {video.wordCount > 0 && (
                  <span className="ml-2 text-slate-500 font-normal normal-case">
                    ({video.wordCount.toLocaleString()} words)
                  </span>
                )}
              </h3>
              {video.transcript && <CopyButton text={video.transcript} />}
            </div>

            {video.transcript ? (
              <>
                <p className="text-slate-300 text-sm leading-relaxed font-mono whitespace-pre-wrap">
                  {displayedTranscript}
                </p>
                {isLong && (
                  <button
                    onClick={() => setShowFullTranscript(!showFullTranscript)}
                    className="btn-secondary w-full justify-center text-sm"
                  >
                    {showFullTranscript ? (
                      <><ChevronUp size={15} /> Show less</>
                    ) : (
                      <><ChevronDown size={15} /> Show full transcript</>
                    )}
                  </button>
                )}
              </>
            ) : (
              <p className="text-slate-500 text-sm italic">No transcript available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
