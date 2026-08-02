# Backspace Behavior

## What It Is About
Analyzes backspace usage patterns — distinguishing between single corrections (one backspace at a time) and burst corrections (multiple rapid backspaces). The ratio reveals whether corrections are deliberate or automated.

## How It Is Calculated
```
// On keyup (Backspace or Delete key — iOS uses "Delete"):
backspaceTimestamps.push(now)

// Classify as burst or single:
if backspaceTimestamps.length >= 3:
  last3 = backspaceTimestamps[-3:]
  if last3[2] - last3[0] <= 500ms:
    // 3+ rapid backspaces within 500ms = burst
    backspaceBursts += 1
    backspaceTimestamps = []  // clear all (prevents orphaned timestamps)
  else:
    // Isolated single backspace
    singleBackspaces += 1
    backspaceTimestamps = [last]  // keep only the most recent

// Final ratio:
backspaceBurstRatio = backspaceBursts / (backspaceBursts + singleBackspaces)
```

Note: Both "Backspace" and "Delete" keys are tracked — iOS and some Android keyboards fire "Delete" instead of "Backspace".

## SI Unit
- Backspace bursts: count (integer)
- Single backspaces: count (integer)
- Backspace burst ratio: dimensionless ratio (0.0–1.0)

## Physical Device Used
Keyboard (physical or virtual). Captured via `keyup` DOM events for the Backspace key.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Backspace bursts | integer | Count of rapid multi-backspace sequences (≥3) |
| Single backspaces | integer | Count of isolated single backspaces |
| Backspace burst ratio | float | bursts / (bursts + singles), 0.0–1.0 |

## Bot Detection Rationale
Humans typically use single backspaces for minor corrections (fix one character). Bursts (holding backspace to delete a word) are less common and usually deliberate. Bots that simulate corrections may produce perfectly timed bursts (exactly 150ms apart) or only single backspaces with no variation. The ratio of bursts to singles is user-specific. A burst ratio of exactly 0.0 or 1.0 with many total backspaces is suspicious. The 150ms threshold between consecutive backspaces distinguishes intentional bursts from individual corrections.
