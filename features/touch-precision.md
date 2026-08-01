# Touch Precision

## What It Is About
Measures how far the user's tap point was from the center of the target element (button, input, link). Quantifies motor accuracy — humans tap with some offset, bots tap dead center.

## How It Is Calculated
```
// On pointer down:
// Walk up DOM to find the real clickable element (not a child icon)
let targetEl = e.target
for up to 5 parent levels:
  if targetEl.width >= 50px or tag is BUTTON/INPUT/A/SELECT: break
  targetEl = targetEl.parentElement

rect = targetEl.getBoundingClientRect()
centerX = rect.left + rect.width / 2
centerY = rect.top + rect.height / 2

precision = sqrt((clientX - centerX)² + (clientY - centerY)²)
touchPrecision.push(precision)

// Metrics:
averageTouchPrecision = mean(touchPrecision)
touchPrecisionVariance = population_variance(touchPrecision)
```

## SI Unit
- Avg touch precision: pixels (px)
- Touch precision variance: pixels² (px²)

## Physical Device Used
Touchscreen or mouse. Captured via `pointerdown` event coordinates and `getBoundingClientRect()`.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Avg touch precision (px) | float | Mean distance from tap to element center |
| Touch precision variance | float | Variance of tap distances |

## Bot Detection Rationale
Humans tap with 5–30px offset from center — motor imprecision is natural. Bots that use `element.click()` or dispatch synthetic events tap at exactly (0,0) or dead center, producing precision of 0 or near-0. A touch precision of exactly 0 with many taps is a bot signal. High variance in precision is human (some taps are more accurate than others). The DOM walk ensures we measure against the real button, not a tiny icon inside it.
