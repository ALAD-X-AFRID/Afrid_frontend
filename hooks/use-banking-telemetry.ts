"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { EXPORT_HEADERS } from "@/lib/banking-constants";
import { saveTelemetry, createDraftSubmission as createDraftSubmissionInFirestore, updateSubmissionStatus } from "@/lib/firestore";
import {
  subscribeAcceleration,
  subscribeOrientation,
  getGeolocation,
  getBatteryState,
  getScreenBrightness,
  getDeviceInfo,
  getNetworkType,
} from "@/lib/native-sensors";
import { isNativePlatform } from "@/lib/platform";

type TelemetryEvent = {
  type: string;
  timestamp: string;
  data: Record<string, unknown>;
};

type TelemetryStats = {
  totalKeystrokes: number;
  totalCorrections: number;
  totalTransfers: number;
  totalLoginAttempts: number;
  totalLoginErrors: number;
  incompleteSwipes: number;
  completedSwipes: number;
  totalReviewChecks: number;
  totalNavTouches: number;
  totalMotionEvents: number;
  totalOrientationEvents: number;
  totalVisibilityChanges: number;
  totalSensorEvents: number;
  averageDwell: number;
  averageFlight: number;
  scrollVariance: number;
  averageSwipeCurve: number;
  correlatedTaps: number;
  totalTaps: number;
  touchDeformations: number;
  multiTouchAnomalies: number;
  totalPasteEvents: number;
  totalAutofillEvents: number;
  averageButtonPressure: number;
  neuromuscularEntropy: number;
  distributionJitter: number;
  gpsLat: number | null;
  gpsLng: number | null;
  gpsAccuracy: number | null;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  screenBrightness: number | null;
  deviceModel: string;
  osVersion: string;
  platform: string;
  networkType: string;
};

type FieldState = {
  lastKeyUpAt: number | null;
  lastKeyDownAt: number | null;
  previousValue: string;
  keystrokes: { key: string; dwell: number; flight: number | null; time: string }[];
  corrections: number;
};

type SensorState = {
  motionEvents: number;
  orientationEvents: number;
  visibilityChanges: number;
  hiddenMs: number;
  lastHiddenAt: number | null;
  lastMotionAt: number;
  lastOrientationAt: number;
  lastTapTime: number;
  tapAlreadyCorrelated: boolean;
  accelMagnitudes: number[];
  gyroMagnitudes: number[];
  totalJitter: number;
  jitterSamples: number;
  lastAcceleration?: { x: number; y: number; z: number };
};

const defaultStats: TelemetryStats = {
  totalKeystrokes: 0,
  totalCorrections: 0,
  totalTransfers: 0,
  totalLoginAttempts: 0,
  totalLoginErrors: 0,
  incompleteSwipes: 0,
  completedSwipes: 0,
  totalReviewChecks: 0,
  totalNavTouches: 0,
  totalMotionEvents: 0,
  totalOrientationEvents: 0,
  totalVisibilityChanges: 0,
  totalSensorEvents: 0,
  averageDwell: 0,
  averageFlight: 0,
  scrollVariance: 0,
  averageSwipeCurve: 0,
  correlatedTaps: 0,
  totalTaps: 0,
  touchDeformations: 0,
  multiTouchAnomalies: 0,
  totalPasteEvents: 0,
  totalAutofillEvents: 0,
  averageButtonPressure: 0,
  neuromuscularEntropy: 0,
  distributionJitter: 0,
  gpsLat: null,
  gpsLng: null,
  gpsAccuracy: null,
  batteryLevel: null,
  batteryCharging: null,
  screenBrightness: null,
  deviceModel: "unknown",
  osVersion: "unknown",
  platform: "web",
  networkType: "unknown",
};

