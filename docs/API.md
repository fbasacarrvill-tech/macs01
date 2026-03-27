# API Documentation - TradingSystem

## Base URL
```
Development: http://localhost:3001/api
Production: https://api.tradingsystem.com/api
```

## Authentication
All endpoints (except auth) require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/register
Create a new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Trader"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Trader"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

---

### POST /auth/login
Authenticate user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

---

### POST /auth/refresh
Refresh access token

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

---

### POST /auth/logout
Logout user (invalidate refresh token)

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📊 Trades Endpoints

### GET /trades
List all trades with optional filters

**Query Parameters:**
```
?status=OPEN,CLOSED
?asset=AAPL,EURUSD
?strategy=Scalping
?startDate=2026-03-01
?endDate=2026-03-27
?page=1
?limit=20
?sort=-entryDate
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": "uuid",
        "asset": "AAPL",
        "direction": "LONG",
        "entryPrice": 150.23,
        "entryQuantity": 10,
        "exitPrice": 152.10,
        "exitQuantity": 10,
        "profitLoss": 187.00,
        "roi": 1.24,
        "status": "CLOSED",
        "createdAt": "2026-03-27T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

### GET /trades/:id
Get single trade details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "asset": "AAPL",
    "strategy": "Scalping",
    "direction": "LONG",
    "entryDate": "2026-03-27",
    "entryTime": "10:30",
    "entryPrice": 150.23,
    "entryQuantity": 10,
    "exitDate": "2026-03-27",
    "exitTime": "11:45",
    "exitPrice": 152.10,
    "exitQuantity": 10,
    "stopLoss": 148.50,
    "takeProfit": 155.00,
    "riskAmount": 17.30,
    "rewardAmount": 47.70,
    "riskRewardRatio": 2.75,
    "profitLoss": 187.00,
    "roi": 1.24,
    "status": "CLOSED",
    "notes": "Breakout trade on support level",
    "tags": "swing-trade,high-conviction",
    "createdAt": "2026-03-27T10:00:00Z",
    "updatedAt": "2026-03-27T11:50:00Z"
  }
}
```

---

### POST /trades
Create new trade

**Request:**
```json
{
  "assetId": "uuid",
  "strategyId": "uuid",
  "entryDate": "2026-03-27",
  "entryTime": "10:30",
  "entryPrice": 150.23,
  "entryQuantity": 10,
  "direction": "LONG",
  "stopLoss": 148.50,
  "takeProfit": 155.00,
  "notes": "Breakout trade"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "asset": "AAPL",
    "entryPrice": 150.23,
    "riskRewardRatio": 2.75,
    "status": "OPEN"
  }
}
```

---

### PUT /trades/:id
Update trade

**Request:**
```json
{
  "exitDate": "2026-03-27",
  "exitTime": "11:45",
  "exitPrice": 152.10,
  "exitQuantity": 10,
  "status": "CLOSED"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "profitLoss": 187.00,
    "roi": 1.24,
    "status": "CLOSED"
  }
}
```

---

### DELETE /trades/:id
Delete trade

**Response (200):**
```json
{
  "success": true,
  "message": "Trade deleted successfully"
}
```

---

## 📈 Analytics Endpoints

### GET /analytics/summary
Get overall performance summary

**Query Parameters:**
```
?period=day,week,month,year,all
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "trades": {
      "total": 23,
      "closed": 23,
      "open": 0,
      "winning": 14,
      "losing": 9
    },
    "performance": {
      "profitLoss": 2150.50,
      "winRate": 60.87,
      "averageWin": 153.61,
      "averageLoss": -238.94,
      "profitFactor": 2.15,
      "expectancy": 55.24
    },
    "risk": {
      "maxDrawdown": -12.5,
      "currentDrawdown": -8.5,
      "sharpeRatio": 1.45,
      "sortinoRatio": 1.89
    },
    "capital": {
      "initial": 10000,
      "current": 12150.50,
      "roi": 21.5
    }
  }
}
```

---

### GET /analytics/performance
Detailed performance breakdown

**Query Parameters:**
```
?startDate=2026-03-01
?endDate=2026-03-27
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "daily": [
      {
        "date": "2026-03-27",
        "trades": 3,
        "profitLoss": 450.00,
        "roi": 4.5,
        "capital": 12150.50
      }
    ],
    "weekly": [...],
    "summary": {...}
  }
}
```

