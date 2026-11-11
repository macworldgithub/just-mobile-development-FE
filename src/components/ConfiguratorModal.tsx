'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ConfiguratorModal.module.css';
import { Handset, MOBILE_PLANS, MobilePlan, calculateRepayments } from '@/data/catalogue';

interface ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  handset: Handset;
  onProceedToOrder: (config: {
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
  onProceedToOrder,
}: ConfiguratorModalProps) {
  const router = useRouter();
  const [paymentMode, setPaymentMode] = useState<'outright' | 'instalments' | 'phone_and_plan'>('phone_and_plan');
  const [termMonths, setTermMonths] = useState<number>(24);
  const [upfrontPct, setUpfrontPct] = useState<number>(25);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-100gb');

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
    : ['5G + eSIM', 'Unlimited Standard AU Calls & SMS', 'Australian Manufacturer Warranty'];
  const phonePrice = handset.price ?? handset.outrightPrice ?? 0;
  const phoneOutrightPrice = handset.outrightPrice ?? handset.price ?? phonePrice;

  const currentPlan = MOBILE_PLANS.find((p) => p.id === selectedPlanId) || MOBILE_PLANS[2];
  const planPrice = paymentMode === 'phone_and_plan' ? currentPlan.pricePerMonth : 0;

  const calculation = calculateRepayments(
    phonePrice,
    paymentMode === 'outright' ? 0 : termMonths,
    paymentMode === 'outright' ? 100 : upfrontPct,
    planPrice
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    // Snap to nearest 0, 25, 50
    if (val < 13) setUpfrontPct(0);
    else if (val < 38) setUpfrontPct(25);
    else setUpfrontPct(50);
  };

  const handleProceed = () => {
    // 1. Stash selected configuration in sessionStorage so registration displays their chosen bundle
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('justmobile_selected_order', JSON.stringify({
          handsetName: handset.name,
          handsetPrice: phoneOutrightPrice,
          storage: handset.storage,
          color: phoneColor,
          planName: paymentMode === 'phone_and_plan' ? currentPlan.name : null,
          planTier: paymentMode === 'phone_and_plan' ? currentPlan.tier : null,
          pricePerMonth: paymentMode === 'phone_and_plan' ? currentPlan.pricePerMonth : 0,
          paymentMode,
          termMonths,
          upfrontPct,
          monthlyTotal: calculation.totalMonthly,
        }));
      } catch {
        // Storage fallback
      }
    }

    // 2. Close the modal directly without opening any intermediate fake order confirmation
    onClose();

    // 3. Route directly to /signup
    const queryParams = new URLSearchParams();
    if (paymentMode === 'phone_and_plan' && currentPlan?.name) {
      queryParams.set('plan', currentPlan.name);
    }
    if (handset?.name) {
      queryParams.set('device', handset.name);
    }
    router.push(`/signup?${queryParams.toString()}`);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitles}>
            <h2 className={styles.modalTitle}>Make it yours.</h2>
            <p className={styles.modalSubtitle}>Indicative pricing & repayment calculator · Register or sign in to order</p>
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
            </ul>

            <div className={styles.shieldBadge}>
              <span className={styles.shieldIcon}>🛡️</span>
              <span>Supplier-listed · Subject to stock confirmation</span>
            </div>
          </div>

          {/* Right Column: Configuration Steps */}
          <div className={styles.controlsColumn}>
            {/* Step 01: Payment Mode */}
            <div className={styles.stepGroup}>
              <div className={styles.stepTitleRow}>
                <span className={styles.stepNum}>01</span>
                <span className={styles.stepTitle}>Choose how to pay</span>
              </div>
              <div className={styles.segmentedToggle}>
                <button
                  type="button"
                  className={`${styles.segmentBtn} ${paymentMode === 'outright' ? styles.segmentActive : ''}`}
                  onClick={() => setPaymentMode('outright')}
                >
                  Outright
                </button>
                <button
                  type="button"
                  className={`${styles.segmentBtn} ${paymentMode === 'instalments' ? styles.segmentActive : ''}`}
                  onClick={() => setPaymentMode('instalments')}
                >
                  Instalments
                </button>
                <button
                  type="button"
                  className={`${styles.segmentBtn} ${paymentMode === 'phone_and_plan' ? styles.segmentActive : ''}`}
                  onClick={() => setPaymentMode('phone_and_plan')}
                >
                  Phone + plan
                </button>
              </div>
            </div>

            {/* Step 02: Monthly Term & Upfront (if not outright) */}
            {paymentMode !== 'outright' && (
              <div className={styles.stepGroup}>
                <div className={styles.stepTitleRow}>
                  <span className={styles.stepNum}>02</span>
                  <span className={styles.stepTitle}>Find your monthly fit</span>
                </div>

                {/* Term selector cards */}
                <div className={styles.termGrid}>
                  {[12, 24, 36].map((months) => {
                    const isSelected = termMonths === months;
                    return (
                      <div
                        key={months}
                        className={`${styles.termCard} ${isSelected ? styles.termActive : ''}`}
                        onClick={() => setTermMonths(months)}
                        role="button"
                        tabIndex={0}
                      >
                        {isSelected && <span className={styles.termCheck}>✓</span>}
                        <strong className={styles.termMonths}>{months}</strong>
                        <span className={styles.termLabel}>months</span>
                      </div>
                    );
                  })}
                </div>

                {/* Upfront slider */}
                <div className={styles.upfrontContainer}>
                  <div className={styles.upfrontHeader}>
                    <span className={styles.upfrontTitle}>Pay a little upfront</span>
                    <strong className={styles.upfrontAmountDisplay}>
                      ${calculation.upfrontAmount.toFixed(2)}
                    </strong>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="25"
                    value={upfrontPct}
                    onChange={handleSliderChange}
                    className={styles.rangeSlider}
                    aria-label="Upfront percentage"
                  />

                  <div className={styles.sliderMarkers}>
                    <span className={upfrontPct === 0 ? styles.markerActive : ''}>0%</span>
                    <span className={upfrontPct === 25 ? styles.markerActive : ''}>25%</span>
                    <span className={upfrontPct === 50 ? styles.markerActive : ''}>50%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 03: Mobile Plan (if phone + plan) */}
            {paymentMode === 'phone_and_plan' && (
              <div className={styles.stepGroup}>
                <div className={styles.stepTitleRow}>
                  <span className={styles.stepNum}>03</span>
                  <span className={styles.stepTitle}>Add your mobile plan</span>
                </div>

                <div className={styles.plansSelector}>
                  {MOBILE_PLANS.map((plan) => {
                    const isSelected = plan.id === selectedPlanId;
                    return (
                      <div
                        key={plan.id}
                        className={`${styles.planOptionRow} ${isSelected ? styles.planOptionActive : ''}`}
                        onClick={() => setSelectedPlanId(plan.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={styles.planOptionLeft}>
                          <strong className={styles.planOptionTier}>{plan.tier}</strong>
                          <span className={styles.planOptionName}>{plan.name}</span>
                        </div>
                        <div className={styles.planOptionRight}>
                          <span className={styles.planOptionPrice}>${plan.pricePerMonth}</span>
                          <span className={styles.planOptionPeriod}>/month</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 04 / Summary Card */}
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryTitle}>Your indicative total</span>
                <span className={styles.infoIcon}>ⓘ</span>
              </div>

              {/* Main total display */}
              <div className={styles.totalRow}>
                {paymentMode === 'outright' ? (
                  <>
                    <strong className={styles.bigTotal}>
                      ${calculation.totalAggregateCost.toLocaleString()}
                    </strong>
                    <span className={styles.bigTotalPeriod}>outright</span>
                  </>
                ) : (
                  <>
                    <strong className={styles.bigTotal}>
                      ${calculation.totalMonthly.toFixed(2)}
                    </strong>
                    <span className={styles.bigTotalPeriod}>/month</span>
                  </>
                )}
              </div>

              {/* Breakdown lines */}
              <div className={styles.breakdownLines}>
                {paymentMode !== 'outright' ? (
                  <>
                    <div className={styles.breakdownRow}>
                      <span>Phone repayment</span>
                      <strong>${calculation.monthlyPhoneRepayment.toFixed(2)}/mth</strong>
                    </div>
                    {paymentMode === 'phone_and_plan' && (
                      <div className={styles.breakdownRow}>
                        <span>{currentPlan.tier} mobile plan</span>
                        <strong>${currentPlan.pricePerMonth}/mth</strong>
                      </div>
                    )}
                    <div className={styles.breakdownRow}>
                      <span>Upfront contribution</span>
                      <strong>${calculation.upfrontAmount.toFixed(2)}</strong>
                    </div>
                  </>
                ) : (
                  <div className={styles.breakdownRow}>
                    <span>Handset outright</span>
                    <strong>${phoneOutrightPrice.toLocaleString()}</strong>
                  </div>
                )}
              </div>

              <div className={styles.summaryDivider}></div>

              {/* Aggregate full term */}
              <div className={styles.aggregateRow}>
                {paymentMode === 'phone_and_plan' ? (
                  <>
                    <span>Phone + plan over {termMonths} months</span>
                    <strong>${calculation.totalAggregateCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </>
                ) : paymentMode === 'instalments' ? (
                  <>
                    <span>Phone over {termMonths} months</span>
                    <strong>${calculation.totalAggregateCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </>
                ) : (
                  <>
                    <span>Total outright</span>
                    <strong>${calculation.totalAggregateCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </>
                )}
              </div>

              {/* Fine print */}
              <p className={styles.legalNotice}>
                This is an indicative calculator. Handset financing repayments and bundled mobile services are ordered securely inside the customer portal with ACMA identity verification and credit review.
              </p>

              {/* Proceed CTA */}
              <button
                type="button"
                className={styles.checkoutBtn}
                onClick={handleProceed}
              >
                <span>Proceed to Sign Up to Order</span>
                <span>→</span>
              </button>

              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#687766' }}>Already have an account? </span>
                <Link
                  href="/login"
                  onClick={onClose}
                  style={{ fontSize: '13px', fontWeight: 700, color: '#142420', textDecoration: 'underline' }}
                >
                  Sign in to portal →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
