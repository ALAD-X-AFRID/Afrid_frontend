# Keystroke Timing

## What It Is About
Measures the average time a key is held down (dwell) and the average time between releasing one key and pressing the next (flight/gap). These are fundamental keystroke dynamics biometrics.

## How It Is Calculated

### Average Key Hold (Dwell)
```
// On keydown: record timestamp
keyDownAt = performance.now()

// On keyup: compute dwell
dwell = performance.now() - keyDownAt
dwellValues.push(dwell)

averageDwell = mean(dwellValues)
```

### Average Key Gap (Flight)
```
// On keyup: record timestamp
keyUpAt = performance.now()

// On next keydown: compute flight
flight = performance.now() - keyUpAt
flightValues.push(flight)

averageFlight = mean(flightValues)
```

## SI Unit
milliseconds (ms)

## Physical Device Used
Keyboard (physical or virtual). Captured via `keydown` and `keyup` DOM events.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Average key hold (ms) | float | Mean key dwell time |
| Average key gap (ms) | float | Mean time between keys (flight) |

## Bot Detection Rationale
Keystroke timing is one of the strongest biometric signals. Humans have characteristic dwell (50–200ms) and flight (50–300ms) times with natural variation. Bots either type instantaneously (near 0ms dwell) or with perfectly uniform timing. Average key hold below 10ms is physically impossible for human typing. The ratio of dwell to flight is also user-specific and hard to fake.
