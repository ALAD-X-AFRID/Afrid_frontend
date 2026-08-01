# Button Pressure

## What It Is About
Average pressure applied when pressing buttons or tapping the screen. On touch devices, this is the force of the touch; on mouse devices, a default proxy value is used.

## How It Is Calculated
```
// On touch (Touch API):
force = touch.force || 0.5
buttonPressures.push(force)

// On pointer (PointerEvent):
pressure = event.pressure || 0.5
buttonPressures.push(pressure)

averageButtonPressure = mean(buttonPressures)
```

## SI Unit
dimensionless (normalized 0.0–1.0)

## Physical Device Used
Pressure-sensitive touchscreen (3D Touch / Force Touch) or stylus. On web: `Touch.force` or `PointerEvent.pressure`. On devices without pressure support, a default of 0.5 is used.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Average button pressure | float | Mean pressure across all taps (0.0–1.0) |

## Bot Detection Rationale
Humans apply varying pressure — some taps are light, some firm. Bots either have no pressure data (default 0.5 every time) or perfectly uniform pressure. A standard deviation of 0 across all taps is suspicious. Real pressure values vary even for the same user.
