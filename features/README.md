# AFRID Bot Detection Features

Complete index of all tracked telemetry features for bot detection in the banking simulation.

## Feature Index

| # | Feature Group | Export Column(s) | File | SI Unit |
|---|---|---|---|---|
| 1 | Session Metadata | session_id, event_index, is_human | [session-metadata.md](session-metadata.md) | string / count / boolean |
| 2 | Task Completion Speed | task_completion_speed, Inter_event_idle_duration | [task-completion-speed.md](task-completion-speed.md) | seconds (s) |
| 3 | Typing Actions | Typing actions | [typing-actions.md](typing-actions.md) | count |
| 4 | Text Fixes | Text fixes | [text-fixes.md](text-fixes.md) | count |
| 5 | Login Behavior | Login attempts, Login problems | [login-behavior.md](login-behavior.md) | count |
| 6 | Transfer Behavior | Review checks, Transfers completed | [transfer-behavior.md](transfer-behavior.md) | count |
| 7 | Swipe Dynamics | Swipe incomplete, Swipe completes, swipe curve | [swipe-dynamics.md](swipe-dynamics.md) | count / count / ratio |
| 8 | Navigation Taps | Navigation taps | [navigation-taps.md](navigation-taps.md) | count |
| 9 | Motion Sensor | Motion checks | [motion-sensor.md](motion-sensor.md) | count |
| 10 | Orientation Sensor | Orientation checks | [orientation-sensor.md](orientation-sensor.md) | count |
| 11 | Button Pressure | Average button pressure | [button-pressure.md](button-pressure.md) | ratio (0.0–1.0) |
| 12 | Neuromuscular Entropy | Neuromuscular Entropy | [neuromuscular-entropy.md](neuromuscular-entropy.md) | dimensionless |
| 13 | Distribution Jitter | Distribution jitter | [distribution-jitter.md](distribution-jitter.md) | milliseconds (ms) |
| 14 | Background Checks | Background checks | [background-checks.md](background-checks.md) | count |
| 15 | Keystroke Timing | Average key hold (ms), Average key gap (ms) | [keystroke-timing.md](keystroke-timing.md) | milliseconds (ms) |
| 16 | Scroll Irregularity | Scroll irregularity | [scroll-irregularity.md](scroll-irregularity.md) | dimensionless (CV) |
| 17 | Tap-to-Vibration Correlation | Tap-to-vibration correlation | [tap-vibration-correlation.md](tap-vibration-correlation.md) | ratio (0.0–1.0) |
| 18 | Touch Area Deformation | Touch area deformation, Touch area deformation ratio | [touch-area-deformation.md](touch-area-deformation.md) | count / ratio (0.0–1.0) |
| 19 | Multi-Touch Anomalies | Multi-touch anomalies | [multi-touch-anomalies.md](multi-touch-anomalies.md) | count |
| 20 | Paste Detection | Paste detected, Pasted characters | [paste-detection.md](paste-detection.md) | count / count |
| 21 | Autofill Detection | Autofill detected, Autofilled characters | [autofill-detection.md](autofill-detection.md) | count / count |
| 22 | GPS Location | GPS lat, GPS lng, GPS accuracy | [gps-location.md](gps-location.md) | degrees / meters |
| 23 | Battery State | Battery level, Battery charging | [battery-state.md](battery-state.md) | ratio / boolean |
| 24 | Screen Brightness | Screen brightness | [screen-brightness.md](screen-brightness.md) | ratio (0.0–1.0) |
| 25 | Device Info | Device model, OS version, Platform | [device-info.md](device-info.md) | string |
| 26 | Network Type | Network type | [network-type.md](network-type.md) | string |
| 27 | Session Lifecycle | Session started at, Session ended at, Session duration (ms) | [session-lifecycle.md](session-lifecycle.md) | ISO datetime / ms |
| 28 | Touch Hold Duration | Avg touch hold (ms), Touch hold variance | [touch-hold-duration.md](touch-hold-duration.md) | ms / ms² |
| 29 | Touch Precision | Avg touch precision (px), Touch precision variance | [touch-precision.md](touch-precision.md) | px / px² |
| 30 | Field Dwell Time | Avg field dwell (ms), Total field focus (ms) | [field-dwell-time.md](field-dwell-time.md) | ms |
| 31 | Field Revisits | Field revisits | [field-revisits.md](field-revisits.md) | count |
| 32 | Password Unmask | Password unmask count | [password-unmask.md](password-unmask.md) | count |
| 33 | Backspace Behavior | Backspace bursts, Single backspaces, Backspace burst ratio | [backspace-behavior.md](backspace-behavior.md) | count / count / ratio |
| 34 | Digraph Timing | Digraph pairs, Digraph timing variance, Digraph timing mean (ms) | [digraph-timing.md](digraph-timing.md) | count / ms² / ms |

## Total Export Columns: 59

Each feature group has a dedicated markdown file with:
- **What it is about** — plain English description
- **How it is calculated** — formula/algorithm
- **SI Unit** — unit of measurement
- **Physical Device Used** — sensor/hardware required
- **Export Columns** — table of columns
- **Bot Detection Rationale** — why it matters for detecting bots

## Platform Compatibility

| Feature | Web | APK (Android) | APK (iOS) |
|---|---|---|---|
| Keystrokes, digraph, backspace | ✅ | ✅ (input event fallback) | ✅ |
| Touch hold, precision | ✅ | ✅ | ✅ |
| Touch area deformation | ✅ (Chrome) | ✅ | ❌ (no radiusX/Y) |
| Motion sensor | ✅ (needs permission) | ✅ | ✅ (needs permission) |
| Orientation sensor | ✅ (needs permission) | ✅ | ✅ (needs permission) |
| GPS | ✅ (login click) | ✅ (on mount) | ✅ (on mount) |
| Battery | ✅ (Chrome/Edge) | ✅ | ❌ (no API) |
| Screen brightness | ✅ (AmbientLight) | ✅ | ❌ (no API) |
| Network type | ✅ (Chrome/Edge) | ✅ | ✅ |
| Paste (DOM paste event) | ✅ | ✅ | ✅ |
| Autofill (inputType + polling) | ✅ | ✅ (inputType + value-jump) | ✅ (DOM polling) |