export function useBankingTelemetry(sessionId: string, uid?: string, userEmail?: string, userName?: string, username?: string) {
  const eventsRef = useRef<TelemetryEvent[]>([]);
  const fieldStateRef = useRef<Record<string, FieldState>>({});
  const buttonPressuresRef = useRef<number[]>([]);
  const scrollSamplesRef = useRef<number[]>([]);
  const swipeCurveSamplesRef = useRef<number[]>([]);
  const sensorStateRef = useRef<SensorState>({
    motionEvents: 0,
    orientationEvents: 0,
    visibilityChanges: 0,
    hiddenMs: 0,
    lastHiddenAt: null,
    lastMotionAt: 0,
    lastOrientationAt: 0,
    lastTapTime: 0,
    tapAlreadyCorrelated: false,
    accelMagnitudes: [],
    gyroMagnitudes: [],
    totalJitter: 0,
    jitterSamples: 0,
  });
  const simulationEndedRef = useRef(false);
  const statsRef = useRef<TelemetryStats>({ ...defaultStats });

  const [stats, setStats] = useState<TelemetryStats>({ ...defaultStats });
  const [eventCount, setEventCount] = useState(0);

  const pushTelemetry = useCallback((type: string, data: Record<string, unknown>) => {
    if (simulationEndedRef.current) return;
    const event: TelemetryEvent = {
      type,
      timestamp: new Date().toISOString(),
      data,
    };
    eventsRef.current.unshift(event);
    setEventCount(eventsRef.current.length);
  }, []);

  const persistTelemetry = useCallback(() => {
    // Telemetry is kept in-memory only; flushed to Firestore on submit
  }, []);

  const computeMetrics = useCallback(() => {
    const dwellValues: number[] = [];
    const flightValues: number[] = [];

    Object.values(fieldStateRef.current).forEach((state) => {
      state.keystrokes.forEach((entry) => {
        dwellValues.push(entry.dwell);
        if (entry.flight !== null) flightValues.push(entry.flight);
      });
    });

    const totalKeystrokes = Object.values(fieldStateRef.current).reduce(
      (sum, state) => sum + state.keystrokes.length,
      0
    );
    const totalCorrections = Object.values(fieldStateRef.current).reduce(
      (sum, state) => sum + state.corrections,
      0
    );
    const averageDwell = dwellValues.length
      ? dwellValues.reduce((sum, value) => sum + value, 0) / dwellValues.length
      : 0;
    const averageFlight = flightValues.length
      ? flightValues.reduce((sum, value) => sum + value, 0) / flightValues.length
      : 0;

    const sensor = sensorStateRef.current;
    const totalSensorEvents =
      sensor.motionEvents + sensor.orientationEvents + sensor.visibilityChanges;

    let accelVariance = 0;
    if (sensor.accelMagnitudes.length > 0) {
      const mean =
        sensor.accelMagnitudes.reduce((a, b) => a + b, 0) /
        sensor.accelMagnitudes.length;
      accelVariance =
        sensor.accelMagnitudes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        sensor.accelMagnitudes.length;
    }

    let gyroVariance = 0;
    if (sensor.gyroMagnitudes.length > 0) {
      const mean =
        sensor.gyroMagnitudes.reduce((a, b) => a + b, 0) /
        sensor.gyroMagnitudes.length;
      gyroVariance =
        sensor.gyroMagnitudes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        sensor.gyroMagnitudes.length;
    }

    const neuromuscularEntropy = Math.sqrt(accelVariance) + Math.sqrt(gyroVariance);

    let distributionJitter = 0;
    if (eventsRef.current.length > 2) {
      const times = eventsRef.current
        .map((e) => new Date(e.timestamp).getTime())
        .sort((a, b) => a - b);
      const deltas: number[] = [];
      for (let i = 1; i < times.length; i++) {
        deltas.push(times[i] - times[i - 1]);
      }
      let jitterSum = 0;
      for (let i = 1; i < deltas.length; i++) {
        jitterSum += Math.abs(deltas[i] - deltas[i - 1]);
      }
      distributionJitter = deltas.length > 1 ? jitterSum / (deltas.length - 1) : 0;
    }

    const averageButtonPressure =
      buttonPressuresRef.current.length > 0
        ? buttonPressuresRef.current.reduce((a, b) => a + b, 0) /
          buttonPressuresRef.current.length
        : 0;

    const newStats: TelemetryStats = {
      ...statsRef.current,
      totalKeystrokes,
      totalCorrections,
      averageDwell,
      averageFlight,
      totalSensorEvents,
      totalVisibilityChanges: sensor.visibilityChanges,
      totalMotionEvents: sensor.motionEvents,
      totalOrientationEvents: sensor.orientationEvents,
      neuromuscularEntropy,
      distributionJitter,
      averageButtonPressure,
    };

    statsRef.current = newStats;
    setStats(newStats);
    return newStats;
  }, []);

  const refreshTelemetryDisplay = useCallback(() => {
    computeMetrics();
  }, [computeMetrics]);

  // Keyboard tracking
  const trackKeyDown = useCallback(
    (fieldName: string, event: KeyboardEvent) => {
      if (simulationEndedRef.current) return;
      if (!fieldStateRef.current[fieldName]) {
        fieldStateRef.current[fieldName] = {
          lastKeyUpAt: null,
          lastKeyDownAt: null,
          previousValue: "",
          keystrokes: [],
          corrections: 0,
        };
      }
      fieldStateRef.current[fieldName].lastKeyDownAt = performance.now();
    },
    []
  );

  const trackKeyUp = useCallback(
    (fieldName: string, event: KeyboardEvent) => {
      if (simulationEndedRef.current) return;
      const state = fieldStateRef.current[fieldName];
      if (!state || !state.lastKeyDownAt) return;

      const now = performance.now();
      const dwell = Math.max(0, now - state.lastKeyDownAt);
      const flight = state.lastKeyUpAt ? Math.max(0, now - state.lastKeyUpAt) : null;
      state.lastKeyUpAt = now;

      state.keystrokes.push({
        key: event.key,
        dwell,
        flight,
        time: new Date().toISOString(),
      });

      statsRef.current.totalKeystrokes += 1;
      pushTelemetry("keystroke", {
        field: fieldName,
        key: event.key,
        dwell,
        flight,
        time: new Date().toISOString(),
      });
      persistTelemetry();
      refreshTelemetryDisplay();
    },
    [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]
  );

  const trackInputChange = useCallback(
    (fieldName: string, event: React.ChangeEvent<HTMLInputElement>) => {
      if (simulationEndedRef.current) return;
      if (!fieldStateRef.current[fieldName]) {
        fieldStateRef.current[fieldName] = {
          lastKeyUpAt: null,
          lastKeyDownAt: null,
          previousValue: "",
          keystrokes: [],
          corrections: 0,
        };
      }
      const state = fieldStateRef.current[fieldName];
      const current = event.target.value;
      const inputType = (event.nativeEvent as InputEvent).inputType || "unknown";

      if (inputType === "insertFromPaste") {
        statsRef.current.totalPasteEvents += 1;
        pushTelemetry("paste", {
          field: fieldName,
          inputType,
          pastedLength: current.length,
          time: new Date().toISOString(),
        });
        persistTelemetry();
      }

      if (inputType === "insertReplacementText") {
        statsRef.current.totalAutofillEvents += 1;
        pushTelemetry("autofill", {
          field: fieldName,
          inputType,
          textLength: current.length,
          time: new Date().toISOString(),
        });
        persistTelemetry();
      }

      if (current.length < state.previousValue.length) {
        state.corrections += 1;
        statsRef.current.totalCorrections += 1;
        pushTelemetry("correction", {
          field: fieldName,
          reason: "shortened input",
          inputType,
          time: new Date().toISOString(),
        });
        persistTelemetry();
      }

      state.previousValue = current;
    },
    [pushTelemetry, persistTelemetry]
  );

  // Register field for tracking
  const registerField = useCallback((fieldName: string, initialValue: string = "") => {
    if (!fieldStateRef.current[fieldName]) {
      fieldStateRef.current[fieldName] = {
        lastKeyUpAt: null,
        lastKeyDownAt: null,
        previousValue: initialValue,
        keystrokes: [],
        corrections: 0,
      };
    }
  }, []);

  // Button pressure tracking
  const trackButtonPressure = useCallback(
    (pressure: number) => {
      if (simulationEndedRef.current) return;
      if (pressure > 0) {
        buttonPressuresRef.current.push(pressure);
        refreshTelemetryDisplay();
      }
    },
    [refreshTelemetryDisplay]
  );

  // Nav touch tracking
  const trackNavTouch = useCallback(
    (link: string, pressure: number, area: number, pointerType: string) => {
      if (simulationEndedRef.current) return;
      statsRef.current.totalNavTouches += 1;
      pushTelemetry("nav_touch", {
        link,
        pressure,
        area,
        pointerType,
        time: new Date().toISOString(),
      });
      persistTelemetry();
      refreshTelemetryDisplay();
    },
    [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]
  );

  // Scroll tracking
  const trackScroll = useCallback(
    (top: number, speed: number) => {
      if (simulationEndedRef.current) return;
      scrollSamplesRef.current.push(speed);

      const samples = scrollSamplesRef.current;
      if (samples.length > 0) {
        const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
        const variance =
          samples.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
          samples.length;
        statsRef.current.scrollVariance = Number(variance.toFixed(5));
      }

      pushTelemetry("scroll", {
        top,
        speed: Number(speed.toFixed(4)),
        time: new Date().toISOString(),
      });
      persistTelemetry();
      refreshTelemetryDisplay();
    },
    [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]
  );

  // Swipe tracking
  const recordSwipe = useCallback(
    (completed: boolean, duration: number, pathLength: number, swipeCurve: number) => {
      if (simulationEndedRef.current) return;
      if (completed) {
        statsRef.current.completedSwipes += 1;
      } else {
        statsRef.current.incompleteSwipes += 1;
      }
      swipeCurveSamplesRef.current.push(swipeCurve);
      const total = swipeCurveSamplesRef.current.reduce((sum, value) => sum + value, 0);
      statsRef.current.averageSwipeCurve = swipeCurveSamplesRef.current.length
        ? Number((total / swipeCurveSamplesRef.current.length).toFixed(4))
        : 0;

      pushTelemetry("swipe", {
        completed,
        duration: Math.round(duration),
        pathLength,
        swipeCurve,
        time: new Date().toISOString(),
      });
      persistTelemetry();
      refreshTelemetryDisplay();
    },
    [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]
  );

  // Login tracking
  const recordLoginAttempt = useCallback(
    (success: boolean, username?: string) => {
      if (simulationEndedRef.current) return;
      statsRef.current.totalLoginAttempts += 1;
      if (!success) {
        statsRef.current.totalLoginErrors += 1;
        pushTelemetry("login_error", {
          message: "Missing credentials",
          time: new Date().toISOString(),
        });
      } else {
        pushTelemetry("login_success", {
          username,
          time: new Date().toISOString(),
        });
      }
      persistTelemetry();
      refreshTelemetryDisplay();
    },
    [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]
  );

  // Transfer tracking
  const recordTransfer = useCallback(
    (recipient: string, account: string, amount: number) => {
      if (simulationEndedRef.current) return;
      statsRef.current.totalTransfers += 1;
      pushTelemetry("transfer_success", {
        recipient,
        account,
        amount,
        time: new Date().toISOString(),
      });
      persistTelemetry();
      refreshTelemetryDisplay();
    },
    [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]
  );

  // Review tracking
  const recordReview = useCallback(
    (values: Record<string, string>) => {
      if (simulationEndedRef.current) return;
      statsRef.current.totalReviewChecks += 1;
      pushTelemetry("transfer_review_opened", {
        ...values,
        time: new Date().toISOString(),
      });
      persistTelemetry();
      refreshTelemetryDisplay();
    },
    [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]
  );

  // Bank selection tracking
  const recordBankSelected = useCallback(
    (bank: string) => {
      if (simulationEndedRef.current) return;
      pushTelemetry("bank_selected", {
        bank,
        time: new Date().toISOString(),
      });
      persistTelemetry();
    },
    [pushTelemetry, persistTelemetry]
  );

  const recordBankSearch = useCallback(
    (query: string, matches: number) => {
      if (simulationEndedRef.current) return;
      pushTelemetry("bank_search", {
        query,
        matches,
        time: new Date().toISOString(),
      });
      persistTelemetry();
    },
    [pushTelemetry, persistTelemetry]
  );

  const recordBankConfirmed = useCallback(
    (bank: string) => {
      if (simulationEndedRef.current) return;
      pushTelemetry("bank_selection_confirmed", {
        bank,
        time: new Date().toISOString(),
      });
      persistTelemetry();
    },
    [pushTelemetry, persistTelemetry]
  );

  // Sensor tracking
  const recordMotion = useCallback(
    (x: number, y: number, z: number, interval: number) => {
      if (simulationEndedRef.current) return;
      if (document.hidden || document.visibilityState !== "visible") return;
      const now = performance.now();
      const sensor = sensorStateRef.current;

      if (sensor.lastTapTime && !sensor.tapAlreadyCorrelated) {
        const diff = now - sensor.lastTapTime;
        if (diff <= 300) {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const motionDelta = Math.abs(magnitude - 9.81);
          if (motionDelta > 0.5) {
            statsRef.current.correlatedTaps += 1;
            sensor.tapAlreadyCorrelated = true;
          }
        }
      }

      if (now - sensor.lastMotionAt < 250) return;
      sensor.lastMotionAt = now;
      sensor.motionEvents += 1;

      const currentAcc = { x, y, z };
      if (sensor.lastAcceleration) {
        const deltaX = currentAcc.x - sensor.lastAcceleration.x;
        const deltaY = currentAcc.y - sensor.lastAcceleration.y;
        const deltaZ = currentAcc.z - sensor.lastAcceleration.z;
        const jitter = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
        sensor.totalJitter += jitter;
        sensor.jitterSamples += 1;
      }
      sensor.lastAcceleration = currentAcc;

      pushTelemetry("device_motion", {
        x,
        y,
        z,
        interval,
        time: new Date().toISOString(),
      });
      persistTelemetry();
      refreshTelemetryDisplay();
    },
    [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]
  );

  const recordOrientation = useCallback(
    (alpha: number, beta: number, gamma: number) => {
      if (simulationEndedRef.current) return;
      if (document.hidden || document.visibilityState !== "visible") return;
      const now = performance.now();
      const sensor = sensorStateRef.current;
      if (now - sensor.lastOrientationAt < 250) return;
      sensor.lastOrientationAt = now;
      sensor.orientationEvents += 1;

      const gyroMag = Math.sqrt(alpha * alpha + beta * beta + gamma * gamma);
      sensor.gyroMagnitudes.push(gyroMag);

      pushTelemetry("device_orientation", {
        alpha,
        beta,
        gamma,
        time: new Date().toISOString(),
      });
      persistTelemetry();
      refreshTelemetryDisplay();
    },
    [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]
  );

  const recordVisibilityChange = useCallback(
    (state: string) => {
      if (simulationEndedRef.current) return;
      const sensor = sensorStateRef.current;
      if (state === "hidden") {
        sensor.lastHiddenAt = performance.now();
      } else if (sensor.lastHiddenAt) {
        sensor.hiddenMs += performance.now() - sensor.lastHiddenAt;
        sensor.lastHiddenAt = null;
      }
      sensor.visibilityChanges += 1;
      statsRef.current.totalVisibilityChanges = sensor.visibilityChanges;
      pushTelemetry("visibility_change", {
        state,
        hiddenMs: Math.round(sensor.hiddenMs),
        time: new Date().toISOString(),
      });
      persistTelemetry();
      refreshTelemetryDisplay();
    },
    [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]
  );

  const recordPointerDown = useCallback(() => {
    if (simulationEndedRef.current) return;
    sensorStateRef.current.lastTapTime = performance.now();
    sensorStateRef.current.tapAlreadyCorrelated = false;
    statsRef.current.totalTaps = (statsRef.current.totalTaps || 0) + 1;
  }, []);

  const recordMultiTouch = useCallback(() => {
    if (simulationEndedRef.current) return;
    statsRef.current.multiTouchAnomalies = (statsRef.current.multiTouchAnomalies || 0) + 1;
    refreshTelemetryDisplay();
  }, [refreshTelemetryDisplay]);

  const recordTouchDeformation = useCallback(() => {
    if (simulationEndedRef.current) return;
    statsRef.current.touchDeformations = (statsRef.current.touchDeformations || 0) + 1;
    refreshTelemetryDisplay();
  }, [refreshTelemetryDisplay]);

  // End simulation
  const endSimulation = useCallback(() => {
    simulationEndedRef.current = true;
  }, []);

  // Build export row
  const buildExportRow = useCallback((): (string | number)[] => {
    const s = computeMetrics();
    const tapVibrationCorrelation =
      s.totalTaps > 0 ? Number((s.correlatedTaps / s.totalTaps).toFixed(4)) : 0;

    const timestamps = eventsRef.current
      .map((e) => new Date(e.timestamp).getTime())
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b);

    const taskCompletionSpeed =
      timestamps.length >= 2
        ? Number(((timestamps[timestamps.length - 1] - timestamps[0]) / 1000).toFixed(3))
        : 0;

    let idleMs = 0;
    for (let i = 1; i < timestamps.length; i++) {
      idleMs += Math.max(0, timestamps[i] - timestamps[i - 1]);
    }
    const interEventIdle =
      timestamps.length >= 2
        ? Number((idleMs / (timestamps.length - 1) / 1000).toFixed(3))
        : 0;

    return [
      sessionId,
      eventsRef.current.length,
      taskCompletionSpeed,
      interEventIdle,
      s.totalKeystrokes,
      s.totalCorrections,
      s.totalLoginAttempts,
      s.totalLoginErrors,
      s.totalReviewChecks,
      s.totalTransfers,
      s.incompleteSwipes,
      s.completedSwipes,
      s.averageSwipeCurve,
      s.totalNavTouches,
      s.totalMotionEvents,
      s.totalOrientationEvents,
      Number((s.averageButtonPressure || 0).toFixed(4)),
      Number((s.neuromuscularEntropy || 0).toFixed(4)),
      Number((s.distributionJitter || 0).toFixed(4)),
      s.totalVisibilityChanges,
      Number(s.averageDwell.toFixed(2)),
      Number(s.averageFlight.toFixed(2)),
      Number(s.scrollVariance.toFixed(5)),
      tapVibrationCorrelation,
      s.touchDeformations || 0,
      s.multiTouchAnomalies || 0,
      s.totalPasteEvents || 0,
      s.totalAutofillEvents || 0,
      s.gpsLat ?? "",
      s.gpsLng ?? "",
      s.gpsAccuracy ?? "",
      s.batteryLevel ?? "",
      s.batteryCharging === null ? "" : s.batteryCharging ? "true" : "false",
      s.screenBrightness ?? "",
      s.deviceModel,
      s.osVersion,
      s.platform,
      s.networkType,
      1, // is_human
    ];
  }, [sessionId, computeMetrics]);

  // Send to Firestore
  const sendToFirestore = useCallback(async (): Promise<boolean> => {
    if (!uid) return false;
    const row = buildExportRow();
    return saveTelemetry({
      sessionId,
      uid,
      headers: EXPORT_HEADERS,
      row,
      isHuman: true,
    });
  }, [uid, sessionId, buildExportRow]);

  // Register submission in Firestore
  const registerSubmission = useCallback(async () => {
    if (!uid) return;
    await updateSubmissionStatus(sessionId, "Pending Review");
  }, [uid, sessionId]);

  // Create draft submission in Firestore
  const createDraftSubmission = useCallback(async () => {
    if (!uid) return;
    await createDraftSubmissionInFirestore({
      sessionId,
      uid,
      userEmail: userEmail || "",
      userName: userName || "",
      username: username || "",
    });
  }, [uid, sessionId, userEmail, userName, username]);

  // CSV download
  const downloadTelemetryCSV = useCallback(() => {
    const row = buildExportRow();
    const csv = [EXPORT_HEADERS, row]
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `afrid-telemetry-${sessionId}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [sessionId, buildExportRow]);

  // Sensor status
  const [sensorStatus, setSensorStatus] = useState("Sensors unavailable");
  useEffect(() => {
    const parts: string[] = [];
    if (isNativePlatform()) {
      parts.push("native motion", "native orientation");
    } else if (typeof window !== "undefined") {
      if ("DeviceMotionEvent" in window) parts.push("motion");
      if ("DeviceOrientationEvent" in window) parts.push("orientation");
    }
    parts.push("visibility");
    setSensorStatus(parts.length ? `Sensors: ${parts.join(", ")}` : "Sensors unavailable");
  }, []);

  // Collect one-shot sensor data on mount
  useEffect(() => {
    let cancelled = false;
    const collectDeviceInfo = async () => {
      const [geo, battery, brightness, deviceInfo, network] = await Promise.all([
        getGeolocation(),
        getBatteryState(),
        getScreenBrightness(),
        getDeviceInfo(),
        getNetworkType(),
      ]);
      if (cancelled) return;
      const s = statsRef.current;
      if (geo) { s.gpsLat = geo.lat; s.gpsLng = geo.lng; s.gpsAccuracy = geo.accuracy; }
      if (battery) { s.batteryLevel = battery.level; s.batteryCharging = battery.charging; }
      if (brightness.brightness !== null) s.screenBrightness = brightness.brightness;
      s.deviceModel = deviceInfo.model;
      s.osVersion = deviceInfo.osVersion;
      s.platform = deviceInfo.platform;
      s.networkType = network.type;
      setStats({ ...s });

      if (geo) pushTelemetry("gps_reading", { ...geo, time: new Date().toISOString() });
      if (battery) pushTelemetry("battery_state", { ...battery, time: new Date().toISOString() });
      if (brightness.brightness !== null) pushTelemetry("screen_brightness", { ...brightness, time: new Date().toISOString() });
      pushTelemetry("device_info", { ...deviceInfo, time: new Date().toISOString() });
      pushTelemetry("network_type", { ...network, time: new Date().toISOString() });
    };
    collectDeviceInfo();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global sensor listeners (native or web)
  useEffect(() => {
    const handleVisibility = () => recordVisibilityChange(document.visibilityState);
    const handleBlur = () => {
      pushTelemetry("window_blur", { time: new Date().toISOString() });
      persistTelemetry();
    };
    const handleFocus = () => {
      pushTelemetry("window_focus", { time: new Date().toISOString() });
      persistTelemetry();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    let accelSub: { unsubscribe: () => void } | null = null;
    let orientSub: { unsubscribe: () => void } | null = null;

    if (!document.hidden && document.visibilityState === "visible") {
      subscribeAcceleration((d) => recordMotion(d.x, d.y, d.z, d.interval)).then((sub) => { accelSub = sub; });
      subscribeOrientation((d) => recordOrientation(d.alpha, d.beta, d.gamma)).then((sub) => { orientSub = sub; });
    }

    // Touch tracking
    const handleTouchStart = (e: TouchEvent) => {
      if (simulationEndedRef.current) return;
      if (e.touches && e.touches.length > 1) {
        recordMultiTouch();
      }
    };
    const handleTouchCancel = () => {
      if (simulationEndedRef.current) return;
      recordMultiTouch();
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      accelSub?.unsubscribe();
      orientSub?.unsubscribe();
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [
    recordVisibilityChange,
    recordMotion,
    recordOrientation,
    recordMultiTouch,
    pushTelemetry,
    persistTelemetry,
  ]);

  // Telemetry is in-memory only; no localStorage restore

  return {
    stats,
    eventCount,
    sensorStatus,
    isNative: isNativePlatform(),
    firestoreEnabled: Boolean(uid),
    trackKeyDown,
    trackKeyUp,
    trackInputChange,
    registerField,
    trackButtonPressure,
    trackNavTouch,
    trackScroll,
    recordSwipe,
    recordLoginAttempt,
    recordTransfer,
    recordReview,
    recordBankSelected,
    recordBankSearch,
    recordBankConfirmed,
    recordPointerDown,
    recordMultiTouch,
    recordTouchDeformation,
    endSimulation,
    buildExportRow,
    sendToFirestore,
    registerSubmission,
    createDraftSubmission,
    downloadTelemetryCSV,
    persistTelemetry,
  };
}
