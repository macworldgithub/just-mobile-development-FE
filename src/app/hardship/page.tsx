'use strict';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './hardship.module.css';

export const metadata = {
  title: 'Financial Hardship Policy | JustMobile',
  description: 'Support, flexible payment arrangements, and consumer protections for customers experiencing financial difficulty under the ACMA TCP Code (C628).',
};

export default function HardshipPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" aria-label="JustMobile Home">
            <Image
              src="/brand/logos/justmobile-wordmark-ink.svg"
              alt="JustMobile"
              width={140}
              height={32}
              priority
            />
          </Link>
          <nav className={styles.navLinks}>
            <Link href="/terms" className={styles.navLink}>
              Terms of Service
            </Link>
            <Link href="/privacy" className={styles.navLink}>
              Privacy Policy
            </Link>
            <Link href="/hardship" className={`${styles.navLink} ${styles.activeNavLink}`}>
              Financial Hardship
            </Link>
            <Link href="/" className={styles.backHomeBtn}>
              <span>← Back to Home</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Header */}
      <section className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>ACMA FINANCIAL HARDSHIP STANDARD · TCP CODE C628</span>
          <h1 className={styles.heroTitle}>Financial Hardship &amp; Assistance Policy</h1>
          <p className={styles.heroSub}>
            Life happens. If you are going through a difficult time, we are here to support you with dignity, empathy, and flexible solutions.
          </p>
          <div className={styles.heroMeta}>
            Last updated: 4 November 2026 · Free, confidential assistance for all JustMobile customers
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className={styles.contentContainer}>
        {/* Table of Contents Sidebar */}
        <aside className={styles.tocSidebar}>
          <div className={styles.tocTitle}>Contents</div>
          <ul className={styles.tocList}>
            <li className={styles.tocItem}><a href="#h1">1. What is Financial Hardship</a></li>
            <li className={styles.tocItem}><a href="#h2">2. Our Core Principles</a></li>
            <li className={styles.tocItem}><a href="#h3">3. How We Can Help</a></li>
            <li className={styles.tocItem}><a href="#h4">4. Domestic &amp; Family Violence</a></li>
            <li className={styles.tocItem}><a href="#h5">5. How to Apply</a></li>
            <li className={styles.tocItem}><a href="#h6">6. Disconnection Protections</a></li>
            <li className={styles.tocItem}><a href="#h7">7. Free Financial Counselling &amp; TIO</a></li>
          </ul>
        </aside>

        {/* Legal Body */}
        <article className={styles.mainBody}>
          {/* Section 1 */}
          <section id="h1" className={styles.section}>
            <h2 className={styles.sectionHeader}>1. What is Financial Hardship?</h2>
            <p className={styles.textParagraph}>
              Under the <em>Telecommunications Consumer Protections Code</em> (TCP C628) and the <strong>ACMA Telecommunications Financial Hardship Standard</strong>, financial hardship refers to a situation where a customer is willing to pay their telecommunications bills but is unable to do so due to illness, unemployment, unexpected emergency, domestic or family violence, natural disaster, or other reasonable causes.
            </p>
            <p className={styles.textParagraph}>
              Financial hardship can be temporary (such as short-term illness or loss of employment) or ongoing. We treat every situation individually and with complete confidentiality.
            </p>
          </section>

          {/* Section 2 */}
          <section id="h2" className={styles.section}>
            <h2 className={styles.sectionHeader}>2. Our Core Principles</h2>
            <p className={styles.textParagraph}>
              When you contact us about financial difficulty, we commit to:
            </p>
            <ul className={styles.bulletList}>
              <li><strong>Dignity &amp; Respect:</strong> We treat you fairly, politely, and without judgment.</li>
              <li><strong>Zero Assessment Fees:</strong> Applying for or receiving financial hardship assistance is completely free. We never charge administration fees for hardship arrangements.</li>
              <li><strong>Confidentiality:</strong> Any personal or financial documentation you share is handled strictly under our Privacy Policy and stored securely.</li>
              <li><strong>Prompt Assessment:</strong> We assess your request and propose a realistic solution within <strong>5 business days</strong> of receiving your application.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="h3" className={styles.section}>
            <h2 className={styles.sectionHeader}>3. How We Can Help (Flexible Options)</h2>
            <p className={styles.textParagraph}>
              We offer multiple options tailored to your circumstances so you can stay connected to loved ones, work, and essential services:
            </p>

            <div className={styles.optionsGrid}>
              <div className={styles.optionCard}>
                <div className={styles.optionTitle}>Payment Extensions</div>
                <div className={styles.optionText}>Temporarily postponing your next auto-pay due date to give you time to get back on track.</div>
              </div>
              <div className={styles.optionCard}>
                <div className={styles.optionTitle}>Interest-Free Payment Plans</div>
                <div className={styles.optionText}>Spreading outstanding amounts into manageable weekly or fortnightly installments with zero interest.</div>
              </div>
              <div className={styles.optionCard}>
                <div className={styles.optionTitle}>Plan Downgrades without Fees</div>
                <div className={styles.optionText}>Switching to a lower-cost plan (such as our $19/month 20GB plan) without any penalty or administrative charge.</div>
              </div>
              <div className={styles.optionCard}>
                <div className={styles.optionTitle}>Spend Management Caps</div>
                <div className={styles.optionText}>Restricting optional add-ons or international features to prevent bill shock or unexpected charges.</div>
              </div>
              <div className={styles.optionCard}>
                <div className={styles.optionTitle}>Waiver of Fees</div>
                <div className={styles.optionText}>Waiving late payment administration fees, reconnection fees, or card payment processing charges.</div>
              </div>
              <div className={styles.optionCard}>
                <div className={styles.optionTitle}>Temporary Service Holds</div>
                <div className={styles.optionText}>Temporarily pausing service while protecting your mobile number from forfeiture or cancellation.</div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="h4" className={styles.section}>
            <h2 className={styles.sectionHeader}>4. Domestic &amp; Family Violence Support</h2>
            <div className={styles.alertBox}>
              <strong>Priority Care:</strong> If you are experiencing domestic or family violence, your physical safety and communication access are paramount. We handle your account with prioritized sensitivity.
            </div>
            <p className={styles.textParagraph}>
              We can help you:
            </p>
            <ul className={styles.bulletList}>
              <li>Safely separate or transfer your mobile service to a new, private account.</li>
              <li>Change your mobile number free of charge with zero disruption.</li>
              <li>Ensure your location and billing address remain completely confidential.</li>
              <li>Exempt you from standard documentation requirements that could compromise your safety.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="h5" className={styles.section}>
            <h2 className={styles.sectionHeader}>5. How to Apply for Assistance</h2>
            <p className={styles.textParagraph}>
              You or your authorized financial counsellor can apply directly through any of the following channels:
            </p>

            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>Hardship Email</div>
                <div className={styles.contactValue}>hardship@justmobile.com.au</div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>Customer Portal</div>
                <div className={styles.contactValue}>justmobile.com.au/account</div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>Operating Hours</div>
                <div className={styles.contactValue}>Mon–Fri, 9:00 AM – 5:00 PM AEST</div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="h6" className={styles.section}>
            <h2 className={styles.sectionHeader}>6. Protection Against Disconnection</h2>
            <p className={styles.textParagraph}>
              While we are assessing your hardship application or while you are actively adhering to an agreed repayment arrangement:
            </p>
            <ul className={styles.bulletList}>
              <li>We will <strong>not</strong> disconnect or restrict your mobile service.</li>
              <li>We will <strong>not</strong> report your account to credit reporting agencies.</li>
              <li>We will <strong>not</strong> refer any debt to external collection agencies.</li>
              <li>Calls to Triple Zero (000) and emergency services will remain active at all times.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="h7" className={styles.section}>
            <h2 className={styles.sectionHeader}>7. Free Financial Counselling &amp; Ombudsman</h2>
            <p className={styles.textParagraph}>
              If you are facing financial distress, you can speak with an independent, qualified financial counsellor anywhere in Australia for free:
            </p>

            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>National Debt Helpline</div>
                <div className={styles.contactValue}>1800 007 007 (Free call)</div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>Website</div>
                <div className={styles.contactValue}>ndh.org.au</div>
              </div>
            </div>

            <div className={styles.tioBox}>
              <div className={styles.tioTitle}>Telecommunications Industry Ombudsman (TIO)</div>
              <p className={styles.tioContent}>
                If you are dissatisfied with our financial hardship assessment or feel we have not complied with the ACMA Financial Hardship Standard, you may contact the independent <strong>Telecommunications Industry Ombudsman</strong>:
              </p>
              <div className={styles.contactGrid}>
                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}>TIO Phone</div>
                  <div className={styles.contactValue}>1800 062 058 (Free call)</div>
                </div>
                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}>TIO Online</div>
                  <div className={styles.contactValue}>www.tio.com.au</div>
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
