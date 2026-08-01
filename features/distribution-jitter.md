# Distribution Jitter

## What It Is About
Measures the irregularity of time intervals between consecutive telemetry events. Quantifies how "rhythmic" or "random" the user's interaction pattern is.

## How It Is Calculated
```
timestamps = sorted list of all event timestamps (ms)
deltas = [timestamps[i] - timestamps[i-1] for i in 1..n]

jitterSum = sum of |deltas[i] - deltas[i-1]| for i in 1..len(deltas)
distributionJitter = jitterSum / (len(deltas) - 1)
```
This is the mean absolute difference between consecutive inter-event intervals — a measure of timing irregularity.

## SI Unit
milliseconds (ms)

## Physical Device Used
No sensor required. Computed from event timestamps in the application runtime.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Distribution jitter | float | Mean absolute difference of consecutive inter-event intervals (ms) |

## Bot Detection Rationale
Humans interact with variable timing — they pause, speed up, hesitate. Bots execute with near-constant intervals, producing very low jitter. A distribution jitter near 0 means perfectly regular event spacing, which is unnatural for human behavior. Higher jitter indicates organic, human-like interaction.
