# Autofill Detection

## What It Is About
Counts how many times input fields were populated by autofill mechanisms and how many characters were autofilled in total. Detects when credentials or form data were automatically filled by the browser or OS rather than manually typed.

## How It Is Calculated
```
// Method 1: inputType detection (Android autofill framework, Chrome, Firefox)
if inputType in ["insertReplacementText", "insertCommittedText", "insertFromDrop"]:
  totalAutofillEvents += 1
  totalAutofilledCharacters += lengthDelta

// Method 2: value-jump heuristic (Android WebView with unknown inputType)
if inputType == "unknown" and lengthDelta > 1 and no recent keystroke and no recent paste:
  totalAutofillEvents += 1
  totalAutofilledCharacters += lengthDelta

// Method 3: iOS DOM polling (Safari Autofill / iCloud Keychain bypass DOM events)
// Every 500ms, poll registered input elements' .value directly:
if domValue.length - previousValue.length > 1 and no recent keystroke:
  totalAutofillEvents += 1
  totalAutofilledCharacters += delta
```
Autofill is detected through three complementary methods: (1) `inputType` values from the InputEvent API, which Android's autofill framework and desktop browsers fire reliably; (2) a value-jump heuristic for Android WebView where `inputType` is unavailable — if the value grows by 2+ chars with no recent keystroke or paste event, it's classified as autofill; (3) a 500ms DOM polling fallback for iOS, where Safari Autofill and iCloud Keychain set input values directly without firing any DOM events. The `lastPasteAt` timestamp ensures paste-triggered value changes are not misclassified as autofill.

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
