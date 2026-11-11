'use strict';
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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

export default function AdminPage() {
  const router = useRouter();
  const { user, token, logout, isLoading } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login?portal=admin');
      } else {
        fetchAdminData();
      }
    }
  }, [user, isLoading, router, fetchAdminData]);

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
        </div>

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
                        <span className={styles.statusActiveBadge}>{c.lineStatus || 'Active'}</span>
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
      </main>
    </div>
  );
}
