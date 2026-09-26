import React, { useState } from 'react';
import { Sidebar, NavRoute } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  onOpenAuthModal: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentRoute,
  onRouteChange,
  onOpenAuthModal,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-cyan-300">
      {/* Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={onRouteChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Top Navbar */}
        <Navbar
          currentRoute={currentRoute}
          onRouteChange={onRouteChange}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAuthModal={onOpenAuthModal}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
