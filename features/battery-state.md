# Battery State

## What It Is About
Records the device's battery level and charging status. Provides environmental context and can detect inconsistencies that suggest virtual machines or bots.

## How It Is Calculated
```
// On web (Chrome/Edge):
const battery = await navigator.getBattery()
batteryLevel = battery.level        // 0.0–1.0
batteryCharging = battery.charging  // boolean

// On native:
const info = await Device.getBatteryInfo()
batteryLevel = info.batteryLevel
batteryCharging = info.isCharging
```

## SI Unit
- Battery level: dimensionless ratio (0.0–1.0)
- Battery charging: boolean (true/false)

## Physical Device Used
Battery sensor (hardware power management). On web: `navigator.getBattery()` API (Chrome/Edge only). On native: `@capacitor/device`.

## Export Columns
| Column | Type | Description |
|---|---|---|
| Battery level | float | Charge level (0.0–1.0) |
| Battery charging | boolean | Whether device is plugged in |

## Bot Detection Rationale
Real devices have batteries that drain over time. Bots on servers or VMs often report battery level as 1.0 (full) and charging as true — constantly. If the same session shows battery level at exactly 1.0 and charging true, it may be a server. Humans' battery levels vary naturally. Cross-session battery drain patterns are also human signals. Note: Safari and Firefox don't support the Battery API, so values may be null on those browsers.
