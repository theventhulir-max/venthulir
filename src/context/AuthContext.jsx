'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = '/api';

  useEffect(() => {
    const verify = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const u = await res.json();
          const freshUser = {
            id: u._id || u.id,
            _id: u._id || u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            isAdmin: Boolean(u.isAdmin),
            isEmailVerified: u.isEmailVerified ?? true,
            deliveryAddress: u.deliveryAddress || { address: '', city: '', state: 'Tamil Nadu', zipCode: '' },
            createdAt: u.createdAt
          };
          setUser(freshUser);
          setIsAuthenticated(true);
          localStorage.setItem('venthulir_user', JSON.stringify(freshUser));
        } else {
          localStorage.removeItem('venthulir_token');
          localStorage.removeItem('venthulir_user');
        }
      } catch {
        const saved = localStorage.getItem('venthulir_user');
        if (saved) {
          setUser(JSON.parse(saved));
          setIsAuthenticated(true);
        }
      }
      setLoading(false);
    };
    verify();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('venthulir_token', data.token);
        localStorage.setItem('venthulir_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, msg: data.msg || 'Login failed' };
    } catch {
      return { success: false, msg: 'Server connection failed' };
    }
  };

  const register = async (name, email, phone, password, address, city, state, zipCode, otp) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, address, city, state, zipCode, otp })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('venthulir_token', data.token);
        localStorage.setItem('venthulir_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, msg: data.msg || 'Registration failed' };
    } catch {
      return { success: false, msg: 'Server connection failed' };
    }
  };

  const requestOTP = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return res.ok ? { success: true, msg: data.msg } : { success: false, msg: data.msg || 'Failed' };
    } catch {
      return { success: false, msg: 'Server connection failed' };
    }
  };

  const requestRegisterOTP = async (email) => {
    try {
      const res = await fetch(`${API_URL}/auth/send-register-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return res.ok ? { success: true, msg: data.msg } : { success: false, msg: data.msg || 'Failed' };
    } catch {
      return { success: false, msg: 'Server connection failed' };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('venthulir_token', data.token);
        localStorage.setItem('venthulir_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, msg: data.msg || 'Invalid OTP' };
    } catch {
      return { success: false, msg: 'Server connection failed' };
    }
  };

  const verifyRegisterOTP = async (email, otp) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-register-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      return res.ok ? { success: true } : { success: false, msg: data.msg };
    } catch {
      return { success: false, msg: 'Server connection failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return res.ok ? { success: true, msg: data.msg } : { success: false, msg: data.msg };
    } catch {
      return { success: false, msg: 'Server connection failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('venthulir_token');
    localStorage.removeItem('venthulir_user');
  };

  const updateUser = (data) => {
    setUser((prev) => {
      const merged = { ...prev, ...data };
      if (data.deliveryAddress && prev?.deliveryAddress) {
        merged.deliveryAddress = { ...prev.deliveryAddress, ...data.deliveryAddress };
      }
      try {
        localStorage.setItem('venthulir_user', JSON.stringify(merged));
      } catch (err) {
        console.warn('Failed to save user object to localStorage:', err);
      }
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, requestOTP, requestRegisterOTP, verifyOTP, verifyRegisterOTP, forgotPassword, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
