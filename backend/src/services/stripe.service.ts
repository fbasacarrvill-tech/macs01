import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

export const stripeService = {
  async createCustomer(email: string, userId: string) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    })
    return customer
  },

  async getCustomer(customerId: string) {
    return stripe.customers.retrieve(customerId)
  },

  async createSubscription(customerId: string, priceId: string) {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    })
    return subscription
  },

  async cancelSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
    return subscription
  },

  async getSubscription(subscriptionId: string) {
    return stripe.subscriptions.retrieve(subscriptionId)
  },

  async createPaymentIntent(customerId: string, amount: number, currency = 'usd') {
    return stripe.paymentIntents.create({
      customer: customerId,
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    })
  },

  async verifyWebhookSignature(body: string, signature: string) {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  },

  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const customerId = session.customer as string
    const metadata = session.metadata as Record<string, string>
    const userId = metadata?.userId

    if (!userId) return

    const customer = await stripe.customers.retrieve(customerId)
    const tierName = metadata?.tier || 'pro'

    // Find the subscription tier by name
    const subscriptionTier = await prisma.subscriptionTier.findFirst({
      where: { name: tierName }
    })

    if (!subscriptionTier) return

    await prisma.userSubscription.upsert({
      where: { userId },
      create: {
        userId,
        tierId: subscriptionTier.id,
        stripeSubscriptionId: session.subscription as string,
        status: 'active',
        endDate: new Date((session.expires_at || Date.now() / 1000 + 2592000) * 1000),
      },
      update: {
        tierId: subscriptionTier.id,
        stripeSubscriptionId: session.subscription as string,
        status: 'active',
      },
    })
  },

  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)
    if ('deleted' in customer && customer.deleted) return
    const userId = (customer.metadata as Record<string, string>)?.userId

    if (!userId) return

    const tierName = subscription.metadata?.tier || 'pro'
    const status = subscription.status === 'active' ? 'active' : 'cancelled'

    const subscriptionTier = await prisma.subscriptionTier.findFirst({
      where: { name: tierName }
    })

    if (!subscriptionTier) return

    await prisma.userSubscription.updateMany({
      where: { userId },
      data: {
        tierId: subscriptionTier.id,
        status,
        endDate: new Date(subscription.current_period_end * 1000),
      },
    })
  },

  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)
    if ('deleted' in customer && customer.deleted) return
    const userId = (customer.metadata as Record<string, string>)?.userId

    if (!userId) return

    await prisma.userSubscription.updateMany({
      where: { userId },
      data: { status: 'cancelled' },
    })
  },

  async createCheckoutSession(userId: string, email: string, priceId: string, tier: string) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/settings`,
      customer_email: email,
      metadata: { userId, tier },
    })
    return session
  },

  async getCheckoutSession(sessionId: string) {
    return stripe.checkout.sessions.retrieve(sessionId)
  },

  // Portal session for customer subscription management
  async createPortalSession(customerId: string, returnUrl: string) {
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
  },
}
