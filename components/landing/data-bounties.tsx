"use client";

import { motion } from "framer-motion";
import { Mic, MapPin, Pen, ArrowRight, Clock } from "lucide-react";

type Bounty = {
  id: string;
  title: string;
  category: string;
  payout: string;
  currency: string;
  progress: number;
  coverage: string;
  coverageValue: number;
  deadline: string;
  icon: typeof Mic;
  color: string;
};

const BOUNTIES: Bounty[] = [
  {
    id: "SWA-001",
    title: "Swahili Speech Synthesis",
    category: "VOICE HARVEST",
    payout: "5,000",
    currency: "NGN",
    progress: 72,
    coverage: "Swahili Acoustic Coverage",
    coverageValue: 84.2,
    deadline: "48:22:15",
    icon: Mic,
    color: "#39e0ff",
  },
  {
    id: "LOS-002",
    title: "Lagos Urban Traffic Vision",
    category: "MOBILITY DATA",
    payout: "3,200",
    currency: "NGN",
    progress: 45,
    coverage: "Route Index Completion",
    coverageValue: 61.5,
    deadline: "12:08:44",
    icon: MapPin,
    color: "#b27bff",
  },
  {
    id: "YOR-003",
    title: "Yoruba Handwritten OCR",
    category: "SCRIPT CAPTURE",
    payout: "2,500",
    currency: "NGN",
    progress: 88,
    coverage: "Yoruba Script Coverage",
    coverageValue: 92.1,
    deadline: "06:14:30",
    icon: Pen,
    color: "#ff6b6b",
  },
];

export default function DataBounties() {
  return (
    <section id="bounties" className="mx-auto max-w-5xl px-6 sm:px-8 py-20 sm:py-28">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#ff6b6b]">ACTIVE_DATA_BOUNTIES</span>
        </div>
        <h2 className="text-[clamp(1.6rem,3.5vw,2.6rem)] font-bold text-white font-display tracking-tight leading-tight">
          Tactical Bounties Terminal
        </h2>
        <p className="mt-3 max-w-lg text-sm text-[#39e0ff] leading-relaxed">
          High-stakes intelligence tasks with live timers, coverage meters, and instant liquid payouts.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {BOUNTIES.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="tactical-card reticle group p-5"
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#39e0ff]/60">{b.id}</span>
                <h3 className="mt-1 text-base font-bold text-white leading-tight">{b.title}</h3>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-[4px] border" style={{ borderColor: `${b.color}20`, background: `${b.color}08`, color: b.color }}>
                <b.icon size={16} />
              </div>
            </div>

            {/* Category badge */}
            <span className="inline-block rounded-[2px] px-2 py-1 font-mono text-[8px] font-medium uppercase tracking-[0.12em] mb-4" style={{ background: `${b.color}0a`, color: b.color, border: `1px solid ${b.color}15` }}>
              {b.category}
            </span>

            {/* Coverage meter */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#39e0ff]">{b.coverage}</span>
                <span className="font-mono text-[10px] font-bold tabular-nums" style={{ color: b.color }}>{b.coverageValue}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${b.coverageValue}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{ background: b.color, boxShadow: `0 0 8px ${b.color}80` }}
                />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#39e0ff]/60">SUBMISSION_PROGRESS</span>
                <span className="font-mono text-[10px] font-bold tabular-nums text-white/80">{b.progress}%</span>
              </div>
              <div className="h-0.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${b.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-white/30"
                />
              </div>
            </div>

            {/* Footer: payout + deadline */}
            <div className="flex items-center justify-between border-t border-white/[0.04] pt-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#39e0ff]/60">PAYOUT</span>
                <p className="font-mono text-sm font-bold tabular-nums" style={{ color: b.color }}>
                  {b.currency} {b.payout}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#39e0ff]/60 flex items-center gap-1 justify-end">
                  <Clock size={9} /> DEADLINE
                </span>
                <p className="font-mono text-sm font-bold tabular-nums text-white/80">{b.deadline}</p>
              </div>
            </div>

            {/* Submit trigger */}
            <button className="mt-4 w-full rounded-[4px] border border-white/[0.06] bg-white/[0.02] py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#39e0ff] transition-all hover:border-[#39e0ff]/20 hover:bg-[#39e0ff]/[0.04] hover:text-[#39e0ff] flex items-center justify-center gap-2 group/btn">
              Submit Bounty
              <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
