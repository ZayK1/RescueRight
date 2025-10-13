# RescueRight Calibration Analysis Scripts

This directory contains tools for analyzing calibration data from the ESP32 hardware prototype.

---

## Overview

These scripts help you:
1. **Validate** CSV data from hardware team
2. **Visualize** sensor data relationships
3. **Calculate** calibration coefficients
4. **Generate** calibration constants for the app

---

## Scripts

### 1. `analyze_calibration.ts` (TypeScript)

**Purpose**: Calculate calibration constants from CSV data

**Usage**:
```bash
npx ts-node scripts/analyze_calibration.ts <path_to_csv>
```

**Example**:
```bash
npx ts-node scripts/analyze_calibration.ts ~/Downloads/calibration_data.csv
```

**Output**:
- Console output with analysis results
- `calibration_output.ts` file with generated constants
- Data quality metrics and recommendations

**What it does**:
- ✓ Parses CSV data
- ✓ Validates data quality
- ✓ Calculates Hall sensor force calibration (baseline, sensitivity)
- ✓ Calculates depth-to-force ratio
- ✓ Analyzes MPU position mapping
- ✓ Analyzes angle calibration accuracy
- ✓ Generates TypeScript code with calibration constants

---

### 2. `visualize_calibration.py` (Python)

**Purpose**: Create visualizations to understand calibration data

**Requirements**:
```bash
pip install pandas matplotlib numpy scipy
```

**Usage**:
```bash
python scripts/visualize_calibration.py <path_to_csv>
```

**Example**:
```bash
python scripts/visualize_calibration.py ~/Downloads/calibration_data.csv
```

**Output** (saved to `calibration_plots/` directory):
- `hall_sensor_calibration.png` - Force vs ADC scatter plots with regression lines
- `force_distribution.png` - Sensor balance and distribution analysis
- `depth_force_relationship.png` - Compression depth vs force relationship
- `position_heatmap.png` - Spatial distribution of force application
- `angle_calibration.png` - Angle accuracy and error analysis
- `time_series.png` - Sensor readings over time
- `analysis_report.txt` - Summary statistics and data quality report

**What it does**:
- ✓ Creates publication-quality plots
- ✓ Identifies outliers and noise
- ✓ Shows correlation quality (R² values)
- ✓ Helps diagnose sensor issues
- ✓ Validates data coverage (positions, angles, depths)

---

## Workflow

### Step 1: Receive CSV Data

Hardware team sends calibration CSV file with this structure:

```csv
timestamp,compressionDepth,appliedForce,sensorPositionX,sensorPositionY,angle,hall1,hall2,hall3,hall4,mpu1_accel_x,mpu1_accel_y,mpu1_accel_z
1697234567000,0,0,5,5,0,2048,2048,2048,2048,0,0,16384
1697234567100,2,50,5,5,-5,2400,2400,2400,2400,-1000,500,15000
...
```

**Required columns**:
- `timestamp`: Unix timestamp (ms)
- `compressionDepth`: Ground truth depth (cm)
- `appliedForce`: Ground truth force (N)
- `sensorPositionX`, `sensorPositionY`: Hand position (cm)
- `angle`: Body angle (degrees)
- `hall1`, `hall2`, `hall3`, `hall4`: Hall sensor ADC values

**Optional columns** (if MPU data available):
- `mpu1_accel_x/y/z`: MPU1 accelerometer
- `mpu1_gyro_x/y/z`: MPU1 gyroscope
- `mpu2_accel_x/y/z`, etc.

### Step 2: Visualize Data

```bash
python scripts/visualize_calibration.py calibration_data.csv
```

**What to check**:
- [ ] Linear relationship between Hall sensor ADC and force (high R²)
- [ ] Linear relationship between force and depth (high R²)
- [ ] Balanced force distribution across sensors (low std dev)
- [ ] Good angle accuracy (<5° error)
- [ ] No major outliers or noise spikes
- [ ] Good coverage of positions, depths, and angles

If issues are found, **request better data** from hardware team before proceeding.

### Step 3: Calculate Calibration Constants

```bash
npx ts-node scripts/analyze_calibration.ts calibration_data.csv
```

**What you get**:
- Calibration constants in `calibration_output.ts`
- Data quality report
- R² values for validation

### Step 4: Update App

1. Open `calibration_output.ts`
2. Copy the `CALIBRATION_CONSTANTS` object
3. Paste into `lib/calibration.ts` (replace `DEFAULT_CALIBRATION`)
4. Save and rebuild app

### Step 5: Test with App

