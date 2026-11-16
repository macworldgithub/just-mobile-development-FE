'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styles from './DobPicker.module.css';

interface DobPickerProps {
  id?: string;
  value: string;
  onChange: (isoDate: string) => void;
  required?: boolean;
  disabled?: boolean;
  compact?: boolean;
  minYear?: number;
  maxYear?: number;
  showFormattedPreview?: boolean;
}

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseIncomingDob(raw: string): { day: string; month: string; year: string } {
  const clean = (raw || '').trim();
  if (!clean) return { day: '', month: '', year: '' };

  // ISO YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return {
      year: isoMatch[1],
      month: isoMatch[2].padStart(2, '0'),
      day: isoMatch[3].padStart(2, '0'),
    };
  }

  // Australian DD/MM/YYYY
  const auMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (auMatch) {
    return {
      day: auMatch[1].padStart(2, '0'),
      month: auMatch[2].padStart(2, '0'),
      year: auMatch[3],
    };
  }

  return { day: '', month: '', year: '' };
}

function getDaysInMonth(yearStr: string, monthStr: string): number {
  const month = parseInt(monthStr, 10);
  if (!month || month < 1 || month > 12) return 31;
  const year = parseInt(yearStr, 10) || 2000;
  return new Date(year, month, 0).getDate();
}

export default function DobPicker({
  id,
  value,
  onChange,
  required = false,
  disabled = false,
  compact = false,
  minYear = 1920,
  maxYear,
  showFormattedPreview = false,
}: DobPickerProps) {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const effectiveMaxYear = maxYear ?? currentYear;

  const initial = parseIncomingDob(value);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  useEffect(() => {
    const parsed = parseIncomingDob(value);
    if (parsed.day && parsed.month && parsed.year) {
      setDay(parsed.day);
      setMonth(parsed.month);
      setYear(parsed.year);
    } else if (!value && day && month && year) {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [value]);

  const maxDay = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const days = useMemo(() => {
    return Array.from({ length: maxDay }, (_, i) => String(i + 1).padStart(2, '0'));
  }, [maxDay]);

  const years = useMemo(() => {
    const list: string[] = [];
    for (let y = effectiveMaxYear; y >= minYear; y--) {
      list.push(String(y));
    }
    return list;
  }, [effectiveMaxYear, minYear]);

  const emitChange = (nextDay: string, nextMonth: string, nextYear: string) => {
    let clampedDay = nextDay;
    if (nextDay && nextMonth) {
      const limit = getDaysInMonth(nextYear, nextMonth);
      if (parseInt(nextDay, 10) > limit) {
        clampedDay = String(limit).padStart(2, '0');
        setDay(clampedDay);
      }
    }

    if (clampedDay && nextMonth && nextYear) {
      onChange(`${nextYear}-${nextMonth}-${clampedDay}`);
    } else {
      onChange('');
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextDay = e.target.value;
    setDay(nextDay);
    emitChange(nextDay, month, year);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMonth = e.target.value;
    setMonth(nextMonth);
    emitChange(day, nextMonth, year);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextYear = e.target.value;
    setYear(nextYear);
    emitChange(day, month, nextYear);
  };

  const isComplete = Boolean(day && month && year);
  const formattedPreview = isComplete
    ? `${parseInt(day, 10)} ${SHORT_MONTHS[parseInt(month, 10) - 1] || month} ${year}`
    : '';

  return (
    <div className={`${styles.wrapper} ${compact ? styles.compact : ''}`}>
      <div className={styles.grid} role="group" aria-label="Date of Birth">
        {/* Day */}
        <div className={styles.selectWrap}>
          <select
            id={id}
            aria-label="Birth day"
            required={required}
            disabled={disabled}
            value={day}
            onChange={handleDayChange}
            className={`${styles.select} ${!day ? styles.selectEmpty : ''}`}
          >
            <option value="">Day</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <span className={styles.chevron} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>

        {/* Month */}
        <div className={styles.selectWrap}>
          <select
            id={id ? `${id}-month` : undefined}
            aria-label="Birth month"
            required={required}
            disabled={disabled}
            value={month}
            onChange={handleMonthChange}
            className={`${styles.select} ${!month ? styles.selectEmpty : ''}`}
          >
            <option value="">Month</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <span className={styles.chevron} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>

        {/* Year */}
        <div className={styles.selectWrap}>
          <select
            id={id ? `${id}-year` : undefined}
            aria-label="Birth year"
            required={required}
            disabled={disabled}
            value={year}
            onChange={handleYearChange}
            className={`${styles.select} ${!year ? styles.selectEmpty : ''}`}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span className={styles.chevron} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </div>

      {showFormattedPreview && isComplete && (
        <div className={styles.previewRow}>
          <span className={styles.previewBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Selected: {formattedPreview}
          </span>
        </div>
      )}
    </div>
  );
}

