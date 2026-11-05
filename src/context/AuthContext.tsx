'use strict';
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  surname?: string;
  email: string;
  phone?: string;
  custNo?: string;
  role: 'customer' | 'admin';
}

export interface SignupPayload {
  firstName: string;
  surname: string;
  email: string;
  password?: string;
  phone?: string;
  dob?: string;
  address?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  custType?: 'R' | 'B';
  company?: string;
  abn?: string;
  code: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: {
    email?: string;
    custNo?: string;
    identifier?: string;
    password?: string;
    pin?: string;
    code?: string;
    portal?: 'customer' | 'admin';
  }) => Promise<{ success: boolean; message: string; user?: User }>;
  signup: (data: SignupPayload) => Promise<{ success: boolean; message: string; user?: User }>;
  sendVerification: (email: string, type?: 'signup' | 'login') => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('jm_auth_token');
      const storedUser = localStorage.getItem('jm_auth_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse stored auth:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendVerification = async (email: string, type: 'signup' | 'login' = 'signup') => {
    try {
      const res = await fetch(`${API_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send verification code.');
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error connecting to server.' };
    }
  };

  const signup = async (data: SignupPayload) => {
    try {
      const payload = {
        ...data,
        name: data.name || `${data.firstName} ${data.surname}`.trim(),
      };
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to complete sign up.');
      }

      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('jm_auth_token', result.token);
      localStorage.setItem('jm_auth_user', JSON.stringify(result.user));

      return { success: true, message: result.message, user: result.user };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error signing up.' };
    }
  };

  const login = async (data: {
    email?: string;
    custNo?: string;
    identifier?: string;
    password?: string;
    code?: string;
    portal?: 'customer' | 'admin';
  }) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to log in.');
      }

      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('jm_auth_token', result.token);
      localStorage.setItem('jm_auth_user', JSON.stringify(result.user));

      return { success: true, message: result.message, user: result.user };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error logging in.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jm_auth_token');
    localStorage.removeItem('jm_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        sendVerification,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
