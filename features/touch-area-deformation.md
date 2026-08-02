# Touch Area Deformation

## What It Is About
Measures the shape of the user's finger contact patch on the touchscreen. When a real finger presses the screen, the touch ellipse is non-circular (deformed) because fingers press at angles. Exports both a count of deformed touches and the average deformation ratio.

## How It Is Calculated
```
// On touchstart:
radiusX = touch.radiusX || 0
radiusY = touch.radiusY || 0

if radiusX > 0 and radiusY > 0:
  deformation = abs(radiusX - radiusY) / max(radiusX, radiusY)
  if deformation > 0.15:
    touchDeformations += 1
```
A deformation ratio > 0.15 means the touch ellipse is significantly non-circular, as expected from a finger pressing at an angle.

The average deformation ratio is also computed:
```
averageTouchDeformation = mean(deformationRatios)
```
Ranges from 0.0 (perfectly circular) to 1.0 (line-shaped contact).

## SI Unit
- Touch area deformation: count (integer)
- Touch area deformation ratio: dimensionless ratio (0.0–1.0)

## Physical Device Used
Capacitive touchscreen with touch area reporting. On web: `Touch.radiusX` and `Touch.radiusY`. On native (APK): Capacitor WebView reports these values on Android. iOS Safari does not report touch radius (returns 0), so deformation will be 0 on iOS — this is a platform limitation.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Touch area deformation | integer | Count of touches where deformation > 0.15 |
| Touch area deformation ratio | float | Average deformation ratio (0.0–1.0), 4 decimal places |

## Bot Detection Rationale
Real fingers produce elliptical touch areas because they press at angles — the contact patch deforms based on finger angle, pressure, and which finger is used. Synthetic tap events (bots) produce either no touch area (radiusX/Y = 0) or perfectly circular areas (deformation = 0). A session with many taps but zero touch area deformations is suspicious. The average deformation ratio provides a continuous metric — humans typically show 0.15–0.50, while bots show 0.0. This feature is independent of app UI (swipe/no-swipe) because it measures the physical finger-screen interaction at the instant of touch, before any gesture is recognized. Note: some browsers/devices don't report touch radius, so 0 may be inconclusive on certain platforms.
