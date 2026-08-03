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
  averageTouchDeformation: number;
  multiTouchAnomalies: number;
  totalPasteEvents: number;
  totalPastedCharacters: number;
  totalAutofillEvents: number;
  totalAutofilledCharacters: number;
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
  // Phase 1: Session lifecycle
  sessionStartedAt: string;
  sessionEndedAt: string;
  sessionDurationMs: number;
  // Phase 2: Touch hold duration
  averageTouchHold: number;
  touchHoldVariance: number;
  // Phase 3: Touch precision
  averageTouchPrecision: number;
  touchPrecisionVariance: number;
  // Phase 4: Field focus/blur dwell
  averageFieldDwell: number;
  totalFieldFocusTime: number;
  // Phase 5: Field revisit count
  totalFieldRevisits: number;
  // Phase 6: Password unmask
  passwordUnmaskCount: number;
  // Phase 7: Backspace burst
  backspaceBursts: number;
  singleBackspaces: number;
  backspaceBurstRatio: number;
  // Phase 8: Digraph timing
  digraphCount: number;
  digraphTimingVariance: number;
  digraphTimingMean: number;
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
  averageTouchDeformation: 0,
  multiTouchAnomalies: 0,
  totalPasteEvents: 0,
  totalPastedCharacters: 0,
  totalAutofillEvents: 0,
  totalAutofilledCharacters: 0,
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
  sessionStartedAt: "",
  sessionEndedAt: "",
  sessionDurationMs: 0,
  averageTouchHold: 0,
  touchHoldVariance: 0,
  averageTouchPrecision: 0,
  touchPrecisionVariance: 0,
  averageFieldDwell: 0,
  totalFieldFocusTime: 0,
  totalFieldRevisits: 0,
  passwordUnmaskCount: 0,
  backspaceBursts: 0,
  singleBackspaces: 0,
  backspaceBurstRatio: 0,
  digraphCount: 0,
  digraphTimingVariance: 0,
  digraphTimingMean: 0,
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
  });
  const simulationEndedRef = useRef(false);
  const simulationStartedRef = useRef(false);
  const statsRef = useRef<TelemetryStats>({ ...defaultStats });

  // Phase 2: Touch hold duration refs
  const pointerDownAtRef = useRef<number | null>(null);
  const touchHoldDurationsRef = useRef<number[]>([]);
  // Phase 3: Touch precision refs
  const touchPrecisionRef = useRef<number[]>([]);
  // Touch deformation ratio refs
  const touchDeformationRatiosRef = useRef<number[]>([]);
  // Phase 4 & 5: Field focus/blur/revisit refs
  const fieldFocusRef = useRef<Record<string, { focusAt: number | null; totalFocusMs: number; visitCount: number }>>({});
  // Phase 6: Password unmask refs
  const passwordUnmaskCountRef = useRef(0);
  // Phase 7: Backspace burst refs
  const backspaceTimestampsRef = useRef<number[]>([]);
  const backspaceBurstsRef = useRef(0);
  const singleBackspacesRef = useRef(0);
  // Phase 8: Digraph timing refs
  const digraphTimingsRef = useRef<Record<string, number[]>>({});
  // Sensor subscription refs (for endSimulation cleanup)
  const accelSubRef = useRef<{ unsubscribe: () => void } | null>(null);
  const orientSubRef = useRef<{ unsubscribe: () => void } | null>(null);
  // iOS autofill polling: map field name to DOM input element
  const inputElementRef = useRef<Record<string, HTMLInputElement | null>>({});
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Paste detection: timestamp of last paste event (DOM paste event)
  const lastPasteAtRef = useRef<number>(0);

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
      const userEventTypes = new Set([
        "keystroke", "scroll", "nav_touch", "swipe", "login_success", "login_error",
        "transfer_success", "transfer_review_opened", "paste", "autofill", "correction",
        "password_unmask", "bank_selected", "bank_search", "bank_selection_confirmed",
      ]);
      const times = eventsRef.current
        .filter((e) => userEventTypes.has(e.type))
        .map((e) => new Date(e.timestamp).getTime())
        .filter((v) => Number.isFinite(v))
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

    // Phase 2: Touch hold duration
    const holdDurations = touchHoldDurationsRef.current;
    const averageTouchHold = holdDurations.length
      ? holdDurations.reduce((a, b) => a + b, 0) / holdDurations.length
      : 0;
    // Variance: filter out holds > 1000ms (long presses/swipes), use filtered mean
    const realHolds = holdDurations.filter(d => d <= 1000);
    const realHoldMean = realHolds.length
      ? realHolds.reduce((a, b) => a + b, 0) / realHolds.length
      : 0;
    const touchHoldVariance = realHolds.length > 1
      ? realHolds.reduce((a, b) => a + Math.pow(b - realHoldMean, 2), 0) / realHolds.length
      : 0;

    // Phase 3: Touch precision
    const precisionValues = touchPrecisionRef.current;
    const averageTouchPrecision = precisionValues.length
      ? precisionValues.reduce((a, b) => a + b, 0) / precisionValues.length
      : 0;
    const touchPrecisionVariance = precisionValues.length > 1
      ? precisionValues.reduce((a, b) => a + Math.pow(b - averageTouchPrecision, 2), 0) / precisionValues.length
      : 0;

    // Phase 4 & 5: Field focus dwell + revisits
    const fieldFocusEntries = Object.values(fieldFocusRef.current);
    const totalFieldFocusTime = fieldFocusEntries.reduce((sum, f) => sum + f.totalFocusMs, 0);
    const averageFieldDwell = fieldFocusEntries.length
      ? totalFieldFocusTime / fieldFocusEntries.length
      : 0;
    const totalFieldRevisits = fieldFocusEntries.reduce(
      (sum, f) => sum + Math.max(0, f.visitCount - 1), 0
    );

    // Phase 6: Password unmask
    const passwordUnmaskCount = passwordUnmaskCountRef.current;

    // Phase 7: Backspace burst
    const backspaceBursts = backspaceBurstsRef.current;
    const singleBackspaces = singleBackspacesRef.current;
    const backspaceBurstRatio = (backspaceBursts + singleBackspaces) > 0
      ? backspaceBursts / (backspaceBursts + singleBackspaces)
      : 0;

    // Phase 8: Digraph timing
    const digraphEntries = Object.values(digraphTimingsRef.current);
    const digraphCount = digraphEntries.length;
    const digraphPairMeans = digraphEntries.map((arr) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    );
    const digraphTimingMean = digraphPairMeans.length
      ? digraphPairMeans.reduce((a, b) => a + b, 0) / digraphPairMeans.length
      : 0;
    const digraphPairVariances = digraphEntries.map((arr) => {
      if (arr.length < 2) return 0;
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    });
    const digraphTimingVariance = digraphPairVariances.length
      ? digraphPairVariances.reduce((a, b) => a + b, 0) / digraphPairVariances.length
      : 0;

    // Scroll irregularity: coefficient of variation (sqrt(variance) / mean)
    const scrollSamples = scrollSamplesRef.current;
    let scrollIrregularity = 0;
    if (scrollSamples.length >= 2) {
      const scrollMean = scrollSamples.reduce((a, b) => a + b, 0) / scrollSamples.length;
      const scrollVar = scrollSamples.reduce((a, b) => a + Math.pow(b - scrollMean, 2), 0) / scrollSamples.length;
      scrollIrregularity = scrollMean > 0 ? Math.sqrt(scrollVar) / scrollMean : 0;
    }

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
      scrollVariance: Number(scrollIrregularity.toFixed(5)),
      averageTouchHold,
      touchHoldVariance,
      averageTouchPrecision,
      touchPrecisionVariance,
      averageFieldDwell,
      totalFieldFocusTime,
      totalFieldRevisits,
      passwordUnmaskCount,
      backspaceBursts,
      singleBackspaces,
      backspaceBurstRatio,
      digraphCount,
      digraphTimingVariance,
      digraphTimingMean,
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

  // Phase 7: Shared backspace burst classification helper
  const classifyBackspace = useCallback(() => {
    const ts = backspaceTimestampsRef.current;
    if (ts.length >= 3) {
      const last3 = ts.slice(-3);
      if (last3[2] - last3[0] <= 500) {
        backspaceBurstsRef.current += 1;
        backspaceTimestampsRef.current = [];
      } else {
        singleBackspacesRef.current += 1;
        backspaceTimestampsRef.current = ts.slice(-2);
      }
    }
  }, []);

  // Flush remaining pending backspace timestamps as singles (call on non-backspace key or session end)
  const flushPendingBackspaces = useCallback(() => {
    const ts = backspaceTimestampsRef.current;
    if (ts.length > 0) {
      singleBackspacesRef.current += ts.length;
      backspaceTimestampsRef.current = [];
    }
  }, []);

  const trackKeyUp = useCallback(
    (fieldName: string, event: KeyboardEvent) => {
      if (simulationEndedRef.current) return;
      const state = fieldStateRef.current[fieldName];
      if (!state) return;

      const now = performance.now();
      // On mobile soft keyboards, keydown may not fire — use dwell=0 as fallback
      const dwell = state.lastKeyDownAt ? Math.max(0, now - state.lastKeyDownAt) : 0;
      const flight = state.lastKeyUpAt ? Math.max(0, now - state.lastKeyUpAt) : null;
      state.lastKeyUpAt = now;

      state.keystrokes.push({
        key: event.key,
        dwell,
        flight,
        time: new Date().toISOString(),
      });

      statsRef.current.totalKeystrokes += 1;

      // Phase 7: Backspace burst detection (also handle "Delete" key on iOS/some Android keyboards)
      if (event.key === "Backspace" || event.key === "Delete") {
        const bsNow = performance.now();
        backspaceTimestampsRef.current.push(bsNow);
        classifyBackspace();
      } else {
        // Non-backspace key — flush any pending backspace timestamps as singles
        flushPendingBackspaces();
      }

      // Phase 8: Digraph timing
      if (flight !== null && state.keystrokes.length >= 2) {
        const prevKey = state.keystrokes[state.keystrokes.length - 2].key;
        const digraphKey = `${prevKey}>${event.key}`;
        if (!digraphTimingsRef.current[digraphKey]) {
          digraphTimingsRef.current[digraphKey] = [];
        }
        digraphTimingsRef.current[digraphKey].push(flight);
      }

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

  // Paste detection via DOM paste event — fires reliably on long-press → "Paste" popup (mobile) and Ctrl+V (desktop)
  const trackPaste = useCallback(
    (fieldName: string, event: React.ClipboardEvent<HTMLInputElement>) => {
      if (simulationEndedRef.current) return;
      const pastedText = event.clipboardData?.getData("text") || "";
      lastPasteAtRef.current = performance.now();
      statsRef.current.totalPasteEvents += 1;
      statsRef.current.totalPastedCharacters += pastedText.length;
      pushTelemetry("paste", {
        field: fieldName,
        pastedLength: pastedText.length,
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
      const lengthDelta = current.length - state.previousValue.length;

      // Backspace/delete detection via input event (mobile soft keyboards often skip keydown/keyup)
      // On Android WebView, inputType may be "unknown" — fall back to value-length comparison
      const isDeleteInput = inputType === "deleteContentBackward" ||
        inputType === "deleteContentForward" ||
        inputType === "deleteByCut" ||
        (inputType === "unknown" && lengthDelta < 0);
      if (isDeleteInput) {
        const bsNow = performance.now();
        backspaceTimestampsRef.current.push(bsNow);
        classifyBackspace();
      } else if (lengthDelta >= 0) {
        // Non-delete input — flush any pending backspace timestamps as singles
        flushPendingBackspaces();
      }

      // Paste is detected via the DOM paste event (trackPaste) — not inputType.
      // If a paste fired recently, skip autofill detection for this change.
      const recentPaste = lastPasteAtRef.current > 0 && (performance.now() - lastPasteAtRef.current < 500);

      // Autofill detection — value jumped by 2+ chars with no paste event and no recent keystroke
      const autofillInputTypes = new Set([
        "insertReplacementText",
        "insertCommittedText",
        "insertFromDrop",
      ]);
      const recentKeystroke = state.lastKeyUpAt !== null && (performance.now() - state.lastKeyUpAt < 200);
      const isAutofill = !recentPaste && (
        autofillInputTypes.has(inputType) ||
        (lengthDelta > 1 && (inputType === "insertCompositionText" || inputType === "insertText")) ||
        (inputType === "unknown" && lengthDelta > 1 && !recentKeystroke)
      );
      if (isAutofill) {
        statsRef.current.totalAutofillEvents += 1;
        statsRef.current.totalAutofilledCharacters += lengthDelta;
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
    [pushTelemetry, persistTelemetry, classifyBackspace, flushPendingBackspaces]
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

  // Register DOM input element for iOS autofill polling
  const registerInputElement = useCallback((fieldName: string, element: HTMLInputElement | null) => {
    inputElementRef.current[fieldName] = element;
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
      if (samples.length >= 2) {
        const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
        const variance =
          samples.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
          samples.length;
        const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
        statsRef.current.scrollVariance = Number(cv.toFixed(5));
      } else {
        statsRef.current.scrollVariance = 0;
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

      const accMag = Math.sqrt(x * x + y * y + z * z);
      sensor.accelMagnitudes.push(accMag);

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

  const recordPointerDown = useCallback((precision?: number) => {
    if (simulationEndedRef.current) return;
    const now = performance.now();
    sensorStateRef.current.lastTapTime = now;
    sensorStateRef.current.tapAlreadyCorrelated = false;
    statsRef.current.totalTaps = (statsRef.current.totalTaps || 0) + 1;
    pointerDownAtRef.current = now;
    // Phase 3: Touch precision
    if (precision !== undefined && precision >= 0) {
      touchPrecisionRef.current.push(precision);
    }
  }, []);

  // Phase 2: Touch hold duration
  const recordPointerUp = useCallback(() => {
    if (simulationEndedRef.current) return;
    if (pointerDownAtRef.current !== null) {
      const holdDuration = performance.now() - pointerDownAtRef.current;
      touchHoldDurationsRef.current.push(holdDuration);
      pointerDownAtRef.current = null;
      refreshTelemetryDisplay();
    }
  }, [refreshTelemetryDisplay]);

  // Phase 4 & 5: Field focus/blur dwell + revisits
  const recordFieldFocus = useCallback((fieldName: string) => {
    if (simulationEndedRef.current) return;
    if (!fieldFocusRef.current[fieldName]) {
      fieldFocusRef.current[fieldName] = { focusAt: null, totalFocusMs: 0, visitCount: 0 };
    }
    fieldFocusRef.current[fieldName].focusAt = performance.now();
    fieldFocusRef.current[fieldName].visitCount += 1;
  }, []);

  const recordFieldBlur = useCallback((fieldName: string) => {
    if (simulationEndedRef.current) return;
    const f = fieldFocusRef.current[fieldName];
    if (f && f.focusAt !== null) {
      f.totalFocusMs += performance.now() - f.focusAt;
      f.focusAt = null;
      refreshTelemetryDisplay();
    }
  }, [refreshTelemetryDisplay]);

  // Phase 6: Password unmask
  const recordPasswordUnmask = useCallback(() => {
    if (simulationEndedRef.current) return;
    passwordUnmaskCountRef.current += 1;
    pushTelemetry("password_unmask", {
      time: new Date().toISOString(),
    });
    persistTelemetry();
    refreshTelemetryDisplay();
  }, [pushTelemetry, persistTelemetry, refreshTelemetryDisplay]);

  const recordMultiTouch = useCallback(() => {
    if (simulationEndedRef.current) return;
    statsRef.current.multiTouchAnomalies = (statsRef.current.multiTouchAnomalies || 0) + 1;
    refreshTelemetryDisplay();
  }, [refreshTelemetryDisplay]);

  const recordTouchDeformation = useCallback((deformationRatio?: number) => {
    if (simulationEndedRef.current) return;
    statsRef.current.touchDeformations = (statsRef.current.touchDeformations || 0) + 1;
    if (deformationRatio !== undefined && deformationRatio >= 0) {
      touchDeformationRatiosRef.current.push(deformationRatio);
      const ratios = touchDeformationRatiosRef.current;
      statsRef.current.averageTouchDeformation = Number((ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(4));
    }
    refreshTelemetryDisplay();
  }, [refreshTelemetryDisplay]);

  // Phase 1: Start simulation
  const startSimulation = useCallback(() => {
    if (simulationStartedRef.current || simulationEndedRef.current) return;
    simulationStartedRef.current = true;
    const now = new Date().toISOString();
    statsRef.current.sessionStartedAt = now;
    pushTelemetry("session_start", { startedAt: now });

    // iOS autofill polling: Safari Autofill / iCloud Keychain set input values
    // without firing DOM events. Poll every 500ms to detect multi-char jumps.
    pollIntervalRef.current = setInterval(() => {
      if (simulationEndedRef.current) return;
      for (const [fieldName, element] of Object.entries(inputElementRef.current)) {
        if (!element) continue;
        const state = fieldStateRef.current[fieldName];
        if (!state) continue;
        const domValue = element.value;
        const delta = domValue.length - state.previousValue.length;
        const recentKeystroke = state.lastKeyUpAt !== null && (performance.now() - state.lastKeyUpAt < 200);
        // Only detect if value grew by 2+ chars with no recent keystroke (not from typing)
        if (delta > 1 && !recentKeystroke && domValue !== state.previousValue) {
          statsRef.current.totalAutofillEvents += 1;
          statsRef.current.totalAutofilledCharacters += delta;
          pushTelemetry("autofill", {
            field: fieldName,
            inputType: "polling_detected",
            textLength: domValue.length,
            time: new Date().toISOString(),
          });
          persistTelemetry();
        }
        // Sync previousValue with actual DOM value to prevent re-detection
        state.previousValue = domValue;
      }
    }, 500);
  }, [pushTelemetry, persistTelemetry]);

  // End simulation
  const endSimulation = useCallback(() => {
    if (simulationEndedRef.current) return;
    simulationEndedRef.current = true;
    // Flush any pending backspace timestamps as singles before final computation
    flushPendingBackspaces();
    const now = new Date().toISOString();
    statsRef.current.sessionEndedAt = now;
    const startMs = statsRef.current.sessionStartedAt
      ? new Date(statsRef.current.sessionStartedAt).getTime()
      : 0;
    statsRef.current.sessionDurationMs = startMs
      ? Date.now() - startMs
      : 0;
    // Unsubscribe sensor listeners
    accelSubRef.current?.unsubscribe();
    orientSubRef.current?.unsubscribe();
    accelSubRef.current = null;
    orientSubRef.current = null;
    // Stop autofill polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    // Final metrics computation
    computeMetrics();
    pushTelemetry("session_end", {
      endedAt: now,
      durationMs: statsRef.current.sessionDurationMs,
    });
  }, [computeMetrics, pushTelemetry, flushPendingBackspaces]);

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
      Number((s.averageTouchDeformation || 0).toFixed(4)),
      s.multiTouchAnomalies || 0,
      s.totalPasteEvents || 0,
      s.totalPastedCharacters || 0,
      s.totalAutofillEvents || 0,
      s.totalAutofilledCharacters || 0,
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
      s.sessionStartedAt || "",
      s.sessionEndedAt || "",
      s.sessionDurationMs || 0,
      Number((s.averageTouchHold || 0).toFixed(2)),
      Number((s.touchHoldVariance || 0).toFixed(2)),
      Number((s.averageTouchPrecision || 0).toFixed(2)),
      Number((s.touchPrecisionVariance || 0).toFixed(2)),
      Number((s.averageFieldDwell || 0).toFixed(2)),
      Number((s.totalFieldFocusTime || 0).toFixed(2)),
      s.totalFieldRevisits || 0,
      s.passwordUnmaskCount || 0,
      s.backspaceBursts || 0,
      s.singleBackspaces || 0,
      Number((s.backspaceBurstRatio || 0).toFixed(4)),
      s.digraphCount || 0,
      Number((s.digraphTimingVariance || 0).toFixed(4)),
      Number((s.digraphTimingMean || 0).toFixed(2)),
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
      const [battery, brightness, deviceInfo, network] = await Promise.all([
        getBatteryState(),
        getScreenBrightness(),
        getDeviceInfo(),
        getNetworkType(),
      ]);
      // GPS on web requires user gesture — collected via requestGeolocation() on login instead
      const geo = isNativePlatform() ? await getGeolocation() : null;
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

    if (!document.hidden && document.visibilityState === "visible") {
      subscribeAcceleration((d) => recordMotion(d.x, d.y, d.z, d.interval)).then((sub) => { accelSubRef.current = sub; });
      subscribeOrientation((d) => recordOrientation(d.alpha, d.beta, d.gamma)).then((sub) => { orientSubRef.current = sub; });
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
      pushTelemetry("touch_cancel", { time: new Date().toISOString() });
      persistTelemetry();
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      accelSubRef.current?.unsubscribe();
      orientSubRef.current?.unsubscribe();
      accelSubRef.current = null;
      orientSubRef.current = null;
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

  // Request GPS after user interaction (browsers require user gesture for permission)
  const requestGeolocation = useCallback(async () => {
    try {
      const geo = await getGeolocation();
      if (geo) {
        const s = statsRef.current;
        s.gpsLat = geo.lat;
        s.gpsLng = geo.lng;
        s.gpsAccuracy = geo.accuracy;
        setStats({ ...s });
        pushTelemetry("gps_reading", { ...geo, time: new Date().toISOString() });
      }
    } catch {}
  }, [pushTelemetry]);

  // Request iOS motion/orientation permission after user gesture (iOS 13+ requires this)
  const motionPermissionRequestedRef = useRef(false);
  const requestMotionPermission = useCallback(async () => {
    if (motionPermissionRequestedRef.current) return;
    motionPermissionRequestedRef.current = true;
    try {
      if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
        await (DeviceMotionEvent as any).requestPermission();
      }
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        await (DeviceOrientationEvent as any).requestPermission();
      }
    } catch {}
  }, []);

  return {
    stats,
    eventCount,
    sensorStatus,
    isNative: isNativePlatform(),
    firestoreEnabled: Boolean(uid),
    trackKeyDown,
    trackKeyUp,
    trackPaste,
    trackInputChange,
    registerField,
    registerInputElement,
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
    recordPointerUp,
    recordFieldFocus,
    recordFieldBlur,
    recordPasswordUnmask,
    recordMultiTouch,
    recordTouchDeformation,
    startSimulation,
    endSimulation,
    requestGeolocation,
    requestMotionPermission,
    buildExportRow,
    sendToFirestore,
    registerSubmission,
    createDraftSubmission,
    downloadTelemetryCSV,
    persistTelemetry,
  };
}
