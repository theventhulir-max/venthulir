'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2, 
  AlertCircle,
  Loader2,
  KeyRound,
  RotateCw,
  Sparkles
} from 'lucide-react';
import '../app/login/AuthPages.css';

export default function AuthCard({ initialMode = 'login' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';

  // Modes: 'login' | 'login-otp' | 'register' | 'register-otp'
  const [mode, setMode] = useState(initialMode);
  const { login, requestOTP, verifyOTP, register, requestRegisterOTP, verifyRegisterOTP } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    zipCode: ''
  });
  const [regOtp, setRegOtp] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP resend timers
  const [resendTimer, setResendTimer] = useState(0);

  // Shared state
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for OTP resend
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

  const handleTabSwitch = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setLoginOtp('');
    setRegOtp('');
    if (typeof window !== 'undefined') {
      const targetPath = newMode === 'register' ? '/register' : '/login';
      const newPath = `${targetPath}${redirect !== '/profile' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
      window.history.replaceState(null, '', newPath);
    }
  };

  // Direct Password Login (Instant 1-step sign-in)
  const handleDirectPasswordLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await login(loginEmail.trim(), loginPassword);
      if (res.success) {
        setSuccessMsg('Signed in successfully! Redirecting...');
        const isAdmin = res.user?.isAdmin || res.user?.role === 'admin' || loginEmail.trim().toLowerCase() === 'admin' || loginEmail.trim().toLowerCase() === 'admin@venthulir.com';
        setTimeout(() => {
          if (isAdmin) {
            router.push('/admin');
          } else {
            router.push(redirect === '/admin' ? '/admin' : redirect);
          }
        }, 500);
      } else {
        setError(res.msg || 'Invalid credentials. Please check your username/password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Login OTP
  const handleSendLoginOTP = async (e) => {
    e.preventDefault();
    if (!loginEmail) {
      setError('Please enter your email to receive a login code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await requestOTP(loginEmail.toLowerCase().trim(), loginPassword || '');
      if (res.success) {
        setSuccessMsg(`A 6-digit login verification code has been sent to ${loginEmail}`);
        setMode('login-otp');
        setResendTimer(60);
      } else {
        setError(res.msg || 'Invalid email or password. Please check your credentials.');
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Login OTP & Enter
  const handleVerifyLoginOTP = async (e) => {
    e.preventDefault();
    if (!loginOtp || loginOtp.trim().length < 4) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await verifyOTP(loginEmail.toLowerCase().trim(), loginOtp.trim());
      if (res.success) {
        setSuccessMsg('Signed in successfully! Redirecting...');
        const isAdmin = res.user?.isAdmin || res.user?.role === 'admin' || loginEmail.trim().toLowerCase() === 'admin' || loginEmail.trim().toLowerCase() === 'admin@venthulir.com';
        setTimeout(() => {
          if (isAdmin) {
            router.push('/admin');
          } else {
            router.push(redirect);
          }
        }, 500);
      } else {
        setError(res.msg || 'Invalid or expired verification code. Please try again.');
      }
    } catch {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Login OTP
  const handleResendLoginOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await requestOTP(loginEmail.toLowerCase().trim(), loginPassword || '');
      if (res.success) {
        setSuccessMsg('A new verification code has been sent to your email.');
        setResendTimer(60);
      } else {
        setError(res.msg || 'Failed to resend code.');
      }
    } catch {
      setError('Error resending verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Registration OTP
  const handleSendRegisterOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regData.name.trim() || !regData.email.trim() || !regData.phone.trim() || !regData.password) {
      setError('Please fill in all mandatory fields (Name, Email, Phone, Password).');
      return;
    }

    if (regData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to terms & conditions to proceed.');
      return;
    }

    setLoading(true);

    try {
      const res = await requestRegisterOTP(regData.email.toLowerCase().trim());
      if (res.success) {
        setSuccessMsg(`A 6-digit verification code has been sent to ${regData.email}`);
        setMode('register-otp');
        setResendTimer(60);
      } else {
        setError(res.msg || 'Could not send verification code. Email might already be registered.');
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Registration OTP & Save in MongoDB
  const handleVerifyRegisterOTP = async (e) => {
    e.preventDefault();
    if (!regOtp || regOtp.trim().length < 4) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const verifyRes = await verifyRegisterOTP(regData.email.toLowerCase().trim(), regOtp.trim());
      if (!verifyRes.success) {
        setError(verifyRes.msg || 'Invalid or expired verification code. Please try again.');
        setLoading(false);
        return;
      }

      // Complete customer registration in MongoDB
      const regRes = await register(
        regData.name.trim(),
        regData.email.toLowerCase().trim(),
        regData.phone.trim(),
        regData.password,
        regData.address.trim(),
        regData.city.trim(),
        regData.state.trim() || 'Tamil Nadu',
        regData.zipCode.trim(),
        regOtp.trim()
      );

      if (regRes.success) {
        setSuccessMsg('🎉 Account created successfully! Welcome to Venthulir.');
        setTimeout(() => {
          router.push(redirect);
        }, 850);
      } else {
        setError(regRes.msg || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Something went wrong during account creation.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Registration OTP
  const handleResendRegisterOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await requestRegisterOTP(regData.email.toLowerCase().trim());
      if (res.success) {
        setSuccessMsg('A new verification code has been sent to your email.');
        setResendTimer(60);
      } else {
        setError(res.msg || 'Failed to resend code.');
      }
    } catch {
      setError('Error resending verification code.');
    } finally {
      setLoading(false);
    }
  };

  const isOtpStep = mode === 'login-otp' || mode === 'register-otp';

  return (
    <div className="luxury-auth-viewport">
      <div className="luxury-auth-card">
        
        <div className="luxury-panel-top">
          <Link href="/home" className="back-to-store-link">
            <ArrowLeft size={14} /> <span>Return to Store</span>
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

        <h1 className="luxury-page-heading">
              {mode === 'login' 
                ? 'Welcome Back' 
                : mode === 'login-otp' 
                ? 'Security Verification' 
                : mode === 'register-otp'
                ? 'Verify Your Email'
                : 'Create Account'}
            </h1>
            <p className="luxury-page-subheading">
              {mode === 'login' 
                ? 'Sign in to access member pricing, live orders & addresses.' 
                : mode === 'login-otp'
                ? `Enter the 6-digit code sent to ${loginEmail}`
                : mode === 'register-otp'
                ? `Enter the 6-digit code sent to ${regData.email}`
                : 'Join South Indian families enjoying pure farm-direct organic harvest.'}
            </p>

            {/* Switch Tabs */}
            {!isOtpStep && (
              <div className="luxury-tab-toggle">
                <button 
                  type="button" 
                  className={`luxury-tab-btn ${mode === 'login' ? 'active' : ''}`} 
                  onClick={() => handleTabSwitch('login')}
                >
                  Sign In
                </button>
                <button 
                  type="button" 
                  className={`luxury-tab-btn ${mode === 'register' ? 'active' : ''}`} 
                  onClick={() => handleTabSwitch('register')}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Alerts */}
            {error && <div className="luxury-alert error"><AlertCircle size={16} /> <span>{error}</span></div>}
            {successMsg && <div className="luxury-alert success"><CheckCircle2 size={16} /> <span>{successMsg}</span></div>}

            {/* ── 1. SIGN IN FORM ── */}
            {mode === 'login' && (
              <form onSubmit={handleDirectPasswordLogin} className="luxury-form">
                <div className="luxury-field-group">
                  <label htmlFor="login-email">Email or Username</label>
                  <div className="luxury-input-wrapper">
                    <Mail size={16} className="luxury-input-icon" />
                    <input 
                      id="login-email"
                      type="text" 
                      placeholder="you@email.com or username" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required 
                      autoFocus
                    />
                  </div>
                </div>

                <div className="luxury-field-group">
                  <label htmlFor="login-password">
                    <span>Password</span>
                    <Link href="/forgot-password" className="forgot-link">Forgot Password?</Link>
                  </label>
                  <div className="luxury-input-wrapper">
                    <Lock size={16} className="luxury-input-icon" />
                    <input 
                      id="login-password"
                      type={showPass ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                    />
                    <button type="button" className="luxury-pass-toggle" onClick={() => setShowPass(v => !v)}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <label className="luxury-checkbox-row">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span>Keep me signed in on this device</span>
                </label>

                <button type="submit" className="luxury-btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={16} className="spin-icon" /> : (
                    <>
                      <span>Sign In with Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button type="button" className="luxury-btn-secondary" onClick={handleSendLoginOTP} disabled={loading}>
                  <KeyRound size={15} /> <span>Sign In with Email OTP</span>
                </button>
              </form>
            )}

            {/* ── 2. LOGIN OTP VERIFICATION ── */}
            {mode === 'login-otp' && (
              <form onSubmit={handleVerifyLoginOTP} className="luxury-form">
                <div className="luxury-field-group">
                  <label style={{ justifyContent: 'center' }}>Enter 6-Digit Code</label>
                  <div className="luxury-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="••••••" 
                      maxLength={6}
                      value={loginOtp} 
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                      className="luxury-otp-box"
                      autoFocus
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="luxury-btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={16} className="spin-icon" /> : (
                    <>
                      <span>Verify Code & Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setMode('login')}
                    style={{ background: 'none', border: 'none', color: '#0c2f34', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0 }}
                  >
                    ← Edit Details
                  </button>
                  <button 
                    type="button"
                    onClick={handleResendLoginOTP}
                    disabled={resendTimer > 0 || loading}
                    style={{ background: 'none', border: 'none', color: resendTimer > 0 ? '#888' : '#0c2f34', fontWeight: 700, fontSize: '13px', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', padding: 0 }}
                  >
                    {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            {/* ── 3. REGISTER FORM ── */}
            {mode === 'register' && (
              <form onSubmit={handleSendRegisterOTP} className="luxury-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="luxury-field-group">
                    <label>Full Name *</label>
                    <div className="luxury-input-wrapper">
                      <User size={15} className="luxury-input-icon" />
                      <input type="text" placeholder="e.g. Maya Raman" value={regData.name} onChange={(e) => setRegData(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="luxury-field-group">
                    <label>Phone Number *</label>
                    <div className="luxury-input-wrapper">
                      <Phone size={15} className="luxury-input-icon" />
                      <input type="tel" placeholder="+91 98765 43210" value={regData.phone} onChange={(e) => setRegData(p => ({ ...p, phone: e.target.value }))} required />
                    </div>
                  </div>
                </div>

                <div className="luxury-field-group">
                  <label>Email Address *</label>
                  <div className="luxury-input-wrapper">
                    <Mail size={15} className="luxury-input-icon" />
                    <input type="email" placeholder="you@email.com" value={regData.email} onChange={(e) => setRegData(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="luxury-field-group">
                    <label>Set Password *</label>
                    <div className="luxury-input-wrapper">
                      <Lock size={15} className="luxury-input-icon" />
                      <input type={showPass ? 'text' : 'password'} placeholder="Min 6 chars" value={regData.password} onChange={(e) => setRegData(p => ({ ...p, password: e.target.value }))} required />
                      <button type="button" className="luxury-pass-toggle" onClick={() => setShowPass(v => !v)}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="luxury-field-group">
                    <label>Confirm *</label>
                    <div className="luxury-input-wrapper">
                      <Lock size={15} className="luxury-input-icon" />
                      <input type={showPass ? 'text' : 'password'} placeholder="Re-enter password" value={regData.confirmPassword} onChange={(e) => setRegData(p => ({ ...p, confirmPassword: e.target.value }))} required />
                    </div>
                  </div>
                </div>

                <label className="luxury-checkbox-row">
                  <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                  <span>I agree to Venthulir&apos;s Terms of Service & Privacy Policy</span>
                </label>

                <button type="submit" className="luxury-btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={16} className="spin-icon" /> : (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── 4. REGISTER OTP VERIFICATION ── */}
            {mode === 'register-otp' && (
              <form onSubmit={handleVerifyRegisterOTP} className="luxury-form">
                <div className="luxury-field-group">
                  <label style={{ justifyContent: 'center' }}>6-Digit Code for {regData.email}</label>
                  <div className="luxury-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="••••••" 
                      maxLength={6}
                      value={regOtp} 
                      onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                      className="luxury-otp-box"
                      autoFocus
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="luxury-btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={16} className="spin-icon" /> : (
                    <>
                      <span>Complete Registration</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setMode('register')}
                    style={{ background: 'none', border: 'none', color: '#0c2f34', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0 }}
                  >
                    ← Edit Details
                  </button>
                  <button 
                    type="button"
                    onClick={handleResendRegisterOTP}
                    disabled={resendTimer > 0 || loading}
                    style={{ background: 'none', border: 'none', color: resendTimer > 0 ? '#888' : '#0c2f34', fontWeight: 700, fontSize: '13px', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', padding: 0 }}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
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
