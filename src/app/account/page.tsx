'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './account.module.css';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const [planOrder, setPlanOrder] = useState<{
    planName?: string;
    planTier?: string;
    pricePerMonth?: number;
    keepExistingNumber?: boolean;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('justmobile_selected_order');
        if (stored) {
          setPlanOrder(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p>Loading your account details...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatAccountId = (id?: string) => {
    if (!id) return 'JM-AU-829104';
    const clean = id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
    return `JM-AU-${clean}`;
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" aria-label="JustMobile Home">
            <Image
              src="/brand/logos/justmobile-wordmark-ink.svg"
              alt="JustMobile"
              width={140}
              height={32}
              priority
            />
          </Link>
          <div className={styles.userMenu}>
            <span className={styles.userName}>
              {user.name}
            </span>
            {user.role === 'admin' && (
              <Link href="/admin" className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '12px' }}>
                Admin Portal
              </Link>
            )}
            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.headerBanner}>
          <div>
            <h1 className={styles.greetingTitle}>Welcome back, {user.name.split(' ')[0]}</h1>
            <p className={styles.greetingSub}>
              Account ID: {formatAccountId(user.id)} · Connected to Telstra 5G Wholesale Network
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Left Column: Service Details */}
          <div>
            <div className={styles.card}>
              <div className={styles.serviceRow}>
                <div>
                  <div className={styles.mobileNum}>
                    {planOrder?.keepExistingNumber ? '0412 345 678 (Port in progress)' : '0488 912 340'}
                  </div>
                  <span style={{ fontSize: '13px', color: '#697866' }}>
                    {planOrder?.keepExistingNumber
                      ? 'Porting your existing number · Unlimited AU Calls & Texts'
                      : 'Allocated Australian Mobile · Unlimited AU Calls & Texts'}
                  </span>
                </div>
                <span className={styles.statusActive}>Active · eSIM</span>
              </div>

              <h2 className={styles.cardTitle}>
                {planOrder?.planTier
                  ? `${planOrder.planTier} ${planOrder.planName || ''} ($${planOrder.pricePerMonth || 25}.00/mth)`
                  : '50GB Just right Plan ($25.00/mth)'}
              </h2>

              {/* Data bank meter */}
              <div className={styles.meterContainer}>
                <div className={styles.meterInfo}>
                  <span>Current Data Cycle</span>
                  <strong>42.4 GB remaining of 50 GB</strong>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '84%' }} />
                </div>
                <div className={styles.bankedNotice}>
                  <span>Banked Data Balance: <strong>148.2 GB</strong> (auto rolls over next billing cycle)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <Link href="/#plans" className={styles.btnPrimary}>
                  Upgrade Plan
                </Link>
                <Link href="/" className={styles.logoutBtn} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  Explore Phones
                </Link>
              </div>
            </div>

            {/* Handset Financing Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Device & Financing</h2>
              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Device</span>
                  <span className={styles.detailValue}>Samsung Galaxy S26 Ultra 512GB (Black)</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Instalment Term</span>
                  <span className={styles.detailValue}>Month 1 of 24</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Monthly Instalment</span>
                  <span className={styles.detailValue}>$74.96/mth</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Remaining Balance</span>
                  <span className={styles.detailValue}>$1,724.29</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Profile & Security */}
          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Profile Details</h2>
              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Name</span>
                  <span className={styles.detailValue}>{user.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{user.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Mobile</span>
                  <span className={styles.detailValue}>{user.phone || '0488 912 340'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Verification</span>
                  <span className={styles.detailValue} style={{ color: '#49721d' }}>
                    Email Verified
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Payment & Auto-Pay</h2>
              <p style={{ fontSize: '13.5px', color: '#556253', margin: '0 0 12px 0' }}>
                Next invoice due: <strong>28 Nov 2026 ($99.96)</strong>
              </p>
              <div style={{ fontSize: '13px', color: '#789937', fontWeight: 600 }}>
                Mastercard ending in •••• 4192 (Auto-pay active)
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
