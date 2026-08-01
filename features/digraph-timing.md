# Digraph Timing

## What It Is About
Measures the timing between consecutive key pairs (digraphs). For example, typing "password" produces digraphs like "p>a", "a>s", "s>s", etc. The timing of these pairs is a powerful biometric signature.

## How It Is Calculated

### Step 1: Record digraph timings
```
// On keyup:
if previousKey exists:
  digraphKey = "${previousKey}>${currentKey}"
  flight = now - lastKeyUpTime
  digraphTimings[digraphKey].push(flight)

lastKeyUpTime = now
previousKey = currentKey
```

### Step 2: Compute per-pair statistics
```
For each digraph pair p with timings array arr:
  pairMean(p) = sum(arr) / len(arr)
  pairVariance(p) = sum((t - pairMean)² for all t) / len(arr)   [if len >= 2, else 0]
```

### Step 3: Aggregate across all pairs
```
digraphCount = count of unique digraph keys
digraphTimingMean = mean of all pairMeans
digraphTimingVariance = mean of all pairVariances
```

## SI Unit
- Digraph pairs: count (integer)
- Digraph timing variance: milliseconds² (ms²)
- Digraph timing mean: milliseconds (ms)

## Physical Device Used
Keyboard (physical or virtual). Captured via `keyup` DOM events with timestamp tracking.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Digraph pairs | integer | Count of unique key-pair combinations |
| Digraph timing variance | float | Mean of per-pair variances (ms²) |
| Digraph timing mean (ms) | float | Mean of per-pair mean timings (ms) |

## Bot Detection Rationale
Digraph timing is one of the most reliable keystroke biometrics. Each user has a characteristic "typing rhythm" — some key pairs are faster (common sequences like "th", "in") and others slower. Bots produce perfectly uniform digraph timings with zero variance. A digraph timing variance of 0 across many pairs is a strong bot signal. The digraph timing mean should be 50–300ms for humans; values below 20ms are physically impossible for manual typing. Repeated sessions from the same user should show similar digraph timing profiles.
