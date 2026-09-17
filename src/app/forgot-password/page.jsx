'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  RotateCw,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import '../login/AuthPages.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, resetPassword } = useAuth();

  // Steps: 'request' (Step 1) | 'reset' (Step 2) | 'success' (Step 3)
  const [step, setStep] = useState('request');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown for resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        setSuccessMsg(res.msg || `A 6-digit verification code has been sent to ${email}`);
        setStep('reset');
        setResendTimer(60);
      } else {
        setError(res.msg || 'Could not find an account with that email.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        setSuccessMsg('A fresh verification code has been dispatched to your email.');
        setResendTimer(60);
      } else {
        setError(res.msg || 'Failed to resend code.');
      }
    } catch {
      setError('Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP & Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(email.trim(), otp.trim(), newPassword);
      if (res.success) {
        setStep('success');
        setTimeout(() => {
          router.push('/profile');
        }, 2200);
      } else {
        setError(res.msg || 'Invalid or expired verification code.');
      }
    } catch {
      setError('Server error while updating password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-auth-viewport">
      <div className="luxury-auth-card">
        
        <div className="luxury-panel-top">
          <Link href="/login" className="back-to-store-link">
            <ArrowLeft size={14} /> <span>Back to Sign In</span>
          </Link>
          <div className="ssl-secure-badge">
            <Lock size={12} /> <span>256-Bit SSL Secure</span>
          </div>
        </div>

        {/* Brand Logo & Name */}
        <div className="luxury-brand-header">
          <img src="/logo.png" alt="Venthulir Logo" className="luxury-brand-logo" />
          <span className="brand-title">VENTHULIR</span>
          <span className="brand-subtitle">100% PURE ORGANIC HARVEST</span>
        </div>

            {/* ── STEP 1: REQUEST CODE ── */}
            {step === 'request' && (
              <>
                <h1 className="luxury-page-heading">Reset Password</h1>
                <p className="luxury-page-subheading">
                  Enter your registered email address to receive a secure 6-digit verification code.
                </p>

                {error && (
                  <div className="luxury-alert error">
                    <AlertCircle size={16} /> <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSendOTP} className="luxury-form">
                  <div className="luxury-field-group">
                    <label htmlFor="reset-email">Registered Email Address</label>
                    <div className="luxury-input-wrapper">
                      <Mail size={16} className="luxury-input-icon" />
                      <input
                        id="reset-email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="luxury-btn-primary" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={16} className="spin-icon" /> : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ── STEP 2: ENTER OTP & NEW PASSWORD ── */}
            {step === 'reset' && (
              <>
                <h1 className="luxury-page-heading">Create New Password</h1>
                <p className="luxury-page-subheading">
                  Enter the 6-digit code sent to <strong>{email}</strong> and set your new password.
                </p>

                {successMsg && (
                  <div className="luxury-alert success">
                    <CheckCircle2 size={16} /> <span>{successMsg}</span>
                  </div>
                )}

                {error && (
                  <div className="luxury-alert error">
                    <AlertCircle size={16} /> <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleResetSubmit} className="luxury-form">
                  <div className="luxury-field-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label htmlFor="reset-otp">6-Digit Verification Code</label>
                      <button 
                        type="button" 
                        onClick={() => { setStep('request'); setError(''); setSuccessMsg(''); }}
                        style={{ background: 'none', border: 'none', color: '#0c2f34', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Change Email
                      </button>
                    </div>
                    <div className="luxury-input-wrapper">
                      <input
                        id="reset-otp"
                        type="text"
                        maxLength={6}
                        required
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="luxury-otp-box"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="luxury-field-group">
                    <label htmlFor="new-password">New Password (min 6 characters)</label>
                    <div className="luxury-input-wrapper">
                      <Lock size={16} className="luxury-input-icon" />
                      <input
                        id="new-password"
                        type={showPass ? 'text' : 'password'}
                        required
                        placeholder="Enter new secure password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="luxury-pass-toggle" 
                        onClick={() => setShowPass(v => !v)}
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="luxury-field-group">
                    <label htmlFor="confirm-new-password">Confirm New Password</label>
                    <div className="luxury-input-wrapper">
                      <Lock size={16} className="luxury-input-icon" />
                      <input
                        id="confirm-new-password"
                        type={showPass ? 'text' : 'password'}
                        required
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="luxury-btn-primary" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={16} className="spin-icon" /> : (
                      <>
                        <span>Set New Password & Sign In</span>
                        <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendTimer > 0 || loading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendTimer > 0 ? '#888' : '#0c2f34',
                        cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <RotateCw size={13} className={loading ? 'spin-icon' : ''} />
                      <span>{resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Verification Code'}</span>
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── STEP 3: SUCCESS ── */}
            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  border: '2px solid #a7f3d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                  marginBottom: '16px'
                }}>
                  <CheckCircle2 size={36} />
                </div>

                <h2 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '24px', fontWeight: 700, color: '#0c2f34', marginBottom: '8px' }}>
                  Password Reset Complete!
                </h2>
                <p style={{ fontSize: '14px', color: '#556960', lineHeight: 1.55, marginBottom: '24px' }}>
                  Your password has been successfully updated. You are now securely signed in. Redirecting to your account...
                </p>

                <button
                  type="button"
                  className="luxury-btn-primary"
                  onClick={() => router.push('/profile')}
                >
                  <span>Go to Account Dashboard</span> <ArrowRight size={16} />
                </button>
              </div>
            )}

      </div>

      {/* Trust Badges Below Card */}
      <div className="luxury-trust-footer">
        <span className="trust-item">🌾 100% Farm-Direct</span>
        <span className="trust-item">•</span>
        <span className="trust-item">🪵 Traditional Wood-Pressed</span>
        <span className="trust-item">•</span>
        <span className="trust-item">🔒 100% Secure Checkout</span>
      </div>
    </div>
  );
}
