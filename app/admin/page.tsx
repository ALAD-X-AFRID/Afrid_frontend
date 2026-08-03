"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bot, Zap, Gauge, Loader2, CheckCircle } from "lucide-react";
import { useBankingTelemetry } from "@/hooks/use-banking-telemetry";
import { EXPORT_HEADERS } from "@/lib/banking-constants";
import { saveBotTelemetry } from "@/lib/firestore";
import { useMetadata } from "@/context/metadata-context";
import { RoleRoute } from "@/components/auth/protected-route";

type BotType = "baseline" | "smart" | "highspeed";

export default function AdminPage() {
  const { user } = useMetadata();
  const [sessionId] = useState("ADMIN-" + Date.now());
  const [running, setRunning] = useState<BotType | null>(null);
  const [result, setResult] = useState<"none" | "success" | "error">("none");
  const telemetry = useBankingTelemetry(sessionId, user?.uid, user?.email || "", user?.displayName || "", user?.displayName || "");

  const generateBotMetrics = useCallback((botType: BotType) => {
    const baseDelay = botType === "highspeed" ? 30 : botType === "smart" ? 120 : 250;
    const jitter = botType === "smart" ? 20 : botType === "highspeed" ? 5 : 80;
    const keystrokes = botType === "highspeed" ? 45 : botType === "smart" ? 68 : 92;
    const corrections = botType === "smart" ? 3 : botType === "highspeed" ? 0 : 8;

    const dwell = baseDelay + Math.random() * jitter;
    const flight = baseDelay * 1.5 + Math.random() * jitter;

    return {
      totalKeystrokes: keystrokes,
      totalCorrections: corrections,
      totalLoginAttempts: 1,
      totalLoginErrors: botType === "baseline" ? 1 : 0,
      totalTransfers: 1,
      totalReviewChecks: 1,
      incompleteSwipes: botType === "baseline" ? 1 : 0,
      completedSwipes: 1,
      totalNavTouches: 4,
      totalMotionEvents: botType === "highspeed" ? 2 : 12,
      totalOrientationEvents: botType === "highspeed" ? 1 : 8,
      totalVisibilityChanges: 0,
      totalSensorEvents: botType === "highspeed" ? 3 : 20,
      averageDwell: Number(dwell.toFixed(2)),
      averageFlight: Number(flight.toFixed(2)),
      scrollVariance: botType === "smart" ? 0.00012 : botType === "highspeed" ? 0.00001 : 0.00345,
      averageSwipeCurve: botType === "smart" ? 1.02 : botType === "highspeed" ? 1.0 : 1.35,
      correlatedTaps: botType === "highspeed" ? 0 : 3,
      totalTaps: 8,
      touchDeformations: botType === "highspeed" ? 0 : 2,
      multiTouchAnomalies: 0,
      totalPasteEvents: botType === "highspeed" ? 5 : 0,
      totalPastedCharacters: botType === "highspeed" ? 15 : 0,
      totalAutofillEvents: botType === "highspeed" ? 3 : 0,
      totalAutofilledCharacters: botType === "highspeed" ? 30 : 0,
      totalCutEvents: botType === "baseline" ? 1 : 0,
      averageButtonPressure: botType === "highspeed" ? 0.1 : botType === "smart" ? 0.45 : 0.62,
      neuromuscularEntropy: botType === "highspeed" ? 0.01 : botType === "smart" ? 0.34 : 1.12,
      distributionJitter: botType === "highspeed" ? 5 : botType === "smart" ? 45 : 180,
      backspaceBursts: botType === "smart" ? 1 : 0,
      singleBackspaces: botType === "baseline" ? 5 : botType === "smart" ? 2 : 0,
      digraphCount: botType === "highspeed" ? 20 : botType === "smart" ? 45 : 65,
      digraphTimingVariance: botType === "highspeed" ? 5 : botType === "smart" ? 50 : 200,
      digraphTimingMean: Number(flight.toFixed(2)),
      averageTouchHold: botType === "highspeed" ? 30 : botType === "smart" ? 80 : 150,
      touchHoldVariance: botType === "highspeed" ? 2 : botType === "smart" ? 15 : 60,
      averageTouchPrecision: botType === "highspeed" ? 1 : botType === "smart" ? 5 : 15,
      touchPrecisionVariance: botType === "highspeed" ? 0.5 : botType === "smart" ? 3 : 12,
      averageFieldDwell: botType === "highspeed" ? 500 : botType === "smart" ? 2000 : 5000,
      totalFieldFocusTime: botType === "highspeed" ? 2000 : botType === "smart" ? 8000 : 20000,
      totalFieldRevisits: botType === "baseline" ? 2 : 0,
      passwordUnmaskCount: botType === "baseline" ? 1 : 0,
    };
  }, []);

  const runBot = useCallback(
    async (botType: BotType) => {
      setRunning(botType);
      setResult("none");

      const botMetrics = generateBotMetrics(botType);

      // Build export row with bot metrics — must match EXPORT_HEADERS order (60 columns)
      const now = new Date().toISOString();
      const sessionDuration = botType === "highspeed" ? 8000 : botType === "smart" ? 22000 : 45000;
      const row: (string | number)[] = [
        `${sessionId}-${botType}`,
        Math.floor(Math.random() * 200) + 50,
        botType === "highspeed" ? 8.5 : botType === "smart" ? 22.3 : 45.7,
        botType === "highspeed" ? 0.12 : botType === "smart" ? 0.35 : 0.82,
        botMetrics.totalKeystrokes,
        botMetrics.totalCorrections,
        botMetrics.totalLoginAttempts,
        botMetrics.totalLoginErrors,
        botMetrics.totalReviewChecks,
        botMetrics.totalTransfers,
        botMetrics.incompleteSwipes,
        botMetrics.completedSwipes,
        botMetrics.averageSwipeCurve,
        botMetrics.totalNavTouches,
        botMetrics.totalMotionEvents,
        botMetrics.totalOrientationEvents,
        Number(botMetrics.averageButtonPressure.toFixed(4)),
        Number(botMetrics.neuromuscularEntropy.toFixed(4)),
        Number(botMetrics.distributionJitter.toFixed(4)),
        botMetrics.totalVisibilityChanges,
        Number(botMetrics.averageDwell.toFixed(2)),
        Number(botMetrics.averageFlight.toFixed(2)),
        Number(botMetrics.scrollVariance.toFixed(5)),
        botMetrics.totalTaps > 0
          ? Number((botMetrics.correlatedTaps / botMetrics.totalTaps).toFixed(4))
          : 0,
        botMetrics.touchDeformations,
        botMetrics.totalTaps > 0
          ? Number((botMetrics.touchDeformations / botMetrics.totalTaps).toFixed(4))
          : 0,
        botMetrics.multiTouchAnomalies,
        botMetrics.totalPasteEvents,
        botMetrics.totalPastedCharacters,
        botMetrics.totalAutofillEvents,
        botMetrics.totalAutofilledCharacters,
        botMetrics.totalCutEvents,
        "", // GPS lat
        "", // GPS lng
        "", // GPS accuracy
        "", // Battery level
        "", // Battery charging
        "", // Screen brightness
        "Bot Simulator", // Device model
        botType, // OS version
        "web", // Platform
        "unknown", // Network type
        now, // Session started at
        now, // Session ended at
        sessionDuration, // Session duration (ms)
        Number(botMetrics.averageTouchHold.toFixed(2)),
        Number(botMetrics.touchHoldVariance.toFixed(2)),
        Number(botMetrics.averageTouchPrecision.toFixed(2)),
        Number(botMetrics.touchPrecisionVariance.toFixed(2)),
        Number(botMetrics.averageFieldDwell.toFixed(2)),
        Number(botMetrics.totalFieldFocusTime.toFixed(2)),
        botMetrics.totalFieldRevisits,
        botMetrics.passwordUnmaskCount,
        botMetrics.backspaceBursts,
        botMetrics.singleBackspaces,
        (botMetrics.backspaceBursts + botMetrics.singleBackspaces) > 0
          ? Number((botMetrics.backspaceBursts / (botMetrics.backspaceBursts + botMetrics.singleBackspaces)).toFixed(4))
          : 0,
        botMetrics.digraphCount,
        Number(botMetrics.digraphTimingVariance.toFixed(4)),
        Number(botMetrics.digraphTimingMean.toFixed(2)),
        0, // is_human = 0 for bots
      ];

      const success = await saveBotTelemetry({
        sessionId,
        botType,
        headers: EXPORT_HEADERS,
        row,
      });

      if (success) {
        setResult("success");
      } else {
        setResult("error");
      }
      setRunning(null);
    },
    [sessionId, generateBotMetrics]
  );

  const bots = [
    {
      type: "baseline" as BotType,
      label: "Run Baseline Bot",
      icon: Bot,
      description: "Human-like typing with corrections, average speed, some errors",
      color: "#39e0ff",
    },
    {
      type: "smart" as BotType,
      label: "Run Smart Bot",
      icon: Zap,
      description: "Optimized behavior with minimal corrections, fast but realistic",
      color: "#b27bff",
    },
    {
      type: "highspeed" as BotType,
      label: "Run High-Speed Bot",
      icon: Gauge,
      description: "Machine-speed execution with paste events and no corrections",
      color: "#ff6b6b",
    },
  ];

  return (
    <RoleRoute roles={["admin"]}>
    <section className="mx-auto max-w-[960px] px-6 pb-24 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 max-md:p-6"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#ff6b6b]">ADMIN_PANEL</span>
        </div>
        <h1 className="text-[clamp(1.8rem,2.5vw,2.4rem)] font-bold text-white">Bot Controls</h1>
        <p className="mt-2 text-muted">
          Run automated bots against the banking simulation to generate telemetry data for analysis. Each bot produces different behavioral patterns.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {bots.map((bot) => {
            const isRunning = running === bot.type;
            return (
              <div
                key={bot.type}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-[16px]"
                  style={{
                    background: `${bot.color}12`,
                    color: bot.color,
                  }}
                >
                  <bot.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">{bot.label}</h3>
                <p className="mt-2 text-sm text-muted">{bot.description}</p>
                <button
                  onClick={() => runBot(bot.type)}
                  disabled={isRunning}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:opacity-60"
                  style={{
                    background: `${bot.color}15`,
                    color: bot.color,
                    border: `1px solid ${bot.color}25`,
                  }}
                >
                  {isRunning ? (
                    <><Loader2 size={16} className="animate-spin" /> Running...</>
                  ) : (
                    <>Run Bot</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {result === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-[rgba(57, 224, 255,0.2)] bg-[rgba(57, 224, 255,0.08)] p-4"
          >
            <CheckCircle size={20} className="text-[#39e0ff]" />
            <p className="text-sm text-[#39e0ff]">Bot telemetry saved to Firestore successfully.</p>
          </motion.div>
        )}

        {result === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-[rgba(255, 107, 107,0.2)] bg-[rgba(255, 107, 107,0.08)] p-4"
          >
            <p className="text-sm text-[#ff6b6b]">Failed to save bot telemetry to Firestore.</p>
          </motion.div>
        )}

        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h3 className="font-bold text-white">Session Info</h3>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Session ID</span>
              <span className="font-mono text-white">{sessionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Firestore Status</span>
              <span className={telemetry.firestoreEnabled ? "text-[#39e0ff]" : "text-muted"}>
                {telemetry.firestoreEnabled ? "Available" : "Disabled"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
    </RoleRoute>
  );
}
