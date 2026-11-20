'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import FormattedChatMessage from './FormattedChatMessage';
import QuickstreamPaymentCard from './QuickstreamPaymentCard';
import styles from './BeleChatWidget.module.css';
import { CHATBOT_CONFIG } from '@/config/chatbotConfig';
import { getApiUrl } from '@/config/api';

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

interface BeleChatWidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function BeleChatWidget({ isOpen: controlledOpen, onToggle }: BeleChatWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi there! I'm Bele, your JustMobile assistant. I can help you sign up, choose a plan & mobile number (or bring your existing number), set up payment securely, or manage your account right here — or you can visit [My Account](/account) anytime.",
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
  const windowBodyRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `widget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
  }, []);

  const toggleChat = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const scrollToBottom = () => {
    if (windowBodyRef.current) {
      windowBodyRef.current.scrollTo({
        top: windowBodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => scrollToBottom());
      return () => cancelAnimationFrame(id);
    }
  }, [messages, loading, isOpen, activeUiAction, chatActivatedEsim, chatActivationError]);

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
              ? `Awesome news! Your card is registered with Octane and your mobile number transfer order (#${createdOrderId}) for **${activatedMsn}** on **${action.planName}** has been submitted. Your eSIM card is shown below (and you can also visit [My Account](/account) anytime to track your transfer).`
              : `Awesome news! Your card is registered with Octane and your **${action.planName}** eSIM (#${createdOrderId}) for **${activatedMsn}** is active! Your eSIM QR code is shown below, and you can also view or manage it anytime in [My Account](/account).`,
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
        headers: { 'Content-Type': 'application/json' },
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
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Sorry, I had a momentary connection hiccup. Feel free to try again or explore our plans above!",
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
    <div className={styles.widgetWrapper}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className={styles.floatingTrigger}
          onClick={toggleChat}
          aria-label="Open Bele AI Chat"
        >
          <div className={styles.triggerBadge}>
            <span className={styles.triggerSparkle}>✦</span>
            <span>Ask Bele</span>
          </div>
          <span className={styles.livePulse}></span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`${styles.chatWindow} ${activeUiAction || chatActivatedEsim ? styles.chatWindowExpanded : ''}`}
          role="dialog"
          aria-label="Bele AI Assistant"
        >
          {/* Header */}
          <div className={styles.windowHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.avatar}>✦</div>
              <div className={styles.headerText}>
                <strong className={styles.botName}>Bele AI</strong>
                <span className={styles.botStatus}>
                  <span className={styles.statusDot}></span>
                  Online
                </span>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.headerBtn}
                title="Refresh conversation"
                onClick={() => {
                  setActiveUiAction(null);
                  setChatCardSaved(false);
                  setChatActivationError(null);
                  setChatActivatedEsim(null);
                  setMessages([
                    {
                      role: 'assistant',
                      content: 'How else can I help you today?',
                    },
                  ]);
                }}
              >
                ↺
              </button>
              <button
                type="button"
                className={styles.headerBtn}
                onClick={toggleChat}
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={windowBodyRef} className={styles.windowBody}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`${styles.messageRow} ${
                  m.role === 'user' ? styles.userRow : styles.botRow
                }`}
              >
                {m.role === 'assistant' && (
                  <div className={styles.botSmallAvatar}>✦</div>
                )}
                <div
                  className={`${styles.bubble} ${
                    m.role === 'user' ? styles.userBubble : styles.botBubble
                  }`}
                >
                  <FormattedChatMessage content={m.content} role={m.role} />
                </div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.messageRow} ${styles.botRow}`}>
                <div className={styles.botSmallAvatar}>✦</div>
                <div className={`${styles.bubble} ${styles.botBubble} ${styles.typing}`}>
                  <span>•</span>
                  <span>•</span>
                  <span>•</span>
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
                    ✓ Card saved with Octane. Provisioning your eSIM now...
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
                      ✓ Card already saved with Octane
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
                    custNo={activeUiAction.custNo}
                    authToken={activeUiAction.authToken}
                    planName={activeUiAction.planName}
                    planPrice={activeUiAction.planPrice}
                    submitLabel={
                      activeUiAction.purpose === 'update_card'
                        ? 'Register Card for Octane Auto-Pay'
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
                            content: `${msg || '✓ Your card has been registered with Octane for automated Direct Debit billing.'} You can also view or manage your billing anytime in [My Account](/account).`,
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
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {!activeUiAction && !chatActivatedEsim && (
            <div className={styles.quickPromptRow}>
              {CHATBOT_CONFIG.quickPrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={styles.promptBtn}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className={styles.windowFooter}>
            <input
              type="text"
              placeholder="Ask Bele anything…"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className={styles.inputField}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className={styles.submitBtn}
              aria-label="Send message"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
