# Screen Brightness

## What It Is About
Records the device's screen brightness level or ambient light level as a proxy. Provides environmental context — humans adjust brightness based on their surroundings.

## How It Is Calculated

### Native (APK)
```
const result = await ScreenBrightness.getBrightness()
brightness = result.brightness  // 0.0–1.0
```

### Web Fallback (Ambient Light Sensor)
```
if "AmbientLightSensor" in window:
  sensor = new AmbientLightSensor()
  sensor.addEventListener("reading", () => {
    lux = sensor.illuminance
    brightness = min(1, max(0, lux / 1000))  // map lux to 0–1
  })
  sensor.start()
```
On web, there is no API to read the user's screen brightness setting. The Ambient Light Sensor API measures room lighting (lux) as a proxy, mapped to 0–1. If Ambient Light Sensor is unavailable (most Android browsers), the `prefers-color-scheme` CSS media query is used as a second fallback: dark mode maps to 0.3, light mode maps to 0.7. Returns `null` only if all methods fail.

### Web Fallback 2 (prefers-color-scheme)
```
if window.matchMedia("(prefers-color-scheme: dark)").matches:
  brightness = 0.3  // dark mode → likely dim screen
else:
  brightness = 0.7  // light mode → likely bright screen
```
When Ambient Light Sensor is unavailable (most Android browsers), the `prefers-color-scheme` media query provides a coarse brightness proxy based on the user's OS theme setting.

## SI Unit
dimensionless ratio (0.0–1.0)

## Physical Device Used
- Native: Screen brightness sensor (OS-level setting)
- Web proxy 1: Ambient light sensor (MEMS light sensor) — `AmbientLightSensor` API
- Web proxy 2: `prefers-color-scheme` CSS media query (dark/light mode → 0.3/0.7)

## Export Columns
| Column | Type | Description |
|---|---|---|
| Screen brightness | float | Brightness level or ambient light proxy (0.0–1.0), null if unsupported |

## Bot Detection Rationale
Humans adjust screen brightness based on environment (indoor ~50%, outdoor ~100%). Bots don't have screens — brightness is always null or 0. The Ambient Light Sensor proxy measures room lighting: bots in data centers have constant lux (no variation), while humans move between environments with varying light. A null value is inconclusive (unsupported browser), but a consistent non-null value across sessions with zero variation is mildly suspicious.
