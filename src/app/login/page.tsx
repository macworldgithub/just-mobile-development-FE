'use strict';
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPortal = searchParams.get('portal') === 'admin' ? 'admin' : 'customer';

  const { login, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [portal, setPortal] = useState<'customer' | 'admin'>(initialPortal);
  const [authMethod, setAuthMethod] = useState<'pin' | 'password'>('pin');

  // Form states
  const [custNo, setCustNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Self-Service Password Reset States (Hostinger SMTP)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' && portal === 'admin') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  }, [user, portal, router]);

  // Sync portal with URL search param if changed
  useEffect(() => {
    const p = searchParams.get('portal');
    if (p === 'admin') {
      setPortal('admin');
      setEmail('admin@justmobile.com.au');
    }
  }, [searchParams]);

  const handlePortalChange = (newPortal: 'customer' | 'admin') => {
    setPortal(newPortal);
    setErrorMsg('');
    setSuccessMsg('');
    if (newPortal === 'admin') {
      if (!email) setEmail('admin@justmobile.com.au');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (portal === 'customer') {
      if (!custNo.trim()) {
        setErrorMsg('Please enter your Customer Number.');
        return;
      }
      if (authMethod === 'pin' && !pin.trim()) {
        setErrorMsg('Please enter your 4-6 digit PIN.');
        return;
      }
      if (authMethod === 'password' && !password) {
        setErrorMsg('Please enter your password.');
        return;
      }
    } else {
      if (!email.trim()) {
        setErrorMsg('Please enter your administrator email.');
        return;
      }
      if (!password) {
        setErrorMsg('Please enter your password.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = portal === 'customer'
        ? (authMethod === 'pin'
            ? { custNo: custNo.trim(), pin: pin.trim(), password: pin.trim(), portal: 'customer' as const }
            : { custNo: custNo.trim(), password, pin: password, portal: 'customer' as const })
        : { email: email.trim(), password, portal: 'admin' as const };

      const res = await login(payload);
      setLoading(false);

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (portal === 'admin') {
            router.push('/admin');
          } else {
            router.push('/account');
          }
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your Customer Number (e.g. CUST882104) or registered email.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });
      const data = await res.json();
      setForgotLoading(false);

      if (res.ok && data.success) {
        setMaskedEmail(data.maskedEmail || 'your email');
        setForgotStep('verify');
        setForgotSuccess(data.message);
      } else {
        setForgotError(data.message || 'Account not found. Please verify your details.');
      }
    } catch (err: any) {
      setForgotLoading(false);
      setForgotError(err.message || 'Failed to connect to authentication service.');
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotCode.trim() || forgotCode.trim().length !== 6) {
      setForgotError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      setForgotError('Password or PIN must be at least 4 characters/digits.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          code: forgotCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      setForgotLoading(false);

      if (res.ok && data.success) {
        setShowForgotModal(false);
        setSuccessMsg('✓ Password successfully reset! Please sign in with your new password.');
        if (forgotIdentifier.toUpperCase().startsWith('CUST')) {
          setCustNo(forgotIdentifier.trim().toUpperCase());
        } else {
          setEmail(forgotIdentifier.trim());
        }
        setPassword(forgotNewPassword);
      } else {
        setForgotError(data.message || 'Failed to reset password. Code may be invalid or expired.');
      }
    } catch (err: any) {
      setForgotLoading(false);
      setForgotError(err.message || 'Failed to connect to authentication service.');
    }
  };

  if (!mounted) {
    return (
      <div className={styles.card} style={{ minHeight: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading portal sign in...</p>
      </div>
    );
  }

  return (
    <div className={styles.card + (portal === 'admin' ? ` ${styles.cardAdmin}` : '')}>
      {/* Portal Switcher */}
      <div className={styles.portalSwitch} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={portal === 'customer'}
          className={`${styles.portalBtn} ${portal === 'customer' ? styles.portalBtnActive : ''}`}
          onClick={() => handlePortalChange('customer')}
        >
          <span>Customer Portal</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={portal === 'admin'}
          className={`${styles.portalBtn} ${portal === 'admin' ? styles.portalBtnActive : ''}`}
          onClick={() => handlePortalChange('admin')}
        >
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Header Area */}
      <div className={styles.headerArea}>
        <h1 className={styles.title}>
          {portal === 'admin' ? 'Administrator Login' : 'Welcome to JustMobile'}
        </h1>
        <p className={styles.subtitle}>
          {portal === 'admin'
            ? 'Sign in to access management, subscriber telemetry, and network operations.'
            : 'Sign in with your Customer Number and PIN or password.'}
        </p>
      </div>

      {/* Error or Success Banners */}
      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}
      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Customer Portal: Customer ID input */}
        {portal === 'customer' ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="custNoInput">
              Customer Number (Cust No)
            </label>
            <input
              id="custNoInput"
              type="text"
              required
              autoFocus
              placeholder="e.g. 512345 or CUST882104"
              value={custNo}
              onChange={(e) => setCustNo(e.target.value)}
              className={styles.input}
            />
          </div>
        ) : (
          /* Admin Portal: Email Input */
          <div className={styles.field}>
            <label className={styles.label} htmlFor="emailInput">
              Admin Email Address
            </label>
            <input
              id="emailInput"
              type="email"
              required
              placeholder="admin@justmobile.com.au"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>
        )}

        {/* Customer Portal Auth Method Toggle (PIN vs Password) */}
        {portal === 'customer' && (
          <div className={styles.authMethodSwitch} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={authMethod === 'pin'}
              className={`${styles.authMethodBtn} ${authMethod === 'pin' ? styles.authMethodBtnActive : ''}`}
              onClick={() => {
                setAuthMethod('pin');
                setErrorMsg('');
              }}
            >
              <span>4-Digit PIN</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMethod === 'password'}
              className={`${styles.authMethodBtn} ${authMethod === 'password' ? styles.authMethodBtnActive : ''}`}
              onClick={() => {
                setAuthMethod('password');
                setErrorMsg('');
              }}
            >
              <span>Password</span>
            </button>
          </div>
        )}

        {/* Secret Input (PIN or Password) */}
        {portal === 'customer' && authMethod === 'pin' ? (
          <div className={styles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className={styles.label} htmlFor="pinInput">
                Account PIN (4–6 Digits)
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStep('request');
                  setForgotIdentifier(custNo || email || '');
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className={styles.textLink}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: 0,
                  fontWeight: 600,
                }}
              >
                Forgot PIN?
              </button>
            </div>
            <div className={styles.pinInputWrapper}>
              <input
                id="pinInput"
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="Enter your PIN (e.g. 1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className={`${styles.input} ${styles.pinInput}`}
              />
            </div>
            <span className={styles.pinHint}>
              Enter your 4-digit PIN, or switch to Password above.
            </span>
          </div>
        ) : (
          <div className={styles.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className={styles.label} htmlFor="passwordInput">
                Password
              </label>
              {portal === 'customer' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep('request');
                    setForgotIdentifier(custNo || email || '');
                    setForgotError('');
                    setForgotSuccess('');
                  }}
                  className={styles.textLink}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: 0,
                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="passwordInput"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={styles.submitBtn}
        >
          <span>
            {loading
              ? 'Authenticating...'
              : portal === 'admin'
              ? 'Access Admin Console →'
              : authMethod === 'pin'
              ? 'Sign In with PIN →'
              : 'Sign In to Account →'}
          </span>
        </button>
      </form>

      {/* Footer Links */}
      <div className={styles.footerLinks}>
        {portal === 'customer' ? (
          <div>
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className={styles.textLink}>
              Sign up
            </Link>
          </div>
        ) : (
          <div>
            Need customer account access?{' '}
            <button
              type="button"
              onClick={() => handlePortalChange('customer')}
              className={styles.textLink}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Switch to Customer Portal
            </button>
          </div>
        )}
      </div>

      {/* Self-Service Password Reset Modal (Hostinger SMTP) */}
      {showForgotModal && (
        <div className={styles.modalOverlay} onClick={() => setShowForgotModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setShowForgotModal(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <span className={styles.badgeReset}>
              ACCOUNT SECURITY
            </span>

            {forgotStep === 'request' ? (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#142420', margin: '0 0 8px 0' }}>
                  Reset Password or PIN
                </h2>
                <p style={{ fontSize: '13.5px', color: '#556253', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                  Enter your <strong>Customer Number</strong> (e.g. <code>512345</code> or <code>CUST882104</code>) or registered email address. We will dispatch a 6-digit verification code to your email.
                </p>

                {forgotError && <div className={styles.errorBanner} style={{ marginBottom: '14px' }}>{forgotError}</div>}

                <form onSubmit={handleRequestResetCode} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Customer Number or Email</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. CUST882104 or you@email.com"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className={styles.submitBtn}
                    style={{ marginTop: '4px' }}
                  >
                    <span>{forgotLoading ? 'Sending Security Code...' : 'Send Reset Code →'}</span>
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#142420', margin: '0 0 8px 0' }}>
                  Set New Password or PIN
                </h2>
                <p style={{ fontSize: '13.5px', color: '#556253', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                  A 6-digit verification code was dispatched to <strong>{maskedEmail}</strong>.
                </p>

                {forgotError && <div className={styles.errorBanner} style={{ marginBottom: '14px' }}>{forgotError}</div>}
                {forgotSuccess && <div className={styles.successBanner} style={{ marginBottom: '14px' }}>{forgotSuccess}</div>}

                <form onSubmit={handleCompleteReset} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>6-Digit Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      placeholder="••••••"
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      className={`${styles.input} ${styles.codeInput}`}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>New Password or 4-6 Digit PIN</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 4 characters / digits"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Confirm New Password or PIN</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password or PIN"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className={styles.submitBtn}
                    style={{ marginTop: '4px' }}
                  >
                    <span>{forgotLoading ? 'Updating Password...' : 'Save New Password & Sign In →'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    className={styles.secondaryBtn}
                    style={{ width: '100%', marginTop: '6px' }}
                  >
                    ← Back / Resend Code
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.pageContainer} suppressHydrationWarning>
      <header className={styles.topBar}>
        <Link href="/" aria-label="Return to Homepage">
          <Image
            src="/brand/logos/justmobile-wordmark-ink.svg"
            alt="JustMobile"
            width={140}
            height={32}
            priority
          />
        </Link>
        <Link href="/" className={styles.backLink}>
          ← Back to website
        </Link>
      </header>

      <main className={styles.authContent}>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>
    </div>
  );
}
