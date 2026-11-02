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

  const { login, sendVerification, user } = useAuth();

  const [portal, setPortal] = useState<'customer' | 'admin'>(initialPortal);
  const [authMode, setAuthMode] = useState<'password' | 'code'>('password');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    setCodeSent(false);
    if (newPortal === 'admin') {
      setAuthMode('password');
      if (!email) setEmail('admin@justmobile.com.au');
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await sendVerification(email, 'login');
    setLoading(false);

    if (res.success) {
      setCodeSent(true);
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload: any = {
        email,
        portal,
      };

      if (portal === 'admin') {
        payload.password = password;
      } else if (authMode === 'password') {
        payload.password = password;
      } else {
        payload.code = code;
      }

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
            : 'Access your mobile services, eSIM profile, and data banking.'}
        </p>
      </div>

      {/* Error or Success Banners */}
      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}
      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

      {/* Customer Auth Mode Tabs (Password vs Code) */}
      {portal === 'customer' && (
        <div className={styles.modeTabs}>
          <button
            type="button"
            className={`${styles.modeTab} ${authMode === 'password' ? styles.modeTabActive : ''}`}
            onClick={() => {
              setAuthMode('password');
              setErrorMsg('');
            }}
          >
            Password Sign In
          </button>
          <button
            type="button"
            className={`${styles.modeTab} ${authMode === 'code' ? styles.modeTabActive : ''}`}
            onClick={() => {
              setAuthMode('code');
              setErrorMsg('');
            }}
          >
            One-Time Email Code
          </button>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="emailInput">
            {portal === 'admin' ? 'Admin Email Address' : 'Email Address'}
          </label>
          <input
            id="emailInput"
            type="email"
            required
            placeholder={portal === 'admin' ? 'admin@justmobile.com.au' : 'you@example.com.au'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Password field when password mode or admin */}
        {(portal === 'admin' || authMode === 'password') && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="passwordInput">
              Password
            </label>
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

        {/* Email verification code flow when in 'code' mode */}
        {portal === 'customer' && authMode === 'code' && (
          <>
            {!codeSent ? (
              <button
                type="button"
                className={styles.secondaryBtn}
                disabled={loading || !email}
                onClick={handleSendCode}
              >
                {loading ? 'Sending code...' : 'Send Verification Code via Email'}
              </button>
            ) : (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="codeInput">
                  6-Digit Verification Code
                </label>
                <input
                  id="codeInput"
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`${styles.input} ${styles.codeInput}`}
                />
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#789937',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    textAlign: 'right',
                    padding: '4px 0',
                  }}
                  onClick={handleSendCode}
                >
                  Resend code
                </button>
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading || (portal === 'customer' && authMode === 'code' && !codeSent)}
          className={styles.submitBtn}
        >
          <span>{loading ? 'Authenticating...' : portal === 'admin' ? 'Access Admin Console →' : 'Sign In to Account →'}</span>
        </button>
      </form>

      {/* Footer Links */}
      <div className={styles.footerLinks}>
        {portal === 'customer' ? (
          <div>
            Don't have an account yet?{' '}
            <Link href="/signup" className={styles.textLink}>
              Sign up with email verification
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.pageContainer}>
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
