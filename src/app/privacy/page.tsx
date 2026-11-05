'use strict';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './privacy.module.css';

export const metadata = {
  title: 'Privacy Policy | JustMobile',
  description: 'How JustMobile collects, protects, uses, and discloses personal information under the Australian Privacy Principles (Privacy Act 1988 Cth).',
};

export default function PrivacyPage() {
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
            <Link href="/privacy" className={`${styles.navLink} ${styles.activeNavLink}`}>
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
          <span className={styles.badge}>PRIVACY ACT 1988 (CTH) · AUSTRALIAN PRIVACY PRINCIPLES (APP 11)</span>
          <h1 className={styles.heroTitle}>Privacy Policy &amp; Data Protection</h1>
          <p className={styles.heroSub}>
            We respect your privacy. Here is an open look at what information we collect, why we need it, and how we safeguard your identity.
          </p>
          <div className={styles.heroMeta}>
            Last updated: 4 November 2026 · Compliant with APP 1 through 13
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className={styles.contentContainer}>
        {/* Table of Contents Sidebar */}
        <aside className={styles.tocSidebar}>
          <div className={styles.tocTitle}>Contents</div>
          <ul className={styles.tocList}>
            <li className={styles.tocItem}><a href="#p1">1. Our Commitment</a></li>
            <li className={styles.tocItem}><a href="#p2">2. What We Collect</a></li>
            <li className={styles.tocItem}><a href="#p3">3. How Information is Collected</a></li>
            <li className={styles.tocItem}><a href="#p4">4. Integrated Public Number Database</a></li>
            <li className={styles.tocItem}><a href="#p5">5. Data Security (APP 11)</a></li>
            <li className={styles.tocItem}><a href="#p6">6. Disclosure &amp; Third Parties</a></li>
            <li className={styles.tocItem}><a href="#p7">7. Access &amp; Correction Rights</a></li>
            <li className={styles.tocItem}><a href="#p8">8. Privacy Enquiries &amp; OAIC</a></li>
          </ul>
        </aside>

        {/* Legal Text Body */}
        <article className={styles.mainBody}>
          {/* Section 1 */}
          <section id="p1" className={styles.section}>
            <h2 className={styles.sectionHeader}>1. Our Commitment to Your Privacy</h2>
            <p className={styles.textParagraph}>
              <strong>JustMobile Pty Ltd</strong> (ABN 48 672 819 204) is committed to protecting the privacy and confidentiality of our customers. We are bound by the <em>Privacy Act 1988</em> (Cth) and the thirteen <strong>Australian Privacy Principles (APPs)</strong>.
            </p>
            <p className={styles.textParagraph}>
              This Privacy Policy explains how we collect, hold, use, disclose, and secure your personal information when you use our mobile SIM/eSIM services, purchase handsets, access our Customer Portal, or interact with our support teams.
            </p>
          </section>

          {/* Section 2 */}
          <section id="p2" className={styles.section}>
            <h2 className={styles.sectionHeader}>2. Information We Collect</h2>
            <p className={styles.textParagraph}>
              We collect information that is reasonably necessary to provide telecommunications services, fulfill statutory verification requirements, and ensure network security:
            </p>
            <ul className={styles.bulletList}>
              <li><strong>Contact &amp; Identification Data:</strong> Your full legal name, residential address, date of birth, contact email address, and primary telephone number.</li>
              <li><strong>Statutory Proof of Identity:</strong> Australian Driver’s Licence, Medicare Card, or Passport details used solely to fulfill ACMA customer verification mandates.</li>
              <li><strong>Network &amp; Telecommunications Usage:</strong> Call detail records (CDRs), SMS transaction timestamps, data consumption volumes, IP addresses assigned to your device, and cell tower interaction logs required by Australian metadata laws.</li>
              <li><strong>Payment &amp; Billing Records:</strong> Stored tokenized payment references (never raw credit card numbers or CVV codes), transaction history, and invoice records.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="p3" className={styles.section}>
            <h2 className={styles.sectionHeader}>3. How We Collect Your Information</h2>
            <p className={styles.textParagraph}>
              Where possible, we collect personal information directly from you when you:
            </p>
            <ul className={styles.bulletList}>
              <li>Register an account or purchase a mobile plan on our website.</li>
              <li>Request a mobile number transfer (port-in) from another carrier.</li>
              <li>Log in to your Customer Portal or contact our customer support team.</li>
              <li>Interact with our network infrastructure during normal device usage.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="p4" className={styles.section}>
            <h2 className={styles.sectionHeader}>4. Integrated Public Number Database (IPND)</h2>
            <div className={styles.alertBox}>
              <strong>Statutory Requirement:</strong> Under Part 4 of the <em>Telecommunications Act 1997</em>, telecommunications providers must disclose each customer’s name, phone number, and physical residential address to the <strong>Integrated Public Number Database (IPND)</strong>.
            </div>
            <p className={styles.textParagraph}>
              The IPND is an industry-wide database used primarily by emergency services (Triple Zero 000 operators, police, ambulance, and fire rescue) to determine the physical location of a caller in an emergency. It is also used by national emergency alert systems and authorized law enforcement agencies.
            </p>
          </section>

          {/* Section 5 */}
          <section id="p5" className={styles.section}>
            <h2 className={styles.sectionHeader}>5. Data Security &amp; Storage (APP 11)</h2>
            <p className={styles.textParagraph}>
              Under <strong>Australian Privacy Principle 11</strong>, we take all reasonable technical and organizational steps to protect personal information from misuse, interference, loss, unauthorized access, modification, or disclosure:
            </p>
            <ul className={styles.bulletList}>
              <li><strong>Encryption:</strong> All data transmissions between your browser and our servers use Transport Layer Security (TLS 1.3). Sensitive credentials and profile records are encrypted at rest using AES-256.</li>
              <li><strong>Zero Plaintext Passwords:</strong> Passwords are never stored in plain text; they are irreversibly hashed using salted <code>bcrypt</code> algorithms.</li>
              <li><strong>Payment Tokenization:</strong> Payment processing is fully offloaded to PCI-DSS Level 1 certified gateways (Westpac Quickstream). No credit card numbers are ever stored on JustMobile servers.</li>
              <li><strong>Access Control:</strong> Backend access is governed by strict role-based access control (RBAC), multi-factor authentication, and audited access logs.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="p6" className={styles.section}>
            <h2 className={styles.sectionHeader}>6. Disclosure to Third Parties</h2>
            <p className={styles.textParagraph}>
              We do <strong>not</strong> sell, rent, or trade your personal information to third-party advertisers. We disclose information only to organizations essential for delivering your mobile service:
            </p>
            <ul className={styles.bulletList}>
              <li><strong>Wholesale Carrier Partners:</strong> Telcoinabox / Octane and the Telstra Wholesale Network to provision and manage your mobile SIM/eSIM and network connectivity.</li>
              <li><strong>Hardware Distributors:</strong> Leader Computers to fulfill physical handset orders and manage courier delivery to your address.</li>
              <li><strong>Payment Processors:</strong> Westpac Quickstream for processing authorized monthly service charges.</li>
              <li><strong>Law Enforcement &amp; Emergency Authorities:</strong> As authorized or required by Australian law (e.g. warrants under the <em>Telecommunications (Interception and Access) Act 1979</em>).</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="p7" className={styles.section}>
            <h2 className={styles.sectionHeader}>7. Access &amp; Correction Rights</h2>
            <p className={styles.textParagraph}>
              Under APPs 12 and 13, you have the right to request access to the personal information we hold about you and to ask for corrections if you believe it is inaccurate, out of date, or incomplete.
            </p>
            <p className={styles.textParagraph}>
              You can review and update most of your contact details directly inside your Customer Portal at any time, or by emailing our Privacy Officer.
            </p>
          </section>

          {/* Section 8 */}
          <section id="p8" className={styles.section}>
            <h2 className={styles.sectionHeader}>8. Privacy Enquiries &amp; OAIC Escalation</h2>
            <p className={styles.textParagraph}>
              If you have any questions about this Privacy Policy or wish to lodge a privacy complaint, please contact our team:
            </p>

            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>Privacy Officer</div>
                <div className={styles.contactValue}>privacy@justmobile.com.au</div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>Mailing Address</div>
                <div className={styles.contactValue}>JustMobile Pty Ltd, Sydney NSW 2000</div>
              </div>
            </div>

            <p className={styles.textParagraph} style={{ marginTop: '20px' }}>
              If you are not satisfied with our response to your privacy complaint, you may escalate the matter to the <strong>Office of the Australian Information Commissioner (OAIC)</strong>:
            </p>
            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>OAIC Telephone</div>
                <div className={styles.contactValue}>1300 363 992</div>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>OAIC Website</div>
                <div className={styles.contactValue}>www.oaic.gov.au</div>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}

