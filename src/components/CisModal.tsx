'use strict';
'use client';

import React, { useState } from 'react';
import styles from './CisModal.module.css';

interface CisModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: '20gb' | '50gb' | '100gb';
}

interface PlanCisDetails {
  id: '20gb' | '50gb' | '100gb';
  name: string;
  monthlyFee: number;
  dataGb: number;
  costPerGb: number;
}

const PLAN_DATA: Record<string, PlanCisDetails> = {
  '20gb': {
    id: '20gb',
    name: '20GB Just enough Plan',
    monthlyFee: 19,
    dataGb: 20,
    costPerGb: 0.95,
  },
  '50gb': {
    id: '50gb',
    name: '50GB Just right Plan',
    monthlyFee: 25,
    dataGb: 50,
    costPerGb: 0.50,
  },
  '100gb': {
    id: '100gb',
    name: '100GB Just heaps Plan',
    monthlyFee: 35,
    dataGb: 100,
    costPerGb: 0.35,
  },
};

export default function CisModal({ isOpen, onClose, defaultPlan = '50gb' }: CisModalProps) {
  const [selectedPlanKey, setSelectedPlanKey] = useState<'20gb' | '50gb' | '100gb'>(defaultPlan);

  if (!isOpen) return null;

  const plan = PLAN_DATA[selectedPlanKey];

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
        <div className={styles.tabRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${selectedPlanKey === '20gb' ? styles.activeTab : ''}`}
            onClick={() => setSelectedPlanKey('20gb')}
          >
            20GB ($19/mth)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${selectedPlanKey === '50gb' ? styles.activeTab : ''}`}
            onClick={() => setSelectedPlanKey('50gb')}
          >
            50GB ($25/mth)
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${selectedPlanKey === '100gb' ? styles.activeTab : ''}`}
            onClick={() => setSelectedPlanKey('100gb')}
          >
            100GB ($35/mth)
          </button>
        </div>

        {/* Scrollable Body */}
        <div className={styles.contentBody}>
          {/* Section 1: Information About The Service */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>📋 1. Information About The Service</span>
            </div>
            <p>
              <strong>Service Description:</strong> JustMobile SIM-only mobile phone service provides access to the 4G and 5G Telstra Wholesale Mobile Network across Australia. Compatible 5G devices can access 5G download speeds.
            </p>
            <p>
              <strong>Minimum Term:</strong> Month-to-month. There is no lock-in contract. You may cancel at any time with zero early termination fee.
            </p>

            <div className={styles.cisGrid}>
              <div className={styles.cisCell}>
                <div className={styles.cellLabel}>Selected Plan</div>
                <div className={styles.cellValue}>{plan.name}</div>
              </div>
              <div className={styles.cisCell}>
                <div className={styles.cellLabel}>Minimum Monthly Charge</div>
                <div className={styles.cellValue}>${plan.monthlyFee}.00 / month</div>
              </div>
              <div className={styles.cisCell}>
                <div className={styles.cellLabel}>Included Monthly Data</div>
                <div className={styles.cellValue}>{plan.dataGb} GB (at 5G speeds)</div>
              </div>
              <div className={styles.cisCell}>
                <div className={styles.cellLabel}>Excess Data Policy</div>
                <div className={styles.cellValue}>Data stops at cap (Zero bill shock)</div>
              </div>
            </div>
          </div>

          {/* Section 2: Inclusions & Exclusions */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>📞 2. Calls, SMS and MMS Inclusions</span>
            </div>
            <p>
              <strong>Included In Plan:</strong> Unlimited standard national calls, SMS, and MMS to Australian fixed landlines and standard mobile numbers (including 13, 1300, and 1800 numbers), plus voicemail retrieval.
            </p>
            <p>
              <strong>Excluded:</strong> Premium rate numbers (1900 numbers), international calls/SMS (unless purchased via add-on), international roaming, satellite numbers, and operator-assisted directory services (1223).
            </p>
          </div>

          {/* Section 3: Data Usage & Policy */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>💾 3. Data Usage & Allowance Policy</span>
            </div>
            <p>
              • <strong>Cost of 1MB / 1GB in allowance:</strong> ${plan.costPerGb.toFixed(2)} per GB included in monthly charge.
              <br />• <strong>Monthly Allowance:</strong> Full data quota is refreshed on the 28th of each monthly billing cycle on the Telstra Wholesale 5G & 4G network.
              <br />• <strong>Excess Data:</strong> No surprise overage bills. Data stops automatically when your monthly allowance is depleted, with optional top-up packs available in your Customer Portal.
            </p>
          </div>

          {/* Section 4: Network Coverage & Emergency Calling */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>🌐 4. Coverage & Emergency 000 Access</span>
            </div>
            <p>
              • <strong>Network Coverage:</strong> Uses parts of the Telstra Mobile Network covering more than 98.8% of the Australian population.
              <br />• <strong>Emergency 000:</strong> Calls to Triple Zero (000) and 112 are always free and accessible even if your plan has zero balance or is temporarily suspended.
              <br />• <strong>Integrated Public Number Database (IPND):</strong> Your contact and address details are registered in IPND to support emergency response and 000 location services as required by Australian law.
            </p>
          </div>

          {/* Section 5: Dispute Resolution & TIO */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>⚖️ 5. Complaints Handling & Ombudsman Escalation</span>
            </div>
            <p>
              If you have any feedback or a complaint, our Australian support team can be reached via your Customer Portal or by emailing <strong>support@justmobile.com.au</strong>. If you are not satisfied with the resolution, you may escalate your dispute to the <strong>Telecommunications Industry Ombudsman (TIO)</strong> by calling <strong>1800 062 058</strong> or visiting <strong>www.tio.com.au</strong>.
            </p>
          </div>
        </div>

        {/* Footer Bar */}
        <div className={styles.footerBar}>
          <div className={styles.complianceText}>
            ACMA Telecommunications Consumer Protections Code (TCP C628). Critical Information Summary published for JustMobile Australia.
          </div>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Close CIS
          </button>
        </div>
      </div>
    </div>
  );
}

