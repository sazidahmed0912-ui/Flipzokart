import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flipzokart.app',
  appName: 'flipzokart',
  webDir: 'out',
  server: {
    // ✅ THE DEFINITIVE CORS FIX:
    // By setting hostname to 'flipzokart.com' and androidScheme to 'https',
    // the Android WebView reports Origin: https://flipzokart.com
    // This is ALREADY in the backend CORS whitelist — no Render redeployment needed!
    // Without this, Android sends Origin: capacitor://localhost which is NOT allowed.
    hostname: 'flipzokart.com',
    androidScheme: 'https',
  }
};

export default config;
