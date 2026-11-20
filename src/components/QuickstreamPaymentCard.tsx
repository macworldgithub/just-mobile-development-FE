'use strict';
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getApiUrl } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface QuickstreamAPIType {
    init: (options: { publishableApiKey: string }) => void;
    creditCards: {
      createTrustedFrame: (
        options: Record<string, any>,
        callback: (errors: any, data: any) => void,
      ) => void;
    };
  }

  interface Window {
    QuickstreamAPI?: QuickstreamAPIType;
  }
}

export interface QuickstreamPaymentCardProps {
  custNo: string;
  authToken?: string;
  planName?: string;
  planPrice?: number;
  submitLabel?: string;
  onPaymentComplete: (success: boolean, message?: string) => void;
  onCancel?: () => void;
}

const QUICKSTREAM_SCRIPT_URL =
  'https://api.quickstream.westpac.com.au/rest/v1/quickstream-api-1.0.min.js';
const QUICKSTREAM_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_QUICKSTREAM_PUBLISHABLE_KEY ||
  'TIAB_PUB_sawvcp2cgmdfiyehcysqpe6qh6ajk4pbhgasz3t9tetu7t3r9p767ygsmmxm';
const QUICKSTREAM_SUPPLIER_BUSINESS_CODE =
  process.env.NEXT_PUBLIC_QUICKSTREAM_BUSINESS_CODE || 'TIABREST';

