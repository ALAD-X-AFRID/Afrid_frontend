# Autofill Detection

## What It Is About
Counts how many times input fields were populated by autofill mechanisms and how many characters were autofilled in total. Detects when credentials or form data were automatically filled by the browser or OS rather than manually typed.

## How It Is Calculated
```
// Shared dedup timestamp (prevents double-counting between methods)
lastAutofillAtRef = 0

// Method 1: inputType detection (Android autofill framework, Chrome, Firefox)
if inputType in ["insertReplacementText", "insertCommittedText", "insertFromDrop"]:
  totalAutofillEvents += 1
  totalAutofilledCharacters += lengthDelta
  lastAutofillAtRef = now

// Method 2: value-jump heuristic (Android WebView with unknown inputType)
if inputType == "unknown" and lengthDelta > 1 and no recent keystroke and no recent paste:
  totalAutofillEvents += 1
  totalAutofilledCharacters += lengthDelta
  lastAutofillAtRef = now

// Method 3: iOS DOM polling (Safari Autofill / iCloud Keychain bypass DOM events)
// Every 500ms, poll registered input elements' .value directly:
// Uses pollingPreviousValueRef (independent of trackInputChange's state.previousValue)
if domValue.length - pollingPreviousValue.length > 1
   and no recent keystroke
   and (now - lastAutofillAtRef > 500ms):  // skip if trackInputChange already counted it
  totalAutofillEvents += 1
  totalAutofilledCharacters += delta
  lastAutofillAtRef = now
```
Autofill is detected through three complementary methods: (1) `inputType` values from the InputEvent API, which Android's autofill framework and desktop browsers fire reliably; (2) a value-jump heuristic for Android WebView where `inputType` is unavailable — if the value grows by 2+ chars with no recent keystroke or paste event, it's classified as autofill; (3) a 500ms DOM polling fallback for iOS, where Safari Autofill and iCloud Keychain set input values directly without firing any DOM events. A shared `lastAutofillAtRef` timestamp ensures that if `trackInputChange` (Method 1 or 2) already detected an autofill, the iOS polling (Method 3) skips it within 500ms — preventing double-counting. The polling also uses a separate `pollingPreviousValueRef` so that `trackInputChange`'s updates to `state.previousValue` don't mask autofill jumps from the polling loop. The `lastPasteAt` timestamp ensures paste-triggered value changes are not misclassified as autofill.

## SI Unit
- Autofill events: count (integer)
- Autofilled characters: count (integer)

## Physical Device Used
Browser autofill engine (Chrome, Firefox), OS autofill framework (Android Autofill), or iCloud Keychain (iOS). No physical sensor required — detected via `inputType` inspection, value-jump heuristics, and DOM polling.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Autofill detected | integer | Count of autofill events |
| Autofilled characters | integer | Total number of characters autofilled across all events |

## Bot Detection Rationale
Browser autofill is typically used by humans who saved their credentials. Bots usually inject values directly into the DOM, bypassing the browser's autofill system. Zero autofill events is normal. The presence of autofill is actually a mild human signal. However, some advanced bots simulate autofill events, so this alone is not conclusive. The autofilled character count helps distinguish autofilling a full password (12+ chars) from autofilling a short username (4-6 chars), adding behavioral granularity. On iOS, the DOM polling method catches autofill that would otherwise be invisible to event-based detection.
