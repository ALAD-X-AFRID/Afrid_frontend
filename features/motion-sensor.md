# Motion Sensor

## What It Is About
Counts accelerometer events recorded during the session. Measures whether the device was in motion (handheld, walking) or stationary (on a desk, in a bot server).

## How It Is Calculated
```
if (now - lastMotionAt < 250ms) return  // throttle to 4Hz max
sensor.motionEvents += 1
```
Each accelerometer reading (x, y, z) from `DeviceMotionEvent` (web) or `@capacitor/motion` (native) increments the count, throttled to one event per 250ms.

## SI Unit
count (integer)

## Physical Device Used
Accelerometer (MEMS chip in smartphone/tablet). On web: `DeviceMotionEvent` API. On native: `@capacitor/motion` plugin.

**iOS requirement:** iOS 13+ requires calling `DeviceMotionEvent.requestPermission()` after a user gesture (e.g., login button click) before motion events are available. The simulation calls `requestMotionPermission()` on login to handle this. Without it, motion sensors will NOT work on iOS Safari or iOS WebView.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Motion checks | integer | Total accelerometer readings (throttled) |

## Bot Detection Rationale
Humans hold phones in their hands, producing constant micro-movements. Bots run on servers with no accelerometer — motion checks will be 0 or extremely low. A completed session with zero motion events is suspicious for a mobile device.
