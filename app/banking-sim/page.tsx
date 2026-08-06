"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, RefreshCw, Download, CheckCircle, Loader2, ChevronDown } from "lucide-react";
import { useBankingTelemetry } from "@/hooks/use-banking-telemetry";
import { useMetadata } from "@/context/metadata-context";
import { NIGERIAN_BANKS } from "@/lib/banking-constants";
import SwipeControl from "@/components/banking/swipe-control";

const steps = [
  { id: 1, label: "Auth", key: "auth" },
  { id: 2, label: "Transfer", key: "transfer" },
  { id: 3, label: "Bank", key: "bank" },
  { id: 4, label: "Metrics", key: "telemetry" },
];

export default function BankingSimPage() {
  const { user } = useMetadata();
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [transfer, setTransfer] = useState({ name: "", account: "", amount: "" });
  const [showReview, setShowReview] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bankQuery, setBankQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [flash, setFlash] = useState<{ msg: string; visible: boolean }>({ msg: "", visible: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<"none" | "success" | "error">("none");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [, setSwipeProgress] = useState(0);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    metadata: true,
    typing: true,
    touch: true,
    device: true,
    touchDynamics: true,
    session: true,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((s) => ({ ...s, [key]: !s[key] }));
  };

  const lastScrollRef = useRef({ top: 0, time: 0 });

  useEffect(() => {
    const id = "BANKSIM-" + Date.now();
    setSessionId(id);
  }, []);

  const telemetry = useBankingTelemetry(sessionId, user?.uid, user?.email || "", user?.displayName || "", user?.displayName || "");

  useEffect(() => {
    if (sessionId) {
      telemetry.startSimulation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const flashNotice = useCallback((msg: string) => {
    setFlash({ msg, visible: true });
    setTimeout(() => setFlash({ msg: "", visible: false }), 1800);
  }, []);

  const filteredBanks = useMemo(
    () => NIGERIAN_BANKS.filter((b) => b.toLowerCase().includes(bankQuery.toLowerCase())),
    [bankQuery]
  );

  const locked = (id: number) => {
    if (id === 1) return false;
    if (id === 2) return !completedSteps.auth;
    if (id === 3) return !completedSteps.transfer;
    if (id === 4) return !completedSteps.bank;
    return true;
  };

  const advance = (targetStep?: number) => {
    const next = targetStep ?? Math.min(4, step + 1);
    setStep(next);
    if (next === 4) {
      telemetry.endSimulation();
    }
  };

  // Step 1: Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    telemetry.requestGeolocation();
    telemetry.requestMotionPermission();
    if (!loginForm.username || !loginForm.password) {
      telemetry.recordLoginAttempt(false);
      flashNotice("Please enter both username and password.");
      return;
    }
    telemetry.recordLoginAttempt(true, loginForm.username);
    setCompletedSteps((s) => ({ ...s, auth: true }));
    flashNotice("Login successful.");
    advance(2);
  };

  // Step 2: Transfer
  const handleTransferReview = () => {
    if (!transfer.name || !transfer.account || !transfer.amount) {
      flashNotice("Please fill in all transfer fields.");
      return;
    }
    setShowReview(true);
    telemetry.recordReview({
      recipient: transfer.name,
      account: transfer.account,
      amount: transfer.amount,
    });
  };

  const handleConfirmTransfer = () => {
    setConfirmed(true);
    telemetry.recordTransfer(transfer.name, transfer.account, Number(transfer.amount));
    flashNotice("Transfer confirmed. Swipe to authorize.");
  };

  const handleSwipeComplete = (duration: number, pathLength: number, swipeCurve: number) => {
    telemetry.recordSwipe(true, duration, pathLength, swipeCurve);
    setCompletedSteps((s) => ({ ...s, transfer: true }));
    flashNotice("Transfer authorized. Select a bank to continue.");
    advance(3);
  };

  const handleSwipeIncomplete = (duration: number, pathLength: number, swipeCurve: number) => {
    telemetry.recordSwipe(false, duration, pathLength, swipeCurve);
    flashNotice("Swipe incomplete. Try again.");
  };

  // Step 3: Bank selection
  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    telemetry.recordBankSelected(bank);
  };

  const handleBankSearch = (query: string) => {
    setBankQuery(query);
    const count = NIGERIAN_BANKS.filter((b) => b.toLowerCase().includes(query.toLowerCase())).length;
    telemetry.recordBankSearch(query, count);
  };

  const handleBankConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) {
      flashNotice("Please select a bank first.");
      return;
    }
    telemetry.recordBankConfirmed(selectedBank);
    setCompletedSteps((s) => ({ ...s, bank: true }));
    flashNotice("Bank confirmed. View your behavioral metrics.");
    advance(4);
  };

  const handleBankReset = () => {
    setBankQuery("");
    setSelectedBank("");
    flashNotice("Bank selection reset.");
  };

  // Step 4: Complete task
  const handleDownload = () => {
    telemetry.downloadTelemetryCSV();
    flashNotice("Telemetry file downloaded.");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitResult("none");
    const result = await telemetry.sendToFirestore();
    if (result) {
      telemetry.registerSubmission();
      telemetry.endSimulation();
      setSubmitResult("success");
      flashNotice("Transfer completed 🎉");
      setTimeout(() => {
        router.push("/submissions");
      }, 1500);
    } else {
      setSubmitResult("error");
      flashNotice("Failed to send to Firestore.");
    }
    setSubmitting(false);
  };

  // Register fields for tracking
  useEffect(() => {
    telemetry.registerField("login-username", "");
    telemetry.registerField("login-password", "");
    telemetry.registerField("recipient-name", "");
    telemetry.registerField("recipient-account", "");
    telemetry.registerField("transfer-amount", "");
    telemetry.registerField("bank-search-input", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create draft submission once user and session are ready
  useEffect(() => {
    if (sessionId && user?.uid) {
      telemetry.createDraftSubmission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user?.uid]);

  const metricGroups = [
    {
      key: "metadata",
      title: "Session Metadata",
      color: "#888",
      cards: [
        { label: "Session ID", value: sessionId || "N/A" },
        { label: "Event count", value: telemetry.eventCount },
        { label: "Platform", value: telemetry.isNative ? "Native" : "Web" },
        { label: "Firestore", value: telemetry.firestoreEnabled ? "Enabled" : "Disabled" },
      ],
    },
    {
      key: "typing",
      title: "Typing Behavior",
      color: "#39e0ff",
      cards: [
        { label: "Typing actions", value: telemetry.stats.totalKeystrokes },
        { label: "Text fixes", value: telemetry.stats.totalCorrections },
        { label: "Avg key hold", value: `${Math.round(telemetry.stats.averageDwell)} ms` },
        { label: "Avg key gap", value: `${Math.round(telemetry.stats.averageFlight)} ms` },
        { label: "Neuromusc Entropy", value: telemetry.stats.neuromuscularEntropy ? telemetry.stats.neuromuscularEntropy.toFixed(3) : 0 },
        { label: "Dist jitter", value: telemetry.stats.distributionJitter ? telemetry.stats.distributionJitter.toFixed(3) : 0 },
        { label: "Paste events", value: telemetry.stats.totalPasteEvents || 0 },
        { label: "Pasted chars", value: telemetry.stats.totalPastedCharacters || 0 },
        { label: "Autofill events", value: telemetry.stats.totalAutofillEvents || 0 },
        { label: "Autofilled chars", value: telemetry.stats.totalAutofilledCharacters || 0 },
        { label: "Cut events", value: telemetry.stats.totalCutEvents || 0 },
        { label: "Copy events", value: telemetry.stats.totalCopyEvents || 0 },
        { label: "Backspace bursts", value: telemetry.stats.backspaceBursts || 0 },
        { label: "Single backspaces", value: telemetry.stats.singleBackspaces || 0 },
        { label: "Backspace burst ratio", value: telemetry.stats.backspaceBurstRatio ? telemetry.stats.backspaceBurstRatio.toFixed(4) : 0 },
        { label: "Digraph pairs", value: telemetry.stats.digraphCount || 0 },
        { label: "Digraph timing var", value: telemetry.stats.digraphTimingVariance ? telemetry.stats.digraphTimingVariance.toFixed(4) : 0 },
        { label: "Digraph timing mean", value: telemetry.stats.digraphTimingMean ? `${telemetry.stats.digraphTimingMean.toFixed(2)} ms` : "0 ms" },
      ],
    },
    {
      key: "touch",
      title: "Touch & Navigation",
      color: "#b27bff",
      cards: [
        { label: "Login attempts", value: telemetry.stats.totalLoginAttempts },
        { label: "Login problems", value: telemetry.stats.totalLoginErrors },
        { label: "Form reviews", value: telemetry.stats.totalReviewChecks },
        { label: "Transfers done", value: telemetry.stats.totalTransfers },
        { label: "Swipe incomplete", value: telemetry.stats.incompleteSwipes },
        { label: "Swipe completes", value: telemetry.stats.completedSwipes },
        { label: "Swipe curve", value: telemetry.stats.averageSwipeCurve },
        { label: "Screen jumps", value: telemetry.stats.totalNavTouches },
        { label: "Avg btn pressure", value: telemetry.stats.averageButtonPressure ? telemetry.stats.averageButtonPressure.toFixed(3) : 0 },
        { label: "Tap-Vib Correlation", value: telemetry.stats.totalTaps > 0 ? `${((telemetry.stats.correlatedTaps / telemetry.stats.totalTaps) * 100).toFixed(1)}%` : "0%" },
        { label: "Touch Deformation", value: telemetry.stats.touchDeformations || 0 },
        { label: "Deformation Ratio", value: telemetry.stats.averageTouchDeformation ? telemetry.stats.averageTouchDeformation.toFixed(4) : 0 },
        { label: "Multi-Touch Anomaly", value: telemetry.stats.multiTouchAnomalies || 0 },
        { label: "Scroll irregularity", value: telemetry.stats.scrollVariance.toFixed(5) },
      ],
    },
    {
      key: "touchDynamics",
      title: "Touch Dynamics",
      color: "#b27bff",
      cards: [
        { label: "Avg touch hold", value: telemetry.stats.averageTouchHold ? `${Math.round(telemetry.stats.averageTouchHold)} ms` : "0 ms" },
        { label: "Touch hold var", value: telemetry.stats.touchHoldVariance ? telemetry.stats.touchHoldVariance.toFixed(1) : 0 },
        { label: "Touch precision", value: telemetry.stats.averageTouchPrecision ? `${telemetry.stats.averageTouchPrecision.toFixed(1)} px` : "0 px" },
        { label: "Touch precision var", value: telemetry.stats.touchPrecisionVariance ? telemetry.stats.touchPrecisionVariance.toFixed(1) : 0 },
        { label: "Field dwell", value: telemetry.stats.averageFieldDwell ? `${Math.round(telemetry.stats.averageFieldDwell)} ms` : "0 ms" },
        { label: "Total field focus", value: telemetry.stats.totalFieldFocusTime ? `${Math.round(telemetry.stats.totalFieldFocusTime)} ms` : "0 ms" },
        { label: "Field revisits", value: telemetry.stats.totalFieldRevisits || 0 },
        { label: "Password unmask", value: telemetry.stats.passwordUnmaskCount || 0 },
      ],
    },
    {
      key: "device",
      title: "Device & Environment",
      color: "#39e0ff",
      cards: [
        { label: "Motion checks", value: telemetry.stats.totalMotionEvents },
        { label: "Orientation checks", value: telemetry.stats.totalOrientationEvents },
        { label: "Background checks", value: telemetry.stats.totalVisibilityChanges },
        { label: "GPS lat", value: telemetry.stats.gpsLat ?? "N/A" },
        { label: "GPS lng", value: telemetry.stats.gpsLng ?? "N/A" },
        { label: "GPS accuracy", value: telemetry.stats.gpsAccuracy ? `${telemetry.stats.gpsAccuracy.toFixed(1)} m` : "N/A" },
        { label: "Battery level", value: telemetry.stats.batteryLevel !== null ? `${Math.round(telemetry.stats.batteryLevel * 100)}%` : "N/A" },
        { label: "Battery charging", value: telemetry.stats.batteryCharging === null ? "N/A" : telemetry.stats.batteryCharging ? "Yes" : "No" },
        { label: "Screen brightness", value: telemetry.stats.screenBrightness !== null ? telemetry.stats.screenBrightness.toFixed(2) : "N/A" },
        { label: "Device model", value: telemetry.stats.deviceModel },
        { label: "OS version", value: telemetry.stats.osVersion },
        { label: "Network type", value: telemetry.stats.networkType },
      ],
    },
    {
      key: "session",
      title: "Session Lifecycle",
      color: "#39e0ff",
      cards: [
        { label: "Session started", value: telemetry.stats.sessionStartedAt || "N/A" },
        { label: "Session ended", value: telemetry.stats.sessionEndedAt || "N/A" },
        { label: "Session duration", value: telemetry.stats.sessionDurationMs ? `${(telemetry.stats.sessionDurationMs / 1000).toFixed(1)} s` : "0 s" },
        { label: "is_human", value: 1 },
      ],
    },
  ];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    let targetEl = e.target as HTMLElement;
    let attempts = 0;
    while (targetEl.parentElement && attempts < 5) {
      const r = targetEl.getBoundingClientRect();
      if (r.width >= 50 || ["BUTTON", "INPUT", "A", "SELECT"].includes(targetEl.tagName)) break;
      targetEl = targetEl.parentElement;
      attempts++;
    }
    let precision = 0;
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        precision = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );
      }
    }
    telemetry.recordPointerDown(precision);
    if (e.pointerType === "touch") return;
    const pressure = (e.nativeEvent as PointerEvent).pressure;
    if (pressure > 0) {
      telemetry.trackButtonPressure(pressure);
    }
  }, [telemetry]);

  const handlePointerUp = useCallback(() => {
    telemetry.recordPointerUp();
  }, [telemetry]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const force = (touch as any).force ?? (touch as any).webkitForce ?? 0;
      const radiusX = (touch as any).radiusX || (touch as any).webkitRadiusX || 0;
      const radiusY = (touch as any).radiusY || (touch as any).webkitRadiusY || 0;
      // Samsung devices report force=1.0 always but contact area varies with pressure
      let pressure = force;
      if (force === 1.0 && radiusX > 0 && radiusY > 0) {
        pressure = radiusX * radiusY;
      }
      telemetry.trackButtonPressure(pressure);
      if (radiusX > 0 && radiusY > 0) {
        const deformation = Math.abs(radiusX - radiusY) / Math.max(radiusX, radiusY);
        telemetry.recordTouchDeformation(deformation);
      }
    }
  }, [telemetry]);

  const handleNavClick = (targetStep: number, e: React.MouseEvent) => {
    if (locked(targetStep)) {
      e.preventDefault();
      return;
    }
    telemetry.trackNavTouch(steps[targetStep - 1].key, 0, 0, "mouse");
    setStep(targetStep);
  };

  const handleBankListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const top = target.scrollTop;
    const now = performance.now();
    const last = lastScrollRef.current;
    if (last.time > 0) {
      const delta = Math.abs(top - last.top);
      const dt = now - last.time;
      if (dt > 0) {
        telemetry.trackScroll(top, delta / dt);
      }
    }
    lastScrollRef.current = { top, time: now };
  };

  const handleFieldKeyDown = (fieldName: string, e: React.KeyboardEvent) => {
    telemetry.trackKeyDown(fieldName, e.nativeEvent);
  };

  const handleFieldKeyUp = (fieldName: string, e: React.KeyboardEvent) => {
    telemetry.trackKeyUp(fieldName, e.nativeEvent);
  };

  const handleFieldChange = (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    telemetry.trackInputChange(fieldName, e);
  };

  return (
    <section className="min-h-screen px-6 pb-24 pt-32" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onTouchStart={handleTouchStart}>
      <div className="mx-auto max-w-[960px] rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 shadow-2xl backdrop-blur-sm max-md:p-5">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#39e0ff]">AFRID Behavioral Bank</p>
              {telemetry.isNative && (
                <span className="rounded-full bg-[rgba(57,224,255,0.15)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#39e0ff]">Native</span>
              )}
            </div>
            <h1 className="text-[clamp(1.8rem,2.5vw,2.6rem)] font-bold text-white">Banking Simulation</h1>
            <p className="mt-2 max-w-xl text-muted">
              Track keystrokes, corrections, and selection behavior as you authenticate, transfer funds, and choose a Nigerian bank.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm">
            <span className="block text-muted">Session</span>
            <strong className="text-white">{sessionId || "..."}</strong>
          </div>
        </header>

        {/* Visual Stepper */}
        <nav className="mb-8">
          <div className="flex items-center">
            {steps.map((s, idx) => {
              const isLocked = locked(s.id);
              const isActive = s.id === step;
              const isComplete = completedSteps[s.key];
              const isLast = idx === steps.length - 1;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={(e) => handleNavClick(s.id, e)}
                    disabled={isLocked}
                    className="group flex flex-col items-center gap-1.5"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                        isLocked
                          ? "cursor-not-allowed bg-white/5 text-muted opacity-40"
                          : isActive
                            ? "bg-gradient-primary text-[#03040d] shadow-[0_0_20px_rgba(57,224,255,0.3)]"
                            : isComplete
                              ? "bg-[rgba(57, 224, 255,0.15)] text-[#39e0ff] border border-[rgba(57, 224, 255,0.3)]"
                              : "bg-white/[0.06] text-muted hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {isComplete ? "✓" : s.id}
                    </span>
                    <span
                      className={`text-xs font-medium transition-colors ${
                        isActive ? "text-white" : isLocked ? "text-muted/50" : "text-muted group-hover:text-white"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {!isLast && (
                    <div className="mx-2 mb-5 h-0.5 flex-1 rounded-full transition-colors">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isComplete ? "bg-[#39e0ff]" : "bg-white/10"
                        }`}
                        style={{ width: isComplete ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Step 1: Auth */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-[rgba(57, 224, 255,0.12)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#39e0ff]">Secure Access</span>
                <h2 className="mt-3 text-xl font-bold text-white">Login Monitoring</h2>
              </div>
              <span className="rounded-[14px] bg-white/5 px-4 py-2 text-xs font-semibold text-[#d8e1ff]">Live keystroke capture</span>
            </div>

            <form onSubmit={handleLogin} className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-muted">
                Email or username
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="johndoe@example.com"
                  value={loginForm.username}
                  ref={(el) => telemetry.registerInputElement("login-username", el)}
                  onPaste={(e) => telemetry.trackPaste("login-username", e)}
                  onCopy={(e) => telemetry.trackCopy("login-username", e)}
                  onChange={(e) => {
                    setLoginForm((f) => ({ ...f, username: e.target.value }));
                    handleFieldChange("login-username", e);
                  }}
                  onKeyDown={(e) => handleFieldKeyDown("login-username", e)}
                  onKeyUp={(e) => handleFieldKeyUp("login-username", e)}
                  onFocus={() => telemetry.recordFieldFocus("login-username")}
                  onBlur={() => telemetry.recordFieldBlur("login-username")}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[rgba(57,224,255,0.4)]"
                />
              </label>
              <label className="text-sm text-muted">
                Password
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    ref={(el) => telemetry.registerInputElement("login-password", el)}
                    onPaste={(e) => telemetry.trackPaste("login-password", e)}
                  onCopy={(e) => telemetry.trackCopy("login-password", e)}
                    onChange={(e) => {
                      setLoginForm((f) => ({ ...f, password: e.target.value }));
                      handleFieldChange("login-password", e);
                    }}
                    onKeyDown={(e) => handleFieldKeyDown("login-password", e)}
                    onKeyUp={(e) => handleFieldKeyUp("login-password", e)}
                    onFocus={() => telemetry.recordFieldFocus("login-password")}
                    onBlur={() => telemetry.recordFieldBlur("login-password")}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm text-white outline-none transition-colors focus:border-[rgba(57,224,255,0.4)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword((v) => {
                        if (!v) telemetry.recordPasswordUnmask();
                        return !v;
                      });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-primary px-6 py-3 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57, 224, 255,0.18)]"
                >
                  Sign In
                </button>
              </div>
            </form>

            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <strong className="text-white">What we capture</strong>
              <p className="mt-1 text-sm text-muted">Timing between key presses, dwell duration, and corrections made while entering credentials.</p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Transfer */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-[rgba(178, 123, 255,0.12)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#b27bff]">Transfer Engine</span>
                <h2 className="mt-3 text-xl font-bold text-white">Form / error tracking</h2>
              </div>
              <span className="rounded-[14px] bg-[rgba(178, 123, 255,0.12)] px-4 py-2 text-xs font-semibold text-[#b27bff]">Transfer behavior</span>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
              <label className="text-sm text-muted">
                Recipient name
                <input
                  type="text"
                  value={transfer.name}
                  ref={(el) => telemetry.registerInputElement("recipient-name", el)}
                  onPaste={(e) => telemetry.trackPaste("recipient-name", e)}
                  onCopy={(e) => telemetry.trackCopy("recipient-name", e)}
                  onChange={(e) => {
                    setTransfer((t) => ({ ...t, name: e.target.value }));
                    handleFieldChange("recipient-name", e);
                  }}
                  onKeyDown={(e) => handleFieldKeyDown("recipient-name", e)}
                  onKeyUp={(e) => handleFieldKeyUp("recipient-name", e)}
                  onFocus={() => telemetry.recordFieldFocus("recipient-name")}
                  onBlur={() => telemetry.recordFieldBlur("recipient-name")}
                  placeholder="Amina Mensah"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[rgba(57, 224, 255,0.4)]"
                />
              </label>
              <label className="text-sm text-muted">
                Recipient account
                <input
                  type="text"
                  inputMode="numeric"
                  value={transfer.account}
                  ref={(el) => telemetry.registerInputElement("recipient-account", el)}
                  onPaste={(e) => telemetry.trackPaste("recipient-account", e)}
                  onCopy={(e) => telemetry.trackCopy("recipient-account", e)}
                  onChange={(e) => {
                    setTransfer((t) => ({ ...t, account: e.target.value }));
                    handleFieldChange("recipient-account", e);
                  }}
                  onKeyDown={(e) => handleFieldKeyDown("recipient-account", e)}
                  onKeyUp={(e) => handleFieldKeyUp("recipient-account", e)}
                  onFocus={() => telemetry.recordFieldFocus("recipient-account")}
                  onBlur={() => telemetry.recordFieldBlur("recipient-account")}
                  placeholder="0123456789"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[rgba(57, 224, 255,0.4)]"
                />
              </label>
              <label className="text-sm text-muted">
                Transfer amount
                <input
                  type="number"
                  min={1}
                  value={transfer.amount}
                  ref={(el) => telemetry.registerInputElement("transfer-amount", el)}
                  onPaste={(e) => telemetry.trackPaste("transfer-amount", e)}
                  onCopy={(e) => telemetry.trackCopy("transfer-amount", e)}
                  onChange={(e) => {
                    setTransfer((t) => ({ ...t, amount: e.target.value }));
                    handleFieldChange("transfer-amount", e);
                  }}
                  onKeyDown={(e) => handleFieldKeyDown("transfer-amount", e)}
                  onKeyUp={(e) => handleFieldKeyUp("transfer-amount", e)}
                  onFocus={() => telemetry.recordFieldFocus("transfer-amount")}
                  onBlur={() => telemetry.recordFieldBlur("transfer-amount")}
                  placeholder="1000"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[rgba(57, 224, 255,0.4)]"
                />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleTransferReview}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Review transfer details
                </button>
              </div>
            </form>

            {showReview && (
              <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
                <h3 className="font-bold text-white">Review transfer details</h3>
                <p className="text-sm text-muted">Verify recipient, account, and amount before authorizing.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-xs text-muted">Recipient</span>
                    <strong className="block text-white">{transfer.name || "—"}</strong>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-xs text-muted">Account</span>
                    <strong className="block text-white">{transfer.account || "—"}</strong>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-xs text-muted">Amount</span>
                    <strong className="block text-white">{transfer.amount ? `₦${transfer.amount}` : "—"}</strong>
                  </div>
                </div>
                {!confirmed && (
                  <button
                    type="button"
                    onClick={handleConfirmTransfer}
                    className="mt-5 w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57, 224, 255,0.18)]"
                  >
                    Confirm transfer
                  </button>
                )}
              </div>
            )}

            {confirmed && (
              <div className="mt-5">
                <SwipeControl
                  onComplete={handleSwipeComplete}
                  onIncomplete={handleSwipeIncomplete}
                  onSwipeProgress={setSwipeProgress}
                />
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <strong className="text-white">Error signal</strong>
              <p className="mt-1 text-sm text-muted">Tracks delete/correction behavior and form validation failures for each transfer field.</p>
            </div>
          </motion.div>
        )}

        {/* Step 3: Bank Selection */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-[rgba(57, 224, 255,0.12)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#39e0ff]">Destination Bank</span>
                <h2 className="mt-3 text-xl font-bold text-white">Select recipient bank</h2>
              </div>
              <button
                type="button"
                onClick={handleBankReset}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted transition-colors hover:text-white"
              >
                <RefreshCw size={16} /> Reset
              </button>
            </div>

            <form onSubmit={handleBankConfirm} className="grid gap-4">
              <label className="text-sm text-muted">
                Search and select a Nigerian bank
                <input
                  type="text"
                  value={bankQuery}
                  ref={(el) => telemetry.registerInputElement("bank-search-input", el)}
                  onPaste={(e) => telemetry.trackPaste("bank-search-input", e)}
                  onCopy={(e) => telemetry.trackCopy("bank-search-input", e)}
                  onChange={(e) => {
                    handleBankSearch(e.target.value);
                    handleFieldChange("bank-search-input", e);
                  }}
                  onKeyDown={(e) => handleFieldKeyDown("bank-search-input", e)}
                  onKeyUp={(e) => handleFieldKeyUp("bank-search-input", e)}
                  onFocus={() => telemetry.recordFieldFocus("bank-search-input")}
                  onBlur={() => telemetry.recordFieldBlur("bank-search-input")}
                  placeholder="Start typing to filter banks..."
                  autoComplete="off"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[rgba(57, 224, 255,0.4)]"
                />
              </label>
              <div
                onScroll={handleBankListScroll}
                className="max-h-60 min-h-60 overflow-y-auto rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2"
              >
                {filteredBanks.length === 0 ? (
                  <p className="p-4 text-sm text-muted">No banks found.</p>
                ) : (
                  filteredBanks.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => handleBankSelect(bank)}
                      className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedBank === bank
                          ? "bg-gradient-primary font-bold text-[#03040d]"
                          : "text-[#d8e1ff] hover:bg-white/5"
                      }`}
                    >
                      {bank}
                    </button>
                  ))
                )}
              </div>
              {selectedBank && (
                <div className="rounded-xl border border-[rgba(57, 224, 255,0.14)] bg-[rgba(57, 224, 255,0.08)] p-3 text-sm">
                  <span className="text-muted">Selected bank</span>
                  <strong className="ml-2 text-white">{selectedBank}</strong>
                </div>
              )}
              <button
                type="submit"
                disabled={!selectedBank}
                className="rounded-xl bg-gradient-primary px-6 py-3 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57, 224, 255,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm bank selection
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <strong className="text-white">Bank selection</strong>
              <p className="mt-1 text-sm text-muted">Scroll through the list or type to filter Nigerian banks, click one to select it, then confirm to unlock metrics.</p>
            </div>
          </motion.div>
        )}

        {/* Step 4: Telemetry Metrics */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-[rgba(57, 224, 255,0.12)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#39e0ff]">Telemetry</span>
                <h2 className="mt-3 text-xl font-bold text-white">Behavioral metrics</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-[14px] bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted">
                  {telemetry.firestoreEnabled ? "Firestore available" : "Firestore disabled"}
                </span>
                <span className="rounded-[14px] bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted">
                  {telemetry.sensorStatus}
                </span>
              </div>
            </div>

            {/* Summary Score */}
            <div className="mb-6 rounded-2xl border border-[rgba(57, 224, 255, 0.15)] bg-gradient-to-br from-[rgba(57, 224, 255, 0.06)] to-[rgba(178, 123, 255, 0.04)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Behavioral Score</p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    {Math.min(100, Math.round(
                      (telemetry.stats.totalKeystrokes > 0 ? 25 : 0) +
                      (telemetry.stats.totalCorrections > 0 ? 15 : 0) +
                      (telemetry.stats.totalTaps > 0 ? 20 : 0) +
                      (telemetry.stats.scrollVariance > 0 ? 15 : 0) +
                      (completedSteps.auth ? 10 : 0) +
                      (completedSteps.transfer ? 10 : 0) +
                      (completedSteps.bank ? 5 : 0)
                    ))}<span className="text-lg text-muted">/100</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {(() => {
                      const score = Math.min(100, Math.round(
                        (telemetry.stats.totalKeystrokes > 0 ? 25 : 0) +
                        (telemetry.stats.totalCorrections > 0 ? 15 : 0) +
                        (telemetry.stats.totalTaps > 0 ? 20 : 0) +
                        (telemetry.stats.scrollVariance > 0 ? 15 : 0) +
                        (completedSteps.auth ? 10 : 0) +
                        (completedSteps.transfer ? 10 : 0) +
                        (completedSteps.bank ? 5 : 0)
                      ));
                      if (score >= 80) return "High human likeness — strong behavioral signals detected";
                      if (score >= 50) return "Moderate signals — some behavioral patterns detected";
                      if (score >= 25) return "Low signals — complete more steps for better analysis";
                      return "Start the simulation to collect behavioral data";
                    })()}
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/10">
                  <span className="text-lg font-bold text-[#39e0ff]">
                    {Math.min(100, Math.round(
                      (telemetry.stats.totalKeystrokes > 0 ? 25 : 0) +
                      (telemetry.stats.totalCorrections > 0 ? 15 : 0) +
                      (telemetry.stats.totalTaps > 0 ? 20 : 0) +
                      (telemetry.stats.scrollVariance > 0 ? 15 : 0) +
                      (completedSteps.auth ? 10 : 0) +
                      (completedSteps.transfer ? 10 : 0) +
                      (completedSteps.bank ? 5 : 0)
                    ))}%
                  </span>
                </div>
              </div>
            </div>

            {/* Collapsible Metric Groups */}
            {metricGroups.map((group) => (
              <div key={group.key} className="mb-4">
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="mb-3 flex w-full items-center gap-2 text-left"
                >
                  <ChevronDown
                    size={16}
                    className="transition-transform"
                    style={{ transform: openGroups[group.key] ? "rotate(0deg)" : "rotate(-90deg)", color: group.color }}
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: group.color }}>
                    {group.title} ({group.cards.length})
                  </p>
                </button>
                {openGroups[group.key] && (
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {group.cards.map((m) => (
                      <div key={m.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                        <span className="block text-xs text-muted">{m.label}</span>
                        <strong className="text-lg text-white">{m.value}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <p className="text-sm leading-relaxed text-muted">
                This panel explains user behavior in simple terms: typing speed, how often they fix text, whether they had trouble logging in, how many transfers were reviewed and approved, how often swipe confirmation was abandoned, and whether the app detected movement or leaving the screen.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Download size={16} /> Download telemetry
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57, 224, 255,0.18)] disabled:opacity-60"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : submitResult === "success" ? (
                  <><CheckCircle size={16} /> Completed</>
                ) : (
                  "Complete Task"
                )}
              </button>
            </div>

            {submitResult === "error" && (
              <p className="mt-3 text-sm text-[#ff8e8e]">Failed to send to Firestore. Please try again.</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Flash notice */}
      {flash.visible && (
        <div className="fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-[rgba(9,15,29,0.96)] px-6 py-3.5 text-sm text-white shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
          {flash.msg}
        </div>
      )}
    </section>
  );
}
