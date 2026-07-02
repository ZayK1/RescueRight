# RescueRight Vest — Firmware ↔ App BLE Contract (v2 pad)

**Audience:** the firmware/hardware team writing the ESP32 sketch for the new
sensor pad.
**Goal:** define exactly what the pad must send over Bluetooth so the app shows
correct force / hand-position / angle for Heimlich (abdominal-thrust) training.

The app does **all** interpretation (force conversion, position, angle, scoring).
The firmware's job is only to **read the sensors, subtract the baseline, and
stream the numbers.** Keep it simple — no calibration maths on the ESP32.

---

## 1. Hardware assumed

- Adafruit Feather ESP32 V2
- PCA9548A I2C mux @ `0x70`
- 5 × (LIS3MDL magnetometer `0x1C` + LSM6DSOX IMU `0x6A`) boards
  - 4 corners + 1 reference board fixed to the base plate

| Sensor ID      | Location            | PCA channel | App array index |
| -------------- | ------------------- | ----------: | --------------: |
| `TOP_LEFT`     | Top Left            |           4 |               0 |
| `TOP_RIGHT`    | Top Right           |           7 |               1 |
| `BOTTOM_LEFT`  | Bottom Left         |           3 |               2 |
| `BOTTOM_RIGHT` | Bottom Right        |           0 |               3 |
| `REFERENCE`    | Base plate (fixed)  |           2 |               — |

> ⚠️ **The order in the packet must be TL, TR, BL, BR** (app indices 0–3),
> regardless of PCA channel numbers.

---

## 2. BLE identifiers

| Item                     | Value |
| ------------------------ | ----- |
| Advertised device name   | must start with `RescueRight` (e.g. `RescueRight Vest #001`) |
| Service UUID             | `4fafc201-1fb5-459e-8fcc-c5c9c331914b` |
| Sensor-frame characteristic UUID | `beb5483e-36e1-4688-b7f5-ea07361b26b0` |
| Properties               | `NOTIFY` (READ optional) |

One service, **one** notify characteristic. The old force/position/angle
characteristics are gone.

---

## 3. The packet — a plain text CSV line

Each notification is a UTF-8 string (not a binary struct — easier to emit and to
inspect in nRF Connect / LightBlue).

Each board currently gives you three readings — **gyroscope, accelerometer, and
magnetometer**. For this contract the app only *requires* the **magnetometer
magnitude per corner**. Accelerometer is optional (for thrust angle); gyroscope
is unused for now.

```
"m0,m1,m2,m3[,tx,ty[,seq]]"
```

| Field | Meaning | Required? | Units |
| ----- | ------- | --------- | ----- |
| `m0`  | TOP_LEFT magnetometer magnitude     | ✅ | µT |
| `m1`  | TOP_RIGHT magnetometer magnitude    | ✅ | µT |
| `m2`  | BOTTOM_LEFT magnetometer magnitude  | ✅ | µT |
| `m3`  | BOTTOM_RIGHT magnetometer magnitude | ✅ | µT |
| `tx`  | accelerometer X (for thrust angle)  | optional | m/s² |
| `ty`  | accelerometer Y (for thrust angle)  | optional | m/s² |
| `seq` | packet counter (dropped-frame check) | optional | — |

Notes:
- **Send RAW magnitudes.** Do NOT convert to Newtons and do NOT worry about
  subtracting a baseline — **the app captures its own baseline and does all the
  maths.** (If your `acquireBaseline` already subtracts, that's fine too; the app
  will just measure ~0 offset. Either way works.)
- `m0..m3` rise as the foam compresses toward the magnet(s). The magnitude of a
  LIS3MDL reading is `sqrt(x*x + y*y + z*z)`.
- `tx,ty` feed the angle estimate. Not ready? Omit them (or send `0,0`) — the app
  shows angle ≈ 0 and everything else still works.
- `seq` lets the app count dropped frames. Omit if inconvenient; defaults to 0.
- Send at **20–30 Hz**. A trailing newline is fine (the app trims it).

**Valid example lines** (all accepted):
```
12.4,3.1,8.7,2.0            ← minimum: 4 corner magnitudes only
12.4,3.1,8.7,2.0,0.35,-0.10
12.4,3.1,8.7,2.0,0.35,-0.10,142
```

---

## 4. Baseline — the app handles it

**You do not need to send baseline-subtracted values.** The app averages the
first ~15 frames after connecting (assuming the pad is at rest) and subtracts
that from then on. So:

- Keep the pad **still for ~1 second** right after connecting — the app shows
  "Calibrating baseline…" during this window.
- If your firmware *also* subtracts its own baseline, no problem — the app just
  measures a ~0 offset on top. Both approaches coexist safely.
- Reconnecting re-captures the baseline (handy if readings drift).

Your in-progress `acquireBaseline()` is still useful (it improves the raw signal)
but is **not required** for the app to work.

---

## 5. Reference firmware sketch (BLE + packing only)

Your sensor-reading code stays as-is; this shows only how to format and notify.

```cpp
// Each loop, after reading the magnetometers (RAW magnitude per corner, µT):
float m[4];      // TL, TR, BL, BR
float tx, ty;    // accelerometer X/Y for angle (optional — send 0 if unused)
static uint16_t seq = 0;

char buf[80];
snprintf(buf, sizeof(buf), "%.2f,%.2f,%.2f,%.2f,%.3f,%.3f,%u",
         m[0], m[1], m[2], m[3], tx, ty, seq++);

pSensorFrameChar->setValue((uint8_t*)buf, strlen(buf));
pSensorFrameChar->notify();
delay(40);   // ~25 Hz
```

Magnitude from a LIS3MDL reading (per sensor):
```cpp
float mag = sqrtf(x*x + y*y + z*z);   // then subtract that sensor's baseline
```

---

## 6. Calibrating force (do this once, with the app)

The app turns `sum(m0..m3)` into Newtons with a single constant, `FORCE_GAIN`
in [`lib/vestCalibration.ts`](../lib/vestCalibration.ts). No firmware change
needed to calibrate.

1. Put the pad on a scale that reads force/weight (1 kgf ≈ 9.81 N).
2. Open the app's **Sensor Debug** screen — it shows **Σ magDelta** live.
3. Press firmly at the centre (a "correct" thrust) and read Σ magDelta.
4. Set `FORCE_GAIN = 55 / (Σ magDelta at that firm thrust)` so it reads ~55 N
   (middle of the 40–65 N training band).
5. Save; the app hot-reloads. Confirm a few presses land in 40–65 N.

Target band rationale (40–65 N) is documented in `lib/vestCalibration.ts`.

---

## 7. Quick checklist for the demo

- [ ] Advertises as `RescueRight …`
- [ ] Service + sensor-frame UUIDs match section 2
- [ ] Streams `m0,m1,m2,m3` (+ optional `tx,ty,seq`) at ~25 Hz, order TL,TR,BL,BR
- [ ] Values are RAW magnetometer magnitudes (app does the baseline)
- [ ] Pad kept still for ~1s after connecting (app captures baseline)
- [ ] `FORCE_GAIN` calibrated against a force scale
