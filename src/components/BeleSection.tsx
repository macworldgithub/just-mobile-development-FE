'use strict';
'use client';

import React, { useState } from 'react';
import styles from './BeleSection.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'What plans do you offer?',
  'Can I keep my current number?',
  'How does digital eSIM activation work?',
  'Which phone is best value?',
  'What is the coverage like?',
];

export default function BeleSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "G'day! I'm Bele, your JustMobile assistant. Ask me anything about our plans, keeping your number, eSIM activation, or phone options — with zero runaround.",
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

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
                <span>Understand phone financing before you buy</span>
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
          <div className={styles.chatCard}>
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
                  Online · gpt-4o-mini
                </span>
              </div>
              <button
                type="button"
                className={styles.resetBtn}
                title="Reset conversation"
                onClick={() =>
                  setMessages([
                    {
                      role: 'assistant',
                      content:
                        "Conversation refreshed! How can I help with your JustMobile questions?",
                    },
                  ])
                }
              >
                ↺
              </button>
            </div>

            {/* Chat Messages */}
            <div className={styles.chatMessages}>
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
                    {m.content}
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
