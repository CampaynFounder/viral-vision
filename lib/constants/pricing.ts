// Pricing Configuration

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  type: "one-time" | "subscription";
  credits: number | "unlimited";
  features: string[];
  cta: string;
  popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "viral-starter",
    name: "Viral Starter",
    price: 27,
    priceDisplay: "$27",
    type: "one-time",
    credits: 50,
    features: [
      "50 faceless prompt credits (no expiry)",
      "Access to 'The Vault' (10 pre-made viral aesthetics)",
      "Commercial rights included",
    ],
    cta: "Get the 50-Prompt Vault",
  },
  {
    id: "ceo-access",
    name: "CEO Access",
    price: 47,
    priceDisplay: "$47/month",
    type: "subscription",
    credits: "unlimited",
    features: [
      "Unlimited generation",
      "Trend Watch: Weekly injected aesthetics",
      "Commercial License: Resell prompts as PDF packs",
      "Priority support",
    ],
    cta: "Unlock CEO Access",
    popular: true,
  },
  {
    id: "empire-bundle",
    name: "Empire Bundle",
    price: 97,
    priceDisplay: "$97",
    type: "one-time",
    credits: 100,
    features: [
      "100 credits",
      "Prompt Pack Reseller Kit (Canva templates)",
      "Commercial License",
      "Lifetime access to The Vault",
    ],
    cta: "Unlock the Empire",
  },
];

