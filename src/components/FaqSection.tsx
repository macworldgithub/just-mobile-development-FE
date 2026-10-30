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
    a: "That's the proposed experience. You'll need an unlocked phone compatible with the network and eSIM. Keep your current service active until your number transfer completes. Matching account details, identity checks and transfer eligibility will apply.",
  },
  {
    q: 'How can I pay for a new phone?',
    a: 'Explore outright purchase, handset instalments, or a phone plus mobile plan. The calculator illustrates 12, 24 and 36-month terms with an optional upfront contribution. Instalments assume no added financing cost, but a finance provider, fees, eligibility and commercial terms have not been approved. No credit application is submitted in this preview.',
  },
  {
    q: 'Is a month-to-month plan the same as a phone repayment term?',
    a: "No. Your mobile service and handset payments are separate. A proposed month-to-month service doesn't mean the phone is free to cancel. Any outstanding handset balance may be payable when you leave. Final ownership and early-exit terms must be approved before launch.",
  },
  {
    q: 'Which network would JustMobile use?',
    a: "The proposed service uses the Telstra Wholesale Mobile Network. This differs from Telstra's retail network. Check the official predicted outdoor coverage map for your address; coverage and performance vary by location, compatible device and conditions. 5G access also requires an eligible plan.",
  },
  {
    q: 'Are these handset prices and stock live?',
    a: 'No. These are indicative customer prices including GST, proposed slightly below supplier-listed RRP. Models and selected configurations were available in the supplier catalogue at review on 27 October 2026. Stock is not live and must be reconfirmed. Prices may not be lower than retailer promotions.',
  },
  {
    q: 'What is eSIM, and will it work on my phone?',
    a: 'An eSIM is a digital SIM installed on a compatible phone instead of a removable plastic SIM. Compatibility depends on the exact device model, market variant and network configuration. The showcased supplier models list eSIM support; your own device will need to be checked before activation.',
  },
  {
    q: 'Can I sign up or order today?',
    a: "Not in this preview. You can explore plans, configure phone payment estimates and try Bele's scripted demo. Checkout, finance, number transfers, email subscriptions, account login and live support are not connected. Approved pricing, terms and Critical Information Summaries are required before launch.",
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
              <span>Try the Bele demo</span>
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
