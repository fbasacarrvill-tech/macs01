import { Router } from 'express'
import { AnalyticsController } from '../controllers/analytics.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/summary', AnalyticsController.summary)
router.get('/by-asset', AnalyticsController.byAsset)
router.get('/by-strategy', AnalyticsController.byStrategy)
router.get('/equity-curve', AnalyticsController.equityCurve)
router.get('/drawdown', AnalyticsController.drawdown)

export default router
