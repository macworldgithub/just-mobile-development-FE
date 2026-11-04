'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './account.module.css';

interface CarrierUsage {
  custNo: string;
  billingCycle: string;
  cycleDetails?: {
    periodStart: string;
    periodEnd: string;
    daysRemaining: number;
  };
  dataMeter?: {
    planTotalGb: number;
    dataUsedGb: number;
    dataRemainingGb: number;
    percentRemaining: number;
    bankedDataGb: number;
    bankedMaxGb: number;
    autoRollover: boolean;
  };
  voiceAndSms?: {
    unlimitedStandardAuCalls: boolean;
    unlimitedStandardAuSms: boolean;
    minutesUsed: number;
    smsSent: number;
  };
}

interface CarrierBalance {
  custNo: string;
  currentBalance: number;
  formattedBalance: string;
  lastInvoiceAmount: number;
  lastInvoiceDate: string;
  nextInvoiceDate: string;
  nextInvoiceAmount: number;
  autoPayStatus: string;
  paymentMethod: string;
}

interface EsimDetails {
  orderId: string;
  lpa: string;
  smdpAddress: string;
  activationCode: string;
  qrCodeDataUrl: string;
  instructions: string[];
}

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const [usage, setUsage] = useState<CarrierUsage | null>(null);
  const [balance, setBalance] = useState<CarrierBalance | null>(null);
  const [activeMobile, setActiveMobile] = useState<string>('0488 912 340');
  const [activePlanName, setActivePlanName] = useState<string>('50GB Just right Plan');
  const [esimModalOpen, setEsimModalOpen] = useState<boolean>(false);
  const [esimDetails, setEsimDetails] = useState<EsimDetails | null>(null);
  const [isLoadingEsim, setIsLoadingEsim] = useState<boolean>(false);
  const [copiedLpa, setCopiedLpa] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Fetch live carrier usage, balance, and services
  useEffect(() => {
    if (!user) return;
    const custNo = user.custNo || 'CUST882104';

    // 1. Fetch live unbilled usage & data bank
    fetch(`/api/carrier/customers/${custNo}/usage`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.dataMeter) {
          setUsage(data);
        }
      })
      .catch((err) => console.warn('Usage fetch error:', err));

    // 2. Fetch live balance & auto-pay
    fetch(`/api/carrier/customers/${custNo}/balance`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setBalance(data);
      })
      .catch((err) => console.warn('Balance fetch error:', err));

    // 3. Fetch active services
    fetch(`/api/carrier/customers/${custNo}/services`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.services && data.services.length > 0) {
          const mainService = data.services[0];
          if (mainService.serviceNumber) setActiveMobile(mainService.serviceNumber);
          if (mainService.planName) setActivePlanName(mainService.planName);
        }
      })
      .catch((err) => console.warn('Services fetch error:', err));
  }, [user]);

  // Load eSIM QR code details on demand
  const handleOpenEsimModal = async () => {
    setEsimModalOpen(true);
    if (esimDetails) return;

    setIsLoadingEsim(true);
    try {
      const custNo = user?.custNo || 'CUST882104';
      const res = await fetch(`/api/carrier/qrcodes/${custNo}`);
      if (res.ok) {
        const data = await res.json();
        setEsimDetails(data);
      }
    } catch (err) {
      console.warn('Error loading eSIM details:', err);
    } finally {
      setIsLoadingEsim(false);
    }
  };

  const handleCopyLpa = () => {
    if (esimDetails?.lpa) {
      navigator.clipboard.writeText(esimDetails.lpa);
      setCopiedLpa(true);
      setTimeout(() => setCopiedLpa(false), 2000);
    }
  };

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
    if (!id) return 'JM-AU-882104';
    const clean = id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
    return `JM-AU-${clean}`;
  };

  // Safe defaults from carrier or fallback
  const remainingGb = usage?.dataMeter?.dataRemainingGb ?? 42.4;
  const totalGb = usage?.dataMeter?.planTotalGb ?? 50;
  const bankedGb = usage?.dataMeter?.bankedDataGb ?? 148.2;
  const percentRemaining = Math.round((remainingGb / totalGb) * 100);

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
              Customer ID: {user.custNo || formatAccountId(user.id)} · Connected to Telstra 5G Wholesale Network
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
                    {activeMobile}
                  </div>
                  <span style={{ fontSize: '13px', color: '#697866' }}>
                    Allocated Telstra Wholesale 5G Mobile · Unlimited AU Calls & Texts
                  </span>
                </div>
                <span className={styles.statusActive}>Active · eSIM</span>
              </div>

              <h2 className={styles.cardTitle}>
                {activePlanName} ($25.00/mth)
              </h2>

              {/* Data bank meter synced with live carrier usage */}
              <div className={styles.meterContainer}>
                <div className={styles.meterInfo}>
                  <span>Current Data Cycle (Renews 28th)</span>
                  <strong>{remainingGb} GB remaining of {totalGb} GB</strong>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${percentRemaining}%` }} />
                </div>
                <div className={styles.bankedNotice}>
                  <span>Banked Data Balance: <strong>{bankedGb} GB</strong> (auto rolls over to next billing cycle)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleOpenEsimModal}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>📱 View eSIM QR & Profile</span>
                </button>
                <Link href="/#plans" className={styles.logoutBtn} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  Upgrade Plan
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
                {user.custNo && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Telco Cust No</span>
                    <span className={styles.detailValue} style={{ fontFamily: 'monospace', fontWeight: 700, color: '#142420' }}>
                      {user.custNo}
                    </span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Full Name</span>
                  <span className={styles.detailValue}>{user.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email Address</span>
                  <span className={styles.detailValue}>{user.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Primary Mobile</span>
                  <span className={styles.detailValue}>{user.phone || activeMobile}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>ACMA ID Verification</span>
                  <span className={styles.detailValue} style={{ color: '#49721d' }}>
                    ✓ Verified Customer
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Payment & Invoicing</h2>
              <p style={{ fontSize: '13.5px', color: '#556253', margin: '0 0 12px 0' }}>
                Next invoice due: <strong>{balance?.nextInvoiceDate || '28 Nov 2026'} (${balance?.nextInvoiceAmount?.toFixed(2) || '25.00'})</strong>
              </p>
              <div style={{ fontSize: '13px', color: '#789937', fontWeight: 600 }}>
                {balance?.paymentMethod || 'Mastercard ending in •••• 4192'} ({balance?.autoPayStatus || 'Auto-pay active'})
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* eSIM Activation QR Code Modal */}
      {esimModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setEsimModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setEsimModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <span style={{
              background: '#D5F879',
              color: '#142420',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '10px'
            }}>
              OFFICIAL ESIM DIGITAL PROFILE
            </span>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#142420', margin: '0 0 6px 0' }}>
              Your eSIM Activation QR Code
            </h3>
            <p style={{ fontSize: '13px', color: '#556253', margin: '0 0 16px 0' }}>
              Point your smartphone camera at this code to install the JustMobile eSIM profile immediately.
            </p>

            <div className={styles.qrContainer}>
              <div className={styles.qrImageWrap}>
                {isLoadingEsim ? (
                  <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#697866' }}>Generating secure QR code...</p>
                  </div>
                ) : esimDetails?.qrCodeDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={esimDetails.qrCodeDataUrl}
                    alt="eSIM Activation QR"
                    width={220}
                    height={220}
                    style={{ display: 'block', borderRadius: '8px' }}
                  />
                ) : (
                  <div style={{ width: 220, height: 220, background: '#FAFBF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '13px' }}>QR Code Ready</p>
                  </div>
                )}
              </div>
            </div>

            {esimDetails && (
              <div style={{ width: '100%', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', color: '#556253', marginBottom: '4px', textAlign: 'left' }}>
                  <strong>SM-DP+ Server:</strong> {esimDetails.smdpAddress}
                </div>
                <div style={{ fontSize: '12px', color: '#556253', marginBottom: '8px', textAlign: 'left' }}>
                  <strong>Activation Code:</strong> {esimDetails.activationCode}
                </div>
                <div className={styles.lpaCodeBox}>
                  {esimDetails.lpa}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLpa}
                  style={{
                    width: '100%',
                    background: '#142420',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedLpa ? '✓ Copied LPA Activation String!' : '📋 Copy LPA String for Manual Activation'}
                </button>
              </div>
            )}

            <div style={{
              background: '#FAFBF8',
              border: '1px solid #d8e5d3',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#4c5a49',
              textAlign: 'left',
              lineHeight: 1.5,
            }}>
              <strong>Quick Device Setup:</strong>
              <br />• <strong>iPhone:</strong> Settings → Mobile → Add eSIM → Scan QR
              <br />• <strong>Android:</strong> Settings → Network & Internet → SIMs → Add eSIM
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
