# Paste Detection

## What It Is About
Counts how many times the user pasted text into input fields and how many characters were pasted in total. Pasting credentials or account numbers may indicate use of a password manager, copy-paste from another source, or bot automation. Copy events (Ctrl+C / long-press → "Copy") are tracked separately — see [copy-detection.md](copy-detection.md).

## How It Is Calculated
```
// On DOM paste event (fires on long-press → "Paste" popup on mobile, Ctrl+V on desktop):
pastedText = event.clipboardData.getData("text")
totalPasteEvents += 1
totalPastedCharacters += pastedText.length
lastPasteAt = now  // prevents misclassifying the subsequent input change as autofill
```
Paste is detected via the dedicated DOM `paste` event, which fires reliably on all platforms — desktop (Ctrl+V), Android (long-press → "Paste" from context menu), and iOS (long-press → "Paste"). The `clipboardData` API provides the exact pasted text length. This replaces the previous `inputType === "insertFromPaste"` approach, which failed on Android WebView where `inputType` is often unavailable.

## SI Unit
- Paste events: count (integer)
- Pasted characters: count (integer)

## Physical Device Used
Keyboard (Ctrl+V) or touch clipboard (long-press → "Paste" popup). Detected via the DOM `paste` event and `clipboardData` API.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Paste detected | integer | Count of paste events |
| Pasted characters | integer | Total number of characters pasted across all events |

## Bot Detection Rationale
Bots most commonly inject values directly into the DOM (`element.value = "..."` + dispatch change event), which produces zero keystrokes, zero paste events, and zero autofill events — the primary detection signal is zero keystrokes with completed forms. Some bots simulate paste via clipboard API or `dispatchEvent(new ClipboardEvent('paste'))` to appear more human. Excessive pasting (all fields pasted, zero typed) is suspicious. Occasional pastes mixed with typing is normal human behavior (password managers, copying account numbers). The pasted character count helps distinguish pasting a full username (15+ chars) from pasting a short account number (4-6 chars), adding behavioral granularity.
