'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/config/api';
import DobPicker from '@/components/DobPicker';
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
    planNo: 11156014,
    name: 'JM 180GB Auto',
    tier: '180GB',
    price: 67.00,
    dataGb: 180,
    network: '5G',
  },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, token, logout, isLoading, refreshUser, updateStoredUser } = useAuth();
  const API_URL = getApiUrl();

  const [portalTab, setPortalTab] = useState<'overview' | 'billing' | 'details'>('overview');
  const [topTwoFaMenuOpen, setTopTwoFaMenuOpen] = useState<boolean>(false);

  const openSecuritySettings = () => {
    setTopTwoFaMenuOpen(false);
    setPortalTab('details');
    setTimeout(() => {
      document.getElementById('two-factor-settings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  useEffect(() => {
    if (!topTwoFaMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('[data-twofa-menu="true"]')) {
        setTopTwoFaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [topTwoFaMenuOpen]);

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
  const [showReplaceEsimForm, setShowReplaceEsimForm] = useState<boolean>(false);
  const [replaceEsimReason, setReplaceEsimReason] = useState<string>('Accidentally removed eSIM / switched phone');
  const [replaceEsimTwoFactorCode, setReplaceEsimTwoFactorCode] = useState<string>('');
  const [isSendingEsimOtp, setIsSendingEsimOtp] = useState<boolean>(false);
  const [esimOtpNotice, setEsimOtpNotice] = useState<string | null>(null);
  const [isReplacingEsim, setIsReplacingEsim] = useState<boolean>(false);
  const [replaceEsimError, setReplaceEsimError] = useState<string | null>(null);
  const [replaceEsimSuccess, setReplaceEsimSuccess] = useState<string | null>(null);

  // Invoices, Payments, Bill Queries & Porting state
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [billQueries, setBillQueries] = useState<any[]>([]);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Pay Now Modal State
  const [payNowOpen, setPayNowOpen] = useState<boolean>(false);
  const [payAmount, setPayAmount] = useState<string>('37.55');
  const [payInvoiceId, setPayInvoiceId] = useState<string>('');
  const [payCardName, setPayCardName] = useState<string>('');
  const [payCardNumber, setPayCardNumber] = useState<string>('');
  const [payCardExpiry, setPayCardExpiry] = useState<string>('');
  const [payCardCvc, setPayCardCvc] = useState<string>('');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  // View / Query Bill Modal State
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceRecord | null>(null);
  const [queryInvoice, setQueryInvoice] = useState<InvoiceRecord | null>(null);
  const [queryCategory, setQueryCategory] = useState<string>('Unfamiliar Charge');
  const [queryMessage, setQueryMessage] = useState<string>('');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState<boolean>(false);
  const [querySuccess, setQuerySuccess] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Change My Details State (Protected by 2FA)
  const [detailFirstName, setDetailFirstName] = useState<string>('');
  const [detailSurname, setDetailSurname] = useState<string>('');
  const [detailPreferredName, setDetailPreferredName] = useState<string>('');
  const [detailEmail, setDetailEmail] = useState<string>('');
  const [detailPhone, setDetailPhone] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');
  const [detailSuburb, setDetailSuburb] = useState<string>('');
  const [detailState, setDetailState] = useState<string>('NSW');
  const [detailPostcode, setDetailPostcode] = useState<string>('');
  const [detailPostalAddress, setDetailPostalAddress] = useState<string>('');
  const [detailCommPref, setDetailCommPref] = useState<'email' | 'sms' | 'both'>('email');
  const [detailMarketing, setDetailMarketing] = useState<boolean>(false);
  const [detailTwoFactorCode, setDetailTwoFactorCode] = useState<string>('');
  const [detailOtpNotice, setDetailOtpNotice] = useState<string | null>(null);
  const [isSendingDetailOtp, setIsSendingDetailOtp] = useState<boolean>(false);
  const [isSavingDetails, setIsSavingDetails] = useState<boolean>(false);
  const [detailSaveSuccess, setDetailSaveSuccess] = useState<string | null>(null);
  const [detailSaveError, setDetailSaveError] = useState<string | null>(null);

  // TOTP 2FA Configuration State (otplib + qrcode)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [twoFaSetupData, setTwoFaSetupData] = useState<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUrl: string;
  } | null>(null);
  const [twoFaVerifyCode, setTwoFaVerifyCode] = useState<string>('');
  const [twoFaBackupCodes, setTwoFaBackupCodes] = useState<string[]>([]);
  const [twoFaDisableCode, setTwoFaDisableCode] = useState<string>('');
  const [isTwoFaLoading, setIsTwoFaLoading] = useState<boolean>(false);
  const [twoFaSuccess, setTwoFaSuccess] = useState<string | null>(null);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);

  // In-portal Plan Upgrade & Add Line Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [planModalTab, setPlanModalTab] = useState<'switch_plan' | 'add_line' | 'device_calc'>('switch_plan');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-65gb');
  const [planTwoFactorCode, setPlanTwoFactorCode] = useState<string>('');
  const [planOtpNotice, setPlanOtpNotice] = useState<string | null>(null);
  const [isSendingPlanOtp, setIsSendingPlanOtp] = useState<boolean>(false);
  const [isChangingPlan, setIsChangingPlan] = useState<boolean>(false);
  const [planChangeSuccess, setPlanChangeSuccess] = useState<string | null>(null);
  const [planChangeError, setPlanChangeError] = useState<string | null>(null);

  // In-portal Add Line State
  const [newLineKeepNumber, setNewLineKeepNumber] = useState<boolean>(false);
  const [newLinePlanId, setNewLinePlanId] = useState<string>('plan-65gb');
  const [newLinePortNumber, setNewLinePortNumber] = useState<string>('');
  const [newLineDonorCarrier, setNewLineDonorCarrier] = useState<string>('Telstra');
  const [newLineNumType, setNewLineNumType] = useState<'prepaid' | 'postpaid'>('postpaid');
  const [newLineArn, setNewLineArn] = useState<string>('');
  const [newLineDob, setNewLineDob] = useState<string>('');
  const [newLineOtpSent, setNewLineOtpSent] = useState<boolean>(false);
  const [newLineOtpCode, setNewLineOtpCode] = useState<string>('');
  const [newLineOtpVerified, setNewLineOtpVerified] = useState<boolean>(false);
  const [newLineTxId, setNewLineTxId] = useState<string>('');
  const [newLineReservedPool, setNewLineReservedPool] = useState<{ id: string; number: string; formatted: string }[]>([]);
  const [newLineSelectedNumber, setNewLineSelectedNumber] = useState<string>('0491 570 006');
  const [isLoadingPool, setIsLoadingPool] = useState<boolean>(false);
  const [isActivatingLine, setIsActivatingLine] = useState<boolean>(false);
  const [newLineSuccess, setNewLineSuccess] = useState<string | null>(null);
  const [newLineError, setNewLineError] = useState<string | null>(null);

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

    // 6. Fetch customer bill queries
    fetch(`${API_URL}/api/carrier/customers/${custNo}/bill-queries`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.queries)) {
          setBillQueries(data.queries);
        }
      })
      .catch((err) => console.warn('Bill queries fetch error:', err));
  };

  useEffect(() => {
    if (!user) return;
    const custNo = user.custNo || '';
    if (custNo) {
      loadAccountData(custNo);
    }
    setDetailFirstName(user.firstName || user.name?.split(' ')[0] || '');
    setDetailSurname(user.surname || user.name?.split(' ').slice(1).join(' ') || '');
    setDetailPreferredName(user.preferredName || '');
    setDetailEmail(user.email || '');
    setDetailPhone(user.phone || '');
    setDetailAddress(user.address || '');
    setDetailSuburb(user.suburb || '');
    setDetailState(user.state || 'NSW');
    setDetailPostcode(user.postcode || '');
    setDetailPostalAddress(user.postalAddress || '');
    setDetailCommPref((user.commPreference as any) || 'email');
    setDetailMarketing(Boolean(user.marketingConsent));
    setTwoFactorEnabled(Boolean(user.twoFactorEnabled));
    setPayCardName(user.name || '');
  }, [user]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/auth/2fa/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) {
          setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
        }
      })
      .catch(() => {});
    refreshUser();
  }, [token]);

  useEffect(() => {
    if (balance?.nextInvoiceAmount) {
      setPayAmount(balance.nextInvoiceAmount.toFixed(2));
    }
  }, [balance]);

  // Fetch reserve pool numbers for Add Line tab
  const fetchReservePool = async () => {
    setIsLoadingPool(true);
    try {
      const res = await fetch(`${API_URL}/api/carrier/numbers/reserve?qty=5`);
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

  // Send 2FA Email OTP for sensitive portal actions (when TOTP not used)
  const handleSendActionOtp = async (target: 'details' | 'plan' | 'esim') => {
    if (!token) return;
    if (target === 'details') {
      setIsSendingDetailOtp(true);
      setDetailOtpNotice(null);
      setDetailSaveError(null);
    } else if (target === 'esim') {
      setIsSendingEsimOtp(true);
      setEsimOtpNotice(null);
      setReplaceEsimError(null);
    } else {
      setIsSendingPlanOtp(true);
      setPlanOtpNotice(null);
      setPlanChangeError(null);
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/2fa/send-action-code`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not dispatch security code.');
      }
      if (target === 'details') {
        setDetailOtpNotice(data.message);
      } else if (target === 'esim') {
        setEsimOtpNotice(data.message);
      } else {
        setPlanOtpNotice(data.message);
      }
    } catch (err: any) {
      if (target === 'details') {
        setDetailSaveError(err.message || 'Failed to send 2FA code.');
      } else if (target === 'esim') {
        setReplaceEsimError(err.message || 'Failed to send 2FA code.');
      } else {
        setPlanChangeError(err.message || 'Failed to send 2FA code.');
      }
    } finally {
      setIsSendingDetailOtp(false);
      setIsSendingPlanOtp(false);
      setIsSendingEsimOtp(false);
    }
  };

  // Save "Change My Details" with mandatory 2FA verification
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!detailTwoFactorCode.trim()) {
      setDetailSaveError(
        twoFactorEnabled
          ? 'Please enter the 6-digit code from your Authenticator App to save account changes.'
          : 'Please request and enter the 6-digit Email 2FA verification code before saving changes.',
      );
      return;
    }

    setIsSavingDetails(true);
    setDetailSaveError(null);
    setDetailSaveSuccess(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: detailFirstName,
          surname: detailSurname,
          preferredName: detailPreferredName,
          email: detailEmail,
          phone: detailPhone,
          address: detailAddress,
          suburb: detailSuburb,
          state: detailState,
          postcode: detailPostcode,
          postalAddress: detailPostalAddress,
          commPreference: detailCommPref,
          marketingConsent: detailMarketing,
          twoFactorCode: detailTwoFactorCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update details.');
      }
      if (data.user) {
        updateStoredUser(data.user);
      }
      setDetailTwoFactorCode('');
      setDetailOtpNotice(null);
      setDetailSaveSuccess(data.message || 'Account details updated securely.');
    } catch (err: any) {
      setDetailSaveError(err.message || 'Failed to save updated details.');
    } finally {
      setIsSavingDetails(false);
    }
  };

  // TOTP 2FA Setup / Enable / Disable Handlers (otplib + qrcode)
  const handleStartTwoFaSetup = async () => {
    if (!token) return;
    setIsTwoFaLoading(true);
    setTwoFaError(null);
    setTwoFaSuccess(null);
    setTwoFaBackupCodes([]);
    try {
      const res = await fetch(`${API_URL}/api/auth/2fa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to initialize 2FA setup.');
      }
      setTwoFaSetupData({
        secret: data.secret,
        otpauthUrl: data.otpauthUrl,
        qrCodeDataUrl: data.qrCodeDataUrl,
      });
      setTwoFaVerifyCode('');
    } catch (err: any) {
      setTwoFaError(err.message || 'Could not generate Authenticator QR code.');
    } finally {
      setIsTwoFaLoading(false);
    }
  };

  const handleEnableTwoFa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsTwoFaLoading(true);
    setTwoFaError(null);
    setTwoFaSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: twoFaVerifyCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code.');
      }
      setTwoFactorEnabled(true);
      setTwoFaSetupData(null);
      setTwoFaVerifyCode('');
      setTwoFaBackupCodes(data.backupCodes || []);
      setTwoFaSuccess(data.message || 'Authenticator App 2FA enabled.');
      await refreshUser();
    } catch (err: any) {
      setTwoFaError(err.message || 'Could not enable 2FA.');
    } finally {
      setIsTwoFaLoading(false);
    }
  };

  const handleDisableTwoFa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsTwoFaLoading(true);
    setTwoFaError(null);
    setTwoFaSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: twoFaDisableCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code.');
      }
      setTwoFactorEnabled(false);
      setTwoFaDisableCode('');
      setTwoFaBackupCodes([]);
      setTwoFaSuccess(data.message || 'Authenticator 2FA disabled.');
      await refreshUser();
    } catch (err: any) {
      setTwoFaError(err.message || 'Failed to disable 2FA.');
    } finally {
      setIsTwoFaLoading(false);
    }
  };

  // Pay Now Submission Handler
  const handlePayNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const custNo = user.custNo || 'CUST990001';
    const numericAmount = parseFloat(payAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setPayError('Please enter a valid AUD payment amount.');
      return;
    }
    const cleanDigits = payCardNumber.replace(/\D/g, '');
    if (cleanDigits.length < 12) {
      setPayError('Please enter a valid 13-16 digit card number.');
      return;
    }

    setIsPaying(true);
    setPayError(null);
    setPaySuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/carrier/customers/${custNo}/pay-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          invoiceId: payInvoiceId || undefined,
          cardName: payCardName.trim() || user.name,
          cardLast4: cleanDigits.slice(-4),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment could not be processed.');
      }
      setPaySuccess(data.message);
      setPayCardNumber('');
      setPayCardExpiry('');
      setPayCardCvc('');
      loadAccountData(custNo);
    } catch (err: any) {
      setPayError(err.message || 'Payment failed.');
    } finally {
      setIsPaying(false);
    }
  };

  // Bill Query Submission Handler
  const handleSubmitBillQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !queryInvoice) return;
    const custNo = user.custNo || 'CUST990001';
    setIsSubmittingQuery(true);
    setQueryError(null);
    setQuerySuccess(null);

    try {
      const res = await fetch(`${API_URL}/api/carrier/customers/${custNo}/bill-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: queryInvoice.invoiceId,
          category: queryCategory,
          message: queryMessage,
          email: user.email,
          name: user.name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit bill query.');
      }
      setQuerySuccess(data.message);
      setQueryMessage('');
      loadAccountData(custNo);
    } catch (err: any) {
      setQueryError(err.message || 'Could not submit billing query.');
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  // In-portal Plan Change Handler (INT-11, protected by 2FA)
  const handleConfirmPlanChange = async () => {
    if (!user) return;
    if (!planTwoFactorCode.trim()) {
      setPlanChangeError(
        twoFactorEnabled
          ? 'Please enter the 6-digit 2FA code from your Authenticator App to confirm this plan change.'
          : 'Please request and enter the 6-digit Email 2FA code to confirm this plan change.',
      );
      return;
    }
    const custNo = user.custNo || '';
    const targetPlan = PORTAL_PLANS.find((p) => p.id === selectedPlanId);
    if (!targetPlan) return;

    setIsChangingPlan(true);
    setPlanChangeError(null);
    setPlanChangeSuccess(null);

    try {
      const res = await fetch(`${API_URL}/api/carrier/customers/${custNo}/change-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planId: targetPlan.id,
          planName: targetPlan.name,
          monthlyFee: targetPlan.price,
          dataGb: targetPlan.dataGb,
          msn: activeMobile || '0491570006',
          twoFactorCode: planTwoFactorCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update plan.');
      }

      setPlanChangeSuccess(data.message);
      setActivePlanName(targetPlan.name);
      setPlanTwoFactorCode('');
      setPlanOtpNotice(null);

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
    const custNo = user?.custNo || '';
    setNewLineError(null);
    try {
      const res = await fetch(`${API_URL}/api/carrier/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custNo, destination: newLinePortNumber }),
      });
      const data = await res.json();
      if (res.ok && data.transactionId) {
        setNewLineTxId(data.transactionId);
        setNewLineOtpSent(true);
        if (String(data.transactionId).startsWith('TX-PORT-')) {
          setTimeout(() => setNewLineOtpCode('829104'), 600);
        }
        return;
      }
      setNewLineError(data?.message || 'We could not send your SMS security code right now. Please try again.');
    } catch {
      setNewLineError('Unable to reach the server to send your verification code. Please try again.');
    }
  };

  // ACMA Pre-Port SMS 2FA Verification for Add Line
  const handleVerifyNewLineOtp = async () => {
    setNewLineError(null);
    try {
      const res = await fetch(`${API_URL}/api/carrier/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: newLineTxId, code: newLineOtpCode }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setNewLineOtpVerified(true);
        setNewLineError(null);
      } else {
        setNewLineError(data?.message || 'Invalid verification code. Please check your SMS and try again.');
      }
    } catch {
      setNewLineError('Unable to verify the SMS code right now. Please try again.');
    }
  };

  // In-portal Add Line Activation Handler
  const handleActivateNewLine = async () => {
    if (!user) return;
    const custNo = user.custNo || 'CUST990001';
    const plan = PORTAL_PLANS.find((p) => p.id === newLinePlanId) || PORTAL_PLANS[1];

    if (newLineKeepNumber && !newLineOtpVerified) {
      setNewLineError('Please verify your mobile number with the SMS code before submitting.');
      return;
    }

    setIsActivatingLine(true);
    setNewLineError(null);
    setNewLineSuccess(null);

    try {
      const endpoint = `${API_URL}${newLineKeepNumber ? '/api/carrier/orders/activate-port' : '/api/carrier/orders/activate'}`;
      const payload = newLineKeepNumber
        ? {
            custNo,
            msn: newLinePortNumber,
            planName: plan.name,
            pricePerMonth: plan.price,
            numType: newLineNumType,
            donorCarrier: newLineDonorCarrier,
            ...(newLineNumType === 'postpaid' ? { arn: newLineArn } : { dob: newLineDob }),
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

      setNewLineSuccess(`Successfully added line ${data.msn}. eSIM profile provisioned.`);
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

  // Issue a brand-new 2FA-verified replacement eSIM profile & QR code
  const handleReplaceEsim = async () => {
    if (!user || !token) return;
    if (!replaceEsimTwoFactorCode.trim()) {
      setReplaceEsimError(
        twoFactorEnabled
          ? 'Please enter the 6-digit code from your Authenticator App.'
          : 'Please click "Send Email 2FA Code" and enter the 6-digit code sent to your email.',
      );
      return;
    }
    const custNo = user.custNo || 'CUST990001';
    setIsReplacingEsim(true);
    setReplaceEsimError(null);
    setReplaceEsimSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/carrier/customers/${custNo}/esim/replace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          msn: activeMobile || user.phone,
          reason: replaceEsimReason,
          email: user.email,
          twoFactorCode: replaceEsimTwoFactorCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not issue replacement eSIM QR code.');
      }
      if (data.lpa && data.qrCodeDataUrl) {
        setEsimDetails({
          orderId: data.orderId,
          lpa: data.lpa,
          smdpAddress: data.smdpAddress,
          activationCode: data.activationCode,
          qrCodeDataUrl: data.qrCodeDataUrl,
          instructions: data.instructions || esimDetails?.instructions || [],
        });
      }
      setReplaceEsimTwoFactorCode('');
      setEsimOtpNotice(null);
      setReplaceEsimSuccess(
        data.message || `New replacement eSIM QR code (${data.referenceNumber}) generated and emailed to ${user.email}.`,
      );
    } catch (err: any) {
      setReplaceEsimError(err.message || 'Failed to issue replacement eSIM.');
    } finally {
      setIsReplacingEsim(false);
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
            <div className={styles.topTwoFaWrap} data-twofa-menu="true">
              <button
                type="button"
                className={`${styles.topTwoFaBtn} ${twoFactorEnabled ? styles.topTwoFaBtnActive : ''}`}
                aria-expanded={topTwoFaMenuOpen}
                onClick={() => setTopTwoFaMenuOpen((prev) => !prev)}
              >
                <span className={styles.topTwoFaDot} />
                <span>{twoFactorEnabled ? '2FA: App Active' : '2FA: Email Active'}</span>
                <span style={{ opacity: 0.85, fontWeight: 600 }}>· Configure ▾</span>
              </button>

              {topTwoFaMenuOpen && (
                <div className={styles.topTwoFaMenu} role="menu">
                  <div className={styles.topTwoFaMenuHeader}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#142420' }}>
                      Two-Factor Security (2FA)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#556253', marginTop: '2px' }}>
                      {twoFactorEnabled
                        ? 'Authenticator App & Backup Codes enabled'
                        : 'Email OTP active · Pair an Authenticator App'}
                    </div>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    className={styles.topTwoFaMenuAction}
                    onClick={() => {
                      openSecuritySettings();
                      handleStartTwoFaSetup();
                    }}
                  >
                    <span>{twoFactorEnabled ? 'Reconfigure / Pair New Device' : 'Configure Authenticator App (QR)'}</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className={styles.topTwoFaMenuAction}
                    onClick={openSecuritySettings}
                  >
                    <span>{twoFactorEnabled ? 'Manage Backup Codes & Disable 2FA' : 'Open Security & 2FA Settings'}</span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>

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
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={styles.accountBadge}
              style={{ cursor: 'pointer' }}
              onClick={openSecuritySettings}
            >
              {twoFactorEnabled ? '✓ Authenticator 2FA Active' : 'Email 2FA Active · Set Up App'}
            </button>
          </div>
        </div>

        {/* Customer Portal Main Navigation Tabs */}
        <div className={styles.accountMainTabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={portalTab === 'overview'}
            className={`${styles.accountMainTabBtn} ${portalTab === 'overview' ? styles.accountMainTabActive : ''}`}
            onClick={() => setPortalTab('overview')}
          >
            <span>Overview &amp; Usage</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={portalTab === 'billing'}
            className={`${styles.accountMainTabBtn} ${portalTab === 'billing' ? styles.accountMainTabActive : ''}`}
            onClick={() => setPortalTab('billing')}
          >
            <span>Billing &amp; Pay Now</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={portalTab === 'details'}
            className={`${styles.accountMainTabBtn} ${portalTab === 'details' ? styles.accountMainTabActive : ''}`}
            onClick={() => setPortalTab('details')}
          >
            <span>My Details &amp; Security</span>
          </button>
        </div>

        {portalTab === 'overview' && (
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
                          <DobPicker
                            compact
                            required
                            value={resubmitDob}
                            onChange={setResubmitDob}
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
              <h2 className={styles.cardTitle}>Device & Financing</h2>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Profile Details</h2>
                <button
                  type="button"
                  className={styles.btnSmallAction}
                  onClick={() => setPortalTab('details')}
                >
                  Change My Details
                </button>
              </div>
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
                  <span className={styles.detailLabel}>Residential Address</span>
                  <span className={styles.detailValue}>
                    {user.address
                      ? `${user.address}${user.suburb ? `, ${user.suburb}` : ''}${user.state ? ` ${user.state}` : ''}${user.postcode ? ` ${user.postcode}` : ''}`
                      : 'Update in Change My Details'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>2FA Protection</span>
                  <span className={styles.detailValue} style={{ color: '#49721d' }}>
                    {twoFactorEnabled ? '✓ Authenticator App Active' : '✓ Email OTP (Authenticator Optional)'}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  className={styles.btnSecondaryUpgrade}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
                  onClick={openSecuritySettings}
                >
                  {twoFactorEnabled ? 'Manage Two-Factor Security (2FA)' : 'Set Up Authenticator App (2FA)'}
                </button>
              </div>
            </div>

            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px', flexWrap: 'wrap' }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Payment &amp; Invoicing</h2>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                  onClick={() => {
                    setPayInvoiceId(invoices[0]?.invoiceId || '');
                    setPayAmount((balance?.nextInvoiceAmount || invoices[0]?.amount || 37.55).toFixed(2));
                    setPaySuccess(null);
                    setPayError(null);
                    setPayNowOpen(true);
                  }}
                >
                  Pay Now
                </button>
              </div>
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
                Tax Invoices &amp; Billing History
              </h3>
              <p style={{ fontSize: '12px', color: '#697866', margin: '0 0 12px 0' }}>
                Formal Australian Tax Invoices with 10% GST breakdown &amp; ABN 48 672 819 204.
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
                      <div className={styles.invoiceRight} style={{ flexWrap: 'wrap', gap: '8px' }}>
                        <span className={styles.invoiceAmount}>${inv.amount.toFixed(2)}</span>
                        <button
                          type="button"
                          className={styles.btnSmallAction}
                          onClick={() => setViewingInvoice(inv)}
                        >
                          View Bill
                        </button>
                        <button
                          type="button"
                          className={styles.btnSmallAction}
                          onClick={() => {
                            setQueryInvoice(inv);
                            setQuerySuccess(null);
                            setQueryError(null);
                          }}
                        >
                          Query Bill
                        </button>
                        <a
                          href={`${API_URL}/api/carrier/customers/${user.custNo || 'CUST990001'}/invoices/${inv.invoiceId}/pdf`}
                          download={`JustMobile-Tax-Invoice-${inv.invoiceId}.pdf`}
                          className={styles.downloadPdfBtn}
                          title="Download ATO-compliant PDF Tax Invoice"
                        >
                          <span>PDF</span>
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
        )}

        {/* TAB 2: BILLING, PAY NOW & QUERY A BILL */}
        {portalTab === 'billing' && (
          <div>
            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <h2 className={styles.cardTitle} style={{ margin: '0 0 4px 0' }}>Account Balance &amp; Pay Now</h2>
                  <p style={{ fontSize: '13.5px', color: '#556253', margin: 0 }}>
                    Current balance: <strong>{balance?.formattedBalance || '$0.00'}</strong> · Next scheduled billing: <strong>{balance?.nextInvoiceDate || '28th of month'}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => {
                    setPayInvoiceId(invoices[0]?.invoiceId || '');
                    setPayAmount((balance?.nextInvoiceAmount || invoices[0]?.amount || 37.55).toFixed(2));
                    setPaySuccess(null);
                    setPayError(null);
                    setPayNowOpen(true);
                  }}
                >
                  Pay Now →
                </button>
              </div>
              <div className={styles.bankedNotice}>
                Payment method on file: <strong>{balance?.paymentMethod || 'Auto-Pay on 28th'}</strong>. Need payment assistance? Visit <Link href="/hardship" style={{ color: '#142420', fontWeight: 700 }}>Financial Hardship Support</Link> or contact <strong>info@justmobile.ai</strong> / <strong>1300 492 002</strong>.
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>View &amp; Query Your Bills</h2>
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
                          {inv.planName} · Cycle: {inv.periodStart} – {inv.periodEnd}
                        </span>
                      </div>
                      <div className={styles.invoiceRight} style={{ flexWrap: 'wrap', gap: '8px' }}>
                        <span className={styles.invoiceAmount}>${inv.amount.toFixed(2)}</span>
                        <button type="button" className={styles.btnSmallAction} onClick={() => setViewingInvoice(inv)}>
                          View Breakdown
                        </button>
                        <button
                          type="button"
                          className={styles.btnSmallAction}
                          onClick={() => {
                            setQueryInvoice(inv);
                            setQuerySuccess(null);
                            setQueryError(null);
                          }}
                        >
                          Query This Bill
                        </button>
                        <button
                          type="button"
                          className={styles.btnSmallAction}
                          onClick={() => {
                            setPayInvoiceId(inv.invoiceId);
                            setPayAmount(inv.amount.toFixed(2));
                            setPaySuccess(null);
                            setPayError(null);
                            setPayNowOpen(true);
                          }}
                        >
                          Pay Now
                        </button>
                        <a
                          href={`${API_URL}/api/carrier/customers/${user.custNo || 'CUST990001'}/invoices/${inv.invoiceId}/pdf`}
                          download={`JustMobile-Tax-Invoice-${inv.invoiceId}.pdf`}
                          className={styles.downloadPdfBtn}
                        >
                          Download PDF
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: '#697866' }}>No invoices have been issued for this account yet.</p>
                )}
              </div>

              {billQueries.length > 0 && (
                <div style={{ marginTop: '24px', borderTop: '1px solid #eef2ec', paddingTop: '18px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', color: '#142420' }}>
                    Your Logged Billing Queries
                  </h3>
                  <div className={styles.invoiceList}>
                    {billQueries.map((q: any) => (
                      <div key={q.queryId} className={styles.invoiceItem}>
                        <div className={styles.invoiceMeta}>
                          <div>
                            <span className={styles.invoiceId}>{q.queryId}</span>
                            <span className={styles.invoiceStatus}>{q.status}</span>
                          </div>
                          <span className={styles.invoicePeriod}>
                            Invoice: {q.invoiceId} · {q.category}
                          </span>
                          <span style={{ fontSize: '12.5px', color: '#2e3b2c', marginTop: '4px' }}>{q.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MY DETAILS & SECURITY */}
        {portalTab === 'details' && (
          <>
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h2 className={styles.cardTitle} style={{ margin: '0 0 4px 0' }}>Change My Details</h2>
                <p style={{ fontSize: '13.5px', color: '#556253', margin: 0 }}>
                  Update your residential address, postal address, contact details, and preferences. Protected by mandatory 2FA verification.
                </p>
              </div>
              <button
                type="button"
                className={styles.badgePortActive}
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={openSecuritySettings}
              >
                {twoFactorEnabled ? '2FA: Authenticator App ↓' : '2FA: Email OTP · Configure App ↓'}
              </button>
            </div>

            {detailSaveSuccess && <div className={styles.portalAlertSuccess}>{detailSaveSuccess}</div>}
            {detailSaveError && <div className={styles.portalAlertError}>{detailSaveError}</div>}

            <form onSubmit={handleSaveDetails}>
              <div className={styles.formGridTwo}>
                <div>
                  <label className={styles.fieldLabel}>First Name</label>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    value={detailFirstName}
                    onChange={(e) => setDetailFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Surname</label>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    value={detailSurname}
                    onChange={(e) => setDetailSurname(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Preferred Name</label>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    placeholder="Optional preferred name"
                    value={detailPreferredName}
                    onChange={(e) => setDetailPreferredName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Email Address</label>
                  <input
                    type="email"
                    className={styles.fieldInput}
                    value={detailEmail}
                    onChange={(e) => setDetailEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Contact Mobile Number</label>
                  <input
                    type="tel"
                    className={styles.fieldInput}
                    value={detailPhone}
                    onChange={(e) => setDetailPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>Communication Preference</label>
                  <select
                    className={styles.fieldInput}
                    value={detailCommPref}
                    onChange={(e) => setDetailCommPref(e.target.value as 'email' | 'sms' | 'both')}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="both">Email &amp; SMS</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>Residential Street Address (IPND Emergency Address)</label>
                <input
                  type="text"
                  className={styles.fieldInput}
                  placeholder="e.g. Unit 4, 182 George Street"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                />
              </div>

              <div className={styles.formGridTwo}>
                <div>
                  <label className={styles.fieldLabel}>Suburb</label>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    value={detailSuburb}
                    onChange={(e) => setDetailSuburb(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className={styles.fieldLabel}>State</label>
                    <select
                      className={styles.fieldInput}
                      value={detailState}
                      onChange={(e) => setDetailState(e.target.value)}
                    >
                      <option value="NSW">NSW</option>
                      <option value="VIC">VIC</option>
                      <option value="QLD">QLD</option>
                      <option value="WA">WA</option>
                      <option value="SA">SA</option>
                      <option value="TAS">TAS</option>
                      <option value="ACT">ACT</option>
                      <option value="NT">NT</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Postcode</label>
                    <input
                      type="text"
                      maxLength={4}
                      className={styles.fieldInput}
                      value={detailPostcode}
                      onChange={(e) => setDetailPostcode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>Postal / Mailing Address (if different)</label>
                <input
                  type="text"
                  className={styles.fieldInput}
                  placeholder="Leave blank if same as residential address"
                  value={detailPostalAddress}
                  onChange={(e) => setDetailPostalAddress(e.target.value)}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2e3b2c', marginBottom: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={detailMarketing}
                  onChange={(e) => setDetailMarketing(e.target.checked)}
                />
                <span>Receive JustMobile plan updates and promotions (you can opt out anytime)</span>
              </label>

              {/* Mandatory 2FA Security Confirmation for Account Changes */}
              <div className={styles.twoFaGateBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13.5px', color: '#142420' }}>
                    2FA Verification Required Before Saving Changes
                  </strong>
                  <button
                    type="button"
                    className={styles.btnSmallAction}
                    disabled={isSendingDetailOtp}
                    onClick={() => handleSendActionOtp('details')}
                  >
                    {isSendingDetailOtp ? 'Sending...' : twoFactorEnabled ? 'Send Email Backup Code' : 'Send 2FA Email Code'}
                  </button>
                </div>
                <p style={{ fontSize: '12.5px', color: '#4c5a49', margin: '0 0 10px 0' }}>
                  {twoFactorEnabled
                    ? 'Enter the 6-digit code from your Authenticator App (or request an Email code above).'
                    : 'Click "Send 2FA Email Code" above, or pair an Authenticator App in the security section below.'}
                </p>
                {detailOtpNotice && (
                  <div style={{ fontSize: '12.5px', color: '#2d6622', fontWeight: 600, marginBottom: '8px' }}>
                    {detailOtpNotice}
                  </div>
                )}
                <input
                  type="text"
                  maxLength={14}
                  className={styles.fieldInput}
                  style={{ maxWidth: '240px', fontFamily: 'monospace', letterSpacing: '3px', fontWeight: 700 }}
                  placeholder="Enter 6-digit 2FA code"
                  value={detailTwoFactorCode}
                  onChange={(e) => setDetailTwoFactorCode(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={isSavingDetails}
              >
                {isSavingDetails ? 'Verifying 2FA & Saving...' : 'Verify 2FA & Save Changes'}
              </button>
            </form>
          </div>

          <div id="two-factor-settings" className={styles.card} style={{ marginTop: '20px', scrollMarginTop: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <h2 className={styles.cardTitle} style={{ margin: '0 0 4px 0' }}>
                  Two-Factor Authentication (2FA)
                </h2>
                <p style={{ fontSize: '13.5px', color: '#556253', margin: 0 }}>
                  Extra protection required when signing in and before saving changes to your account details or plan.
                </p>
              </div>
              <span className={twoFactorEnabled ? styles.badgePortActive : styles.badgePortInProgress}>
                {twoFactorEnabled ? '✓ Authenticator App Enabled' : 'Email Verification Active'}
              </span>
            </div>

            {twoFaSuccess && <div className={styles.portalAlertSuccess}>{twoFaSuccess}</div>}
            {twoFaError && <div className={styles.portalAlertError}>{twoFaError}</div>}

            {!twoFactorEnabled && !twoFaSetupData && (
              <div style={{ background: '#f9fbf8', border: '1px solid #dce4d8', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ maxWidth: '580px' }}>
                  <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#142420', margin: '0 0 6px 0' }}>
                    Pair an Authenticator App
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#4c5a49', margin: 0, lineHeight: 1.55 }}>
                    Use <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, <strong>Authy</strong>, or <strong>1Password</strong> for instant one-tap verification codes instead of waiting for an email.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={isTwoFaLoading}
                  onClick={handleStartTwoFaSetup}
                >
                  {isTwoFaLoading ? 'Generating QR Code...' : 'Set Up Authenticator App'}
                </button>
              </div>
            )}

            {twoFaSetupData && (
              <div className={styles.securityQrGrid}>
                <div style={{ textAlign: 'center' }}>
                  <div className={styles.qrImageWrap} style={{ marginBottom: '8px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={twoFaSetupData.qrCodeDataUrl}
                      alt="JustMobile 2FA QR Code"
                      width={220}
                      height={220}
                      style={{ display: 'block', borderRadius: '8px' }}
                    />
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#556253' }}>Scan with your Authenticator App</span>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#142420', margin: '0 0 8px 0' }}>
                    1. Scan QR Code or Enter Setup Key
                  </h3>
                  <p style={{ fontSize: '13px', color: '#4c5a49', margin: '0 0 10px 0' }}>
                    Scan this code in your Authenticator app, or enter this manual setup key:
                  </p>
                  <div className={styles.lpaCodeBox} style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>
                    {twoFaSetupData.secret}
                  </div>

                  <form onSubmit={handleEnableTwoFa} style={{ marginTop: '14px' }}>
                    <label className={styles.fieldLabel}>2. Enter the 6-digit code from your app to activate</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        className={styles.fieldInput}
                        style={{ maxWidth: '180px', fontFamily: 'monospace', letterSpacing: '3px', fontWeight: 700 }}
                        placeholder="000000"
                        value={twoFaVerifyCode}
                        onChange={(e) => setTwoFaVerifyCode(e.target.value.replace(/\D/g, ''))}
                      />
                      <button type="submit" className={styles.btnPrimary} disabled={isTwoFaLoading}>
                        {isTwoFaLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
                      </button>
                      <button
                        type="button"
                        className={styles.btnSmallAction}
                        onClick={() => setTwoFaSetupData(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {twoFaBackupCodes.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '14px', padding: '18px', marginTop: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#92400e', margin: '0 0 6px 0' }}>
                  Save Your One-Time Recovery Backup Codes
                </h3>
                <p style={{ fontSize: '13px', color: '#78350f', margin: '0 0 10px 0' }}>
                  Store these recovery codes safely. Each code can be used once if you ever lose access to your phone.
                </p>
                <div className={styles.backupCodesGrid}>
                  {twoFaBackupCodes.map((codeStr) => (
                    <div key={codeStr} className={styles.backupCodeChip}>
                      {codeStr}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {twoFactorEnabled && !twoFaSetupData && (
              <div style={{ marginTop: '12px', background: '#f9fbf8', border: '1px solid #dce4d8', borderRadius: '14px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#142420', margin: '0 0 8px 0' }}>
                  Authenticator App Active
                </h3>
                <p style={{ fontSize: '13px', color: '#4c5a49', margin: '0 0 14px 0' }}>
                  Your account uses Authenticator codes when signing in and saving changes. You can pair a new device or switch back to Email OTP below.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <button
                    type="button"
                    className={styles.btnSecondaryUpgrade}
                    style={{ padding: '10px 16px', fontSize: '13px' }}
                    onClick={handleStartTwoFaSetup}
                  >
                    Reconfigure / Pair New Device
                  </button>
                </div>

                <form onSubmit={handleDisableTwoFa} style={{ borderTop: '1px solid #e2ebd8', paddingTop: '14px' }}>
                  <label className={styles.fieldLabel}>Switch back to Email Verification (disable Authenticator App)</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      maxLength={14}
                      required
                      className={styles.fieldInput}
                      style={{ maxWidth: '200px', fontFamily: 'monospace', letterSpacing: '2px' }}
                      placeholder="Current 6-digit code"
                      value={twoFaDisableCode}
                      onChange={(e) => setTwoFaDisableCode(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isTwoFaLoading}
                      className={styles.btnSmallAction}
                      style={{ color: '#991b1b', borderColor: '#fca5a5', padding: '10px 16px' }}
                    >
                      Disable Authenticator App
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          </>
        )}
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

                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2ebe0' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplaceEsimForm((prev) => !prev);
                      setReplaceEsimError(null);
                      setReplaceEsimSuccess(null);
                    }}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      color: '#142420',
                      border: '1.5px solid #cbd8c7',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {showReplaceEsimForm
                      ? 'Hide Replacement eSIM Request'
                      : 'Accidentally Removed eSIM or Switched Phone? Issue New Replacement QR'}
                  </button>

                  {showReplaceEsimForm && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '12px',
                        background: '#f7faf4',
                        border: '1px solid #d4e3ce',
                        borderRadius: '10px',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#142420', marginBottom: '6px' }}>
                        Request Replacement eSIM QR Code (2FA Protected)
                      </div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#4c5a49', marginBottom: '4px' }}>
                        Reason for replacement
                      </label>
                      <select
                        value={replaceEsimReason}
                        onChange={(e) => setReplaceEsimReason(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd8c7',
                          fontSize: '12.5px',
                          marginBottom: '8px',
                          background: '#ffffff',
                        }}
                      >
                        <option value="Accidentally removed eSIM / switched phone">
                          Accidentally removed eSIM / switched phone
                        </option>
                        <option value="eSIM failed to activate / reset profile">
                          eSIM failed to activate / reset profile
                        </option>
                        <option value="Lost or damaged device">
                          Lost or damaged device
                        </option>
                      </select>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={8}
                          placeholder={twoFactorEnabled ? '6-digit Authenticator code' : '6-digit Email 2FA code'}
                          value={replaceEsimTwoFactorCode}
                          onChange={(e) => setReplaceEsimTwoFactorCode(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd8c7',
                            fontSize: '12.5px',
                            background: '#ffffff',
                          }}
                        />
                        {!twoFactorEnabled && (
                          <button
                            type="button"
                            onClick={() => handleSendActionOtp('esim')}
                            disabled={isSendingEsimOtp}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #142420',
                              background: '#ffffff',
                              color: '#142420',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isSendingEsimOtp ? 'Sending...' : 'Send Email 2FA Code'}
                          </button>
                        )}
                      </div>

                      {esimOtpNotice && (
                        <div style={{ fontSize: '12px', color: '#2e7d32', marginBottom: '6px', fontWeight: 600 }}>
                          {esimOtpNotice}
                        </div>
                      )}
                      {replaceEsimError && (
                        <div style={{ fontSize: '12px', color: '#b42318', marginBottom: '6px', fontWeight: 600 }}>
                          {replaceEsimError}
                        </div>
                      )}
                      {replaceEsimSuccess && (
                        <div style={{ fontSize: '12px', color: '#2e7d32', marginBottom: '6px', fontWeight: 600 }}>
                          {replaceEsimSuccess}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleReplaceEsim}
                        disabled={isReplacingEsim}
                        style={{
                          width: '100%',
                          background: '#D5F879',
                          color: '#142420',
                          border: '1.5px solid #142420',
                          borderRadius: '8px',
                          padding: '9px 12px',
                          fontSize: '12.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {isReplacingEsim ? 'Issuing Replacement eSIM...' : 'Verify & Issue Replacement eSIM QR'}
                      </button>
                    </div>
                  )}
                </div>
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
                  Direct carrier provisioning on Telstra Wholesale 5G · Connected to Cust #{user.custNo || 'CUST990001'}
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
                            <strong>Billing & Quota Adjustment:</strong> Your data allowance will adjust immediately to {targetPlan.dataGb}GB upon confirmation. Next invoice on 28th will reflect ${targetPlan.price.toFixed(2)}.
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
                            <strong>Activation Quota:</strong> Your new service will be provisioned on Telstra Wholesale 5G with {targetPlan.dataGb}GB data allowance and zero lock-in contract.
                          </div>
                        </>
                      )}

                      {/* 2FA Gate for Plan Change */}
                      <div className={styles.twoFaGateBox}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                          <strong style={{ fontSize: '13px', color: '#142420' }}>
                            2FA Confirmation Required for Plan Changes
                          </strong>
                          <button
                            type="button"
                            className={styles.btnSmallAction}
                            disabled={isSendingPlanOtp}
                            onClick={() => handleSendActionOtp('plan')}
                          >
                            {isSendingPlanOtp ? 'Sending...' : twoFactorEnabled ? 'Use Email OTP' : 'Send 2FA Email Code'}
                          </button>
                        </div>
                        {planOtpNotice && (
                          <div style={{ fontSize: '12px', color: '#2d6622', fontWeight: 600, marginBottom: '6px' }}>
                            {planOtpNotice}
                          </div>
                        )}
                        <input
                          type="text"
                          maxLength={14}
                          className={styles.fieldInput}
                          style={{ maxWidth: '220px', fontFamily: 'monospace', letterSpacing: '3px', fontWeight: 700 }}
                          placeholder={twoFactorEnabled ? 'Authenticator 6-digit code' : '6-digit Email 2FA code'}
                          value={planTwoFactorCode}
                          onChange={(e) => setPlanTwoFactorCode(e.target.value)}
                        />
                      </div>

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
                            ? (isSamePlan ? 'Selected Plan is Your Current Plan' : `Verify 2FA & Switch to ${targetPlan.name} ($${targetPlan.price.toFixed(2)}/mth)`)
                            : `Verify 2FA & Activate ${targetPlan.name} ($${targetPlan.price.toFixed(2)}/mth)`}
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
                    <div style={{ background: '#f4faee', border: '1px solid #c6dfb9', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12.5px', color: '#243a1a', lineHeight: 1.45 }}>
                      <strong>Required for number transfer:</strong> Keep your existing SIM active until the transfer completes, and have your{' '}
                      <strong>current provider&apos;s Account Number</strong> (postpaid) or <strong>Date of Birth</strong> (prepaid) ready.
                    </div>

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
                      <label className={styles.portalLabel}>Current Service Type</label>
                      <div className={styles.serviceTypeToggle}>
                        <button
                          type="button"
                          className={`${styles.typeToggleBtn} ${newLineNumType === 'postpaid' ? styles.typeToggleActive : ''}`}
                          onClick={() => setNewLineNumType('postpaid')}
                        >
                          Postpaid (Account # on Bill)
                        </button>
                        <button
                          type="button"
                          className={`${styles.typeToggleBtn} ${newLineNumType === 'prepaid' ? styles.typeToggleActive : ''}`}
                          onClick={() => setNewLineNumType('prepaid')}
                        >
                          Prepaid (Date of Birth)
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGridTwo}>
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
                          <option value="Amaysim">Amaysim</option>
                          <option value="Boost Mobile">Boost Mobile</option>
                          <option value="Other">Other Australian Carrier / MVNO</option>
                        </select>
                      </div>

                      {newLineNumType === 'postpaid' ? (
                        <div className={styles.portalFormGroup}>
                          <label className={styles.portalLabel}>Current Provider Account Number</label>
                          <input
                            type="text"
                            className={styles.portalInput}
                            placeholder="Found on your latest bill"
                            value={newLineArn}
                            onChange={(e) => setNewLineArn(e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className={styles.portalFormGroup}>
                          <label className={styles.portalLabel}>Date of Birth on Prepaid Account</label>
                          <DobPicker
                            compact
                            value={newLineDob}
                            onChange={setNewLineDob}
                          />
                        </div>
                      )}
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

            {/* TAB 3: HANDSET E-COMMERCE STORE (COMING SOON) */}
            {planModalTab === 'device_calc' && (
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
                  PHONES & DEVICES · COMING SOON
                </span>

                <h3
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#142420',
                    margin: '0 0 10px 0',
                  }}
                >
                  Handsets & Outright Phones Coming Soon
                </h3>

                <p
                  style={{
                    fontSize: '14px',
                    color: '#4c5a49',
                    maxWidth: '520px',
                    margin: '0 auto 14px auto',
                    lineHeight: 1.6,
                  }}
                >
                  In-portal handset ordering and device financing management are currently coming soon.
                </p>

                <p
                  style={{
                    fontSize: '12.5px',
                    color: '#697866',
                    maxWidth: '480px',
                    margin: '0 auto 24px auto',
                    lineHeight: 1.5,
                  }}
                >
                  You can still select or manage your mobile plans in the other tabs, or view advertised handsets on the main JustMobile homepage.
                </p>

                <button
                  type="button"
                  className={styles.portalConfirmBtn}
                  style={{ maxWidth: '280px', margin: '0 auto' }}
                  onClick={() => setPlanModalTab('switch_plan')}
                >
                  View Mobile Plans
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PAY NOW MODAL
          ===================================================================== */}
      {payNowOpen && (
        <div className={styles.modalOverlay} onClick={() => setPayNowOpen(false)} role="dialog" aria-modal="true">
          <div className={styles.modalContent} style={{ textAlign: 'left', maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.modalCloseBtn} onClick={() => setPayNowOpen(false)} aria-label="Close">
              ✕
            </button>
            <h2 className={styles.cardTitle} style={{ marginBottom: '6px' }}>Make a Payment (Pay Now)</h2>
            <p style={{ fontSize: '13px', color: '#556253', margin: '0 0 16px 0' }}>
              Pay an invoice or top up your JustMobile account balance securely (Cust #{user.custNo || '—'}).
            </p>

            {paySuccess && <div className={styles.portalAlertSuccess}>{paySuccess}</div>}
            {payError && <div className={styles.portalAlertError}>{payError}</div>}

            <form onSubmit={handlePayNowSubmit}>
              {invoices.length > 0 && (
                <div className={styles.formRow}>
                  <label className={styles.fieldLabel}>Select Invoice (Optional)</label>
                  <select
                    className={styles.fieldInput}
                    value={payInvoiceId}
                    onChange={(e) => {
                      const chosen = invoices.find((i) => i.invoiceId === e.target.value);
                      setPayInvoiceId(e.target.value);
                      if (chosen) setPayAmount(chosen.amount.toFixed(2));
                    }}
                  >
                    <option value="">General Account Payment</option>
                    {invoices.map((inv) => (
                      <option key={inv.invoiceId} value={inv.invoiceId}>
                        {inv.invoiceId} (${inv.amount.toFixed(2)} — {inv.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>Payment Amount (AUD $)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  className={styles.fieldInput}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>Cardholder Name</label>
                <input
                  type="text"
                  required
                  className={styles.fieldInput}
                  value={payCardName}
                  onChange={(e) => setPayCardName(e.target.value)}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>Card Number (Visa / Mastercard)</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4532 •••• •••• ••••"
                  className={styles.fieldInput}
                  value={payCardNumber}
                  onChange={(e) => setPayCardNumber(e.target.value)}
                />
              </div>

              <div className={styles.formGridTwo}>
                <div>
                  <label className={styles.fieldLabel}>Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="08/28"
                    className={styles.fieldInput}
                    value={payCardExpiry}
                    onChange={(e) => setPayCardExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.fieldLabel}>CVV / CVC</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    className={styles.fieldInput}
                    value={payCardCvc}
                    onChange={(e) => setPayCardCvc(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <button type="submit" className={styles.portalConfirmBtn} disabled={isPaying}>
                {isPaying ? 'Processing Payment...' : `Pay $${Number(payAmount || 0).toFixed(2)} AUD Now`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW BILL ITEMIZED BREAKDOWN MODAL
          ===================================================================== */}
      {viewingInvoice && (
        <div className={styles.modalOverlay} onClick={() => setViewingInvoice(null)} role="dialog" aria-modal="true">
          <div className={styles.modalContent} style={{ textAlign: 'left', maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.modalCloseBtn} onClick={() => setViewingInvoice(null)} aria-label="Close">
              ✕
            </button>
            <h2 className={styles.cardTitle} style={{ marginBottom: '4px' }}>Tax Invoice {viewingInvoice.invoiceId}</h2>
            <p style={{ fontSize: '13px', color: '#556253', margin: '0 0 16px 0' }}>
              Billing Cycle: {viewingInvoice.periodStart} to {viewingInvoice.periodEnd} · Status: <strong>{viewingInvoice.status}</strong>
            </p>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Plan &amp; Service</span>
                <span className={styles.detailValue}>{viewingInvoice.planName}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Included Data</span>
                <span className={styles.detailValue}>{viewingInvoice.dataAllowance}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Subtotal (Excl. GST)</span>
                <span className={styles.detailValue}>${viewingInvoice.subtotal.toFixed(2)} AUD</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>GST (10%)</span>
                <span className={styles.detailValue}>${viewingInvoice.gstAmount.toFixed(2)} AUD</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Total Amount</span>
                <span className={styles.detailValue} style={{ fontSize: '16px' }}>${viewingInvoice.amount.toFixed(2)} AUD</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Payment Method &amp; Ref</span>
                <span className={styles.detailValue}>{viewingInvoice.paymentMethod} ({viewingInvoice.transactionRef})</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
              <button
                type="button"
                className={styles.btnPrimary}
                style={{ flex: 1 }}
                onClick={() => {
                  const inv = viewingInvoice;
                  setViewingInvoice(null);
                  setQueryInvoice(inv);
                  setQuerySuccess(null);
                  setQueryError(null);
                }}
              >
                Query This Bill
              </button>
              <a
                href={`${API_URL}/api/carrier/customers/${user.custNo || 'CUST990001'}/invoices/${viewingInvoice.invoiceId}/pdf`}
                download={`JustMobile-Tax-Invoice-${viewingInvoice.invoiceId}.pdf`}
                className={styles.btnSecondaryUpgrade}
                style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          QUERY A BILL / DISPUTE CHARGE MODAL
          ===================================================================== */}
      {queryInvoice && (
        <div className={styles.modalOverlay} onClick={() => setQueryInvoice(null)} role="dialog" aria-modal="true">
          <div className={styles.modalContent} style={{ textAlign: 'left', maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.modalCloseBtn} onClick={() => setQueryInvoice(null)} aria-label="Close">
              ✕
            </button>
            <h2 className={styles.cardTitle} style={{ marginBottom: '4px' }}>Query Bill {queryInvoice.invoiceId}</h2>
            <p style={{ fontSize: '13px', color: '#556253', margin: '0 0 16px 0' }}>
              Questions about a charge or pro-rata calculation? Lodge a billing enquiry for direct review by our team (info@justmobile.ai · 1300 492 002).
            </p>

            {querySuccess && <div className={styles.portalAlertSuccess}>{querySuccess}</div>}
            {queryError && <div className={styles.portalAlertError}>{queryError}</div>}

            <form onSubmit={handleSubmitBillQuery}>
              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>Enquiry Category</label>
                <select
                  className={styles.fieldInput}
                  value={queryCategory}
                  onChange={(e) => setQueryCategory(e.target.value)}
                >
                  <option value="Unfamiliar Charge">Unfamiliar / Unexpected Charge</option>
                  <option value="Incorrect Plan Fee">Incorrect Plan Fee</option>
                  <option value="Pro-Rata Calculation">Pro-Rata Billing Question</option>
                  <option value="Missing Payment / Credit">Missing Payment or Credit</option>
                  <option value="Other Billing Question">Other Billing Question</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label className={styles.fieldLabel}>Details of Your Query</label>
                <textarea
                  rows={4}
                  required
                  className={styles.fieldInput}
                  placeholder="Describe what you'd like us to check on this bill..."
                  value={queryMessage}
                  onChange={(e) => setQueryMessage(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.portalConfirmBtn} disabled={isSubmittingQuery}>
                {isSubmittingQuery ? 'Submitting Query...' : 'Submit Billing Query'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
