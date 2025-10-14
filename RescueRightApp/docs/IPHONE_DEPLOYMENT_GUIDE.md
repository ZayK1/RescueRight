# Deploy RescueRight App to Physical iPhone
**No Paid Developer Account Required**

---

## 🎯 Overview

You can install your React Native app on your physical iPhone using a **free Apple Developer account**. This is perfect for testing and demos, but has some limitations:
- App expires after **7 days** (need to reinstall)
- Limited to **3 devices** per account
- Can't publish to App Store

For your demo, this is perfect!

---

## 📋 Prerequisites

### What You Need:
1. **Mac computer** (running macOS)
2. **Physical iPhone** with iOS 13.4 or later
3. **USB cable** (Lightning to USB)
4. **Apple ID** (free - you already have one!)
5. **Xcode** installed on your Mac

---

## 🔧 Step-by-Step Setup

### Step 1: Install Xcode (if not already installed)

1. Open **App Store** on your Mac
2. Search for **Xcode**
3. Click **Get** → **Install**
4. Wait for installation (it's large, ~12GB, takes 20-40 min)

**Or use Terminal:**
```bash
xcode-select --install
```

### Step 2: Set Up Free Apple Developer Account

1. Open **Xcode**
2. Go to **Xcode** → **Preferences** (or **Settings** in newer versions)
3. Click **Accounts** tab
4. Click the **+** button at bottom left
5. Select **Apple ID**
6. Sign in with your Apple ID
7. Click **Manage Certificates...**
8. Click **+** → Select **Apple Development**
9. Click **Done**

✅ **You now have a free developer account!**

### Step 3: Configure Your iPhone

1. **Connect iPhone to Mac** via USB cable

2. **Trust Your Computer:**
   - On iPhone: Tap **Trust** when prompted
   - Enter iPhone passcode if asked

3. **Enable Developer Mode (iOS 16+):**
   - On iPhone: Go to **Settings** → **Privacy & Security**
   - Scroll down to **Developer Mode**
   - Toggle **ON**
   - Restart iPhone
   - After restart, confirm by tapping **Turn On**

4. **Check Connection in Xcode:**
   - Open Xcode
   - Go to **Window** → **Devices and Simulators**
   - Your iPhone should appear in the left sidebar
   - Status should show **Connected**

---

## 🚀 Deploy RescueRight App

### Step 1: Navigate to Your Project

Open Terminal and navigate to your project:

```bash
cd /Users/zayan/RescueRight/RescueRightApp
```

### Step 2: Install Dependencies (if not done)

```bash
# Install npm packages
npm install

# Install iOS pods
cd ios
pod install
cd ..
```

### Step 3: Open Project in Xcode

```bash
# Open the iOS project
open ios/RescueRightApp.xcworkspace
```

**IMPORTANT:** Open the `.xcworkspace` file, NOT `.xcodeproj`!

### Step 4: Configure Signing in Xcode

1. **In Xcode, select the project** (top of left sidebar)

2. **Select target "RescueRightApp"** (under TARGETS)

3. **Go to "Signing & Capabilities" tab**

4. **Check "Automatically manage signing"**

5. **Select your Team:**
   - Click Team dropdown
   - Select your name (Personal Team)
   - Format: `Your Name (Personal Team)`

6. **Change Bundle Identifier** (must be unique):
   - Find "Bundle Identifier" field
   - Change from: `org.reactjs.native.example.RescueRightApp`
   - To: `com.yourname.RescueRightApp`
   - Example: `com.zayan.RescueRightApp`

7. **Verify Signing:**
   - Should see: ✅ **Signing Certificate: Apple Development**
   - Should see: ✅ **Provisioning Profile: Xcode Managed Profile**

If you see warnings/errors:
- Click **Try Again**
- Make sure Bundle Identifier is unique
- Make sure you're logged into your Apple ID in Xcode Preferences

### Step 5: Select Your iPhone as Target

1. **At the top of Xcode** (near Play/Stop buttons):
   - Click the device dropdown
   - Select your iPhone (should show name like "Zayan's iPhone")

2. **Make sure it's your physical device**, not a simulator

### Step 6: Build and Run

1. **Click the Play button** (▶) in top-left of Xcode

2. **First time only:** You'll see an error on iPhone:
   ```
   "Untrusted Developer"
   Your device management settings do not allow apps
   from developer "Your Name" to be run.
   ```

3. **Trust yourself on iPhone:**
   - On iPhone: Go to **Settings** → **General** → **VPN & Device Management**
   - Under "DEVELOPER APP", tap your Apple ID
   - Tap **Trust "Your Apple ID"**
   - Tap **Trust** in popup

4. **In Xcode, click Play button again** (▶)

5. **Wait for app to install and launch** (1-2 minutes first time)

✅ **App should now be running on your iPhone!**

---

## 🎨 Development Workflow

### Running the App (After Initial Setup)

You have two options:

#### Option A: Run from Xcode (Recommended for debugging)

```bash
# In Terminal
cd /Users/zayan/RescueRight/RescueRightApp
open ios/RescueRightApp.xcworkspace

# Then click Play button in Xcode
```

#### Option B: Run with React Native CLI

```bash
# In Terminal
cd /Users/zayan/RescueRight/RescueRightApp

# Make sure Metro bundler is running
npm start

# In a NEW terminal window
npx react-native run-ios --device "Your iPhone Name"
```

**Find your iPhone name:**
```bash
xcrun xctrace list devices
```

### Hot Reload During Development

1. **Make sure iPhone and Mac are on same WiFi**

2. **Enable Debug mode:**
   - Shake iPhone
   - Tap "Settings"
   - Set Debug server host: `YOUR_MAC_IP:8081`
   - Example: `192.168.1.100:8081`

3. **Find your Mac's IP:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

4. **Now code changes auto-reload on iPhone!**

---

## 📱 Testing Bluetooth with ESP32

### Before You Start:
- ✅ ESP32 firmware uploaded and running
- ✅ ESP32 powered on and advertising
- ✅ iPhone Bluetooth enabled
- ✅ iPhone Location Services enabled

### Step 1: Grant Permissions

**First time opening app:**

1. App will ask for **Bluetooth permission** → Tap **Allow**
2. App will ask for **Location permission** → Tap **Allow While Using App**

**If you accidentally denied:**
- Go to iPhone **Settings** → **RescueRight**
- Enable **Bluetooth** and **Location**

### Step 2: Connect to Vest

1. **Open RescueRight app** on iPhone

2. **Navigate to Connect screen**

3. **Check ESP32 Serial Monitor** (on Mac):
   - Should show: `📡 Advertising as 'RescueRight Vest #001'`

4. **In app, tap Scan** (if not auto-scanning)

5. **Should see:** `RescueRight Vest #001` in device list

6. **Tap on device** to connect

7. **Wait for connection** (2-5 seconds)

8. **Should navigate to Training screen**

### Step 3: Verify Real-Time Data

1. **Press vest** → Force gauge should move

2. **Press different positions:**
   - Left → Heatmap dot moves left
   - Right → Heatmap dot moves right
   - Top → Heatmap dot moves up
   - Bottom → Heatmap dot moves down

3. **Check feedback messages** update in real-time

4. **Check ESP32 Serial Monitor:**
   - Should show: `📱 Device connected`
   - Should show: `Force: XX.XN | Pos: (X.XX, X.XX) | ...`

---

## 🐛 Troubleshooting

### Issue: "No devices found" in Xcode

**Solutions:**
1. Unplug and replug USB cable
2. Unlock iPhone
3. Restart Xcode
4. Check USB cable (try different one)
5. Go to iPhone: Settings → General → Reset → Reset Location & Privacy

### Issue: "Failed to build" in Xcode

**Solutions:**
1. Clean build folder: **Product** → **Clean Build Folder** (⇧⌘K)
2. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```
3. Reinstall pods:
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```
4. Try building again

### Issue: "Code signing error"

**Solutions:**
1. Make sure Bundle Identifier is unique
2. Try changing it to: `com.yourname.rescuerightv2`
3. In Xcode: **Product** → **Clean Build Folder**
4. Try again

### Issue: App crashes immediately on iPhone

**Solutions:**
1. Check Xcode console for error messages
2. Make sure iPhone iOS version is compatible
3. Try deleting app from iPhone and reinstalling:
   - Long-press app icon → Remove App → Delete App
   - Rebuild from Xcode

### Issue: "Could not connect to development server"

**Solutions:**
1. Make sure Metro bundler is running:
   ```bash
   npm start
   ```

2. On iPhone, shake device → tap **Settings**
3. Set Debug server host: `YOUR_MAC_IP:8081`

4. Check firewall isn't blocking port 8081:
   ```bash
   # On Mac
   sudo lsof -i :8081
   ```

### Issue: Bluetooth not finding vest

**Solutions:**
1. **Check ESP32:**
   - Serial Monitor shows "Advertising..."
   - Press EN button to restart

2. **Check iPhone:**
   - Settings → Bluetooth → ON
   - Settings → Privacy → Location Services → ON
   - Settings → Privacy → Location Services → RescueRight → While Using

3. **Check app permissions:**
   - Settings → RescueRight → Bluetooth → Allow
   - Settings → RescueRight → Local Network → Allow

4. **Restart everything:**
   - Close and reopen app
   - Turn iPhone Bluetooth OFF then ON
   - Press EN button on ESP32

### Issue: App expires after 7 days

**Why:** Free developer accounts have 7-day app certificates

**Solution:**
1. Connect iPhone to Mac
2. Open Xcode project
3. Click Play button to reinstall
4. App works for another 7 days

**For demo day:** Reinstall the morning of your presentation!

---

## 🎭 Demo Day Checklist

### Day Before Presentation:

- [ ] Reinstall app on iPhone (ensure fresh 7-day certificate)
- [ ] Test full workflow: Open app → Connect → View data
- [ ] Charge iPhone to 100%
- [ ] Charge ESP32 battery/power bank to 100%
- [ ] Test Bluetooth range (5+ meters)
- [ ] Have backup: Keep Mac with Xcode ready

### Morning of Presentation:

- [ ] **Reinstall app again** (fresher the better!)
- [ ] Test connection once more
- [ ] Make sure iPhone isn't in Low Power Mode
- [ ] Turn OFF iPhone Auto-Lock: Settings → Display & Brightness → Auto-Lock → Never
- [ ] Close other apps (free up resources)
- [ ] Put iPhone in Do Not Disturb mode

### During Demo:

1. **Power on ESP32 first** (wait for "Advertising...")
2. **Open app on iPhone**
3. **Connect to vest** (should be quick, <5 seconds)
4. **Start demo!**

### Backup Plan:

If iPhone has issues:
1. **Use another phone** (reinstall app quickly)
2. **Use simulator** (on Mac with Xcode)
3. **Use video** (record working demo beforehand)

---

## 🔄 Quick Reference Commands

### Reinstall App
```bash
cd /Users/zayan/RescueRight/RescueRightApp
open ios/RescueRightApp.xcworkspace
# Click Play button in Xcode
```

### Clean and Rebuild
```bash
cd /Users/zayan/RescueRight/RescueRightApp

# Clean
cd ios
pod deintegrate
pod install
cd ..

# Open and build
open ios/RescueRightApp.xcworkspace
```

### Check Connected Devices
```bash
xcrun xctrace list devices
```

### View Console Logs
```bash
# In Xcode: Window → Devices and Simulators → Select device → Open Console
```

### Find Mac IP Address
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## 📞 Need Help?

**Common Issues:**
- Xcode not finding device → Try different USB cable
- Code signing fails → Change Bundle Identifier
- App crashes → Check Xcode console logs
- Bluetooth not working → Check app permissions

**Day of demo:**
- Arrive early to test setup
- Have backup power for ESP32
- Keep Mac nearby just in case

---

## ✅ Success Criteria

Before your presentation, verify:

- [x] App installs successfully on iPhone
- [x] App launches without crashing
- [x] Bluetooth permission granted
- [x] Can see "RescueRight Vest #001" in device list
- [x] Connects to vest successfully
- [x] Force gauge updates when pressing vest
- [x] Position heatmap tracks correctly
- [x] Feedback messages update in real-time
- [x] Connection stays stable (no disconnects)
- [x] App performs well (no lag)

**If all checked:** You're ready for the demo! 🎉

---

**Good luck with your semifinals presentation tomorrow! 🚀**

---

**Last Updated:** October 14, 2025
**Status:** Ready for Demo
