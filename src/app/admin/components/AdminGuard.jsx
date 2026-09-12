'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminGuard({ children }) {
  const { user, isAuthenticated, loading, login } = useAuth();
  const router = useRouter();

  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminDirectLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      let cleanInput = adminIdentifier.trim();
      if (cleanInput.toLowerCase() === 'admin') cleanInput = 'admin@venthulir.com';

      const res = await login(cleanInput, adminPassword);
      if (res.success && res.user?.isAdmin) {
        toast.success(`Welcome to Executive Portal, ${res.user.name || 'Admin'}!`);
      } else if (res.success && !res.user?.isAdmin) {
        setErrorMsg('Access denied: This account does not possess administrator privileges.');
      } else {
        setErrorMsg(res.msg || 'Invalid administrative credentials.');
      }
    } catch {
      setErrorMsg('Network error connecting to verification engine.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#071f15',
        color: '#ffffff',
        gap: '16px'
      }}>
        <Loader2 className="spin" size={40} color="#d4af37" />
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#d4af37', letterSpacing: '1px' }}>
          VENTHULIR EXECUTIVE CONSOLE
        </p>
      </div>
    );
  }

  // If already authenticated as Admin, show the full admin dashboard
  if (isAuthenticated && user?.isAdmin) {
    return <>{children}</>;
  }

  // Direct In-Page Executive Admin Sign-In Gate
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #071f15 0%, #0f3d2a 50%, #154734 100%)',
      padding: '24px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '40px 36px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        border: '1.5px solid #d4af37'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#0f3d2a',
            color: '#d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: '22px',
            fontWeight: '800',
            color: '#0f3d2a',
            margin: '0 0 6px',
            letterSpacing: '1px'
          }}>
            VENTHULIR ADMIN
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Executive Operations & Storefront Management
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminDirectLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Admin Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="text"
                placeholder="admin or admin@venthulir.com"
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '8px',
              padding: '13px',
              background: 'linear-gradient(135deg, #0f3d2a 0%, #154734 100%)',
              color: '#d4af37',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(15, 61, 42, 0.25)'
            }}
          >
            {submitting ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <>
                <span>Unlock Executive Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          <a href="/home" style={{ color: '#0f3d2a', textDecoration: 'none', fontWeight: 600 }}>
            ← Return to Organic Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
