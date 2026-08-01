# Paste Detection

## What It Is About
Counts how many times the user pasted text into input fields. Pasting credentials or account numbers may indicate use of a password manager, copy-paste from another source, or bot automation.

## How It Is Calculated
```
// On input event:
if insertingText and insertedLength > 1:
  totalPasteEvents += 1
```
Paste is detected when an `input` event inserts multiple characters at once (length > 1) in a single operation, which is characteristic of clipboard paste behavior.

## SI Unit
count (integer)

## Physical Device Used
Keyboard (Ctrl+V) or touch clipboard. Detected via `input` DOM events comparing inserted text length.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Paste detected | integer | Count of paste events |

## Bot Detection Rationale
Humans sometimes paste (password managers, copying account numbers). Bots frequently paste or inject entire field values at once. A paste count equal to the number of fields, with zero manual keystrokes, is a strong bot signal. Occasional pastes mixed with typing is normal human behavior.
