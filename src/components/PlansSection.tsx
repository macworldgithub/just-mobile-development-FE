'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import styles from './PlansSection.module.css';
import { MOBILE_PLANS, MobilePlan } from '@/data/catalogue';

interface PlansSectionProps {
  onSelectPlan: (plan: MobilePlan) => void;
  onExplorePhones: () => void;
  initialPlans?: MobilePlan[];
}

export default function PlansSection({ onSelectPlan, onExplorePhones, initialPlans }: PlansSectionProps) {
  const [plans, setPlans] = useState<MobilePlan[]>(initialPlans || MOBILE_PLANS);

  // Fetch plans from MongoDB API
  useEffect(() => {
    fetch('/api/plans')
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setPlans(data.data);
        }
      })
      .catch((err) => console.error('Failed to load plans from DB:', err));
  }, []);
  return (
    <section id="plans" className={styles.plansSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>YOUR LIFE. YOUR PLAN.</span>
            <h2 className={styles.title}>
              Big on the good stuff.
              <br />
              Small on the bill.
            </h2>
            <p className={styles.subtitle}>
              Three straightforward choices. No maze of add-ons.
              <br />
              Just pick the data that feels like you.
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.proposedBadge}>
              <span className={styles.infoIcon}>ⓘ</span>
              <span>Proposed monthly plans</span>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className={styles.plansGrid}>
          {plans.map((plan) => {
            const isPopular = plan.popular;
            return (
              <article
                key={plan.id}
                className={`${styles.planCard} ${isPopular ? styles.popular : ''}`}
              >
                {/* Plan Card Top Bar */}
                <div className={styles.planCardTop}>
                  <span className={styles.planName}>{plan.name}</span>
                  {isPopular ? (
                    <span className={styles.planLabel}>
                      Our sweet spot ↗
                    </span>
                  ) : (
                    <span className={styles.simOnlyBadge}>SIM-only</span>
                  )}
                </div>

                {/* Plan Card Content */}
                <div className={styles.planCardContent}>
                  {/* Data headline */}
                  <div className={styles.planData}>
                    {plan.dataGb}
                    <span>GB</span>
                  </div>

                  <p className={styles.planDescription}>{plan.description}</p>

                  {/* Monthly price */}
                  <div className={styles.planCost}>
                    ${plan.pricePerMonth}
                    <span>/month</span>
                  </div>

                  {/* Divider */}
                  <div className={styles.planDivider}></div>

                  {/* Feature list */}
                  <ul className={styles.featureList}>
                    <li>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Unlimited standard AU calls & texts</span>
                    </li>
                    <li>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Telstra Wholesale Network</span>
                    </li>
                    <li>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>eSIM on compatible devices</span>
                    </li>
                    <li>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Proposed month-to-month service</span>
                    </li>
                  </ul>

                  {/* Choose CTA button */}
                  <button
                    type="button"
                    className={`${styles.planButton} ${isPopular ? styles.popularButton : styles.outlineButton}`}
                    onClick={() => onSelectPlan(plan)}
                  >
                    <span>Choose {plan.name.toLowerCase()}</span>
                    <span className={styles.btnArrow}>→</span>
                  </button>

                  <span className={styles.planSubnote}>Indicative. No payment taken.</span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Plans Bottom Link Row */}
        <div className={styles.plansBottom}>
          <p className={styles.bringPhone}>Already have a phone? Perfect. Bring it with you.</p>
          <a
            href="#phones"
            className={styles.freshPhoneLink}
            onClick={(e) => {
              e.preventDefault();
              onExplorePhones();
            }}
          >
            <span>Or find a fresh one</span>
            <span className={styles.diagonalArrow}>↗</span>
          </a>
        </div>

        {/* Section Fineprint */}
        <p className={styles.sectionFineprint}>
          All prices in AUD including GST. These are proposed plans, not approved live offers. Data inclusions,
          speed caps, 5G eligibility, recharge rules and Critical Information Summaries must be confirmed before launch.
          International calls and roaming are not included in this illustration.
        </p>
      </div>
    </section>
  );
}
