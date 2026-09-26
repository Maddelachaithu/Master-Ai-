import React, { useState, useEffect } from 'react';
import {
  User,
  FileText,
  Briefcase,
  Building,
  Target,
  Sparkles,
  ShieldCheck,
  Award,
  AlertTriangle,
  Trash2,
  Upload,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sliders,
  Zap,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ResumeUploadModal } from '../components/profile/ResumeUploadModal';
import { JobMatchModal } from '../components/profile/JobMatchModal';
import { profileApi } from '../services/profileApi';
import { analyticsApi } from '../services/analyticsApi';
import { CandidateProfile, ParsedResumeData, SkillGapAnalysis } from '../types';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isJobMatchModalOpen, setIsJobMatchModalOpen] = useState(false);

  // Privacy confirm modal
  const [deleteConfirmType, setDeleteConfirmType] = useState<
    'resume' | 'history' | 'profile' | null
  >(null);

  // Form State
  const [name, setName] = useState('Chaitanya');
  const [email, setEmail] = useState('chaitanya@masterai.dev');
  const [targetRole, setTargetRole] = useState('SOC Analyst');
  const [targetCompany, setTargetCompany] = useState('CrowdStrike');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [preferredTopics, setPreferredTopics] = useState('Incident Response, SIEM, Lateral Movement');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const p = await profileApi.getProfile();
      if (p) {
        setProfile(p);
        setName(p.name);
        setEmail(p.email || 'chaitanya@masterai.dev');
        setTargetRole(p.target_role || 'SOC Analyst');
        setTargetCompany(p.target_companies?.[0] || 'CrowdStrike');
        setExperienceLevel(p.experience_level || 'mid');
        setPreferredTopics(p.preferred_topics?.join(', ') || 'Incident Response, SIEM');

        const gaps = await profileApi.getSkillGaps(p.id, p.target_role);
        setSkillGaps(gaps);
      }
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await profileApi.saveProfile({
        id: profile?.id,
        name,
        email,
        target_role: targetRole,
        experience_level: experienceLevel,
        target_companies: targetCompany ? [targetCompany] : [],
        preferred_topics: preferredTopics
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      const gaps = await profileApi.getSkillGaps(updated.id, updated.target_role);
      setSkillGaps(gaps);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeSuccess = (data: ParsedResumeData) => {
    loadProfileData();
  };

  const handleDeleteData = async (type: 'resume' | 'history' | 'profile') => {
    try {
      if (type === 'resume') {
        await profileApi.deleteResume();
        await loadProfileData();
      } else if (type === 'history') {
        await analyticsApi.clearHistory();
      } else if (type === 'profile') {
        await profileApi.deleteProfile();
        await loadProfileData();
      }
      setDeleteConfirmType(null);
    } catch (err) {
      console.error(`Failed to delete ${type}`, err);
    }
  };

  const completeness = profile?.profile_completeness ?? 85;

  const roles = [
    'SOC Analyst',
    'Penetration Tester',
    'Cloud Security Analyst',
    'Incident Responder',
    'DevSecOps Engineer',
    'System Administrator',
    'Software Developer',
    'Data Analyst',
  ];

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Candidate Profile & Intelligence Engine
            </h1>
            <Badge variant="cyan" size="sm">
              Adaptive Persona
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure your technical background, target roles, resume artifacts, and competency matrices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Upload className="w-4 h-4 text-cyan-400" />}
            onClick={() => setIsResumeModalOpen(true)}
          >
            Upload Resume
          </Button>
          <Button
            variant="glow"
            size="md"
            leftIcon={<Target className="w-4 h-4 text-cyan-300" />}
            onClick={() => setIsJobMatchModalOpen(true)}
          >
            Match Job Description
          </Button>
        </div>
      </div>

      {/* Completeness & Overview Bar */}
      <Card className="p-6 bg-gradient-to-r from-[#0d1024] to-[#0a0d1d] border border-cyan-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{name}</h2>
                <Badge variant="violet" size="sm">
                  {experienceLevel.toUpperCase()} LEVEL
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Targeting <span className="text-cyan-400 font-semibold">{targetRole}</span> at{' '}
                <span className="text-indigo-400 font-semibold">{targetCompany || 'Top Tech'}</span>
              </p>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Profile Grounding</span>
              <span className="text-cyan-400 font-bold">{completeness}% Complete</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Form & Role Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Profile Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-[#0c1021]/90 border border-white/[0.08]">
            <h3 className="text-base font-bold font-display text-white mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Target Role & Experience Profile
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">CANDIDATE NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">TARGET ROLE</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">EXPERIENCE LEVEL</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option value="entry">Entry Level (0-2 yrs)</option>
                    <option value="mid">Mid Level (3-5 yrs)</option>
                    <option value="senior">Senior (5-8 yrs)</option>
                    <option value="lead">Lead / Principal (8+ yrs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">TARGET COMPANY</label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. CrowdStrike, Microsoft, Mandiant, Google..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  PREFERRED FOCUS TOPICS (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  value={preferredTopics}
                  onChange={(e) => setPreferredTopics(e.target.value)}
                  placeholder="Incident Response, SIEM, Kerberos, AWS IAM..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {saveSuccess && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Profile saved successfully
                  </span>
                )}
                <Button
                  type="submit"
                  variant="glow"
                  size="md"
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Parsed Resume Intelligence Section */}
          <Card className="p-6 bg-[#0c1021]/90 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold font-display text-white">Parsed Resume & Projects</h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsResumeModalOpen(true)}
              >
                Re-upload Resume
              </Button>
            </div>

            {profile?.resume_parsed_data?.skills && profile.resume_parsed_data.skills.length > 0 ? (
              <div className="space-y-4">
                {/* Extracted Skills */}
                <div>
                  <p className="text-xs font-mono text-slate-400 mb-2">EXTRACTED SKILLS & TOOLS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.resume_parsed_data.skills.map((skill: string) => (
                      <Badge key={skill} variant="cyan" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Parsed Projects */}
                {profile.resume_parsed_data.projects && profile.resume_parsed_data.projects.length > 0 && (
                  <div>
                    <p className="text-xs font-mono text-slate-400 mb-2">PROJECTS IDENTIFIED FOR QUESTIONS</p>
                    <div className="space-y-2">
                      {profile.resume_parsed_data.projects.map((proj: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{proj.title || proj.name}</h4>
                            <span className="text-[10px] font-mono text-indigo-400">
                              {proj.technologies?.join(', ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-white/[0.04] space-y-3">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  Upload your resume in PDF or TXT format to automatically extract technical projects and skills.
                </p>
                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => setIsResumeModalOpen(true)}
                >
                  Upload Resume PDF
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 col: Skill Gap Matrix & Privacy */}
        <div className="space-y-6">
          {/* Skill Competency Breakdown */}
          <Card className="p-5 bg-[#0c1021]/90 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                Target Skill Matrix
              </h3>
              <Badge variant="violet" size="sm">
                {targetRole}
              </Badge>
            </div>

            {/* Strong Skills */}
            <div>
              <p className="text-[11px] font-mono text-emerald-400 font-bold mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                STRONG SKILLS ({skillGaps?.strong_skills?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1">
                {skillGaps?.strong_skills && skillGaps.strong_skills.length > 0 ? (
                  skillGaps.strong_skills.map((s: any) => (
                    <Badge key={s.name || s.skill} variant="emerald" size="sm">
                      {s.name || s.skill} ({s.score || s.mastery_score}%)
                    </Badge>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500">None assessed yet</span>
                )}
              </div>
            </div>

            {/* Weak / Priority Practice */}
            <div>
              <p className="text-[11px] font-mono text-amber-400 font-bold mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                AREAS TO PRACTICE ({skillGaps?.weak_skills?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1">
                {skillGaps?.weak_skills && skillGaps.weak_skills.length > 0 ? (
                  skillGaps.weak_skills.map((s: any) => (
                    <Badge key={s.name || s.skill} variant="amber" size="sm">
                      {s.name || s.skill} ({s.score || s.mastery_score}%)
                    </Badge>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500">None detected</span>
                )}
              </div>
            </div>

            {/* Unassessed */}
            <div>
              <p className="text-[11px] font-mono text-slate-400 font-bold mb-1.5">
                NOT YET ASSESSED ({skillGaps?.unassessed_skills?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1">
                {skillGaps?.unassessed_skills && skillGaps.unassessed_skills.length > 0 ? (
                  skillGaps.unassessed_skills.map((s: any) => (
                    <Badge key={s.name || s.skill} variant="slate" size="sm">
                      {s.name || s.skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-500">All assessed</span>
                )}
              </div>
            </div>
          </Card>

          {/* Data Privacy Controls */}
          <Card className="p-5 bg-gradient-to-br from-rose-950/20 to-slate-900/80 border border-rose-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Data Privacy & Controls</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              MASTER AI stores resume embeddings and interview evaluations locally. You retain full control over your stored data.
            </p>

            <div className="space-y-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
                onClick={() => setDeleteConfirmType('resume')}
              >
                Delete Resume Artifacts
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
                onClick={() => setDeleteConfirmType('history')}
              >
                Clear Interview History
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e1224] border border-rose-500/30 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">
                Confirm {deleteConfirmType.toUpperCase()} Deletion
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete your {deleteConfirmType}? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirmType(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteData(deleteConfirmType)}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onSuccess={handleResumeSuccess}
      />

      {/* Job Match Modal */}
      <JobMatchModal
        isOpen={isJobMatchModalOpen}
        onClose={() => setIsJobMatchModalOpen(false)}
        targetRole={targetRole}
        targetCompany={targetCompany}
      />
    </div>
  );
};
