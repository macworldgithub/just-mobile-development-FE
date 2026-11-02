'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './signup.module.css';

export default function SignupPage() {
  const router = useRouter();
  const { signup, sendVerification, user } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlanInfo, setSelectedPlanInfo] = useState<{
    planName: string;
    planTier: string;
    pricePerMonth: number;
    keepExistingNumber: boolean;
  } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('justmobile_selected_order');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.planName || parsed.planTier)) {
            setSelectedPlanInfo(parsed);
          }
        }
      } catch {
        // ignore storage error
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/account');
    }
  }, [user, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Submit details and send code via SMTP
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || name.trim().length < 2) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await sendVerification(email, 'signup');
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setStep(2);
      setTimer(60);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    if (timer > 0) return;
    setLoading(true);
    setErrorMsg('');
    const res = await sendVerification(email, 'signup');
    setLoading(false);
    if (res.success) {
      setSuccessMsg(`New code sent to ${email}`);
      setTimer(60);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Step 2: Verify code & create account
  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!code || code.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await signup({
      name,
      email,
      password,
      phone,
      code,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Account created & verified! Redirecting to your account...');
      setTimeout(() => {
        router.push('/account');
      }, 800);
    } else {
      setErrorMsg(res.message);
    }
  };

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
        <div className={styles.card}>
          <div className={styles.headerArea}>
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>
              {step === 1
                ? 'Get started with straightforward mobile plans and instant eSIM setup.'
                : 'Confirm your email address with the verification code we just sent.'}
            </p>
          </div>

          {selectedPlanInfo && (
            <div className={styles.selectedPlanBanner}>
              <div className={styles.selectedPlanLeft}>
                <span className={styles.selectedPlanTier}>
                  {selectedPlanInfo.planTier || selectedPlanInfo.planName}
                </span>
                <span className={styles.selectedPlanPreference}>
                  {selectedPlanInfo.keepExistingNumber ? 'Keep existing mobile number' : 'New 04XX mobile number'}
                </span>
              </div>
              {selectedPlanInfo.pricePerMonth > 0 && (
                <div className={styles.selectedPlanPrice}>
                  ${selectedPlanInfo.pricePerMonth}<span>/mth</span>
                </div>
              )}
            </div>
          )}

          {/* Stepper */}
          <div className={styles.stepper}>
            <div className={`${styles.stepDot} ${styles.stepActive}`}>
              <span className={`${styles.stepNumber} ${step >= 1 ? styles.stepNumberActive : ''}`}>1</span>
              <span>Account Info</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.stepDot} ${step === 2 ? styles.stepActive : ''}`}>
              <span className={`${styles.stepNumber} ${step === 2 ? styles.stepNumberActive : ''}`}>2</span>
              <span>Email Verification</span>
            </div>
          </div>

          {/* Error and Success banners */}
          {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}
          {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

          {/* Step 1 Form */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">
                  Full Legal Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="alex.morgan@example.com.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="phone">
                  Australian Mobile Number (Optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="0412 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Choose a Password (min 6 characters)
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                />
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                <span>{loading ? 'Sending verification code...' : 'Continue to Email Verification →'}</span>
              </button>
            </form>
          )}

          {/* Step 2 Form: Code Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndSignup} className={styles.form}>
              <div className={styles.codeHintBox}>
                <p style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#495746' }}>
                  We sent a 6-digit security code to:
                </p>
                <div className={styles.codeTargetEmail}>{email}</div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="code">
                  Enter 6-Digit Code
                </label>
                <input
                  id="code"
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`${styles.input} ${styles.codeInput}`}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#556253', cursor: 'pointer', padding: 0 }}
                >
                  ← Edit details
                </button>

                {timer > 0 ? (
                  <span style={{ color: '#889685' }}>Resend in {timer}s</span>
                ) : (
                  <button type="button" onClick={handleResendCode} className={styles.resendBtn}>
                    Resend Code
                  </button>
                )}
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                <span>{loading ? 'Verifying...' : 'Verify Code & Create Account →'}</span>
              </button>
            </form>
          )}

          <div className={styles.footerLinks}>
            Already have an account?{' '}
            <Link href="/login" className={styles.textLink}>
              Sign in here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
