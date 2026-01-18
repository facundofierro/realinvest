# Backend Package Setup Guide

This guide will help you set up and use the `@repo/backend` package with PostgreSQL and Drizzle ORM.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm package manager

## Installation

1. **Install dependencies** from the monorepo root:

```bash
pnpm install
```

2. **Set up environment variables**:

Create a `.env` file in both `packages/backend/` and `apps/wallet/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vest
```

Replace with your actual PostgreSQL connection string.

## Database Setup

1. **Generate the database schema**:

```bash
cd packages/backend
pnpm db:generate
```

2. **Run migrations**:

```bash
pnpm db:migrate
```

Or for development, you can push the schema directly:

```bash
pnpm db:push
```

3. **Seed the database** with sample data:

```bash
pnpm db:seed
```

This will populate your database with all the sample data from the JSON files.

## Development

### Database Management

- **Open Drizzle Studio**: `pnpm db:studio`
  - Visual database browser at http://localhost:4983

- **Generate migrations**: `pnpm db:generate`
  - After modifying schema.ts

- **Run migrations**: `pnpm db:migrate`
  - Apply pending migrations

- **Push schema**: `pnpm db:push`
  - Quick schema sync for development (bypasses migrations)

### Running the Wallet App

From the monorepo root:

```bash
pnpm dev --filter wallet
```

The app will be available at http://localhost:8000

## Architecture Overview

```
┌─────────────────┐
│   Wallet App    │
│   (Frontend)    │
└────────┬────────┘
         │ useReactive hooks
         ↓
┌─────────────────┐
│  tRPC Client    │
│  (React Query)  │
└────────┬────────┘
         │ HTTP + SSE
         ↓
┌─────────────────┐
│  tRPC Router    │
│ (API /api/trpc) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    Reactive     │
│    Functions    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Drizzle ORM    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```

## Key Features

### Real-time Updates via SSE

The backend automatically sends Server-Sent Events (SSE) when data changes. The frontend receives these events and automatically revalidates affected queries.

**Endpoints:**
- `/api/events` - SSE stream for real-time updates
- `/api/events/ack` - Acknowledge received events

### Reactive Functions

Functions are defined with dependencies that determine cache invalidation:

```typescript
export const getAllProjects = defineReactiveFunction({
  name: 'projects.getAll',
  input: z.object({ status: z.string().optional() }),
  dependencies: ['project'],
  handler: async (input, db) => {
    return db.db.query.projects.findMany()
  },
})
```

When the `projects` table changes, all queries depending on `project` are invalidated.

### Usage in Components

```typescript
import { useProjects } from '@/hooks/use-queries'

function ProjectList() {
  const { data: projects, isLoading, isStale } = useProjects()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {isStale && <div>Syncing...</div>}
      {projects?.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

## Available Queries

### Projects
- `useProjects()` - Get all projects
- `useProject(id)` - Get project by ID
- `useDashboardProjects()` - Get dashboard projects
- `useProjectUnits(projectId)` - Get units for a project
- `useProjectStories(projectId)` - Get stories for a project
- `useProjectStages(projectId)` - Get stages for a project
- `useProjectPurchaseOptions(projectId)` - Get purchase options

### Market
- `useMarketTokens()` - Get all market tokens
- `useMarketToken(symbol)` - Get token by symbol
- `useMarketOrderBook(symbol)` - Get orderbook for a token
- `useMarketSeries(symbol, timeframe)` - Get price series

### Wallet
- `useWalletBalances()` - Get user balances
- `useWalletHoldings()` - Get user holdings
- `useWalletPositions()` - Get user positions
- `useTransactions()` - Get user transactions

## Database Schema

The schema mirrors the wallet app types with these main tables:

- **projects** - Real estate projects
- **project_units** - Individual units in projects
- **project_stories** - Media stories for projects
- **project_stages** - Development stages
- **project_purchase_options** - Purchase configurations
- **market_tokens** - Tokenized units
- **wallet_balances** - User balances
- **holdings** - User token holdings
- **positions** - Open buy/sell orders
- **transactions** - Transaction history
- **orderbook_levels** - Market orderbook data
- **market_series** - Historical price data

## Troubleshooting

### Database connection fails

Check your `DATABASE_URL` in `.env` files. Ensure PostgreSQL is running.

### Migrations fail

Try pushing the schema directly for development:
```bash
pnpm db:push
```

### Real-time updates not working

1. Check that `/api/events` endpoint is accessible
2. Ensure the `TrpcReactiveProvider` is properly configured in `providers.tsx`
3. Verify the `organizationId` is set correctly

### Type errors

Ensure `@repo/backend` is properly built and exported. The `AppRouter` type should be available for import.

## Next Steps

1. Set up authentication to replace the default `userId`
2. Implement proper multi-tenancy with organization IDs
3. Add mutations for creating/updating data
4. Set up proper error handling and logging
5. Configure production database and environment variables

## Support

For issues or questions, refer to:
- [agelum/backend documentation](../../agelum/context/agelum-backend.md)
- [Drizzle ORM docs](https://orm.drizzle.team)
- [tRPC docs](https://trpc.io)
