'use strict';
'use client';

import React from 'react';
import Image from 'next/image';
import styles from './Footer.module.css';

interface FooterProps {
  onNavigateSection?: (id: string) => void;
}

export default function Footer({ onNavigateSection }: FooterProps) {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Top Area: Brand & 3 Link Columns */}
        <div className={styles.footerMain}>
          <div className={styles.brandCol}>
            <Image
              src="/brand/logos/justmobile-wordmark-light.svg"
              alt="JustMobile"
              width={160}
              height={36}
              className={styles.footerLogo}
            />
            <p className={styles.brandMotto}>
              A little less telco.
              <br />
              A lot more you.
            </p>
          </div>

          <div className={styles.footerLinks}>
            {/* Column 1 */}
            <div className={styles.linkCol}>
              <h4 className={styles.linkHeader}>Find your just</h4>
              <a href="#plans" onClick={(e) => handleNav(e, 'plans')}>
                Mobile plans
              </a>
              <a href="#phones" onClick={(e) => handleNav(e, 'phones')}>
                Shop phones
              </a>
              <a href="#network" onClick={(e) => handleNav(e, 'network')}>
                Our network
              </a>
            </div>

            {/* Column 2 */}
            <div className={styles.linkCol}>
              <h4 className={styles.linkHeader}>We&apos;re here to help</h4>
              <a href="#help" onClick={(e) => handleNav(e, 'help')}>
                Common questions
              </a>
              <a href="#bele" onClick={(e) => handleNav(e, 'bele')}>
                Meet Bele AI
              </a>
              <a
                href="mailto:support@justmobile.com.au"
                className={styles.contactBtn}
              >
                <span>Contact us</span>
                <span className={styles.arrowIcon}>↗</span>
              </a>
            </div>

            {/* Column 3 */}
            <div className={styles.linkCol}>
              <h4 className={styles.linkHeader}>The important stuff</h4>
              <button
                type="button"
                className={styles.dialogTriggerBtn}
                onClick={() =>
                  alert(
                    'Critical Information Summaries (CIS) will be officially approved and published before live commercial launch.'
                  )
                }
              >
                Critical information
              </button>
              <button
                type="button"
                className={styles.dialogTriggerBtn}
                onClick={() =>
                  alert(
                    'Terms & privacy policy conform to Australian Privacy Principles (APP 11) and ACMA consumer protection guidelines.'
                  )
                }
              >
                Terms &amp; privacy
              </button>
              <button
                type="button"
                className={styles.dialogTriggerBtn}
                onClick={() =>
                  alert(
                    'Financial Hardship policy conforms to Telecommunications Consumer Protections Code (C628).'
                  )
                }
              >
                Financial assistance
              </button>
            </div>
          </div>
        </div>

        {/* Middle Giant Wordmark Banner matching Image 1 */}
        <div className={styles.footerWordmark} aria-hidden="true">
          <span className={styles.wordmarkLime}>just more</span>
          <span className={styles.wordmarkMuted}>mobile.</span>

          {/* 4-petal flower brandmark */}
          <div className={styles.flowerMark}>
            <div className={styles.petal}></div>
            <div className={styles.petal}></div>
            <div className={styles.petal}></div>
            <div className={styles.petal}></div>
          </div>
        </div>

        {/* Bottom Disclosures */}
        <div className={styles.footerDisclosure}>
          <p>
            <b>Fair, transparent pricing.</b> All prices in AUD including GST. Handset outright purchases and flexible instalment terms are available on selected models. Handsets come with full Australian manufacturer warranty and express dispatch. Standard terms, Fair Use Policy, and Critical Information Summaries apply to all mobile services.
          </p>
          <p>
            JustMobile mobile services are powered by the Telstra Wholesale Mobile
            Network. Coverage depends on your location, device and conditions. 5G requires a
            compatible device, eligible plan and coverage. We acknowledge the
            Traditional Custodians of the lands on which we live and connect, and
            pay respect to Elders past and present.
          </p>
        </div>

        {/* Footer Bottom Line */}
        <div className={styles.footerBottom}>
          <span>© 2026 JustMobile. Just more possibility.</span>
          <a
            href="https://www.telstrawholesale.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.madeForAu}
          >
            <span>Made for Australia</span>
            <span className={styles.arrowIcon}>↗</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