export default function QuickstreamPaymentCard({
  custNo,
  authToken,
  planName,
  planPrice,
  submitLabel,
  onPaymentComplete,
  onCancel,
}: QuickstreamPaymentCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trustedFrameRef = useRef<any>(null);
  const { token: contextAuthToken } = useAuth();
  const effectiveToken = authToken || contextAuthToken;

  const [frameReady, setFrameReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'succeeded'>('idle');

  useEffect(() => {
    let cancelled = false;
    trustedFrameRef.current = null;
    setFrameReady(false);
    setErrorMsg(null);

    const mountTrustedFrame = () => {
      if (cancelled || !window.QuickstreamAPI || !containerRef.current) return;

      containerRef.current.innerHTML = '';

      try {
        window.QuickstreamAPI.init({
          publishableApiKey: QUICKSTREAM_PUBLISHABLE_KEY,
        });
      } catch {
        // QuickStream throws if init was already called in the same window lifetime
      }

      window.QuickstreamAPI.creditCards.createTrustedFrame(
        {
          config: {
            supplierBusinessCode: QUICKSTREAM_SUPPLIER_BUSINESS_CODE,
          },
          iframe: {
            width: '100%',
            height: '390px',
            scrolling: 'no',
            style: {
              width: '100%',
              height: '390px',
              border: 'none',
              background: '#ffffff',
              display: 'block',
            },
          },
          fieldStyles: {
            base: {
              fontSize: '15px',
              color: '#142420',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            },
            invalid: {
              color: '#b42318',
            },
          },
        },
        (errors: any, data: any) => {
          if (cancelled) return;
          if (errors) {
            setErrorMsg('Unable to load the secure card form. Please refresh and try again.');
            return;
          }
          if (data?.trustedFrame) {
            trustedFrameRef.current = data.trustedFrame;
            setFrameReady(true);
          }
        },
      );
    };

    const existingScript = document.getElementById('quickstream-js') as HTMLScriptElement | null;
    const containerEl = containerRef.current;

    const teardownFrame = () => {
      try {
        trustedFrameRef.current?.teardown?.();
      } catch {
        // ignore teardown errors
      }
      trustedFrameRef.current = null;
      if (containerEl) {
        containerEl.innerHTML = '';
      }
    };

    if (window.QuickstreamAPI) {
      mountTrustedFrame();
    } else if (existingScript) {
      const handleLoad = () => mountTrustedFrame();
      const handleError = () => {
        if (!cancelled) {
          setErrorMsg('Failed to load Westpac QuickStream card form. Check your connection.');
        }
      };
      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);
      return () => {
        cancelled = true;
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
        teardownFrame();
      };
    } else {
      const script = document.createElement('script');
      script.id = 'quickstream-js';
      script.src = QUICKSTREAM_SCRIPT_URL;
      script.async = true;
      script.onload = mountTrustedFrame;
      script.onerror = () => {
        if (!cancelled) {
          setErrorMsg('Failed to load Westpac QuickStream card form. Check your connection.');
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      teardownFrame();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || paymentStatus === 'succeeded') return;

    const cleanCustNo = String(custNo || '').trim();
    if (!cleanCustNo) {
      setErrorMsg('Customer profile is required before registering a payment method.');
      return;
    }

    if (!trustedFrameRef.current) {
      setErrorMsg('Secure card form is still initializing. Please wait a moment.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    trustedFrameRef.current.submitForm(async (errors: any, data: any) => {
      if (errors) {
        const firstMsg =
          Array.isArray(errors) && errors[0]?.messages?.[0]
            ? String(errors[0].messages[0])
            : typeof errors?.message === 'string'
              ? errors.message
              : 'Please check your card details and try again.';
        setErrorMsg(firstMsg);
        setSubmitting(false);
        return;
      }

      const token = data?.singleUseToken?.singleUseTokenId;
      if (!token) {
        setErrorMsg('Could not generate a secure card token. Please try again.');
        setSubmitting(false);
        return;
      }

      try {
        const res = await fetch(
          `${getApiUrl()}/api/carrier/customers/${encodeURIComponent(cleanCustNo)}/payment-methods`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
            },
            body: JSON.stringify({ paymentTokenId: token }),
          },
        );

        const resData = await res.json().catch(() => ({}));
        if (!res.ok || !resData?.success) {
          throw new Error(
            resData?.message || 'We could not register your payment method with Octane.',
          );
        }

        setPaymentStatus('succeeded');
        onPaymentComplete(
          true,
          resData?.message || 'Payment method registered with Octane successfully.',
        );
      } catch (err: any) {
        setErrorMsg(
          err?.message || 'Unable to register your payment method right now. Please try again.',
        );
      } finally {
        setSubmitting(false);
      }
    });
  };

  return (
    <div
      style={{
        background: '#f9fbf8',
        border: '1.5px solid #dce4d8',
        borderRadius: '14px',
        padding: '18px',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e5ede2',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: '#49721d',
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            Westpac QuickStream · Octane Direct Debit
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#142420' }}>
            {planName || 'JustMobile Direct Debit Setup'}
          </div>
        </div>
        {typeof planPrice === 'number' && planPrice > 0 && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#142420' }}>
              ${planPrice.toFixed(2)}
            </span>
            <span style={{ fontSize: '12px', color: '#556253' }}>/month</span>
          </div>
        )}
      </div>

      <p style={{ fontSize: '12.5px', color: '#4c5a49', margin: '0 0 12px 0', lineHeight: 1.5 }}>
        Your card details are collected directly inside Westpac QuickStream&apos;s encrypted frame and
        registered on Octane for automatic monthly billing (28th cycle). JustMobile never stores raw card numbers.
      </p>

      {errorMsg && (
        <div
          style={{
            background: '#FEF3F2',
            border: '1px solid #FECDCA',
            color: '#B42318',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          {errorMsg}
        </div>
      )}

      {paymentStatus === 'succeeded' ? (
        <div
          style={{
            background: '#f4faee',
            border: '1px solid #a3dc8f',
            color: '#245012',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '13.5px',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          ✓ Card securely registered with Octane for automated billing.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div
            ref={containerRef}
            id="creditCardContainer"
            data-quickstream-api="creditCardContainer"
            style={{
              minHeight: '390px',
              padding: '10px 12px 4px',
              background: '#ffffff',
              border: '1px solid #dce4d8',
              borderRadius: '12px',
              marginBottom: '14px',
            }}
          />

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd8c7',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#142420',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                ← Back
              </button>
            )}
            <button
              type="submit"
              disabled={!frameReady || submitting}
              style={{
                flex: 1,
                background: !frameReady || submitting ? '#95a592' : '#142420',
                color: '#D5F879',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: !frameReady || submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {!frameReady
                ? 'Loading Secure Card Form...'
                : submitting
                  ? 'Registering Card with Octane...'
                  : submitLabel || 'Save Card & Continue →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

