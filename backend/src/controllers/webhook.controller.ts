import { Request, Response } from 'express'
import Stripe from 'stripe'
import { stripeService } from '@/services/stripe.service'

export const webhookController = {
  async handleStripeWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string
    if (!signature) return res.status(400).json({ error: 'Missing signature' })

    try {
      const event = await stripeService.verifyWebhookSignature(
        req.body as unknown as string,
        signature
      )

      switch (event.type) {
        case 'checkout.session.completed':
          {
            const session = event.data.object as Stripe.Checkout.Session
            await stripeService.handleCheckoutSessionCompleted(session)
            console.log('✓ Subscription created:', session.id)
          }
          break

        case 'customer.subscription.updated':
          {
            const subscription = event.data.object as Stripe.Subscription
            await stripeService.handleSubscriptionUpdated(subscription)
            console.log('✓ Subscription updated:', subscription.id)
          }
          break

        case 'customer.subscription.deleted':
          {
            const subscription = event.data.object as Stripe.Subscription
            await stripeService.handleSubscriptionDeleted(subscription)
            console.log('✓ Subscription deleted:', subscription.id)
          }
          break

        default:
          console.log('Unhandled event type:', event.type)
      }

      res.json({ received: true })
    } catch (err: any) {
      console.error('Webhook error:', err.message)
      res.status(400).json({ error: `Webhook Error: ${err.message}` })
    }
  },
}
