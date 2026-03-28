import { Router, raw } from 'express'
import { webhookController } from '@/controllers/webhook.controller'

const router = Router()

// Stripe webhook - must use raw body, not JSON parsed
router.post(
  '/stripe',
  raw({ type: 'application/octet-stream' }),
  webhookController.handleStripeWebhook
)

export default router
