'use strict';
'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ConfiguratorModal.module.css';
import { Handset, MobilePlan, calculateRepayments } from '@/data/catalogue';
import { useAuth } from '@/context/AuthContext';

interface ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  handset: Handset;
  onProceedToOrder?: (config: {
    handset: Handset;
    paymentMode: 'outright' | 'instalments' | 'phone_and_plan';
    termMonths: number;
    upfrontPct: number;
    plan?: MobilePlan;
    repayments: ReturnType<typeof calculateRepayments>;
  }) => void;
}

export default function ConfiguratorModal({
  isOpen,
  onClose,
  handset,
}: ConfiguratorModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !handset) return null;

  const phoneColor = handset.color || handset.colour || 'Black';
  const phoneHeadline = handset.headline || handset.description || '';
  const phoneFeatures = Array.isArray(handset.features) && handset.features.length > 0 
    ? handset.features 
    : Array.isArray(handset.specs) && handset.specs.length > 0 
    ? handset.specs 
    : ['5G + eSIM', 'Free Express Delivery Australia-wide', 'Australian Manufacturer Warranty'];
  const phonePrice = handset.price ?? handset.outrightPrice ?? 0;
  const phoneOutrightPrice = handset.outrightPrice ?? handset.price ?? phonePrice;
  const phoneRrp = handset.rrp ?? handset.listedRrp ?? phonePrice;
  const discount = Math.max(0, phoneRrp - phoneOutrightPrice);
  const gstAmount = Number((phoneOutrightPrice / 11).toFixed(2));
  const subtotalExGst = Number((phoneOutrightPrice - gstAmount).toFixed(2));

  const handleProceed = () => {
    // 1. Stash selected e-commerce order in sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('justmobile_selected_order', JSON.stringify({
          handsetName: handset.name,
          handsetPrice: phoneOutrightPrice,
          storage: handset.storage,
          color: phoneColor,
          paymentMode: 'outright',
          outright: true,
          shipping: 'Free Express Courier',
          monthlyTotal: 0,
        }));
      } catch {
        // Storage fallback
      }
    }

    // 2. Close the modal
    onClose();

    // 3. If logged in, go to customer portal to confirm order; if guest, route to sign up to register delivery address
    if (user) {
      router.push('/account');
    } else {
      const queryParams = new URLSearchParams();
      if (handset?.name) {
        queryParams.set('device', handset.name);
        queryParams.set('mode', 'outright');
      }
      router.push(`/signup?${queryParams.toString()}`);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitles}>
            <h2 className={styles.modalTitle}>Order Your Handset</h2>
            <p className={styles.modalSubtitle}>Simple direct e-commerce checkout · Sign up or log in to complete your order</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close configurator"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className={styles.modalGrid}>
          {/* Left Column: Device Preview */}
          <div className={styles.previewColumn}>
            <div className={styles.deviceHeader}>
              <span className={styles.brandSubtitle}>{handset.brand}</span>
              <h3 className={styles.deviceTitle}>{handset.name}</h3>
              <span className={styles.variantSubtitle}>{handset.storage} · {phoneColor}</span>
            </div>

            <div className={styles.imageWrap}>
              <Image
                src={handset.image}
                alt={`${handset.name} in ${phoneColor}`}
                width={360}
                height={400}
                className={styles.previewImage}
                priority
              />
            </div>

            <p className={styles.tagline}>{phoneHeadline}</p>

            <ul className={styles.featureChecks}>
              {phoneFeatures.map((feat, i) => (
                <li key={i} className={styles.checkItem}>
                  <span className={styles.greenCheck}>✓</span>
                  <span>{feat}</span>
                </li>
              ))}
              <li className={styles.checkItem}>
                <span className={styles.greenCheck}>✓</span>
                <span>Factory unlocked · Compatible with all Australian networks</span>
              </li>
              <li className={styles.checkItem}>
                <span className={styles.greenCheck}>✓</span>
                <span>Free Express Delivery via Australia Post</span>
              </li>
            </ul>

            <div className={styles.shieldBadge}>
              <span className={styles.shieldIcon}>🛡️</span>
              <span>Official 24-Month Manufacturer Warranty</span>
            </div>
          </div>

          {/* Right Column: E-Commerce Fulfilment & Outright Checkout */}
          <div className={styles.controlsColumn}>
            {/* Step 01: Product Inclusions */}
            <div className={styles.stepGroup}>
              <div className={styles.stepTitleRow}>
                <span className={styles.stepNum}>01</span>
                <span className={styles.stepTitle}>Device Specifications & Stock</span>
              </div>
              <div style={{ background: '#fbfdfa', border: '1.5px solid #dce4d8', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#556253' }}>Selected Model:</span>
                  <strong style={{ color: '#142420' }}>{handset.name} ({handset.storage})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#556253' }}>Colour Finish:</span>
                  <strong style={{ color: '#142420' }}>{phoneColor}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#556253' }}>Network Lock:</span>
                  <strong style={{ color: '#2e7d32' }}>Factory Unlocked (SIM-free)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#556253' }}>Warehouse Availability:</span>
                  <strong style={{ color: '#2e7d32' }}>✓ In Stock (Ships 1-2 business days)</strong>
                </div>
              </div>
            </div>

            {/* Step 02: Simple E-Commerce Fulfilment */}
            <div className={styles.stepGroup}>
              <div className={styles.stepTitleRow}>
                <span className={styles.stepNum}>02</span>
                <span className={styles.stepTitle}>Delivery & Fulfilment</span>
              </div>
              <div style={{ background: '#fbfdfa', border: '1.5px solid #dce4d8', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#556253' }}>Shipping Service:</span>
                  <strong style={{ color: '#142420' }}>Australia Post Express Courier</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#556253' }}>Delivery Cost:</span>
                  <strong style={{ color: '#2e7d32' }}>FREE ($0.00)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: '#556253' }}>Tracking & Signature:</span>
                  <strong style={{ color: '#142420' }}>Included on delivery</strong>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryTitle}>Total Outright Price</span>
                <span className={styles.infoIcon}>ⓘ</span>
              </div>

              {/* Main total display */}
              <div className={styles.totalRow}>
                <strong className={styles.bigTotal}>
                  ${phoneOutrightPrice.toLocaleString()}
                </strong>
                <span className={styles.bigTotalPeriod}>AUD outright (Inc. GST)</span>
              </div>

              {/* Breakdown lines */}
              <div className={styles.breakdownLines}>
                <div className={styles.breakdownRow}>
                  <span>Handset outright price</span>
                  <strong>${phoneOutrightPrice.toLocaleString()}</strong>
                </div>
                {discount > 0 && (
                  <div className={styles.breakdownRow}>
                    <span style={{ color: '#2e7d32' }}>Instant savings vs Listed RRP (${phoneRrp.toLocaleString()})</span>
                    <strong style={{ color: '#2e7d32' }}>-${discount.toLocaleString()}</strong>
                  </div>
                )}
                <div className={styles.breakdownRow}>
                  <span>Express Australia-wide delivery</span>
                  <strong style={{ color: '#2e7d32' }}>FREE</strong>
                </div>
                <div className={styles.breakdownRow}>
                  <span style={{ fontSize: '12px', color: '#697866' }}>Includes 10% Australian GST</span>
                  <span style={{ fontSize: '12px', color: '#697866' }}>${gstAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.summaryDivider}></div>

              {/* Fine print */}
              <p className={styles.legalNotice}>
                Standard e-commerce purchase with no lock-in telco contracts or ongoing repayment debt. Covered by Australian Consumer Law and official manufacturer warranty.
              </p>

              {/* Proceed CTA */}
              <button
                type="button"
                className={styles.checkoutBtn}
                onClick={handleProceed}
              >
                <span>
                  {user
                    ? `Proceed to Order Handset ($${phoneOutrightPrice.toLocaleString()} Outright)`
                    : `Sign Up to Order ($${phoneOutrightPrice.toLocaleString()} Outright)`}
                </span>
                <span>→</span>
              </button>

              {!user ? (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#687766' }}>Already have an account? </span>
                  <Link
                    href={`/login?redirect=${encodeURIComponent('/account')}`}
                    onClick={onClose}
                    style={{ fontSize: '13px', fontWeight: 700, color: '#142420', textDecoration: 'underline' }}
                  >
                    Sign in to portal →
                  </Link>
                </div>
              ) : (
                <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12.5px', color: '#556253' }}>
                  <span>✓ Signed in as <strong>{user.name}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
