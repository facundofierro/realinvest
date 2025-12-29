# Real Invest Wallet - Multiplatform Strategy

## **Overview**

This document outlines the strategy for porting the Real Invest Wallet Next.js web application to native desktop and mobile platforms while maintaining a single codebase. The approach leverages modern cross-platform frameworks to target:

- **Desktop**: Windows, macOS, Linux via Tauri
- **Mobile**: iOS and Android via Capacitor
- **Web**: Next.js (existing implementation)

## **Architecture Strategy**

### **Core Principles**

1. **Single Codebase**: Maintain one React/Next.js codebase for all platforms
2. **Platform Abstraction**: Use conditional logic for platform-specific features
3. **Progressive Enhancement**: Web-first, with native capabilities added where beneficial
4. **Consistent UI**: Shared design system across all platforms

### **Project Structure**

```
real-invest/
├── apps/
│   ├── wallet/          # Next.js web application (primary)
│   └── landing/         # Next.js landing page
├── native/             # Native platform implementations
│   └── wallet/          # Wallet application native implementations
│       ├── tauri/       # Desktop apps (Windows, macOS, Linux)
│       ├── capacitor/   # Mobile apps (iOS, Android)
│       └── webview/     # Static Next.js build for native platforms
└── packages/
    └── ui/             # Shared UI components (existing)
```

## **Tauri Implementation (Desktop)**

### **Setup & Configuration**

**File: `native/wallet/tauri/`**

1. **Tauri Configuration** (`src-tauri/tauri.conf.json`):

```json
{
  "build": {
    "beforeDevCommand": "cd ../../apps/wallet && npm run dev",
    "beforeBuildCommand": "cd ../../../apps/wallet && npm run build",
    "devPath": "http://localhost:3000",
    "distDir": "../../../apps/wallet/.next"
  },
  "package": {
    "productName": "Real Invest Wallet",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "http": {
        "all": false,
        "request": true,
        "scope": ["https://*.*"]
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.realinvest.wallet",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "Real Invest Wallet",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

### **Desktop-Specific Enhancements**

1. **Native Menu Integration**:

2. **File System Access** (for export functionality):

## **Capacitor Implementation (Mobile)**

### **Setup & Configuration**

**File: `native/wallet/capacitor/`**

1. **Capacitor Configuration** (`capacitor.config.ts`):

```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.realinvest.wallet",
  appName: "Real Invest Wallet",
  webDir: "../../../apps/wallet/.next",
  bundledWebRuntime: false,
  ios: {
    scheme: "RealInvestWallet",
    backgroundColor: "#000000",
    scrollEnabled: false,
  },
  android: {
    backgroundColor: "#000000",
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName:
        "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
```

### **Mobile-Specific Enhancements**

1. **Touch & Gesture Support**:

2. **Native Device Features**:

## **Build & Deployment Process**

### **Development Workflow**

1. **Web Development** (primary):

```bash
cd apps/wallet
npm run dev
```

2. **Desktop Build** (Tauri):

```bash
cd native/wallet/tauri
npm run tauri:dev    # Development with hot reload
npm run tauri:build  # Production build
```

3. **Mobile Build** (Capacitor):

```bash
cd native/wallet/capacitor
npm run cap:sync     # Sync web assets
npm run cap:ios      # Build for iOS
npm run cap:android  # Build for Android
```

### **CI/CD Pipeline**

**GitHub Actions Workflow** (`.github/workflows/build.yml`):

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os:
          [
            ubuntu-latest,
            macos-latest,
            windows-latest,
          ]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build web application
        run: cd apps/wallet && npm run build

      - name: Build Tauri (desktop)
        if: matrix.os == 'ubuntu-latest'
        run: cd native/tauri && npm run tauri:build

      - name: Build Capacitor (mobile)
        if: matrix.os == 'macos-latest'
        run: |
          cd native/capacitor
          npm run cap:sync
          npm run cap:build:ios
```

## **Platform-Specific Considerations**

### **Desktop (Tauri)**

**Advantages**:

- Native window management
- File system access
- System tray integration
- Better performance for complex data operations

**Challenges**:

- Multiple platform builds required
- App store distribution
- Auto-update mechanisms

### **Mobile (Capacitor)**

**Advantages**:

- App store distribution
- Native device features (camera, biometrics, etc.)
- Offline capabilities
- Push notifications

**Challenges**:

- App store review process
- Platform-specific UI guidelines
- Battery consumption optimization

### **Web (Next.js)**

**Advantages**:

- Instant deployment
- No installation required
- Cross-platform compatibility
- SEO benefits

**Challenges**:

- Limited native capabilities
- Browser compatibility
- Performance constraints

## **Shared Code Strategy**

### **Component Sharing Approach**

**Direct Export from Wallet App**:

```json
// apps/wallet/package.json
{
  "name": "@repo/wallet",
  "exports": {
    "./components/*": "./src/components/*",
    "./lib/*": "./src/lib/*",
    "./types/*": "./src/types/*"
  }
}
```

**Usage in Native Webview**:

```tsx
// native/wallet/webview/app/deposit/page.tsx
import { DepositPage } from "@repo/wallet/components/deposit-page";
import { useAuth } from "@repo/wallet/lib/auth";
import { WalletBalance } from "@repo/wallet/types/wallet";

export default function Deposit() {
  return <DepositPage />;
}
```

### **Platform Detection**

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

export const usePlatform = () => {
  const [platform, setPlatform] =
    useState<
      | "desktop"
      | "mobile"
      | "web"
      | "server"
    >("server");

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  return platform;
};
```

### **Conditional Feature Implementation**

```typescript
// Example: Platform-specific export functionality
const ExportButton = () => {
  const platform = usePlatform();

  const handleExport = async () => {
    const data = await generateExportData();

    switch (platform) {
      case 'desktop':
        await exportToFileSystem(data); // Tauri file API
        break;
      case 'mobile':
        await shareViaNativeShare(data); // Capacitor Share API
        break;
      case 'web':
        downloadAsFile(data); // Web download
        break;
    }
  };

  return (
    <Button onClick={handleExport}>
      {platform === 'mobile' ? 'Share' : 'Export'}
    </Button>
  );
};
```

## **Testing Strategy**

### **Platform-Specific Testing**

1. **Web**: Jest + React Testing Library + Playwright
2. **Desktop**: Tauri test utils + platform-specific UI testing
3. **Mobile**: Capacitor test utils + Appium for cross-platform testing

### **Continuous Testing**

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run web tests
        run: cd apps/wallet && npm test

      - name: Run UI tests
        run: npm run test:ui
```

## **Roadmap & Timeline**

### **Phase 1: Desktop (Tauri) - 2-3 weeks**

- [x] Setup Tauri project structure
- [ ] Configure build pipeline
- [ ] Implement desktop-specific enhancements
- [ ] Testing and validation

### **Phase 2: Mobile (Capacitor) - 3-4 weeks**

- [x] Setup Capacitor project structure
- [ ] Configure mobile build pipeline
- [ ] Implement mobile-specific UI/UX
- [ ] App store preparation

### **Phase 3: Optimization - 2 weeks**

- [ ] Performance optimization
- [ ] Cross-platform testing
- [ ] Documentation
- [ ] Deployment automation

## **Conclusion**

This multiplatform strategy allows us to leverage the existing Next.js investment while expanding to native desktop and mobile platforms. The approach minimizes code duplication while maximizing platform-specific advantages. The key to success is maintaining a clean separation between platform-agnostic business logic and platform-specific implementations.
