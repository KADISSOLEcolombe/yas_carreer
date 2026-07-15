'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, type User, type UserRole, ApiError } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (nom: string, email: string, password: string, prenom?: string, telephone?: string, quartier?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  droits: string[];
  hasPermission: (permission: string) => boolean;
  isRecruiter: boolean;
  isSupervisor: boolean;
  isCandidate: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'yas_user';
const TOKEN_KEY = 'yas_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [droits, setDroits] = useState<string[]>([]);

  useEffect(() => {
    // Restaurer la session au chargement
    const storedUser = localStorage.getItem(SESSION_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setDroits(parsedUser.droits || []);
      } catch (error) {
        console.error('Erreur lors de la restauration de la session:', error);
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const persistSession = (sessionUser: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    setDroits(sessionUser.droits || []);
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setDroits([]);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      persistSession(response.user);
      
      // Redirection selon le rôle
      switch (response.user.role) {
        case 'Candidat':
          router.push('/candidat');
          break;
        case 'RH':
          router.push('/rh');
          break;
        case 'Superviseur':
          router.push('/superviseur');
          break;
        case 'ADMIN':
          router.push('/admin');
          break;
        default:
          router.push('/');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nom: string, email: string, password: string, prenom?: string, telephone?: string, quartier?: string) => {
    setIsLoading(true);
    try {
      const response = await api.register(nom, email, password, prenom, telephone, quartier);
      persistSession(response.user);
      router.push('/candidat');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    router.push('/login');
  };

  const hasPermission = (permission: string): boolean => {
    return droits.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
        droits,
        hasPermission,
        isRecruiter: user?.role === 'RH' || user?.role === 'ADMIN',
        isSupervisor: user?.role === 'Superviseur',
        isCandidate: user?.role === 'Candidat',
        isAdmin: user?.role === 'ADMIN',
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
