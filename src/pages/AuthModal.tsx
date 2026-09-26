import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Sparkles, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('Chaitanya');
  const [email, setEmail] = useState('chaitanya@masterai.dev');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, name);
    setLoading(false);
    onClose();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await login('chaitanya.ai@google.com', 'Chaitanya');
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center space-y-5">
        <Logo size="lg" showTagline />

        <div>
          <h3 className="text-xl font-bold font-display text-white">
            {isSignUp ? 'Create your MASTER AI Account' : 'Welcome back to MASTER AI'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp
              ? 'Start sharpening your reasoning and high-pressure interview skills'
              : 'Sign in to access your adversarial sessions and rubric history'}
          </p>
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-semibold text-white transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 w-full my-1">
          <div className="h-[1px] bg-white/10 flex-1" />
          <span className="text-[10px] font-mono text-slate-400 uppercase">OR WITH EMAIL</span>
          <div className="h-[1px] bg-white/10 flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3 text-left">
          {isSignUp && (
            <div>
              <label className="text-[11px] font-mono text-slate-300 mb-1 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Chaitanya"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-slate-300 mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="chaitanya@masterai.dev"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-300 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="glow"
            size="md"
            isLoading={loading}
            className="w-full mt-2"
          >
            {isSignUp ? 'Create Account' : 'Continue to Dashboard'}
          </Button>
        </form>

        <p className="text-xs text-slate-400 pt-2">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-400 hover:underline font-semibold ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </Modal>
  );
};
