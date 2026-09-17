'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Eye, EyeOff, Loader, User, Mail, Phone, Lock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const { login, register, requestOTP, verifyOTP, forgotPassword, resetPassword } = useAuth();
  const [tab, setTab]           = useState('login');   // 'login' | 'register' | 'otp' | 'forgot' | 'reset-pass'
  const [form, setForm]         = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    address: '', 
    city: '', 
    state: '', 
    zipCode: '', 
    otp: '' 
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setError('');
    setSuccessMsg('');
  };

  // Direct Standard E-commerce Sign In with Email & Password
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(form.email.trim(), form.password);
    if (res.success) {
      toast.success('Welcome back to Venthulir!');
      onClose();
    } else {
      setError(res.msg || 'Invalid email or password. Please check your credentials.');
    }
    setLoading(false);
  };

  // Direct Standard E-commerce Account Creation
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const reg = await register(
      form.name.trim(),
      form.email.trim(),
      form.phone.trim(),
      form.password,
      form.address.trim(),
      form.city.trim(),
      form.state.trim(),
      form.zipCode.trim()
    );

    if (reg.success) {
      toast.success(`Welcome to Venthulir, ${form.name}! Your account has been created.`);
      onClose();
    } else {
      setError(reg.msg || 'Account registration failed. Please try again.');
    }
    setLoading(false);
  };

  // Optional OTP Sign In Request
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setError('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    const res = await requestOTP(form.email, form.password || '');
    if (res.success) {
      setTab('otp');
      toast.info('Verification code dispatched to your email.');
    } else {
      setError(res.msg || 'Unable to send OTP. Please use password login.');
    }
    setLoading(false);
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await verifyOTP(form.email, form.otp);
    if (res.success) {
      toast.success('Signed in successfully!');
      onClose();
    } else {
      setError(res.msg || 'Invalid or expired OTP code.');
    }
    setLoading(false);
  };

  // Request Forgot Password Reset Code
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!form.email || !form.email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await forgotPassword(form.email.trim());
    if (res.success) {
      setTab('reset-pass');
      toast.info('6-digit reset code sent to your email.');
    } else {
      setError(res.msg || 'Could not find an account with that email.');
    }
    setLoading(false);
  };

  // Submit New Password with Reset Code
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!form.otp || form.otp.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await resetPassword(form.email.trim(), form.otp.trim(), newPassword);
    if (res.success) {
      toast.success('Password updated successfully! Welcome back.');
      onClose();
    } else {
      setError(res.msg || 'Invalid or expired code.');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="auth-modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="auth-modal-header">
          <div className="auth-brand-badge">
            <span className="brand-dot" />
            <span>VENTHULIR HARVEST ACCOUNT</span>
          </div>
        </div>

        {/* ── TAB: SIGN IN ── */}
        {tab === 'login' && (
          <>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-sub">Sign in to track live orders, access member pricing & manage addresses</p>

            <div className="auth-tabs">
              <button type="button" className="auth-tab active">Sign In</button>
              <button type="button" className="auth-tab" onClick={() => { setTab('register'); setError(''); }}>
                Create Account
              </button>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-field">
                <label>Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={15} className="field-icon" />
                  <input 
                    type="email" 
                    placeholder="you@email.com" 
                    value={form.email} 
                    onChange={e => update('email', e.target.value)} 
                    required 
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="field-label-row">
                  <label>Password</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="forgot-pass-btn" 
                      onClick={() => { setTab('forgot'); setError(''); setSuccessMsg(''); }}
                    >
                      Forgot Password?
                    </button>
                    <span style={{ color: '#d1d5db', fontSize: '11px' }}>•</span>
                    <button 
                      type="button" 
                      className="forgot-pass-btn" 
                      onClick={handleRequestOTP}
                    >
                      Login with OTP
                    </button>
                  </div>
                </div>
                <div className="auth-input-wrapper pass-wrap">
                  <Lock size={15} className="field-icon" />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={e => update('password', e.target.value)} 
                    required 
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    className="pass-toggle-btn"
                    onClick={() => setShowPass(v => !v)}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error-banner">{error}</div>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-prompt">
              <span>New to Venthulir?</span>
              <button type="button" onClick={() => { setTab('register'); setError(''); }}>
                Create your account
              </button>
            </div>
          </>
        )}

        {/* ── TAB: CREATE ACCOUNT / REGISTER ── */}
        {tab === 'register' && (
          <>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-sub">Join thousands of South Indian families enjoying pure farm-direct organic staples</p>

            <div className="auth-tabs">
              <button type="button" className="auth-tab" onClick={() => { setTab('login'); setError(''); }}>
                Sign In
              </button>
              <button type="button" className="auth-tab active">Create Account</button>
            </div>

            <form onSubmit={handleRegister} className="auth-form register-form-scroll">
              <div className="form-2col">
                <div className="auth-field">
                  <label>Full Name *</label>
                  <div className="auth-input-wrapper">
                    <User size={15} className="field-icon" />
                    <input 
                      type="text"
                      placeholder="e.g. Maya Raman" 
                      value={form.name} 
                      onChange={e => update('name', e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Mobile Number *</label>
                  <div className="auth-input-wrapper">
                    <Phone size={15} className="field-icon" />
                    <input 
                      type="tel"
                      placeholder="+91 98765 43210" 
                      value={form.phone} 
                      onChange={e => update('phone', e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label>Email Address *</label>
                <div className="auth-input-wrapper">
                  <Mail size={15} className="field-icon" />
                  <input 
                    type="email" 
                    placeholder="you@email.com" 
                    value={form.email} 
                    onChange={e => update('email', e.target.value)} 
                    required 
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Set Password (min 6 chars) *</label>
                <div className="auth-input-wrapper pass-wrap">
                  <Lock size={15} className="field-icon" />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    placeholder="Choose secure password" 
                    value={form.password} 
                    onChange={e => update('password', e.target.value)} 
                    required 
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    className="pass-toggle-btn"
                    onClick={() => setShowPass(v => !v)}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label>Default Delivery Address (Optional)</label>
                <div className="auth-input-wrapper">
                  <MapPin size={15} className="field-icon" />
                  <input 
                    placeholder="Flat / House No, Street name, Area" 
                    value={form.address} 
                    onChange={e => update('address', e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-3col">
                <div className="auth-field">
                  <label>City</label>
                  <input 
                    placeholder="Chennai" 
                    value={form.city} 
                    onChange={e => update('city', e.target.value)} 
                  />
                </div>
                <div className="auth-field">
                  <label>State</label>
                  <input 
                    placeholder="Tamil Nadu" 
                    value={form.state} 
                    onChange={e => update('state', e.target.value)} 
                  />
                </div>
                <div className="auth-field">
                  <label>PIN Code</label>
                  <input 
                    placeholder="600001" 
                    value={form.zipCode} 
                    onChange={e => update('zipCode', e.target.value)} 
                    maxLength={6}
                  />
                </div>
              </div>

              {error && <div className="auth-error-banner">{error}</div>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : (
                  <>
                    <span>Create Account & Start Shopping</span>
                    <CheckCircle size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-prompt">
              <span>Already have an account?</span>
              <button type="button" onClick={() => { setTab('login'); setError(''); }}>
                Sign in
              </button>
            </div>
          </>
        )}

        {/* ── TAB: OTP VERIFY ── */}
        {tab === 'otp' && (
          <>
            <h2 className="auth-title">Enter Verification Code</h2>
            <p className="auth-sub">We sent a 6-digit security OTP to <strong>{form.email}</strong></p>

            <form onSubmit={handleVerifyOTP} className="auth-form">
              <input 
                className="otp-input-box" 
                placeholder="• • • • • •" 
                value={form.otp} 
                onChange={e => update('otp', e.target.value)} 
                maxLength={6} 
                required 
                autoFocus
              />

              {error && <div className="auth-error-banner">{error}</div>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : 'Verify Code & Sign In'}
              </button>
            </form>

            <div className="auth-footer-prompt">
              <span>Wrong email?</span>
              <button type="button" onClick={() => { setTab('login'); setError(''); }}>
                Go back to Sign In
              </button>
            </div>
          </>
        )}

        {/* ── TAB: FORGOT PASSWORD REQUEST ── */}
        {tab === 'forgot' && (
          <>
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-sub">Enter your registered email address to receive a secure 6-digit verification code.</p>

            <form onSubmit={handleForgotRequest} className="auth-form">
              <div className="auth-field">
                <label>Registered Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={15} className="field-icon" />
                  <input 
                    type="email" 
                    placeholder="you@email.com" 
                    value={form.email} 
                    onChange={e => update('email', e.target.value)} 
                    required 
                    autoFocus
                  />
                </div>
              </div>

              {error && <div className="auth-error-banner">{error}</div>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-prompt">
              <span>Remembered password?</span>
              <button type="button" onClick={() => { setTab('login'); setError(''); }}>
                Back to Sign In
              </button>
            </div>
          </>
        )}

        {/* ── TAB: ENTER CODE & SET NEW PASSWORD ── */}
        {tab === 'reset-pass' && (
          <>
            <h2 className="auth-title">Create New Password</h2>
            <p className="auth-sub">Enter the 6-digit code sent to <strong>{form.email}</strong> and set your new password.</p>

            <form onSubmit={handleResetPasswordSubmit} className="auth-form">
              <div className="auth-field">
                <label>6-Digit Verification Code</label>
                <input 
                  className="otp-input-box" 
                  placeholder="• • • • • •" 
                  value={form.otp} 
                  onChange={e => update('otp', e.target.value.replace(/\D/g, ''))} 
                  maxLength={6} 
                  required 
                  autoFocus
                />
              </div>

              <div className="auth-field">
                <label>New Password (min 6 characters)</label>
                <div className="auth-input-wrapper pass-wrap">
                  <Lock size={15} className="field-icon" />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    placeholder="Enter new password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="pass-toggle-btn"
                    onClick={() => setShowPass(v => !v)}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label>Confirm New Password</label>
                <div className="auth-input-wrapper pass-wrap">
                  <Lock size={15} className="field-icon" />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    placeholder="Confirm new password" 
                    value={confirmNewPassword} 
                    onChange={e => setConfirmNewPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {error && <div className="auth-error-banner">{error}</div>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : (
                  <>
                    <span>Set New Password & Sign In</span>
                    <CheckCircle size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-prompt">
              <button type="button" onClick={() => { setTab('forgot'); setError(''); }}>
                ← Change Email / Resend Code
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
