# Backspace Behavior

## What It Is About
Analyzes backspace usage patterns — distinguishing between single corrections (one backspace at a time) and burst corrections (multiple rapid backspaces). The ratio reveals whether corrections are deliberate or automated.

## How It Is Calculated
```
// Method 1: keyup event (desktop keyboards, iOS soft keyboard)
// On keyup for Backspace or Delete key:
backspaceTimestamps.push(now)
classifyBackspace()  // shared helper

// Method 2: input event with inputType (Android soft keyboard)
// On input change where inputType == "deleteContentBackward" or "deleteContentForward" or "deleteByCut":
backspaceTimestamps.push(now)
classifyBackspace()

// Method 3: value-length fallback (Android WebView with unknown inputType)
// On input change where inputType == "unknown" and value length decreased:
backspaceTimestamps.push(now)
classifyBackspace()

// Shared classification helper:
function classifyBackspace():
  if backspaceTimestamps.length >= 3:
    last3 = backspaceTimestamps[-3:]
    if last3[2] - last3[0] <= 500ms:
      backspaceBursts += 1
      backspaceTimestamps = []  // clear all
    else:
      singleBackspaces += 1
      backspaceTimestamps = last2  // keep last 2 for potential next burst

// Flush remaining timestamps as singles:
// - On non-backspace keyup: flushPendingBackspaces()
// - On non-delete input change: flushPendingBackspaces()
// - On session end: flushPendingBackspaces()
function flushPendingBackspaces():
  singleBackspaces += backspaceTimestamps.length
  backspaceTimestamps = []

// Final ratio:
backspaceBurstRatio = backspaceBursts / (backspaceBursts + singleBackspaces)
```
Backspace is detected through three complementary methods: (1) `keyup` DOM events for desktop keyboards and iOS (where Backspace/Delete key events fire reliably); (2) `inputType === "deleteContentBackward"` on the `input` event for Android soft keyboards, which often skip `keydown`/`keyup` for backspace; (3) a value-length fallback for Android WebView where `inputType` is unavailable — if the value shrank, it's treated as a backspace. The shared `classifyBackspace()` helper centralizes burst detection logic. Remaining unclassified timestamps are flushed as single backspaces when a non-backspace key is pressed, a non-delete input change occurs, or the session ends — ensuring isolated single and double backspaces are always counted.

## SI Unit
- Backspace bursts: count (integer)
- Single backspaces: count (integer)
- Backspace burst ratio: dimensionless ratio (0.0–1.0)

## Physical Device Used
Keyboard (physical or virtual). Captured via `keyup` DOM events (desktop/iOS), `inputType` on `input` events (Android soft keyboard), or value-length comparison fallback (Android WebView).

## Export Columns
| Column | Type | Description |
|---|---|---|
| Backspace bursts | integer | Count of rapid multi-backspace sequences (≥3) |
| Single backspaces | integer | Count of isolated single backspaces |
| Backspace burst ratio | float | bursts / (bursts + singles), 0.0–1.0 |

## Bot Detection Rationale
Humans typically use single backspaces for minor corrections (fix one character). Bursts (holding backspace to delete a word) are less common and usually deliberate. Bots that simulate corrections may produce perfectly timed bursts (exactly 150ms apart) or only single backspaces with no variation. The ratio of bursts to singles is user-specific. A burst ratio of exactly 0.0 or 1.0 with many total backspaces is suspicious. The 500ms threshold between consecutive backspaces distinguishes intentional bursts from individual corrections. On mobile, the multi-method detection ensures backspaces are counted regardless of whether the soft keyboard fires key events or only input events.
