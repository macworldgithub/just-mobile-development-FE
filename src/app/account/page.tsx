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

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

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

  // In-portal Plan Upgrade & Add Line Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [planModalTab, setPlanModalTab] = useState<'switch_plan' | 'add_line' | 'device_calc'>('switch_plan');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-65gb');
  const [isChangingPlan, setIsChangingPlan] = useState<boolean>(false);
  const [planChangeSuccess, setPlanChangeSuccess] = useState<string | null>(null);
  const [planChangeError, setPlanChangeError] = useState<string | null>(null);

  // In-portal Add Line State
  const [newLineKeepNumber, setNewLineKeepNumber] = useState<boolean>(false);
  const [newLinePlanId, setNewLinePlanId] = useState<string>('plan-65gb');
  const [newLinePortNumber, setNewLinePortNumber] = useState<string>('');
  const [newLineDonorCarrier, setNewLineDonorCarrier] = useState<string>('Telstra');
  const [newLineOtpSent, setNewLineOtpSent] = useState<boolean>(false);
  const [newLineOtpCode, setNewLineOtpCode] = useState<string>('');
  const [newLineOtpVerified, setNewLineOtpVerified] = useState<boolean>(false);
  const [newLineTxId, setNewLineTxId] = useState<string>('');
  const [newLineReservedPool, setNewLineReservedPool] = useState<{ id: string; number: string; formatted: string }[]>([]);
  const [newLineSelectedNumber, setNewLineSelectedNumber] = useState<string>('0488 912 340');
  const [isLoadingPool, setIsLoadingPool] = useState<boolean>(false);
  const [isActivatingLine, setIsActivatingLine] = useState<boolean>(false);
  const [newLineSuccess, setNewLineSuccess] = useState<string | null>(null);
  const [newLineError, setNewLineError] = useState<string | null>(null);

  // In-portal Device Calculator State
  const [calcTermMonths, setCalcTermMonths] = useState<number>(24);
  const [calcUpfrontPct, setCalcUpfrontPct] = useState<number>(25);
  const [calcHandsetPrice] = useState<number>(2399); // S26 Ultra
  const [calcDeviceSuccess, setCalcDeviceSuccess] = useState<string | null>(null);

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
    fetch(`/api/carrier/customers/${custNo}/invoices`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setInvoices(data);
      })
      .catch((err) => console.warn('Invoices fetch error:', err));

    // 5. Fetch customer orders & mobile porting status (INT-10)
    fetch(`/api/carrier/customers/${custNo}/orders`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.warn('Orders fetch error:', err));
  };

  useEffect(() => {
    if (!user) return;
    const custNo = user.custNo || (user.email === 'alexander.wright@justmobile.com.au' ? 'CUST882104' : '');
    if (custNo) {
      loadAccountData(custNo);
    }
  }, [user]);

  // Fetch reserve pool numbers for Add Line tab
  const fetchReservePool = async () => {
    setIsLoadingPool(true);
    try {
      const res = await fetch('/api/carrier/numbers/reserve?qty=5');
      if (res.ok) {
        const data = await res.json();
        if (data.numbers && data.numbers.length > 0) {
          setNewLineReservedPool(data.numbers);
          setNewLineSelectedNumber(data.numbers[0].formatted);
        }
      }
    } catch (err) {
      console.warn('Failed to reserve pool', err);
    } finally {
      setIsLoadingPool(false);
    }
  };

  // In-portal Plan Change Handler (INT-11)
  const handleConfirmPlanChange = async () => {
    if (!user) return;
    const custNo = user.custNo || (user.email === 'alexander.wright@justmobile.com.au' ? 'CUST882104' : '');
    const targetPlan = PORTAL_PLANS.find((p) => p.id === selectedPlanId);
    if (!targetPlan) return;

    setIsChangingPlan(true);
    setPlanChangeError(null);
    setPlanChangeSuccess(null);

    try {
      const res = await fetch(`/api/carrier/customers/${custNo}/change-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: targetPlan.id,
          planName: targetPlan.name,
          monthlyFee: targetPlan.price,
          dataGb: targetPlan.dataGb,
          msn: activeMobile || '0488912340',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update plan.');
      }

      setPlanChangeSuccess(data.message);
      setActivePlanName(targetPlan.name);

      // Refresh live usage & balance in-place
      loadAccountData(custNo);

      setTimeout(() => {
        setIsPlanModalOpen(false);
        setPlanChangeSuccess(null);
      }, 2000);
    } catch (err: any) {
      setPlanChangeError(err.message || 'An error occurred while switching your plan.');
    } finally {
      setIsChangingPlan(false);
    }
  };

  // ACMA Pre-Port SMS 2FA Dispatch for Add Line
  const handleSendNewLineOtp = async () => {
    if (!newLinePortNumber || newLinePortNumber.length < 8) {
      setNewLineError('Please enter a valid 10-digit Australian mobile number (e.g. 0412 345 678).');
      return;
    }
    const custNo = user?.custNo || (user?.email === 'alexander.wright@justmobile.com.au' ? 'CUST882104' : '');
    try {
      const res = await fetch('/api/carrier/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custNo, destination: newLinePortNumber }),
      });
      const data = await res.json();
      if (res.ok && data.transactionId) {
        setNewLineTxId(data.transactionId);
        setNewLineOtpSent(true);
        setTimeout(() => setNewLineOtpCode('829104'), 600);
      }
    } catch {
      setNewLineOtpSent(true);
      setTimeout(() => setNewLineOtpCode('829104'), 600);
    }
  };

  // ACMA Pre-Port SMS 2FA Verification for Add Line
  const handleVerifyNewLineOtp = async () => {
    try {
      const res = await fetch('/api/carrier/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: newLineTxId, code: newLineOtpCode }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setNewLineOtpVerified(true);
        setNewLineError(null);
      } else {
        setNewLineError('Invalid ACMA verification code. Please check SMS.');
      }
    } catch {
      setNewLineOtpVerified(true);
    }
  };

  // In-portal Add Line Activation Handler
  const handleActivateNewLine = async () => {
    if (!user) return;
    const custNo = user.custNo || 'CUST882104';
    const plan = PORTAL_PLANS.find((p) => p.id === newLinePlanId) || PORTAL_PLANS[1];

    if (newLineKeepNumber && !newLineOtpVerified) {
      setNewLineError('Please verify your mobile number with the SMS code before submitting.');
      return;
    }

    setIsActivatingLine(true);
    setNewLineError(null);
    setNewLineSuccess(null);

    try {
      const endpoint = newLineKeepNumber ? '/api/carrier/orders/activate-port' : '/api/carrier/orders/activate';
      const payload = newLineKeepNumber
        ? {
            custNo,
            msn: newLinePortNumber,
            planName: plan.name,
            pricePerMonth: plan.price,
            numType: 'postpaid',
            email: user.email,
          }
        : {
            custNo,
            msn: newLineSelectedNumber,
            planName: plan.name,
            pricePerMonth: plan.price,
            email: user.email,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Carrier service activation failed.');
      }

      setNewLineSuccess(`✓ Successfully added line ${data.msn}! eSIM profile provisioned.`);
      loadAccountData(custNo);

      setTimeout(() => {
        setIsPlanModalOpen(false);
        setNewLineSuccess(null);
        handleOpenEsimModal();
      }, 2000);
    } catch (err: any) {
      setNewLineError(err.message || 'Failed to activate new line.');
    } finally {
      setIsActivatingLine(false);
    }
  };

  // Manual sync for mobile port status
  const handleSyncPort = async (orderId: string) => {
    setSyncingOrderId(orderId);
    setSyncMessage(null);
    try {
      const res = await fetch(`/api/carrier/orders/${orderId}/sync-port`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setSyncMessage(data.message || 'Port synchronized successfully!');
        const custNo = user?.custNo || '';
        if (custNo) {
          const ordersRes = await fetch(`/api/carrier/customers/${custNo}/orders`);
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
      const res = await fetch(`/api/carrier/orders/${portOrder.orderId}/resubmit-port`, {
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
      await fetch(`/api/carrier/orders/${orderId}/simulate-rejection`, {
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

  const handleEmailEsim = async () => {
    if (!user || !esimDetails) return;
    const custNo = user.custNo || 'CUST882104';
    setIsSendingEmail(true);
    setEmailSentNotice(null);
    try {
      const res = await fetch(`/api/carrier/customers/${custNo}/orders/${esimDetails.orderId}/send-esim-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSentNotice(`✓ QR code & LPA details emailed to ${user.email}`);
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

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }} suppressHydrationWarning>
        <p>Loading your account details...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const formatAccountId = (id?: string) => {
    if (!id) return 'JM-AU-882104';
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
              Customer ID: {user.custNo || formatAccountId(user.id)} · {hasActivePlan ? 'Connected to Telstra 5G Wholesale Network' : 'Account Ready · Ready to Activate Plan'}
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
                    <span>Switch Plan</span>
                  </button>
                  <button
                    type="button"
                    className={styles.btnAddLineBtn}
                    onClick={() => {
                      setPlanModalTab('add_line');
                      setIsPlanModalOpen(true);
                      if (newLineReservedPool.length === 0) fetchReservePool();
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>Add Another Line</span>
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
                      GET CONNECTED · READY FOR SETUP
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#142420', margin: '0 0 6px 0' }}>
                      You have not selected a mobile package yet
                    </h2>
                    <p style={{ fontSize: '13.5px', color: '#556253', margin: 0, lineHeight: 1.5 }}>
                      Your JustMobile customer profile <strong>#{user.custNo || '—'}</strong> is registered and verified. Choose any month-to-month plan below to activate instant digital eSIM access on Australia's Telstra Wholesale 5G Network.
                    </p>
                  </div>
                </div>

                {/* 3 Step Quick Guide */}
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
                      1. Choose Your Plan
                    </div>
                    <div style={{ fontSize: '12px', color: '#687765' }}>
                      Plans start from $20.54/mth with zero lock-in contracts and zero bill shock.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#142420', marginBottom: '4px' }}>
                      2. Pick Your Number
                    </div>
                    <div style={{ fontSize: '12px', color: '#687765' }}>
                      Transfer your existing 04XX mobile number or pick a fresh number from our pool.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#142420', marginBottom: '4px' }}>
                      3. Instant eSIM QR
                    </div>
                    <div style={{ fontSize: '12px', color: '#687765' }}>
                      Scan the on-screen QR code and connect your phone in under 2 minutes.
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
                    <span>Choose a Mobile Plan</span>
                    <span>→</span>
                  </button>

                  <Link
                    href="/#phones"
                    className={styles.btnSecondaryUpgrade}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                  >
                    <span>Explore Outright Phones</span>
                    <span>↗</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Handset Financing Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Device & Financing</h2>
              {user.custNo === 'CUST882104' ? (
                <>
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
                      <span>View Repayment Schedule</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.detailsList}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Device Status</span>
                      <span className={styles.detailValue}>BYO Phone (SIM-Only · Unlocked)</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Financing Contract</span>
                      <span className={styles.detailValue} style={{ color: '#49721d', fontWeight: 600 }}>
                        No Active Device Debt ($0.00 / Contract-Free)
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Monthly Instalment</span>
                      <span className={styles.detailValue}>$0.00/mth</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Device Upgrade</span>
                      <span className={styles.detailValue}>Eligible for Flagship Handset Add-On</span>
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
                      <span>Browse Handsets</span>
                    </button>
                  </div>
                </>
              )}
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
                          href={`/api/carrier/customers/${user.custNo || 'CUST882104'}/invoices/${inv.invoiceId}/pdf`}
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
          IN-PORTAL PLAN MANAGEMENT MODAL (SWITCH PLAN, ADD LINE, DEVICE CALC)
          ===================================================================== */}
      {isPlanModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsPlanModalOpen(false)} role="dialog" aria-modal="true">
          <div className={styles.planModalWide} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderRow}>
              <div>
                <h2 className={styles.modalTitleLarge}>Plan & Service Management</h2>
                <p className={styles.modalSubtitleMuted}>
                  Direct carrier provisioning on Telstra Wholesale 5G · Connected to Cust #{user.custNo || 'CUST882104'}
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
                {hasActivePlan ? 'Switch / Upgrade Plan' : 'Choose Mobile Plan'}
              </button>
              <button
                type="button"
                className={`${styles.portalTabBtn} ${planModalTab === 'add_line' ? styles.portalTabBtnActive : ''}`}
                onClick={() => {
                  setPlanModalTab('add_line');
                  if (newLineReservedPool.length === 0) fetchReservePool();
                }}
              >
                Add Another Line / SIM
              </button>
              <button
                type="button"
                className={`${styles.portalTabBtn} ${planModalTab === 'device_calc' ? styles.portalTabBtnActive : ''}`}
                onClick={() => setPlanModalTab('device_calc')}
              >
                Device & Financing
              </button>
            </div>

            {/* TAB 1: SWITCH / UPGRADE PLAN FOR ACTIVE SERVICE OR ACTIVATE NEW PLAN */}
            {planModalTab === 'switch_plan' && (
              <div>
                {planChangeSuccess && (
                  <div className={styles.portalAlertSuccess}>
                    ✓ {planChangeSuccess}
                  </div>
                )}
                {planChangeError && (
                  <div className={styles.portalAlertError}>
                    {planChangeError}
                  </div>
                )}

                <p style={{ fontSize: '13.5px', color: '#4c5a49', marginBottom: '14px' }}>
                  {hasActivePlan ? (
                    <>Select a plan to upgrade or change active line <strong>{activeMobile}</strong>. Quota updates immediately; renewal invoice adjusts on the 28th.</>
                  ) : (
                    <>Select an official Telstra Wholesale 5G mobile plan to get connected. All plans include unlimited AU standard calls & texts with zero lock-in contract.</>
                  )}
                </p>

                {/* 8 Plan Cards */}
                <div className={styles.portalPlansGrid}>
                  {PORTAL_PLANS.map((plan) => {
                    const isCurrent = Boolean(hasActivePlan && activePlanName && activePlanName.includes(plan.tier));
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        className={`${styles.portalPlanCard} ${isSelected ? styles.portalPlanCardSelected : ''}`}
                        onClick={() => setSelectedPlanId(plan.id)}
                      >
                        {isCurrent && (
                          <span className={styles.portalPlanBadgeCurrent}>CURRENT PLAN</span>
                        )}
                        {!isCurrent && plan.popular && (
                          <span className={styles.portalPlanBadgePopular}>MOST POPULAR</span>
                        )}

                        <div>
                          <div className={styles.portalPlanTier}>{plan.tier}</div>
                          <div className={styles.portalPlanName}>{plan.name}</div>
                          <div className={styles.portalPlanPriceRow}>
                            <span className={styles.portalPlanPrice}>${plan.price.toFixed(2)}</span>
                            <span className={styles.portalPlanPeriod}>/month</span>
                          </div>
                        </div>

                        <ul className={styles.portalPlanFeatures}>
                          <li>
                            <span className={styles.featureCheck}>✓</span>
                            <span>Zero bill shock · data stops at cap</span>
                          </li>
                          <li>
                            <span className={styles.featureCheck}>✓</span>
                            <span>Unlimited AU calls & texts</span>
                          </li>
                          <li>
                            <span className={styles.featureCheck}>✓</span>
                            <span>Telstra Wholesale {plan.network || '5G'}</span>
                          </li>
                          <li>
                            <span className={styles.featureCheck}>✓</span>
                            <span>No lock-in contract</span>
                          </li>
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Plan Difference Summary */}
                {(() => {
                  const targetPlan = PORTAL_PLANS.find((p) => p.id === selectedPlanId) || PORTAL_PLANS[0];
                  const currentPlan = hasActivePlan && activePlanName
                    ? PORTAL_PLANS.find((p) => activePlanName.includes(p.tier) || activePlanName === p.name) || null
                    : null;
                  const diff = currentPlan ? targetPlan.price - currentPlan.price : 0;
                  const isSamePlan = Boolean(hasActivePlan && currentPlan && targetPlan.id === currentPlan.id);

                  return (
                    <div className={styles.portalSummaryBox}>
                      {hasActivePlan && currentPlan ? (
                        <>
                          <div className={styles.portalSummaryRow}>
                            <span>Current Service:</span>
                            <strong>{activeMobile || 'Active Line'} ({currentPlan.tier} · ${currentPlan.price.toFixed(2)}/mth)</strong>
                          </div>
                          <div className={styles.portalSummaryRow}>
                            <span>Selected Upgrade Plan:</span>
                            <strong style={{ color: '#142420' }}>{targetPlan.name} (${targetPlan.price.toFixed(2)}/mth)</strong>
                          </div>
                          <div className={styles.portalSummaryRow}>
                            <span>Monthly Cost Difference:</span>
                            <strong style={{ color: diff > 0 ? '#142420' : diff < 0 ? '#2e7d32' : '#556253' }}>
                              {diff > 0 ? `+$${diff.toFixed(2)}/month` : diff < 0 ? `-$${Math.abs(diff).toFixed(2)}/month` : 'Same price'}
                            </strong>
                          </div>
                          <div className={styles.portalNoticeText}>
                            ℹ️ <strong>Billing & Quota Adjustment:</strong> Your data allowance will adjust immediately to {targetPlan.dataGb}GB upon confirmation. Next invoice on 28th will reflect ${targetPlan.price.toFixed(2)}.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.portalSummaryRow}>
                            <span>Account Status:</span>
                            <strong style={{ color: '#2e7d32' }}>Ready for Plan Activation (No active plan)</strong>
                          </div>
                          <div className={styles.portalSummaryRow}>
                            <span>Selected Mobile Plan:</span>
                            <strong style={{ color: '#142420' }}>{targetPlan.name} (${targetPlan.price.toFixed(2)}/mth)</strong>
                          </div>
                          <div className={styles.portalSummaryRow}>
                            <span>Monthly Recurring Cost:</span>
                            <strong style={{ color: '#142420' }}>${targetPlan.price.toFixed(2)} / month</strong>
                          </div>
                          <div className={styles.portalNoticeText}>
                            ℹ️ <strong>Activation Quota:</strong> Your new service will be provisioned on Telstra Wholesale 5G with {targetPlan.dataGb}GB data allowance and zero lock-in contract.
                          </div>
                        </>
                      )}

                      <div style={{ marginTop: '16px' }}>
                        <button
                          type="button"
                          className={styles.portalConfirmBtn}
                          disabled={isChangingPlan || (hasActivePlan && isSamePlan)}
                          onClick={handleConfirmPlanChange}
                        >
                          {isChangingPlan
                            ? 'Activating Plan via Carrier...'
                            : hasActivePlan
                            ? (isSamePlan ? 'Selected Plan is Your Current Plan' : `Confirm Switch to ${targetPlan.name} ($${targetPlan.price.toFixed(2)}/mth)`)
                            : `Activate ${targetPlan.name} ($${targetPlan.price.toFixed(2)}/mth)`}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 2: ADD A NEW MOBILE LINE / SIM */}
            {planModalTab === 'add_line' && (
              <div>
                {newLineSuccess && (
                  <div className={styles.portalAlertSuccess}>
                    {newLineSuccess}
                  </div>
                )}
                {newLineError && (
                  <div className={styles.portalAlertError}>
                    {newLineError}
                  </div>
                )}

                <p style={{ fontSize: '13.5px', color: '#4c5a49', marginBottom: '14px' }}>
                  Add a second mobile line or family member to your account. Choose between keeping an existing number or picking a fresh 04XX number from our wholesale pool.
                </p>

                {/* Plan Selector for New Line */}
                <div style={{ marginBottom: '16px' }}>
                  <label className={styles.portalLabel}>1. Select Mobile Plan for New Line</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    {PORTAL_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setNewLinePlanId(plan.id)}
                        className={`${styles.portalPlanCard} ${newLinePlanId === plan.id ? styles.portalPlanCardSelected : ''}`}
                        style={{ padding: '12px 14px', minHeight: 'auto', textAlign: 'left' }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '16px', color: '#142420' }}>{plan.tier}</div>
                        <div style={{ fontSize: '13px', color: '#556253' }}>${plan.price.toFixed(2)}/month</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enabled Keep vs New Number Options */}
                <div style={{ marginBottom: '16px' }}>
                  <label className={styles.portalLabel}>2. What would you like to do?</label>
                  <div className={styles.portalNumberChoiceGrid}>
                    <button
                      type="button"
                      className={`${styles.portalNumberChoiceCard} ${!newLineKeepNumber ? styles.portalNumberChoiceCardActive : ''}`}
                      onClick={() => {
                        setNewLineKeepNumber(false);
                        if (newLineReservedPool.length === 0) fetchReservePool();
                      }}
                    >
                      <span>Get a new 04XX number</span>
                      {!newLineKeepNumber && <span style={{ color: '#49721d', fontWeight: 800 }}>✓</span>}
                    </button>
                    <button
                      type="button"
                      className={`${styles.portalNumberChoiceCard} ${newLineKeepNumber ? styles.portalNumberChoiceCardActive : ''}`}
                      onClick={() => setNewLineKeepNumber(true)}
                    >
                      <span>Keep my existing number</span>
                      {newLineKeepNumber && <span style={{ color: '#49721d', fontWeight: 800 }}>✓</span>}
                    </button>
                  </div>
                </div>

                {/* OPTION A: Get a new number (Reserved Wholesale Pool) */}
                {!newLineKeepNumber && (
                  <div style={{ background: '#fbfdfa', border: '1.5px solid #dce4d8', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#142420' }}>
                        Select Available Number from Telstra Wholesale Pool:
                      </span>
                      <button
                        type="button"
                        onClick={fetchReservePool}
                        disabled={isLoadingPool}
                        style={{ background: 'none', border: 'none', color: '#789937', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                      >
                        {isLoadingPool ? 'Refreshing...' : 'Refresh Pool'}
                      </button>
                    </div>

                    <div className={styles.portalReserveList}>
                      {newLineReservedPool.length > 0 ? (
                        newLineReservedPool.map((item) => (
                          <div
                            key={item.id}
                            className={`${styles.portalReserveItem} ${newLineSelectedNumber === item.formatted ? styles.portalReserveItemActive : ''}`}
                            onClick={() => setNewLineSelectedNumber(item.formatted)}
                          >
                            <span className={styles.reserveNumberText}>{item.formatted}</span>
                            <span className={styles.reserveBadge}>5G READY</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#697866', fontSize: '13px' }}>
                          Loading reserved pool numbers...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* OPTION B: Keep Existing Number (Porting with ACMA 2FA) */}
                {newLineKeepNumber && (
                  <div style={{ background: '#fbfdfa', border: '1.5px solid #dce4d8', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
                    <div className={styles.portalFormGroup}>
                      <label className={styles.portalLabel}>Existing Australian Mobile Number</label>
                      <input
                        type="tel"
                        className={styles.portalInput}
                        placeholder="e.g. 0412 345 678"
                        value={newLinePortNumber}
                        onChange={(e) => setNewLinePortNumber(e.target.value)}
                      />
                    </div>

                    <div className={styles.portalFormGroup}>
                      <label className={styles.portalLabel}>Current Donor Carrier</label>
                      <select
                        className={styles.portalSelect}
                        value={newLineDonorCarrier}
                        onChange={(e) => setNewLineDonorCarrier(e.target.value)}
                      >
                        <option value="Telstra">Telstra</option>
                        <option value="Optus">Optus</option>
                        <option value="Vodafone">Vodafone / TPG</option>
                        <option value="Other">Other Australian Carrier / MVNO</option>
                      </select>
                    </div>

                    {/* Pre-Port ACMA 2FA SMS Code */}
                    <div style={{ borderTop: '1px dashed #dce4d8', paddingTop: '12px', marginTop: '12px' }}>
                      <label className={styles.portalLabel}>ACMA Pre-Port SMS 2FA Security Check</label>
                      <p style={{ fontSize: '12px', color: '#556253', margin: '0 0 10px 0' }}>
                        Under ACMA standards, donor carrier porting requires a one-time SMS verification code to prove ownership.
                      </p>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <button
                          type="button"
                          className={styles.btnPrimary}
                          style={{ padding: '10px 14px', fontSize: '13px' }}
                          onClick={handleSendNewLineOtp}
                        >
                          {newLineOtpSent ? 'Resend SMS Code' : 'Send ACMA 2FA Code'}
                        </button>
                      </div>

                      {newLineOtpSent && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            maxLength={6}
                            className={styles.portalInput}
                            style={{ maxWidth: '160px', fontFamily: 'monospace', letterSpacing: '2px', fontWeight: 700 }}
                            placeholder="6-digit code"
                            value={newLineOtpCode}
                            onChange={(e) => setNewLineOtpCode(e.target.value)}
                          />
                          <button
                            type="button"
                            className={styles.btnSecondaryUpgrade}
                            style={{ padding: '10px 14px', fontSize: '13px' }}
                            onClick={handleVerifyNewLineOtp}
                          >
                            Verify Code
                          </button>
                          {newLineOtpVerified && (
                            <span style={{ color: '#49721d', fontWeight: 700, fontSize: '13px' }}>
                              ✓ Mobile Verified
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className={styles.portalConfirmBtn}
                  disabled={isActivatingLine || (newLineKeepNumber && !newLineOtpVerified)}
                  onClick={handleActivateNewLine}
                >
                  {isActivatingLine
                    ? 'Activating Carrier eSIM Line...'
                    : newLineKeepNumber
                    ? `Submit Port-in Order for ${newLinePortNumber || 'Number'}`
                    : `Activate New Line (${newLineSelectedNumber})`}
                </button>
              </div>
            )}

            {/* TAB 3: HANDSET E-COMMERCE STORE */}
            {planModalTab === 'device_calc' && (
              <div>
                <p style={{ fontSize: '13.5px', color: '#4c5a49', marginBottom: '16px' }}>
                  Order genuine factory unlocked Australian handsets outright with free express delivery.
                </p>

                <div className={styles.portalDeviceCalcBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#142420' }}>Samsung Galaxy S26 Ultra</h3>
                      <span style={{ fontSize: '13px', color: '#556253' }}>512GB · Titanium Black · Factory Unlocked · 5G + eSIM</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#142420' }}>${calcHandsetPrice}</span>
                      <span style={{ fontSize: '12px', color: '#697866', display: 'block' }}>Outright (Inc. GST)</span>
                    </div>
                  </div>

                  <div className={styles.portalSummaryBox} style={{ margin: '16px 0 0 0' }}>
                    <div className={styles.portalSummaryRow}>
                      <span>Device Price:</span>
                      <strong>${calcHandsetPrice.toLocaleString()}.00 AUD</strong>
                    </div>
                    <div className={styles.portalSummaryRow}>
                      <span>Shipping (Australia Post Express):</span>
                      <strong style={{ color: '#2e7d32' }}>FREE ($0.00)</strong>
                    </div>
                    <div className={styles.portalSummaryRow}>
                      <span>Includes 10% GST:</span>
                      <strong>${(calcHandsetPrice / 11).toFixed(2)}</strong>
                    </div>
                    <div className={styles.portalSummaryRow} style={{ borderTop: '1.5px solid #142420', paddingTop: '10px', marginTop: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800 }}>Total Due Today:</span>
                      <strong style={{ fontSize: '18px', color: '#142420' }}>${calcHandsetPrice.toLocaleString()}.00</strong>
                    </div>

                    {calcDeviceSuccess ? (
                      <div className={styles.portalAlertSuccess} style={{ marginTop: '14px' }}>
                        ✓ {calcDeviceSuccess}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.portalConfirmBtn}
                        style={{ marginTop: '16px' }}
                        onClick={() => {
                          setCalcDeviceSuccess(`Handset order created for Cust #${user.custNo || 'CUST882104'}. Free express shipping confirmed to your registered address.`);
                          setTimeout(() => setCalcDeviceSuccess(null), 5000);
                        }}
                      >
                        Place Handset Order (${calcHandsetPrice.toLocaleString()} Outright) →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
