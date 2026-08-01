# Task Completion Speed

## What It Is About
Measures how long the user takes to complete the full banking simulation, and the average idle time between consecutive telemetry events. Fast completion with near-zero idle time suggests automation.

## How It Is Calculated

### Task Completion Speed
```
timestamps = sorted list of all event timestamps (ms)
task_completion_speed = (last_timestamp - first_timestamp) / 1000
```
Result is in seconds.

### Inter-Event Idle Duration
```
idle_ms = sum of (timestamps[i] - timestamps[i-1]) for all consecutive pairs
inter_event_idle = idle_ms / (count - 1) / 1000
```
Average gap between events, in seconds.

## SI Unit
- task_completion_speed: seconds (s)
- Inter_event_idle_duration: seconds (s)

## Physical Device Used
No sensor required. Computed from event timestamps in the application runtime.

## Export Columns
| Column | Type | Description |
|---|---|---|
| task_completion_speed | float | Total time from first to last event (seconds) |
| Inter_event_idle_duration | float | Average time between consecutive events (seconds) |

## Bot Detection Rationale
Bots complete tasks in near-constant time with minimal idle gaps. Humans pause to read, think, and navigate. An inter-event idle near 0 with high event count is a strong bot indicator. Extremely fast task completion (<10s for a multi-step flow) is also suspicious.
