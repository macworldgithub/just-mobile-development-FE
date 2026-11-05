'use strict';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './terms.module.css';

export const metadata = {
  title: 'Terms of Service & Fair Use Policy | JustMobile',
  description: 'Statutory service terms, month-to-month contract terms, and fair use guidelines for JustMobile mobile and broadband services in Australia.',
};

export default function TermsPage() {
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
            <Link href="/terms" className={`${styles.navLink} ${styles.activeNavLink}`}>
              Terms of Service
            </Link>
            <Link href="/privacy" className={styles.navLink}>
              Privacy Policy
            </Link>
            <Link href="/hardship" className={styles.navLink}>
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
          <span className={styles.badge}>ACMA TELECOMMUNICATIONS CODE C628 COMPLIANT</span>
          <h1 className={styles.heroTitle}>Standard Form of Agreement &amp; Terms of Service</h1>
          <p className={styles.heroSub}>
            Clear, honest terms. Month-to-month flexibility without lock-in contracts or exit penalties.
          </p>
          <div className={styles.heroMeta}>
            Last updated: 4 November 2026 · Effective for all consumer services
          </div>
        </div>
      </section>

      {/* Content Layout */}
      <main className={styles.contentContainer}>
        {/* Table of Contents Sticky Sidebar */}
        <aside className={styles.tocSidebar}>
          <div className={styles.tocTitle}>Contents</div>
          <ul className={styles.tocList}>
            <li className={styles.tocItem}><a href="#s1">1. The Agreement</a></li>
            <li className={styles.tocItem}><a href="#s2">2. Month-to-Month Flexibility</a></li>
            <li className={styles.tocItem}><a href="#s3">3. Network Access &amp; Speeds</a></li>
            <li className={styles.tocItem}><a href="#s4">4. Plan Inclusions &amp; Exclusions</a></li>
            <li className={styles.tocItem}><a href="#s5">5. Data Banking &amp; Rollover</a></li>
            <li className={styles.tocItem}><a href="#s6">6. Fair Use Policy</a></li>
            <li className={styles.tocItem}><a href="#s7">7. Billing &amp; Auto-Pay</a></li>
            <li className={styles.tocItem}><a href="#s8">8. Mobile Number Transfers</a></li>
            <li className={styles.tocItem}><a href="#s9">9. Emergency Calls (000 / 112)</a></li>
            <li className={styles.tocItem}><a href="#s10">10. Complaints &amp; TIO Escalation</a></li>
          </ul>
        </aside>

        {/* Main Body */}
        <article className={styles.mainBody}>
          {/* Section 1 */}
          <section id="s1" className={styles.section}>
            <h2 className={styles.sectionHeader}>1. The Agreement</h2>
            <p className={styles.textParagraph}>
              This Standard Form of Agreement (SFOA) sets out the terms under which <strong>JustMobile Pty Ltd</strong> (ABN 48 672 819 204) provides telecommunications goods and services to retail consumer customers across Australia.
            </p>
            <p className={styles.textParagraph}>
              By completing an order, selecting a mobile plan, scanning an eSIM profile, or paying a monthly service invoice, you agree to be bound by these terms, our Critical Information Summaries (CIS), and the Telecommunications Consumer Protections Code (TCP Code C628).
            </p>
          </section>

          {/* Section 2 */}
          <section id="s2" className={styles.section}>
            <h2 className={styles.sectionHeader}>2. Month-to-Month Flexibility &amp; Cancellation</h2>
            <p className={styles.textParagraph}>
              All JustMobile mobile plans operate on a <strong>month-to-month recurring basis</strong>. There is no lock-in contract.
            </p>
            <ul className={styles.bulletList}>
              <li><strong>Zero Early Termination Fees:</strong> You may cancel your mobile service at any time through your Customer Portal without paying an exit penalty or cancellation charge.</li>
              <li><strong>Billing Cycle Alignment:</strong> Service fees are billed on the 28th of each calendar month. Cancellations take effect at the conclusion of your current paid billing period.</li>
              <li><strong>Pre-paid Device Balances:</strong> If you purchased a handset under an outright or separate device instalment agreement, cancellation of your mobile plan does not relieve you of any remaining physical device balance owed.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="s3" className={styles.section}>
            <h2 className={styles.sectionHeader}>3. Network Access &amp; Coverage</h2>
            <p className={styles.textParagraph}>
              JustMobile services are powered by the <strong>Telstra Wholesale Mobile Network</strong>. Coverage reaches more than 98.8% of the Australian population.
            </p>
            <div className={styles.alertBox}>
              <strong>5G &amp; 4G Network Speeds:</strong> Download and upload speeds vary depending on your device hardware, network traffic, physical obstructions (e.g. terrain, tunnels, reinforced concrete), and distance from the mobile cell tower. Access to 5G requires an active 5G-compatible smartphone in a 5G coverage area.
            </div>
          </section>

          {/* Section 4 */}
          <section id="s4" className={styles.section}>
            <h2 className={styles.sectionHeader}>4. Plan Inclusions &amp; Exclusions</h2>
            <p className={styles.textParagraph}>
              <strong>Included Standard Features:</strong> Every JustMobile plan includes unlimited standard national calls, SMS, and MMS to standard Australian mobile and fixed landline numbers (including 13, 1300, and 1800 numbers), plus voicemail deposits and retrieval.
            </p>
            <p className={styles.textParagraph}>
              <strong>Excluded Services:</strong> Unless explicitly purchased through an authorized optional add-on pack, your service plan excludes:
            </p>
            <ul className={styles.bulletList}>
              <li>Calls and texts to international destinations.</li>
              <li>International mobile roaming while travelling outside Australia.</li>
              <li>Premium rate services, premium SMS, and 1900 numbers.</li>
              <li>Satellite telecommunications numbers and operator directory assistance (1223).</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="s5" className={styles.section}>
            <h2 className={styles.sectionHeader}>5. Data Banking &amp; Rollover</h2>
            <p className={styles.textParagraph}>
              Unused data from your standard monthly allowance automatically rolls over into your <strong>Data Bank</strong> at the end of each billing cycle, subject to the following rules:
            </p>
            <ul className={styles.bulletList}>
              <li><strong>Accumulation Limits:</strong> You can bank up to a maximum of <strong>200 GB</strong> (on the 20GB plan) or <strong>500 GB</strong> (on 50GB and 100GB plans).</li>
              <li><strong>Auto-Draw Priority:</strong> During any billing cycle, your service will first draw down from your monthly plan allowance. If your monthly allowance is depleted, your phone will automatically draw from your banked data balance with no speed throttling.</li>
              <li><strong>Forfeiture on Cancellation:</strong> If you cancel your service or your account is terminated for non-payment, any banked data balance is forfeited and has zero monetary or redeemable cash value.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="s6" className={styles.section}>
            <h2 className={styles.sectionHeader}>6. Fair Use Policy</h2>
            <p className={styles.textParagraph}>
              Our mobile services are provided strictly for <strong>personal, consumer residential use</strong>. Our network must remain fast, reliable, and equitable for all customers.
            </p>
            <p className={styles.textParagraph}>
              You must not use your JustMobile SIM or eSIM service for:
            </p>
            <ul className={styles.bulletList}>
              <li>Commercial telemarketing, automated robo-calling, or mass commercial broadcast SMS.</li>
              <li>SIM-boxing, transit gateways, or operating an unauthorized telecommunications resale business.</li>
              <li>Unattended continuous connections or data tethering farms that degrade network cell performance.</li>
              <li>Any activity that is illegal, defamatory, fraudulent, or violates Australian law.</li>
            </ul>
            <p className={styles.textParagraph}>
              If we detect a material breach of this Fair Use Policy, we will issue a warning and may temporarily suspend or restrict the offending service.
            </p>
          </section>

          {/* Section 7 */}
          <section id="s7" className={styles.section}>
            <h2 className={styles.sectionHeader}>7. Billing, Invoicing &amp; Auto-Pay</h2>
            <p className={styles.textParagraph}>
              Services are billed on the <strong>28th day of each month</strong>. Payment is processed automatically using your stored credit card, debit card, or pre-authorized direct debit account via our PCI-DSS compliant payment gateway.
            </p>
            <p className={styles.textParagraph}>
              Itemized tax invoices are delivered to your registered email address and made available in the JustMobile Customer Portal immediately upon issuance. If an auto-pay payment fails, we will send an SMS and email notification and retry collection over 5 business days before service restriction.
            </p>
          </section>

          {/* Section 8 */}
          <section id="s8" className={styles.section}>
            <h2 className={styles.sectionHeader}>8. Mobile Number Transfers &amp; ACMA Verification</h2>
            <p className={styles.textParagraph}>
              You have the right to port your existing Australian mobile number to or from JustMobile under the Mobile Number Portability Industry Code (C570).
            </p>
            <p className={styles.textParagraph}>
              In compliance with <strong>ACMA Anti-Fraud Regulations</strong>, you must undergo identity verification via a one-time SMS security code sent to your existing mobile before any transfer request is submitted to donor carriers.
            </p>
          </section>

          {/* Section 9 */}
          <section id="s9" className={styles.section}>
            <h2 className={styles.sectionHeader}>9. Emergency Calls (000 / 112) &amp; IPND</h2>
            <div className={styles.alertBox}>
              <strong>Free Emergency Access:</strong> Calls to Triple Zero (000) and GSM 112 are always free and unrestricted. They can be placed even if your plan has zero balance, is out of data, or is temporarily restricted for billing.
            </div>
            <p className={styles.textParagraph}>
              Under the <em>Telecommunications Act 1997</em>, JustMobile must provide your customer name, service number, and residential address to the <strong>Integrated Public Number Database (IPND)</strong> to enable emergency service operators (police, ambulance, fire) to pinpoint your physical location during an emergency.
            </p>
          </section>

          {/* Section 10 */}
          <section id="s10" className={styles.section}>
            <h2 className={styles.sectionHeader}>10. Customer Support &amp; Ombudsman Escalation</h2>
            <p className={styles.textParagraph}>
              We aim to resolve all enquiries and issues promptly through our Australian support team. If you ever experience an issue, contact us directly:
            </p>

            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>Customer Support</div>
                <div className={styles.contactValue}>support@justmobile.com.au</div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>Customer Portal</div>
                <div className={styles.contactValue}>justmobile.com.au/account</div>
              </div>
            </div>

            <div className={styles.tioBox}>
              <div className={styles.tioTitle}>Telecommunications Industry Ombudsman (TIO)</div>
              <p className={styles.tioContent}>
                If you have raised a complaint with us and feel it has not been resolved satisfactorily, you have the statutory right to escalate the matter to the independent <strong>Telecommunications Industry Ombudsman (TIO)</strong>:
              </p>
              <div className={styles.contactGrid}>
                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}>TIO Phone</div>
                  <div className={styles.contactValue}>1800 062 058 (Free call)</div>
                </div>
                <div className={styles.contactItem}>
                  <div className={styles.contactLabel}>TIO Website</div>
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

