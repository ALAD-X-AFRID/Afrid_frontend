# Field Dwell Time

## What It Is About
Measures how long the user spent focused on each input field (dwell time) and the total time across all fields. Quantifies reading and typing engagement per field.

## How It Is Calculated
```
// On field focus (onFocus):
fieldFocusRef[fieldName].focusAt = performance.now()
fieldFocusRef[fieldName].visitCount += 1

// On field blur (onBlur):
dwellTime = performance.now() - fieldFocusRef[fieldName].focusAt
fieldFocusRef[fieldName].totalFocusMs += dwellTime

// Metrics:
totalFieldFocusTime = sum of totalFocusMs across all fields
averageFieldDwell = totalFieldFocusTime / number of fields
```

## SI Unit
- Avg field dwell: milliseconds (ms)
- Total field focus: milliseconds (ms)

## Physical Device Used
No sensor required. Captured via `focus` and `blur` DOM events on input fields.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Avg field dwell (ms) | float | Mean time spent per field |
| Total field focus (ms) | float | Total time across all fields |

## Bot Detection Rationale
Humans spend variable time on fields — longer on password fields, shorter on familiar inputs. Bots fill fields near-instantly with near-zero dwell time. An average field dwell below 100ms is suspicious (humans take 500–5000ms per field). Total field focus time should roughly correlate with keystroke count — many keystrokes with near-zero dwell time indicates scripted input.
