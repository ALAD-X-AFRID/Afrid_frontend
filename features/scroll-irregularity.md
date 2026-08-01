# Scroll Irregularity

## What It Is About
Measures the variability of scroll speed relative to the mean scroll speed. Quantifies how irregular or rhythmic the user's scrolling behavior is, using the coefficient of variation (CV).

## How It Is Calculated

### Step 1: Collect scroll speeds
Each time a scroll event fires with a non-zero delta:
```
now = current timestamp (ms)
delta = abs(current_scrollTop - previous_scrollTop)  // pixels
dt = now - lastScrollTime                              // milliseconds
if dt > 0:
  speed = delta / dt                                   // pixels per millisecond
  scrollSpeeds.append(speed)
lastScrollTime = now
```

### Step 2: Compute coefficient of variation
```
if len(scrollSpeeds) < 2:
  scrollIrregularity = 0.0

mean = sum(scrollSpeeds) / len(scrollSpeeds)
variance = sum((speed[i] - mean)² for all i) / len(scrollSpeeds)   // population variance

if mean > 0:
  scrollIrregularity = sqrt(variance) / mean
else:
  scrollIrregularity = 0.0
```

### Step 3: Round
```
scrollIrregularity = round(scrollIrregularity, 5)
```

## SI Unit
dimensionless ratio (coefficient of variation)

## Physical Device Used
Touchscreen (swipe to scroll) or mouse wheel/trackpad. Captured via `scroll` DOM events.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Scroll irregularity | float | CV of scroll speed (sqrt(variance)/mean), 5 decimal places |

## Bot Detection Rationale
Humans scroll at varying speeds — fast through familiar content, slow when reading. This produces a CV typically in the 0.1–1.5 range. Bots scroll at a constant rate, producing CV near 0. A scroll irregularity of exactly 0 with many scroll events means perfectly uniform scrolling, which is unnatural. Values above 2.0 may indicate erratic or non-human scrolling patterns.

## Worked Example
```
scrollSpeeds = [0.8, 1.2, 0.6, 1.0, 0.9]
mean = 0.9
variance = 0.04
sqrt(variance) = 0.2
scrollIrregularity = 0.2 / 0.9 = 0.22222
```
