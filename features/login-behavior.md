# Login Behavior

## What It Is About
Tracks how many times the user attempted to log in and how many login errors occurred. Measures authentication struggle and retry behavior.

## How It Is Calculated
- **Login attempts**: Incremented each time the login form is submitted
- **Login problems**: Incremented when login is submitted with missing credentials (empty username or password)

```
totalLoginAttempts += 1  // on each form submit
totalLoginErrors += 1    // if username or password is empty
```

## SI Unit
count (integer)

## Physical Device Used
No sensor required. Tracked via form submission events.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Login attempts | integer | Total login form submissions |
| Login problems | integer | Login attempts with missing fields |

## Bot Detection Rationale
Humans sometimes forget to fill in fields and get errors. Bots rarely submit incomplete forms. However, bots may brute-force login with many attempts in rapid succession. A high login_attempts count with near-zero time between attempts is a bot signal. Zero login problems with instant success may also indicate scripted authentication.
