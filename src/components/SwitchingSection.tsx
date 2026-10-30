'use strict';
import React from 'react';
import styles from './SwitchingSection.module.css';

export default function SwitchingSection() {
  const steps = [
    {
      num: '01',
      title: 'Pick your perfect fit',
      text: 'Bring your phone or find a new favourite. Choose the plan that suits your everyday.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Set up your eSIM',
      text: 'On a compatible phone, follow a guided digital setup. No tiny plastic SIM required.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2"></rect>
          <line x1="9" y1="9" x2="9" y2="15"></line>
          <line x1="15" y1="9" x2="15" y2="15"></line>
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Keep your number. Carry on.',
      text: 'Complete the required checks and transfer your number. Stay connected until the switch is complete.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ),
    },
  ];

  return (
    <section className={styles.switchingSection}>
      <div className={styles.container}>
        <div className={styles.switchingInner}>
          <div className={styles.leftCol}>
            <span className={styles.eyebrow}>A FRESH START, WITHOUT STARTING OVER.</span>
            <h2 className={styles.title}>
              New mobile.
              <br />
              Same you.
            </h2>
            <p className={styles.subtitle}>
              Your phone, your number, your everyday.
              <br />
              Here&apos;s how switching is designed to work.
            </p>
          </div>

          <div className={styles.switchSteps}>
            {steps.map((st) => (
              <div key={st.num} className={styles.switchStep}>
                <span className={styles.stepNumPill}>{st.num}</span>
                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepIcon}>{st.icon}</span>
                    <h3 className={styles.stepTitle}>{st.title}</h3>
                  </div>
                  <p className={styles.stepText}>{st.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <p className={styles.switchingNote}>
          Fast digital onboarding. Compatible eSIM device and standard Australian number transfer rules apply.
        </p>
      </div>
    </section>
  );
}
