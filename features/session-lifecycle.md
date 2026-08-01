# Session Lifecycle

## What It Is About
Records the start time, end time, and total duration of the telemetry session. Provides the temporal envelope for all other metrics.

## How It Is Calculated
```
// On startSimulation():
sessionStartedAt = new Date().toISOString()
simulationStartedRef = true

// On endSimulation():
sessionEndedAt = new Date().toISOString()
startMs = new Date(sessionStartedAt).getTime()
sessionDurationMs = Date.now() - startMs
```

## SI Unit
- Session started at: ISO 8601 datetime string
- Session ended at: ISO 8601 datetime string
- Session duration: milliseconds (ms)

## Physical Device Used
No sensor required. Uses system clock (`Date.now()`, `performance.now()`).

## Export Columns
| Column | Type | Description |
|---|---|---|
| Session started at | string | ISO 8601 start timestamp |
| Session ended at | string | ISO 8601 end timestamp |
| Session duration (ms) | integer | Total duration in milliseconds |

## Bot Detection Rationale
Session duration provides context for all other metrics. A 5-second session completing a 4-step banking flow is inhuman. Bots may have near-zero duration (instant execution) or perfectly round durations. Humans take variable time (30s–5min) depending on familiarity. Cross-referencing duration with event count gives events-per-second, which should be within human capability (typically 1–5 events/second for deliberate interactions).
