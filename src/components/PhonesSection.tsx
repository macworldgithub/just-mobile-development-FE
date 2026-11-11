'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import styles from './PhonesSection.module.css';
import { HANDSETS, Handset, formatCurrency } from '@/data/catalogue';

interface PhonesSectionProps {
  onConfigurePhone: (phone: Handset, initialMode?: 'outright' | 'instalments' | 'phone_and_plan') => void;
  initialPhones?: Handset[];
}

export default function PhonesSection({ onConfigurePhone, initialPhones }: PhonesSectionProps) {
  const [phones, setPhones] = useState<Handset[]>(initialPhones || HANDSETS);
  const [activeBrand, setActiveBrand] = useState<string>('All phones');

  // Fetch handsets from MongoDB API
  useEffect(() => {
    fetch('/api/handsets')
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          const normalized: Handset[] = data.data.map((p: any) => ({
            ...p,
            color: p.color || p.colour || 'Black',
            colour: p.colour || p.color || 'Black',
            outrightPrice: p.outrightPrice ?? p.price ?? 0,
            price: p.price ?? p.outrightPrice ?? 0,
            listedRrp: p.listedRrp ?? p.rrp ?? 0,
            rrp: p.rrp ?? p.listedRrp ?? 0,
            headline: p.headline || p.description || '',
            description: p.description || p.headline || '',
            features: Array.isArray(p.features) && p.features.length > 0 ? p.features : p.specs || [],
            specs: Array.isArray(p.specs) && p.specs.length > 0 ? p.specs : p.features || [],
            tag: p.tag || p.label || '',
            label: p.label || p.tag || '',
          }));
          setPhones(normalized);
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
            <span className={styles.eyebrow}>NEW PHONES. DIRECT E-COMMERCE.</span>
            <h2 className={styles.title}>
              A phone you love.
              <br />
              Delivered straight to your door.
            </h2>
            <p className={styles.subtitle}>
              A considered selection from Samsung and Google.
              <br className={styles.desktopBreak} /> Buy outright with free express delivery Australia-wide and genuine Australian manufacturer warranty.
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

        {/* Shop Controls: Filter Tabs */}
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
        </div>

        {/* Phone Cards Grid */}
        <div className={styles.phoneGrid}>
          {filteredPhones.map((phone) => {
            const discount = phone.rrp - phone.price;

            return (
              <article key={phone.id} className={styles.phoneCard}>
                {/* Visual Area with Tilt Animation */}
                <div className={styles.cardVisual}>
                  <span className={styles.phoneBadge}>{phone.label}</span>

                  <button
                    type="button"
                    className={styles.imageButton}
                    aria-label={`Order ${phone.name}`}
                    onClick={() => onConfigurePhone(phone, 'outright')}
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
                    {formatCurrency(phone.price)}
                    <span className={styles.priceUnit}>
                      outright
                    </span>
                  </div>

                  {/* Price detail subtext */}
                  <p className={styles.phonePriceDetail}>
                    Listed RRP <s>{formatCurrency(phone.rrp)}</s>{' '}
                    <b className={styles.savingsTag}>{formatCurrency(discount)} less</b>
                  </p>

                  {/* Order button */}
                  <button
                    type="button"
                    className={styles.exploreBtn}
                    onClick={() => onConfigurePhone(phone, 'outright')}
                  >
                    <span>Order Handset</span>
                    <span className={styles.buttonArrow}>↗</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Section Fineprint */}
        <p className={styles.sectionFineprint}>
          All handset prices include 10% Australian GST. Genuine Australian stock with manufacturer warranty and free express delivery Australia-wide via Australia Post Express.
        </p>
      </div>
    </section>
  );
}
