'use strict';
import React from 'react';
import styles from './TrustBar.module.css';

export default function TrustBar() {
  const pillars = [
    {
      id: 'network',
      icon: (
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="14" x2="3" y2="12" />
          <line x1="7" y1="14" x2="7" y2="9" />
          <line x1="11" y1="14" x2="11" y2="6" />
          <line x1="15" y1="14" x2="15" y2="3" />
        </svg>
      ),
      text: 'Telstra Wholesale Network',
    },
    {
      id: 'choices',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ),
      text: 'Straightforward plan choices',
    },
    {
      id: 'pay',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ),
      text: 'Your phone. Your way to pay.',
    },
    {
      id: 'porting',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ),
      text: 'Keep your number when switching',
    },
  ];

  return (
    <section className={styles.trustSection}>
      <div className={styles.trustContainer}>
        {pillars.map((p) => (
          <div key={p.id} className={styles.pillarItem}>
            <span className={styles.pillarIcon}>{p.icon}</span>
            <span className={styles.pillarText}>{p.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
