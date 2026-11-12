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
    planName?: string;
    planTier?: string;
    pricePerMonth?: number;
    handsetName?: string;
    handsetPrice?: number;
    storage?: string;
    color?: string;
    outright?: boolean;
    monthlyTotal?: number;
    keepExistingNumber?: boolean;
  } | null>(null);

  // Personal Information
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState('');

  // Contact & Login Details
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [needNewNumber, setNeedNewNumber] = useState(false);
  const [password, setPassword] = useState('');

  // Residential Address
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('NSW');
  const [postcode, setPostcode] = useState('');

  // Verification Code & Result
  const [code, setCode] = useState('');
  const [createdCustNo, setCreatedCustNo] = useState<string | null>(null);

  // UI Status
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
          if (parsed && (parsed.planName || parsed.planTier || parsed.handsetName)) {
            setSelectedPlanInfo(parsed);
            if (parsed.keepExistingNumber === false) {
              setNeedNewNumber(true);
            }
          }
        }
      } catch {
        // ignore storage error
      }
    }
  }, []);

  useEffect(() => {
    if (user && !createdCustNo) {
      router.push('/account');
    }
  }, [user, createdCustNo, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Validate consumer fields & dispatch verification email
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!firstName.trim()) {
      setErrorMsg('Please enter your legal first name.');
      return;
    }
    if (!surname.trim()) {
      setErrorMsg('Please enter your surname / last name.');
      return;
    }
    if (!dob) {
      setErrorMsg('Please enter your date of birth (required by ACMA telecommunications law).');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!needNewNumber && !phone.trim()) {
      setErrorMsg('Please enter your mobile phone number, or check the box if you need a new number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your residential street address.');
      return;
    }
    if (!suburb.trim()) {
      setErrorMsg('Please enter your suburb.');
      return;
    }
    if (!postcode.trim() || !/^\d{4}$/.test(postcode.trim())) {
      setErrorMsg('Please enter a valid 4-digit Australian postcode.');
      return;
    }

    setLoading(true);
    const res = await sendVerification(email.trim(), 'signup');
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
    const res = await sendVerification(email.trim(), 'signup');
    setLoading(false);
    if (res.success) {
      setSuccessMsg(`New code sent to ${email}`);
      setTimer(60);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Step 2: Verify code, create customer profile & user account
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
      custType: 'R',
      firstName: firstName.trim(),
      surname: surname.trim(),
      name: `${firstName.trim()} ${surname.trim()}`,
      email: email.trim(),
      phone: needNewNumber ? '' : phone.trim(),
      password,
      dob,
      address: address.trim(),
      suburb: suburb.trim(),
      state,
      postcode: postcode.trim(),
      code: code.trim(),
    });
    setLoading(false);

    if (res.success) {
      const assignedCustNo = res.user?.custNo || 'CUS-PENDING';
      setCreatedCustNo(assignedCustNo);
      setSuccessMsg(`Account created and verified! Customer number: ${assignedCustNo}`);
    } else {
      setErrorMsg(res.message);
    }
  };

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
        <div className={styles.card}>
          <div className={styles.headerArea}>
            <h1 className={styles.title}>
              {createdCustNo ? 'Welcome to JustMobile' : 'Create your account'}
            </h1>
            <p className={styles.subtitle}>
              {createdCustNo
                ? 'Your telecom customer profile has been registered and verified.'
                : step === 1
                ? 'Straightforward Australian mobile service with fast instant eSIM setup.'
                : 'Confirm your email address with the 6-digit verification code sent to your inbox.'}
            </p>
          </div>

          {selectedPlanInfo && !createdCustNo && (
            <div className={styles.selectedPlanBanner}>
              <div className={styles.selectedPlanLeft}>
                <span className={styles.selectedPlanTier}>
                  {selectedPlanInfo.handsetName
                    ? selectedPlanInfo.outright
                      ? `${selectedPlanInfo.handsetName} (${selectedPlanInfo.storage || 'Unlocked'})`
                      : `${selectedPlanInfo.handsetName} + ${selectedPlanInfo.planTier || selectedPlanInfo.planName || 'Plan'}`
                    : selectedPlanInfo.planTier || selectedPlanInfo.planName}
                </span>
                <span className={styles.selectedPlanPreference}>
                  {selectedPlanInfo.handsetName
                    ? selectedPlanInfo.outright
                      ? 'Outright device order · Free express courier delivery'
                      : 'Device bundle · Select number option in portal'
                    : needNewNumber
                    ? 'New 04XX mobile number'
                    : 'Both number options supported'}
                </span>
              </div>
              {selectedPlanInfo.outright ? (
                <div className={styles.selectedPlanPrice}>
                  ${Number(selectedPlanInfo.handsetPrice || 0).toLocaleString()}
                  <span> outright</span>
                </div>
              ) : (selectedPlanInfo.monthlyTotal || selectedPlanInfo.pricePerMonth || 0) > 0 ? (
                <div className={styles.selectedPlanPrice}>
                  ${(selectedPlanInfo.monthlyTotal || selectedPlanInfo.pricePerMonth || 0).toFixed(2)}
                  <span>/mth</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Post-Signup Success Screen */}
          {createdCustNo ? (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div
                style={{
                  background: '#f4faee',
                  border: '1.5px solid #a3dc8f',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#4a6b22', marginBottom: '6px' }}>
                  YOUR OFFICIAL CUSTOMER NUMBER
                </div>
                <div
                  style={{
                    fontFamily: 'Courier New, monospace',
                    fontSize: '28px',
                    fontWeight: 800,
                    letterSpacing: '1.5px',
                    color: '#142420',
                    marginBottom: '10px',
                  }}
                >
                  {createdCustNo}
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#556652', lineHeight: 1.5 }}>
                  We have dispatched your customer number and welcome confirmation to{' '}
                  <strong style={{ color: '#142420' }}>{email}</strong>. Please keep this ID handy for portal sign-in and billing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push('/account')}
                className={styles.submitBtn}
                style={{ width: '100%' }}
              >
                Go to My Account Dashboard →
              </button>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div className={styles.stepper}>
                <div className={`${styles.stepDot} ${styles.stepActive}`}>
                  <span className={`${styles.stepNumber} ${step >= 1 ? styles.stepNumberActive : ''}`}>1</span>
                  <span>Personal Details</span>
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

              {/* Step 1: Customer Profile Form */}
              {step === 1 && (
                <form onSubmit={handleRequestCode} className={styles.form}>
                  {/* Section: Personal Info */}
                  <div className={styles.sectionDivider}>
                    <span className={styles.sectionHeading}>Personal Information</span>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="firstName">
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        placeholder="e.g. Alex"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="surname">
                        Surname / Last Name *
                      </label>
                      <input
                        id="surname"
                        type="text"
                        required
                        placeholder="e.g. Morgan"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="dob">
                      Date of Birth *
                    </label>
                    <input
                      id="dob"
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.fieldNote}>
                      Required under Australian telecommunications regulations (ACMA) for pre-activation identity verification.
                    </span>
                  </div>

                  {/* Section: Contact & Account Login */}
                  <div className={styles.sectionDivider}>
                    <span className={styles.sectionHeading}>Account & Contact Details</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">
                      Email Address *
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
                    <span className={styles.fieldNote}>
                      Your customer number and monthly invoices will be delivered here.
                    </span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="phone">
                      Australian Mobile Phone Number {!needNewNumber && '*'}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      disabled={needNewNumber}
                      placeholder={needNewNumber ? 'A new 04XX number will be issued' : '0412 345 678'}
                      value={needNewNumber ? '' : phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={styles.input}
                      style={needNewNumber ? { background: '#f5f7f3', color: '#889685' } : {}}
                    />
                    <label className={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={needNewNumber}
                        onChange={(e) => setNeedNewNumber(e.target.checked)}
                      />
                      <span>I don&apos;t have an Australian mobile yet / I want a brand new 04XX number</span>
                    </label>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="password">
                      Account Password * (min 6 characters)
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
                    <span className={styles.fieldNote}>
                      Used to securely access your JustMobile online management portal.
                    </span>
                  </div>

                  {/* Section: Physical Address */}
                  <div className={styles.sectionDivider}>
                    <span className={styles.sectionHeading}>Residential Address</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="address">
                      Street Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      placeholder="e.g. Unit 4, 120 George St"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.rowThree}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="suburb">
                        Suburb *
                      </label>
                      <input
                        id="suburb"
                        type="text"
                        required
                        placeholder="e.g. Sydney"
                        value={suburb}
                        onChange={(e) => setSuburb(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="state">
                        State *
                      </label>
                      <select
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={styles.select}
                      >
                        <option value="NSW">NSW</option>
                        <option value="VIC">VIC</option>
                        <option value="QLD">QLD</option>
                        <option value="SA">SA</option>
                        <option value="WA">WA</option>
                        <option value="TAS">TAS</option>
                        <option value="ACT">ACT</option>
                        <option value="NT">NT</option>
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="postcode">
                        Postcode *
                      </label>
                      <input
                        id="postcode"
                        type="text"
                        required
                        maxLength={4}
                        placeholder="2000"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        className={styles.input}
                      />
                    </div>
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
                      We sent a 6-digit verification code to:
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
                    <span>{loading ? 'Verifying & Creating Profile...' : 'Verify Code & Create Account →'}</span>
                  </button>
                </form>
              )}
            </>
          )}

          <div className={styles.footerLinks}>
            Already have an account?{' '}
            <Link href="/login" className={styles.textLink}>
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
