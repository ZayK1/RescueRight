# ESP32 Calibration Quick Guide
**Get accurate readings in 10 minutes**

---

## 🎯 What to Calibrate

1. **Force Threshold** - Adjust sensitivity
2. **Position Mapping** - Fix hand placement tracking
3. **Baseline Reset** - Zero out resting state

---

## ⚡ Quick Calibration Steps

### Step 1: Adjust Force Scale (2 min)

**Open:** `RescueRightApp/firmware/RescueRight_MVP.ino`

**Find line 65:**
```cpp
#define FORCE_SCALE 0.5
```

**Test and adjust:**
- Press vest firmly → Check Serial Monitor
- If force shows `~5-10N` → Increase to `1.0`
- If force shows `>100N` → Decrease to `0.3`
- **Target:** Medium press = `20-40N`

**Re-upload firmware after each change**

---

### Step 2: Lower Detection Threshold (1 min)

**Find line 66:**
```cpp
#define ACCEL_THRESHOLD 2.0
```

**If thrusts not detecting:**
- Change to `1.0` (more sensitive)
- If too many false triggers, use `3.0`

---

### Step 3: Recalibrate Baseline (30 sec)

**Steps:**
1. Place vest **flat on table**
2. Don't touch for 3 seconds
3. Press **EN button** on ESP32 (restart)
4. Watch Serial Monitor for new baseline values

**Expected baseline:** `~9.8 m/s²` for each sensor

---

### Step 4: Test Position Tracking (2 min)

**Serial Monitor will show:**
```
Pos: (0.50, 0.45) | Sensors: [0.0, 0.0, 0.0, 0.0]
```

**Test each corner:**

1. **Press TOP-LEFT** → `Pos: (0.2-0.4, 0.2-0.4)`
2. **Press TOP-RIGHT** → `Pos: (0.6-0.8, 0.2-0.4)`
3. **Press BOT-LEFT** → `Pos: (0.2-0.4, 0.6-0.8)`
4. **Press BOT-RIGHT** → `Pos: (0.6-0.8, 0.6-0.8)`
5. **Press CENTER** → `Pos: (0.45-0.55, 0.40-0.50)`

**If position stuck at (0.50, 0.45):**
- Check sensor wiring
- Verify all 4 sensors show in initialization
- Press harder (foam may be too thick)

---

### Step 5: Final Force Test (1 min)

**Do 3 test thrusts:**

1. Light press → `10-20N`
2. Medium press → `30-50N`
3. Hard press → `60-100N`

**If values seem off, go back to Step 1**

---

## 🔧 Quick Fixes

### Force Always 0
```cpp
// Line 65: Increase scale
#define FORCE_SCALE 1.5

// Line 66: Lower threshold
#define ACCEL_THRESHOLD 0.5
```

### Force Too High
```cpp
// Line 65: Decrease scale
#define FORCE_SCALE 0.2
```

### Position Not Moving
- Check all 4 sensors initialized (Serial Monitor startup)
- Try pressing much harder
- Verify sensor wiring is correct

### Thrusts Not Counting
```cpp
// In useBluetoothTrainingData.ts, line 201:
const threshold = 5; // Lower from 10
```

---

## 📊 Ideal Readings for Demo

**No pressure:**
- Force: `0N`
- Position: `(0.50, 0.45)`
- Sensors: `[0.0, 0.0, 0.0, 0.0]`

**Light thrust:**
- Force: `15-25N`
- Position: moves to pressed location
- Thrusts: count increases

**Medium thrust:**
- Force: `30-50N`
- Position: accurate within 2cm
- Feedback: "Good thrust!"

**Target for scoring:**
- Force: `20-60N` (optimal range)
- Position accuracy: `>70%`
- Rate: `3-7 thrusts/min`

---

## 🎬 Pre-Demo Checklist (5 min before)

1. **Restart ESP32** (fresh calibration)
2. **Reinstall app** on iPhone (fresh 7-day cert)
3. **Test 5 thrusts:**
   - All should count ✓
   - Force shows correctly ✓
   - Position moves ✓
4. **Check battery** - ESP32 and iPhone charged
5. **Ready!**

---

## 🚨 Emergency: No Time to Calibrate

**If readings are weird and no time:**

1. **Use mock data** for presentation:
   ```typescript
   // In training.tsx line 22:
   const data = useBluetoothTrainingData(true); // true = mock
   ```

2. **Show hardware** but use simulated data
3. **Explain:** "Calibration in progress, here's simulated data"

---

**Good luck with your demo! 🚀**
