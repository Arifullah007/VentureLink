export type Investor = {
  id: string;
  name: string;
  avatarUrl: string;
  dataAiHint: string;
  sector: string;
  investmentRange: string;
  expectedReturns: string;
  bio: string;
};

export type Entrepreneur = {
  id:string;
  name: string;
  avatarUrl: string;
  dataAiHint: string;
};

export type Idea = {
  id: string;
  title: string;
  summary: string;
  field: string;
  requiredInvestment: string;
  estimatedGuaranteedReturns: string;
  prototypeImageUrl: string;
  prototypeImageHint: string;
  entrepreneurId: string;
};

export type SubscriptionPlan = {
  title: string;
  description: string;
  price: string;
  pricePeriod?: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
};
