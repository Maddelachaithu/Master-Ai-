import React from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  Video,
  Swords,
  History,
  BarChart3,
  TrendingUp,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  LogOut,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export type NavRoute =
  | 'overview'
  | 'profile'
  | 'practice'
  | 'interview'
  | 'debate'
  | 'history'
  | 'analytics'
  | 'improvement'
  | 'question-bank'
  | 'settings'
  | 'report';

interface SidebarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: NavRoute; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'profile', label: 'Candidate Profile', icon: <ShieldCheck className="w-5 h-5" />, badge: 'RAG' },
    { id: 'practice', label: 'Practice', icon: <PlayCircle className="w-5 h-5" />, badge: 'Setup' },
    { id: 'interview', label: 'Live Interview', icon: <Video className="w-5 h-5" />, badge: 'AI Live' },
    { id: 'debate', label: 'Debate Arena', icon: <Swords className="w-5 h-5" /> },
    { id: 'history', label: 'Session History', icon: <History className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'improvement', label: 'Improvement Plan', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'question-bank', label: 'Question Bank', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNav = (route: NavRoute) => {
    onRouteChange(route);
    if (isMobileOpen) onMobileClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0b0e1a]/95 backdrop-blur-2xl border-r border-white/[0.08] transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Top Branding */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.06] h-18">
          {!isCollapsed ? (
            <div onClick={() => handleNav('overview')} className="cursor-pointer">
              <Logo size="sm" showTagline />
            </div>
          ) : (
            <div
              onClick={() => handleNav('overview')}
              className="mx-auto cursor-pointer p-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30"
            >
              <Logo size="sm" />
            </div>
          )}

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/[0.06] transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
          <div className={cn('px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold', isCollapsed && 'text-center')}>
            {!isCollapsed ? 'Core Modules' : '•••'}
          </div>

          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative select-none',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-[0_0_18px_rgba(99,102,241,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                )}
              >
                {/* Active Neon Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r shadow-[0_0_8px_#00f2fe]" />
                )}

                <span
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                >
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-mono px-1.5 py-0.5 rounded font-bold',
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Live System Status Widget */}
        {!isCollapsed && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI Engine
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Adaptive Adversary v2.4 ready with fact checking & vision telemetry.
            </p>
          </div>
        )}

        {/* User Profile & Account Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-[#090b14]/70">
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/[0.04]',
              isCollapsed && 'justify-center'
            )}
          >
            <div className="relative shrink-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-indigo-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090b14]" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Chaitanya'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'chaitanya@masterai.dev'}</p>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={logout}
                title="Log Out"
                className="text-slate-400 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
