# Wallet Multiplatform Compilation - Implementation Plan

## Progress Summary

### ✅ Completed:

1. **Documentation**: Created comprehensive multiplatform strategy document
2. **Page Refactoring**: Converted server-side pages to minimal client-side wrappers
   - ✅ `exchange/[symbol]/page.tsx` - Minimal (passes symbol only)
   - ✅ `exchange/page.tsx` - Minimal
   - ✅ `(dashboard)/page.tsx` - Minimal
   - ✅ `invest/page.tsx` - Already minimal
   - ✅ `login/page.tsx` - Already minimal
   - ✅ `project/[id]/page.tsx` - Already minimal (params only)
   - ✅ `project/[id]/units/page.tsx` - Already minimal (params only)

3. **Component Refactoring**: Moved data fetching to client-side
   - ✅ `ExchangeDetailPage` - Now fetches via useEffect
   - ✅ `DashboardPage` - Now fetches via useEffect
   - ✅ `ExchangePage` - Now fetches via useEffect

### 🔄 Remaining Pages to Check:

- `(dashboard)/assets/page.tsx`
- `(dashboard)/chat/page.tsx`
- `(dashboard)/deposit/page.tsx`
- `(dashboard)/withdraw/page.tsx`

## Next Steps

### Phase 1: Complete Page Refactoring (📅 Now)

1. **Check remaining pages** - Verify they don't have server-side data fetching
2. **Test all refactored pages** - Ensure client-side fetching works correctly
3. **Add error boundaries** - Wrap pages with error handling for failed fetches

### Phase 2: Configure Next.js for Static Export (📅 Next)

Update `apps/wallet/next.config.ts` to enable static export:

```typescript
const nextConfig: NextConfig = {
  output: "export", // ← Add this!
  reactCompiler: true,
  transpilePackages: ["@repo/ui"],
  images: {
    unoptimized: true, // Already done ✅
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  trailingSlash: true, // ← Recommended for static export
};
```

### Phase 3: Create Native/Wallet/NextJS Directory (📅 After Phase 2)

**Option A: Same Codebase (Recommended for now)**

- Keep current structure
- Configure `apps/wallet` for static export directly
- Build once, use in both Capacitor and Tauri

**Option B: Separate Next.js App (For advanced customization)**

- Create `native/wallet/nextjs/` directory
- New Next.js project that imports components from `apps/wallet`
- Allows different configurations for native vs web

**Recommendation**: Start with Option A - it's simpler and follows your current architecture.

### Phase 4: Component Export Strategy (📅 If choosing Option B)

If creating a separate Next.js app in `native/wallet/nextjs`:

1. **Export all components** from `apps/wallet`:

```typescript
// apps/wallet/src/index.ts
export * from "./components/pages/dashboard-page";
export * from "./components/pages/exchange-page";
export * from "./components/pages/exchange-detail-page";
// ... etc
```

2. **Create new Next.js app** in `native/wallet/nextjs`:

```bash
cd native/wallet
pnpm create next-app nextjs --typescript --tailwind --app
```

3. **Import components** in native app:

```typescript
// native/wallet/nextjs/src/app/page.tsx
import { DashboardPage } from "@/../../apps/wallet/src/components/pages/dashboard-page";
```

### Phase 5: Build Configuration (📅 After confirming static export works)

1. **Update Capacitor config** (`native/wallet/capacitor/capacitor.config.ts`):

```typescript
const config: CapacitorConfig = {
  // ...
  webDir: "../../apps/wallet/out", // Already configured! ✅
  // ...
};
```

2. **Update Tauri config** (`native/wallet/tauri/src-tauri/tauri.conf.json`):

```json
{
  "build": {
    "distDir": "../../../apps/wallet/out",
    "devPath": "http://localhost:3000"
  }
}
```

3. **Add build scripts** to root `package.json`:

```json
{
  "scripts": {
    "build:web": "cd apps/wallet && pnpm build",
    "build:ios": "cd native/wallet/capacitor && pnpm cap sync ios && pnpm cap open ios",
    "build:android": "cd native/wallet/capacitor && pnpm cap sync android && pnpm cap open android",
    "build:desktop": "cd native/wallet/tauri && pnpm tauri build",
    "build:all": "pnpm build:web && pnpm build:ios && pnpm build:android && pnpm build:desktop"
  }
}
```

### Phase 6: Testing & Validation (📅 Final)

1. **Web Build Test**:

```bash
cd apps/wallet
pnpm build
# Check that apps/wallet/out exists with static files
```

2. **Mobile Build Test** (iOS):

```bash
cd native/wallet/capacitor
pnpm cap sync ios
pnpm cap open ios
# Build in Xcode
```

3. **Mobile Build Test** (Android):

```bash
cd native/wallet/capacitor
pnpm cap sync android
pnpm cap open android
# Build in Android Studio
```

4. **Desktop Build Test**:

```bash
cd native/wallet/tauri
pnpm tauri dev  # Test in dev mode first
pnpm tauri build  # Build production bundle
```

## Known Issues to Address

### 1. Dynamic Routes

Dynamic routes like `exchange/[symbol]` and `project/[id]` may need special handling:

- Consider using `generateStaticParams` for known routes
- Or use client-side routing with hash-based navigation

### 2. API Calls in Static Export

- All API calls are now client-side ✅
- Ensure API endpoints are accessible from native apps
- Consider environment variables for different environments

### 3. Navigation

- Test back/forward navigation in native apps
- May need to use hash-based routing (#/exchange instead of /exchange)
- Update all Link components if needed

## Alternative Approach: Component Library

If the current approach proves complex, consider:

1. Convert `apps/wallet/src/components` into a shared library
2. Create separate Next.js apps for:
   - `apps/wallet-web` - Standard Next.js (SSR, ISR, etc.)
   - `apps/wallet-native` - Static export for native
3. Both import from the shared component library

## Commands Reference

```bash
# Current development
pnpm dev  # From apps/wallet

# Build static export (after configuration)
pnpm build  # From apps/wallet - will generate 'out' directory

# Mobile development
pnpm cap sync  # Sync web assets to native projects
pnpm cap run ios  # Run on iOS simulator
pnpm cap run android  # Run on Android emulator

# Desktop development
pnpm tauri dev  # From native/wallet/tauri
pnpm tauri build  # Build production app

# Production builds
pnpm build:all  # Build everything
```

## Decision Points Needed

1. **Architecture**:
   - [ ] Option A: Use current `apps/wallet` with static export
   - [ ] Option B: Create separate `native/wallet/nextjs` app

2. **Routing Strategy**:
   - [ ] Keep current routing with generateStaticParams
   - [ ] Switch to hash-based routing for native compatibility

3. **API Strategy**:
   - [ ] Keep current API structure
   - [ ] Create separate API endpoint for native apps

## Next Immediate Action

**Before proceeding further**, we should:

1. ✅ Finish checking remaining pages (assets, chat, deposit, withdraw)
2. ✅ Test current changes in development
3. ⚠️ **DECIDE**: Option A (simpler) vs Option B (more flexible)
4. ⚠️ Configure Next.js for static export
5. ⚠️ Test static build locally
6. ⚠️ Test with Capacitor/Tauri

**Current Status**: Ready to configure for static export and test!
