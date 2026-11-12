'use strict';
'use client';

import React, { useState } from 'react';
import styles from './LaunchSection.module.css';

interface LaunchSectionProps {
  onFindPlan?: () => void;
}

export default function LaunchSection({ onFindPlan }: LaunchSectionProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'homepage_launch_banner' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        setMessage(data.message || "You're on the list. We'll be in touch soon.");
        setEmail('');
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Unable to register email at this time.');
      }
    } catch {
      setIsSuccess(false);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.launchCta}>
      <div className={styles.container}>
        <div className={styles.launchInner}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            <span className={styles.eyebrow}>A NEW CHAPTER IN MOBILE</span>
            <h2 className={styles.title}>
              Good things are
              <br />
              just getting started.
            </h2>
            <p className={styles.subtitle}>Experience a fresh, straightforward mobile service.</p>
            <a
              href="#plans"
              className={styles.planLink}
              onClick={(e) => {
                if (onFindPlan) {
                  e.preventDefault();
                  onFindPlan();
                }
              }}
            >
              <span>Find your plan</span>
              <span className={styles.diagonalArrow}>↗</span>
            </a>
          </div>

          {/* Right Column: Signup form */}
          <div className={styles.launchSignup}>
            <h3 className={styles.signupTitle}>Be part of what&apos;s next.</h3>
            <p className={styles.signupSubtitle}>Stay in the loop with exclusive deals and new offers.</p>
            <form onSubmit={handleSubmit} className={styles.signupForm}>
              <label htmlFor="launch-email" className={styles.srOnly}>
                Email address
              </label>
              <input
                id="launch-email"
                type="email"
                value={email}
                placeholder="Your email address"
                required
                disabled={loading}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMessage(null);
                }}
                className={styles.signupInput}
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                disabled={loading}
                className={styles.signupSubmitBtn}
              >
                {loading ? (
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>...</span>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                )}
              </button>
            </form>
            {message && (
              <p
                style={{
                  marginTop: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isSuccess ? '#142420' : '#b91c1c',
                }}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
