# Touch Area Deformation

## What It Is About
Counts instances where the touch contact area was deformed (non-circular), indicating a real finger press rather than a synthetic tap event.

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

## SI Unit
count (integer)

## Physical Device Used
Capacitive touchscreen with touch area reporting. On web: `Touch.radiusX` and `Touch.radiusY`. Not all devices/browsers report these values.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Touch area deformation | integer | Count of non-circular touch events |

## Bot Detection Rationale
Real fingers produce elliptical touch areas because they press at angles. Synthetic tap events (bots) produce either no touch area (radiusX/Y = 0) or perfectly circular areas (deformation = 0). A session with many taps but zero touch area deformations is suspicious. Note: some browsers don't report touch radius, so 0 may be inconclusive on certain devices.
