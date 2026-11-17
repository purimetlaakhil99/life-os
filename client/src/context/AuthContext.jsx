import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      setLoading(true);
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    setError(null);
    const data = await api.login({ email, password });
    setUser(data.user);
    return data;
  }

  async function demoLogin() {
    setError(null);
    const data = await api.demoLogin();
    setUser(data.user);
    return data;
  }

  async function register(userData) {
    setError(null);
    const data = await api.register(userData);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await api.logout();
    setUser(null);
  }

  async function updateSettings(settings) {
    const data = await api.updateSettings(settings);
    setUser(prev => ({
      ...prev,
      settings: data.settings,
      preferredLanguage: data.preferredLanguage,
    }));
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, demoLogin, register, logout, updateSettings, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
