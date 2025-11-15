# RescueRight - Deployment Guide

## Overview

This guide covers building and deploying the RescueRight mobile application to iOS and Android devices.

---

## Prerequisites

### Development Environment

**Required Software**:
- Node.js 18+ (`node --version`)
- npm or yarn (`npm --version`)
- Git
- Expo CLI (`npm install -g expo-cli`)

**Platform-Specific**:
- **iOS**: macOS with Xcode 14+ (App Store)
- **Android**: Android Studio with SDK 33+ (any OS)

---

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/RescueRight.git
cd RescueRight/RescueRightApp
```

### 2. Install Dependencies

```bash
npm install
```

**Dependencies Overview**:
- React Native 0.81.4
- Expo SDK 54
- TypeScript 5.9.2
- 30+ production dependencies (see `package.json`)

### 3. Environment Configuration

**Optional**: Create `.env` file for environment variables:

```env
# .env (not committed to git)
API_URL=https://api.rescueright.com
MOCK_DATA_ENABLED=false
```

---

## Development

### Start Development Server

```bash
npm start
```

This opens Expo DevTools in your browser with QR code for device testing.

### Run on Simulator/Emulator

**iOS Simulator** (macOS only):
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

### Development Mode Features

- Hot reload (CMD+R / CTRL+R)
- Debug menu (Shake device / CMD+D / CTRL+D)
- React DevTools
- Network inspector
- Performance monitor

---

## iOS Deployment

### Development Build (No Paid Apple Developer Account)

**Requirements**:
- Physical iPhone (iOS 13.4+)
- USB cable
- Mac computer
- Free Apple ID

#### Step 1: Setup Xcode

1. Install Xcode from App Store
2. Open Xcode → Preferences → Accounts
3. Add your Apple ID (click +)
4. Select your account → Manage Certificates
5. Click + → Apple Development

#### Step 2: Configure Signing

```bash
# Open Xcode workspace
cd ios
open RescueRightApp.xcworkspace
```

In Xcode:
1. Select project in navigator
2. Select "RescueRightApp" under TARGETS
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select Team: `Your Name (Personal Team)`
6. Change Bundle Identifier to unique name:
   - From: `org.reactjs.native.example.RescueRightApp`
   - To: `com.yourname.rescueright`

#### Step 3: Build and Deploy

1. Connect iPhone via USB
2. Trust computer on iPhone (popup)
3. Select iPhone as build target in Xcode
4. Click Play button (▶)

**First Run Error**:
- iPhone will show "Untrusted Developer"
- Fix: Settings → General → VPN & Device Management → Trust your Apple ID

**Certificate Expiry**:
- Free certificates last 7 days
- Re-deploy from Xcode to renew

#### Build via CLI

```bash
npx react-native run-ios --device "Your iPhone Name"
```

Find device name:
```bash
xcrun xctrace list devices
```

### Production Build (Paid Apple Developer Account)

**Requirements**:
- Apple Developer Program membership ($99/year)
- App Store Connect access

**Steps**:
1. Create App ID in Apple Developer Portal
2. Create Distribution Certificate
3. Create Provisioning Profile
4. Configure in Xcode under "Signing & Capabilities"
5. Archive build: Product → Archive
6. Upload to App Store Connect
7. Submit for review

---

## Android Deployment

### Development Build

#### Step 1: Setup Android Studio

1. Download and install Android Studio
2. Install Android SDK 33 (via SDK Manager)
3. Setup Android emulator (AVD Manager)

#### Step 2: Configure Environment

**macOS/Linux**:
```bash
# Add to ~/.bash_profile or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows**:
```cmd
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
setx PATH "%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools"
```

#### Step 3: Build APK

**Debug APK** (for testing):
```bash
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK** (for distribution):
```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

#### Step 4: Install on Device

**Via USB**:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Via File Transfer**:
1. Transfer APK to device
2. Enable "Install from Unknown Sources" in Settings
3. Open APK file on device
4. Tap Install

### Production Build (Google Play Store)

