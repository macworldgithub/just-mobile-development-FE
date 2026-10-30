export interface Handset {
  id: string;
  brand: 'Samsung' | 'Google';
  name: string;
  storage: string;
  colour: string;
  color: string; // alias
  colourHex: string;
  price: number; // in AUD dollars
  outrightPrice: number; // alias
  rrp: number;
  listedRrp: number; // alias
  label: string;
  tag: string; // alias
  image: string;
  heroCutout?: string;
  description: string;
  headline: string; // alias
  specs: string[];
  features: string[]; // alias
  note?: string;
}

export interface MobilePlan {
  id: string;
  name: string;
  tier: string;
  dataGb: number;
  pricePerMonth: number;
  description: string;
  fit: string;
  popular?: boolean;
  features: string[];
  dataBankingMaxGb: number;
  roamingInternationalMinutes?: boolean;
}

export const HANDSETS: Handset[] = [
  {
    id: 'galaxy-s26-ultra',
    brand: 'Samsung',
    name: 'Galaxy S26 Ultra',
    storage: '512GB',
    colour: 'Black',
    color: 'Black',
    colourHex: '#292a2c',
    price: 2399,
    outrightPrice: 2399,
    rrp: 2499,
    listedRrp: 2499,
    label: 'The flagship',
    tag: 'The flagship',
    image: '/brand/images/galaxy-s26-ultra-512gb-black.jpg',
    heroCutout: '/brand/images/galaxy-s26-ultra-hero-cutout.png',
    description: 'A big screen. A brilliant camera. Your next big idea.',
    headline: 'A big screen. A brilliant camera. Your next big idea.',
    specs: ['6.9-inch display', '200MP main camera', '5G + eSIM'],
    features: ['6.9-inch display', '200MP main camera', '5G + eSIM'],
  },
  {
    id: 'galaxy-s26',
    brand: 'Samsung',
    name: 'Galaxy S26',
    storage: '256GB',
    colour: 'Black',
    color: 'Black',
    colourHex: '#292a2c',
    price: 1499,
    outrightPrice: 1499,
    rrp: 1549,
    listedRrp: 1549,
    label: 'Everyday premium',
    tag: 'Everyday premium',
    image: '/brand/images/galaxy-s26-256gb-black.jpg',
    description: 'All the good stuff, in a beautifully pocket-sized phone.',
    headline: 'All the good stuff, in a beautifully pocket-sized phone.',
    specs: ['6.3-inch display', '50MP main camera', '5G + eSIM'],
    features: ['6.3-inch display', '50MP main camera', '5G + eSIM'],
  },
  {
    id: 'pixel-11-pro',
    brand: 'Google',
    name: 'Pixel 11 Pro',
    storage: '256GB',
    colour: 'Obsidian',
    color: 'Obsidian',
    colourHex: '#363737',
    price: 1799,
    outrightPrice: 1799,
    rrp: 1849,
    listedRrp: 1849,
    label: 'Google, upgraded',
    tag: 'Google, upgraded',
    image: '/brand/images/pixel-11-pro-256gb-obsidian.jpg',
    description: 'A thoughtful Android experience, with a pro-level camera.',
    headline: 'A thoughtful Android experience, with a pro-level camera.',
    specs: ['6.3-inch OLED', '50MP main camera', '5G + eSIM'],
    features: ['6.3-inch OLED', '50MP main camera', '5G + eSIM'],
  },
  {
    id: 'galaxy-a56',
    brand: 'Samsung',
    name: 'Galaxy A56',
    storage: '128GB',
    colour: 'Awesome Graphite',
    color: 'Awesome Graphite',
    colourHex: '#656869',
    price: 679,
    outrightPrice: 679,
    rrp: 699,
    listedRrp: 699,
    label: 'Everyday value',
    tag: 'Everyday value',
    image: '/brand/images/galaxy-a56-128gb-enterprise-graphite.jpg',
    description: 'A generous screen and the essentials, without the big spend.',
    headline: 'A generous screen and the essentials, without the big spend.',
    specs: ['6.7-inch AMOLED', '50MP main camera', '5G + eSIM'],
    features: ['6.7-inch AMOLED', '50MP main camera', '5G + eSIM'],
    note: 'Enterprise Edition',
  },
];

