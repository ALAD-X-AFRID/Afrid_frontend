# Typing Actions

## What It Is About
Total number of keystrokes recorded across all input fields during the simulation. Measures how much typing the user performed.

## How It Is Calculated
```
totalKeystrokes = sum of keystrokes.length across all field states
```
Each `keydown` event on an input field increments the keystroke count for that field.

## SI Unit
count (integer)

## Physical Device Used
Keyboard (physical or virtual/on-screen). Captured via `keydown` DOM events.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Typing actions | integer | Total keystrokes across all fields |

## Bot Detection Rationale
Bots often set field values programmatically (no keystrokes) or type at inhuman speeds. A session with zero keystrokes but completed forms indicates autofill or direct DOM manipulation. Conversely, perfectly uniform keystroke counts per field suggest scripted input.
