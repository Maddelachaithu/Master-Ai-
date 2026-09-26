import React, { useEffect, useRef, useState } from 'react';
import { TranscriptMessage } from '../../types';
import { Badge } from '../common/Badge';
import { Brain, User, Sparkles, CheckCircle2, AlertCircle, Volume2, ShieldAlert, Mic, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LiveTranscriptProps {
  transcript: TranscriptMessage[];
  className?: string;
  isRecordingAnswer?: boolean;
  isTranscribing?: boolean;
  liveInterimTranscript?: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  transcript,
  className,
  isRecordingAnswer,
  isTranscribing,
  liveInterimTranscript,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript, liveInterimTranscript, isRecordingAnswer, isTranscribing, autoScroll]);

  // Helper to render text with highlighted words
  const renderHighlightedText = (message: TranscriptMessage) => {
    if (!message.highlights || message.highlights.length === 0) {
      return <span>{message.text}</span>;
    }

    // Sort highlights by length descending to match longest phrases first
    let result = message.text;
    const parts: { text: string; highlight?: any }[] = [{ text: result }];

    message.highlights.forEach((h) => {
      for (let i = 0; i < parts.length; i++) {
        if (!parts[i].highlight && parts[i].text.includes(h.text)) {
          const index = parts[i].text.indexOf(h.text);
          const before = parts[i].text.substring(0, index);
          const match = h.text;
          const after = parts[i].text.substring(index + h.text.length);

          const newParts = [];
          if (before) newParts.push({ text: before });
          newParts.push({ text: match, highlight: h });
          if (after) newParts.push({ text: after });

          parts.splice(i, 1, ...newParts);
          break;
        }
      }
    });

    return (
      <span>
        {parts.map((part, idx) => {
          if (!part.highlight) return <span key={idx}>{part.text}</span>;

          const hType = part.highlight.type;
          let highlightStyle = 'px-1.5 py-0.5 rounded text-xs font-mono font-semibold ';

          if (hType === 'technical_claim') {
            highlightStyle += 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30';
          } else if (hType === 'verified_claim') {
            highlightStyle += 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30';
          } else if (hType === 'filler_word') {
            highlightStyle += 'bg-rose-500/20 text-rose-300 border border-rose-500/30 line-through decoration-rose-400';
          } else if (hType === 'debated_claim') {
            highlightStyle += 'bg-amber-500/20 text-amber-200 border border-amber-500/30';
          } else {
            highlightStyle += 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30';
          }

          return (
            <span
              key={idx}
              className={highlightStyle}
              title={part.highlight.note || `Detected ${hType.replace('_', ' ')}`}
            >
              {part.text}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl overflow-hidden',
        className
      )}
    >
      {/* Transcript Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0c0f1e]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Real-Time Multimodal Transcript
          </span>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ● Verified
          </span>
          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            ● Filler Word
          </span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            ● Key Concept
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div
        ref={containerRef}
        onScroll={(e) => {
          const target = e.currentTarget;
          const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 40;
          setAutoScroll(isAtBottom);
        }}
        className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[380px] min-h-[220px]"
      >
        {transcript.map((msg) => {
          const isAI = msg.sender === 'ai';
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-800/80 text-[11px] font-mono text-slate-400 border border-white/[0.04]">
                  ⚙️ {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-300',
                isUser ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar Icon */}
              <div
                className={cn(
                  'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border shadow-md',
                  isAI
                    ? 'bg-gradient-to-br from-cyan-950 to-indigo-950 text-cyan-400 border-cyan-500/30'
                    : 'bg-gradient-to-br from-indigo-900 to-purple-950 text-indigo-200 border-indigo-500/30'
                )}
              >
                {isAI ? <Brain className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  'max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl border leading-relaxed',
                  isAI
                    ? 'bg-[#0f1426] border-indigo-500/25 text-slate-200 rounded-tl-sm'
                    : 'bg-indigo-950/40 border-indigo-400/30 text-white rounded-tr-sm'
                )}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-mono font-bold tracking-wider uppercase',
                        isAI ? 'text-cyan-400' : 'text-indigo-300'
                      )}
                    >
                      {isAI ? 'MASTER AI (Adversary)' : 'CANDIDATE (You)'}
                    </span>
                    {isUser && msg.isRealTranscription && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        ● WHISPER STT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    {msg.durationSeconds && (
                      <span>{msg.durationSeconds}s</span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                <div className="text-xs sm:text-[13px] leading-relaxed">
                  {renderHighlightedText(msg)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Audio Streaming Bubble while recording */}
        {isRecordingAnswer && (
          <div className="flex flex-row-reverse gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.3)]">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-950/60 to-cyan-950/40 border border-cyan-500/40 text-white shadow-[0_0_18px_rgba(0,242,254,0.15)]">
              <div className="flex items-center justify-between gap-4 mb-1.5">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  ● Speaking Live
                </span>
                <span className="text-[10px] font-mono text-slate-400">Listening...</span>
              </div>
              <p className="italic text-xs sm:text-[13px] text-slate-200 leading-relaxed">
                {liveInterimTranscript || 'Speak your answer clearly into the microphone...'}
              </p>
            </div>
          </div>
        )}

        {/* Live Transcribing Bubble when Whisper is processing */}
        {isTranscribing && (
          <div className="flex flex-row-reverse gap-3 text-xs sm:text-sm animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border border-indigo-500/40 bg-indigo-950/60 text-indigo-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            </div>
            <div className="max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl rounded-tr-sm bg-indigo-950/50 border border-indigo-500/40 text-white">
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-300">
                  ● Whisper STT Processing
                </span>
              </div>
              <p className="text-xs text-slate-300">Transcribing candidate speech recording...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
