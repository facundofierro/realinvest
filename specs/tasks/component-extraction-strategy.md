# Component Extraction Strategy for Native Builds

## Overview

This document outlines the strategy for extracting and reusing components from the Next.js wallet application for native desktop and mobile platforms using Tauri and Capacitor.

## Current Architecture

```
real-invest/
├── apps/
│   ├── wallet/          # Next.js web application (primary)
│   └── landing/         # Next.js landing page
├── native/
│   └── wallet/          # Native platform implementations
│       ├── tauri/       # Desktop apps (Windows, macOS, Linux)
│       ├── capacitor/   # Mobile apps (iOS, Android)
│       └── webview/     # Static Next.js build for native platforms
└── packages/
    └── ui/             # Shared UI components (existing)
```

## Component Sharing Approach

### Direct Export from Wallet App (Recommended ✅)

Instead of moving components to a separate packages folder, we export them directly from the wallet app using package.json exports:

```json
// apps/wallet/package.json
{
  "name": "@repo/wallet",
  "exports": {
    "./components/*": "./src/components/*",
    "./lib/*": "./src/lib/*",
    "./types/*": "./src/types/*",
    "./hooks/*": "./src/hooks/*"
  }
}
```

### Usage in Native Webview

```tsx
// native/wallet/webview/app/deposit/page.tsx
import { DepositPage } from "@repo/wallet/components/deposit-page";
import { useAuth } from "@repo/wallet/lib/auth";
import { WalletBalance } from "@repo/wallet/types/wallet";
import { usePortfolio } from "@repo/wallet/hooks/use-portfolio";

export default function Deposit() {
  return <DepositPage />;
}
```

### Keep App Router Thin (Required ✅)

The goal is for the App Router (`apps/wallet/src/app/**`) to contain minimal code so it can be mirrored in `native/wallet/webview` for static export without duplicating business logic or UI.

- `apps/wallet/src/app/**` should mostly be route wiring: `page.tsx` wrappers, `layout.tsx` wrappers, and route-level metadata.
- All substantial UI and page logic should live in `apps/wallet/src/components/**` (typically “page components” like `src/components/pages/**`), plus shared utilities in `src/lib/**`, `src/hooks/**`, and `src/types/**`.
- `native/wallet/webview/src/app/**` mirrors the route tree, but each route file is just a thin wrapper that imports from `@repo/wallet`.

Example pattern:

```tsx
// apps/wallet/src/app/(dashboard)/deposit/page.tsx
import { DepositPage } from "@/components/pages/deposit-page";

export default function Page() {
  return <DepositPage />;
}
```

```tsx
// native/wallet/webview/src/app/(dashboard)/deposit/page.tsx
import { DepositPage } from "@repo/wallet/components/pages/deposit-page";

export default function Page() {
  return <DepositPage />;
}
```

## Implementation Steps

### Phase 1: Wallet App Preparation (1-2 days)

1. **Update package.json exports**

   ```bash
   # Edit apps/wallet/package.json
   # Add exports field as shown above
   ```

2. **Refactor component structure**

   ```bash
   # Ensure all reusable components are in src/components/
   # Move any app-specific components to appropriate subdirectories
   ```

3. **Move App Router logic into components**

   ```bash
   # Keep src/app/** as thin wrappers only
   # Move page UI + logic into src/components/** (e.g. src/components/pages/**)
   ```

4. **Create barrel files**
   ```bash
   # Create src/components/index.ts
   # Export all reusable components
   ```

### Phase 2: Native Webview Setup (2-3 days)

1. **Create webview directory**

   ```bash
   mkdir -p native/wallet/webview
   cd native/wallet/webview
   ```

2. **Initialize Next.js app**

   ```bash
   pnpm init
   pnpm add next react react-dom @repo/wallet @repo/ui
   ```

3. **Configure package.json**

   ```json
   {
     "name": "@native/wallet-webview",
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "export": "next export"
     },
     "dependencies": {
       "next": "^14.0.0",
       "react": "^18.0.0",
       "react-dom": "^18.0.0",
       "@repo/wallet": "workspace:*",
       "@repo/ui": "workspace:*"
     }
   }
   ```

4. **Recreate app router structure**
   ```bash
   # Mirror the apps/wallet/src/app/ structure
   # But with minimal page components that import from @repo/wallet
   ```

### Phase 3: Platform Configuration (1 day)

1. **Update Tauri configuration**

   ```json
   // native/wallet/tauri/src-tauri/tauri.conf.json
   {
     "build": {
       "beforeDevCommand": "cd ../../../apps/wallet && npm run dev",
       "beforeBuildCommand": "cd ../../../apps/wallet && npm run build",
       "devPath": "http://localhost:3000",
       "distDir": "../../../apps/wallet/.next"
     }
   }
   ```

