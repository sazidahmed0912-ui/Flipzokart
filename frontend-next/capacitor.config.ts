import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flipzokart.app',
  appName: 'flipzokart',
  webDir: 'out',
  server: {
    // ✅ CORS fix: reports Origin as https://flipzokart.com (whitelisted on backend)
    hostname: 'flipzokart.com',
    androidScheme: 'https',
  },
  android: {
    // Allow all mixed content (avoids blocking of http sub-resources)
    allowMixedContent: true,
    // Capture console logs from WebView for debugging
    loggingBehavior: 'none',
    // Prevent WebView from capturing back button (let our app handle it)
    captureInput: false,
    // WebContentsDebuggingEnabled only in debug builds (set via AndroidManifest)
    webContentsDebuggingEnabled: false,
  },
};

export default config;

