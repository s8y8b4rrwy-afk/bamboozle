# Capacitor & Android Setup Guide

## Overview

Bamboozle is already a React + Vite web app. Capacitor wraps it as a native Android app with access to native APIs (like Google Play Billing). This document covers the setup process.

## Prerequisites

- Node.js 18+
- Android Studio (latest stable)
- Java 17+ (for Android builds)
- A Google Play Developer Account ($25 one-time fee)

## Step 1: Install Capacitor

```bash
# From project root
npm install @capacitor/core @capacitor/cli
npx cap init "Bamboozle" "com.bamboozle.app" --web-dir dist
```

This creates `capacitor.config.ts`:
```typescript
import type { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.bamboozle.app',
  appName: 'Bamboozle',
  webDir: 'dist',
  server: {
    // In development, point to local Vite server
    // url: 'http://192.168.x.x:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0f0f23', // Match your dark theme
      showSpinner: false,
    },
  },
};

export default config;
```

## Step 2: Add Android Platform

```bash
npx cap add android
```

This creates the `/android` directory with a full Android project.

## Step 3: Build & Sync

```bash
# Build the Vite app
npm run build

# Sync web assets to the Android project
npx cap sync android
```

## Step 4: Open in Android Studio

```bash
npx cap open android
```

This opens the Android project in Android Studio where you can:
- Run on an emulator
- Run on a connected device
- Build APKs/AABs for release

## Step 5: Configure Android Manifest

Location: `android/app/src/main/AndroidManifest.xml`

Key additions:
```xml
<!-- Internet permission (already included by Capacitor) -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Billing permission -->
<uses-permission android:name="com.android.vending.BILLING" />
```

## Step 6: Platform Detection

Add platform detection to the React app to conditionally show hosting UI:

```typescript
// utils/platform.ts
import { Capacitor } from '@capacitor/core';

export const isNativeApp = Capacitor.isNativePlatform();
export const isBrowser = !isNativeApp;
export const platform = Capacitor.getPlatform(); // 'android', 'ios', 'web'
```

### Usage in Components
```tsx
// In HomeSelector or wherever hosting UI lives
import { isNativeApp, isBrowser } from './utils/platform';

function HomeSelector() {
  return (
    <div>
      {isNativeApp && <button onClick={hostGame}>Host Game</button>}
      <button onClick={joinGame}>Join Game</button>
      {isBrowser && (
        <a href="https://play.google.com/store/apps/details?id=com.bamboozle.app">
          Want to host? Get the app!
        </a>
      )}
    </div>
  );
}
```

## Step 7: Handle Back Button (Android)

```typescript
import { App } from '@capacitor/app';

// In your main App component
useEffect(() => {
  const listener = App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
  return () => { listener.then(l => l.remove()); };
}, []);
```

## Step 8: Status Bar Configuration

```bash
npm install @capacitor/status-bar
npx cap sync
```

```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

// Match your dark theme
StatusBar.setBackgroundColor({ color: '#0f0f23' });
StatusBar.setStyle({ style: Style.Dark });
```

## Development Workflow

### Local Development (Hot Reload)
1. Start Vite dev server: `npm run dev -- --host`
2. Update `capacitor.config.ts` to point to your local IP
3. Run on device/emulator via Android Studio
4. Changes reflect live (like a browser)

### Production Build
```bash
npm run build          # Build Vite app
npx cap sync android   # Sync to Android
# Then build APK/AAB in Android Studio
```

## Google Play Store Setup

### 1. Create App in Play Console
- App name: "Bamboozle"
- Category: Trivia
- Content rating: Everyone

### 2. Store Listing
- **Title**: Bamboozle - Party Trivia Game
- **Short description**: Host hilarious trivia games with friends! Bluff your way to victory.
- **Full description**: (Details about hosting, gameplay, etc.)
- **Screenshots**: At least 4 screenshots (phone), 1 for tablet
- **Feature graphic**: 1024x500px banner

### 3. In-App Product Setup
- Product ID: `bamboozle_host_unlock`
- Type: One-time purchase (managed product)
- Price: £1.99 GBP
- Title: "Host Unlock"
- Description: "Unlock the ability to host unlimited games for your friends"

### 4. Release Tracks
1. **Internal testing**: Your own devices (immediate)
2. **Closed testing**: Friends & beta testers
3. **Open testing**: Public beta
4. **Production**: Full release

## Files Modified / Created

| File | Type | Description |
|---|---|---|
| `capacitor.config.ts` | NEW | Capacitor configuration |
| `android/` | NEW DIR | Full Android project |
| `utils/platform.ts` | NEW | Platform detection utility |
| `package.json` | MODIFIED | New Capacitor dependencies |
| `.gitignore` | MODIFIED | Add Android build artifacts |

## .gitignore Additions

```
# Capacitor
android/app/build/
android/.gradle/
android/app/src/main/assets/public/
*.apk
*.aab
```
