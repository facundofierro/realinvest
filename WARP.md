# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

This is a Turborepo monorepo for a real estate investment platform with multiple applications and packages:

### Applications
- **`apps/landing`**: Next.js landing page application
- **`apps/wallet`**: Main Next.js wallet application with financial data and investment features
- **`native/wallet/nextjs`**: Native-optimized Next.js build for mobile apps
- **`native/wallet/capacitor`**: Capacitor mobile app wrapper (iOS/Android)
- **`native/wallet/tauri`**: Tauri desktop app wrapper

### Packages
- **`packages/ui`**: Shared React component library with Radix UI, shadcn/ui components, and Tailwind CSS
- **`packages/eslint-config`**: Shared ESLint configurations
- **`packages/typescript-config`**: Shared TypeScript configurations

## Development Commands

Use `pnpm` for all package management operations.

### Core Development
```bash
# Start all applications in development mode
pnpm dev

# Start specific application
pnpm dev --filter landing
pnpm dev --filter wallet
pnpm dev --filter wallet-native

# Build all applications and packages
pnpm build

# Build specific application
pnpm build --filter wallet

# Lint all code
pnpm lint

# Type checking
pnpm check-types

# Format code
pnpm format
```

### Native App Development
```bash
# Capacitor mobile development
cd native/wallet/capacitor
pnpm cap run ios
pnpm cap run android
pnpm cap sync

# Tauri desktop development
cd native/wallet/tauri
pnpm tauri dev
pnpm tauri build
```

### Component Development
```bash
# Generate new UI component
cd packages/ui
pnpm generate:component
```

## Architecture

### Monorepo Structure
- Uses Turborepo for build orchestration and caching
- pnpm workspaces for dependency management
- Shared packages provide consistency across applications

### Application Architecture
- **Wallet App**: Full-featured investment platform with API routes, sample data system, and React Query for state management
- **Landing App**: Marketing/landing page with minimal dependencies
- **Native Apps**: Share wallet codebase through workspace dependencies, with platform-specific wrappers

### Key Technical Decisions
- **UI Framework**: React 19 with Next.js 16.1.1 and Tailwind CSS
- **Component System**: Radix UI primitives with shadcn/ui patterns in shared `@repo/ui` package
- **State Management**: React Query (TanStack Query) for server state
- **Styling**: Tailwind CSS with custom design system
- **Mobile Strategy**: Capacitor for native mobile, Tauri for desktop, sharing web codebase
- **Mock Data**: Sample JSON files in `apps/wallet/src/sample-data/` for development and testing

### Sample Data System
The wallet app uses a sophisticated mock data system:
- Sample JSON files in `src/sample-data/` directory contain fixtures for market data, transactions, user balances, etc.
- API routes automatically fall back to generating mock data when sample data isn't available
- Environment variable `RIPIO_MOCK_DATA_DIR` can override data directory location

### Native App Build Process
1. **Next.js Build**: Native NextJS app builds static export to `out/` directory
2. **Capacitor**: References NextJS output via `webDir: '../nextjs/out'` in capacitor.config.ts
3. **Tauri**: Uses similar static build approach for desktop distribution

## Environment Variables

Global environment variables configured in `turbo.json`:
- `HOST`: Development server host
- `LOG_LEVEL`: Application logging level
- `PORT`: Development server port
- `RIPIO_MOCK_DATA_DIR`: Override directory for mock data files
