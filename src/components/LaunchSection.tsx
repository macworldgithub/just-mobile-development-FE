'use strict';
'use client';

import React, { useState } from 'react';
import styles from './LaunchSection.module.css';

interface LaunchSectionProps {
  onFindPlan?: () => void;
}

export default function LaunchSection({ onFindPlan }: LaunchSectionProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubmitted(false);
                }}
                className={styles.signupInput}
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className={styles.signupSubmitBtn}
              >
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
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
