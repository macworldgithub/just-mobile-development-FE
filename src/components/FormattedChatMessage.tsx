'use strict';
'use client';

import React from 'react';
import styles from './FormattedChatMessage.module.css';

interface FormattedChatMessageProps {
  content: string;
  role?: 'user' | 'assistant' | 'system';
}

function parseInline(text: string): React.ReactNode[] {
  // Regex matches:
  // 1. Markdown bold: **bold text**
  // 2. Markdown links: [text](url)
  // 3. Web URLs: https?://...
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\)|\bhttps?:\/\/[^\s]+)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      nodes.push(
        <strong key={`b-${match.index}`} className={styles.boldText}>
          {boldText}
        </strong>,
      );
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const parts = token.slice(1, -1).split('](');
      const label = parts[0];
      const href = parts[1];
      nodes.push(
        <a
          key={`a-${match.index}`}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={styles.chatLink}
        >
          {label}
        </a>,
      );
    } else if (token.startsWith('http')) {
      nodes.push(
        <a
          key={`url-${match.index}`}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.chatLink}
        >
          {token}
        </a>,
      );
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default function FormattedChatMessage({ content, role }: FormattedChatMessageProps) {
  if (role === 'user') {
    return <div className={styles.userText}>{content}</div>;
  }

  // Pre-normalize text if bullet points are separated without newlines
  const normalized = (content || '')
    .replace(/([^\n])\s*[-*•]\s+\*\*/g, (m, p1) => `${p1}\n- **`)
    .trim();

  // Split content into blocks based on lines
  const lines = normalized.split('\n');
  const blocks: React.ReactNode[] = [];

  let currentListItems: React.ReactNode[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join(' ').trim();
      if (text) {
        blocks.push(
          <p key={`p-${blocks.length}`} className={styles.paragraph}>
            {parseInline(text)}
          </p>,
        );
      }
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className={styles.bulletList}>
          {currentListItems}
        </ul>,
      );
      currentListItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Check if line is a bullet item (starts with "- ", "* ", or "• ")
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      const itemContent = bulletMatch[1];
      currentListItems.push(
        <li key={`li-${currentListItems.length}`} className={styles.listItem}>
          <span className={styles.bulletDot} aria-hidden="true" />
          <div className={styles.itemBody}>{parseInline(itemContent)}</div>
        </li>,
      );
      continue;
    }

    // Check if numbered list item (e.g. "1. ")
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      flushParagraph();
      const num = numberedMatch[1];
      const itemContent = numberedMatch[2];
      currentListItems.push(
        <li key={`li-${currentListItems.length}`} className={styles.listItem}>
          <span className={styles.numberBadge}>{num}</span>
          <div className={styles.itemBody}>{parseInline(itemContent)}</div>
        </li>,
      );
      continue;
    }

    // Normal paragraph line
    flushList();
    currentParagraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return <div className={styles.container}>{blocks}</div>;
}

