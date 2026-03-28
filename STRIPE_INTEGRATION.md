# Stripe Payment Integration Guide

## Overview
This document covers the complete Stripe integration for managing SaaS subscriptions in the Trading System application.

## Setup Instructions

### 1. Create Stripe Account & Products
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a new product "Trading System Pro"
   - Price: $9.99/month (monthly) or $99.99/year (yearly)
   - Billing: Recurring
3. Create another product "Trading System Elite"
   - Price: $29.99/month (monthly) or $299.99/year (yearly)
   - Billing: Recurring

### 2. Get API Keys
1. Go to Developers → API Keys
2. Copy your:
   - Secret Key (sk_test_...)
   - Publishable Key (pk_test_...)
3. Go to Developers → Webhooks
4. Create webhook endpoint pointing to: `https://your-domain/api/webhooks/stripe`
5. Subscribe to events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
6. Copy webhook secret (whsec_...)

### 3. Environment Variables
Add to your `.env` or `.env.local`:

```bash
# Backend
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_ELITE_MONTHLY=price_...
STRIPE_PRICE_ELITE_YEARLY=price_...

# Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ELITE_MONTHLY=price_...
```

## Backend Implementation

### Services
**File**: `backend/src/services/stripe.service.ts`

Provides methods for:
- `createCustomer()` - Register customer with Stripe
- `createSubscription()` - Create subscription for customer
- `cancelSubscription()` - Cancel active subscription
- `createCheckoutSession()` - Generate Stripe Checkout URL
- `handleCheckoutSessionCompleted()` - Process successful checkout
- `handleSubscriptionUpdated()` - Handle subscription changes
- `handleSubscriptionDeleted()` - Handle cancellations
- `createPortalSession()` - Open Stripe billing portal

### Controllers
**File**: `backend/src/controllers/subscription.controller.ts`

API endpoints:
- `GET /subscriptions` - Get current subscription
- `POST /subscriptions/checkout` - Create checkout session
- `GET /subscriptions/checkout/:sessionId` - Verify checkout
- `POST /subscriptions/portal` - Open billing portal
- `POST /subscriptions/cancel` - Cancel subscription

### Webhooks
**File**: `backend/src/controllers/webhook.controller.ts`

Handles Stripe webhook events:
- Updates database on checkout completion
- Updates subscription status on changes
- Records cancellations
- Automatically syncs user subscription tier

## Frontend Implementation

### Settings Page
**File**: `frontend/app/(app)/settings/page.tsx`

Features:
- Display current subscription status and renewal date
- Show all available plans with features
- Upgrade/downgrade between tiers
- Cancel subscription with confirmation
- Manage subscription via Stripe portal

### Subscription Success Page
**File**: `frontend/app/(app)/subscription/success/page.tsx`

Displays after successful payment:
- Confirms subscription activation
- Shows success message
- Auto-redirects to settings

### API Integration
**File**: `frontend/services/api.ts`

Added subscription endpoints:
```typescript
subscriptionsApi: {
  get: () => api.get('/subscriptions'),
  createCheckout: (tier, priceId) => api.post('/subscriptions/checkout', { tier, priceId }),
  getCheckout: (sessionId) => api.get(`/subscriptions/checkout/${sessionId}`),
  createPortal: () => api.post('/subscriptions/portal'),
  cancel: () => api.post('/subscriptions/cancel'),
}
```

## Database Schema

Added tables:
- `user_subscriptions` - Tracks active subscriptions
  - userId (PK)
  - tier (free | pro | elite)
  - status (active | inactive | cancelled)
  - stripeCustomerId
  - stripeSubscriptionId
  - currentPeriodStart
  - currentPeriodEnd

## Testing Checklist

- [ ] Create test Stripe account
- [ ] Set up webhook endpoint
- [ ] Test checkout flow (Pro tier)
- [ ] Test checkout flow (Elite tier)
- [ ] Verify webhook updates database
- [ ] Test subscription portal access
- [ ] Test subscription cancellation
- [ ] Verify renewal date displays correctly
- [ ] Test failed payment handling
- [ ] Test plan upgrade/downgrade

## Stripe Webhook Testing Locally

Use Stripe CLI to forward webhooks:
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test event
stripe trigger customer.subscription.created
```

## Subscription Tiers

### Free
- Max 5 trades/month
- Basic dashboard
- No analytics
- No reports
- No API access

### Pro ($9.99/month or $99.99/year)
- Unlimited trades
- Advanced analytics
- PDF/CSV exports
- No API access
- Email support

### Elite ($29.99/month or $299.99/year)
- Unlimited trades
- Advanced analytics
- PDF/CSV exports
- REST API access
- Priority support
- Custom integrations

## Security Considerations

1. **Webhook Verification**: All webhooks verified with Stripe signature
2. **PCI Compliance**: Card data never touches our servers (handled by Stripe)
3. **Environment Variables**: All keys stored securely, never committed
4. **HTTPS Required**: Webhook endpoint must use HTTPS in production
5. **User Authorization**: All subscription endpoints require authentication
6. **Rate Limiting**: Implement rate limiting on checkout endpoints

## Production Deployment

1. Switch to live Stripe keys
2. Update webhook endpoint to production URL
3. Test with small transactions first
4. Monitor webhook deliveries in Stripe dashboard
5. Set up email notifications for failed payments
6. Configure tax rates if applicable
7. Update privacy policy and terms of service

## Troubleshooting

### Webhook Not Received
- Check endpoint is publicly accessible
- Verify webhook secret in dashboard matches env var
- Check server logs for errors
- Use Stripe CLI to test locally

### Checkout Not Completing
- Verify priceId exists in Stripe
- Check FRONTEND_URL env var is correct
- Ensure Stripe.js loaded properly
- Check browser console for errors

### Subscription Not Showing
- Verify webhook is being called
- Check database for user_subscriptions record
- Verify user ID matches
- Check Stripe dashboard for subscription record

## Next Steps

1. Implement payment retry logic
2. Add subscription usage tracking
3. Implement seat-based billing
4. Add team management for shared subscriptions
5. Create subscription analytics dashboard
6. Implement free trial support
