# Local Stripe Testing Setup

Quick guide to set up and test Stripe integration locally.

## Prerequisites
- Stripe account (create at [stripe.com](https://stripe.com))
- Stripe CLI ([install](https://stripe.com/docs/stripe-cli))
- Node.js and npm installed

## Step 1: Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → API Keys
3. Copy your **Test** keys:
   - Secret Key: `sk_test_...`
   - Publishable Key: `pk_test_...`

## Step 2: Create Test Products

In Stripe Dashboard → Products:

### Pro Plan
- Name: "Trading System - Pro"
- Price: $9.99/month (USD)
- Billing: Recurring
- Copy the **Price ID**: `price_...`

### Elite Plan
- Name: "Trading System - Elite"
- Price: $29.99/month (USD)
- Billing: Recurring
- Copy the **Price ID**: `price_...`

## Step 3: Set Up Webhook

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. URL: `http://localhost:3001/api/webhooks/stripe`
4. Events to listen:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret**: `whsec_...`

## Step 4: Environment Variables

Create `.env` in project root:

```bash
# ===== STRIPE =====
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
STRIPE_PRICE_PRO_MONTHLY=price_your_pro_price_id
STRIPE_PRICE_ELITE_MONTHLY=price_your_elite_price_id

# Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_your_pro_price_id
NEXT_PUBLIC_STRIPE_PRICE_ELITE_MONTHLY=price_your_elite_price_id
```

## Step 5: Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (using Scoop)
scoop install stripe

# Linux
curl https://files.stripe.com/stripe-cli/install.sh -o install.sh && bash install.sh
```

## Step 6: Start Local Webhook Forwarding

In a new terminal:

```bash
# Login to Stripe (first time only)
stripe login

# Start forwarding webhooks
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Note the signing secret that appears - update .env if needed
```

## Step 7: Start Development Servers

Terminal 1 - Backend:
```bash
cd backend
npm install  # if first time
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm install  # if first time
npm run dev
```

Terminal 3 - Stripe CLI (from Step 6)

## Step 8: Test the Flow

1. Navigate to http://localhost:3000
2. Register a new account
3. Go to Settings → Subscription
4. Click "Upgrade" on Pro or Elite plan
5. You'll be redirected to Stripe Checkout

### Test Card Numbers

Use these card numbers for testing (any future expiry, any CVC):

- **Success**: `4242 4242 4242 4242`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Declines**: `4000 0000 0000 0002`

Example:
- Card: 4242 4242 4242 4242
- Expiry: 12/25
- CVC: 123

6. After payment, you should see:
   - ✅ Checkout success page
   - ✅ Subscription activated in settings
   - ✅ Webhook logged in Stripe CLI terminal

## Step 9: Trigger Webhook Events (Optional)

Test webhook handling without checkout:

```bash
# Trigger a subscription created event
stripe trigger customer.subscription.created

# Trigger a subscription updated event
stripe trigger customer.subscription.updated

# Trigger a subscription deleted event
stripe trigger customer.subscription.deleted
```

Watch your backend logs to see webhooks being processed.

## Debugging

### Check Webhook Status
```bash
stripe logs tail
```

### View All Events
Go to Stripe Dashboard → Developers → Webhooks → Click endpoint → View logs

### Common Issues

**Webhook not received:**
- Ensure Stripe CLI is running and logged in
- Check backend is running on port 3001
- Verify webhook route exists at `/api/webhooks/stripe`

**Checkout not redirecting:**
- Check `FRONTEND_URL` env var points to http://localhost:3000
- Verify publishable key is correct in frontend
- Check browser console for JavaScript errors

**Subscription not showing:**
- Check PostgreSQL is running and has correct migrations
- Verify webhook processing logs in backend console
- Check user record exists with matching ID

## Next: Deploy to Production

Once satisfied with local testing:

1. Create a production Stripe account or enable live mode
2. Get live API keys (start with `sk_live_...`)
3. Create live products and prices
4. Update webhook URL to production domain
5. Deploy backend and frontend
6. Update `.env` with live credentials
7. Test with small real transaction

See `STRIPE_INTEGRATION.md` for complete production setup.

## Useful Stripe CLI Commands

```bash
# List all customers
stripe customers list

# List all subscriptions
stripe subscriptions list

# View specific subscription
stripe subscriptions retrieve sub_id

# View specific customer
stripe customers retrieve cus_id

# View checkout session
stripe checkout sessions retrieve session_id

# View events
stripe events list
```

## Support

- Stripe Docs: https://stripe.com/docs
- Stripe API Reference: https://stripe.com/docs/api
- Stripe CLI Docs: https://stripe.com/docs/stripe-cli
- Testing Guide: https://stripe.com/docs/testing

---

**Questions?** Check the main `STRIPE_INTEGRATION.md` for more details.
