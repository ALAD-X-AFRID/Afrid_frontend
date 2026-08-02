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
Bots most commonly inject values directly into the DOM (`element.value = "..."` + dispatch change event), which produces zero keystrokes, zero paste events, and zero autofill events — the primary detection signal is zero keystrokes with completed forms. Some bots simulate paste via clipboard API or `insertFromPaste` events to appear more human. Excessive pasting (all fields pasted, zero typed) is suspicious. Occasional pastes mixed with typing is normal human behavior (password managers, copying account numbers).
