# Backspace Behavior

## What It Is About
Analyzes backspace usage patterns — distinguishing between single corrections (one or two characters deleted) and burst corrections (three or more characters deleted at once, e.g. long-pressing backspace). The ratio reveals whether corrections are deliberate or automated. Cut operations (`Ctrl+X` / long-press → "Cut") are tracked separately as `totalCutEvents` so they are not misclassified as backspace bursts.

## How It Is Calculated
```
// Single-event burst detection (works on all platforms including Android long-press)
// On input change event:
if inputType == "deleteByCut":
  totalCutEvents += 1
  // cut is NOT counted as backspace
else if inputType == "deleteContentBackward" or "deleteContentForward"
     or (inputType == "unknown" and lengthDelta < 0):
  if lengthDelta <= -3:
    backspaceBursts += 1      // long-press batch deletion
  else:
    singleBackspaces += 1    // single or double backspace

// Final ratio:
backspaceBurstRatio = backspaceBursts / (backspaceBursts + singleBackspaces)
```
Backspace is detected solely through `input`/`change` events in `trackInputChange` — not `keyup` events. This is because Android soft keyboards fire both `keyup` and `input` events for the same backspace press, which previously caused duplicate timestamps and corrupted burst detection. On Android, long-pressing backspace fires a single `input` event that deletes multiple characters at once (e.g. `lengthDelta = -5`). The single-event approach classifies this as a burst directly (`lengthDelta <= -3`), without needing multiple timestamps. Cut operations (`deleteByCut`) are excluded from backspace metrics and tracked as a separate `totalCutEvents` counter.

## SI Unit
- Backspace bursts: count (integer)
- Single backspaces: count (integer)
- Backspace burst ratio: dimensionless ratio (0.0–1.0)
- Cut events: count (integer)

## Physical Device Used
Keyboard (physical or virtual). Captured via `inputType` on `input`/`change` events (all platforms), or value-length comparison fallback (Android WebView with unknown `inputType`).

## Export Columns
| Column | Type | Description |
|---|---|---|
| Backspace bursts | integer | Count of single-input events that deleted 3+ characters (long-press) |
| Single backspaces | integer | Count of single-input events that deleted 1–2 characters |
| Backspace burst ratio | float | bursts / (bursts + singles), 0.0–1.0 |
| Cut events | integer | Count of cut operations (deleteByCut), excluded from backspace metrics |

## Bot Detection Rationale
Humans typically use single backspaces for minor corrections (fix one character). Bursts (holding backspace to delete a word) are less common and usually deliberate. Bots that simulate corrections may produce perfectly timed bursts or only single backspaces with no variation. The ratio of bursts to singles is user-specific. A burst ratio of exactly 0.0 or 1.0 with many total backspaces is suspicious. The single-event approach (`lengthDelta <= -3` = burst) captures the Android long-press pattern where one `input` event deletes multiple characters. Cut operations are tracked separately to avoid inflating burst counts.
