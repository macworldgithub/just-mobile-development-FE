'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import FormattedChatMessage from './FormattedChatMessage';
import QuickstreamPaymentCard from './QuickstreamPaymentCard';
import { getApiUrl } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import styles from './BeleSection.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickstreamUiAction {
  type: 'QUICKSTREAM_PAYMENT';
  custNo: string;
  authToken: string;
  purpose: 'new_order' | 'port_order' | 'update_card';
  planName?: string;
  planNo?: string;
  planPrice?: number;
  orderDraft?: Record<string, any>;
}

interface ChatActivatedEsim {
  orderId: string;
  msn: string;
  planName?: string;
  status: string;
  lpa?: string | null;
  qrCodeDataUrl?: string | null;
  smdpAddress?: string | null;
  activationCode?: string | null;
}

const QUICK_PROMPTS = [
  'What plans do you offer?',
  'Can I keep my current number?',
  'How does digital eSIM activation work?',
  'Which phone is best value?',
  'What is the coverage like?',
];

const createSessionId = (prefix = 'bele'): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function BeleSection() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "G'day! I'm Bele, your JustMobile assistant. Ask me anything about our plans, keeping your number, eSIM activation, or phone options — with zero runaround.",
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeUiAction, setActiveUiAction] = useState<QuickstreamUiAction | null>(null);
  const [chatCardSaved, setChatCardSaved] = useState(false);
  const [chatActivatingOrder, setChatActivatingOrder] = useState(false);
  const [chatActivationError, setChatActivationError] = useState<string | null>(null);
  const [chatActivatedEsim, setChatActivatedEsim] = useState<ChatActivatedEsim | null>(null);
  const [copiedChatLpa, setCopiedChatLpa] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = createSessionId('bele');
    }
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading, activeUiAction, chatActivatedEsim, chatActivationError]);

  const activateOrderFromChat = async (action: QuickstreamUiAction) => {
    setChatActivatingOrder(true);
    setChatActivationError(null);
    try {
      const endpoint =
        action.purpose === 'port_order'
          ? `${getApiUrl()}/api/carrier/orders/activate-port`
          : `${getApiUrl()}/api/carrier/orders/activate`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(action.authToken ? { Authorization: `Bearer ${action.authToken}` } : {}),
        },
        body: JSON.stringify(action.orderDraft || {}),
      });
      const activateData = await res.json().catch(() => ({}));
      if (!res.ok || !activateData?.success) {
        throw new Error(
          activateData?.message ||
            'Could not complete carrier activation right now. Your card is saved — please retry or check your My Account portal.',
        );
      }

      const createdOrderId = activateData.orderId || '';
      let qrData: any = null;
      if (createdOrderId) {
        const qrRes = await fetch(
          `${getApiUrl()}/api/carrier/qrcodes/${encodeURIComponent(createdOrderId)}`,
          {
            headers: action.authToken
              ? { Authorization: `Bearer ${action.authToken}` }
              : undefined,
          },
        ).catch(() => null);
        if (qrRes && qrRes.ok) {
          qrData = await qrRes.json().catch(() => null);
        }
      }

      const activatedMsn = activateData.msn || action.orderDraft?.msn || '';
      setChatActivatedEsim({
        orderId: createdOrderId,
        msn: activatedMsn,
        planName: action.planName,
        status: activateData.status || (action.purpose === 'port_order' ? 'PORT_IN_PROGRESS' : 'ACTIVE'),
        lpa: qrData?.lpa || activateData.lpaString || null,
        qrCodeDataUrl: qrData?.qrCodeDataUrl || null,
        smdpAddress: qrData?.smdpAddress || null,
        activationCode: qrData?.activationCode || null,
      });
      setActiveUiAction(null);
      setChatCardSaved(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            action.purpose === 'port_order'
              ? `Awesome news! Your card is saved for automatic monthly billing and your mobile number transfer order (#${createdOrderId}) for **${activatedMsn}** on **${action.planName}** has been submitted. Your eSIM card is shown below (and you can also visit [My Account](/account) anytime to track your transfer).`
              : `Awesome news! Your card is saved for automatic monthly billing and your **${action.planName}** eSIM (#${createdOrderId}) for **${activatedMsn}** is active! Your eSIM QR code is shown below, and you can also view or manage it anytime in [My Account](/account).`,
        },
      ]);
    } catch (err: any) {
      setChatActivationError(
        err?.message || 'Unable to activate your eSIM right now. Please click Retry below.',
      );
    } finally {
      setChatActivatingOrder(false);
    }
  };

  const sendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch(`${getApiUrl()}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: newMessages, sessionId: sessionIdRef.current }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "I'm here to help! Our plans start from $31/mth (15GB) up to $67/mth (180GB) on the Telstra Wholesale Network.",
          },
        ]);
      }
      if (data.uiAction?.type === 'QUICKSTREAM_PAYMENT') {
        setActiveUiAction(data.uiAction);
        setChatCardSaved(false);
        setChatActivationError(null);
        setChatActivatedEsim(null);
      }
    } catch (err) {
      console.error('Failed to get AI response:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Sorry, I had a brief connection issue. You can explore all our plans above or ask another question!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputVal);
  };

  return (
    <section id="bele" className={styles.beleSection}>
      <div className={styles.container}>
        <div className={styles.beleGrid}>
          {/* Left Column: Copy & Value points */}
          <div className={styles.beleCopy}>
            <span className={styles.eyebrow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
              </svg>
              <span>MEET YOUR MOBILE SIDEKICK.</span>
            </span>
            <h2 className={styles.title}>
              A little help.
              <br />
              A lot less hassle.
            </h2>
            <p className={styles.subtitle}>
              Meet Bele. Our vision for a smarter, simpler mobile assistant. Less digging through support pages. More straight answers.
            </p>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Start with the right plan</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Set up Direct Debit payment &amp; activate eSIM in chat</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>Get step-by-step help with eSIM & number porting</span>
              </div>
            </div>

            <div className={styles.quickPrompts}>
              <span className={styles.quickPromptsTitle}>Try asking:</span>
              <div className={styles.promptChips}>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={styles.promptChip}
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                  >
                    <span>{prompt}</span>
                    <span className={styles.chipArrow}>↗</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat Interface */}
          <div className={`${styles.chatCard} ${activeUiAction || chatActivatedEsim ? styles.chatCardExpanded : ''}`}>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <div className={styles.assistantAvatar}>
                <span>bele</span>
                <span className={styles.avatarStar}>✦</span>
              </div>
              <div className={styles.assistantInfo}>
                <strong className={styles.assistantName}>Bele AI</strong>
                <span className={styles.assistantStatus}>
                  <span className={styles.statusDot}></span>
                  Online
                </span>
              </div>
              <button
                type="button"
                className={styles.resetBtn}
                title="Reset conversation"
                onClick={() => {
                  const prevSessionId = sessionIdRef.current;
                  sessionIdRef.current = createSessionId('bele');
                  if (prevSessionId) {
                    fetch(`${getApiUrl()}/api/chat/reset`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ sessionId: prevSessionId }),
                    }).catch(() => {});
                  }
                  setActiveUiAction(null);
                  setChatCardSaved(false);
                  setChatActivationError(null);
                  setChatActivatedEsim(null);
                  setCopiedChatLpa(false);
                  setMessages([
                    {
                      role: 'assistant',
                      content:
                        "Conversation refreshed! How can I help with your JustMobile questions?",
                    },
                  ]);
                }}
              >
                ↺
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={messagesContainerRef} className={styles.chatMessages}>
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`${styles.messageWrap} ${
                    m.role === 'user' ? styles.userWrap : styles.assistantWrap
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className={styles.smallAvatar}>✦</div>
                  )}
                  <div
                    className={`${styles.messageBubble} ${
                      m.role === 'user' ? styles.userBubble : styles.assistantBubble
                    }`}
                  >
                    <FormattedChatMessage content={m.content} role={m.role} />
                  </div>
                </div>
              ))}

              {loading && (
                <div className={`${styles.messageWrap} ${styles.assistantWrap}`}>
                  <div className={styles.smallAvatar}>✦</div>
                  <div className={`${styles.messageBubble} ${styles.assistantBubble} ${styles.typingBubble}`}>
                    <span className={styles.dot1}>•</span>
                    <span className={styles.dot2}>•</span>
                    <span className={styles.dot3}>•</span>
                  </div>
                </div>
              )}

              {activeUiAction?.type === 'QUICKSTREAM_PAYMENT' && (
                <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                  {chatActivatingOrder ? (
                    <div
                      style={{
                        background: '#f4faee',
                        border: '1px solid #a3dc8f',
                        color: '#245012',
                        borderRadius: '12px',
                        padding: '14px',
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    >
                      ✓ Card saved securely. Provisioning your eSIM now...
                    </div>
                  ) : chatCardSaved ? (
                    <div
                      style={{
                        background: '#f9fbf8',
                        border: '1.5px solid #dce4d8',
                        borderRadius: '14px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#245012', marginBottom: '6px' }}>
                        ✓ Payment card already saved
                      </div>
                      {chatActivationError && (
                        <div style={{ fontSize: '12.5px', color: '#B42318', marginBottom: '10px', lineHeight: 1.45 }}>
                          {chatActivationError}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => activateOrderFromChat(activeUiAction)}
                          style={{
                            flex: 1,
                            background: '#142420',
                            color: '#D5F879',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Retry Activation →
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveUiAction(null);
                            setChatCardSaved(false);
                          }}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd8c7',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#142420',
                            cursor: 'pointer',
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <QuickstreamPaymentCard
                      key={`${activeUiAction.custNo}-${activeUiAction.purpose}-${activeUiAction.orderDraft?.msn || 'card'}-${activeUiAction.planNo || ''}`}
                      custNo={activeUiAction.custNo}
                      authToken={activeUiAction.authToken}
                      planName={activeUiAction.planName}
                      planPrice={activeUiAction.planPrice}
                      submitLabel={
                        activeUiAction.purpose === 'update_card'
                          ? 'Save Card for Auto-Pay'
                          : 'Save Card & Activate eSIM →'
                      }
                      onCancel={() => setActiveUiAction(null)}
                      onPaymentComplete={(success, msg) => {
                        if (!success) return;
                        if (activeUiAction.purpose === 'update_card') {
                          setActiveUiAction(null);
                          setMessages((prev) => [
                            ...prev,
                            {
                              role: 'assistant',
                              content: `${msg || '✓ Your card has been saved via Westpac QuickStream for automatic monthly billing (28th cycle).'} You can also view or manage your billing anytime in [My Account](/account).`,
                            },
                          ]);
                        } else {
                          setChatCardSaved(true);
                          activateOrderFromChat(activeUiAction);
                        }
                      }}
                    />
                  )}
                </div>
              )}

              {chatActivatedEsim && (
                <div
                  style={{
                    background: '#f4faee',
                    border: '1.5px solid #a3dc8f',
                    borderRadius: '14px',
                    padding: '14px',
                    marginTop: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#275210', marginBottom: '4px' }}>
                    ORDER #{chatActivatedEsim.orderId} · {chatActivatedEsim.status}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#142420', marginBottom: '10px' }}>
                    {chatActivatedEsim.msn} · {chatActivatedEsim.planName || 'JustMobile eSIM'}
                  </div>
                  {chatActivatedEsim.qrCodeDataUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={chatActivatedEsim.qrCodeDataUrl}
                      alt="eSIM Activation QR Code"
                      width={160}
                      height={160}
                      style={{ display: 'block', margin: '0 auto 10px', borderRadius: '8px', background: '#ffffff', padding: '6px' }}
                    />
                  )}
                  {chatActivatedEsim.lpa && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(chatActivatedEsim.lpa || '');
                        setCopiedChatLpa(true);
                        setTimeout(() => setCopiedChatLpa(false), 2000);
                      }}
                      style={{
                        width: '100%',
                        background: '#ffffff',
                        border: '1px solid #cbd8c7',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#142420',
                        cursor: 'pointer',
                        marginBottom: '8px',
                      }}
                    >
                      {copiedChatLpa ? '✓ Copied LPA String' : 'Copy Manual eSIM LPA Code'}
                    </button>
                  )}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                      href="/account"
                      style={{
                        background: '#142420',
                        color: '#D5F879',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      Open My Account →
                    </Link>
                    <button
                      type="button"
                      onClick={() => setChatActivatedEsim(null)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd8c7',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#142420',
                        cursor: 'pointer',
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className={styles.chatInputForm}>
              <input
                type="text"
                placeholder="Ask Bele a question…"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className={styles.chatInput}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className={styles.sendBtn}
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
