import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  id: 'user-001',
  name: 'Chaitanya',
  email: 'chaitanya@masterai.dev',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  streakDays: 7,
  totalSessions: 24,
  avgScore: 82,
  technicalScore: 79,
  communicationScore: 86,
  targetRoles: ['Senior Security Engineer', 'Staff Systems Architect', 'Tech Lead'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(defaultUser);

  const login = async (email: string, name?: string) => {
    setUser({
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0] || 'Candidate',
      email,
      streakDays: 7,
      totalSessions: 24,
      avgScore: 82,
      technicalScore: 79,
      communicationScore: 86,
      targetRoles: ['Senior Security Engineer', 'Systems Architect'],
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
