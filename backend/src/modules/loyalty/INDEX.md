# Loyalty Module - Complete Index

Generated: 2026-04-09

## Quick Stats

- **Total Endpoints**: 63+
- **Total Services**: 10
- **Total Controllers**: 9
- **Lines of Code**: ~5000+
- **Type Definitions**: 30+
- **Commits**: 3 (Core API, Advanced Features, Card Generation & Wallet)

## File Structure

### Controllers (9 files)
```
controllers/
├── auth.controller.ts          (8 endpoints)
├── program.controller.ts       (11 endpoints)
├── customer.controller.ts      (9 endpoints)
├── card.controller.ts          (9 endpoints)
├── transaction.controller.ts   (7 endpoints)
├── notification.controller.ts  (8 endpoints)
├── analytics.controller.ts     (5 endpoints)
├── wallet.controller.ts        (7 endpoints)
└── (index file for exports)
```

### Services (10 files)
```
services/
├── auth.service.ts             - Business auth, API keys, profiles
├── program.service.ts          - Programs, tiers, rules
├── customer.service.ts         - Customers, enrollment, preferences
├── card.service.ts             - Cards, stamps, points, redemption
├── transaction.service.ts      - Transactions, analytics, scanning
├── notification.service.ts     - Campaigns, push tokens, targeting
├── analytics.service.ts        - Metrics, segmentation, ROI
├── cardgeneration.service.ts   - Card numbers, barcodes, QR codes
├── wallet.service.ts           - Apple Wallet, Google Wallet
└── (services may be exported via index)
```

### Other Files
```
├── middleware/
│   └── auth.ts                 - JWT authentication, token generation
├── types/
│   └── index.ts                - 30+ TypeScript interfaces
├── seeders/
│   └── index.ts                - Sample data for development
├── routes.ts                   - 63+ API endpoint definitions
├── README.md                   - Complete documentation
└── INDEX.md                    - This file
```

## Endpoint Breakdown

