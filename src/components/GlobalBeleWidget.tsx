'use strict';
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import BeleChatWidget from './BeleChatWidget';

/**
 * Mounts the floating Bele AI assistant across customer-facing pages while hiding it on Admin screens.
 */
export default function GlobalBeleWidget() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return <BeleChatWidget />;
}

