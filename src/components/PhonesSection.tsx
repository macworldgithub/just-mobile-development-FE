'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import styles from './PhonesSection.module.css';
import { HANDSETS, Handset, calculateRepayments, formatCurrency } from '@/data/catalogue';

interface PhonesSectionProps {
  onConfigurePhone: (phone: Handset, initialMode?: 'outright' | 'instalments' | 'phone_and_plan') => void;
  initialPhones?: Handset[];
}

export default function PhonesSection({ onConfigurePhone, initialPhones }: PhonesSectionProps) {
  const [phones, setPhones] = useState<Handset[]>(initialPhones || HANDSETS);
  const [activeBrand, setActiveBrand] = useState<string>('All phones');
  const [priceMode, setPriceMode] = useState<'outright' | 'bundle'>('outright');

  // Fetch handsets from MongoDB API
  useEffect(() => {
    fetch('/api/handsets')
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setPhones(data.data);
        }
      })
      .catch((err) => console.error('Failed to load handsets from DB:', err));
  }, []);

  const filteredPhones = phones.filter((p) => {
    if (activeBrand === 'All phones') return true;
    return p.brand === activeBrand;
  });

  return (
    <section id="phones" className={styles.shopSection}>
      <div className={styles.container}>
        {/* Section Heading */}
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>NEW PHONES. FRESH POSSIBILITIES.</span>
            <h2 className={styles.title}>
              A phone you love.
              <br />
              A price that feels right.
            </h2>
            <p className={styles.subtitle}>
              A considered selection from Samsung and Google.
              <br className={styles.desktopBreak} /> Buy outright, spread the cost, or make it a phone + plan.
            </p>
          </div>
          <a
            href="#phones"
            className={styles.exploreLink}
            onClick={(e) => {
              e.preventDefault();
              setActiveBrand('All phones');
            }}
          >
            <span>Explore phones</span>
            <span className={styles.diagonalArrow}>↗</span>
          </a>
        </div>

        {/* Shop Controls: Filter Tabs & Price Display Switch */}
        <div className={styles.shopControls}>
          <div className={styles.brandFilters} role="tablist" aria-label="Filter by brand">
            {['All phones', 'Samsung', 'Google'].map((brand) => (
              <button
                key={brand}
                type="button"
                role="tab"
                aria-pressed={activeBrand === brand}
                className={`${styles.filterBtn} ${activeBrand === brand ? styles.filterSelected : ''}`}
                onClick={() => setActiveBrand(brand)}
              >
                {brand}
              </button>
            ))}
          </div>

          <div className={styles.priceDisplayToggle}>
            <span className={styles.priceToggleLabel}>Show price</span>
            <div className={styles.toggleButtonsGroup}>
              <button
                type="button"
                aria-pressed={priceMode === 'outright'}
                className={`${styles.toggleBtn} ${priceMode === 'outright' ? styles.toggleSelected : ''}`}
                onClick={() => setPriceMode('outright')}
              >
                Outright
              </button>
              <button
                type="button"
                aria-pressed={priceMode === 'bundle'}
                className={`${styles.toggleBtn} ${priceMode === 'bundle' ? styles.toggleSelected : ''}`}
                onClick={() => setPriceMode('bundle')}
              >
                Phone + plan
              </button>
            </div>
          </div>
        </div>

        {/* Phone Cards Grid */}
        <div className={styles.phoneGrid}>
          {filteredPhones.map((phone) => {
            // 36 months, 0 upfront, 50GB plan ($25)
            const bundleRepay = calculateRepayments(phone.price, 36, 0, 25);
            const discount = phone.rrp - phone.price;

            return (
              <article key={phone.id} className={styles.phoneCard}>
                {/* Visual Area with Tilt Animation */}
                <div className={styles.cardVisual}>
                  <span className={styles.phoneBadge}>{phone.label}</span>

                  <button
                    type="button"
                    className={styles.imageButton}
                    aria-label={`Explore ${phone.name}`}
                    onClick={() => onConfigurePhone(phone, priceMode === 'outright' ? 'outright' : 'phone_and_plan')}
                  >
                    <img
                      src={phone.image}
                      alt={`${phone.brand} ${phone.name}, ${phone.colour}`}
                      loading="lazy"
                      className={styles.phoneImage}
                    />
                  </button>

                  <span className={styles.colourIndicator}>
                    <i
                      className={styles.colourDot}
                      style={{ background: phone.colourHex }}
                    ></i>
                    <span>{phone.colour}</span>
                  </span>
                </div>

                {/* Card Body */}
                <div className={styles.cardBody}>
                  <span className={styles.phoneBrand}>{phone.brand}</span>
                  <h3 className={styles.phoneName}>{phone.name}</h3>
                  <span className={styles.phoneStorage}>
                    {phone.storage} · 5G · eSIM{phone.note ? ` · ${phone.note}` : ''}
                  </span>

                  {/* Price display row */}
                  <div className={styles.phonePrice}>
                    {priceMode === 'outright'
                      ? formatCurrency(phone.price)
                      : formatCurrency(bundleRepay.monthly, 2)}
                    <span className={styles.priceUnit}>
                      {priceMode === 'outright' ? 'outright' : '/month*'}
                    </span>
                  </div>

                  {/* Price detail subtext */}
                  <p className={styles.phonePriceDetail}>
                    {priceMode === 'outright' ? (
                      <>
                        Listed RRP <s>{formatCurrency(phone.rrp)}</s>{' '}
                        <b className={styles.savingsTag}>{formatCurrency(discount)} less</b>
                      </>
                    ) : (
                      <>
                        Phone + 50GB plan.
                        <br />
                        36 months; {formatCurrency(bundleRepay.termTotal, 2)} full-term illustration.
                      </>
                    )}
                  </p>

                  {/* Explore button */}
                  <button
                    type="button"
                    className={styles.exploreBtn}
                    onClick={() => onConfigurePhone(phone, priceMode === 'outright' ? 'outright' : 'phone_and_plan')}
                  >
                    <span>Explore phone</span>
                    <span className={styles.buttonArrow}>↗</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Section Fineprint */}
        <p className={styles.sectionFineprint}>
          All handset prices include GST. Outright purchases and instalment terms (12, 24, 36 months) available with optional upfront contributions.{' '}
          {priceMode === 'bundle'
            ? 'Monthly bundle includes your device instalment and mobile plan. Final payment adjusts rounding.'
            : 'Genuine Australian stock with manufacturer warranty and free express delivery Australia-wide.'}
        </p>
      </div>
    </section>
  );
}
