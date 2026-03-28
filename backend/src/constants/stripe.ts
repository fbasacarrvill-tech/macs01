// Stripe price IDs for different subscription tiers
// These should be created in your Stripe dashboard
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  ELITE_MONTHLY: process.env.STRIPE_PRICE_ELITE_MONTHLY || 'price_elite_monthly',
  ELITE_YEARLY: process.env.STRIPE_PRICE_ELITE_YEARLY || 'price_elite_yearly',
}

export const TIER_FEATURES = {
  free: {
    maxTrades: 5,
    analytics: false,
    reports: false,
    api: false,
  },
  pro: {
    maxTrades: 999999,
    analytics: true,
    reports: true,
    api: false,
  },
  elite: {
    maxTrades: 999999,
    analytics: true,
    reports: true,
    api: true,
  },
}
