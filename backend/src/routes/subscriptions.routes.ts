import { Router } from 'express'
import { subscriptionController } from '@/controllers/subscription.controller'
import { authMiddleware } from '@/middleware/auth.middleware'

const router = Router()

// Get current subscription
router.get('/', authMiddleware, subscriptionController.getSubscription)

// Create checkout session
router.post('/checkout', authMiddleware, subscriptionController.createCheckoutSession)

// Get checkout session details
router.get('/checkout/:sessionId', subscriptionController.getCheckoutSession)

// Create billing portal session
router.post('/portal', authMiddleware, subscriptionController.createBillingPortal)

// Cancel subscription
router.post('/cancel', authMiddleware, subscriptionController.cancelSubscription)

export default router
