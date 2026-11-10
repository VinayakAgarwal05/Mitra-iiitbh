import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  roll_number?: string;
  academic_year: string;
  department: string;
  role: 'super_admin' | 'admin' | 'representative' | 'student';
  is_verified: boolean;
}

export interface UsageLimit {
  used: number;
  limit: number;
  remaining: number;
}

export interface DailyUsage {
  date: string;
  careerRoom: UsageLimit;
  studentConnect: UsageLimit;
  studentIssue: UsageLimit;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  dailyUsage: DailyUsage | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('college_connect_token');
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('college_connect_user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached user:', e);
      try {
        localStorage.removeItem('college_connect_user');
      } catch {}
      return null;
    }
  });
  const [dailyUsage, setDailyUsage] = useState<DailyUsage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setDailyUsage(res.data.dailyUsage);
      localStorage.setItem('college_connect_user', JSON.stringify(res.data.user));
    } catch (err: any) {
      // ONLY clear credentials if the server explicitly rejected the token with 401
      if (err?.response?.status === 401) {
        setToken(null);
        setUser(null);
        setDailyUsage(null);
        localStorage.removeItem('college_connect_token');
        localStorage.removeItem('college_connect_user');
      } else {
        // Network timeout, server waking up, or non-auth error: preserve the local session
        console.warn('Could not refresh profile from server, preserving cached session:', err?.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('college_connect_token', newToken);
    localStorage.setItem('college_connect_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem('college_connect_token');
    localStorage.removeItem('college_connect_user');
    setToken(null);
    setUser(null);
    setDailyUsage(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchProfile();
    }
  };

  const isAdmin = !!(user && ['super_admin', 'admin', 'representative'].includes(user.role));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user?.is_verified,
        isAdmin,
        isLoading,
        dailyUsage,
        login,
        logout,
        refreshUser,
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
