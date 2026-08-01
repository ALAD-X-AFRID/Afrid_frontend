# Network Type

## What It Is About
Records the type of network connection the device is using (WiFi, cellular, ethernet, etc.). Provides context about the user's connection environment.

## How It Is Calculated

### Native (APK)
```
const status = await Network.getStatus()
type = status.connectionType  // "wifi", "cellular", "none", "unknown"
```

### Web
```
const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
// conn.type = actual medium: "wifi", "cellular", "ethernet", "bluetooth"
// conn.effectiveType = speed tier: "2g", "3g", "4g", "slow-2g"
if conn?.type:
  type = conn.type          // prefer medium
else if conn?.effectiveType:
  type = conn.effectiveType // fallback to speed tier
else:
  type = "unknown"
```

## SI Unit
string (categorical: "wifi", "cellular", "ethernet", "4g", "3g", "2g", "unknown")

## Physical Device Used
Network interface (WiFi/cellular modem). On web: `navigator.connection` API (Chrome/Edge). On native: `@capacitor/network`.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Network type | string | Connection medium or speed tier |

## Bot Detection Rationale
Bots in data centers typically use ethernet or very high-speed connections. A session claiming "wifi" from a residential IP is consistent with human use. Inconsistencies (e.g., "3g" network but server-grade response times) are suspicious. Note: Safari and Firefox don't fully support `navigator.connection`, so the value may be "unknown" on those browsers. The `type` property gives the actual medium (wifi/cellular), while `effectiveType` gives the speed tier (3g/4g).
