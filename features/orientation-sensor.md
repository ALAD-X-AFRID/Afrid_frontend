# Orientation Sensor

## What It Is About
Count of device orientation (gyroscope/compass) readings during the session. Measures whether the device's orientation changed (tilting, rotating) as expected during handheld use.

## How It Is Calculated
```
if (now - lastOrientationAt < 250ms) return  // throttle to 4Hz max
sensor.orientationEvents += 1
```
Each orientation reading (alpha, beta, gamma) from `DeviceOrientationEvent` (web) or `@capacitor/motion` (native) increments the count, throttled to one event per 250ms.

## SI Unit
count (integer)

## Physical Device Used
Gyroscope/compass (MEMS chip in smartphone/tablet). On web: `DeviceOrientationEvent` API. On native: `@capacitor/motion` plugin.

**iOS requirement:** iOS 13+ requires calling `DeviceOrientationEvent.requestPermission()` after a user gesture (e.g., login button click) before orientation events are available. The simulation calls `requestMotionPermission()` on login to handle this. Without it, orientation sensors will NOT work on iOS Safari or iOS WebView.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Orientation checks | integer | Total orientation readings (throttled) |

## Bot Detection Rationale
Humans naturally tilt and rotate their phones while interacting. Bots on servers have no gyroscope — orientation checks will be 0. Even on desktop, slight device movement produces readings. Zero orientation events on a mobile session is a bot signal.