#### Generate Signing Key

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore rescueright-release-key.keystore -alias rescueright -keyalg RSA -keysize 2048 -validity 10000
```

**Enter**:
- Password (remember this!)
- Name, organization, etc.

#### Configure Gradle

**File**: `android/gradle.properties`

```properties
RESCUERIGHT_UPLOAD_STORE_FILE=rescueright-release-key.keystore
RESCUERIGHT_UPLOAD_KEY_ALIAS=rescueright
RESCUERIGHT_UPLOAD_STORE_PASSWORD=your_password
RESCUERIGHT_UPLOAD_KEY_PASSWORD=your_password
```

**File**: `android/app/build.gradle`

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('RESCUERIGHT_UPLOAD_STORE_FILE')) {
                storeFile file(RESCUERIGHT_UPLOAD_STORE_FILE)
                storePassword RESCUERIGHT_UPLOAD_STORE_PASSWORD
                keyAlias RESCUERIGHT_UPLOAD_KEY_ALIAS
                keyPassword RESCUERIGHT_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

#### Build Release APK

```bash
cd android
./gradlew assembleRelease
```

#### Upload to Google Play Console

1. Create app in Google Play Console
2. Complete store listing
3. Upload APK/AAB
4. Set pricing (free/paid)
5. Submit for review

---

## Build Optimization

### Reduce Bundle Size

**Enable Hermes** (already enabled in project):

`android/app/build.gradle`:
```gradle
project.ext.react = [
    enableHermes: true
]
```

`ios/Podfile`:
```ruby
use_react_native!(
  :hermes_enabled => true
)
```

### ProGuard (Android)

**Enable in** `android/app/build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### Metro Bundler Optimization

**metro.config.js**:
```javascript
module.exports = {
  transformer: {
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      compress: {
        drop_console: true,  // Remove console.logs in production
      },
    },
  },
};
```

---

## Continuous Integration/Deployment

### GitHub Actions Example

`.github/workflows/build.yml`:
```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: |
          cd RescueRightApp
          npm install
      - name: Build iOS
        run: |
          cd RescueRightApp/ios
          pod install
          xcodebuild -workspace RescueRightApp.xcworkspace -scheme RescueRightApp -configuration Release -archivePath build/RescueRightApp.xcarchive archive

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 11
        uses: actions/setup-java@v3
        with:
          java-version: '11'
          distribution: 'temurin'
      - name: Install dependencies
        run: |
          cd RescueRightApp
          npm install
      - name: Build Android APK
        run: |
          cd RescueRightApp/android
          ./gradlew assembleRelease
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release
          path: RescueRightApp/android/app/build/outputs/apk/release/app-release.apk
```

---

## Testing Before Deployment

### Pre-Deployment Checklist

- [ ] All TypeScript errors resolved (`npm run typecheck`)
- [ ] App builds successfully on target platform
- [ ] BLE permissions configured correctly
- [ ] Mock data toggle functional (for testing without hardware)
- [ ] Real BLE connection tested (if hardware available)
- [ ] All screens navigate correctly
- [ ] Session data persists across app restarts
- [ ] Analytics calculations accurate
- [ ] No console errors in production build
- [ ] App bundle size optimized (<50MB)
- [ ] Icons and splash screens configured

### Manual Testing Flow

1. **Home Screen**: 3D vest animation loads, buttons functional
2. **Connect Screen**: BLE scanning works, device list populates
3. **Training Screen**: Real-time metrics update, feedback displays
4. **Analytics Screen**: Score calculated, metrics accurate
5. **Session Persistence**: Data saves, retrieval works

---

## Troubleshooting

### iOS Build Errors

**Error**: "No provisioning profile found"

**Fix**:
1. Xcode → Preferences → Accounts → Download Manual Profiles
2. Clean build folder: Product → Clean Build Folder (⇧⌘K)
3. Try building again

**Error**: "Code signing error"

**Fix**:
1. Change Bundle Identifier to unique name
2. Delete Derived Data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```
3. Rebuild

**Error**: "Module not found"

**Fix**:
```bash
cd ios
pod deintegrate
pod install
cd ..
npm start -- --reset-cache
```

### Android Build Errors

**Error**: "SDK location not found"

**Fix**: Create `android/local.properties`:
```properties
sdk.dir=/Users/yourname/Library/Android/sdk
```

**Error**: "Execution failed for task ':app:mergeDebugResources'"

**Fix**:
```bash
cd android
./gradlew clean
cd ..
npm start -- --reset-cache
```

**Error**: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"

**Fix**: Uninstall existing app first:
```bash
adb uninstall com.rescuerightapp
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Common Runtime Issues

