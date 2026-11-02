'use strict';
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
  onOpenAccount?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export default function Header({ onOpenAccount, onNavigateSection }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [signInDropdownOpen, setSignInDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (signInRef.current && !signInRef.current.contains(e.target as Node)) {
        setSignInDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSignOut = () => {
    logout();
    setAccountMenuOpen(false);
    router.push('/');
  };

  return (
    <header className={styles.headerWrapper}>
      {/* Top Announcement Bar */}
      <div className={styles.announcementBar}>
        <div className={styles.announcementInner}>
          <div className={styles.announcementLeft}>
            <span>A fresh take on Australian mobile.</span>{' '}
            <Link href="#plans" className={styles.announcementLink}>
              <strong>Just more. ↗</strong>
            </Link>
          </div>
          <div className={styles.announcementRight}>
            <span>Live Australia-wide · 5G & eSIM Ready</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={styles.navbar} aria-label="Main Navigation">
        <div className={styles.navContainer}>
          {/* Logo */}
          <Link href="/" className={styles.logoLink} aria-label="JustMobile Home">
            <Image
              src="/brand/logos/justmobile-wordmark-ink.svg"
              alt="JustMobile"
              width={158}
              height={35}
              priority
              className={styles.logoImage}
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className={styles.navLinks}>
            <a
              href="#plans"
              className={styles.navItem}
              onClick={(e) => handleNavClick(e, 'plans')}
            >
              Mobile plans
            </a>
            <a
              href="#phones"
              className={styles.navItem}
              onClick={(e) => handleNavClick(e, 'phones')}
            >
              <span>Phones</span>
              <span className={styles.newBadge}>NEW</span>
            </a>
            <a
              href="#network"
              className={styles.navItem}
              onClick={(e) => handleNavClick(e, 'network')}
            >
              Our network
            </a>
            <a
              href="#bele"
              className={styles.navItem}
              onClick={(e) => handleNavClick(e, 'bele')}
            >
              Meet Bele
            </a>
            <a
              href="#help"
              className={styles.navItem}
              onClick={(e) => handleNavClick(e, 'help')}
            >
              Help
            </a>
          </div>

          {/* Right Action: Direct Sign In (Customer/Admin) and Sign Up buttons */}
          <div className={styles.rightActions}>
            {user ? (
              <div className={styles.accountDropdownWrapper} ref={dropdownRef}>
                <button
                  type="button"
                  className={`${styles.accountBtn} ${accountMenuOpen ? styles.accountBtnActive : ''}`}
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="true"
                  aria-label="Account options"
                >
                  <svg
                    className={styles.userIcon}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className={styles.accountText}>
                    {user.name.split(' ')[0]} ↗
                  </span>
                </button>

                {accountMenuOpen && (
                  <div className={styles.accountMenu} role="menu">
                    <div className={styles.userCardHeader}>
                      <p className={styles.userNameLabel}>{user.name}</p>
                      <p className={styles.userRoleLabel}>
                        {user.email}
                      </p>
                    </div>

                    <div className={styles.menuSection}>
                      <Link
                        href="/account"
                        className={styles.menuItem}
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <span>Customer Dashboard</span>
                        <span>→</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className={styles.menuItem}
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          <span>Admin Console</span>
                          <span>→</span>
                        </Link>
                      )}
                    </div>

                    <div className={styles.menuDivider} />

                    <div className={styles.menuSection}>
                      <button
                        type="button"
                        className={styles.menuItem}
                        onClick={handleSignOut}
                      >
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authButtonGroup}>
                {/* Sign In Dropdown Button */}
                <div className={styles.signInWrapper} ref={signInRef}>
                  <button
                    type="button"
                    className={`${styles.signInBtn} ${signInDropdownOpen ? styles.signInBtnActive : ''}`}
                    onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
                    aria-expanded={signInDropdownOpen}
                    aria-haspopup="true"
                    aria-label="Sign in options"
                  >
                    <span>Sign In</span>
                    <svg
                      className={styles.chevronIcon}
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {signInDropdownOpen && (
                    <div className={styles.signInDropdown} role="menu">
                      <Link
                        href="/login?portal=customer"
                        className={styles.portalOption}
                        onClick={() => setSignInDropdownOpen(false)}
                      >
                        <div className={styles.portalOptionText}>
                          <span className={styles.portalTitle}>Customer</span>
                          <span className={styles.portalDesc}>Personal plans & services</span>
                        </div>
                        <span className={styles.arrowIcon}>→</span>
                      </Link>

                      <Link
                        href="/login?portal=admin"
                        className={styles.portalOption}
                        onClick={() => setSignInDropdownOpen(false)}
                      >
                        <div className={styles.portalOptionText}>
                          <span className={styles.portalTitle}>Admin</span>
                          <span className={styles.portalDesc}>Operations & console</span>
                        </div>
                        <span className={styles.arrowIcon}>→</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Direct Sign Up Button */}
                <Link href="/signup" className={styles.signUpNavBtn}>
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <a
              href="#plans"
              className={styles.mobileNavItem}
              onClick={(e) => handleNavClick(e, 'plans')}
            >
              Mobile plans
            </a>
            <a
              href="#phones"
              className={styles.mobileNavItem}
              onClick={(e) => handleNavClick(e, 'phones')}
            >
              Phones <span className={styles.newBadge}>NEW</span>
            </a>
            <a
              href="#network"
              className={styles.mobileNavItem}
              onClick={(e) => handleNavClick(e, 'network')}
            >
              Our network
            </a>
            <a
              href="#bele"
              className={styles.mobileNavItem}
              onClick={(e) => handleNavClick(e, 'bele')}
            >
              Meet Bele
            </a>
            <a
              href="#help"
              className={styles.mobileNavItem}
              onClick={(e) => handleNavClick(e, 'help')}
            >
              Help & Support
            </a>
            <div className={styles.mobileAccountWrapper}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link
                    href="/account"
                    className={styles.mobileAccountBtn}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>My Account ({user.name.split(' ')[0]})</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={styles.mobileAccountBtn}
                      style={{ background: '#253e34', color: '#D5F879' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Admin Console</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={styles.mobileAccountBtn}
                    style={{ background: '#f0f0ee', color: '#142420' }}
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#7d8f79', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 4px' }}>
                    Sign In
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <Link
                      href="/login?portal=customer"
                      className={styles.mobileAccountBtn}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Customer</span>
                    </Link>
                    <Link
                      href="/login?portal=admin"
                      className={styles.mobileAccountBtn}
                      style={{ background: '#253e34', color: '#D5F879' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Admin</span>
                    </Link>
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#7d8f79', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '6px 4px 0' }}>
                    Sign Up
                  </div>
                  <Link
                    href="/signup"
                    className={styles.mobileAccountBtn}
                    style={{ background: '#142420', color: '#ffffff' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Sign Up (Create Account)</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
