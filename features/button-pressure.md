# Button Pressure

## What It Is About
Average pressure applied when pressing buttons or tapping the screen. On touch devices, this is the force of the touch; on mouse devices, a default proxy value is used.

## How It Is Calculated
```
// On touch (Touch API):
force = touch.force ?? touch.webkitForce ?? 0
radiusX = touch.radiusX || touch.webkitRadiusX || 0
radiusY = touch.radiusY || touch.webkitRadiusY || 0

// Samsung devices report force=1.0 always but contact area varies with pressure
if force == 1.0 and radiusX > 0 and radiusY > 0:
  pressure = min(1.0, (radiusX * radiusY) / 100)  // touch area proxy
else:
  pressure = force

if pressure > 0:
  buttonPressures.push(pressure)

// On pointer (PointerEvent, non-touch only):
pressure = event.pressure
if pressure > 0:
  buttonPressures.push(pressure)

averageButtonPressure = mean(buttonPressures)
```

## SI Unit
dimensionless (normalized 0.0–1.0)

## Physical Device Used
Pressure-sensitive touchscreen (3D Touch / Force Touch) or stylus. On web: `Touch.force` (with `webkitForce` fallback for Android WebView) or `PointerEvent.pressure`. On devices without pressure support, `force`/`pressure` returns `0` and the reading is skipped — no synthetic value is substituted. Samsung devices report `force = 1.0` for every touch (no variable force support); for these devices, a pressure proxy is computed from the touch contact area (`radiusX * radiusY / 100`), which varies with how hard the user presses. Devices with real variable force (e.g., iPhone 3D Touch) use the raw `force` value directly.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Average button pressure | float | Mean pressure across all taps (0.0–1.0) |

## Bot Detection Rationale
Humans apply varying pressure — some taps are light, some firm. Bots either have no pressure data (no readings recorded) or perfectly uniform pressure. A standard deviation of 0 across all taps is suspicious. Real pressure values vary even for the same user. On Samsung devices that report `force = 1.0` always, the touch contact area proxy provides real variation — harder presses produce larger contact areas. A session where every pressure reading is exactly the same may indicate a device that doesn't support granular pressure or a bot.
