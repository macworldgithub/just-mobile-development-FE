'use strict';
'use client';

import React from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

interface HeroProps {
  onFindPlan: () => void;
  onShopPhones: () => void;
  onConfigureFlagship: () => void;
}

export default function Hero({
  onFindPlan,
  onShopPhones,
  onConfigureFlagship,
}: HeroProps) {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        {/* Left Column: Copy & CTAs */}
        <div className={styles.copyColumn}>
          {/* Kicker badge */}
          <div className={styles.kicker}>
            <span className={styles.kickerDot}></span>
            <span className={styles.kickerText}>HELLO, A BETTER KIND OF MOBILE.</span>
          </div>

          {/* Main Headline */}
          <h1 className={styles.headline}>
            Less telco.
            <br />
            More{' '}
            <span className={styles.highlightWord}>
              you.
              <svg
                className={styles.curvedUnderline}
                viewBox="0 0 170 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M3 12.5C45 4.5 125 4.5 167 13.5"
                  stroke="#D5F879"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p className={styles.subheadline}>
            Great phones. Straightforward plans.
            <br />
            A fresh mobile experience that puts you first.
          </p>

          {/* CTA Buttons */}
          <div className={styles.ctaGroup}>
            <button
              type="button"
              className={styles.primaryCta}
              onClick={onFindPlan}
            >
              <span>Find my plan</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button
              type="button"
              className={styles.secondaryCta}
              onClick={onShopPhones}
            >
              <span>Shop phones</span>
              <span className={styles.diagonalArrow}>↗</span>
            </button>
          </div>

          {/* Pricing anchor and disclaimer */}
          <div className={styles.pricingAnchor}>
            <div className={styles.anchorRow}>
              <span className={styles.anchorPriceLabel}>Plans from</span>
              <strong className={styles.anchorPriceValue}>$19</strong>
              <span className={styles.anchorUnit}>/month*</span>
              <span className={styles.anchorDivider}>|</span>
              <span className={styles.anchorTagline}>More life. Less overthinking.</span>
            </div>
            <p className={styles.anchorFineprint}>
              *Month-to-month plans with no lock-in contract. Explore details below.
            </p>
          </div>
        </div>

        {/* Right Column: Hero Flagship Handset Card */}
        <div className={styles.cardColumn}>
          <div className={styles.flagshipCard}>
            {/* Background Organic Lime Shape */}
            <div className={styles.limeBackdrop}></div>

            {/* Top info row */}
            <div className={styles.cardHeader}>
              <div className={styles.badgePill}>
                <span>YOUR NEXT CHAPTER</span>
              </div>
              <div className={styles.networkBadge}>
                <span>5G + eSIM</span>
                <svg
                  className={styles.signalIcon}
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="12" x2="3" y2="10" />
                  <line x1="7" y1="12" x2="7" y2="7" />
                  <line x1="11" y1="12" x2="11" y2="4" />
                  <line x1="15" y1="12" x2="15" y2="1" />
                </svg>
              </div>
            </div>

            {/* Device Title & Variant */}
            <div className={styles.deviceMeta}>
              <span className={styles.deviceBrand}>Samsung</span>
              <h2 className={styles.deviceName}>
                Galaxy S26
                <br />
                Ultra
              </h2>
              <span className={styles.deviceVariant}>512GB · Black</span>
            </div>

            {/* Cutout Phone & Pen Visual */}
            <div className={styles.visualContainer} onClick={onConfigureFlagship} style={{ cursor: 'pointer' }}>
              <Image
                src="/brand/images/galaxy-s26-ultra-hero-cutout.png"
                alt="Samsung Galaxy S26 Ultra 512GB in Black with S-Pen"
                width={420}
                height={480}
                priority
                className={styles.cutoutImage}
              />
            </div>

            {/* Floating Price Pill / Action Card */}
            <div className={styles.floatingPriceCard}>
              <div className={styles.priceInfo}>
                <span className={styles.pricePlanLabel}>PHONE + 50GB PLAN</span>
                <div className={styles.priceAmountRow}>
                  <strong className={styles.priceAmount}>$91.63</strong>
                  <span className={styles.pricePeriod}>/mth*</span>
                </div>
                <span className={styles.priceOutrightNote}>Or $2,399 outright.</span>
              </div>
              <button
                type="button"
                className={styles.configurePillBtn}
                onClick={onConfigureFlagship}
                aria-label="Configure Galaxy S26 Ultra"
              >
                <span>↗</span>
              </button>
            </div>

            {/* Card fine print */}
            <p className={styles.cardFineprint}>
              *Based on 36-month term with $0 upfront. Total cost $3,299.00 over 36 months including 50GB mobile plan. Final payment adjusts rounding.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
