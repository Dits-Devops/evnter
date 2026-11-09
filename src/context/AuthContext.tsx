'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('evnter_user');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('evnter_user');
        if (cached) return false;
      } catch {}
    }
    return true;
  });

  useEffect(() => {
    refreshUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshUser() {
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('evnter_token') : null;
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch(`/api/users`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('evnter_user', JSON.stringify(data.user));
        }
      } else {
        // If 401, check if we have cached user in localStorage before throwing it away
        if (res.status === 401) {
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('evnter_user');
            if (cached) {
              try {
                setUser(JSON.parse(cached));
                return;
              } catch {}
            }
            setUser(null);
            localStorage.removeItem('evnter_user');
            localStorage.removeItem('evnter_token');
          }
        }
      }
    } catch (err) {
      console.error('[AuthContext] Refresh User Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Login gagal' };
    setUser(data.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('evnter_user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('evnter_token', data.token);
      }
    }
    return {};
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('evnter_user');
      localStorage.removeItem('evnter_token');
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