---

### GET /analytics/by-asset
Performance breakdown by asset

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "asset": "AAPL",
      "trades": 8,
      "winning": 6,
      "losing": 2,
      "winRate": 75.0,
      "profitLoss": 450.00,
      "roi": 4.5,
      "averageWin": 85.25,
      "averageLoss": -125.00,
      "profitFactor": 2.5
    },
    {
      "asset": "EUR/USD",
      "trades": 7,
      "winning": 4,
      "losing": 3,
      "winRate": 57.14,
      "profitLoss": 225.00,
      "roi": 2.25
    }
  ]
}
```

---

### GET /analytics/by-strategy
Performance breakdown by strategy

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "strategy": "Scalping",
      "trades": 12,
      "winning": 9,
      "losing": 3,
      "winRate": 75.0,
      "profitLoss": 750.00,
      "roi": 7.5
    },
    {
      "strategy": "Swing Trading",
      "trades": 11,
      "winning": 5,
      "losing": 6,
      "winRate": 45.45,
      "profitLoss": 500.00,
      "roi": 5.0
    }
  ]
}
```

---

### GET /analytics/drawdown
Detailed drawdown analysis

**Response (200):**
```json
{
  "success": true,
  "data": {
    "current": -8.5,
    "maximum": -12.5,
    "recoveryDays": 8,
    "worstPeriod": {
      "startDate": "2026-03-15",
      "endDate": "2026-03-22",
      "drawdown": -12.5
    },
    "dailyHistory": [
      {
        "date": "2026-03-27",
        "capital": 12150.50,
        "peak": 12500.00,
        "drawdown": -8.5
      }
    ]
  }
}
```

---

## 📋 Assets Endpoints

### GET /assets
List all available assets

**Query Parameters:**
```
?type=STOCK,FOREX,CRYPTO
?search=AAPL
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "type": "STOCK",
      "exchange": "NASDAQ"
    },
    {
      "id": "uuid",
      "symbol": "EURUSD",
      "name": "Euro / US Dollar",
      "type": "FOREX"
    }
  ]
}
```

---

## 🎯 Strategies Endpoints

### GET /strategies
List user's strategies

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Scalping",
      "description": "High-frequency short-term trades",
      "riskPerTrade": 2.0,
      "targetRiskRewardRatio": 2.5,
      "isActive": true
    }
  ]
}
```

---

### POST /strategies
Create new strategy

**Request:**
```json
{
  "name": "Scalping",
  "description": "High-frequency short-term trades",
  "riskPerTrade": 2.0,
  "targetRiskRewardRatio": 2.5
}
```

---

## 👤 Users Endpoints

### GET /users/me
Get current user profile

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Trader",
    "timezone": "UTC",
    "preferredCurrency": "USD"
  }
}
```

---

### PUT /users/me
Update user profile

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Trader",
  "timezone": "America/New_York",
  "preferredCurrency": "USD"
}
```

---

### PUT /users/me/password
Change password

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

---

## 💳 Subscription Endpoints

### GET /subscription
Get user subscription status

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tier": "Pro",
    "price": 9.99,
    "billingPeriod": "monthly",
    "status": "active",
    "startDate": "2026-02-27",
    "renewalDate": "2026-04-27",
    "tradesPerMonth": null,
    "features": [
      "unlimited_trades",
      "advanced_analytics",
      "pdf_export"
    ]
  }
}
```

---

### POST /subscription/upgrade
Upgrade subscription tier

**Request:**
```json
{
  "tierId": "uuid"
}
```

---

## ⚙️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authentication token"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## 🔄 Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 204  | No Content |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 429  | Too Many Requests (Rate Limited) |
| 500  | Internal Server Error |

---

## 🚀 Rate Limiting

- **Free Plan:** 100 requests/hour
- **Pro Plan:** 1,000 requests/hour
- **Elite Plan:** Unlimited

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1648393200
```

---

## 📖 Pagination

Default page size: 20
Max page size: 100

Query parameters:
```
?page=1
?limit=50
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "pages": 5
  }
}
```

---

**API Version:** 1.0
**Last Updated:** 2026-03-27
