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
  Leaf,
  Loader2,
  KeyRound,
  RotateCw,
  MapPin
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

  // ─────────────────────────────────────────────────────────────
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
    if (!loginEmail || !loginPassword) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await requestOTP(loginEmail.toLowerCase().trim(), loginPassword);
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
      const res = await requestOTP(loginEmail.toLowerCase().trim(), loginPassword);
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

  // ─────────────────────────────────────────────────────────────
  // 2. REGISTRATION FLOW
  // ─────────────────────────────────────────────────────────────

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
    <div className="auth-page-root">
      
      {/* ── CENTRAL FLOATING GLASS CARD ── */}
      <div className="glass-auth-card">
        
        <Link href="/home" style={{position: 'absolute', top: '24px', left: '24px', color: '#114529', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600}}>
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="auth-brand-logo">
          <img src="/logo.png" alt="Venthulir Logo" className="auth-logo-img" />
        </div>

        <h1 className="auth-main-title">
          {mode === 'login' 
            ? 'Welcome Back' 
            : mode === 'login-otp' 
            ? 'Security Verification' 
            : mode === 'register-otp'
            ? 'Verify Your Email'
            : 'Join the Family'}
        </h1>
        <p className="auth-main-subtitle">
          {mode === 'login' 
            ? 'Sign in to access your farm-fresh orders and perks.' 
            : mode === 'login-otp'
            ? `Enter the 6-digit code sent to ${loginEmail}`
            : mode === 'register-otp'
            ? `Enter the 6-digit code sent to ${regData.email}`
            : 'Experience the pure taste of nature.'}
        </p>

        {/* Switch Tabs */}
        {!isOtpStep && (
          <div className="auth-tabs-toggle">
            <button 
              type="button" 
              className={`auth-toggle-tab ${mode === 'login' ? 'active' : ''}`} 
              onClick={() => handleTabSwitch('login')}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className={`auth-toggle-tab ${mode === 'register' ? 'active' : ''}`} 
              onClick={() => handleTabSwitch('register')}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && <div className="auth-alert-message error"><CheckCircle2 size={16} /> {error}</div>}
        {successMsg && <div className="auth-alert-message info"><CheckCircle2 size={16} /> {successMsg}</div>}

        {/* ── 1. SIGN IN FORM ── */}
        {mode === 'login' && (
          <form onSubmit={handleDirectPasswordLogin} className="auth-inner-form">
            <div className="auth-input-group">
              <label htmlFor="login-email">Email or Username</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="input-icon" />
                <input 
                  id="login-email"
                  type="text" 
                  placeholder="admin@venthulir.com" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="login-password">
                <span>Password</span>
                <Link href="/forgot-password" style={{ color: '#114529', textDecoration: 'none', fontWeight: 600 }}>Forgot?</Link>
              </label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="input-icon" />
                <input 
                  id="login-password"
                  type={showPass ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required 
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#444' }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{accentColor: '#114529'}} />
              Keep me signed in
            </label>

            <button type="submit" className="auth-action-btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin-icon" /> : 'Sign In with Password'}
              {!loading && <ArrowRight size={16} />}
            </button>

            <button type="button" className="auth-secondary-btn" onClick={handleSendLoginOTP} disabled={loading}>
              <KeyRound size={14} /> Sign In with Email OTP
            </button>
          </form>
        )}

        {/* ── 2. LOGIN OTP VERIFICATION ── */}
        {mode === 'login-otp' && (
          <form onSubmit={handleVerifyLoginOTP} className="auth-inner-form">
            <div className="auth-input-group">
              <label style={{justifyContent: 'center'}}>6-Digit Code</label>
              <div className="auth-input-wrapper">
                <input 
                  type="text" 
                  placeholder="••••••" 
                  maxLength={6}
                  value={loginOtp} 
                  onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                  className="otp-digit-input"
                  autoFocus
                  required 
                />
              </div>
            </div>

            <button type="submit" className="auth-action-btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin-icon" /> : 'Verify & Enter'}
              {!loading && <ArrowRight size={16} />}
            </button>

            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '16px'}}>
              <span style={{color: '#114529', cursor: 'pointer', fontSize: '13px', fontWeight: 600}} onClick={() => setMode('login')}>← Edit</span>
              <span style={{color: resendTimer > 0 ? '#888' : '#114529', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600}} onClick={handleResendLoginOTP}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </span>
            </div>
          </form>
        )}

        {/* ── 3. REGISTER FORM ── */}
        {mode === 'register' && (
          <form onSubmit={handleSendRegisterOTP} className="auth-inner-form">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div className="auth-input-group">
                <label>Full Name *</label>
                <div className="auth-input-wrapper">
                  <User size={15} className="input-icon" />
                  <input type="text" placeholder="Your name" value={regData.name} onChange={(e) => setRegData(p => ({ ...p, name: e.target.value }))} required />
                </div>
              </div>
              <div className="auth-input-group">
                <label>Phone *</label>
                <div className="auth-input-wrapper">
                  <Phone size={15} className="input-icon" />
                  <input type="tel" placeholder="Mobile" value={regData.phone} onChange={(e) => setRegData(p => ({ ...p, phone: e.target.value }))} required />
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label>Email Address *</label>
              <div className="auth-input-wrapper">
                <Mail size={15} className="input-icon" />
                <input type="email" placeholder="you@domain.com" value={regData.email} onChange={(e) => setRegData(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div className="auth-input-group">
                <label>Password *</label>
                <div className="auth-input-wrapper">
                  <Lock size={15} className="input-icon" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 chars" value={regData.password} onChange={(e) => setRegData(p => ({ ...p, password: e.target.value }))} required />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowPass(v => !v)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="auth-input-group">
                <label>Confirm *</label>
                <div className="auth-input-wrapper">
                  <Lock size={15} className="input-icon" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Confirm" value={regData.confirmPassword} onChange={(e) => setRegData(p => ({ ...p, confirmPassword: e.target.value }))} required />
                </div>
              </div>
            </div>

            <button type="submit" className="auth-action-btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin-icon" /> : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}
        
        {/* ── 4. REGISTER OTP VERIFICATION ── */}
        {mode === 'register-otp' && (
          <form onSubmit={handleVerifyRegisterOTP} className="auth-inner-form">
            <div className="auth-input-group">
              <label style={{justifyContent: 'center'}}>6-Digit Code for {regData.email}</label>
              <div className="auth-input-wrapper">
                <input 
                  type="text" 
                  placeholder="••••••" 
                  maxLength={6}
                  value={regOtp} 
                  onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                  className="otp-digit-input"
                  autoFocus
                  required 
                />
              </div>
            </div>

            <button type="submit" className="auth-action-btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin-icon" /> : 'Complete Registration'}
              {!loading && <CheckCircle2 size={16} />}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
