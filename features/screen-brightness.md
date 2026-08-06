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
On web, there is no API to read the user's screen brightness setting. The Ambient Light Sensor API measures room lighting (lux) as a proxy, mapped to 0–1. If Ambient Light Sensor is unavailable (most Android browsers), brightness returns `null` — no synthetic fallback is used. This is honest "no data" rather than a fake constant.

## SI Unit
dimensionless ratio (0.0–1.0)

## Physical Device Used
- Native: Screen brightness sensor (OS-level setting)
- Web proxy: Ambient light sensor (MEMS light sensor) — `AmbientLightSensor` API (returns `null` on unsupported browsers, no synthetic fallback)

## Export Columns
| Column | Type | Description |
|---|---|---|
| Screen brightness | float | Brightness level or ambient light proxy (0.0–1.0), null if unsupported |

## Bot Detection Rationale
Humans adjust screen brightness based on environment (indoor ~50%, outdoor ~100%). Bots don't have screens — brightness is always null or 0. The Ambient Light Sensor proxy measures room lighting: bots in data centers have constant lux (no variation), while humans move between environments with varying light. A null value is inconclusive (unsupported browser), but a consistent non-null value across sessions with zero variation is mildly suspicious.
