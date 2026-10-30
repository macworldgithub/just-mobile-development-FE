'use strict';
'use client';

import React from 'react';
import Image from 'next/image';
import styles from './NetworkSection.module.css';

export default function NetworkSection() {
  return (
    <section id="network" className={styles.networkSection}>
      <div className={styles.container}>
        <div className={styles.networkGrid}>
          {/* Left Column: Visual Photo Card */}
          <div className={styles.photoCard}>
            <Image
              src="/brand/images/australian-coast.jpeg"
              alt="Coastline in Western Australia"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className={styles.coastImage}
            />
            {/* Top Badge */}
            <div className={styles.locationBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Western Australia</span>
            </div>

            {/* Bottom Overlay Label */}
            <div className={styles.photoOverlayLabel}>
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="12" x2="3" y2="10" stroke="#d5f879" />
                <line x1="7" y1="12" x2="7" y2="7" stroke="#d5f879" />
                <line x1="11" y1="12" x2="11" y2="4" stroke="#d5f879" />
                <line x1="15" y1="12" x2="15" y2="1" stroke="#d5f879" />
              </svg>
              <div className={styles.overlayText}>
                <strong>A big country.</strong>
                <span>A trusted wholesale network.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Coverage Checker */}
          <div className={styles.copyCol}>
            <span className={styles.eyebrow}>FOR YOUR CORNER OF AUSTRALIA.</span>
            <h2 className={styles.title}>
              Big network.
              <br />
              Fresh perspective.
            </h2>
            <p className={styles.description}>
              Our mobile service is powered by the Telstra Wholesale Mobile Network.
              Familiar high-speed infrastructure. A refreshingly straightforward experience.
            </p>

            <div className={styles.statBlock}>
              <strong className={styles.statNumber}>1.4M+</strong>
              <span className={styles.statLabel}>
                square kilometres in the
                <br />
                Telstra Wholesale coverage footprint
              </span>
            </div>

            <div className={styles.ctaWrap}>
              <a
                href="https://www.telstrawholesale.com.au/our-network/coverage.html"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.checkCoverageBtn}
              >
                <span>Check your coverage</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>

            <p className={styles.disclaimer}>
              Opens the official predicted outdoor coverage map. Coverage varies by location, device and conditions.
              The wholesale footprint differs from Telstra retail coverage; maps are a guide, not a guarantee.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
