what # Bot Detection Telemetry Features — Complete Technical Specification

This document specifies 10 behavioral biometric features for bot detection: 8 newly implemented signals plus paste detection and autofill detection. Each feature includes its purpose, data collection method, exact calculation formulas, export columns, and bot detection rationale.

---

## Table of Contents

1. [Session Lifecycle Boundaries](#1-session-lifecycle-boundaries)
2. [Touch Hold Duration](#2-touch-hold-duration)
3. [Touch Precision](#3-touch-precision)
4. [Field Focus/Blur Dwell Time](#4-field-focusblur-dwell-time)
5. [Field Revisit Count](#5-field-revisit-count)
6. [Password Unmask Tracking](#6-password-unmask-tracking)
7. [Backspace Burst Detection](#7-backspace-burst-detection)
8. [Keystroke Digraph Timing](#8-keystroke-digraph-timing)
9. [Paste Detection](#9-paste-detection)
10. [Autofill Detection](#10-autofill-detection)

---

## 1. Session Lifecycle Boundaries

### Purpose
Defines a hard start and end for telemetry collection so data only covers the actual task window. Prevents sensor pollution from continued page interactions after task completion.

### Data Collection

**Start:**
- Called via `startSimulation()` on page mount (when `sessionId` is set)
- Sets `simulationStartedRef = true`
- Records `sessionStartedAt` as ISO 8601 timestamp (e.g., `"2026-07-30T13:46:00.000Z"`)
- Pushes a `session_start` event to the event log

**End:**
- Called via `endSimulation()` after telemetry submission
- Sets `simulationEndedRef = true` — all tracking functions check this and return early
- Records `sessionEndedAt` as ISO 8601 timestamp
- Unsubscribes accelerometer and orientation sensor listeners (stops sensor data collection)
- Calls `computeMetrics()` one final time to freeze all stats
- Pushes a `session_end` event with duration

### Calculations

```
sessionDurationMs = Date.now() - new Date(sessionStartedAt).getTime()
```

### Export Columns

| Column | Type | Example |
|---|---|---|
| `Session started at` | string (ISO timestamp) | `"2026-07-30T13:46:00.000Z"` |
| `Session ended at` | string (ISO timestamp) | `"2026-07-30T13:48:32.000Z"` |
| `Session duration (ms)` | number | `152000` |

### Bot Detection Rationale
Without boundaries, telemetry keeps counting page interactions after the task is done, polluting data. Clean boundaries ensure the dataset only covers the actual task window. Bots often complete tasks in suspiciously short durations (<10 seconds for a full banking flow). Session duration also contextualizes all other metrics — e.g., 50 keystrokes in 5 seconds vs 50 keystrokes in 2 minutes have very different bot probability.

---

## 2. Touch Hold Duration

### Purpose
Measures how long a finger (or mouse) stays pressed on the screen per tap. This is a physical interaction signal distinct from keyboard dwell time.

### Data Collection
- On `pointerdown` event: record `performance.now()` timestamp into `pointerDownAtRef`
- On `pointerup` event: compute `holdDuration = performance.now() - pointerDownAtRef`
- Push `holdDuration` to `touchHoldDurationsRef` array
- Reset `pointerDownAtRef` to `null`

### Calculations

```
holdDuration = pointerUpTime - pointerDownTime  (in milliseconds)

averageTouchHold = Σ(holdDurations) / count(holdDurations)

touchHoldVariance = Σ((holdDuration - averageTouchHold)²) / count(holdDurations)
```

**Variance formula (population variance):**
```
touchHoldVariance = (1/n) * Σ(xᵢ - μ)²
where μ = averageTouchHold, n = number of hold durations
```

### Export Columns

| Column | Type | Example |
|---|---|---|
| `Avg touch hold (ms)` | number (2 decimal places) | `187.53` |
| `Touch hold variance` | number (2 decimal places) | `1240.88` |

### Bot Detection Rationale
- **Humans:** Hold taps for 150-300ms with high variance (σ² > 500). Reading vs action taps have different durations.
- **Bots:** Either zero hold time (instant `mousedown`+`mouseup` synthetic events) or perfectly uniform hold times (σ² ≈ 0).
- **Key signal:** Variance is more important than the average. A bot can set a random delay but struggle to produce natural variance across many taps.

---

## 3. Touch Precision

### Purpose
Measures the pixel distance between the touch/click point and the center of the target element. Humans naturally miss the exact center; bots click with machine precision.

### Data Collection
- On `pointerdown` event:
  1. Get the clicked element via `event.target`
  2. Get its bounding rectangle via `getBoundingClientRect()`
  3. Compute element center: `centerX = rect.left + rect.width/2`, `centerY = rect.top + rect.height/2`
  4. Compute precision distance: `precision = √((clientX - centerX)² + (clientY - centerY)²)`
  5. Push to `touchPrecisionRef` array

### Calculations

```
precision = √((clientX - centerX)² + (clientY - centerY)²)  (in CSS pixels)

averageTouchPrecision = Σ(precisionValues) / count(precisionValues)

touchPrecisionVariance = Σ((precision - averageTouchPrecision)²) / count(precisionValues)
```

### Export Columns

| Column | Type | Example |
|---|---|---|
| `Avg touch precision (px)` | number (2 decimal places) | `12.37` |
| `Touch precision variance` | number (2 decimal places) | `45.22` |

### Bot Detection Rationale
- **Humans:** Miss the center by 5-20px with random distribution. Variance is high. Thumb taps on mobile are less precise than mouse clicks.
- **Bots:** Click dead-center (0px) or with a machine-precise fixed offset (e.g., always exactly 2px right). Variance ≈ 0.
- **Key signal:** `averageTouchPrecision < 2px` across many taps is nearly impossible for humans. `touchPrecisionVariance ≈ 0` confirms automation.

---

## 4. Field Focus/Blur Dwell Time

### Purpose
Measures how long a user spends focused on each input field (from focus to blur). Captures reading/thinking time before typing.

### Data Collection
- Maintains a per-field state object: `{ focusAt: number | null, totalFocusMs: number, visitCount: number }`
- On `focus` event (`recordFieldFocus(fieldName)`):
  1. Initialize field entry if it doesn't exist
  2. Set `focusAt = performance.now()`
  3. Increment `visitCount`
- On `blur` event (`recordFieldBlur(fieldName)`):
  1. If `focusAt !== null`: compute `dwellMs = performance.now() - focusAt`
  2. Add `dwellMs` to `totalFocusMs`
  3. Set `focusAt = null`

### Calculations

```
For each field f:
  totalFocusMs(f) = Σ(performance.now() at blur - performance.now() at focus)  across all focus/blur cycles

totalFieldFocusTime = Σ(totalFocusMs(f))  across all fields

averageFieldDwell = totalFieldFocusTime / count(fields that were focused at least once)
```

### Export Columns

| Column | Type | Example |
|---|---|---|
| `Avg field dwell (ms)` | number (2 decimal places) | `3200.50` |
| `Total field focus (ms)` | number (2 decimal places) | `19203.00` |

### Bot Detection Rationale
- **Humans:** Spend 2-10 seconds reading a field before typing. Account number field gets longer dwell than username. Total focus time scales with form complexity.
- **Bots:** Focus and fill in <100ms. `averageFieldDwell < 500ms` across multiple fields is a strong bot signal.
- **Key signal:** The ratio `averageFieldDwell / averageDwell` (field reading time vs key holding time) should be >5 for humans. Bots have ratio ≈ 0-1.

---

## 5. Field Revisit Count

### Purpose
Counts how many times a user returns to re-focus a field they already filled. Humans double-check; bots fill once and never return.

### Data Collection
- Uses the same `visitCount` from the field focus state (Feature 4)
- Each `focus` event increments `visitCount` for that field
- A revisit = any focus after the first one (i.e., `visitCount > 1`)

### Calculations

```
For each field f:
  revisits(f) = max(0, visitCount(f) - 1)

totalFieldRevisits = Σ(revisits(f))  across all fields
```

### Export Columns

| Column | Type | Example |
|---|---|---|
| `Field revisits` | number (integer) | `3` |

### Bot Detection Rationale
- **Humans:** Frequently revisit fields to double-check (e.g., re-reading account number before submitting). On a 6-field form, humans typically revisit 1-4 times.
- **Bots:** Fill each field exactly once and never return. `totalFieldRevisits = 0` on a complex form is suspicious.
- **Key signal:** Combined with `averageFieldDwell`, zero revisits + low dwell time = high bot probability.

---

## 6. Password Unmask Tracking

### Purpose
Tracks when a user clicks "show password" / "hide password". Humans frequently unmask to verify; bots never need to.

### Data Collection
- On password visibility toggle button click:
  1. Increment `passwordUnmaskCountRef` by 1
  2. Push `password_unmask` event to event log with timestamp

### Calculations

```
passwordUnmaskCount = total count of show/hide password toggle clicks
```

### Export Columns

| Column | Type | Example |
|---|---|---|
| `Password unmask count` | number (integer) | `2` |

### Bot Detection Rationale
- **Humans:** Frequently unmask passwords to verify what they typed, especially on mobile keyboards where mis-typing is common. 1-3 unmask events per login is typical.
- **Bots:** Never need to unmask — they input the correct password programmatically. `passwordUnmaskCount = 0` is a bot signal.
- **Key signal:** This is a binary cognitive signal. Presence of unmask events strongly suggests human. Absence is weak-to-moderate bot signal (some humans also never unmask).

---

## 7. Backspace Burst Detection

### Purpose
Distinguishes between rapid bulk deletion (burst) and careful single-character deletion. The pattern reveals cognitive editing behavior.

### Data Collection
- On `keyup` event when `event.key === "Backspace"`:
  1. Record `performance.now()` timestamp into `backspaceTimestampsRef` array
  2. If array has ≥3 entries, check the last 3 timestamps:
     - If `last3[2] - last3[0] <= 500ms` → **burst** detected
       - Increment `backspaceBurstsRef` by 1
       - Remove those 3 timestamps from the array
     - Else → **single** backspace
       - Increment `singleBackspacesRef` by 1
       - Keep only the last timestamp in the array

### Calculations

```
backspaceBursts = count of 3+ consecutive backspaces within 500ms windows
singleBackspaces = count of isolated backspace presses
backspaceBurstRatio = backspaceBursts / (backspaceBursts + singleBackspaces)
```

**Burst detection algorithm:**
```
When Backspace is pressed:
  append timestamp to backspaceTimestamps[]
  if backspaceTimestamps.length >= 3:
    last3 = backspaceTimestamps[-3:]
    if (last3[2] - last3[0]) <= 500:
      backspaceBursts += 1
      remove last 3 from backspaceTimestamps
    else:
      singleBackspaces += 1
      keep only last 1 in backspaceTimestamps
```

### Export Columns

| Column | Type | Example |
|---|---|---|
| `Backspace bursts` | number (integer) | `2` |
| `Single backspaces` | number (integer) | `5` |
| `Backspace burst ratio` | number (4 decimal places) | `0.2857` |

### Bot Detection Rationale
- **Humans:** When making mistakes, either single-backspace carefully (high singles, low bursts) or burst-delete a whole word (some bursts). The ratio is typically 0.1-0.4.
- **Bots:** Either never backspace (perfect input) or delete everything in one scripted action. `backspaceBursts + singleBackspaces = 0` means no corrections at all, which is suspicious for complex forms.
- **Key signal:** `backspaceBurstRatio = 1.0` (all bursts, no singles) suggests scripted bulk deletion. `backspaceBurstRatio = 0.0` with many singles suggests careful human editing.

---

## 8. Keystroke Digraph Timing

### Purpose
Records timing between specific key pairs (digraphs). Creates a per-key-pair timing fingerprint rather than a single average. This is the strongest keystroke dynamics signal in academic literature.

### Data Collection
- On `keyup` event, when `flight !== null` and there are ≥2 keystrokes in the current field:
  1. Get the previous key: `state.keystrokes[keystrokes.length - 2].key`
  2. Get the current key: `event.key`
  3. Create digraph key: `"${prevKey}>${currentKey}"` (e.g., `"a>s"`)
  4. Push `flight` time to `digraphTimingsRef[digraphKey]` array

### Calculations

```
digraphTimings = {
  "a>s": [120, 135, 118],
  "s>d": [95, 102, 88],
  "d>f": [110, 115],
  ...
}

digraphCount = count of unique digraph keys in the map

For each digraph pair p with timings array arr:
  pairMean(p) = Σ(arr) / length(arr)
  pairVariance(p) = Σ((timing - pairMean)²) / length(arr)   [if length >= 2, else 0]

digraphTimingMean = Σ(pairMean(p)) / digraphCount   [average of all pair means]

digraphTimingVariance = Σ(pairVariance(p)) / digraphCount   [average of all pair variances]
```

### Export Columns

| Column | Type | Example |
|---|---|---|
| `Digraph pairs` | number (integer) | `24` |
| `Digraph timing variance` | number (4 decimal places) | `156.3320` |
| `Digraph timing mean (ms)` | number (2 decimal places) | `112.45` |

### Bot Detection Rationale
- **Humans:** Have consistent digraph patterns based on keyboard layout familiarity. Common pairs (e.g., "e">"a") are faster than uncommon pairs (e.g., "q">"z"). Each pair has natural variance from muscle memory. `digraphCount` is typically 15-40 unique pairs on a 20-character input. `digraphTimingVariance > 50` indicates natural variation.
- **Bots:** Have uniform or zero inter-key timing. `digraphTimingVariance ≈ 0` means every pair has the same timing — impossible for humans. `digraphCount = 0` means no flight times were recorded (instant typing).
- **Key signal:** This is the strongest single signal. `digraphTimingVariance < 10` across 20+ digraph pairs is nearly conclusive bot evidence. The digraph map itself (not just aggregates) can be used for user identification/re-authentication.

---

## 9. Paste Detection

### Purpose
Detects when a user pastes text into an input field instead of typing it character by character.

### Data Collection
- On `input` change event, check `event.nativeEvent.inputType`:
  - If `inputType === "insertFromPaste"`:
    1. Increment `totalPasteEvents` by 1
    2. Push `paste` event to log with field name, input type, and pasted text length

### Calculations

```
totalPasteEvents = count of paste events detected across all fields
```

### Export Columns

| Column | Type | Example |
|---|---|---|
| `Paste detected` | number (integer) | `1` |

### Bot Detection Rationale
- **Humans:** Sometimes paste credentials from password managers or notes. 0-2 paste events is normal. Pasting into username but typing password is common.
- **Bots:** Often paste all fields at once (username, password, account number, amount). `totalPasteEvents >= 3` across multiple fields is suspicious.
- **Key signal:** Pasting into the password field specifically is unusual for humans (password managers use autofill, not paste). `paste` in password field + `autofill` = 0 suggests bot.

---

## 10. Autofill Detection

### Purpose
Detects when the browser or a password manager auto-fills an input field.

### Data Collection
- On `input` change event, check `event.nativeEvent.inputType`:
  - If `inputType === "insertReplacementText"`:
    1. Increment `totalAutofillEvents` by 1
    2. Push `autofill` event to log with field name, input type, and text length

### Calculations

```
totalAutofillEvents = count of autofill events detected across all fields
```

### Export Columns

| Column | Type | Example |
|---|---|---|
| `Autofill detected` | number (integer) | `1` |

### Bot Detection Rationale
- **Humans:** Browser autofill is common for usernames/email. Password managers trigger autofill for passwords. 1-2 autofill events is normal.
- **Bots:** Don't use browser autofill — they set values programmatically, which doesn't trigger `insertReplacementText`. `totalAutofillEvents = 0` is not suspicious by itself, but `totalPasteEvents > 0` + `totalAutofillEvents = 0` + `totalKeystrokes = 0` = bot.
- **Key signal:** Autofill presence is a human signal (browser-mediated). Combined with keystroke data, it helps distinguish password manager users from bots.

---

## Complete Export Schema (56 columns)

All features produce values in a single row per session:

| # | Column | Feature |
|---|---|---|
| 1 | `session_id` | Metadata |
| 2 | `event_index` | Metadata |
| 3 | `task_completion_speed` | Metadata |
| 4 | `Inter_event_idle_duration` | Metadata |
| 5 | `Typing actions` | Existing |
| 6 | `Text fixes` | Existing |
| 7 | `Login attempts` | Existing |
| 8 | `Login problems` | Existing |
| 9 | `Review checks` | Existing |
| 10 | `Transfers completed` | Existing |
| 11 | `Swipe incomplete` | Existing |
| 12 | `Swipe completes` | Existing |
| 13 | `swipe curve` | Existing |
| 14 | `Navigation taps` | Existing |
| 15 | `Motion checks` | Existing |
| 16 | `Orientation checks` | Existing |
| 17 | `Average button pressure` | Existing |
| 18 | `Neuromuscular Entropy` | Existing |
| 19 | `Distribution jitter` | Existing |
| 20 | `Background checks` | Existing |
| 21 | `Average key hold (ms)` | Existing |
| 22 | `Average key gap (ms)` | Existing |
| 23 | `Scroll irregularity` | Existing |
| 24 | `Tap-to-vibration correlation` | Existing |
| 25 | `Touch area deformation` | Existing |
| 26 | `Multi-touch anomalies` | Existing |
| 27 | `Paste detected` | Feature 9 |
| 28 | `Autofill detected` | Feature 10 |
| 29 | `GPS lat` | Existing |
| 30 | `GPS lng` | Existing |
| 31 | `GPS accuracy` | Existing |
| 32 | `Battery level` | Existing |
| 33 | `Battery charging` | Existing |
| 34 | `Screen brightness` | Existing |
| 35 | `Device model` | Existing |
| 36 | `OS version` | Existing |
| 37 | `Platform` | Existing |
| 38 | `Network type` | Existing |
| 39 | `Session started at` | Feature 1 |
| 40 | `Session ended at` | Feature 1 |
| 41 | `Session duration (ms)` | Feature 1 |
| 42 | `Avg touch hold (ms)` | Feature 2 |
| 43 | `Touch hold variance` | Feature 2 |
| 44 | `Avg touch precision (px)` | Feature 3 |
| 45 | `Touch precision variance` | Feature 3 |
| 46 | `Avg field dwell (ms)` | Feature 4 |
| 47 | `Total field focus (ms)` | Feature 4 |
| 48 | `Field revisits` | Feature 5 |
| 49 | `Password unmask count` | Feature 6 |
| 50 | `Backspace bursts` | Feature 7 |
| 51 | `Single backspaces` | Feature 7 |
| 52 | `Backspace burst ratio` | Feature 7 |
| 53 | `Digraph pairs` | Feature 8 |
| 54 | `Digraph timing variance` | Feature 8 |
| 55 | `Digraph timing mean (ms)` | Feature 8 |
| 56 | `is_human` | Label |

---

## Implementation Reference

### Required Event Handlers

| Event | Handler | Features Captured |
|---|---|---|
| `onPointerDown` | `recordPointerDown(precision)` | Touch hold (start), Touch precision |
| `onPointerUp` | `recordPointerUp()` | Touch hold (end) |
| `onKeyDown` | `trackKeyDown(fieldName, event)` | Keystroke dwell (start) |
| `onKeyUp` | `trackKeyUp(fieldName, event)` | Dwell, flight, Backspace burst, Digraph timing |
| `onChange` | `trackInputChange(fieldName, event)` | Paste, Autofill, Corrections |
| `onFocus` | `recordFieldFocus(fieldName)` | Field dwell, Field revisits |
| `onBlur` | `recordFieldBlur(fieldName)` | Field dwell (end) |
| `onClick` (password toggle) | `recordPasswordUnmask()` | Password unmask |
| Page mount | `startSimulation()` | Session start |
| Telemetry submit | `endSimulation()` | Session end, sensor cleanup |

### Required State Refs

```
pointerDownAtRef: number | null              // Touch hold start time
touchHoldDurationsRef: number[]              // All hold durations
touchPrecisionRef: number[]                  // All precision distances
fieldFocusRef: Record<string, {              // Per-field focus state
  focusAt: number | null,
  totalFocusMs: number,
  visitCount: number
}>
passwordUnmaskCountRef: number               // Unmask counter
backspaceTimestampsRef: number[]             // Recent backspace timestamps
backspaceBurstsRef: number                   // Burst count
singleBackspacesRef: number                  // Single count
digraphTimingsRef: Record<string, number[]>  // Per-pair flight times
simulationStartedRef: boolean                // Session started flag
simulationEndedRef: boolean                  // Session ended flag
accelSubRef: subscription | null             // Accelerometer subscription
orientSubRef: subscription | null            // Orientation subscription
```

### Bot Detection Score Heuristics

| Signal | Human Range | Bot Range | Confidence |
|---|---|---|---|
| `touchHoldVariance` | >500 | <50 | High |
| `touchPrecisionVariance` | >20 | <5 | High |
| `averageTouchPrecision` | 5-20px | <2px | High |
| `averageFieldDwell` | >2000ms | <500ms | Medium |
| `totalFieldRevisits` | 1-4 (on 6 fields) | 0 | Medium |
| `passwordUnmaskCount` | 1-3 | 0 | Low (binary) |
| `backspaceBurstRatio` | 0.1-0.4 | 0.0 or 1.0 | Medium |
| `digraphTimingVariance` | >50 | <10 | Very High |
| `digraphCount` | 15-40 | 0 or <5 | High |
| `totalPasteEvents` | 0-2 | 3+ | Medium |
