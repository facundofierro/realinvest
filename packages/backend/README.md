# @repo/backend

Backend package using @agelum/backend with PostgreSQL and Drizzle ORM.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/vest
```

3. Generate database schema:
```bash
pnpm db:generate
```

4. Run migrations:
```bash
pnpm db:migrate
```

5. Seed the database:
```bash
pnpm db:seed
```

## Development

- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:push` - Push schema changes to database (dev only)
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Run migrations
