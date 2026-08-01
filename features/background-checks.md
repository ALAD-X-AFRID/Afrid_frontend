# Background Checks

## What It Is About
Counts how many times the page visibility changed (user switched tabs, minimized browser, or the screen turned off). Measures user distraction and app-switching behavior.

## How It Is Calculated
```
document.addEventListener("visibilitychange", handler)

// On visibility change:
sensor.visibilityChanges += 1
statsRef.current.totalVisibilityChanges = sensor.visibilityChanges

// Also tracks hidden duration:
if state === "hidden":
  sensor.lastHiddenAt = performance.now()
else if sensor.lastHiddenAt:
  sensor.hiddenMs += performance.now() - sensor.lastHiddenAt
```

## SI Unit
count (integer)

## Physical Device Used
No sensor required. Uses the `visibilitychange` DOM event and `document.visibilityState`.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Background checks | integer | Total visibility change events |

## Bot Detection Rationale
Humans switch apps, get notifications, and briefly leave the page. Bots stay focused on the page with zero visibility changes. However, zero background checks is normal for short sessions. The key signal is the pattern — a human might leave once or twice; a bot never leaves. Combined with `hiddenMs` (total time hidden), this distinguishes human multitasking from bot persistence.
