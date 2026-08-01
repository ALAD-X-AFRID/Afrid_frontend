# Swipe Dynamics

## What It Is About
Measures swipe gesture behavior on the confirmation swipe control — whether swipes were completed or abandoned, and the curvature of the swipe path.

## How It Is Calculated
- **Swipe incomplete**: Incremented when a swipe is started but released before reaching the threshold
- **Swipe completes**: Incremented when a swipe reaches the confirmation threshold
- **Swipe curve**: Average curvature of all swipe paths (deviation from a straight line)

```
if completed:
  completedSwipes += 1
else:
  incompleteSwipes += 1

swipeCurveSamples.push(swipeCurve)
averageSwipeCurve = mean(swipeCurveSamples)
```

Swipe curve is computed as the ratio of actual path length to the straight-line distance between start and end points. A value of 1.0 = perfectly straight, higher = more curved.

## SI Unit
- Swipe incomplete: count (integer)
- Swipe completes: count (integer)
- swipe curve: dimensionless ratio (float)

## Physical Device Used
Touchscreen (capacitive). Captured via pointer/touch events on the SwipeControl component.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Swipe incomplete | integer | Abandoned swipes (released before threshold) |
| Swipe completes | integer | Successful swipes (reached threshold) |
| swipe curve | float | Average path curvature (1.0 = straight) |

## Bot Detection Rationale
Human swipes have natural curvature and variation — some are abandoned and retried. Bots produce perfectly straight swipes with no abandoned attempts. A swipe curve of exactly 1.0 with zero incomplete swipes is a strong bot signal.
