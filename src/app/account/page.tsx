'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/config/api';
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

interface InvoiceRecord {
  invoiceId: string;
  custNo: string;
  issueDate: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  planName: string;
  dataAllowance: string;
  subtotal: number;
  gstAmount: number;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionRef: string;
}

interface OrderRecord {
  orderId: string;
  custNo: string;
  msn: string;
  status: string;
  planName: string;
  orderType: string;
  isEsim: boolean;
  createdAt: string;
  completedAt?: string;
  donorNetworkNote?: string;
  numType?: 'prepaid' | 'postpaid';
  dob?: string;
  arn?: string;
  donorCarrier?: string;
  rejectionReason?: string | null;
  rejectionCode?: string | null;
  portRetries?: number;
}

interface PortalPlanOption {
  id: string;
  name: string;
  tier: string;
  price: number;
  dataGb: number;
  planNo?: number;
  network?: string;
  popular?: boolean;
}

const PORTAL_PLANS: PortalPlanOption[] = [
  {
    id: 'plan-10gb',
    planNo: 11144153,
    name: 'JM 10GB Auto',
    tier: '10GB',
    price: 20.54,
    dataGb: 10,
    network: '4G',
  },
  {
    id: 'plan-15gb',
    planNo: 11144154,
    name: 'JM 15GB Auto',
    tier: '15GB',
    price: 24.60,
    dataGb: 15,
    network: '4G',
  },
  {
    id: 'plan-29gb',
    planNo: 11144155,
    name: 'JM 29GB Auto',
    tier: '29GB',
    price: 28.53,
    dataGb: 29,
    network: '4G',
  },
  {
    id: 'plan-65gb',
    planNo: 11144157,
    name: 'JM 65GB Auto',
    tier: '65GB',
    price: 37.55,
    dataGb: 65,
    network: '5G',
    popular: true,
  },
  {
    id: 'plan-100gb',
    planNo: 11144168,
    name: 'JM 100GB Auto',
    tier: '100GB',
    price: 46.40,
    dataGb: 100,
    network: '5G',
  },
  {
    id: 'plan-120gb',
    planNo: 11144169,
    name: 'JM 120GB Auto',
    tier: '120GB',
    price: 54.86,
    dataGb: 120,
    network: '5G',
  },
  {
    id: 'plan-150gb',
    planNo: 11144170,
    name: 'JM 150GB Auto',
    tier: '150GB',
    price: 59.89,
    dataGb: 150,
    network: '5G',
  },
  {
    id: 'plan-180gb',
    planNo: 11144171,
    name: 'JM 180GB Auto',
    tier: '180GB',
    price: 67.00,
    dataGb: 180,
    network: '5G',
  },
];

const COMING_SOON_TABS: Record<
  'switch_plan' | 'add_line' | 'device_calc',
  { badge: string; title: string; description: string; note: string }
