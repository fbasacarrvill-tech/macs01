# Setup & Installation Guide

## Prerequisites

- **Node.js:** 18.0.0 or higher
- **npm or yarn:** Latest version
- **Docker:** (for PostgreSQL & Redis locally)
- **Git:** For version control

---

## 🚀 Quick Start (Development)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd trading-system
```

### 2. Install Dependencies
```bash
# Root
npm install

# Or if using yarn
yarn install
```

### 3. Setup Environment Variables
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

Required variables:
```
DATABASE_URL="postgresql://trading_user:trading_password@localhost:5432/trading_system"
JWT_SECRET="your-secret-key-here"
REDIS_URL="redis://localhost:6379"
```

### 4. Start Services with Docker
```bash
# Start PostgreSQL & Redis
docker-compose up -d

# Verify services are running
docker ps
```

### 5. Setup Database
```bash
# Navigate to backend
cd backend

# Push schema to database
npx prisma db push

# (Optional) Seed with example data
npx prisma db seed
```

### 6. Start Development Servers
```bash
# From root directory, start both frontend & backend
npm run dev

# Or start them separately:

# Terminal 1 - Backend
cd backend
npm run dev
# Should see: Server running on http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm run dev
# Should see: Ready on http://localhost:3000
```

### 7. Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

---

## 📝 Create Your First User

### Via API (curl)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "TestPassword123!",
    "firstName": "John",
    "lastName": "Trader"
  }'
```

### Via Frontend
1. Go to http://localhost:3000
2. Click "Register"
3. Fill in form
4. Click "Create Account"

---

## 🔧 Backend Setup Details

### 1. Environment Setup
```bash
cd backend
cp ../.env.local .env
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Create/update database schema
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed database with example data
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```

**Expected output:**
```
[14:32:45] Starting HTTP server on port 3001
[14:32:46] Prisma Client initialized
[14:32:47] Connected to Redis
Server running on http://localhost:3001
```

### 5. Verify Backend
```bash
# Check health
curl http://localhost:3001/api/health

# Should return:
# { "status": "ok" }
```

---

## 🎨 Frontend Setup Details

### 1. Environment Setup
```bash
cd frontend
cp ../.env.local .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.1s
```

### 4. Verify Frontend
Open http://localhost:3000 in your browser

---

## 📦 Project Structure

```
trading-system/
├── frontend/                 # React Next.js app
│   ├── app/                 # Pages & layouts
│   ├── components/          # Reusable components
│   ├── hooks/               # Custom hooks
│   ├── services/            # API services
│   ├── types/               # TypeScript types
│   └── package.json
│
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed script
│   └── package.json
│
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md      # Technical architecture
│   ├── DATABASE.md          # Database design
│   ├── METRICS.md           # Metrics & formulas
│   ├── API.md               # API documentation
│   └── UI-WIREFRAMES.md     # UI/UX design
│
├── docker-compose.yml       # Docker services
├── .env.example             # Environment template
├── ROADMAP.md              # Development roadmap
├── package.json            # Root workspace
└── README.md               # Project overview
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Build Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if Docker is running
docker ps

# Check PostgreSQL logs
docker logs trading_postgres

# Connection string should be:
# postgresql://trading_user:trading_password@localhost:5432/trading_system
```

### Redis Connection Error
```bash
# Check if Redis is running
docker ps

# Test connection
redis-cli ping
# Should return: PONG
```

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5432 | xargs kill -9  # PostgreSQL
lsof -ti:6379 | xargs kill -9  # Redis
```

### Database Schema Mismatch
```bash
cd backend

# Reset and recreate database
npx prisma migrate reset

# Or push changes
npx prisma db push
```

### Turbo Cache Issues
```bash
# Clear turbo cache
npm run build -- --force
```

---

## 📚 Useful Commands

### Database Management
```bash
# View database
npx prisma studio

# Create migration
npx prisma migrate dev --name add_new_field

# View migrations
npx prisma migrate status

# Reset database (⚠️ deletes data)
npx prisma migrate reset
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/trading-system-analysis-ekCIx

# Make changes
git add .

# Commit
git commit -m "feat: Add trade metrics calculation"

# Push
git push -u origin feature/trading-system-analysis-ekCIx
```

### Linting & Formatting
```bash
# Lint all code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

---

## 🚀 Deployment (Production)

### Backend (Railway/Render)
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables in dashboard
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy

---

## 📖 Next Steps

1. **Read Documentation:**
   - `docs/ARCHITECTURE.md` - Technical details
   - `docs/DATABASE.md` - Database schema
   - `docs/API.md` - API endpoints

2. **Explore Code:**
   - Start with `backend/src/server.ts`
   - Then `frontend/app/page.tsx`

3. **Run Examples:**
   - Create your first user
   - Add a test trade
   - View analytics

4. **Start Development:**
   - Follow `ROADMAP.md` for features
   - Pick a task from MVP phase
   - Create a feature branch
   - Make changes and test

---

## 🤝 Contributing

1. Create feature branch from `develop`
2. Make changes with clear commits
3. Test thoroughly
4. Push to branch
5. Create Pull Request

---

## 📞 Support

For issues or questions:
1. Check GitHub Issues
2. Review Documentation
3. Ask in Discussions

---

**Last Updated:** 2026-03-27
