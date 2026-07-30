"use client";

import { motion } from "framer-motion";

const STORY_PHASE = {
  hexagon: { duration: 1.2, delay: 0 },
  innerFill: { duration: 0.6, delay: 0.8 },
  crosshair: { duration: 0.5, delay: 1.2 },
  corners: { duration: 0.3, delay: 1.5 },
  core: { duration: 0.5, delay: 1.8 },
  ring: { duration: 0.5, delay: 2.0 },
  pulse: { duration: 0.8, delay: 2.2 },
  wordmark: { duration: 0.8, delay: 2.5 },
};

export default function HeroLogoAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center mb-2"
    >
      <div className="relative">
        {/* Ambient glow behind logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: STORY_PHASE.core.delay, duration: 1 }}
          className="absolute inset-0 blur-2xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(57, 224, 255,0.15), transparent 60%)",
          }}
        />

        <svg
          viewBox="0 0 120 120"
          className="relative w-28 h-28 sm:w-32 sm:h-32 overflow-visible"
        >
          <defs>
            <linearGradient id="heroLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#39e0ff" />
              <stop offset="100%" stopColor="#070a18" />
            </linearGradient>
            <linearGradient id="heroLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b27bff" />
              <stop offset="100%" stopColor="#ff6b6b" />
            </linearGradient>
            <filter id="heroLogoBlur">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="heroLogoGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Phase 1: Hexagonal sovereign node draws in */}
          <motion.path
            d="M60,12 L100,35 L100,85 L60,108 L20,85 L20,35 Z"
            fill="none"
            stroke="url(#heroLogoGrad)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            filter="url(#heroLogoBlur)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: STORY_PHASE.hexagon.duration,
              delay: STORY_PHASE.hexagon.delay,
              ease: "easeInOut",
            }}
          />

          {/* Phase 2: Inner hexagon fills in */}
          <motion.path
            d="M60,24 L88,40 L88,80 L60,96 L32,80 L32,40 Z"
            fill="#39e0ff"
            fillOpacity="0"
            stroke="#39e0ff"
            strokeWidth="0.6"
            strokeOpacity="0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              fillOpacity: 0.05,
              strokeOpacity: 0.3,
            }}
            transition={{
              duration: STORY_PHASE.innerFill.duration,
              delay: STORY_PHASE.innerFill.delay,
              ease: "easeOut",
            }}
          />

          {/* Phase 3: Crosshair reticle draws in */}
          <motion.line
            x1="60" y1="30" x2="60" y2="90"
            stroke="#39e0ff"
            strokeWidth="0.5"
            strokeOpacity="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: STORY_PHASE.crosshair.duration,
              delay: STORY_PHASE.crosshair.delay,
              ease: "easeOut",
            }}
          />
          <motion.line
            x1="30" y1="60" x2="90" y2="60"
            stroke="#39e0ff"
            strokeWidth="0.5"
            strokeOpacity="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: STORY_PHASE.crosshair.duration,
              delay: STORY_PHASE.crosshair.delay + 0.1,
              ease: "easeOut",
            }}
          />

          {/* Phase 4: Corner accents pop in sequentially */}
          {[
            { x: 20, y: 35, d: 0 },
            { x: 100, y: 35, d: 0.08 },
            { x: 20, y: 85, d: 0.16 },
            { x: 100, y: 85, d: 0.24 },
          ].map((pt, i) => (
            <motion.circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="1.5"
              fill="#39e0ff"
              fillOpacity="0.7"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.7] }}
              transition={{
                duration: STORY_PHASE.corners.duration,
                delay: STORY_PHASE.corners.delay + pt.d,
                ease: "backOut",
              }}
            />
          ))}

          {/* Phase 5: Central core bursts to life */}
          <motion.circle
            cx="60"
            cy="60"
            r="0"
            fill="#39e0ff"
            filter="url(#heroLogoGlow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.8, 1],
              opacity: [0, 1, 0.9],
            }}
            transition={{
              duration: STORY_PHASE.core.duration,
              delay: STORY_PHASE.core.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
          {/* Core inner dot */}
          <motion.circle
            cx="60"
            cy="60"
            r="2.5"
            fill="#FFFFFF"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.3,
              delay: STORY_PHASE.core.delay + 0.2,
              ease: "backOut",
            }}
          />

          {/* Phase 6: Orbital data ring activates */}
          <motion.circle
            cx="60"
            cy="60"
            r="18"
            fill="none"
            stroke="url(#heroLogoGold)"
            strokeWidth="0.6"
            strokeOpacity="0"
            strokeDasharray="4 3"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{
              opacity: 1,
              strokeOpacity: 0.5,
              rotate: 360,
            }}
            transition={{
              opacity: { duration: 0.4, delay: STORY_PHASE.ring.delay },
              strokeOpacity: { duration: 0.4, delay: STORY_PHASE.ring.delay },
              rotate: {
                duration: 12,
                repeat: Infinity,
                ease: "linear",
                delay: STORY_PHASE.ring.delay,
              },
            }}
            style={{ transformOrigin: "60px 60px" }}
          />

          {/* Second orbital ring — opposite direction */}
          <motion.circle
            cx="60"
            cy="60"
            r="26"
            fill="none"
            stroke="#39e0ff"
            strokeWidth="0.4"
            strokeOpacity="0"
            strokeDasharray="2 4"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{
              opacity: 1,
              strokeOpacity: 0.25,
              rotate: -360,
            }}
            transition={{
              opacity: { duration: 0.4, delay: STORY_PHASE.ring.delay + 0.15 },
              strokeOpacity: { duration: 0.4, delay: STORY_PHASE.ring.delay + 0.15 },
              rotate: {
                duration: 18,
                repeat: Infinity,
                ease: "linear",
                delay: STORY_PHASE.ring.delay + 0.15,
              },
            }}
            style={{ transformOrigin: "60px 60px" }}
          />

          {/* Phase 7: Pulse waves emit from core */}
          {[0, 0.4, 0.8].map((offset, i) => (
            <motion.circle
              key={`pulse-${i}`}
              cx="60"
              cy="60"
              r="6"
              fill="none"
              stroke="#39e0ff"
              strokeWidth="0.5"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: [0.5, 4],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: STORY_PHASE.pulse.delay + offset,
                ease: "easeOut",
              }}
              style={{ transformOrigin: "60px 60px" }}
            />
          ))}

          {/* Continuous core breathing after boot */}
          <motion.circle
            cx="60"
            cy="60"
            r="3"
            fill="#39e0ff"
            fillOpacity="0.3"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: STORY_PHASE.pulse.delay,
            }}
            style={{ transformOrigin: "60px 60px" }}
          />
        </svg>
      </div>

      {/* Phase 8: AFRID wordmark types in */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: STORY_PHASE.wordmark.duration,
          delay: STORY_PHASE.wordmark.delay,
          ease: "easeOut",
        }}
        className="flex items-center gap-[0.15em] mt-3"
      >
        {"AFRID".split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.35,
              delay: STORY_PHASE.wordmark.delay + i * 0.08,
              ease: "easeOut",
            }}
            className="text-sm sm:text-base font-bold tracking-[0.22em] text-white font-display"
            style={{
              textShadow: i === 0 ? "0 0 12px rgba(57, 224, 255,0.3)" : "none",
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>

      {/* Boot sequence label */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 2,
          delay: 0.3,
          times: [0, 0.15, 0.85, 1],
        }}
        className="absolute -bottom-6 font-mono text-[8px] uppercase tracking-[0.2em] text-[#39e0ff]/50 whitespace-nowrap"
      >
        INITIALIZING SOVEREIGN GRID
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 0.5 }}
        className="absolute -bottom-6 font-mono text-[8px] uppercase tracking-[0.2em] text-[#39e0ff]/40 whitespace-nowrap"
      >
        GRID ONLINE
      </motion.span>
    </motion.div>
  );
}
