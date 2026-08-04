# Device Info

## What It Is About
Records the device model, operating system version, and platform (web/native). Identifies the hardware and software environment the user is running.

## How It Is Calculated

### Native (APK)
```
const info = await Device.getInfo()
model = info.model        // e.g., "SM-G973F"
osVersion = info.osVersion // e.g., "13"
platform = info.platform   // "android" | "ios"
```

### Web
```
// Primary: UA Client Hints (modern browsers)
if navigator.userAgentData:
  platform = userAgentData.platform       // "Android", "iOS", "Windows", "macOS"
  osVersion = userAgentData.platformVersion  // accurate, not frozen

// Fallback: User-Agent string parsing
const ua = navigator.userAgent
// Android: parse "Build/" for model name, "Android X.X" for OS version
// iOS: parse "iPhone"/"iPad", "OS X_X" for version
// Windows: parse "Windows NT X.X"
// Mac: parse "Mac OS X X_X"
platform = "web"
```

## SI Unit
- Device model: string
- OS version: string
- Platform: string ("web", "android", "ios")

## Physical Device Used
No sensor required. Uses `navigator.userAgentData` (UA Client Hints, modern browsers) or `navigator.userAgent` parsing (legacy) on web, or `@capacitor/device` (native).

## Export Columns
| Column | Type | Description |
|---|---|---|
| Device model | string | Hardware model name |
| OS version | string | Operating system version |
| Platform | string | "web", "android", or "ios" |

## Bot Detection Rationale
Bots often spoof user agents but may use inconsistent or outdated device models. A session claiming to be from "Chrome on Android 10" but with no accelerometer data is suspicious. Cross-referencing device model with sensor availability is powerful — a real phone model should produce motion data. Note: modern Chrome freezes the UA string for privacy, so device model may be generic ("Android" instead of "SM-G973F") on browsers without UA Client Hints. When `navigator.userAgentData` is available (Chrome 90+), the OS version is accurate and not frozen.
