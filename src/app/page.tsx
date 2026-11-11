'use strict';
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import PlansSection from '@/components/PlansSection';
import PhonesSection from '@/components/PhonesSection';
import WhyJustSection from '@/components/WhyJustSection';
import SwitchingSection from '@/components/SwitchingSection';
import NetworkSection from '@/components/NetworkSection';
import BeleSection from '@/components/BeleSection';
import FaqSection from '@/components/FaqSection';
import ConfiguratorModal from '@/components/ConfiguratorModal';
import OrderFlowModal, { OrderConfiguration } from '@/components/OrderFlowModal';
import AccountDrawer from '@/components/AccountDrawer';
import LaunchSection from '@/components/LaunchSection';
import Footer from '@/components/Footer';
import BeleChatWidget from '@/components/BeleChatWidget';
import { HANDSETS, Handset, MOBILE_PLANS, MobilePlan, calculateRepayments } from '@/data/catalogue';

export default function Home() {
  const router = useRouter();
  // Modal states
  const [configuratorOpen, setConfiguratorOpen] = useState(false);
  const [activeHandset, setActiveHandset] = useState<Handset>(HANDSETS[0]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderConfig, setOrderConfig] = useState<OrderConfiguration | null>(null);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  // Smooth scroll handler
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handset configuration trigger
  const handleOpenConfigurator = (handset: Handset, initialMode?: 'outright' | 'instalments' | 'phone_and_plan') => {
    const normalized: Handset = {
      ...handset,
      color: handset.color || handset.colour || 'Black',
      colour: handset.colour || handset.color || 'Black',
      outrightPrice: handset.outrightPrice ?? handset.price ?? 0,
      price: handset.price ?? handset.outrightPrice ?? 0,
      listedRrp: handset.listedRrp ?? handset.rrp ?? 0,
      rrp: handset.rrp ?? handset.listedRrp ?? 0,
      headline: handset.headline || handset.description || '',
      description: handset.description || handset.headline || '',
      features: Array.isArray(handset.features) && handset.features.length > 0 ? handset.features : handset.specs || [],
      specs: Array.isArray(handset.specs) && handset.specs.length > 0 ? handset.specs : handset.features || [],
      tag: handset.tag || handset.label || '',
      label: handset.label || handset.tag || '',
    };
    setActiveHandset(normalized);
    setConfiguratorOpen(true);
  };

  // Plan selection trigger (opens checkout with this plan)
  const handleSelectPlan = (plan: MobilePlan) => {
    setOrderConfig({
      plan,
      paymentMode: 'phone_and_plan',
      repayments: calculateRepayments(0, 0, 0, plan.pricePerMonth),
    });
    setOrderModalOpen(true);
  };

  // Proceeding from configurator into signup directly without intermediate fake order modal
  const handleProceedToOrder = (config: {
    handset: Handset;
    paymentMode: 'outright' | 'instalments' | 'phone_and_plan';
    termMonths: number;
    upfrontPct: number;
    plan?: MobilePlan;
    repayments: any;
  }) => {
    setConfiguratorOpen(false);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('justmobile_selected_order', JSON.stringify({
          handsetName: config.handset.name,
          handsetPrice: config.handset.outrightPrice || config.handset.price,
          planName: config.plan?.name || null,
          planTier: config.plan?.tier || null,
          pricePerMonth: config.plan?.pricePerMonth || 0,
          paymentMode: config.paymentMode,
          termMonths: config.termMonths,
          upfrontPct: config.upfrontPct,
          monthlyTotal: config.repayments?.totalMonthly || 0,
        }));
      } catch {
        // Storage fallback
      }
    }
    const q = new URLSearchParams();
    if (config.plan?.name) q.set('plan', config.plan.name);
    if (config.handset?.name) q.set('device', config.handset.name);
    router.push(`/signup?${q.toString()}`);
  };

  // Quick eSIM QR trigger from Account Drawer
  const handleShowActivationQr = () => {
    setOrderConfig({
      handset: HANDSETS[0],
      plan: MOBILE_PLANS[1],
      paymentMode: 'phone_and_plan',
      repayments: calculateRepayments(2399, 24, 25, 25),
    });
    setOrderModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <Header
        onOpenAccount={() => setAccountDrawerOpen(true)}
        onNavigateSection={handleScrollTo}
      />

      {/* Main Content Sections */}
      <main style={{ flex: 1 }}>
        {/* 1. Hero Section matching redesign-desktop-home.png & mobile */}
        <Hero
          onFindPlan={() => handleScrollTo('plans')}
          onShopPhones={() => handleScrollTo('phones')}
          onConfigureFlagship={() => handleOpenConfigurator(HANDSETS[0])}
        />

        {/* 2. Trust Pillars Bar */}
        <TrustBar />

        {/* 3. Mobile Plans Section ($19, $25, $35 + Data Banking + Number Switching) */}
        <PlansSection
          onSelectPlan={handleSelectPlan}
          onExplorePhones={() => handleScrollTo('phones')}
        />

        {/* 4. Handsets Catalogue with Tilting Animation, Two-Tone Card, and Show Price Toggle */}
        <PhonesSection
          onConfigurePhone={handleOpenConfigurator}
        />

        {/* 5. Why JustMobile (Clear by design, Made to fit, A little smarter) */}
        <WhyJustSection />

        {/* 6. Switching (New mobile. Same you. 3-step switch process) */}
        <SwitchingSection />

        {/* 7. Network & Coverage (Telstra Wholesale 98.8% Coverage + Postcode Checker) */}
        <NetworkSection />

        {/* 8. Bele Operational AI Assistance */}
        <BeleSection />

        {/* 9. FAQ Section (Good questions. Straight answers.) */}
        <FaqSection />

        {/* 10. Launch CTA Banner (Good things are just getting started.) */}
        <LaunchSection onFindPlan={() => handleScrollTo('plans')} />
      </main>

      {/* 11. Redesigned Dark Footer matching Image 1 */}
      <Footer onNavigateSection={handleScrollTo} />

      {/* Purchase Configurator Modal (1:1 copy of redesign-purchase-configurator.png) */}
      <ConfiguratorModal
        isOpen={configuratorOpen}
        onClose={() => setConfiguratorOpen(false)}
        handset={activeHandset}
        onProceedToOrder={handleProceedToOrder}
      />

      {/* Resumable Checkout & eSIM Activation Order Lifecycle Modal */}
      <OrderFlowModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        config={orderConfig}
        onExplorePhones={() => handleScrollTo('phones')}
      />

      {/* Slide-out Account & Service Drawer */}
      <AccountDrawer
        isOpen={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
        onOpenActivationQr={handleShowActivationQr}
      />

      {/* Floating Bele AI Chatbot Widget */}
      <BeleChatWidget
        isOpen={chatWidgetOpen}
        onToggle={() => setChatWidgetOpen(!chatWidgetOpen)}
      />
    </div>
  );
}