**BLE not working on Android**

**Fix**:
1. Check `AndroidManifest.xml` has permissions:
   ```xml
   <uses-permission android:name="android.permission.BLUETOOTH" />
   <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
   <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
   <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   ```
2. Enable Location Services in Settings
3. Grant app permissions in Settings → Apps → RescueRight

**BLE not working on iOS**

**Fix**:
1. Check `Info.plist` has:
   ```xml
   <key>NSBluetoothAlwaysUsageDescription</key>
   <string>RescueRight uses Bluetooth to connect to the training vest</string>
   ```
2. Grant Bluetooth permission when prompted

---

## App Store Submission

### iOS App Store

**Requirements**:
- Screenshots (6.5", 5.5" sizes)
- App icon (1024×1024 PNG)
- Privacy policy URL
- Support URL
- App description (4000 char limit)
- Keywords
- Category: Health & Fitness / Medical

**Review Timeline**: 1-7 days

### Google Play Store

**Requirements**:
- Screenshots (Minimum 2, 1920×1080)
- Feature graphic (1024×500)
- App icon (512×512 PNG)
- Privacy policy URL
- Content rating questionnaire
- App description (4000 char limit)
- Category: Health & Fitness / Medical

**Review Timeline**: 1-3 days

---

## Over-the-Air (OTA) Updates

### Expo Updates (Optional)

If using Expo managed workflow:

```bash
# Install Expo Updates
npm install expo-updates

# Configure in app.json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/your-project-id"
    }
  }
}

# Publish update
expo publish
```

Users receive updates without app store resubmission (JS bundle only).

---

## Environment-Specific Builds

### Development Build

```bash
EXPO_PUBLIC_ENV=development npm start
```

Features:
- Mock data enabled
- Debug logs visible
- DevTools enabled

### Staging Build

```bash
EXPO_PUBLIC_ENV=staging npm run build:android
```

Features:
- Test API endpoints
- Analytics disabled
- Error reporting enabled

### Production Build

```bash
EXPO_PUBLIC_ENV=production npm run build:ios
```

Features:
- Live API endpoints
- Analytics enabled
- Error reporting enabled
- Debug logs disabled
- Code minification

---

## Performance Monitoring

### Setup Sentry (Error Tracking)

```bash
npm install @sentry/react-native
```

**Configure**:
```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.EXPO_PUBLIC_ENV || 'development',
});
```

### Analytics Integration

**Example with Firebase**:
```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

```typescript
import analytics from '@react-native-firebase/analytics';

// Track screen views
analytics().logScreenView({
  screen_name: 'TrainingScreen',
  screen_class: 'TrainingScreen',
});

// Track events
analytics().logEvent('thrust_detected', {
  force: 45.2,
  position_accuracy: 0.89,
});
```

---

## Security Best Practices

1. **Never commit sensitive data**:
   - API keys in `.env` (git-ignored)
   - Signing keys in secure location
   - Passwords in environment variables

2. **Code Obfuscation**:
   - Enable ProGuard (Android)
   - Use Hermes bytecode (iOS/Android)

3. **Secure Storage**:
   - Use `expo-secure-store` for sensitive data
   - Never store health data in plain text

4. **Network Security**:
   - HTTPS only for API calls
   - Certificate pinning for production

---

## Maintenance

### Regular Updates

- **Dependencies**: Update monthly (`npm outdated`, `npm update`)
- **React Native**: Update quarterly (major versions)
- **Expo SDK**: Update with each release (~quarterly)

### Deprecated API Cleanup

```bash
# Check for deprecated APIs
npx react-native upgrade --legacy true
```

---

## Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **iOS Developer Portal**: https://developer.apple.com/
- **Google Play Console**: https://play.google.com/console/

---

For app architecture details, see `DeveloperDocs/ARCHITECTURE.md`.
For hardware integration, see `DeveloperDocs/HARDWARE.md`.
