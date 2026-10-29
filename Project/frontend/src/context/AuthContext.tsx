import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { fetchCurrentUser, loginUser, registerUser, logoutUser } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (initialTab?: 'login' | 'signup', redirectTarget?: string) => void;
  closeAuthModal: () => void;
  authModalTab: 'login' | 'signup';
  setAuthModalTab: (tab: 'login' | 'signup') => void;
  redirectTarget: string | null;
  setRedirectTarget: (target: string | null) => void;
  clearRedirectTarget: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const current = await fetchCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await loginUser(email, password);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res.user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const res = await registerUser(name, email, password);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res.user;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setIsProfileModalOpen(false);
    setRedirectTarget(null);
  };

  const openAuthModal = (initialTab: 'login' | 'signup' = 'login', target?: string) => {
    setAuthModalTab(initialTab);
    if (target) {
      setRedirectTarget(target);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const clearRedirectTarget = () => {
    setRedirectTarget(null);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalTab,
        setAuthModalTab,
        redirectTarget,
        setRedirectTarget,
        clearRedirectTarget,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