> = {
  switch_plan: {
    badge: 'MOBILE PLANS · COMING SOON',
    title: 'Mobile Plans & Service Activation Coming Soon',
    description:
      'In-portal mobile plan selection, upgrades, and instant eSIM activation are currently being finalized with payment support.',
    note: 'You can browse our plans and advertised pricing on the main JustMobile homepage while portal checkout is prepared.',
  },
  add_line: {
    badge: 'ADDITIONAL LINES · COMING SOON',
    title: 'Add Another Line / eSIM Coming Soon',
    description:
      'Adding extra mobile services, secondary SIMs, and multi-line transfers directly inside your portal is coming soon.',
    note: 'Your primary customer profile and verification status remain saved and ready.',
  },
  device_calc: {
    badge: 'PHONES & DEVICES · COMING SOON',
    title: 'Handsets & Device Orders Coming Soon',
    description:
      'In-portal outright smartphone ordering and handset financing management are currently coming soon.',
    note: 'Check the main JustMobile website for our latest handset lineup and outright pricing.',
  },
};

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const API_URL = getApiUrl();

  const [usage, setUsage] = useState<CarrierUsage | null>(null);
  const [balance, setBalance] = useState<CarrierBalance | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [activeMobile, setActiveMobile] = useState<string | null>(null);
  const [activePlanName, setActivePlanName] = useState<string | null>(null);
  const [esimModalOpen, setEsimModalOpen] = useState<boolean>(false);
  const [esimDetails, setEsimDetails] = useState<EsimDetails | null>(null);
  const [isLoadingEsim, setIsLoadingEsim] = useState<boolean>(false);
  const [copiedLpa, setCopiedLpa] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSentNotice, setEmailSentNotice] = useState<string | null>(null);

  // Invoices & Porting state (INT-08 & INT-10)
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // In-portal Plan & Device Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [planModalTab, setPlanModalTab] = useState<'switch_plan' | 'add_line' | 'device_calc'>('switch_plan');

  // Donor Port Rejection & Resubmission State (INT-10 UX)
  const [resubmitNumType, setResubmitNumType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [resubmitDob, setResubmitDob] = useState<string>('');
  const [resubmitArn, setResubmitArn] = useState<string>('');
  const [resubmitDonor, setResubmitDonor] = useState<string>('Optus');
  const [isResubmitting, setIsResubmitting] = useState<boolean>(false);
  const [resubmitError, setResubmitError] = useState<string | null>(null);
  const [resubmitSuccess, setResubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Comprehensive data loader for live carrier sync
  const loadAccountData = (custNo: string) => {
    // 1. Fetch live unbilled usage
    fetch(`${API_URL}/api/carrier/customers/${custNo}/usage`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.dataMeter) {
          setUsage(data);
        }
      })
      .catch((err) => console.warn('Usage fetch error:', err));

    // 2. Fetch live balance & auto-pay
    fetch(`${API_URL}/api/carrier/customers/${custNo}/balance`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setBalance(data);
      })
      .catch((err) => console.warn('Balance fetch error:', err));

    // 3. Fetch active services
    fetch(`${API_URL}/api/carrier/customers/${custNo}/services`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.services && data.services.length > 0) {
          setServices(data.services);
          const mainService = data.services[0];
          setActiveMobile(mainService.serviceNumber || null);
          setActivePlanName(mainService.planName || null);
        } else {
          setServices([]);
          setActiveMobile(null);
          setActivePlanName(null);
        }
      })
      .catch((err) => console.warn('Services fetch error:', err));

    // 4. Fetch ATO-compliant tax invoices (INT-08)
    fetch(`${API_URL}/api/carrier/customers/${custNo}/invoices`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setInvoices(data);
      })
      .catch((err) => console.warn('Invoices fetch error:', err));

    // 5. Fetch customer orders & mobile porting status (INT-10)
    fetch(`${API_URL}/api/carrier/customers/${custNo}/orders`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.warn('Orders fetch error:', err));
  };

  useEffect(() => {
    if (!user) return;
    const custNo = user.custNo || '';
    if (custNo) {
      loadAccountData(custNo);
    }
  }, [user]);

  // Manual sync for mobile port status
  const handleSyncPort = async (orderId: string) => {
    setSyncingOrderId(orderId);
    setSyncMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/carrier/orders/${orderId}/sync-port`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setSyncMessage(data.message || 'Port synchronized successfully!');
        const custNo = user?.custNo || '';
        if (custNo) {
          const ordersRes = await fetch(`${API_URL}/api/carrier/customers/${custNo}/orders`);
          if (ordersRes.ok) {
            const freshOrders = await ordersRes.json();
            setOrders(freshOrders);
          }
        }
      }
    } catch (err) {
      console.warn('Sync port error:', err);
    } finally {
      setSyncingOrderId(null);
    }
  };

  // Resubmit rejected mobile port order with updated credentials (INT-10 UX)
  const handleResubmitPort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portOrder) return;
    setIsResubmitting(true);
    setResubmitError(null);
    setResubmitSuccess(null);

    try {
      const res = await fetch(`${API_URL}/api/carrier/orders/${portOrder.orderId}/resubmit-port`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numType: resubmitNumType,
          dob: resubmitNumType === 'prepaid' ? resubmitDob : undefined,
          arn: resubmitNumType === 'postpaid' ? resubmitArn : undefined,
          donorCarrier: resubmitDonor,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to resubmit number transfer.');
      }

      setResubmitSuccess(data.message || 'Details updated. Number transfer re-submitted to donor carrier.');
      const custNo = user?.custNo || '';
      if (custNo) {
        loadAccountData(custNo);
      }
    } catch (err: any) {
      setResubmitError(err.message || 'An error occurred while resubmitting transfer details.');
    } finally {
      setIsResubmitting(false);
    }
  };

  // Simulate donor carrier rejection for testing edge cases
  const handleSimulateRejection = async (orderId: string) => {
    try {
      await fetch(`${API_URL}/api/carrier/orders/${orderId}/simulate-rejection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Date of Birth does not match donor carrier records (Optus). Please verify the birthdate on your account.',
          donor: 'Optus',
        }),
      });
      const custNo = user?.custNo || '';
      if (custNo) {
        loadAccountData(custNo);
      }
    } catch (err) {
      console.warn('Simulation error:', err);
    }
  };

  // Load eSIM QR code details on demand
  const handleOpenEsimModal = async () => {
    setEsimModalOpen(true);
    if (esimDetails) return;

    setIsLoadingEsim(true);
    try {
      const custNo = user?.custNo || 'CUST990001';
      const res = await fetch(`${API_URL}/api/carrier/qrcodes/${custNo}`);
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

  const handleEmailEsim = async () => {
    if (!user || !esimDetails) return;
    const custNo = user.custNo || 'CUST990001';
    setIsSendingEmail(true);
    setEmailSentNotice(null);
    try {
      const res = await fetch(`${API_URL}/api/carrier/customers/${custNo}/orders/${esimDetails.orderId}/send-esim-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSentNotice(`QR code & LPA details emailed to ${user.email}`);
        setTimeout(() => setEmailSentNotice(null), 4000);
      } else {
        setEmailSentNotice('Could not dispatch email at this time.');
      }
    } catch {
      setEmailSentNotice('Network error while requesting email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // In-flight or completed mobile number porting order (INT-10)
  const portOrder = orders.find((o) => o.orderType === 'PORT_IN');

  useEffect(() => {
    if (portOrder) {
      if (portOrder.numType) setResubmitNumType(portOrder.numType);
      if (portOrder.dob) setResubmitDob(portOrder.dob);
      if (portOrder.arn) setResubmitArn(portOrder.arn);
      if (portOrder.donorCarrier) setResubmitDonor(portOrder.donorCarrier);
    }
  }, [portOrder]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const formatAccountId = (id?: string) => {
    if (!id) return 'JM-AU-990001';
    const clean = id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
    return `JM-AU-${clean}`;
  };

  const hasActivePlan = Boolean(
    activePlanName || 
    (services && services.length > 0) || 
    (orders && orders.some((o) => o.status === 'ACTIVE' || o.status === 'PORT_IN_PROGRESS'))
  );

  // Safe defaults from carrier or fallback
  const remainingGb = usage?.dataMeter?.dataRemainingGb ?? (hasActivePlan ? 42.4 : 0);
  const totalGb = usage?.dataMeter?.planTotalGb ?? (hasActivePlan ? 65 : 0);
  const percentRemaining = totalGb > 0 ? Math.round((remainingGb / totalGb) * 100) : 0;

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }} suppressHydrationWarning>
        <p>Loading your account details...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer} suppressHydrationWarning>
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
            <h1 className={styles.greetingTitle}>
              {hasActivePlan ? `Welcome back, ${user.name.split(' ')[0]}` : `Welcome to JustMobile, ${user.name.split(' ')[0]}`}
            </h1>
            <p className={styles.greetingSub}>
              Customer ID: {user.custNo || formatAccountId(user.id)} · {hasActivePlan ? 'Connected to Telstra 5G Wholesale Network' : 'Account Ready · Plans & Devices Coming Soon'}
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Left Column: Service Details & Port Status */}
          <div>
            {/* 1. Live Mobile Porting Tracker (INT-10) */}
            {portOrder && portOrder.status === 'PORT_IN_PROGRESS' && (
              <div className={styles.portCard}>
                <div className={styles.portHeader}>
                  <h3 className={styles.portTitle}>
                    <span>Mobile Number Port In-Flight</span>
                  </h3>
                  <span className={styles.badgePortInProgress}>
                    <span className={styles.pulseDot} />
                    PORT IN PROGRESS
                  </span>
                </div>
                <div className={styles.portBody}>
                  Transferring <strong>{portOrder.msn}</strong> to JustMobile ({portOrder.planName || 'JM 65GB Auto'}).
                  <br />
                  Carrier porting orders are processed through Australian donor carriers (15m to 24h window). Our durable background worker is continuously monitoring carrier release status.
                  {syncMessage && (
                    <div style={{ marginTop: '8px', color: '#15803d', fontWeight: 600 }}>
                      {syncMessage}
                    </div>
                  )}
                </div>
                <div className={styles.portActions}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={styles.syncPortBtn}
                      onClick={() => handleSyncPort(portOrder.orderId)}
                      disabled={syncingOrderId === portOrder.orderId}
                    >
                      {syncingOrderId === portOrder.orderId ? 'Checking Carrier Release...' : 'Check Port Status'}
                    </button>
                    <button
                      type="button"
                      className={styles.syncPortBtn}
                      onClick={() => handleSimulateRejection(portOrder.orderId)}
                      style={{ background: '#fff1f2', borderColor: '#fecdd3', color: '#be123c', fontSize: '12px' }}
                      title="Test helper: simulate what happens when Optus/Vodafone rejects transfer"
                    >
                      Simulate Rejection
                    </button>
                  </div>
                  <span style={{ fontSize: '12px', color: '#718096' }}>
                    Order ID: {portOrder.orderId}
                  </span>
                </div>
              </div>
            )}

            {/* 2. Donor Carrier Rejection Alert & Resubmission Form (INT-10 UX) */}
            {portOrder && (portOrder.status === 'REJECTED' || (portOrder.status === 'FAILED' && portOrder.rejectionReason)) && (
              <div className={styles.portCardRejected}>
                <div className={styles.portHeader}>
                  <h3 className={styles.portTitleRejected}>
                    <span>Transfer Action Required</span>
                  </h3>
                  <span className={styles.badgePortRejected}>
                    DECLINED BY PREVIOUS CARRIER
                  </span>
                </div>

                <div className={styles.portBody}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#142420' }}>
                    Your previous carrier (<strong>{portOrder.donorCarrier || 'Donor Network'}</strong>) declined the release of mobile number <strong>{portOrder.msn}</strong>.
                  </p>

                  <div className={styles.rejectionReasonBox}>
                    <div style={{ fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#991b1b', marginBottom: '4px' }}>
                      Carrier Reason:
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#7f1d1d', fontWeight: 500 }}>
                      "{portOrder.rejectionReason || 'Identity details do not match the records on file with your previous carrier.'}"
                    </div>
                  </div>

                  <p style={{ margin: '12px 0 14px 0', fontSize: '13px', color: '#4b5563' }}>
                    This usually means a minor typo in your date of birth or account number. Please verify your details below and resubmit:
                  </p>

                  {resubmitSuccess && (
                    <div className={styles.portalAlertSuccess} style={{ marginBottom: '14px' }}>
                      {resubmitSuccess}
                    </div>
                  )}

                  {resubmitError && (
                    <div className={styles.portalAlertError} style={{ marginBottom: '14px' }}>
                      {resubmitError}
                    </div>
                  )}

                  <form onSubmit={handleResubmitPort} className={styles.rejectionForm}>
                    <div className={styles.formRow}>
                      <label className={styles.fieldLabel}>Previous Service Type</label>
                      <div className={styles.serviceTypeToggle}>
                        <button
                          type="button"
                          className={`${styles.typeToggleBtn} ${resubmitNumType === 'prepaid' ? styles.typeToggleActive : ''}`}
                          onClick={() => setResubmitNumType('prepaid')}
                        >
                          Prepaid Service
                        </button>
                        <button
                          type="button"
                          className={`${styles.typeToggleBtn} ${resubmitNumType === 'postpaid' ? styles.typeToggleActive : ''}`}
                          onClick={() => setResubmitNumType('postpaid')}
                        >
                          Postpaid (Monthly Bill)
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGridTwo}>
                      <div>
                        <label className={styles.fieldLabel}>Previous Carrier</label>
                        <select
                          className={styles.fieldInput}
                          value={resubmitDonor}
                          onChange={(e) => setResubmitDonor(e.target.value)}
                        >
                          <option value="Optus">Optus</option>
                          <option value="Telstra">Telstra</option>
                          <option value="Vodafone">Vodafone</option>
                          <option value="TPG">TPG / iiNet</option>
                          <option value="Amaysim">Amaysim</option>
                          <option value="Woolworths Mobile">Everyday Mobile (Woolworths)</option>
                          <option value="Boost Mobile">Boost Mobile</option>
                          <option value="ALDI Mobile">ALDI Mobile</option>
                          <option value="Other">Other Australian Carrier</option>
                        </select>
                      </div>

                      {resubmitNumType === 'prepaid' ? (
                        <div>
                          <label className={styles.fieldLabel}>Date of Birth on Old Account</label>
                          <input
                            type="date"
                            className={styles.fieldInput}
                            value={resubmitDob}
                            onChange={(e) => setResubmitDob(e.target.value)}
                            required
                          />
                          <span className={styles.fieldHelp}>Must match the birthdate on your old carrier registration</span>
                        </div>
                      ) : (
                        <div>
                          <label className={styles.fieldLabel}>Account Number on Bill</label>
                          <input
                            type="text"
                            className={styles.fieldInput}
                            placeholder="e.g. 9841029481"
                            value={resubmitArn}
                            onChange={(e) => setResubmitArn(e.target.value)}
                            required
                          />
                          <span className={styles.fieldHelp}>Look for 'Account Number' on your latest monthly bill</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.resubmitActions}>
                      <button
                        type="submit"
                        className={styles.btnResubmitPort}
                        disabled={isResubmitting}
                      >
                        {isResubmitting ? 'Submitting to Carrier...' : 'Update Details & Resubmit Transfer'}
                      </button>

                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        Order ID: {portOrder.orderId} · Retries: {portOrder.portRetries || 0}
                      </span>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 3. Port Completed Card */}
            {portOrder && portOrder.status === 'ACTIVE' && (
              <div className={styles.portCardActive}>
                <div className={styles.portHeader}>
                  <h3 className={styles.portTitle}>
                    <span>✓ Mobile Number Port Completed</span>
                  </h3>
                  <span className={styles.badgePortActive}>
                    ✓ ACTIVE ON TELSTRA 5G
                  </span>
                </div>
                <div className={styles.portBody}>
                  Mobile number <strong>{portOrder.msn}</strong> has been released by your previous carrier and is fully active on JustMobile 5G Wholesale.
                  {portOrder.completedAt && (
                    <div style={{ fontSize: '12px', color: '#556253', marginTop: '4px' }}>
                      Activated at: {new Date(portOrder.completedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasActivePlan ? (
              <div className={styles.card}>
                <div className={styles.serviceRow}>
                  <div>
                    <div className={styles.mobileNum}>
                      {activeMobile || '04XX XXX XXX'}
                    </div>
                    <span style={{ fontSize: '13px', color: '#697866' }}>
                      Allocated Telstra Wholesale 5G Mobile · Unlimited AU Calls & Texts
                    </span>
                  </div>
                  <span className={styles.statusActive}>Active · eSIM</span>
                </div>

                <h2 className={styles.cardTitle}>
                  {activePlanName} (${(PORTAL_PLANS.find(p => p.name === activePlanName || (activePlanName && activePlanName.includes(p.tier)))?.price ?? 37.55).toFixed(2)}/mth)
                </h2>

                {/* Monthly data meter synced with live carrier usage */}
                <div className={styles.meterContainer}>
                  <div className={styles.meterInfo}>
                    <span>Current Data Cycle (Renews 28th)</span>
                    <strong>{remainingGb} GB remaining of {totalGb} GB</strong>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${percentRemaining}%` }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={handleOpenEsimModal}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>View eSIM Profile</span>
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondaryUpgrade}
                    onClick={() => {
                      setPlanModalTab('switch_plan');
                      setIsPlanModalOpen(true);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Switch Plan · Coming Soon</span>
                  </button>
                  <button
                    type="button"
                    className={styles.btnAddLineBtn}
                    onClick={() => {
                      setPlanModalTab('add_line');
                      setIsPlanModalOpen(true);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Add Another Line · Coming Soon</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.card} style={{ background: '#ffffff', border: '1.5px solid #dce4d8' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#f4faee',
                    border: '1.5px solid #a3dc8f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#49721d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <div>
                    <span style={{
                      background: '#e8f3e5',
                      color: '#3b5c28',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      display: 'inline-block',
                      marginBottom: '6px'
                    }}>
                      COMING SOON · PORTAL ACTIVATIONS
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#142420', margin: '0 0 6px 0' }}>
                      In-portal mobile plans &amp; phone orders are coming soon
                    </h2>
                    <p style={{ fontSize: '13.5px', color: '#556253', margin: 0, lineHeight: 1.5 }}>
                      Your JustMobile customer profile <strong>#{user.custNo || '—'}</strong> is registered and verified. Selecting plans, activating eSIM lines, and ordering handsets inside the customer portal are coming soon.
                    </p>
                  </div>
                </div>

                {/* 3 Step Coming Soon Overview */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  background: '#f9fbf8',
                  border: '1px solid #e5ede2',
                  borderRadius: '12px',
                  padding: '16px',
                  margin: '18px 0 20px 0'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#142420', marginBottom: '4px' }}>
                      1. Mobile Plans · Coming Soon
                    </div>
                    <div style={{ fontSize: '12px', color: '#687765' }}>
                      Month-to-month Telstra Wholesale 4G/5G plans will be available to activate inside your portal soon.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#142420', marginBottom: '4px' }}>
                      2. Pick Your Number · Coming Soon
                    </div>
                    <div style={{ fontSize: '12px', color: '#687765' }}>
                      Transfer your existing 04XX mobile number or choose a new number directly in-portal soon.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#142420', marginBottom: '4px' }}>
                      3. Phones &amp; eSIM · Coming Soon
                    </div>
                    <div style={{ fontSize: '12px', color: '#687765' }}>
                      In-portal handset ordering and instant digital eSIM activation are launching soon.
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => {
                      setPlanModalTab('switch_plan');
                      setIsPlanModalOpen(true);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>Mobile Plans · Coming Soon</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    className={styles.btnSecondaryUpgrade}
                    onClick={() => {
                      setPlanModalTab('device_calc');
                      setIsPlanModalOpen(true);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>Outright Phones · Coming Soon</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Handset Financing Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Device &amp; Financing</h2>
              <>
                <div className={styles.detailsList}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Device Status</span>
                    <span className={styles.detailValue}>Coming Soon</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Handset Orders</span>
                    <span className={styles.detailValue} style={{ color: '#49721d', fontWeight: 600 }}>
                      Coming Soon
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Device Financing</span>
                    <span className={styles.detailValue}>Coming Soon</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Device Upgrade</span>
                    <span className={styles.detailValue}>Flagship Handsets — Coming Soon</span>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className={styles.btnSecondaryUpgrade}
                    onClick={() => {
                      setPlanModalTab('device_calc');
                      setIsPlanModalOpen(true);
                    }}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Browse Handsets · Coming Soon</span>
                  </button>
                </div>
              </>
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
                  <span className={styles.detailValue}>{user.phone || activeMobile || 'No mobile linked yet'}</span>
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
                Next invoice due:{' '}
                <strong>
                  {hasActivePlan
                    ? `${balance?.nextInvoiceDate || '28 Nov 2026'} ($${balance?.nextInvoiceAmount?.toFixed(2) || '37.55'})`
                    : 'No upcoming invoice (no active plan)'}
                </strong>
              </p>
              <div style={{ fontSize: '13px', color: hasActivePlan ? '#789937' : '#718096', fontWeight: 600, marginBottom: '18px' }}>
                {balance?.paymentMethod || 'No card registered'} ({balance?.autoPayStatus || (hasActivePlan ? 'Auto-pay active' : 'Auto-pay inactive')})
              </div>

              {/* ATO Tax Invoices Section (INT-08) */}
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '18px 0 6px 0', color: '#142420', borderTop: '1px solid #eef2ec', paddingTop: '16px' }}>
                Tax Invoices & Billing History
              </h3>
              <p style={{ fontSize: '12px', color: '#697866', margin: '0 0 12px 0' }}>
                Formal Australian Tax Invoices with 10% GST breakdown & ABN 48 672 819 204.
              </p>

              <div className={styles.invoiceList}>
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <div key={inv.invoiceId} className={styles.invoiceItem}>
                      <div className={styles.invoiceMeta}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className={styles.invoiceId}>{inv.invoiceId}</span>
                          <span className={styles.invoiceStatus}>{inv.status}</span>
                        </div>
                        <span className={styles.invoicePeriod}>
                          Cycle: {inv.periodStart} – {inv.periodEnd}
                        </span>
                      </div>
                      <div className={styles.invoiceRight}>
                        <span className={styles.invoiceAmount}>${inv.amount.toFixed(2)}</span>
                        <a
                          href={`${API_URL}/api/carrier/customers/${user.custNo || 'CUST990001'}/invoices/${inv.invoiceId}/pdf`}
                          download={`JustMobile-Tax-Invoice-${inv.invoiceId}.pdf`}
                          className={styles.downloadPdfBtn}
                          title="Download ATO-compliant PDF Tax Invoice"
                        >
                          <span>Download PDF</span>
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '12.5px', color: '#718096', fontStyle: 'italic', margin: '8px 0' }}>
                    No historical invoices loaded.
                  </p>
                )}
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
                  {copiedLpa ? 'Copied LPA Activation String' : 'Copy LPA String for Manual Activation'}
                </button>
                <button
                  type="button"
                  onClick={handleEmailEsim}
                  disabled={isSendingEmail}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    background: '#f7faf3',
                    color: '#3b6b14',
                    border: '1.5px solid #789937',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isSendingEmail ? 'Sending via Hostinger SMTP...' : 'Email Me This QR Code'}
                </button>
                {emailSentNotice && (
                  <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#2e7d32', fontWeight: 600 }}>
                    {emailSentNotice}
                  </div>
                )}
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

      {/* =====================================================================
          IN-PORTAL PLAN & DEVICE MANAGEMENT MODAL (COMING SOON)
          ===================================================================== */}
      {isPlanModalOpen && (() => {
        const activeComingSoon = COMING_SOON_TABS[planModalTab];
        return (
          <div className={styles.modalOverlay} onClick={() => setIsPlanModalOpen(false)} role="dialog" aria-modal="true">
            <div className={styles.planModalWide} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeaderRow}>
                <div>
                  <h2 className={styles.modalTitleLarge}>Plan &amp; Service Management</h2>
                  <p className={styles.modalSubtitleMuted}>
                    Connected to Cust #{user.custNo || '—'} · In-Portal Upgrades &amp; Orders Coming Soon
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setIsPlanModalOpen(false)}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* In-portal Tabs */}
              <div className={styles.portalTabsNav}>
                <button
                  type="button"
                  className={`${styles.portalTabBtn} ${planModalTab === 'switch_plan' ? styles.portalTabBtnActive : ''}`}
                  onClick={() => setPlanModalTab('switch_plan')}
                >
                  Mobile Plans
                </button>
                <button
                  type="button"
                  className={`${styles.portalTabBtn} ${planModalTab === 'add_line' ? styles.portalTabBtnActive : ''}`}
                  onClick={() => setPlanModalTab('add_line')}
                >
                  Add Another Line / SIM
                </button>
                <button
                  type="button"
                  className={`${styles.portalTabBtn} ${planModalTab === 'device_calc' ? styles.portalTabBtnActive : ''}`}
                  onClick={() => setPlanModalTab('device_calc')}
                >
                  Phones &amp; Financing
                </button>
              </div>

              {/* Uniform Coming Soon View for Portal Plans, New Lines & Handsets */}
              <div
                style={{
                  background: '#f9fbf8',
                  border: '1.5px solid #dce4d8',
                  borderRadius: '16px',
                  padding: '36px 28px',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    background: '#e8f3e5',
                    color: '#3b5c28',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '5px 14px',
                    borderRadius: '9999px',
                    display: 'inline-block',
                    marginBottom: '14px',
                  }}
                >
                  {activeComingSoon.badge}
                </span>

                <h3
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#142420',
                    margin: '0 0 10px 0',
                  }}
                >
                  {activeComingSoon.title}
                </h3>

                <p
                  style={{
                    fontSize: '14px',
                    color: '#4c5a49',
                    maxWidth: '540px',
                    margin: '0 auto 14px auto',
                    lineHeight: 1.6,
                  }}
                >
                  {activeComingSoon.description}
                </p>

                <p
                  style={{
                    fontSize: '12.5px',
                    color: '#697866',
                    maxWidth: '500px',
                    margin: '0 auto 24px auto',
                    lineHeight: 1.5,
                  }}
                >
                  {activeComingSoon.note}
                </p>

                <button
                  type="button"
                  className={styles.portalConfirmBtn}
                  style={{ maxWidth: '280px', margin: '0 auto' }}
                  onClick={() => setIsPlanModalOpen(false)}
                >
                  Back to My Account
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
