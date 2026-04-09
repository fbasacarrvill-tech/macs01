import { Router } from 'express'
import { loyaltyAuthMiddleware } from './middleware/auth'
import AuthController from './controllers/auth.controller'
import ProgramController from './controllers/program.controller'
import CustomerController from './controllers/customer.controller'
import CardController from './controllers/card.controller'
import TransactionController from './controllers/transaction.controller'
import NotificationController from './controllers/notification.controller'
import AnalyticsController from './controllers/analytics.controller'
import WalletController from './controllers/wallet.controller'

const router = Router()

// ============ AUTH ROUTES ============
// Public endpoints
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)
router.post('/auth/refresh-token', AuthController.refreshToken)

// Protected endpoints (require authentication)
router.get('/auth/me', loyaltyAuthMiddleware, AuthController.getMe)
router.put('/auth/profile', loyaltyAuthMiddleware, AuthController.updateProfile)

// API Key management
router.post('/auth/api-keys', loyaltyAuthMiddleware, AuthController.createApiKey)
router.get('/auth/api-keys', loyaltyAuthMiddleware, AuthController.listApiKeys)
router.delete('/auth/api-keys/:keyId', loyaltyAuthMiddleware, AuthController.deleteApiKey)

// ============ PROGRAM ROUTES ============
// Require authentication for all program endpoints
router.post('/programs', loyaltyAuthMiddleware, ProgramController.create)
router.get('/programs', loyaltyAuthMiddleware, ProgramController.list)
router.get('/programs/:programId', loyaltyAuthMiddleware, ProgramController.get)
router.put('/programs/:programId', loyaltyAuthMiddleware, ProgramController.update)
router.delete('/programs/:programId', loyaltyAuthMiddleware, ProgramController.delete)
router.post('/programs/:programId/publish', loyaltyAuthMiddleware, ProgramController.publish)

// Tier management
router.post('/programs/:programId/tiers', loyaltyAuthMiddleware, ProgramController.createTier)
router.get('/programs/:programId/tiers', loyaltyAuthMiddleware, ProgramController.getTiers)

// Rule management
router.post('/programs/:programId/rules', loyaltyAuthMiddleware, ProgramController.createRule)
router.get('/programs/:programId/rules', loyaltyAuthMiddleware, ProgramController.getRules)

// Program analytics
router.get('/programs/:programId/analytics', loyaltyAuthMiddleware, ProgramController.getAnalytics)

// ============ CUSTOMER ROUTES ============
// Customer CRUD
router.post('/customers', loyaltyAuthMiddleware, CustomerController.create)
router.get('/customers', loyaltyAuthMiddleware, CustomerController.list)
router.get('/customers/:customerId', loyaltyAuthMiddleware, CustomerController.get)
router.put('/customers/:customerId', loyaltyAuthMiddleware, CustomerController.update)

// Bulk import
router.post('/customers/bulk-import', loyaltyAuthMiddleware, CustomerController.bulkImport)

// Program enrollment
router.post('/customers/:customerId/programs/:programId/enroll', loyaltyAuthMiddleware, CustomerController.enrollInProgram)
router.delete('/customers/:customerId/programs/:programId', loyaltyAuthMiddleware, CustomerController.unenrollFromProgram)

// Customer cards
router.get('/customers/:customerId/programs/:programId/cards', loyaltyAuthMiddleware, CustomerController.getCustomerCards)

// Notification preferences
router.put('/customers/:customerId/notification-preferences', loyaltyAuthMiddleware, CustomerController.updateNotificationPreferences)

// ============ CARD ROUTES ============
// Card CRUD
router.post('/cards', loyaltyAuthMiddleware, CardController.create)
router.get('/cards/:cardId', loyaltyAuthMiddleware, CardController.get)
router.get('/cards/code/:code', loyaltyAuthMiddleware, CardController.getByCode)

// Cards by program
router.get('/programs/:programId/cards', loyaltyAuthMiddleware, CardController.listByProgram)

