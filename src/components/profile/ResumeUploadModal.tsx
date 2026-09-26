import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { profileApi } from '../../services/profileApi';
import { ParsedResumeData } from '../../types';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, FolderGit2 } from 'lucide-react';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (parsed: ParsedResumeData) => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);

    try {
      const res = await profileApi.uploadResume(selectedFile);
      setParsedData(res.parsed_resume);
      onSuccess(res.parsed_resume);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse resume.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload & Parse Technical Resume">
      <div className="space-y-5">
        {!parsedData ? (
          <>
            <p className="text-xs text-slate-300">
              Upload your PDF or TXT resume. MASTER AI extracts your verified skills, tools, and technical project architectures to formulate personalized interview questions.
            </p>

            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center transition-colors bg-slate-900/40">
              <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <label className="cursor-pointer block">
                <span className="text-xs font-semibold text-cyan-300 hover:underline">
                  Click to choose a file
                </span>
                <span className="text-xs text-slate-400 block mt-1">PDF or TXT up to 10MB</span>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-xs text-cyan-200">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-mono">{selectedFile.name}</span>
                  <span className="text-slate-400">({Math.round(selectedFile.size / 1024)} KB)</span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="glow"
                size="sm"
                disabled={!selectedFile || isUploading}
                onClick={handleUpload}
                leftIcon={isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              >
                {isUploading ? 'Extracting Skills & Projects...' : 'Parse Resume'}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Resume Successfully Grounded ({Math.round(parsedData.parsing_confidence * 100)}% confidence)
              </div>
              <span className="text-slate-400 font-mono text-[10px]">Candidate: {parsedData.name}</span>
            </div>

            {/* Extracted Skills */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
                Extracted Skills & Competencies ({parsedData.skills.length})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                {parsedData.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Extracted Projects */}
            {parsedData.projects && parsedData.projects.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
                  Grounded Resume Projects ({parsedData.projects.length})
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {parsedData.projects.map((proj, pIdx) => (
                    <div key={pIdx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <p className="font-bold text-amber-300">{proj.title}</p>
                      <p className="text-slate-400 leading-snug">{proj.description}</p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {proj.technologies.map((t, tIdx) => (
                            <span key={tIdx} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="glow" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
