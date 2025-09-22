import type { Investor, Entrepreneur, Idea, SubscriptionPlan } from './types';

export const investors: Investor[] = [
  {
    id: '1',
    name: 'Aanya Sharma',
    avatarUrl: 'https://picsum.photos/seed/investor1/100/100',
    dataAiHint: 'woman portrait',
    sector: 'Tech',
    investmentRange: '5L-25L',
    expectedReturns: 'Medium',
    bio: 'Early-stage tech investor with a focus on SaaS and AI. Former product manager at a top tech company.',
  },
  {
    id: '2',
    name: 'Vikram Singh',
    avatarUrl: 'https://picsum.photos/seed/investor2/100/100',
    dataAiHint: 'man portrait',
    sector: 'Healthcare',
    investmentRange: '26L-1CR',
    expectedReturns: 'High',
    bio: 'Venture capitalist specializing in biotech and digital health. Looking for disruptive healthcare solutions.',
  },
  {
    id: '3',
    name: 'Neha Gupta',
    avatarUrl: 'https://picsum.photos/seed/investor3/100/100',
    dataAiHint: 'woman professional',
    sector: 'Consumer Goods',
    investmentRange: '70K-5L',
    expectedReturns: 'Less',
    bio: 'Angel investor passionate about sustainable consumer products and D2C brands.',
  },
  {
    id: '4',
    name: 'Rohan Mehta',
    avatarUrl: 'https://picsum.photos/seed/investor4/100/100',
    dataAiHint: 'man casual',
    sector: 'Fintech',
    investmentRange: '26L-1CR',
    expectedReturns: 'High',
    bio: 'Ex-banker now funding the next generation of financial technology. Interested in blockchain and payment platforms.',
  },
];

export const entrepreneurs: Entrepreneur[] = [
    {
        id: 'e1',
        name: 'Aditya Verma',
        avatarUrl: 'https://picsum.photos/seed/e1/100/100',
        dataAiHint: 'person smiling'
    },
    {
        id: 'e2',
        name: 'Isha Reddy',
        avatarUrl: 'https://picsum.photos/seed/e2/100/100',
        dataAiHint: 'woman professional'
    },
    {
        id: 'e3',
        name: 'Arjun Kumar',
        avatarUrl: 'https://picsum.photos/seed/e3/100/100',
        dataAiHint: 'man thinking'
    }
];

export const ideas: Idea[] = [
 {
    id: 'idea1',
    title: 'Eco-Friendly Packaging Solution',
    summary: 'A biodegradable and compostable packaging alternative to plastics, made from agricultural waste. Aims to reduce plastic pollution and provide a sustainable solution for businesses.',
    field: 'Sustainability',
    requiredInvestment: '5L-25L',
    estimatedGuaranteedReturns: 'Medium',
    prototypeImageUrl: 'https://picsum.photos/seed/prototype1/600/400',
    prototypeImageHint: 'eco packaging',
    entrepreneurId: 'e2',
  },
  {
    id: 'idea2',
    title: 'AI-Powered Health Monitoring App',
    summary: 'A mobile application that uses AI to monitor vital signs through the phone\'s camera, providing real-time health insights and alerts. Connects users with doctors for virtual consultations.',
    field: 'Healthcare',
    requiredInvestment: '26L-1CR',
    estimatedGuaranteedReturns: 'High',
    prototypeImageUrl: 'https://picsum.photos/seed/prototype2/600/400',
    prototypeImageHint: 'health app',
    entrepreneurId: 'e1',
  },
  {
    id: 'idea3',
    title: 'Smart Logistics Platform',
    summary: 'An integrated platform that optimizes supply chain management using IoT and machine learning. Features real-time tracking, predictive analytics for delivery times, and automated warehousing solutions.',
    field: 'Tech',
    requiredInvestment: '1CR+',
    estimatedGuaranteedReturns: 'High',
    prototypeImageUrl: 'https://picsum.photos/seed/prototype3/600/400',
    prototypeImageHint: 'logistics platform',
    entrepreneurId: 'e3',
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    title: 'Contact Access',
    description: 'Get contact information for entrepreneurs that catch your eye.',
    price: '₹4,000',
    pricePeriod: '/ contact',
    features: ['Access entrepreneur contact details', 'Direct messaging capabilities', 'Limited to 5 contacts per month'],
    cta: 'Get Started',
  },
  {
    title: 'Small Scale',
    description: 'For investors looking for promising small businesses with lower investment needs.',
    price: '₹8,000',
    pricePeriod: '/ idea',
    features: ['Investment range: 70K-5L', 'Less expected returns', 'Full idea details', 'Direct contact with entrepreneur'],
    cta: 'Choose Small Scale',
    isPopular: true,
  },
  {
    title: 'Medium Scale',
    description: 'Ideal for those looking to invest in growing businesses with medium return potential.',
    price: '₹20,000',
    pricePeriod: '/ idea',
    features: ['Investment range: 5L-25L', 'Medium expected returns', 'Full idea details & financial projections', 'Priority support'],
    cta: 'Choose Medium Scale',
  },
  {
    title: 'High Return',
    description: 'Exclusive access to high-growth ventures with significant return potential.',
    price: '₹50,000',
    pricePeriod: '/ idea',
    features: ['Investment range: 26L-1CR', 'High expected returns', 'Complete due diligence package', 'Dedicated account manager'],
    cta: 'Choose High Return',
  },
];