// Card actions
router.post('/cards/:cardId/stamp', loyaltyAuthMiddleware, CardController.addStamp)
router.post('/cards/:cardId/points', loyaltyAuthMiddleware, CardController.addPoints)
router.post('/cards/:cardId/redeem', loyaltyAuthMiddleware, CardController.redeemReward)
router.put('/cards/:cardId/status', loyaltyAuthMiddleware, CardController.updateStatus)
router.post('/cards/:cardId/wallet', loyaltyAuthMiddleware, CardController.addToWallet)

// ============ TRANSACTION ROUTES ============
// Create transaction
router.post('/transactions', loyaltyAuthMiddleware, TransactionController.create)
router.get('/transactions/:transactionId', loyaltyAuthMiddleware, TransactionController.get)

// Transactions by context
router.get('/cards/:cardId/transactions', loyaltyAuthMiddleware, TransactionController.listByCard)
router.get('/customers/:customerId/transactions', loyaltyAuthMiddleware, TransactionController.listByCustomer)
router.get('/programs/:programId/transactions', loyaltyAuthMiddleware, TransactionController.listByProgram)

// Program analytics
router.get('/programs/:programId/transactions/analytics', loyaltyAuthMiddleware, TransactionController.getProgramAnalytics)

// ============ SCANNING & OPERATIONS ============
// Card scanning
router.post('/scan', loyaltyAuthMiddleware, TransactionController.scanCard)

// Process purchase
router.post('/purchase', loyaltyAuthMiddleware, TransactionController.processPurchase)

// ============ NOTIFICATION ROUTES ============
// Campaign management
router.post('/notifications/campaigns', loyaltyAuthMiddleware, NotificationController.createCampaign)
router.post('/notifications/campaigns/:campaignId/send', loyaltyAuthMiddleware, NotificationController.sendCampaign)
router.get('/notifications/campaigns/:campaignId/stats', loyaltyAuthMiddleware, NotificationController.getCampaignStats)

// Location-based notifications
router.post('/notifications/location', loyaltyAuthMiddleware, NotificationController.sendLocationNotification)

// Customer notifications
router.post('/customers/:customerId/notifications', loyaltyAuthMiddleware, NotificationController.sendToCustomer)
router.get('/customers/:customerId/notifications/preferences', loyaltyAuthMiddleware, NotificationController.getPreferences)

// Push token management (no auth required - can be called from mobile)
router.post('/customers/:customerId/push-tokens', NotificationController.registerPushToken)

// Test endpoint (development only)
router.post('/customers/:customerId/notifications/test', loyaltyAuthMiddleware, NotificationController.testSend)

// ============ ANALYTICS ROUTES ============
// Program analytics
router.get('/analytics/programs/:programId/overview', loyaltyAuthMiddleware, AnalyticsController.getProgramOverview)
router.get('/analytics/programs/:programId/time-based', loyaltyAuthMiddleware, AnalyticsController.getTimeBasedAnalytics)
router.get('/analytics/programs/:programId/segmentation', loyaltyAuthMiddleware, AnalyticsController.getCustomerSegmentation)
router.get('/analytics/programs/:programId/roi', loyaltyAuthMiddleware, AnalyticsController.getROI)

// Customer analytics
router.get('/analytics/customers/:customerId', loyaltyAuthMiddleware, AnalyticsController.getCustomerAnalytics)

// ============ WALLET ROUTES ============
// Wallet pass generation (can be public for direct sharing)
router.get('/wallet/apple/:cardId', WalletController.getAppleWalletPass)
router.get('/wallet/google/:cardId', WalletController.getGoogleWalletJWT)
router.get('/wallet/pass/:cardId', WalletController.getWalletPassData)

// Wallet management (requires authentication)
router.post('/cards/:cardId/add-to-wallet', loyaltyAuthMiddleware, WalletController.addToWallet)
router.put('/cards/:cardId/update-in-wallet', loyaltyAuthMiddleware, WalletController.updateInWallet)
router.delete('/cards/:cardId/remove-from-wallet', loyaltyAuthMiddleware, WalletController.removeFromWallet)

// Wallet provider status
router.get('/wallet/status', WalletController.getWalletStatus)

export default router
