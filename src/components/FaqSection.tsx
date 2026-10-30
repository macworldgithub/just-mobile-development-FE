'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import styles from './FaqSection.module.css';

export interface FaqItem {
  id?: string;
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: 'Can I bring my own phone and keep my number?',
    a: "Yes, absolutely! You can bring any unlocked phone compatible with our network and keep your existing Australian mobile number. During checkout, simply select 'Keep my number', complete the SMS verification, and we'll manage the switch with your current provider seamlessly.",
  },
  {
    q: 'How can I pay for a new phone?',
    a: 'You can purchase your phone outright or spread the cost across flexible 12, 24, or 36-month instalment terms. You can also customize an optional upfront payment (0%, 25%, or 50%) to suit your monthly budget, or bundle your device with a JustMobile SIM-only plan.',
  },
  {
    q: 'Is a month-to-month plan the same as a phone repayment term?',
    a: 'No, your mobile service and handset repayments are kept clearly distinct. Our mobile plans are month-to-month with no lock-in contracts, giving you the freedom to switch plans whenever your needs change. If you choose a handset on instalments, your device payments simply continue on their set term.',
  },
  {
    q: 'Which network would JustMobile use?',
    a: "JustMobile mobile services are powered by the Telstra Wholesale Mobile Network, reaching 98.8% of the Australian population with robust 4G and 5G coverage spanning over 1.4 million square kilometres.",
  },
  {
    q: 'Are these handset prices and stock live?',
    a: 'Yes! All handsets featured in our catalogue are genuine Australian models backed by full local manufacturer warranties, with prompt dispatch and free express delivery across Australia.',
  },
  {
    q: 'What is eSIM, and will it work on my phone?',
    a: 'An eSIM is a digital SIM built directly into your phone that allows you to activate mobile service without waiting for a physical plastic SIM. Compatible models include recent iPhone, Samsung Galaxy, and Google Pixel devices. You can scan your QR code and get connected in minutes.',
  },
  {
    q: 'Can I sign up or order today?',
    a: 'Yes! You can order online right now. Choose your plan, select a phone or bring your own, and complete checkout. If you select eSIM, your digital activation QR code is delivered directly to your inbox so you can connect straight away.',
  },
];

export default function FaqSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>(FAQS);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Fetch live FAQs from Backend (MongoDB)
  useEffect(() => {
    fetch('/api/faqs')
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Normalize if backend has question/answer or q/a
          const normalized = data.data.map((item: any) => ({
            q: item.q || item.question,
            a: item.a || item.answer,
          }));
          setFaqs(normalized);
        }
      })
      .catch((err) => console.warn('Using baseline FAQs:', err));
  }, []);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="help" className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.faqGrid}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            <span className={styles.eyebrow}>LESS GUESSWORK. MORE ANSWERS.</span>
            <h2 className={styles.title}>
              Good questions.
              <br />
              Straight answers.
            </h2>
            <p className={styles.subtitle}>
              All the little things you might
              <br className={styles.desktopBreak} /> be wondering about.
            </p>
            <a href="#bele" className={styles.beleDemoLink}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Ask Bele your question</span>
              <span className={styles.diagonalArrow}>↗</span>
            </a>
          </div>

          {/* Right Column: Accordion */}
          <div className={styles.accordionWrap}>
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className={styles.faqItem}>
                  <button
                    type="button"
                    className={styles.questionBtn}
                    onClick={() => toggle(idx)}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.questionText}>{faq.q}</span>
                    <svg
                      className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {isOpen && (
                    <div className={styles.answerBox}>
                      <p className={styles.answerText}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
