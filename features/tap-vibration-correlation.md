# Tap-to-Vibration Correlation

## What It Is About
Measures the ratio of taps that produced a detectable accelerometer response (vibration) within 300ms. Correlates physical taps with device motion to verify the taps came from a physical touch on the device.

## How It Is Calculated
```
// On tap (pointer down):
sensor.lastTapTime = performance.now()
sensor.tapAlreadyCorrelated = false

// On accelerometer reading (within 300ms of tap):
diff = performance.now() - sensor.lastTapTime
if diff <= 300 and not sensor.tapAlreadyCorrelated:
  magnitude = sqrt(x² + y² + z²)
  motionDelta = abs(magnitude - 9.81)  // deviation from gravity
  if motionDelta > 0.5:
    correlatedTaps += 1
    sensor.tapAlreadyCorrelated = true

// Final metric:
tapVibrationCorrelation = correlatedTaps / totalTaps
```

## SI Unit
dimensionless ratio (0.0–1.0)

## Physical Device Used
Accelerometer (MEMS chip). Requires both touchscreen input and accelerometer readings simultaneously. On web: `DeviceMotionEvent` + pointer events. On native: `@capacitor/motion`.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Tap-to-vibration correlation | float | Ratio of taps with accelerometer response (0.0–1.0) |

## Bot Detection Rationale
When a human taps a physical screen, the accelerometer detects a small vibration from the finger impact. Bots generate taps programmatically — no physical vibration occurs. A correlation of 0.0 with many taps is a strong bot signal. Humans typically show 0.1–0.5 correlation (not every tap produces enough motion to exceed the threshold). This is one of the strongest physical bot detection signals on mobile.
