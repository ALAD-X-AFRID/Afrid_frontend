# Multi-Touch Anomalies

## What It Is About
Counts instances where multiple simultaneous touch points were detected. More than one active touch during a single-user banking task is unusual and may indicate automation or replay attacks.

## How It Is Calculated
```
// On touchstart:
if e.touches.length > 1:
  multiTouchAnomalies += 1
```

## SI Unit
count (integer)

## Physical Device Used
Capacitive touchscreen (multi-touch capable). Captured via `TouchEvent.touches.length` on `touchstart`.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Multi-touch anomalies | integer | Count of multi-touch events |

## Bot Detection Rationale
A single user performing a banking task should have one finger on the screen. Multiple simultaneous touches are rare in legitimate use. Some automation frameworks inject multiple touch points simultaneously. A high multi-touch count is suspicious, though occasional values may result from accidental palm touches.
