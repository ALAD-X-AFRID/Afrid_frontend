# Copy Detection

## What It Is About
Counts the number of times a user copies text from an input field (Ctrl+C on desktop, long-press → "Copy" on mobile). Copy events indicate the user is duplicating field content, which may suggest careful behavior or, in excessive counts, scripted data duplication.

## How It Is Calculated
```
// On DOM copy event (React onCopy):
copiedText = event.clipboardData.getData("text")
totalCopyEvents += 1
```
The copy event fires reliably on both desktop (Ctrl+C) and mobile (long-press → "Copy" popup). The copied text length is recorded for telemetry but not exported as a separate column — only the event count is exported.

## SI Unit
- Copy events: count (integer)

## Physical Device Used
No physical sensor required — detected via the DOM `copy` clipboard event.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Copy events | integer | Number of copy operations performed by the user |

## Bot Detection Rationale
Human users occasionally copy text (e.g., copying an account number to verify). Bots typically do not trigger copy events since they set values programmatically. A session with zero copy events is not suspicious on its own, but a high copy count combined with paste events may indicate a user manually moving data between fields — a human-like behavior that bots skip. Copy events also help distinguish between autofill (which bypasses the clipboard) and manual copy-paste workflows.
