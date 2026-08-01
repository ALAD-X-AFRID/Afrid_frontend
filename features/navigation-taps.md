# Navigation Taps

## What It Is About
Counts how many times the user tapped navigation elements (step indicators, nav buttons) during the simulation.

## How It Is Calculated
```
totalNavTouches += 1  // on each navigation tap/click
```
Recorded via `trackNavTouch()` when the user clicks a step indicator or navigation button.

## SI Unit
count (integer)

## Physical Device Used
Touchscreen or mouse. Captured via click/tap events on navigation elements.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Navigation taps | integer | Total navigation element taps |

## Bot Detection Rationale
Humans explore — they tap back, re-read steps, and navigate around. Bots follow a linear path with minimal navigation. Zero navigation taps in a multi-step flow suggests scripted progression. Excessive taps may indicate confusion (human) or retry loops (bot).
