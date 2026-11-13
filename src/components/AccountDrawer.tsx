'use strict';
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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
  const { user } = useAuth();

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
            <h2 className={styles.drawerTitle}>
              {user ? `Hi, ${user.name}` : 'My JustMobile Account'}
            </h2>
            <span className={styles.accountEmail}>
              {user ? user.email : 'Sign in to manage your mobile service'}
            </span>
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
          {user ? (
            <>
              {/* Signed-In Account Summary Card */}
              <div className={styles.card}>
                <div className={styles.serviceHeader}>
                  <div className={styles.serviceStatusRow}>
                    <span className={styles.statusDot}></span>
                    <span className={styles.statusText}>Authenticated Session</span>
                  </div>
                  <span className={styles.networkTag}>5G Telstra Wholesale</span>
                </div>

                <div className={styles.mobileNumberRow}>
                  <strong className={styles.mobileNumber}>{user.phone || 'Mobile number pending'}</strong>
                  <span className={styles.simBadge}>eSIM</span>
                </div>

                <div className={styles.planDetailsRow}>
                  <span className={styles.planLabel}>Customer #:</span>
                  <strong className={styles.planValue}>{user.custNo || 'Pending'}</strong>
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

              <div className={styles.card}>
                <h3 className={styles.cardHeading}>Full Self-Service Portal</h3>
                <p className={styles.deviceName}>
                  View live data usage, invoices, plan upgrades, and porting status in your dashboard.
                </p>
                <Link
                  href={user.role === 'admin' ? '/admin' : '/account'}
                  className={styles.qrActionBtn}
                  onClick={onClose}
                >
                  <span>{user.role === 'admin' ? 'Open Admin Portal' : 'Open Customer Portal'}</span>
                  <span>→</span>
                </Link>
              </div>
            </>
          ) : (
            <div className={styles.card}>
              <h3 className={styles.cardHeading}>Welcome to JustMobile</h3>
              <p className={styles.deviceName}>
                Sign in with your Customer Number and PIN or Password to access your mobile service, usage meter, eSIM QR code, and tax invoices.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                <Link href="/login" className={styles.qrActionBtn} onClick={onClose}>
                  <span>Sign In to Customer Portal</span>
                  <span>→</span>
                </Link>
                <Link href="/signup" className={styles.qrActionBtn} onClick={onClose}>
                  <span>Create New Account</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          )}

          {/* Security & ACMA Compliance Notice */}
          <div className={styles.securityBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
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
