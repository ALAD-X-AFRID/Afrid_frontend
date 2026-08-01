# Neuromuscular Entropy

## What It Is About
Measures the combined variability of accelerometer and gyroscope readings. Quantifies how much the device physically moved and rotated during the session — a proxy for human hand tremor and micro-movement.

## How It Is Calculated
```
// Accelerometer magnitudes
accelMagnitude = sqrt(x² + y² + z²)
accelMagnitudes.push(accelMagnitude)

// Gyroscope magnitudes
gyroMagnitude = sqrt(alpha² + beta² + gamma²)
gyroMagnitudes.push(gyroMagnitude)

// Variance of each
accelVariance = population_variance(accelMagnitudes)
gyroVariance = population_variance(gyroMagnitudes)

// Neuromuscular entropy
neuromuscularEntropy = sqrt(accelVariance) + sqrt(gyroVariance)
```

## SI Unit
dimensionless (sum of standard deviations)

## Physical Device Used
Accelerometer + Gyroscope (MEMS chips). On web: `DeviceMotionEvent` + `DeviceOrientationEvent`. On native: `@capacitor/motion`.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Neuromuscular Entropy | float | sqrt(accelVariance) + sqrt(gyroVariance) |

## Bot Detection Rationale
Humans produce constant neuromuscular noise — hand tremor, breathing, micro-movements. This creates non-zero variance in sensor readings. Bots on servers have no physical sensors, producing zero entropy. Even on desktop, a human's hand on the mouse produces some accelerometer variance on laptops. Zero neuromuscular entropy is a strong bot signal.
