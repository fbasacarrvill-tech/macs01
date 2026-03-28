import { Request, Response } from 'express'
import { stripeService } from '@/services/stripe.service'
import { prisma } from '@/lib/prisma'

export const subscriptionController = {
  async getSubscription(req: Request, res: Response) {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    })

    res.json({
      success: true,
      data: subscription || { tier: 'free', status: 'active' },
    })
  },

  async createCheckoutSession(req: Request, res: Response) {
    const userId = req.user?.id
    const userEmail = req.user?.email
    if (!userId || !userEmail) return res.status(401).json({ error: 'Unauthorized' })

    const { tier, priceId } = req.body
    if (!tier || !priceId) {
      return res.status(400).json({ error: 'Missing tier or priceId' })
    }

    try {
      const session = await stripeService.createCheckoutSession(
        userId,
        userEmail,
        priceId,
        tier
      )
      res.json({ success: true, data: { sessionId: session.id, url: session.url } })
    } catch (err) {
      console.error(err)
      res.status(400).json({ error: 'Failed to create checkout session' })
    }
  },

  async getCheckoutSession(req: Request, res: Response) {
    const { sessionId } = req.query
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' })

    try {
      const session = await stripeService.getCheckoutSession(sessionId as string)
      res.json({ success: true, data: session })
    } catch (err) {
      console.error(err)
      res.status(400).json({ error: 'Failed to retrieve session' })
    }
  },

  async createBillingPortal(req: Request, res: Response) {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    try {
      const subscription = await prisma.userSubscription.findUnique({
        where: { userId },
      })

      if (!subscription?.stripeCustomerId) {
        return res.status(400).json({ error: 'No active subscription' })
      }

      const returnUrl = `${process.env.FRONTEND_URL}/settings`
      const session = await stripeService.createPortalSession(
        subscription.stripeCustomerId,
        returnUrl
      )

      res.json({ success: true, data: { url: session.url } })
    } catch (err) {
      console.error(err)
      res.status(400).json({ error: 'Failed to create portal session' })
    }
  },

  async cancelSubscription(req: Request, res: Response) {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    try {
      const subscription = await prisma.userSubscription.findUnique({
        where: { userId },
      })

      if (!subscription?.stripeSubscriptionId) {
        return res.status(400).json({ error: 'No active subscription' })
      }

      await stripeService.cancelSubscription(subscription.stripeSubscriptionId)

      await prisma.userSubscription.update({
        where: { userId },
        data: { status: 'cancelled' },
      })

      res.json({ success: true, message: 'Subscription cancelled' })
    } catch (err) {
      console.error(err)
      res.status(400).json({ error: 'Failed to cancel subscription' })
    }
  },
}
