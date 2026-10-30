'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import styles from './OrderFlowModal.module.css';
import { Handset, MobilePlan, calculateRepayments } from '@/data/catalogue';

export interface OrderConfiguration {
  handset?: Handset;
  plan?: MobilePlan;
  paymentMode?: 'outright' | 'instalments' | 'phone_and_plan';
  termMonths?: number;
  upfrontPct?: number;
  repayments?: ReturnType<typeof calculateRepayments>;
}

interface OrderFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: OrderConfiguration | null;
}

export default function OrderFlowModal({ isOpen, onClose, config }: OrderFlowModalProps) {
  const [step, setStep] = useState<number>(1);
  const [numberType, setNumberType] = useState<'new' | 'port'>('new');
  const [portNumber, setPortNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Customer info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  // Order state simulation
  const [orderId, setOrderId] = useState('');
  const [currentOrderState, setCurrentOrderState] = useState<string>('draft');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      setOrderId(`JM-AU-${Math.floor(100000 + Math.random() * 900000)}`);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen || !config) return null;

  const handleSendOtp = () => {
    if (portNumber.length >= 8) {
      setOtpSent(true);
      setTimeout(() => setOtpCode('829104'), 800);
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode === '829104' || otpCode.length === 6) {
      setOtpVerified(true);
    }
  };

  const startAutomatedFulfillment = () => {
    setStep(3);
    setCurrentOrderState('quote_accepted');

    setTimeout(() => setCurrentOrderState('prerequisites_satisfied'), 1200);
    setTimeout(() => setCurrentOrderState('octane_customer_linked'), 2400);
    setTimeout(() => setCurrentOrderState('number_reserved'), 3600);
    setTimeout(() => setCurrentOrderState('order_submitted'), 4800);
    setTimeout(() => setCurrentOrderState('service_confirmed'), 6200);
    setTimeout(() => setCurrentOrderState('profile_available'), 7600);
    setTimeout(() => setCurrentOrderState('ready_to_use'), 9000);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.orderBadge}>ORDER REFERENCE: {orderId}</span>
            <h2 className={styles.title}>
              {step === 1 && 'Confirm your selection'}
              {step === 2 && 'Identity & Mobile Number'}
              {step === 3 && 'Order Lifecycle & eSIM Activation'}
            </h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Step 1: Review Selection */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.reviewCard}>
              {config.handset && (
                <div className={styles.reviewItem}>
                  <div className={styles.itemHeader}>
                    <strong>{config.handset.name}</strong>
                    <span>${config.handset.outrightPrice} outright</span>
                  </div>
                  <span className={styles.itemSub}>
                    {config.handset.storage} · {config.handset.color}
                  </span>
                </div>
              )}

              {config.plan && (
                <div className={styles.reviewItem}>
                  <div className={styles.itemHeader}>
                    <strong>JustMobile {config.plan.tier} ({config.plan.name})</strong>
                    <span>${config.plan.pricePerMonth}/mth</span>
                  </div>
                  <span className={styles.itemSub}>
                    5G Data Banking · Unlimited AU Calls & SMS · No lock-in
                  </span>
                </div>
              )}

              {config.repayments && (
                <div className={styles.calculationSummary}>
                  <div className={styles.calcRow}>
                    <span>Payment mode:</span>
                    <strong className={styles.capitalize}>{config.paymentMode?.replace(/_/g, ' ')}</strong>
                  </div>
                  {config.repayments.termMonths > 0 && (
                    <div className={styles.calcRow}>
                      <span>Repayment term:</span>
                      <strong>{config.repayments.termMonths} months</strong>
                    </div>
                  )}
                  {config.repayments.upfrontAmount > 0 && (
                    <div className={styles.calcRow}>
                      <span>Upfront contribution:</span>
                      <strong>${config.repayments.upfrontAmount.toFixed(2)}</strong>
                    </div>
                  )}
                  <div className={styles.calcTotalRow}>
                    <span>Monthly total:</span>
                    <strong className={styles.monthlyValue}>
                      ${config.repayments.totalMonthly.toFixed(2)}/month
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className={styles.primaryNextBtn}
              onClick={() => setStep(2)}
            >
              <span>Continue to details</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* Step 2: Number & ACMA Identity */}
        {step === 2 && (
          <div className={styles.stepContent}>
            {/* Number choice */}
            <div className={styles.formSection}>
              <label className={styles.sectionLabel}>01 Mobile Number Selection</label>
              <div className={styles.numberToggleGroup}>
                <button
                  type="button"
                  className={`${styles.numberToggle} ${numberType === 'new' ? styles.toggleSelected : ''}`}
                  onClick={() => setNumberType('new')}
                >
                  Get a new 04XX number
                </button>
                <button
                  type="button"
                  className={`${styles.numberToggle} ${numberType === 'port' ? styles.toggleSelected : ''}`}
                  onClick={() => setNumberType('port')}
                >
                  Keep my existing number
                </button>
              </div>

              {numberType === 'new' ? (
                <div className={styles.newNumberNotice}>
                  <span>Reserved Australian Mobile: </span>
                  <strong className={styles.highlightMsisdn}>0488 912 340</strong>
                </div>
              ) : (
                <div className={styles.portBox}>
                  <span className={styles.acmaNote}>
                    🔒 ACMA Mandatory Verification: An SMS code will be sent to confirm your right of use.
                  </span>
                  <div className={styles.portInputRow}>
                    <input
                      type="tel"
                      placeholder="Current mobile (e.g. 0412 345 678)"
                      value={portNumber}
                      onChange={(e) => setPortNumber(e.target.value)}
                      className={styles.textInput}
                    />
                    <button
                      type="button"
                      className={styles.sendOtpBtn}
                      onClick={handleSendOtp}
                    >
                      Send SMS code
                    </button>
                  </div>

                  {otpSent && !otpVerified && (
                    <div className={styles.otpRow}>
                      <input
                        type="text"
                        placeholder="6-digit SMS code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className={styles.textInput}
                      />
                      <button
                        type="button"
                        className={styles.verifyOtpBtn}
                        onClick={handleVerifyOtp}
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}

                  {otpVerified && (
                    <div className={styles.verifiedSuccess}>
                      ✓ Number verified for ACMA compliant transfer.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className={styles.formSection}>
              <label className={styles.sectionLabel}>02 Account & Identity Details</label>
              <div className={styles.formGrid}>
                <input
                  type="text"
                  placeholder="Full Legal Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.textInput}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.textInput}
                  required
                />
                <input
                  type="text"
                  placeholder="Date of Birth (DD/MM/YYYY)"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={styles.textInput}
                  required
                />
                <input
                  type="text"
                  placeholder="Australian Residential Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                type="button"
                className={styles.primaryNextBtn}
                onClick={startAutomatedFulfillment}
              >
                <span>Submit & Authorise Zero-Touch Order</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Lifecycle & eSIM Activation */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <div className={styles.lifecycleCard}>
              <div className={styles.workflowProgress}>
                {[
                  { key: 'quote_accepted', label: 'Quote Accepted & Signed' },
                  { key: 'prerequisites_satisfied', label: 'ACMA Identity Verified' },
                  { key: 'octane_customer_linked', label: 'Octane Customer Linked' },
                  { key: 'number_reserved', label: '04XX MSISDN Reserved' },
                  { key: 'order_submitted', label: 'Mobile Order Submitted' },
                  { key: 'service_confirmed', label: 'Network Service Active' },
                  { key: 'profile_available', label: 'eSIM SM-DP+ Profile Ready' },
                  { key: 'ready_to_use', label: 'Setup Completed · Ready to use' },
                ].map((st, i) => {
                  const stateKeys = [
                    'draft',
                    'quote_accepted',
                    'prerequisites_satisfied',
                    'octane_customer_linked',
                    'number_reserved',
                    'order_submitted',
                    'service_confirmed',
                    'profile_available',
                    'ready_to_use',
                  ];
                  const currentIndex = stateKeys.indexOf(currentOrderState);
                  const stepIndex = stateKeys.indexOf(st.key);
                  const isDone = currentIndex >= stepIndex;
                  const isCurrent = currentIndex === stepIndex;

                  return (
                    <div
                      key={st.key}
                      className={`${styles.stepLine} ${isDone ? styles.stepDone : ''} ${isCurrent ? styles.stepCurrent : ''}`}
                    >
                      <span className={styles.stepCircle}>{isDone ? '✓' : i + 1}</span>
                      <span className={styles.stepName}>{st.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* eSIM QR Reveal when ready */}
              {currentOrderState === 'ready_to_use' && (
                <div className={styles.qrContainer}>
                  <div className={styles.qrHeader}>
                    <span className={styles.readyBadge}>SERVICE ACTIVE & READY</span>
                    <h3 className={styles.qrTitle}>Your eSIM QR Code</h3>
                    <p className={styles.qrSub}>
                      Scan this code with your phone camera to download your eSIM profile directly.
                    </p>
                  </div>

                  {/* High visual fidelity QR code demonstration */}
                  <div className={styles.qrBox}>
                    <svg
                      width="180"
                      height="180"
                      viewBox="0 0 180 180"
                      className={styles.qrSvg}
                    >
                      <rect width="180" height="180" fill="#ffffff" />
                      {/* Standard QR Corners */}
                      <rect x="15" y="15" width="45" height="45" fill="#142420" />
                      <rect x="23" y="23" width="29" height="29" fill="#ffffff" />
                      <rect x="30" y="30" width="15" height="15" fill="#142420" />

                      <rect x="120" y="15" width="45" height="45" fill="#142420" />
                      <rect x="128" y="23" width="29" height="29" fill="#ffffff" />
                      <rect x="135" y="30" width="15" height="15" fill="#142420" />

                      <rect x="15" y="120" width="45" height="45" fill="#142420" />
                      <rect x="23" y="128" width="29" height="29" fill="#ffffff" />
                      <rect x="30" y="135" width="15" height="15" fill="#142420" />

                      {/* Random Data Dots */}
                      <rect x="75" y="20" width="12" height="12" fill="#142420" />
                      <rect x="95" y="35" width="14" height="14" fill="#789937" />
                      <rect x="70" y="70" width="40" height="40" fill="#D5F879" />
                      <rect x="80" y="80" width="20" height="20" fill="#142420" />
                      <rect x="25" y="80" width="10" height="15" fill="#142420" />
                      <rect x="45" y="85" width="15" height="10" fill="#142420" />
                      <rect x="130" y="75" width="20" height="15" fill="#142420" />
                      <rect x="125" y="105" width="15" height="15" fill="#789937" />
                      <rect x="75" y="130" width="14" height="14" fill="#142420" />
                      <rect x="98" y="140" width="15" height="20" fill="#142420" />
                      <rect x="130" y="135" width="25" height="25" fill="#142420" />
                    </svg>
                  </div>

                  <div className={styles.esimInstructions}>
                    <p><strong>iOS:</strong> Settings → Mobile / Cellular → Add eSIM → Scan QR Code</p>
                    <p><strong>Android:</strong> Settings → Network & Internet → SIMs → Add eSIM</p>
                  </div>

                  <button
                    type="button"
                    className={styles.finishBtn}
                    onClick={onClose}
                  >
                    Done & Return to Homepage
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
