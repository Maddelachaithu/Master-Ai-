import React from 'react';
import { Zap, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { ChallengeDetails } from '../../types';

interface ChallengeBannerProps {
  challengeDetails?: ChallengeDetails;
  isChallenging?: boolean;
}

export const ChallengeBanner: React.FC<ChallengeBannerProps> = ({
  challengeDetails,
  isChallenging = false,
}) => {
  if (!challengeDetails?.is_challenge_needed && !isChallenging) {
    return null;
  }

  const mode = challengeDetails?.challenge_mode || 'Adversarial Deep Dive';
  const hasContradiction = challengeDetails?.contradiction?.contradiction_detected;

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900/60 p-3.5 backdrop-blur-md shadow-lg shadow-amber-950/20 animate-fade-in">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                ⚡ CHALLENGER ACTIVE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {mode}
              </span>
              {hasContradiction && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Inconsistency Detected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              MASTER AI is pressure-testing your technical assumptions.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400 font-mono">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Pressure Test
        </div>
      </div>
    </div>
  );
};
