'use strict';
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/config/api';
import styles from './admin.module.css';

interface CustomerRecord {
  id: string;
  custNo?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  planName?: string;
  planPrice?: number;
  lineStatus?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface SubscriberRecord {
  id: string;
  email: string;
  source: string;
  status: string;
  createdAt: string;
}

interface BroadcastHistoryItem {
  id: string;
  subject: string;
  message: string;
  sentCount: number;
  targetCount: number;
  sentAt: string;
}

const formatStatus = (s?: string) => {
  if (!s) return 'Active';
  const upper = s.trim().toUpperCase();
  if (upper === 'ACTIVE') return 'Active';
  if (upper === 'DISCONNECTED') return 'Disconnected';
  if (upper === 'SUSPENDED') return 'Suspended';
  if (upper.includes('PROGRESS') || upper === 'PENDING') return 'Pending';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export default function AdminPage() {
  const router = useRouter();
  const { user, token, logout, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'subscribers' | 'marketing'>('subscribers');

  // Customer Registry State
  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Marketing & Newsletter Subscribers State
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastHistoryItem[]>([]);

  // Broadcast Draft Box State
  const [broadcastSubject, setBroadcastSubject] = useState(
    'Exclusive 5G Offer: 65GB for $37.55/mo on Telstra Wholesale'
  );
  const [broadcastMessage, setBroadcastMessage] = useState(
    `G'day,\n\nReady for Australia's straightforward mobile challenger? Switch today and get our flagship 65GB 5G Auto Plan for just $37.55/month with Zero Bill Shock and full Telstra Wholesale coverage.\n\nKeep your current number with zero downtime or pick a brand new 04XX mobile.\n\nClaim your eSIM instantly online: https://justmobile.com.au`
  );
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastAlert, setBroadcastAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const API_URL = getApiUrl();

  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoadingData(false);
    }
  }, [token, API_URL]);

  const fetchSubscribers = useCallback(async () => {
    setLoadingSubscribers(true);
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribers`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribers(data.subscribers || []);
      }

      const histRes = await fetch(`${API_URL}/api/newsletter/broadcasts`);
      const histData = await histRes.json();
      if (histRes.ok && histData.success) {
        setBroadcastHistory(histData.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    } finally {
      setLoadingSubscribers(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login?portal=admin');
      } else {
        fetchAdminData();
        fetchSubscribers();
      }
    }
  }, [user, isLoading, router, fetchAdminData, fetchSubscribers]);

  const handleApplyTemplate = (type: 'deal' | 'network' | 'esim') => {
    if (type === 'deal') {
      setBroadcastSubject('Special Offer: 65GB 5G Plan for $37.55 on Telstra Wholesale');
      setBroadcastMessage(
        `G'day,\n\nReady for Australia's straightforward mobile challenger? Switch today and get our flagship 65GB 5G Auto Plan for just $37.55/month with Zero Bill Shock and full Telstra Wholesale coverage.\n\nKeep your current number with zero downtime or pick a brand new 04XX mobile.\n\nClaim your eSIM instantly online: https://justmobile.com.au`
      );
    } else if (type === 'network') {
      setBroadcastSubject('Network Update: High-Speed 5G Coverage Across Australia');
      setBroadcastMessage(
        `G'day,\n\nExperience reliable Australian mobile coverage powered by the Telstra Wholesale 5G & 4G network reaching over 98.8% of the Australian population.\n\nTransparent pricing, no lock-in contracts, and zero hidden fees.\n\nExplore our coverage and plans: https://justmobile.com.au#network`
      );
    } else if (type === 'esim') {
      setBroadcastSubject('Instant Digital eSIM: Activated in Under 60 Seconds');
      setBroadcastMessage(
        `G'day,\n\nWhy wait for a plastic SIM card to arrive in the post? With JustMobile, your eSIM QR code is delivered straight to your screen and inbox.\n\nFully compatible with iPhone 11-16, Samsung Galaxy S20-S26, and Google Pixel devices.\n\nStart your connection today: https://justmobile.com.au`
      );
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      setBroadcastAlert({ type: 'error', message: 'Please provide both a subject line and offer message.' });
      return;
    }

    if (subscribers.length === 0) {
      setBroadcastAlert({ type: 'error', message: 'There are currently 0 active subscribers in the registry.' });
      return;
    }

    setSendingBroadcast(true);
    setBroadcastAlert(null);

