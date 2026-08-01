# Touch Hold Duration

## What It Is About
Measures how long the user holds each tap (time between pointer down and pointer up). Quantifies press duration — humans hold taps for varying durations depending on intent.

## How It Is Calculated
```
// On pointer down:
pointerDownAt = performance.now()

// On pointer up:
holdDuration = performance.now() - pointerDownAt
touchHoldDurations.push(holdDuration)

// Metrics:
averageTouchHold = mean(touchHoldDurations)

// Variance (filtering out holds > 1000ms to exclude long presses):
realHolds = touchHoldDurations.filter(d => d <= 1000)
touchHoldVariance = population_variance(realHolds)
```

## SI Unit
- Avg touch hold: milliseconds (ms)
- Touch hold variance: milliseconds² (ms²)

## Physical Device Used
Touchscreen or mouse. Captured via `pointerdown` and `pointerup` DOM events.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Avg touch hold (ms) | float | Mean press duration |
| Touch hold variance | float | Variance of press durations (holds >1000ms excluded) |

## Bot Detection Rationale
Humans hold taps for 50–300ms with natural variation. Bots produce instant taps (near 0ms) or perfectly uniform hold times. A touch hold variance of 0 means every tap was held for exactly the same duration — inhuman. The 1000ms filter excludes long presses (e.g., holding the swipe control) that would otherwise inflate variance artificially. Average touch hold below 20ms is physically impossible for human interaction.