2. **Update Capacitor configuration**
   ```typescript
   // native/wallet/capacitor/capacitor.config.ts
   {
     "webDir": "../../../apps/wallet/.next"
   }
   ```

### Phase 4: Build Optimization (1-2 days)

1. **Configure static export**

   ```javascript
   // native/wallet/webview/next.config.js
   module.exports = {
     output: "export",
     trailingSlash: true,
     images: {
       unoptimized: true,
     },
   };
   ```

2. **Create build scripts**
   ```json
   // package.json scripts
   {
     "scripts": {
       "build:webview": "cd native/wallet/webview && npm run build",
       "build:tauri": "cd native/wallet/tauri && npm run tauri:build",
       "build:capacitor": "cd native/wallet/capacitor && npm run cap:sync"
     }
   }
   ```

## Advantages of This Approach

### ✅ Direct Component Exporting

- **No code duplication** - Components stay in their natural location
- **Hot reload works** - Changes reflect immediately across all platforms
- **Simpler build process** - No separate build steps for shared packages
- **Next.js compatibility** - No issues with Next.js-specific features
- **TypeScript support** - Full type checking without additional config

### ✅ Monorepo Benefits

- **Single dependency management** - PNPM workspaces handle shared deps
- **Unified CI/CD** - One pipeline for all platforms
- **Consistent tooling** - Same ESLint, Prettier, TypeScript configs
- **Easy refactoring** - Changes propagate across all consumers

### ✅ Performance Optimizations

- **Tree shaking** - Webpack eliminates unused code
- **Code splitting** - Automatic chunk optimization
- **Static generation** - Pre-rendered pages for native performance
- **Bundle analysis** - Easy to identify and fix bundle bloat

## Potential Challenges & Solutions

### 🔧 Challenge: API Route Differences

**Solution**: Platform detection and dependency injection

```typescript
// lib/platform.ts
export const getPlatform = () => {
  if (typeof window === "undefined")
    return "server";
  if (window.__TAURI__)
    return "desktop";
  if (window.Capacitor) return "mobile";
  return "web";
};

// API client with platform-specific implementations
const apiClient = {
  desktop: TauriApiClient,
  mobile: CapacitorApiClient,
  web: WebApiClient,
}[getPlatform()];
```

### 🔧 Challenge: Native-Specific UI

**Solution**: Component variants with platform props

```tsx
// components/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  platform?: 'desktop' | 'mobile' | 'web'
}

const Button = ({ variant = 'primary', platform }: ButtonProps) => {
  const styles = {
    desktop: /* desktop styles */,
    mobile: /* mobile touch-friendly */,
    web: /* web optimized */
  }[platform || getPlatform()]

  return <button className={styles}>{children}</button>
}
```

### 🔧 Challenge: Build Time Increases

**Solution**: Incremental builds and caching

```bash
# Use Turborepo for build caching
pnpm add -D turborepo

# Configure turbo.json
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    }
  }
}
```

## Testing Strategy

### Unit Testing

```bash
# Test shared components
pnpm test --filter @repo/wallet

# Test platform-specific implementations
pnpm test --filter @native/webview
```

### Integration Testing

```bash
# Test component integration across platforms
pnpm test:integration
```

### E2E Testing

```bash
# Platform-specific E2E tests
pnpm test:e2e:desktop
pnpm test:e2e:mobile
pnpm test:e2e:web
```

## Timeline & Milestones

### Week 1: Foundation

- [ ] Update wallet app package.json exports
- [ ] Create native webview structure
- [ ] Configure basic component imports

### Week 2: Integration

- [ ] Implement platform detection
- [ ] Set up build pipelines
- [ ] Test basic functionality across platforms

### Week 3: Optimization

- [ ] Implement static exports
- [ ] Configure performance optimizations
- [ ] Set up testing infrastructure

### Week 4: Polish

- [ ] Address platform-specific issues
- [ ] Optimize bundle size
- [ ] Document patterns and best practices

## Success Metrics

- ✅ 95%+ code reuse between web and native
- ✅ < 2s cold start time for native apps
- ✅ < 5MB initial bundle size for webview
- ✅ Consistent UI/UX across all platforms
- ✅ Hot reload working during development
- ✅ Full TypeScript coverage and type safety

## Conclusion

This component extraction strategy enables maximum code reuse while maintaining platform-specific optimizations. By exporting components directly from the wallet app and leveraging PNPM workspaces, we achieve:

1. **Development efficiency** - Write once, run everywhere
2. **Performance optimization** - Platform-specific builds
3. **Maintainability** - Single source of truth for components
4. **Scalability** - Easy to add new platforms or features
5. **Quality** - Consistent behavior across all deployment targets