export const MOBILE_PLANS: MobilePlan[] = [
  {
    id: 'little',
    name: 'Just enough',
    tier: '20GB',
    dataGb: 20,
    pricePerMonth: 19,
    description: 'For the everyday essentials.',
    fit: 'Mostly on Wi-Fi',
    popular: false,
    features: [
      '20GB high-speed 4G & 5G data',
      'Unlimited standard calls & SMS within Australia',
      'Keep your current number or pick a new one',
      'eSIM instant digital activation',
      'Data banking up to 200GB',
      'No lock-in contract · cancel anytime',
    ],
    dataBankingMaxGb: 200,
    roamingInternationalMinutes: false,
  },
  {
    id: 'everyday',
    name: 'Just right',
    tier: '50GB',
    dataGb: 50,
    pricePerMonth: 25,
    popular: true,
    description: 'A little more room for life.',
    fit: 'A bit of everything',
    features: [
      '50GB superfast 5G data (capped up to 250Mbps)',
      'Unlimited standard calls & SMS within Australia',
      'Unlimited standard MMS within Australia',
      'Data banking up to 500GB',
      'Instant eSIM QR code delivery',
      'Telstra Wholesale 4G & 5G network coverage',
      'No lock-in contract',
    ],
    dataBankingMaxGb: 500,
    roamingInternationalMinutes: false,
  },
  {
    id: 'more',
    name: 'Just more',
    tier: '100GB',
    dataGb: 100,
    pricePerMonth: 35,
    popular: false,
    description: 'For life in full stream.',
    fit: 'Streaming on the go',
    features: [
      '100GB uncapped 5G maximum speed data',
      'Unlimited standard calls & SMS within Australia',
      'Unlimited standard international calls to 35 countries',
      'Data banking up to 1,000GB',
      'Priority Australian customer support queue',
      'eSIM or physical SIM card delivered free',
      'No lock-in contract',
    ],
    dataBankingMaxGb: 1000,
    roamingInternationalMinutes: true,
  },
];

export interface PaymentCalculation {
  handsetPrice: number;
  upfrontPercentage: number;
  upfrontAmount: number;
  deposit: number; // alias
  financedAmount: number;
  termMonths: number;
  monthlyPhoneRepayment: number;
  deviceMonthly: number; // alias
  finalPhoneRepayment: number;
  finalDevicePayment: number; // alias
  planMonthlyPrice: number;
  totalMonthly: number;
  monthly: number; // alias
  totalAggregateCost: number;
  termTotal: number; // alias
}

export function calculateRepayments(
  handsetPrice: number,
  termMonths: number = 36,
  upfrontPct: number = 0,
  planPrice: number = 0
): PaymentCalculation {
  const priceInCents = Math.round(handsetPrice * 100);
  const upfrontCents = Math.round((priceInCents * upfrontPct) / 100);
  const remainingCents = priceInCents - upfrontCents;
  const baseMonthlyCents = termMonths > 0 ? Math.floor(remainingCents / termMonths) : 0;
  const finalPaymentCents =
    termMonths > 0 ? remainingCents - baseMonthlyCents * (termMonths - 1) : 0;
  const planCents = Math.round(planPrice * 100);

  const deposit = upfrontCents / 100;
  const deviceMonthly = baseMonthlyCents / 100;
  const finalDevicePayment = finalPaymentCents / 100;
  const monthly = (baseMonthlyCents + planCents) / 100;
  const termTotal =
    termMonths > 0
      ? (priceInCents + planCents * termMonths) / 100
      : (priceInCents + planCents) / 100;

  return {
    handsetPrice,
    upfrontPercentage: upfrontPct,
    upfrontAmount: deposit,
    deposit,
    financedAmount: (priceInCents - upfrontCents) / 100,
    termMonths,
    monthlyPhoneRepayment: deviceMonthly,
    deviceMonthly,
    finalPhoneRepayment: finalDevicePayment,
    finalDevicePayment,
    planMonthlyPrice: planPrice,
    totalMonthly: monthly,
    monthly,
    totalAggregateCost: termTotal,
    termTotal,
  };
}

export const formatCurrency = (val: number, decimals: number = 0) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
