import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.realinvest.wallet',
  appName: 'Real Invest Wallet',
  webDir: '../../apps/wallet/out',
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
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
