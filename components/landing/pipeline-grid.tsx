"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mic, ShieldCheck, Cpu, Wallet, ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Capture",
    desc: "Africans contribute voice, text, and mobility data through everyday actions.",
    icon: Mic,
    color: "#39e0ff",
    tag: "RAW_INPUT",
  },
  {
    num: "02",
    title: "Verification Mesh",
    desc: "Peer-review consensus validates quality through 3+ validator checks.",
    icon: ShieldCheck,
    color: "#b27bff",
    tag: "QUALITY_GATE",
  },
  {
    num: "03",
    title: "Tensor Structuring",
    desc: "Raw data becomes production-grade AI training infrastructure.",
    icon: Cpu,
    color: "#ff6b6b",
    tag: "REFINERY_CORE",
  },
  {
    num: "04",
    title: "Sovereign Payout",
    desc: "Contributors receive instant liquid payouts. Africa profits from its own intelligence.",
    icon: Wallet,
    color: "#39e0ff",
    tag: "VALUE_YIELD",
  },
];

export default function PipelineGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="refinery" className="mx-auto max-w-3xl px-6 sm:px-8 py-20 sm:py-28">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="mb-12 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39e0ff] animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#39e0ff]">REFINERY_PIPELINE</span>
        </div>
        <h2 className="text-[clamp(1.6rem,3.5vw,2.6rem)] font-bold text-white font-display tracking-tight leading-tight">
          From raw data to sovereign yield.
        </h2>
      </motion.div>

      <div ref={ref} className="relative pl-8 sm:pl-12">
        {/* Static track */}
        <div className="absolute left-3 sm:left-5 top-0 bottom-0 w-px bg-white/[0.06]" />
        {/* Animated progress line */}
        <motion.div style={{ height: lineHeight }} className="absolute left-3 sm:left-5 top-0 w-px bg-gradient-to-b from-[#39e0ff] via-[#b27bff] to-[#ff6b6b]" />

        <div className="space-y-10">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Node */}
              <div className="absolute -left-8 sm:-left-12 top-1 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 + 0.2, type: "spring" }}
                  className="w-7 h-7 rounded-[4px] border flex items-center justify-center"
                  style={{ borderColor: step.color, background: "#03040d", boxShadow: `0 0 12px ${step.color}40` }}
                >
                  <step.icon size={13} style={{ color: step.color }} />
                </motion.div>
              </div>

              {/* Card */}
              <div className="tactical-card p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold tabular-nums" style={{ color: step.color }}>{step.num}</span>
                  <span className="h-3 w-px bg-white/10" />
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  <span className="ml-auto font-mono text-[8px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-[2px]" style={{ background: `${step.color}0a`, color: step.color, border: `1px solid ${step.color}15` }}>
                    {step.tag}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#39e0ff]/70">{step.desc}</p>
              </div>

              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight size={14} className="text-white/15 rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
