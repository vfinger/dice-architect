import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.byeonggyunoh.dicearchitect',
  appName: '주사위 던전 건축가',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#070a12',
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: false,
    preferredContentMode: 'mobile',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#070a12',
    },
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#070a12',
      showSpinner: false,
    },
  },
};

export default config;
