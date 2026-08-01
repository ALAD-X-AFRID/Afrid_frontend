# Transfer Behavior

## What It Is About
Tracks how many transfer reviews the user opened and how many transfers were completed. Measures engagement with the transfer workflow.

## How It Is Calculated
- **Review checks**: Incremented when the user opens the transfer review panel
- **Transfers completed**: Incremented when the user confirms a transfer

```
totalReviewChecks += 1   // on review panel open
totalTransfers += 1      // on transfer confirmation
```

## SI Unit
count (integer)

## Physical Device Used
No sensor required. Tracked via button click events.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Review checks | integer | Times transfer review was opened |
| Transfers completed | integer | Transfers confirmed |

## Bot Detection Rationale
Humans typically review before confirming. Bots may skip the review step entirely or complete transfers without pausing. A 1:1 ratio of reviews to transfers with realistic dwell time is a human signal. Zero reviews but completed transfers suggests automation.
