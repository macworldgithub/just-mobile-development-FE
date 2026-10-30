'use strict';
'use client';

import React, { useEffect } from 'react';
import styles from './AccountDrawer.module.css';

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenActivationQr: () => void;
}

export default function AccountDrawer({
  isOpen,
  onClose,
  onOpenActivationQr,
}: AccountDrawerProps) {
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

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerTitleWrap}>
            <span className={styles.authBadge}>SECURE CUSTOMER PORTAL</span>
            <h2 className={styles.drawerTitle}>My JustMobile Account</h2>
            <span className={styles.accountEmail}>alex.morgan@example.com.au</span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Account Drawer"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div className={styles.drawerBody}>
          {/* Active Service Card */}
          <div className={styles.card}>
            <div className={styles.serviceHeader}>
              <div className={styles.serviceStatusRow}>
                <span className={styles.statusDot}></span>
                <span className={styles.statusText}>Active Mobile Service</span>
              </div>
              <span className={styles.networkTag}>5G Telstra Wholesale</span>
            </div>

            <div className={styles.mobileNumberRow}>
              <strong className={styles.mobileNumber}>0488 912 340</strong>
              <span className={styles.simBadge}>eSIM</span>
            </div>

            <div className={styles.planDetailsRow}>
              <span className={styles.planLabel}>Plan:</span>
              <strong className={styles.planValue}>50GB Just right ($25.00/mth)</strong>
            </div>

            {/* Data Bank Meter */}
            <div className={styles.meterContainer}>
              <div className={styles.meterHeader}>
                <span>Current Data Remaining</span>
                <strong>42.4 GB of 50 GB</strong>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '84%' }}></div>
              </div>
              <div className={styles.bankedNotice}>
                <span>Data Bank Balance: <strong>148.2 GB</strong> (rolls over automatically)</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.qrActionBtn}
              onClick={() => {
                onClose();
                onOpenActivationQr();
              }}
            >
              <span>View & Redownload eSIM QR Code</span>
              <span>→</span>
            </button>
          </div>

          {/* Active Handset Instalment */}
          <div className={styles.card}>
            <div className={styles.handsetHeader}>
              <h3 className={styles.cardHeading}>Device Financing</h3>
              <span className={styles.termTag}>Month 1 of 24</span>
            </div>
            <p className={styles.deviceName}>Samsung Galaxy S26 Ultra 512GB (Black)</p>
            <div className={styles.financeRow}>
              <span>Monthly repayment:</span>
              <strong>$74.96/mth</strong>
            </div>
            <div className={styles.financeRow}>
              <span>Remaining balance:</span>
              <strong>$1,724.29</strong>
            </div>
          </div>

          {/* Billing & Payment */}
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>Next Scheduled Payment</h3>
            <div className={styles.billDueRow}>
              <div>
                <strong className={styles.billAmount}>$99.96</strong>
                <span className={styles.billDate}>Due 28 Nov 2026</span>
              </div>
              <span className={styles.autoPayBadge}>Auto-Pay Active</span>
            </div>
            <span className={styles.cardUsed}>Charged to Mastercard ending in 4192</span>
          </div>

          {/* Security & ACMA Compliance Notice */}
          <div className={styles.securityBox}>
            <span className={styles.securityIcon}>🔒</span>
            <p className={styles.securityText}>
              Protected by Australian ACMA customer authentication rules. Multi-factor
              authentication (SMS MFA) is required for SIM transfers and address changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
