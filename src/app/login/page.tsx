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

  const [portal, setPortal] = useState<'customer' | 'admin'>(initialPortal);

  // Form states
  const [custNo, setCustNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      if (!password) {
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
        ? { custNo: custNo.trim(), password, portal: 'customer' as const }
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
            : 'Sign in with your Customer Number and password.'}
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
              placeholder="e.g. CUST697855"
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

        {/* Password field */}
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
