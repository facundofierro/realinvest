# Quick Start Guide - Backend Package

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup PostgreSQL

```bash
# macOS (using Homebrew)
brew install postgresql@16
brew services start postgresql@16
createdb vest

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb vest

# Docker
docker run --name vest-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=vest -p 5432:5432 -d postgres:16
```

### 3. Configure Environment

Create `.env` files:

```bash
# packages/backend/.env
echo "DATABASE_URL=postgresql://localhost:5432/vest" > packages/backend/.env

# apps/wallet/.env
echo "DATABASE_URL=postgresql://localhost:5432/vest" > apps/wallet/.env
```

### 4. Setup Database

```bash
cd packages/backend
pnpm db:push
pnpm db:seed
```

### 5. Start Development Server

```bash
cd ../..
pnpm dev --filter wallet
```

Visit **http://localhost:8000** 🎉

---

## 📊 Verify Installation

### Check Database

Open Drizzle Studio:
```bash
cd packages/backend
pnpm db:studio
```

Visit http://localhost:4983

### Check API

Test a query:
```bash
curl http://localhost:8000/api/trpc/projects.getAll
```

---

## 🔧 Common Commands

```bash
# Development
pnpm dev --filter wallet          # Start wallet app
cd packages/backend && pnpm db:studio  # Open DB browser

# Database
cd packages/backend
pnpm db:push                      # Update schema
pnpm db:seed                      # Seed data
pnpm db:generate                  # Generate migrations
pnpm db:migrate                   # Run migrations

# Build
pnpm build                        # Build all packages
pnpm build --filter wallet        # Build wallet only
```

---

## 📁 What Was Created

### New Files

```
packages/backend/                  # New backend package
├── src/
│   ├── db/
│   │   ├── index.ts              ✅ Reactive DB
│   │   ├── schema.ts             ✅ Database schema
│   │   └── seed.ts               ✅ Seed script
│   ├── functions/
│   │   ├── projects.ts           ✅ Project queries
│   │   ├── market.ts             ✅ Market queries
│   │   ├── wallet.ts             ✅ Wallet queries
│   │   └── transactions.ts       ✅ Transaction queries
│   ├── router.ts                 ✅ tRPC router
│   ├── types.ts                  ✅ Shared types
│   └── index.ts                  ✅ Exports
├── package.json                  ✅
├── tsconfig.json                 ✅
├── drizzle.config.ts             ✅
├── README.md                     ✅
└── SETUP.md                      ✅

apps/wallet/src/
├── app/api/
│   ├── trpc/[trpc]/route.ts     ✅ tRPC endpoint
│   ├── events/route.ts           ✅ SSE stream
│   └── events/ack/route.ts       ✅ SSE ack
├── lib/trpc.ts                   ✅ tRPC setup
└── hooks/
    └── use-reactive-queries.ts   ✅ Reactive hooks
```

### Modified Files

```
apps/wallet/
├── package.json                  ✅ Added dependencies
├── src/
│   ├── components/providers.tsx  ✅ Added TrpcReactiveProvider
│   └── hooks/use-queries.ts      ✅ Migrated to useReactive
```

### Deleted Files

```
apps/wallet/src/app/api/
├── projects/route.ts             ❌ Removed
├── projects/[id]/route.ts        ❌ Removed
├── projects/[id]/...             ❌ All removed
├── dashboard/projects/route.ts   ❌ Removed
├── market/tokens/route.ts        ❌ Removed
├── market/orderbook/route.ts     ❌ Removed
├── market/series/route.ts        ❌ Removed
├── wallet/balances/route.ts      ❌ Removed
├── wallet/holdings/route.ts      ❌ Removed
├── wallet/positions/route.ts     ❌ Removed
└── transactions/route.ts         ❌ Removed
```

---

## 🧪 Test Your Setup

1. **Check the database has data:**
   ```bash
   cd packages/backend
   pnpm db:studio
   ```
   You should see tables with data.

2. **Check the app loads:**
   ```bash
   pnpm dev --filter wallet
   ```
   Visit http://localhost:8000

3. **Check real-time updates work:**
   - Open the app in two browser windows
   - Changes in one should reflect in the other

---

## ❓ Troubleshooting

### "Connection refused" error

PostgreSQL not running:
```bash
brew services start postgresql@16  # macOS
sudo systemctl start postgresql    # Linux
docker start vest-postgres         # Docker
```

### "Permission denied" error

Database user doesn't have permissions:
```bash
# Create a database with correct permissions
psql postgres
CREATE DATABASE vest;
GRANT ALL PRIVILEGES ON DATABASE vest TO your_username;
\q
```

### "Module not found" error

Dependencies not installed:
```bash
pnpm install
```

### "DATABASE_URL not found" error

Environment variables not set:
```bash
# Create .env files as shown in step 3
```

### SSE not working

Check that ports are open:
```bash
# Kill any process on port 8000
lsof -ti:8000 | xargs kill -9
```

---

## 📚 Learn More

- [Full Setup Guide](packages/backend/SETUP.md)
- [Implementation Summary](BACKEND_IMPLEMENTATION_SUMMARY.md)
- [agelum/backend Docs](agelum/context/agelum-backend.md)

---

## 🎯 Next Steps

1. **Set up authentication** - Replace hardcoded user ID
2. **Add mutations** - Implement create/update operations
3. **Production database** - Configure for deployment
4. **Monitoring** - Add logging and error tracking

---

**Happy coding!** 🚀
