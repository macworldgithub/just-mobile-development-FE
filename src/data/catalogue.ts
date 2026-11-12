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
  planNo?: number;
  name: string;
  tier: string;
  dataGb: number;
  pricePerMonth: number;
  description: string;
  fit: string;
  network?: string;
  popular?: boolean;
  features: string[];
  dataBankingMaxGb?: number;
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
    id: 'plan-10gb',
    planNo: 11144153,
    name: 'JM 10GB Auto',
    tier: '10GB',
    dataGb: 10,
    pricePerMonth: 20.54,
    description: 'For everyday essentials, messaging, and light browsing.',
    fit: 'Everyday Essentials',
    network: '4G',
    popular: false,
    features: [
      '10GB high-speed 4G monthly data',
      'Unlimited standard calls & SMS within Australia',
      'Instant eSIM QR code delivery or physical SIM',
      'Telstra Wholesale 4G Network coverage',
      'Zero bill shock · data stops when cap reached',
      'No lock-in contract · Cancel anytime',
    ],
    roamingInternationalMinutes: false,
  },
  {
    id: 'plan-15gb',
    planNo: 11144154,
    name: 'JM 15GB Auto',
    tier: '15GB',
    dataGb: 15,
    pricePerMonth: 24.6,
    description: 'Great everyday data for light browsing and socials.',
    fit: 'Casual Browsing',
    network: '4G',
    popular: false,
    features: [
      '15GB high-speed 4G monthly data',
      'Unlimited standard calls & SMS within Australia',
      'Instant eSIM QR code delivery or physical SIM',
      'Telstra Wholesale 4G Network coverage',
      'Zero bill shock · data stops when cap reached',
      'No lock-in contract · Cancel anytime',
    ],
    roamingInternationalMinutes: false,
  },
  {
    id: 'plan-29gb',
    planNo: 11144155,
    name: 'JM 29GB Auto',
    tier: '29GB',
    dataGb: 29,
    pricePerMonth: 28.53,
    description: 'Balanced data for streaming music, maps, and social apps.',
    fit: 'Daily Commute & Music',
    network: '4G',
    popular: false,
    features: [
      '29GB high-speed 4G monthly data',
      'Unlimited standard calls & SMS within Australia',
      'Instant eSIM QR code delivery or physical SIM',
      'Telstra Wholesale 4G Network coverage',
      'Zero bill shock · data stops when cap reached',
      'No lock-in contract · Cancel anytime',
    ],
    roamingInternationalMinutes: false,
  },
  {
    id: 'plan-65gb',
    planNo: 11144157,
    name: 'JM 65GB Auto',
    tier: '65GB',
    dataGb: 65,
    pricePerMonth: 37.55,
    description: 'Our sweet spot 5G plan with generous high-speed data.',
    fit: 'Streaming & Video',
    network: '5G',
    popular: true,
    features: [
      '65GB superfast 5G monthly data',
      'Unlimited standard calls & SMS within Australia',
      'Unlimited standard calls to 15 international countries',
      'Instant eSIM QR code delivery or physical SIM',
      'Telstra Wholesale 5G Network coverage',
      'Zero bill shock · data stops when cap reached',
      'No lock-in contract · Cancel anytime',
    ],
    roamingInternationalMinutes: true,
  },
  {
    id: 'plan-100gb',
    planNo: 11144168,
    name: 'JM 100GB Auto',
    tier: '100GB',
    dataGb: 100,
    pricePerMonth: 46.4,
    description: 'For life in full stream, hot-spotting, and high-definition video.',
    fit: 'Power Users & Hotspot',
    network: '5G',
    popular: false,
    features: [
      '100GB uncapped 5G maximum speed monthly data',
      'Unlimited standard calls & SMS within Australia',
      'Unlimited standard calls to 15 international countries',
      'Instant eSIM QR code delivery or physical SIM',
      'Telstra Wholesale 5G Network coverage',
      'Zero bill shock · data stops when cap reached',
      'No lock-in contract · Cancel anytime',
    ],
    roamingInternationalMinutes: true,
  },
  {
    id: 'plan-120gb',
    planNo: 11144169,
    name: 'JM 120GB Auto',
    tier: '120GB',
    dataGb: 120,
    pricePerMonth: 54.86,
    description: 'High allowance 5G data for hot-spotting, work, and travel.',
    fit: 'Work from Anywhere',
    network: '5G',
    popular: false,
    features: [
      '120GB uncapped 5G maximum speed monthly data',
      'Unlimited standard calls & SMS within Australia',
      'Unlimited standard calls to 15 international countries',
      'Instant eSIM QR code delivery or physical SIM',
      'Telstra Wholesale 5G Network coverage',
      'Zero bill shock · data stops when cap reached',
      'No lock-in contract · Cancel anytime',
    ],
    roamingInternationalMinutes: true,
  },
  {
    id: 'plan-150gb',
    planNo: 11144170,
    name: 'JM 150GB Auto',
    tier: '150GB',
    dataGb: 150,
    pricePerMonth: 59.89,
    description: 'Pro data package for heavy downloads, gaming, and remote work.',
    fit: 'Heavy Media & Creators',
    network: '5G',
    popular: false,
    features: [
      '150GB uncapped 5G maximum speed monthly data',
      'Unlimited standard calls & SMS within Australia',
      'Unlimited standard calls to 15 international countries',
      'Instant eSIM QR code delivery or physical SIM',
      'Telstra Wholesale 5G Network coverage',
      'Zero bill shock · data stops when cap reached',
      'No lock-in contract · Cancel anytime',
    ],
    roamingInternationalMinutes: true,
  },
  {
    id: 'plan-180gb',
    planNo: 11144171,
    name: 'JM 180GB Auto',
    tier: '180GB',
    dataGb: 180,
    pricePerMonth: 67,
    description: 'Maximum power 5G data with total freedom to stream and share.',
    fit: 'Ultimate Freedom',
    network: '5G',
    popular: false,
    features: [
      '180GB uncapped 5G maximum speed monthly data',
      'Unlimited standard calls & SMS within Australia',
      'Unlimited standard calls to 15 international countries',
      'Priority Australian support queue',
      'Instant eSIM QR code delivery or physical SIM',
      'Telstra Wholesale 5G Network coverage',
      'No lock-in contract · Cancel anytime',
    ],
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
