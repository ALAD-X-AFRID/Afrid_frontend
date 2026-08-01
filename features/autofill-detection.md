# Autofill Detection

## What It Is About
Counts how many times the browser's autofill mechanism populated input fields. Detects when credentials or form data were automatically filled by the browser rather than manually typed.

## How It Is Calculated
```
// On input event:
if event.target.matches(":-webkit-autofill") or
   event.target.dataset.autofilled === "true":
  totalAutofillEvents += 1
```
Autofill is detected via the `:-webkit-autofill` CSS pseudo-class or by monitoring `animationstart` events triggered by autofill styling changes.

## SI Unit
count (integer)

## Physical Device Used
Browser autofill engine. No physical sensor required — detected via DOM/CSS inspection.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Autofill detected | integer | Count of browser autofill events |

## Bot Detection Rationale
Browser autofill is typically used by humans who saved their credentials. Bots usually inject values directly into the DOM, bypassing the browser's autofill system. Zero autofill events is normal. The presence of autofill is actually a mild human signal. However, some advanced bots simulate autofill events, so this alone is not conclusive.
