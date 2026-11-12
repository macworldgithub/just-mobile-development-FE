'use strict';
'use client';

import React, { useState } from 'react';
import styles from './CisModal.module.css';

interface CisModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: string;
}

interface PlanCisDetails {
  id: string;
  name: string;
  monthlyFee: number;
  dataGb: number;
  costPerGb: number;
  network: string;
  tier?: string;
}

const PLAN_DATA: Record<string, PlanCisDetails> = {
  '10gb': {
    id: '10gb',
    name: 'JM 10GB Auto',
    monthlyFee: 20.54,
    dataGb: 10,
    costPerGb: 2.05,
    network: '4G LTE',
  },
  '15gb': {
    id: '15gb',
    name: 'JM 15GB Auto',
    monthlyFee: 24.60,
    dataGb: 15,
    costPerGb: 1.64,
    network: '4G LTE',
  },
  '29gb': {
    id: '29gb',
    name: 'JM 29GB Auto',
    monthlyFee: 28.53,
    dataGb: 29,
    costPerGb: 0.98,
    network: '4G LTE',
  },
  '65gb': {
    id: '65gb',
    name: 'JM 65GB Auto',
    monthlyFee: 37.55,
    dataGb: 65,
    costPerGb: 0.58,
    network: '5G Ultra',
  },
  '100gb': {
    id: '100gb',
    name: 'JM 100GB Auto',
    monthlyFee: 46.40,
    dataGb: 100,
    costPerGb: 0.46,
    network: '5G Ultra',
  },
  '120gb': {
    id: '120gb',
    name: 'JM 120GB Auto',
    monthlyFee: 54.86,
    dataGb: 120,
    costPerGb: 0.46,
    network: '5G Ultra',
  },
  '150gb': {
    id: '150gb',
    name: 'JM 150GB Auto',
    monthlyFee: 59.89,
    dataGb: 150,
    costPerGb: 0.40,
    network: '5G Ultra',
  },
  '180gb': {
    id: '180gb',
    name: 'JM 180GB Auto',
    monthlyFee: 67.00,
    dataGb: 180,
    costPerGb: 0.37,
    network: '5G Ultra',
  },
};

export default function CisModal({ isOpen, onClose, defaultPlan = '65gb' }: CisModalProps) {
  const normalizedKey = defaultPlan.toLowerCase().replace(/[^0-9a-z]/g, '');
  const initialKey = PLAN_DATA[normalizedKey] ? normalizedKey : '65gb';
  const [selectedPlanKey, setSelectedPlanKey] = useState<string>(initialKey);

  if (!isOpen) return null;

  const plan = PLAN_DATA[selectedPlanKey] || PLAN_DATA['65gb'];

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.badge}>ACMA TELECOMMUNICATIONS CODE C628</span>
            <h2 className={styles.title}>Critical Information Summary (CIS)</h2>
            <p className={styles.subtitle}>
              Key terms, standard inclusions, pricing and conditions for JustMobile SIM-only plans.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Plan Switcher Tabs */}
        <div className={styles.tabRow} style={{ flexWrap: 'wrap', gap: '6px' }}>
          {Object.entries(PLAN_DATA).map(([key, p]) => (
            <button
              key={key}
              type="button"
              className={`${styles.tabBtn} ${selectedPlanKey === key ? styles.activeTab : ''}`}
              onClick={() => setSelectedPlanKey(key)}
            >
              {p.tier || `${p.dataGb}GB`} (${p.monthlyFee.toFixed(2)}/mth)
            </button>
          ))}
        </div>

        {/* CIS Content */}
        <div className={styles.content}>
          <div className={styles.planHeader}>
            <span className={styles.planName}>{plan.name}</span>
            <div className={styles.planPriceWrap}>
              <span className={styles.planPrice}>${plan.monthlyFee.toFixed(2)}</span>
              <span className={styles.planPeriod}>/ month (GST incl.)</span>
            </div>
          </div>

          <table className={styles.summaryTable}>
            <tbody>
              <tr>
                <th>Minimum Monthly Charge</th>
                <td>${plan.monthlyFee.toFixed(2)} / month</td>
              </tr>
              <tr>
                <th>Monthly Data Allowance</th>
                <td>
                  <strong>{plan.dataGb}GB</strong> of included standard Australian data ({plan.network})
                </td>
              </tr>
              <tr>
                <th>Cost of 1GB Data</th>
                <td>${plan.costPerGb.toFixed(2)} per GB</td>
              </tr>
              <tr>
                <th>Contract Term</th>
                <td>Month-to-month. No lock-in contract. Cancel anytime.</td>
              </tr>
              <tr>
                <th>Early Termination Fee</th>
                <td>$0 (None)</td>
              </tr>
              <tr>
                <th>Standard National Calls & SMS</th>
                <td>Unlimited standard calls and SMS to Australian mobiles and landlines.</td>
              </tr>
              <tr>
                <th>Standard National MMS</th>
                <td>Unlimited standard MMS within Australia.</td>
              </tr>
              <tr>
                <th>Network Coverage</th>
                <td>Telstra Wholesale 4G & 5G Mobile Network reaching 98.8% of Australians.</td>
              </tr>
              <tr>
                <th>Emergency Service Access</th>
                <td>Calls to Triple Zero (000) and 112 are always completely free of charge.</td>
              </tr>
              <tr>
                <th>Billing Cycle & Auto-Pay</th>
                <td>Monthly direct debit occurs automatically on the 28th of every calendar month.</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.finePrint}>
            <h4>Additional Information & Statutory Rights</h4>
            <p>
              This Critical Information Summary (CIS) covers the JustMobile SIM-only month-to-month plan.
              Data sessions terminate once your monthly allowance is exhausted to prevent bill shock.
              Top-up data packs are available inside your Customer Portal at /account.
              If you experience financial hardship, please review our Financial Hardship Policy at /hardship.
              Complaints may be submitted directly at /complaints or escalated to the Telecommunications Industry
              Ombudsman (TIO) at www.tio.com.au.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <span className={styles.cisRef}>ABN: 48 672 819 204 · CIS-JM-2026-v2</span>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}
