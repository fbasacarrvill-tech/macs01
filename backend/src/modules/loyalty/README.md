# Loyalty Module - DevotioRewards

Complete digital loyalty program solution with support for 8 card types, wallet integration, and advanced analytics.

## Overview

The loyalty module provides a complete backend for managing digital loyalty rewards programs including:

- **Business Management**: Authentication, profiles, API keys
- **Loyalty Programs**: 8 types (STAMPS, CASHBACK, AFFINITY, DISCOUNT, COUPON, GIFT, MEMBERSHIP, MULTIPASS)
- **Customer Management**: Enrollment, profiles, notification preferences
- **Digital Cards**: Secure card generation with QR/barcodes
- **Transactions**: Purchase tracking, points management, redemption
- **Notifications**: Campaign creation, push notifications, location-based targeting
- **Analytics**: ROI tracking, customer segmentation, time-based metrics
- **Wallet Integration**: Apple Wallet & Google Wallet support

## Architecture

```
modules/loyalty/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── middleware/      # Authentication
├── types/          # TypeScript interfaces
├── seeders/        # Sample data
└── routes.ts       # Route definitions
```

## Setup & Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/macs01

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=15m

# Wallets (configure for production)
APPLE_WALLET_TEAM_ID=TEAM123456
APPLE_WALLET_KEY=...

GOOGLE_WALLET_PROJECT_ID=project-123
GOOGLE_WALLET_SERVICE_ACCOUNT=...
```

### Database Setup

The module uses Prisma ORM. To set up:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (when ready)
npx prisma migrate deploy
```

### Seed Sample Data

```bash
# Create demo business, programs, customers, and cards
npx ts-node -P tsconfig.json backend/src/modules/loyalty/seeders/index.ts
```

## API Endpoints (63+)

### Authentication (6 endpoints)

```
POST   /api/loyalty/auth/register          # Register business
POST   /api/loyalty/auth/login             # Login business
POST   /api/loyalty/auth/refresh-token     # Refresh access token
GET    /api/loyalty/auth/me                # Get business profile
PUT    /api/loyalty/auth/profile           # Update profile
POST   /api/loyalty/auth/api-keys          # Create API key
GET    /api/loyalty/auth/api-keys          # List API keys
DELETE /api/loyalty/auth/api-keys/:keyId   # Delete API key
```

### Loyalty Programs (11 endpoints)

```
POST   /api/loyalty/programs               # Create program
GET    /api/loyalty/programs               # List programs
GET    /api/loyalty/programs/:programId    # Get program details
PUT    /api/loyalty/programs/:programId    # Update program
DELETE /api/loyalty/programs/:programId    # Delete program (archive)
POST   /api/loyalty/programs/:programId/publish  # Publish program

# Tiers
POST   /api/loyalty/programs/:programId/tiers    # Create tier
GET    /api/loyalty/programs/:programId/tiers    # List tiers

# Rules
POST   /api/loyalty/programs/:programId/rules    # Create rule
GET    /api/loyalty/programs/:programId/rules    # List rules

# Analytics
GET    /api/loyalty/programs/:programId/analytics  # Get program analytics
```

### Customers (9 endpoints)

```
POST   /api/loyalty/customers                          # Create customer
GET    /api/loyalty/customers                          # List customers
GET    /api/loyalty/customers/:customerId              # Get customer
PUT    /api/loyalty/customers/:customerId              # Update customer
POST   /api/loyalty/customers/bulk-import              # Bulk import

# Program enrollment
POST   /api/loyalty/customers/:customerId/programs/:programId/enroll     # Enroll
DELETE /api/loyalty/customers/:customerId/programs/:programId            # Unenroll
GET    /api/loyalty/customers/:customerId/programs/:programId/cards      # Get cards
PUT    /api/loyalty/customers/:customerId/notification-preferences      # Update preferences
```

### Loyalty Cards (9 endpoints)

```
POST   /api/loyalty/cards                         # Create card
GET    /api/loyalty/cards/:cardId                 # Get card
GET    /api/loyalty/cards/code/:code              # Get by barcode/QR
GET    /api/loyalty/programs/:programId/cards     # List program cards

POST   /api/loyalty/cards/:cardId/stamp           # Add stamp
POST   /api/loyalty/cards/:cardId/points          # Add points
POST   /api/loyalty/cards/:cardId/redeem          # Redeem reward
PUT    /api/loyalty/cards/:cardId/status          # Update status
POST   /api/loyalty/cards/:cardId/wallet          # Add to wallet
```

