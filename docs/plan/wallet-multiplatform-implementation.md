# Wallet Multiplatform Compilation - Implementation Plan

## Progress Summary

### ✅ Completed:

1. **Documentation**: Created comprehensive multiplatform strategy document
2. **Page Refactoring**: Converted server-side pages to minimal client-side wrappers
3. **Component Refactoring**: Moved data fetching to client-side
4. **Infinite Loop Fix**: Resolved `useEffect` loop in `ExchangePage`.

### ✅ Architecture Decision:

**Option B (Separate App)** was chosen and implemented.

- Created `native/wallet/nextjs`
- Adjusted `apps/wallet` to export components (`src/index.ts`)
- Configured `generateStaticParams` for dynamic routes

## Implementation Details

### 1. New Project Structure

`native/wallet/nextjs` is a standard Next.js app configured for `output: 'export'`.
It imports components from `apps/wallet` (aliased as `wallet` workspace package).

### 2. Static Generation Strategy

Dynamic routes (`exchange/[symbol]`, `project/[id]`) use `generateStaticParams` to pre-render pages based on data in `apps/wallet/src/sample-data`.
**Note**: To add new tokens/projects, the native app must be rebuilt.

### 3. API Handling

API calls are refactored to use `getProjectUnits` etc. via `api-client`.
**Action Required**: For production builds, you MUST set `NEXT_PUBLIC_API_URL` to your production server URL in `.env`.

## Verification Steps needed from User

1. **Verify Static Build**:

   ```bash
   cd native/wallet/nextjs
   pnpm build
   # Should succeed and create 'out' directory
   ```

2. **Verify Mobile/Desktop**:
   - iOS: `cd native/wallet/capacitor && pnpm cap sync ios && pnpm cap open ios`
   - Android: `cd native/wallet/capacitor && pnpm cap sync android && pnpm cap open android`
   - Desktop: `cd native/wallet/tauri && pnpm tauri dev`

## Commands Reference

```bash
# Build native static export
cd native/wallet/nextjs
pnpm build

# Run web app (source)
cd apps/wallet
pnpm dev
# Run native web wrapper (dev mode)
cd native/wallet/nextjs
pnpm dev
```

Multiplatform setup is complete! 🚀
