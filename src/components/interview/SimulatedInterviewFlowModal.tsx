import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useSession } from '../../context/SessionContext';
import { Sparkles, Brain, ShieldAlert, CheckCircle2, Play, ArrowRight } from 'lucide-react';
import { AIState } from '../../types';

interface SimulatedInterviewFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatedInterviewFlowModal: React.FC<SimulatedInterviewFlowModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setAIStateDirectly, submitAnswer, addTranscriptMessage } = useSession();

  const handleRunSimulation = (type: 'ideal' | 'flawed' | 'adversarial') => {
    onClose();
    if (type === 'ideal') {
      submitAnswer(
        'I would analyze centralized SIEM telemetry for Event ID 4624 (Logon Type 3) across domain controllers, correlate Sysmon Event ID 10 for LSASS memory dumps, and verify parent-child process lineage on endpoints.'
      );
    } else if (type === 'flawed') {
      submitAnswer(
        'Um, I think basically our perimeter firewall will just block the attacker from connecting to other machines inside the network.'
      );
    } else {
      submitAnswer(
        'In our zero-trust architecture, mutual TLS and ephemeral short-lived tokens prevent any unauthorized east-west lateral traversal completely.'
      );
    }
  };

  const handleForceState = (state: AIState, desc: string) => {
    setAIStateDirectly(state, desc);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Interactive AI State & Flow Simulator"
      description="Demonstrate autonomous multi-agent transitions, adversarial probing, and real-time rubric scoring."
      size="lg"
    >
      <div className="space-y-5">
        {/* Preset Response Scenarios */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2.5">
            1. Inject Candidate Response Scenario
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => handleRunSimulation('ideal')}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Deep Technical Answer</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                References Event ID 4624, LSASS memory triage, and process lineage.
              </p>
            </div>

            <div
              onClick={() => handleRunSimulation('flawed')}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Flawed / Incomplete</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Contains filler words and relies on perimeter firewall assumptions.
              </p>
            </div>

            <div
              onClick={() => handleRunSimulation('adversarial')}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-400 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Bold Zero-Trust Claim</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Asserts mTLS prevents all attacks; prompts adversary to challenge token theft.
              </p>
            </div>
          </div>
        </div>

        {/* Manual State Triggers */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-2.5">
            2. Force AI Autonomous Agent State
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleForceState('LISTENING', 'Listening to user answer via audio stream...')}
              className="text-xs"
            >
              ● LISTENING
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleForceState('ANALYZING', 'Analyzing candidate response against security rubric...')}
              className="text-xs"
            >
              ● ANALYZING
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleForceState('FACT_CHECKING', 'Verifying telemetry claim with NIST RAG agent...')}
              className="text-xs text-emerald-300 border-emerald-500/30"
            >
              ● FACT CHECK
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleForceState('CHALLENGING', 'Preparing high-pressure adversary counter-probe...')}
              className="text-xs text-rose-300 border-rose-500/30"
            >
              ● CHALLENGE
            </Button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300">
          <p className="font-semibold text-indigo-300 mb-1">💡 Architecture Note for Evaluators:</p>
          <p className="text-[11px] leading-relaxed text-slate-400">
            In later stages, these states are driven by a LangGraph / vLLM multi-agent loop with real Whisper STT, MediaPipe vision telemetry, and ElevenLabs voice.
          </p>
        </div>
      </div>
    </Modal>
  );
};