### Transactions (7 endpoints)

```
POST   /api/loyalty/transactions                            # Create transaction
GET    /api/loyalty/transactions/:transactionId             # Get transaction
GET    /api/loyalty/cards/:cardId/transactions              # By card
GET    /api/loyalty/customers/:customerId/transactions      # By customer
GET    /api/loyalty/programs/:programId/transactions        # By program
GET    /api/loyalty/programs/:programId/transactions/analytics  # Analytics

POST   /api/loyalty/scan                          # Scan card
POST   /api/loyalty/purchase                      # Process purchase
```

### Notifications (7 endpoints)

```
POST   /api/loyalty/notifications/campaigns               # Create campaign
POST   /api/loyalty/notifications/campaigns/:id/send      # Send campaign
GET    /api/loyalty/notifications/campaigns/:id/stats     # Campaign stats
POST   /api/loyalty/notifications/location               # Location-based

POST   /api/loyalty/customers/:customerId/notifications   # Send to customer
GET    /api/loyalty/customers/:customerId/notifications/preferences  # Get preferences
POST   /api/loyalty/customers/:customerId/push-tokens    # Register push token
POST   /api/loyalty/customers/:customerId/notifications/test         # Test send
```

### Analytics (5 endpoints)

```
GET    /api/loyalty/analytics/programs/:programId/overview        # Program overview
GET    /api/loyalty/analytics/programs/:programId/time-based       # Time-based metrics
GET    /api/loyalty/analytics/programs/:programId/segmentation     # Customer segments
GET    /api/loyalty/analytics/programs/:programId/roi              # ROI metrics
GET    /api/loyalty/analytics/customers/:customerId               # Customer analytics
```

### Wallet Integration (7 endpoints)

```
GET    /api/loyalty/wallet/apple/:cardId         # Apple Wallet pass
GET    /api/loyalty/wallet/google/:cardId        # Google Wallet JWT
GET    /api/loyalty/wallet/pass/:cardId          # Generic pass data
POST   /api/loyalty/cards/:cardId/add-to-wallet           # Add to wallet
PUT    /api/loyalty/cards/:cardId/update-in-wallet        # Update in wallet
DELETE /api/loyalty/cards/:cardId/remove-from-wallet      # Remove from wallet
GET    /api/loyalty/wallet/status                         # Wallet provider status
```

## Service Layer

### AuthService
- Business registration and authentication
- JWT token generation and verification
- API key management
- Profile management

### ProgramService
- Create/update/delete loyalty programs
- Tier and rule management
- Program analytics

### CustomerService
- Customer lifecycle management
- Program enrollment
- Notification preferences
- Bulk customer import

### CardService
- Card creation and management
- Point/stamp operations
- Wallet integration
- Card lookup by code (barcode/QR)

### TransactionService
- Transaction recording
- Balance tracking
- Analytics aggregation

### NotificationService
- Campaign creation and sending
- Location-based notifications
- Push token management
- Notification preferences

### AnalyticsService
- Program overview metrics
- Customer analytics
- Time-based trending
- Customer segmentation
- ROI calculation

### CardGenerationService
- Card number generation
- Barcode generation (UPC-A format)
- QR code data generation
- Card validation
- Expiration date handling

### WalletService
- Apple Wallet pass generation
- Google Wallet JWT generation
- Wallet synchronization
- Provider status tracking

## Authentication

All endpoints (except public wallet access) require JWT Bearer token:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via:

```bash
POST /api/loyalty/auth/login
{
  "email": "business@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "business": {
    "id": "biz_123",
    "name": "Coffee Shop",
    "email": "business@example.com"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

## Data Models

### Business
- ID, name, email, phone, website
- Colors (primary, secondary)
- Logo URL
- Status (ACTIVE, SUSPENDED, INACTIVE)
- API keys
- Loyalty programs

### LoyaltyProgram
- 8 types: STAMPS, CASHBACK, AFFINITY, DISCOUNT, COUPON, GIFT, MEMBERSHIP, MULTIPASS
- Points configuration (per dollar rate)
- Expiration rules
- Color customization
- Tiers and rules
- Customers and cards

### Customer
- Email, phone, name
- Location (country, state, city, zipcode)
- Preferences (language, timezone)
- Push tokens
- Enrolled programs
- Loyalty cards

### LoyaltyCard
- Card number, barcode, QR code
- Points balance
- Status (ACTIVE, PAUSED, EXPIRED, REDEEMED)
- Wallet integration (Apple/Google)
- Expiration date

### Transaction
- Type (PURCHASE, BONUS, REDEMPTION, ADJUSTMENT, EXPIRATION)
- Points and amount
- Balance tracking
- Metadata

## Example Workflows

### 1. Business Registration & Program Creation

```bash
# Register business
curl -X POST http://localhost:3001/api/loyalty/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee Shop",
    "email": "owner@coffee.com",
    "password": "secure123"
  }'

