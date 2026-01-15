# Wallet Multiplatform Compilation Strategy

## Overview

This document outlines the multiplatform compilation strategy for the Real Invest wallet application within our monorepo. The strategy leverages a **single codebase** approach where a Next.js web application is wrapped with native platform capabilities using two complementary technologies:

- **Capacitor** for mobile platforms (iOS & Android)
- **Tauri** for desktop platforms (macOS, Windows, Linux)

## Architecture

### Monorepo Structure

```
real-invest/
├── apps/
│   └── wallet/              # Next.js web application (source of truth)
├── native/
│   └── wallet/
│       ├── capacitor/       # Mobile wrapper (iOS & Android)
│       └── tauri/           # Desktop wrapper (macOS, Windows, Linux)
└── packages/
    └── ui/                  # Shared UI components
```

### Core Principles

1. **Single Source of Truth**: The `apps/wallet` Next.js application is the primary codebase
2. **Static Export**: Next.js builds to static HTML/CSS/JS for maximum compatibility
3. **Native Wrappers**: Platform-specific wrappers consume the static build
4. **Shared Dependencies**: Common UI components via `@repo/ui` workspace package
5. **Isolated Native Configs**: Platform-specific configurations remain separate

## Technology Stack

### Web Layer (apps/wallet)

- **Framework**: Next.js 16.1.1 with React 19.2.3
- **Styling**: Tailwind CSS v4 with custom animations
- **Build Output**: Static export (`next build` → `out/` directory)
- **Compiler**: React Compiler enabled for optimization
- **Image Handling**: Unoptimized images for native compatibility

### Mobile Layer (native/wallet/capacitor)

- **Technology**: Capacitor 6.0
- **Platforms**: iOS & Android
- **App ID**: `com.realinvest.wallet`
- **App Name**: Real Invest Wallet
- **Web Directory**: Points to `../../apps/wallet/out`

**Key Features**:

- Custom splash screen configuration
- Dark theme support (`#000000` background)
- iOS scheme: `RealInvestWallet`
- Mixed content support for Android
- Full-screen immersive experience

### Desktop Layer (native/wallet/tauri)

- **Technology**: Tauri 2.9.5
- **Platforms**: macOS, Windows, Linux
- **Backend**: Rust (edition 2021, min version 1.77.2)
- **Build Types**: staticlib, cdylib, rlib

**Key Features**:

- Lightweight native binary
- System-level integrations
- Secure Rust backend
- Cross-platform desktop support

## Build Process

### 1. Web Application Build

```bash
# From apps/wallet
pnpm build
```

**Output**: Static files in `apps/wallet/out/`

**Configuration**:

- Static HTML export (no server-side rendering)
- Unoptimized images for native compatibility
- Transpiled workspace packages (`@repo/ui`)
- React compiler optimizations

### 2. Mobile Build (Capacitor)

```bash
# From native/wallet/capacitor

# Sync web assets to native projects
pnpm cap sync

# iOS
pnpm cap open ios
# Build from Xcode

# Android
pnpm cap open android
# Build from Android Studio
```

**Process**:

1. Next.js builds to `apps/wallet/out/`
2. Capacitor copies static files to native projects
3. Native IDEs compile platform-specific binaries
4. Result: `.ipa` (iOS) or `.apk/.aab` (Android)

### 3. Desktop Build (Tauri)

```bash
# From native/wallet/tauri
pnpm tauri build
```

**Process**:

1. Next.js builds to `apps/wallet/out/`
2. Tauri bundles static files with Rust backend
3. Platform-specific compilation
4. Result: Native executables (`.app`, `.exe`, `.AppImage`)

## Platform-Specific Configurations

### iOS (Capacitor)

```typescript
ios: {
  scheme: "RealInvestWallet",
  backgroundColor: "#000000",
  scrollEnabled: false,
}
```

- Custom URL scheme for deep linking
- Dark background matching app theme
- Disabled scroll for native feel

### Android (Capacitor)

```typescript
android: {
  backgroundColor: "#000000",
  allowMixedContent: true,
}
```

- Dark background consistency
- Mixed content support for flexibility

### Splash Screen (Mobile)

```typescript
SplashScreen: {
  launchShowDuration: 3000,
  launchAutoHide: true,
  backgroundColor: "#000000",
  androidSplashResourceName: "splash",
  androidScaleType: "CENTER_CROP",
  showSpinner: false,
  splashFullScreen: true,
  splashImmersive: true,
}
```

### Desktop (Tauri)

- Rust backend for system integrations
- Multiple crate types for flexibility
- Logging via `tauri-plugin-log`
- JSON serialization for IPC

## Development Workflow

### Local Development

```bash
# Web development (hot reload)
cd apps/wallet
pnpm dev

# Mobile development
cd native/wallet/capacitor
pnpm cap sync
pnpm cap run ios    # or android

# Desktop development
cd native/wallet/tauri
pnpm tauri dev
```

### Testing Strategy

1. **Web**: Test in browser first (fastest iteration)
2. **Mobile**: Use Capacitor live reload for rapid testing
3. **Desktop**: Use Tauri dev mode for quick validation
4. **Production**: Build and test native binaries before release

## Advantages of This Approach

### Code Reuse

- **~95% code sharing** across all platforms
- Single UI/UX implementation
- Shared business logic
- Unified styling system

### Maintenance

- Fix bugs once, deploy everywhere
- Consistent feature parity
- Simplified dependency management
- Centralized testing

### Performance

- Static export = fast load times
- Native wrappers = platform optimizations
- React compiler = runtime performance
- Tauri's Rust backend = minimal overhead

### Developer Experience

- Familiar web technologies
- Hot reload during development
- TypeScript across the stack
- Monorepo tooling (Turborepo)

## Challenges & Solutions

### Challenge: Platform-Specific Features

**Solution**: Use Capacitor/Tauri plugins for native capabilities

- Camera, geolocation, push notifications via Capacitor
- File system, system tray via Tauri
- Conditional feature detection in code

### Challenge: Build Coordination

**Solution**: Turborepo task orchestration

- Define build dependencies in `turbo.json`
- Cache web builds for faster native builds
- Parallel builds where possible

### Challenge: Asset Optimization

**Solution**: Unoptimized images + manual optimization

- Next.js image optimization disabled
- Manual asset preparation for native
- Platform-specific asset variants when needed

### Challenge: Navigation & Routing

**Solution**: Hash-based routing for native compatibility

- Static export requires client-side routing
- Deep linking via custom URL schemes
- State management for navigation

## Future Considerations

### Progressive Web App (PWA)

- Add PWA support for web distribution
- Service workers for offline capability
- Install prompts for web users

### Code Splitting

- Evaluate dynamic imports for large apps
- Balance bundle size vs. request count
- Platform-specific code splitting

### Native Modules

- Identify features requiring native code
- Create Capacitor plugins as needed
- Rust modules for Tauri-specific features

### CI/CD Pipeline

- Automated builds for all platforms
- Code signing for iOS/macOS
- Play Store/App Store deployment
- Auto-update mechanisms

## Conclusion

This multiplatform strategy provides a robust foundation for delivering the Real Invest wallet across mobile and desktop platforms while maintaining a single, web-based codebase. The combination of Capacitor and Tauri offers the best of both worlds: rapid web development with native platform capabilities.

The `native/` directory serves as the bridge between our web application and platform-specific requirements, keeping native configurations isolated while leveraging the power of modern web technologies.
