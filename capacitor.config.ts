import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'telefunken-app',
  webDir: 'dist/telefunken-app/browser',
  server: {
    androidScheme: "https",
    allowNavigation: ['https://tesis.apps-sebas.org']
  }
};

export default config;