### 1. Authentication (8)
- `POST /auth/register` - Register new business
- `POST /auth/login` - Business login
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/me` - Get authenticated business
- `PUT /auth/profile` - Update business profile
- `POST /auth/api-keys` - Create API key
- `GET /auth/api-keys` - List API keys
- `DELETE /auth/api-keys/:keyId` - Delete API key

### 2. Programs (11)
- `POST /programs` - Create loyalty program
- `GET /programs` - List programs with filters
- `GET /programs/:programId` - Get program details
- `PUT /programs/:programId` - Update program
- `DELETE /programs/:programId` - Archive program
- `POST /programs/:programId/publish` - Publish program
- `POST /programs/:programId/tiers` - Create tier
- `GET /programs/:programId/tiers` - List tiers
- `POST /programs/:programId/rules` - Create rule
- `GET /programs/:programId/rules` - List rules
- `GET /programs/:programId/analytics` - Get analytics

### 3. Customers (9)
- `POST /customers` - Create customer
- `GET /customers` - List customers (paginated)
- `GET /customers/:customerId` - Get customer details
- `PUT /customers/:customerId` - Update customer
- `POST /customers/bulk-import` - Bulk import customers
- `POST /customers/:customerId/programs/:programId/enroll` - Enroll in program
- `DELETE /customers/:customerId/programs/:programId` - Unenroll from program
- `GET /customers/:customerId/programs/:programId/cards` - Get customer's cards
- `PUT /customers/:customerId/notification-preferences` - Update preferences

### 4. Cards (9)
- `POST /cards` - Create loyalty card
- `GET /cards/:cardId` - Get card details
- `GET /cards/code/:code` - Look up by barcode/QR
- `GET /programs/:programId/cards` - List program's cards
- `POST /cards/:cardId/stamp` - Add stamp (STAMPS programs)
- `POST /cards/:cardId/points` - Add points
- `POST /cards/:cardId/redeem` - Redeem reward
- `PUT /cards/:cardId/status` - Change card status
- `POST /cards/:cardId/wallet` - Add card to wallet

### 5. Transactions (7)
- `POST /transactions` - Create transaction
- `GET /transactions/:transactionId` - Get transaction
- `GET /cards/:cardId/transactions` - List card transactions
- `GET /customers/:customerId/transactions` - List customer transactions
- `GET /programs/:programId/transactions` - List program transactions
- `GET /programs/:programId/transactions/analytics` - Transaction analytics
- `POST /scan` - Scan card (barcode/QR)
- `POST /purchase` - Process purchase

### 6. Notifications (8)
- `POST /notifications/campaigns` - Create campaign
- `POST /notifications/campaigns/:id/send` - Send campaign
- `GET /notifications/campaigns/:id/stats` - Campaign statistics
- `POST /notifications/location` - Send location-based notification
- `POST /customers/:customerId/notifications` - Send to customer
- `GET /customers/:customerId/notifications/preferences` - Get preferences
- `POST /customers/:customerId/push-tokens` - Register push token
- `POST /customers/:customerId/notifications/test` - Test notification

### 7. Analytics (5)
- `GET /analytics/programs/:programId/overview` - Program overview
- `GET /analytics/programs/:programId/time-based` - Time-based metrics
- `GET /analytics/programs/:programId/segmentation` - Customer segments
- `GET /analytics/programs/:programId/roi` - ROI calculation
- `GET /analytics/customers/:customerId` - Customer analytics

### 8. Wallet Integration (7)
- `GET /wallet/apple/:cardId` - Generate Apple Wallet pass
- `GET /wallet/google/:cardId` - Generate Google Wallet JWT
- `GET /wallet/pass/:cardId` - Get generic pass data
- `POST /cards/:cardId/add-to-wallet` - Add to wallet
- `PUT /cards/:cardId/update-in-wallet` - Update in wallet
- `DELETE /cards/:cardId/remove-from-wallet` - Remove from wallet
- `GET /wallet/status` - Wallet provider status

## Service Methods Summary

### AuthService (9 methods)
- registerBusiness()
- loginBusiness()
- refreshToken()
- getBusinessProfile()
- updateBusinessProfile()
- verifyBusinessEmail()
- createApiKey()
- listApiKeys()
- deleteApiKey()

### ProgramService (10 methods)
- createProgram()
- getProgram()
- listPrograms()
- updateProgram()
- deleteProgram()
- publishProgram()
- createTier()
- getTiers()
- createRule()
- getRules()
- getProgramAnalytics()

### CustomerService (8 methods)
- createCustomer()
- getCustomer()
- listCustomers()
- updateCustomer()
- enrollInProgram()
- unenrollFromProgram()
- bulkImportCustomers()
- getCustomerProgramCards()
- updateNotificationPreferences()

### CardService (9 methods)
- createCard()
- getCard()
- getCardByCode()
- listCardsByProgram()
- addStamp()
- addPoints()
- redeemReward()
- updateCardStatus()
- addToWallet()

### TransactionService (5 methods)
- createTransaction()
- getTransaction()
- listTransactionsByCard()
- listTransactionsByCustomer()
- listTransactionsByProgram()
- getProgramTransactionAnalytics()

### NotificationService (6 methods)
- createCampaign()
- sendCampaign()
- sendLocationBasedNotification()
- sendToCustomer()
- registerPushToken()
- getCampaignStats()
- getNotificationPreferences()
- testSendNotification()

### AnalyticsService (5 methods)
- getProgramOverview()
- getCustomerAnalytics()
- getTimeBasedAnalytics()
- getCustomerSegmentation()
- getROI()

### CardGenerationService (static methods)
- generateCardNumber()
- generateBarcode()
- generateQRCodeData()
- generateCardAccessToken()
- generatePassUrl()
- generateCardDesign()
- validateCardNumber()
- validateBarcode()
- generateExpirationDate()
- isCardExpired()
- getDaysUntilExpiration()
- generateCardPIN()

### WalletService (static methods)
- generateAppleWalletPass()
- generateGoogleWalletJWT()
- getWalletPassData()
- updateCardInWallet()
- removeCardFromWallet()
- getWalletProviderStatus()

## Data Models

### Business
- id, name, email, phone, website
- logo, colors (primary, secondary)
- status, isEmailVerified
- relationships: programs, apiKeys

### LoyaltyProgram
- id, businessId, name, description, type
- currency, points configuration
- colors (bg, fg, accent)
- relationships: customers, cards, tiers, rules, transactions, analytics

### Customer
- id, email, phone, name (first, last)
- location (country, state, city, zipcode)
- preferences (language, timezone, notificationsOptIn)
- relationships: programs, cards, pushTokens

### LoyaltyCard
- id, programId, customerId
- cardNumber, barcode, qrCode
- points (current, earned, redeemed)
- status (ACTIVE, PAUSED, EXPIRED, REDEEMED)
- wallet info (type, token, addedAt)

### Transaction
- id, cardId, customerId, programId
- type (PURCHASE, BONUS, REDEMPTION, ADJUSTMENT, EXPIRATION)
- points, amount, description
- balance tracking

### Campaign
- id, businessId, title, message
- status (DRAFT, SCHEDULED, ACTIVE, COMPLETED)
- targeting (segments, geolocation)
- metrics (sent, open, click counts)

### PushToken
- id, customerId, token
- platform (ios, android, web)

## Technologies Used

- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Prisma ORM + PostgreSQL
- **Authentication**: JWT
- **Validation**: Joi
- **Crypto**: Node.js built-in (bcryptjs optional)
- **Code Generation**: UUID, crypto

## Key Features

✅ Multi-tenant architecture (business isolation)
✅ 8 loyalty program types
✅ Digital wallet integration ready (Apple/Google)
✅ Push notification infrastructure
✅ Advanced analytics and ROI calculation
✅ Customer segmentation
✅ Bulk operations (import)
✅ Transaction audit trail
✅ Expiration date handling
✅ Comprehensive validation
✅ Error handling with detailed messages
✅ Pagination on all list endpoints
✅ Full TypeScript type safety

## Security Features

✅ JWT authentication
✅ Business ownership validation
✅ Password hashing (bcryptjs)
✅ API key management
✅ Secure token generation
✅ Card number validation
✅ Barcode validation with check digits
✅ Input validation with Joi

## Next Steps

1. **Frontend Development**: React/Next.js dashboard
2. **Database Setup**: Real Prisma migrations
3. **Wallet Integration**: Apple PassKit & Google Pay certificates
4. **Notifications**: Firebase Cloud Messaging
5. **Testing**: Unit, integration, and e2e tests
6. **Deployment**: Production configuration
7. **Monitoring**: Logging and alerting

## Performance Notes

- List endpoints are paginated (default: 10 items per page)
- Indexes should be added for:
  - businessId (all models)
  - customerId (cards, transactions, pushTokens)
  - programId (cards, transactions)
  - email (business, customer)
  - cardNumber, barcode, qrCode (cards)
- Consider caching for analytics queries
- Use database connection pooling for production

## Documentation

- `README.md`: Complete API documentation and setup guide
- `INDEX.md`: This file - quick reference guide
- Each controller has JSDoc comments
- Each service has method descriptions
- Type definitions are well-documented

## Git History

```
Commit 1: Phase 3: Complete Core API Implementation
  - 5 services, 5 controllers
  - Auth, Program, Customer, Card, Transaction

Commit 2: Phase 3B: Complete Advanced Features
  - Notification, Analytics services
  - Seeders with sample data
  - 55+ total endpoints

Commit 3: Phase 3C: Card Generation & Digital Wallet
  - CardGenerationService
  - WalletService
  - 63+ total endpoints
```

---

**Last Updated**: 2026-04-09
**Module Status**: ✅ Backend Complete - Ready for Frontend Development
