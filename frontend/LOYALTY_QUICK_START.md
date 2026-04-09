# DevotioRewards - Quick Start Guide

Get up and running with DevotioRewards loyalty platform in 5 minutes.

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:3001/api/loyalty

## Installation

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/loyalty
NEXT_PUBLIC_APP_NAME=DevotioRewards
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000/loyalty](http://localhost:3000/loyalty)

## First-Time Setup

### For Business Owners

#### Option 1: Use Demo Credentials
1. Go to `/loyalty/login`
2. Email: `demo@coffeeshop.com`
3. Password: `anything` (demo accepts any password)
4. Click "Iniciar Sesión"

#### Option 2: Create New Account
1. Go to `/loyalty/register`
2. Fill in business details:
   - Business Name: `Mi Café`
   - Email: `mybusiness@email.com`
   - Password: (min 6 characters)
3. Click "Crear Cuenta"

### For Customers

1. Go to `/loyalty/programs`
2. Browse available programs
3. Click "Unirse" on any program
4. Fill in enrollment form
5. View card in `/loyalty/my-cards`

## Key Routes

### Business Owner Routes
- `/loyalty` - Landing page
- `/loyalty/login` - Login page
- `/loyalty/register` - Registration page
- `/loyalty/dashboard` - Main dashboard (protected)
- `/loyalty/programs/[id]` - Program detail (protected)

### Customer Routes
- `/loyalty/programs` - Browse programs (public)
- `/loyalty/programs/[id]/join` - Enroll in program (public)
- `/loyalty/my-cards` - View my cards (public)

## Common Tasks

### Create Your First Program

1. Login to dashboard
2. Click "✨ Crear Programa" tab
3. Fill form:
   ```
   Name: My Coffee Rewards
   Type: STAMPS
   Description: Get one free coffee for every 9 purchases
   Primary Color: #3B82F6
   Points Name: Stamps
   Expiration: 365 days
   ```
4. Click "Crear Programa"
5. You're redirected to dashboard with new program

### Add Customers to Program

Two methods:

#### Method 1: Manual Add
1. Open program detail
2. Click "👥 Clientes" tab
3. Click "➕ Agregar Cliente"
4. Fill form with customer details
5. Click "Agregar"

#### Method 2: Bulk Import
1. Open program detail
2. Click "👥 Clientes" tab
3. Click "📥 Importar CSV"
4. Paste customer data:
   ```
   juan@email.com,Juan,García,+34600123456,Madrid
   maria@email.com,María,López,+34600234567,Barcelona
   ```
5. Click "Importar"

### Scan a Card

1. Open program detail
2. Click "🔍 Escanear" tab
3. Enter card code or barcode/QR code
4. Choose action:
   - For STAMPS: "Agregar Sello"
   - For others: "Canjear Recompensa"
5. Transaction recorded in history

### View Analytics

1. Open program detail
2. Click "📊 Analytics" tab
3. View tabs:
   - **Overview**: KPI summary and engagement
   - **Segmentation**: Customer breakdown
   - **ROI**: Return on investment calculation
   - **Trends**: Daily metrics table

## API Integration Points

All API calls go through `loyaltyService` in `/services/loyalty.service.ts`

### Example: Create a Program
```typescript
const program = await loyaltyService.programAPI.createProgram({
  name: 'My Program',
  type: 'STAMPS',
  description: 'My loyalty program',
  pointsName: 'Stamps',
  maxPoints: 10,
  expirationDays: 365
})
```

### Example: Enroll Customer
```typescript
const card = await loyaltyService.customerAPI.enrollInProgram(programId, {
  firstName: 'Juan',
  lastName: 'García',
  email: 'juan@email.com',
  phone: '+34600123456',
  city: 'Madrid'
})
```

### Example: Scan Card
```typescript
const result = await loyaltyService.transactionAPI.scanCard(cardCode)
// Returns card details for transaction
```

## Understanding the Component Hierarchy

```
App
├── loyalty/layout
│   └── LoyaltyAuthProvider
│       ├── loyalty/ (landing)
│       ├── loyalty/login
│       ├── loyalty/register
│       ├── loyalty/dashboard
│       │   ├── ProgramsList
│       │   └── CreateProgramForm
│       ├── loyalty/programs (public)
│       ├── loyalty/programs/[id] (protected)
│       │   ├── ProgramDetail
│       │   ├── CardScanner
│       │   ├── CustomerManagement
│       │   └── AnalyticsDashboard
│       ├── loyalty/programs/[id]/join
│       └── loyalty/my-cards
│           └── CardVisualization
```

## Development Tips

### Check Authentication State
```typescript
const { isAuthenticated, user, loading } = useLoyaltyAuthContext()

if (loading) return <Spinner />
if (!isAuthenticated) return <LoginRedirect />

return <DashboardContent user={user} />
```

### Make API Calls
```typescript
const [data, setData] = useState(null)
const [error, setError] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  loyaltyService.programAPI
    .listPrograms()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false))
}, [])
```

### Format Data
```typescript
import { formatCurrency, formatDate, getProgramIcon } from '@/utils/loyalty.utils'

const price = formatCurrency(99.99)      // $99.99
const date = formatDate(new Date())      // 9 de abril de 2026
const icon = getProgramIcon('STAMPS')    // 🎫
```

## Debugging

### Enable Console Logging
Edit `services/loyalty.service.ts`:
```typescript
const response = await axios.get(url)
console.log('API Response:', response.data) // Add this
return response.data
```

### Check Local Storage
```javascript
// In browser console
localStorage.getItem('loyaltyAuth')  // View token
JSON.parse(localStorage.getItem('loyaltyAuth'))  // Pretty print
```

### Network Inspection
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "api"
4. Click requests to see details

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Not authenticated" | Token expired | Refresh page or logout/login |
| "Program not found" | Wrong program ID | Check URL, verify program exists |
| "CORS error" | Backend not configured | Check CORS settings in backend |
| "Failed to fetch" | Backend not running | Start backend server |
| "Invalid email" | Email validation failed | Use valid email format |

## Next Steps

1. ✅ Get frontend running
2. ✅ Test login/register
3. ✅ Create first program
4. ✅ Add customers
5. 🔜 [Deploy to production](./LOYALTY_README.md#deployment)

## Support

- [Full Documentation](./LOYALTY_README.md)
- [Backend API Docs](../backend/src/modules/loyalty/README.md)
- [Database Schema](../backend/src/modules/loyalty/prisma/schema.prisma)

---

**Estimated Time**: 5 minutes to first working program
**Difficulty**: Beginner-friendly
**Status**: ✅ Ready for development
