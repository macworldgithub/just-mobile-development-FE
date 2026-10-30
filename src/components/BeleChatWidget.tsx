'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './BeleChatWidget.module.css';
import { CHATBOT_CONFIG } from '@/config/chatbotConfig';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
        "Hi there! I'm Bele, your JustMobile assistant. Ask me anything about our plans, keeping your number, or our phones — zero runaround.",
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
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
              "I'm here to help! Our plans start from $19/mth for 20GB, $25 for 50GB, and $35 for 100GB on the Telstra Wholesale Network.",
          },
        ]);
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
        <div className={styles.chatWindow} role="dialog" aria-label="Bele AI Assistant">
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
                onClick={() =>
                  setMessages([
                    {
                      role: 'assistant',
                      content: "How else can I help you today?",
                    },
                  ])
                }
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
          <div className={styles.windowBody}>
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
                  {m.content}
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
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
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
