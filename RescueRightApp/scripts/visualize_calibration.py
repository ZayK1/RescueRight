#!/usr/bin/env python3
"""
Calibration Data Visualization Script

This script creates visualizations of calibration data to help identify:
- Force calibration quality
- Sensor correlations
- Outliers and noise
- Position/angle distributions

Requirements:
    pip install pandas matplotlib numpy scipy

Usage:
    python scripts/visualize_calibration.py <path_to_csv>

Example:
    python scripts/visualize_calibration.py calibration_data.csv
"""

import sys
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import linregress
import os

def load_calibration_data(csv_path):
    """Load and validate CSV data"""
    print(f"Loading data from: {csv_path}")

    try:
        df = pd.read_csv(csv_path)
        print(f"✓ Loaded {len(df)} samples")
        print(f"✓ Columns: {', '.join(df.columns)}")
        return df
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        sys.exit(1)

def plot_hall_sensor_calibration(df, output_dir):
    """Plot Hall sensor ADC vs Force for calibration analysis"""
    print("\n=== Generating Hall Sensor Calibration Plots ===")

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('Hall Sensor Force Calibration', fontsize=16, fontweight='bold')

    hall_sensors = ['hall1', 'hall2', 'hall3', 'hall4']

    for idx, sensor in enumerate(hall_sensors):
        ax = axes[idx // 2, idx % 2]

        # Scatter plot
        ax.scatter(df[sensor], df['appliedForce'], alpha=0.5, s=20)

        # Linear regression
        slope, intercept, r_value, p_value, std_err = linregress(df[sensor], df['appliedForce'])

        # Plot regression line
        x_line = np.array([df[sensor].min(), df[sensor].max()])
        y_line = slope * x_line + intercept
        ax.plot(x_line, y_line, 'r-', linewidth=2, label=f'Linear Fit (R²={r_value**2:.3f})')

        # Labels
        ax.set_xlabel(f'{sensor.upper()} ADC Value', fontsize=11)
        ax.set_ylabel('Applied Force (N)', fontsize=11)
        ax.set_title(f'{sensor.upper()}: {slope:.6f} N/ADC', fontsize=12)
        ax.legend()
        ax.grid(True, alpha=0.3)

        print(f"  {sensor}: Slope = {slope:.6f} N/ADC, R² = {r_value**2:.3f}")

    plt.tight_layout()
    output_path = os.path.join(output_dir, 'hall_sensor_calibration.png')
    plt.savefig(output_path, dpi=150)
    print(f"✓ Saved: {output_path}")
    plt.close()

def plot_force_distribution(df, output_dir):
    """Plot force distribution across all Hall sensors"""
    print("\n=== Generating Force Distribution Plot ===")

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle('Hall Sensor Force Distribution', fontsize=16, fontweight='bold')

    # Sensor readings distribution
    ax = axes[0]
    hall_data = df[['hall1', 'hall2', 'hall3', 'hall4']]
    hall_data.boxplot(ax=ax)
    ax.set_ylabel('ADC Value', fontsize=11)
    ax.set_title('Hall Sensor ADC Distributions', fontsize=12)
    ax.grid(True, alpha=0.3)

    # Force balance across sensors
    ax = axes[1]
    df['hall_avg'] = df[['hall1', 'hall2', 'hall3', 'hall4']].mean(axis=1)
    df['hall_std'] = df[['hall1', 'hall2', 'hall3', 'hall4']].std(axis=1)

    scatter = ax.scatter(df['hall_avg'], df['hall_std'], c=df['appliedForce'],
                        cmap='viridis', alpha=0.6, s=30)
    ax.set_xlabel('Average ADC Value', fontsize=11)
    ax.set_ylabel('Std Dev of ADC Values', fontsize=11)
    ax.set_title('Force Distribution Balance', fontsize=12)
    ax.grid(True, alpha=0.3)

    cbar = plt.colorbar(scatter, ax=ax)
    cbar.set_label('Applied Force (N)', fontsize=10)

    plt.tight_layout()
    output_path = os.path.join(output_dir, 'force_distribution.png')
    plt.savefig(output_path, dpi=150)
    print(f"✓ Saved: {output_path}")
    plt.close()

def plot_depth_force_relationship(df, output_dir):
    """Plot compression depth vs force relationship"""
    print("\n=== Generating Depth-Force Relationship Plot ===")

    fig, ax = plt.subplots(figsize=(10, 6))

    # Scatter plot
    ax.scatter(df['appliedForce'], df['compressionDepth'], alpha=0.5, s=30)

    # Linear regression
    slope, intercept, r_value, p_value, std_err = linregress(df['appliedForce'], df['compressionDepth'])

    # Plot regression line
    x_line = np.array([df['appliedForce'].min(), df['appliedForce'].max()])
    y_line = slope * x_line + intercept
    ax.plot(x_line, y_line, 'r-', linewidth=2,
            label=f'Linear Fit: {slope:.4f} cm/N (R²={r_value**2:.3f})')

    # Labels
    ax.set_xlabel('Applied Force (N)', fontsize=12)
    ax.set_ylabel('Compression Depth (cm)', fontsize=12)
    ax.set_title('Depth-Force Calibration Relationship', fontsize=14, fontweight='bold')
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    output_path = os.path.join(output_dir, 'depth_force_relationship.png')
    plt.savefig(output_path, dpi=150)
    print(f"✓ Saved: {output_path}")
    print(f"  Force-to-Depth Ratio: {slope:.6f} cm/N")
    print(f"  R²: {r_value**2:.3f}")
    plt.close()

def plot_position_heatmap(df, output_dir):
    """Plot position heatmap showing where force was applied"""
    print("\n=== Generating Position Heatmap ===")

    fig, ax = plt.subplots(figsize=(10, 8))

    # Create heatmap scatter
    scatter = ax.scatter(df['sensorPositionX'], df['sensorPositionY'],
                        c=df['appliedForce'], s=100, cmap='hot', alpha=0.6)

    ax.set_xlabel('X Position (cm)', fontsize=12)
    ax.set_ylabel('Y Position (cm)', fontsize=12)
    ax.set_title('Force Application Position Heatmap', fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    ax.set_aspect('equal')

    cbar = plt.colorbar(scatter, ax=ax)
    cbar.set_label('Applied Force (N)', fontsize=11)

    plt.tight_layout()
    output_path = os.path.join(output_dir, 'position_heatmap.png')
    plt.savefig(output_path, dpi=150)
    print(f"✓ Saved: {output_path}")
    plt.close()

def plot_angle_calibration(df, output_dir):
    """Plot angle calibration analysis"""
    print("\n=== Generating Angle Calibration Plot ===")

    # Check if MPU data exists
    if 'mpu1_accel_x' not in df.columns or 'mpu1_accel_z' not in df.columns:
        print("⚠️  No MPU accelerometer data found, skipping angle plots")
        return

    # Calculate pitch angle from accelerometer
    accel_scale = 16384  # ±2g range
    df['calculated_angle'] = np.arctan2(
        df['mpu1_accel_x'] / accel_scale,
        df['mpu1_accel_z'] / accel_scale
    ) * (180 / np.pi)

    df['angle_error'] = df['calculated_angle'] - df['angle']

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle('Angle Calibration Analysis', fontsize=16, fontweight='bold')

    # Ground truth vs calculated
    ax = axes[0]
    ax.scatter(df['angle'], df['calculated_angle'], alpha=0.5, s=30)

    # Perfect calibration line
    min_angle = min(df['angle'].min(), df['calculated_angle'].min())
    max_angle = max(df['angle'].max(), df['calculated_angle'].max())
    ax.plot([min_angle, max_angle], [min_angle, max_angle], 'r--',
            linewidth=2, label='Perfect Calibration')

    ax.set_xlabel('Ground Truth Angle (°)', fontsize=11)
    ax.set_ylabel('Calculated Angle (°)', fontsize=11)
    ax.set_title('Angle Accuracy', fontsize=12)
    ax.legend()
    ax.grid(True, alpha=0.3)

    # Error distribution
    ax = axes[1]
    ax.hist(df['angle_error'], bins=30, edgecolor='black', alpha=0.7)
    ax.axvline(df['angle_error'].mean(), color='red', linestyle='--',
               linewidth=2, label=f'Mean Error: {df["angle_error"].mean():.2f}°')
    ax.set_xlabel('Angle Error (°)', fontsize=11)
    ax.set_ylabel('Frequency', fontsize=11)
    ax.set_title('Angle Error Distribution', fontsize=12)
    ax.legend()
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    output_path = os.path.join(output_dir, 'angle_calibration.png')
    plt.savefig(output_path, dpi=150)
    print(f"✓ Saved: {output_path}")
    print(f"  Avg Absolute Error: {df['angle_error'].abs().mean():.2f}°")
    print(f"  Max Error: {df['angle_error'].abs().max():.2f}°")
    print(f"  Systematic Offset: {df['angle_error'].mean():.2f}°")
    plt.close()

def plot_time_series(df, output_dir):
    """Plot sensor data over time"""
    print("\n=== Generating Time Series Plots ===")

    fig, axes = plt.subplots(3, 1, figsize=(14, 10))
    fig.suptitle('Sensor Data Time Series', fontsize=16, fontweight='bold')

    # Force over time
    ax = axes[0]
    ax.plot(df['timestamp'], df['appliedForce'], 'b-', linewidth=1.5)
    ax.set_xlabel('Timestamp', fontsize=11)
    ax.set_ylabel('Applied Force (N)', fontsize=11)
    ax.set_title('Force vs Time', fontsize=12)
    ax.grid(True, alpha=0.3)

    # Hall sensors over time
    ax = axes[1]
    ax.plot(df['timestamp'], df['hall1'], label='Hall 1', linewidth=1, alpha=0.8)
    ax.plot(df['timestamp'], df['hall2'], label='Hall 2', linewidth=1, alpha=0.8)
    ax.plot(df['timestamp'], df['hall3'], label='Hall 3', linewidth=1, alpha=0.8)
    ax.plot(df['timestamp'], df['hall4'], label='Hall 4', linewidth=1, alpha=0.8)
    ax.set_xlabel('Timestamp', fontsize=11)
    ax.set_ylabel('ADC Value', fontsize=11)
    ax.set_title('Hall Sensors vs Time', fontsize=12)
    ax.legend()
    ax.grid(True, alpha=0.3)

    # Depth over time
    ax = axes[2]
    ax.plot(df['timestamp'], df['compressionDepth'], 'g-', linewidth=1.5)
    ax.set_xlabel('Timestamp', fontsize=11)
    ax.set_ylabel('Compression Depth (cm)', fontsize=11)
    ax.set_title('Depth vs Time', fontsize=12)
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    output_path = os.path.join(output_dir, 'time_series.png')
    plt.savefig(output_path, dpi=150)
    print(f"✓ Saved: {output_path}")
    plt.close()

def generate_summary_report(df, output_dir):
    """Generate text summary report"""
    print("\n=== Generating Summary Report ===")

    report = []
    report.append("=" * 70)
    report.append("  RESCUERIGHT CALIBRATION DATA ANALYSIS REPORT")
    report.append("=" * 70)
    report.append("")

    # Dataset overview
    report.append("DATASET OVERVIEW:")
    report.append(f"  Total Samples: {len(df)}")
    report.append(f"  Columns: {len(df.columns)}")
    report.append("")

    # Force statistics
    report.append("FORCE STATISTICS:")
    report.append(f"  Min Force: {df['appliedForce'].min():.2f} N")
    report.append(f"  Max Force: {df['appliedForce'].max():.2f} N")
    report.append(f"  Mean Force: {df['appliedForce'].mean():.2f} N")
    report.append(f"  Std Dev: {df['appliedForce'].std():.2f} N")
    report.append("")

    # Hall sensor statistics
    report.append("HALL SENSOR STATISTICS:")
    for sensor in ['hall1', 'hall2', 'hall3', 'hall4']:
        report.append(f"  {sensor.upper()}:")
        report.append(f"    Min: {df[sensor].min():.0f}, Max: {df[sensor].max():.0f}")
        report.append(f"    Mean: {df[sensor].mean():.1f}, Std Dev: {df[sensor].std():.1f}")
    report.append("")

    # Depth statistics
    report.append("COMPRESSION DEPTH STATISTICS:")
    report.append(f"  Min Depth: {df['compressionDepth'].min():.2f} cm")
    report.append(f"  Max Depth: {df['compressionDepth'].max():.2f} cm")
    report.append(f"  Mean Depth: {df['compressionDepth'].mean():.2f} cm")
    report.append(f"  Std Dev: {df['compressionDepth'].std():.2f} cm")
    report.append("")

    # Position coverage
    report.append("POSITION COVERAGE:")
    report.append(f"  X Range: {df['sensorPositionX'].min():.1f} - {df['sensorPositionX'].max():.1f} cm")
    report.append(f"  Y Range: {df['sensorPositionY'].min():.1f} - {df['sensorPositionY'].max():.1f} cm")
    report.append(f"  Unique Positions: {len(df[['sensorPositionX', 'sensorPositionY']].drop_duplicates())}")
    report.append("")

    # Angle coverage
    report.append("ANGLE COVERAGE:")
    report.append(f"  Min Angle: {df['angle'].min():.1f}°")
    report.append(f"  Max Angle: {df['angle'].max():.1f}°")
    report.append(f"  Mean Angle: {df['angle'].mean():.1f}°")
    report.append("")

    report.append("=" * 70)
    report.append("END OF REPORT")
    report.append("=" * 70)

    report_text = "\n".join(report)

    # Save to file
    output_path = os.path.join(output_dir, 'analysis_report.txt')
    with open(output_path, 'w') as f:
        f.write(report_text)

    print(report_text)
    print(f"\n✓ Saved: {output_path}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/visualize_calibration.py <path_to_csv>")
        print("Example: python scripts/visualize_calibration.py calibration_data.csv")
        sys.exit(1)

    csv_path = sys.argv[1]

    if not os.path.exists(csv_path):
        print(f"❌ Error: File not found: {csv_path}")
        sys.exit(1)

    # Create output directory
    output_dir = os.path.join(os.path.dirname(csv_path), 'calibration_plots')
    os.makedirs(output_dir, exist_ok=True)

    print("=" * 70)
    print("  RESCUERIGHT CALIBRATION DATA VISUALIZATION")
    print("=" * 70)
    print(f"\nOutput Directory: {output_dir}\n")

    # Load data
    df = load_calibration_data(csv_path)

    # Generate plots
    plot_hall_sensor_calibration(df, output_dir)
    plot_force_distribution(df, output_dir)
    plot_depth_force_relationship(df, output_dir)
    plot_position_heatmap(df, output_dir)
    plot_angle_calibration(df, output_dir)
    plot_time_series(df, output_dir)

    # Generate summary report
    generate_summary_report(df, output_dir)

    print("\n" + "=" * 70)
    print("✓ VISUALIZATION COMPLETE")
    print("=" * 70)
    print(f"\nAll plots and reports saved to: {output_dir}")
    print("\nNext steps:")
    print("1. Review the generated plots for data quality")
    print("2. Check for outliers, noise, or sensor issues")
    print("3. Run TypeScript analysis script to generate calibration constants")
    print("4. Integrate constants into lib/calibration.ts\n")

if __name__ == '__main__':
    main()