1. Run app: `npm start`
2. Navigate to **Sensor Debug** screen (`/sensor-debug`)
3. Connect to vest
4. Perform test compressions
5. Verify:
   - Force readings match applied force (±5N)
   - Position indicator shows correct location
   - Angle readings match body lean (±5°)
   - Feedback messages are appropriate

If accuracy is poor, iterate:
- Collect more calibration data
- Check sensor installation
- Review data quality plots

---

## Example Session

```bash
# 1. Receive CSV file from hardware team
$ ls ~/Downloads/
calibration_data.csv

# 2. Visualize data
$ python scripts/visualize_calibration.py ~/Downloads/calibration_data.csv

=== Generating Hall Sensor Calibration Plots ===
  hall1: Slope = 0.048723 N/ADC, R² = 0.987
  hall2: Slope = 0.049156 N/ADC, R² = 0.991
  hall3: Slope = 0.047892 N/ADC, R² = 0.983
  hall4: Slope = 0.048441 N/ADC, R² = 0.989
✓ Saved: calibration_plots/hall_sensor_calibration.png

... (more plots generated)

✓ VISUALIZATION COMPLETE

# 3. Review plots (open calibration_plots/ directory)

# 4. Calculate calibration constants
$ npx ts-node scripts/analyze_calibration.ts ~/Downloads/calibration_data.csv

=== Hall Sensor Calibration (Force) ===

✓ Baselines (15 samples):
  Hall 1: 2048.3
  Hall 2: 2049.1
  Hall 3: 2047.8
  Hall 4: 2048.9

✓ Sensitivity (142 samples):
  Hall 1: 0.048723 N/ADC (R² = 0.987)
  Hall 2: 0.049156 N/ADC (R² = 0.991)
  Hall 3: 0.047892 N/ADC (R² = 0.983)
  Hall 4: 0.048441 N/ADC (R² = 0.989)

... (more analysis)

✓ ANALYSIS COMPLETE

Calibration constants saved to: calibration_output.ts

# 5. Update app
$ cp calibration_output.ts lib/calibration.ts
# (manually copy constants to DEFAULT_CALIBRATION)

# 6. Test with app
$ npm start
# Navigate to sensor-debug screen and test!
```

---

## Troubleshooting

### Issue: "Module not found" error (TypeScript)

```bash
npm install --save-dev @types/node ts-node typescript
```

### Issue: Python dependencies missing

```bash
pip install pandas matplotlib numpy scipy
```

Or use conda:
```bash
conda install pandas matplotlib numpy scipy
```

### Issue: Low R² values in analysis

**Possible causes**:
- Insufficient data samples
- Noisy sensor readings
- Non-linear sensor response
- Sensor calibration drift

**Solutions**:
- Collect more calibration data
- Check sensor wiring and connections
- Review data quality plots for outliers
- Consider multi-point calibration instead of linear

### Issue: Large angle errors

**Possible causes**:
- Incorrect axis mapping
- Sensor orientation mismatch
- Gyroscope drift

**Solutions**:
- Check hardware team's axis orientation
- Apply axis transformation (see CALIBRATION_GUIDE.md)
- Use accelerometer-based angle (not gyro integration)

---

## Advanced Usage

### Custom Analysis

Modify the scripts to add custom analysis:

**TypeScript**:
```typescript
// analyze_calibration.ts
function customAnalysis(data: CalibrationRow[]) {
  // Your custom logic here
}
```

**Python**:
```python
# visualize_calibration.py
def custom_plot(df, output_dir):
    # Your custom plotting logic
    pass
```

### Batch Processing

Process multiple CSV files:

```bash
# Bash script
for file in calibration_*.csv; do
  echo "Processing $file"
  python scripts/visualize_calibration.py "$file"
  npx ts-node scripts/analyze_calibration.ts "$file"
done
```

---

## Files Generated

After running the scripts, you'll have:

```
project_root/
├── calibration_data.csv          # Input CSV
├── calibration_output.ts         # Generated constants
└── calibration_plots/            # Visualization directory
    ├── hall_sensor_calibration.png
    ├── force_distribution.png
    ├── depth_force_relationship.png
    ├── position_heatmap.png
    ├── angle_calibration.png
    ├── time_series.png
    └── analysis_report.txt
```

---

## Next Steps

1. **Wait for CSV files** from hardware team
2. **Run visualization** to check data quality
3. **Run analysis** to generate calibration constants
4. **Update app** with new constants
5. **Test** with sensor-debug screen
6. **Iterate** if needed

**Documentation**:
- See `docs/CALIBRATION_GUIDE.md` for detailed calibration theory
- See `lib/calibration.ts` for implementation details
- See `app/sensor-debug.tsx` for testing tools

---

**Questions?** Review the calibration guide or consult with the hardware team.

**Let's calibrate these sensors! 🚀**