# Create STAMPS program
curl -X POST http://localhost:3001/api/loyalty/programs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Buy 10, Get 1 Free",
    "type": "STAMPS",
    "description": "Collect stamps on every purchase",
    "minPointsRedeemable": 10,
    "pointsName": "Stamps",
    "backgroundColor": "#FFFFFF",
    "foregroundColor": "#8B4513",
    "accentColor": "#D2B48C"
  }'
```

### 2. Customer Enrollment

```bash
# Create customer
curl -X POST http://localhost:3001/api/loyalty/customers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "country": "US",
    "city": "San Francisco"
  }'

# Enroll in program
curl -X POST http://localhost:3001/api/loyalty/customers/{customerId}/programs/{programId}/enroll \
  -H "Authorization: Bearer <token>"
```

### 3. Card Operations

```bash
# Create card
curl -X POST http://localhost:3001/api/loyalty/cards \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "programId": "{programId}",
    "customerId": "{customerId}"
  }'

# Add stamp
curl -X POST http://localhost:3001/api/loyalty/cards/{cardId}/stamp \
  -H "Authorization: Bearer <token>"

# Redeem reward
curl -X POST http://localhost:3001/api/loyalty/cards/{cardId}/redeem \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "points": 10,
    "description": "Free coffee"
  }'
```

### 4. Wallet Integration

```bash
# Get Apple Wallet pass
curl http://localhost:3001/api/loyalty/wallet/apple/{cardId}

# Get Google Wallet JWT
curl http://localhost:3001/api/loyalty/wallet/google/{cardId}

# Add card to wallet (requires auth)
curl -X POST http://localhost:3001/api/loyalty/cards/{cardId}/add-to-wallet \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"walletType": "APPLE"}'
```

### 5. Analytics

```bash
# Program overview
curl http://localhost:3001/api/loyalty/analytics/programs/{programId}/overview \
  -H "Authorization: Bearer <token>"

# Customer segmentation
curl http://localhost:3001/api/loyalty/analytics/programs/{programId}/segmentation \
  -H "Authorization: Bearer <token>"

# ROI metrics
curl http://localhost:3001/api/loyalty/analytics/programs/{programId}/roi \
  -H "Authorization: Bearer <token>"
```

## Error Handling

All errors return standard format:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email"
    }
  ]
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token)
- 404: Not Found
- 500: Server Error

## Validation

All inputs validated with Joi schemas:
- Email addresses
- URLs
- Hex colors
- Phone numbers
- Numeric ranges
- Required fields

## Development

### Running Tests

```bash
npm test
```

### Code Style

Uses TypeScript with ESLint configuration.

```bash
npm run lint
npm run lint:fix
```

## Production Checklist

- [ ] Configure Apple PassKit credentials and certificates
- [ ] Configure Google Cloud credentials for Google Wallet
- [ ] Set up Firebase Cloud Messaging for push notifications
- [ ] Configure database with proper indexes
- [ ] Set secure JWT_SECRET environment variable
- [ ] Enable HTTPS
- [ ] Set up monitoring and alerting
- [ ] Configure rate limiting
- [ ] Set up audit logging
- [ ] Test wallet integration with real devices

## Known Limitations

1. **Wallet Integration**: Currently mock implementation
   - Apple PassKit requires certificates and Apple Developer account
   - Google Wallet requires Google Cloud project setup
   - QR/barcode generation uses simplified format

2. **Notifications**: Currently mock implementation
   - Requires Firebase Cloud Messaging integration
   - Location-based notifications need geolocation service
   - Push token validation not fully implemented

3. **Database**: Requires Prisma migrations
   - Not yet connected to live database
   - Seeders for development only

## Next Steps

1. Database migration and connection
2. Apple Wallet and Google Wallet real integration
3. Firebase Cloud Messaging setup
4. Frontend implementation (React dashboard)
5. Customer mobile app
6. Enhanced QR/barcode generation with real libraries
7. Comprehensive test suite
8. Deployment and scaling

## Support

For issues or questions, refer to the main project documentation or contact the development team.
