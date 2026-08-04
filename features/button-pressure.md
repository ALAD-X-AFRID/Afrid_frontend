# Button Pressure

## What It Is About
Average pressure applied when pressing buttons or tapping the screen. On touch devices, this is the force of the touch; on mouse devices, a default proxy value is used.

## How It Is Calculated
```
// On touch (Touch API):
force = touch.force ?? touch.webkitForce ?? 0
if force > 0:
  buttonPressures.push(force)

// On pointer (PointerEvent, non-touch only):
pressure = event.pressure
if pressure > 0:
  buttonPressures.push(pressure)

averageButtonPressure = mean(buttonPressures)
```

## SI Unit
dimensionless (normalized 0.0–1.0)

## Physical Device Used
Pressure-sensitive touchscreen (3D Touch / Force Touch) or stylus. On web: `Touch.force` (with `webkitForce` fallback for Android WebView) or `PointerEvent.pressure`. On devices without pressure support, `force`/`pressure` returns `0` and the reading is skipped — no synthetic value is substituted. Some Android tablets report `force = 1.0` for every touch; this raw value is recorded as-is.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Average button pressure | float | Mean pressure across all taps (0.0–1.0) |

## Bot Detection Rationale
Humans apply varying pressure — some taps are light, some firm. Bots either have no pressure data (no readings recorded) or perfectly uniform pressure. A standard deviation of 0 across all taps is suspicious. Real pressure values vary even for the same user. Note: some Android tablets report a constant `force = 1.0` for every touch — this is the raw device value and is recorded as-is. A session where every pressure reading is exactly the same (e.g., all 1.0) may indicate a device that doesn't support granular pressure, not necessarily a bot.
