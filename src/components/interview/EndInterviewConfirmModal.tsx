import React from 'react';
import { AlertTriangle, X, Check, Save } from 'lucide-react';
import { Button } from '../common/Button';

interface EndInterviewConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEnd: () => void;
  answeredQuestionsCount: number;
}

export const EndInterviewConfirmModal: React.FC<EndInterviewConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmEnd,
  answeredQuestionsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0c1021] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-white">End Interview Session?</h3>
            <p className="text-xs text-slate-400">
              {answeredQuestionsCount} answer(s) evaluated and saved
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Your current responses, rubric scores, and presentation telemetry will be stored permanently in the database and compiled into your Performance Report.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Continue Interview
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirmEnd}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            End & View Report
          </Button>
        </div>
      </div>
    </div>
  );
};
