# GPS Location

## What It Is About
Records the device's geographic coordinates (latitude, longitude) and the accuracy of the reading in meters. Verifies that the user is at a physical location consistent with their claimed identity.

## How It Is Calculated
```
// On user gesture (login click):
const pos = await navigator.geolocation.getCurrentPosition(
  successCallback,
  errorCallback,
  { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
)

gpsLat = pos.coords.latitude
gpsLng = pos.coords.longitude
gpsAccuracy = pos.coords.accuracy  // meters
```
On native: uses `@capacitor/geolocation` plugin. On web: uses `navigator.geolocation` API (requires HTTPS and user permission).

## SI Unit
- GPS lat: degrees (°) — range -90 to 90
- GPS lng: degrees (°) — range -180 to 180
- GPS accuracy: meters (m)

## Physical Device Used
GPS receiver (GNSS chip in smartphone/tablet). On web: browser geolocation API (uses GPS, WiFi, IP triangulation). On native: `@capacitor/geolocation`.

## Export Columns
| Column | Type | Description |
|---|---|---|
| GPS lat | float | Latitude (-90 to 90) |
| GPS lng | float | Longitude (-180 to 180) |
| GPS accuracy | float | Accuracy radius in meters |

## Bot Detection Rationale
Bots run in data centers with no GPS — coordinates will be 0/0/0 or null. Even IP-based geolocation for bots points to cloud regions (AWS, GCP) rather than residential areas. A real GPS reading with reasonable accuracy (<100m) is a strong human signal. Sudden location changes between sessions (Nigeria → Russia in minutes) indicate account takeover. Note: web browsers require a user gesture (click) to prompt for GPS permission, and the user must grant it.
