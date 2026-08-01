# Password Unmask

## What It Is About
Counts how many times the user toggled the password visibility (show/hide) button. Measures a common human behavior — checking what was typed in the password field.

## How It Is Calculated
```
// On password visibility toggle:
passwordUnmaskCount += 1
pushTelemetry("password_unmask", { time: now })
```

## SI Unit
count (integer)

## Physical Device Used
No sensor required. Captured via click events on the eye/eye-off toggle button.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Password unmask count | integer | Times password visibility was toggled |

## Bot Detection Rationale
Humans frequently unmask passwords to verify they typed correctly, especially on mobile keyboards. Bots inject passwords directly and never need to verify visually. A password unmask count of 0 is mildly suspicious but common (some users never toggle). A count of 1–3 is typical human behavior. The timing of unmask events relative to typing (e.g., unmask after a correction) is an additional human signal.
