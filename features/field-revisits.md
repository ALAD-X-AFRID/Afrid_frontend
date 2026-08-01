# Field Revisits

## What It Is About
Counts how many times the user revisited (re-focused) input fields after leaving them. Measures correction behavior — humans go back to fields to fix mistakes.

## How It Is Calculated
```
// On field focus:
fieldFocusRef[fieldName].visitCount += 1

// Final metric:
totalFieldRevisits = sum of max(0, visitCount - 1) across all fields
```
The first focus on a field is the initial visit; each subsequent focus is a revisit.

## SI Unit
count (integer)

## Physical Device Used
No sensor required. Captured via `focus` events on input fields.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Field revisits | integer | Total re-focus events across all fields |

## Bot Detection Rationale
Humans revisit fields — they go back to check a value, fix a typo, or re-read what they entered. Bots fill fields in sequence without revisiting. Zero field revisits in a multi-field form is mildly suspicious. High revisits correlate with corrections and are a strong human signal. The pattern of revisits (which fields, how many times) is also user-specific.
