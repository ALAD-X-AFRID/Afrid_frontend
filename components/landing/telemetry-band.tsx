"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

type Metric = {
  key: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  format?: "k" | "comma";
  color: string;
};

const METRICS: Metric[] = [
  { key: "hours", label: "TOTAL_HOURS_HARVESTED", value: 8420, suffix: "h", color: "#39e0ff" },
  { key: "nodes", label: "ACTIVE_NODES", value: 127, color: "#b27bff" },
  { key: "capital", label: "CAPITAL_DISBURSED_USD", value: 15840, prefix: "$", format: "comma", color: "#ff6b6b" },
  { key: "languages", label: "LANGUAGES_INDEXED", value: 63, color: "#39e0ff" },
];

function LiveCounter({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(Math.floor(metric.value * eased));
      if (t < 1) requestAnimationFrame(tick);
      else setDisplay(metric.value);
    };
    tick();
  }, [inView, metric.value]);

  let str = display.toLocaleString();
  if (metric.format === "k" && display >= 1000) str = `${(display / 1000).toFixed(1)}K`;

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
      className="font-mono tabular-nums text-xl sm:text-2xl font-bold"
      style={{ color: metric.color, textShadow: `0 0 16px ${metric.color}30` }}
    >
      {metric.prefix}{str}{metric.suffix}
    </motion.span>
  );
}

export default function TelemetryBand() {
  return (
    <section className="relative w-full border-y border-white/[0.06] bg-[#05070f] py-8">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39e0ff] animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#39e0ff]/80">LIVE_TELEMETRY_FEED</span>
          <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="relative"
            >
              <LiveCounter metric={m} />
              <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#39e0ff]/70">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
