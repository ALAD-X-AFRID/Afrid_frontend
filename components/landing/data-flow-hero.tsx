"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AfricaMap from "./africa-map";
import { useIsMobile } from "@/hooks/use-is-mobile";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function DataFlowHero() {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, -30]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative w-full overflow-x-hidden bg-[#03040d] text-white antialiased selection:bg-[#39e0ff] selection:text-[#03040d]"
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(57, 224, 255, 0.08), transparent 35%), radial-gradient(circle at 20% 10%, rgba(178, 123, 255, 0.08), transparent 30%), radial-gradient(circle at 70% 60%, rgba(178, 123, 255, 0.03), transparent 45%), radial-gradient(circle at 50% 80%, rgba(0, 0, 0, 0.4), transparent 60%)",
        }}
      />

      {/* Hero grid: copy left, visual right */}
      <motion.div
        style={{ opacity, y, willChange: "transform, opacity" }}
        className="relative z-10 mx-auto max-w-[1120px] px-6 sm:px-8 pt-24 sm:pt-28 pb-16"
      >
        <div className="grid items-center gap-6 md:grid-cols-[1.05fr_1fr]">
          {/* === HERO COPY === */}
          <div className="w-full max-w-[620px]">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="inline-flex items-center gap-2.5 rounded-full bg-[rgba(57,224,255,0.12)] px-4 py-2 mb-5 border border-[rgba(57,224,255,0.2)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39e0ff] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39e0ff]" />
              </span>
              <span className="text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[#39e0ff]">AFRID</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className="font-sans text-[clamp(1.6rem,2.8vw,2.6rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-white"
            >
              Don&apos;t just live it, log it. <br />
              Earn by sharing your unique African perspective.
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              className="mt-4 text-[0.92rem] leading-[1.65] text-[#98a2c5] max-w-[500px]"
            >
              Join the movement to make Africa a data-owning participant in the AI economy. Through AFRID, you earn by sharing your unique perspective, turning everyday actions into high-value infrastructure.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <a
                href="#waitlist"
                className="group/btn relative inline-flex items-center justify-center min-h-[48px] rounded-full px-7 font-bold text-[0.9rem] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_24px_60px_rgba(57,224,255,0.3)]"
                style={{
                  background: "linear-gradient(135deg, #39e0ff, #b27bff)",
                  color: "#070a18",
                  boxShadow: "0 18px 50px rgba(57, 224, 255, 0.18)",
                }}
              >
                <span className="relative z-10">Join Waitlist</span>
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#b27bff] to-[#39e0ff] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" style={{ mixBlendMode: "overlay" }} />
              </a>
              <a
                href="https://discord.gg/QfDNSdvYw"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[48px] rounded-full px-7 font-bold text-[0.9rem] text-white transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.1] hover:border-white/20"
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                Join Discord
              </a>
            </motion.div>
          </div>

          {/* === HERO VISUAL === */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isMobile ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={
              isMobile
                ? { opacity: { duration: 1, delay: 0.3, ease: EASE }, scale: { duration: 1, delay: 0.3, ease: EASE } }
                : { opacity: { duration: 1, delay: 0.3, ease: EASE }, scale: { duration: 1, delay: 0.3, ease: EASE }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }
            }
            className="relative grid place-items-center [perspective:1100px]"
          >
            {/* Glowing border wrapper */}
            <div
              className="group relative w-full max-w-[480px] aspect-[1/1] rounded-[40px] transition-all duration-500 hover:scale-[1.02] hover:rotate-[0.5deg]"
              style={{
                background: "linear-gradient(135deg, rgba(57, 224, 255, 0.5), rgba(178, 123, 255, 0.3) 50%, rgba(57, 224, 255, 0.4))",
                padding: "1.5px",
                boxShadow:
                  "0 30px 120px rgba(0, 0, 0, 0.35), 0 0 80px rgba(57, 224, 255, 0.3), 0 0 160px rgba(178, 123, 255, 0.2), 0 0 20px rgba(57, 224, 255, 0.15)",
              }}
            >
            <div
              className="relative w-full h-full overflow-hidden rounded-[38.5px] transition-all duration-500 group-hover:shadow-[0_40px_140px_rgba(0,0,0,0.4),0_0_100px_rgba(57,224,255,0.35),0_0_200px_rgba(178,123,255,0.25)]"
              style={{
                background: "radial-gradient(circle, rgba(57, 224, 255, 0.14), transparent 36%)",
                boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.06)",
              }}
            >
              {/* Inner glow */}
              <div
                className="absolute inset-[12%] rounded-[36px] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.08), transparent 40%)",
                  opacity: 0.8,
                }}
              />

              {/* Glow ring */}
              <div
                className="absolute inset-[12%] rounded-full pointer-events-none"
                style={{ border: "1px solid rgba(57, 224, 255, 0.07)", filter: "blur(1px)" }}
              />

              {/* Globe background — rounded to match frame */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[40px]"
                style={{
                  background:
                    "radial-gradient(circle at 40% 40%, rgba(57, 224, 255, 0.22), transparent 35%), radial-gradient(circle at 60% 60%, rgba(178, 123, 255, 0.18), transparent 30%), linear-gradient(180deg, rgba(11, 18, 35, 0.95), rgba(15, 23, 47, 0.95))",
                  opacity: 0.95,
                }}
              />

              {/* Top sheen — glass-like highlight at top of frame */}
              <div
                className="absolute inset-x-0 top-0 h-[35%] pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent)",
                  borderRadius: "40px 40px 0 0",
                }}
              />

              {/* Edge glow — animated shimmer along border */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[38.5px] overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(57, 224, 255, 0.15), transparent 30%, transparent 70%, rgba(178, 123, 255, 0.12))",
                  mixBlendMode: "screen",
                }}
              />
              {/* Inner edge highlight — top-left light catch */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[38.5px]"
                style={{
                  boxShadow: "inset 0 0 20px rgba(57, 224, 255, 0.08), inset 0 0 40px rgba(178, 123, 255, 0.05)",
                }}
              />

              {/* Africa map */}
              <div className="absolute inset-0 grid place-items-center p-6">
                <div className="relative w-full h-full grid place-items-center">
                  <div
                    className="relative w-[88%] max-w-[360px] rounded-[28px] p-4"
                    style={{
                      background: "rgba(2, 7, 18, 0.72)",
                      boxShadow: "0 30px 90px rgba(0, 0, 0, 0.4), 0 0 30px rgba(57, 224, 255, 0.18), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <AfricaMap showDataPoints={true} showLabel={false} />
                  </div>
                </div>
              </div>

              {/* SVG flow overlay */}
              <svg
                viewBox="0 0 480 480"
                className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="dataFlowGrad" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#39E0FF" />
                    <stop offset="100%" stopColor="#B27BFF" />
                  </linearGradient>
                  <style>{`
                    @keyframes pulse-glow {
                      0%, 100% { opacity: 0.3; transform: scale(1); }
                      50% { opacity: 1; transform: scale(1.1); }
                    }
                    @keyframes flow-line {
                      0% { stroke-dashoffset: 300; }
                      100% { stroke-dashoffset: 0; }
                    }
                    .pulse { animation: pulse-glow 2.5s ease-in-out infinite; transform-origin: center; }
                    .flow { stroke-dasharray: 280; animation: flow-line 4s linear infinite; }
                  `}</style>
                </defs>
                <path d="M 230 230 Q 215 190 200 150" stroke="url(#dataFlowGrad)" strokeWidth="2.5" fill="none" className="flow" opacity="0.9" />
                <path d="M 235 230 Q 260 180 300 160" stroke="url(#dataFlowGrad)" strokeWidth="2.5" fill="none" className="flow" opacity="0.9" />
                <path d="M 225 240 Q 160 240 90 210" stroke="url(#dataFlowGrad)" strokeWidth="2.5" fill="none" className="flow" opacity="0.9" />
                <path d="M 245 250 Q 325 260 390 240" stroke="url(#dataFlowGrad)" strokeWidth="2.5" fill="none" className="flow" opacity="0.9" />
                <circle cx="237" cy="225" r="8" fill="url(#dataFlowGrad)" className="pulse" opacity="0.95" />
                <circle cx="200" cy="150" r="4" fill="#39E0FF" opacity="0.6" />
                <circle cx="300" cy="160" r="4" fill="#B27BFF" opacity="0.6" />
                <circle cx="90" cy="210" r="4" fill="#39E0FF" opacity="0.6" />
                <circle cx="390" cy="240" r="4" fill="#B27BFF" opacity="0.6" />
              </svg>

            </div>
            </div>

            {/* Caption under card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
              className="mt-5 flex items-center justify-center gap-3"
            >
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#39e0ff]/60" />
              <p className="text-sm font-medium tracking-wide text-[#39e0ff]/90">
                Africa feeding the world&apos;s data economy
              </p>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#b27bff]/60" />
            </motion.div>

            {/* Live stats strip */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1, ease: EASE }}
              className="mt-4 flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-2.5 backdrop-blur-sm"
            >
              {[
                { label: "Contributors", value: "2,400+", color: "#39e0ff" },
                { label: "Languages", value: "180+", color: "#b27bff" },
                { label: "Countries", value: "54", color: "#ff6b6b" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-4">
                  {i > 0 && <span className="h-8 w-px bg-white/[0.08]" />}
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