    try {
      const res = await fetch(`${API_URL}/api/newsletter/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: broadcastSubject.trim(),
          message: broadcastMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastAlert({ type: 'success', message: data.message || `Broadcast sent to ${data.count} subscribers.` });
        fetchSubscribers();
      } else {
        setBroadcastAlert({ type: 'error', message: data.message || 'Failed to dispatch broadcast campaign.' });
      }
    } catch {
      setBroadcastAlert({ type: 'error', message: 'Network error communicating with broadcast engine.' });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the subscriber list?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribers/${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribers((prev) => prev.filter((s) => s.email !== email));
      } else {
        alert(data.message || 'Failed to remove subscriber.');
      }
    } catch {
      alert('Error connecting to server.');
    }
  };

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1c18', color: '#fff' }}>
        <p>Verifying administrator credentials...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login?portal=admin');
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.logoArea}>
            <Link href="/" aria-label="JustMobile Homepage">
              <Image
                src="/brand/logos/justmobile-wordmark-white.svg"
                alt="JustMobile"
                width={130}
                height={30}
                priority
              />
            </Link>
            <span className={styles.adminTag}>ADMIN OPERATIONS CONSOLE</span>
          </div>

          <div className={styles.userMenu}>
            <span style={{ fontSize: '13.5px', color: '#c3d5cb' }}>
              Logged in: <strong>{user.name}</strong> ({user.email})
            </span>
            <Link href="/" className={styles.logoutBtn} style={{ textDecoration: 'none' }}>
              View Live Website
            </Link>
            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.headerSection}>
          <h1 className={styles.headerTitle}>System & Subscriber Operations</h1>
          <p className={styles.headerSub}>Manage wholesale subscriber accounts, wholesale carrier lines, and marketing leads.</p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'subscribers' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('subscribers')}
          >
            <span>Subscribers & Line Operations</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'marketing' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('marketing')}
          >
            <span>Marketing Leads & Email Broadcast</span>
            {subscribers.length > 0 && <span className={styles.tabBadge}>{subscribers.length}</span>}
          </button>
        </div>

        {/* TAB 1: SUBSCRIBERS REGISTRY */}
        {activeTab === 'subscribers' && (
          <>
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Total System Accounts</span>
                <div className={styles.statValue}>{stats?.totalUsers ?? '...'}</div>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Active Customers</span>
                <div className={styles.statValue}>{stats?.totalCustomers ?? '...'}</div>
                <div className={styles.statSub}>Verified Mobile Subscribers</div>
              </div>
            </div>

            {/* Customer Registry Table */}
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}>Registered Customers & Subscribers</h2>
                <button type="button" onClick={fetchAdminData} className={styles.refreshBtn}>
                  {loadingData ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Cust #</th>
                      <th>Subscriber Name</th>
                      <th>Email Address</th>
                      <th>Mobile Number</th>
                      <th>Active Plan / Package</th>
                      <th>Network Status</th>
                      <th>Created At</th>
                      <th>Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#7e968a' }}>
                          {loadingData ? 'Loading subscribers...' : 'No customer records found.'}
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <span className={styles.custNoBadge}>{c.custNo || '—'}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td>{c.email}</td>
                          <td>{c.phone || '0488 912 340'}</td>
                          <td>
                            <span className={styles.planBadge}>{c.planName || 'Starter Mobile 5G'}</span>
                          </td>
                          <td>
                            <span className={formatStatus(c.lineStatus) === 'Disconnected' ? styles.statusInactiveBadge : styles.statusActiveBadge}>
                              {formatStatus(c.lineStatus)}
                            </span>
                          </td>
                          <td>{new Date(c.createdAt).toLocaleDateString('en-AU')}</td>
                          <td>{c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleTimeString('en-AU') : 'Never'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: MARKETING LEADS & EMAIL BROADCAST */}
        {activeTab === 'marketing' && (
          <>
            {/* Marketing Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Captured Newsletter Leads</span>
                <div className={styles.statValue}>{subscribers.length}</div>
                <div className={styles.statSub}>Registered from Homepage Launch Banner</div>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Email Dispatch Service</span>
                <div className={styles.statValue} style={{ fontSize: '24px', color: '#D5F879' }}>Hostinger SMTP</div>
                <div className={styles.statSub}>Ready for Bulk Broadcasts</div>
              </div>
            </div>

            {/* Broadcast Draft Box & Live Preview */}
            <div className={styles.broadcastGrid}>
              {/* Draft Box */}
              <div className={styles.broadcastCard}>
                <h2 className={styles.cardTitle}>Draft Campaign or Special Offer</h2>
                <p className={styles.cardSub}>
                  Type a subject line and announcement message below. Clicking <strong>Send Broadcast</strong> will email all {subscribers.length} active subscriber{subscribers.length === 1 ? '' : 's'} via Hostinger SMTP.
                </p>

                {/* Quick Templates */}
                <div className={styles.templateRow}>
                  <span className={styles.templateLabel}>Quick Templates:</span>
                  <button type="button" className={styles.templateChip} onClick={() => handleApplyTemplate('deal')}>
                    65GB 5G Deal
                  </button>
                  <button type="button" className={styles.templateChip} onClick={() => handleApplyTemplate('network')}>
                    Coverage Update
                  </button>
                  <button type="button" className={styles.templateChip} onClick={() => handleApplyTemplate('esim')}>
                    eSIM Instant QR
                  </button>
                </div>

                {broadcastAlert && (
                  <div className={broadcastAlert.type === 'success' ? styles.alertSuccess : styles.alertError}>
                    {broadcastAlert.message}
                  </div>
                )}

                <form onSubmit={handleSendBroadcast}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel} htmlFor="broadcast-subject">
                      Email Subject Line
                    </label>
                    <input
                      id="broadcast-subject"
                      type="text"
                      required
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      placeholder="e.g. Exclusive Weekend Offer: 65GB for $37.55"
                      className={styles.adminInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel} htmlFor="broadcast-message">
                      Offer / Announcement Body
                    </label>
                    <textarea
                      id="broadcast-message"
                      required
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Type your message, promotion details, or coupon code here..."
                      className={styles.adminTextarea}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingBroadcast || subscribers.length === 0}
                    className={styles.btnSendBroadcast}
                  >
                    {sendingBroadcast ? (
                      <span>Dispatching to Subscribers...</span>
                    ) : (
                      <span>Send to All {subscribers.length} Subscriber{subscribers.length === 1 ? '' : 's'} &rarr;</span>
                    )}
                  </button>
                </form>
              </div>

              {/* Live Preview Box */}
              <div className={styles.previewCard}>
                <h3 className={styles.cardTitle} style={{ fontSize: '16px' }}>Email Subscriber Preview</h3>
                <p className={styles.cardSub}>How recipients will see your announcement:</p>

                <div className={styles.emailPreviewFrame}>
                  <div className={styles.previewHeader}>
                    <div className={styles.previewSender}>From: JustMobile Updates &lt;no-reply@justmobile.com.au&gt;</div>
                    <div className={styles.previewSubject}>{broadcastSubject || '(No subject provided)'}</div>
                  </div>
                  <div className={styles.previewBody}>
                    {broadcastMessage || '(Type a message in the draft box to preview here...)'}
                  </div>
                  <div className={styles.previewFooter}>
                    JustMobile Australia · Less telco. More you.<br/>
                    ABN 48 672 819 204 · Telstra 5G Wholesale Network
                  </div>
                </div>
              </div>
            </div>

            {/* Subscribers Registry Table */}
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}>Captured Marketing Leads ({subscribers.length})</h2>
                <button type="button" onClick={fetchSubscribers} className={styles.refreshBtn}>
                  {loadingSubscribers ? 'Refreshing...' : 'Refresh Leads'}
                </button>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Subscriber Email Address</th>
                      <th>Origin / Source</th>
                      <th>Status</th>
                      <th>Date Subscribed</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#7e968a' }}>
                          {loadingSubscribers ? 'Loading leads...' : 'No marketing emails captured yet. Test from the homepage bottom banner!'}
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((s) => (
                        <tr key={s.id || s.email}>
                          <td style={{ fontWeight: 600, color: '#ffffff' }}>{s.email}</td>
                          <td>
                            <span style={{ fontSize: '12px', color: '#9cb5a8' }}>{s.source || 'Launch Banner'}</span>
                          </td>
                          <td>
                            <span className={styles.statusActiveBadge}>Active</span>
                          </td>
                          <td>{new Date(s.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubscriber(s.email)}
                              className={styles.deleteSubscriberBtn}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Broadcast History Table */}
            {broadcastHistory.length > 0 && (
              <div className={styles.tableCard} style={{ marginTop: '24px' }}>
                <div className={styles.tableHeader}>
                  <h2 className={styles.tableTitle}>Recent Broadcast History</h2>
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Subject Line</th>
                        <th>Sent To</th>
                        <th>Delivered Status</th>
                        <th>Dispatched At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {broadcastHistory.map((h) => (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 600 }}>{h.subject}</td>
                          <td>{h.sentCount} of {h.targetCount}</td>
                          <td>
                            <span className={styles.statusActiveBadge}>Delivered</span>
                          </td>
                          <td>{new Date(h.sentAt).toLocaleString('en-AU')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
