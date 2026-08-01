# Text Fixes

## What It Is About
Total number of corrections (backspaces, deletions) the user made while typing. Measures how often the user fixed mistakes during input.

## How It Is Calculated
```
totalCorrections = sum of corrections across all field states
```
A correction is counted when the field value decreases in length (character deleted) or changes without growing (replacement).

## SI Unit
count (integer)

## Physical Device Used
Keyboard (physical or virtual). Detected via `input` event comparison with previous field value.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Text fixes | integer | Total corrections (backspaces/deletions) |

## Bot Detection Rationale
Humans make mistakes — they backspace, delete, and retype. Bots typically inject perfect text with zero corrections. A session with many keystrokes but zero text fixes is suspicious. The ratio of corrections to keystrokes is a strong human signal.
