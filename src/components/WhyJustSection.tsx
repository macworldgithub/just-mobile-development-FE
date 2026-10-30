'use strict';
import React from 'react';
import styles from './WhyJustSection.module.css';

export default function WhyJustSection() {
  const articles = [
    {
      num: '01 / CLEAR BY DESIGN',
      title: (
        <>
          The whole price.
          <br />
          Not half the story.
        </>
      ),
      description:
        'See your phone, plan and payment term together. No tiny monthly headline hiding the bigger picture.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      ),
    },
    {
      num: '02 / MADE TO FIT',
      title: (
        <>
          Your phone.
          <br />
          Your way to pay.
        </>
      ),
      description:
        'Explore outright, instalments or a phone + plan. Adjust an upfront contribution to see what works for you.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      ),
    },
    {
      num: '03 / A LITTLE SMARTER',
      title: (
        <>
          Less searching.
          <br />
          More understanding.
        </>
      ),
      description:
        'Meet Bele, our AI-assistant concept. A simpler starting point for plans, switching and everyday questions.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
        </svg>
      ),
    },
  ];

  return (
    <section className={styles.whySection}>
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>NOT ANOTHER TELCO. A BETTER IDEA.</span>
            <h2 className={styles.title}>Mobile, minus the runaround.</h2>
          </div>
          <p className={styles.subtitle}>
            Less to work out.
            <br />
            More to look forward to.
          </p>
        </div>

        <div className={styles.whyGrid}>
          {articles.map((art, idx) => (
            <article key={idx} className={styles.articleCard}>
              <div className={styles.iconWrap}>{art.icon}</div>
              <span className={styles.articleNum}>{art.num}</span>
              <h3 className={styles.articleTitle}>{art.title}</h3>
              <p className={styles.articleDesc}>{art.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
