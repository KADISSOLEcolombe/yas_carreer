'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authenticateUser,
  registerCandidate,
  initUsersRegistry,
  type PublicUser,
  type UserRole,
} from '../lib/users';
import { initJobs } from '../lib/jobs';

export type { PublicUser as User, UserRole };

interface AuthContextType {
  user: PublicUser | null;
  loginCandidate: (email: string, password: string) => Promise<void>;
  loginRH: (email: string, password: string) => Promise<void>;
  loginSupervisor: (email: string, password: string) => Promise<void>;
  register: (nom: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRecruiter: boolean;
  isSupervisor: boolean;
  isCandidate: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'yas_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initUsersRegistry();
    initJobs();
    const storedUser = localStorage.getItem(SESSION_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const persistSession = (sessionUser: PublicUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const loginCandidate = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const sessionUser = authenticateUser(email, password, ['CANDIDATE']);
      persistSession(sessionUser);
    } finally {
      setIsLoading(false);
    }
  };

  const loginRH = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const sessionUser = authenticateUser(email, password, ['RECRUITER', 'ADMIN']);
      persistSession(sessionUser);
    } finally {
      setIsLoading(false);
    }
  };

  const loginSupervisor = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const sessionUser = authenticateUser(email, password, ['SUPERVISOR']);
      persistSession(sessionUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nom: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const sessionUser = registerCandidate(nom, email, password);
      persistSession(sessionUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginCandidate,
        loginRH,
        loginSupervisor,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
        isRecruiter: user?.role === 'RECRUITER' || user?.role === 'ADMIN',
        isSupervisor: user?.role === 'SUPERVISOR',
        isCandidate: user?.role === 'CANDIDATE',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
