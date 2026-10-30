'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

interface HeaderProps {
  onOpenAccount?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export default function Header({ onOpenAccount, onNavigateSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <span>Design preview · Indicative pricing</span>
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

          {/* Right Action: My Account */}
          <div className={styles.rightActions}>
            <button
              type="button"
              className={styles.accountBtn}
              onClick={onOpenAccount}
              aria-label="Open my account"
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
              <span className={styles.accountText}>My account ↗</span>
            </button>

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
              <button
                type="button"
                className={styles.mobileAccountBtn}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAccount) onOpenAccount();
                }}
              >
                <span>My account ↗</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
