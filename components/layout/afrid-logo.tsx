"use client";

import { motion } from "framer-motion";
import { AFRICA_PATH } from "../landing/africa-map";

export default function AfridLogo({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 307 325" className="h-full w-auto overflow-visible">
        <defs>
          <linearGradient id="logoMapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#39e0ff" />
            <stop offset="50%" stopColor="#8FD4B0" />
            <stop offset="100%" stopColor="#070a18" />
          </linearGradient>
          <radialGradient id="logoMapFill" cx="40%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#39e0ff" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#39e0ff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#070a18" stopOpacity="0.05" />
          </radialGradient>
          <filter id="logoMapGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="logoMapOuterGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="outerBlur" />
            <feMerge>
              <feMergeNode in="outerBlur" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow halo */}
        <motion.path
          d={AFRICA_PATH}
          fill="none"
          stroke="#39e0ff"
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#logoMapOuterGlow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Africa silhouette — glowing border */}
        <motion.path
          d={AFRICA_PATH}
          fill="url(#logoMapFill)"
          stroke="url(#logoMapGrad)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          filter="url(#logoMapGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Inner border light leak */}
        <motion.path
          d={AFRICA_PATH}
          fill="none"
          stroke="#8FD4B0"
          strokeWidth="0.6"
          strokeLinejoin="round"
          strokeOpacity="0.4"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Pulsing core — geographic center */}
        <motion.circle
          cx={110} cy={170} r="3"
          fill="#8FD4B0"
          filter="url(#logoMapGlow)"
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "110px 170px" }}
        />

        {/* Secondary glow point */}
        <motion.circle
          cx={110} cy={170} r="6"
          fill="none"
          stroke="#39e0ff"
          strokeWidth="0.5"
          animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          style={{ transformOrigin: "110px 170px" }}
        />
      </svg>
      <span className="text-lg font-bold tracking-[0.18em] text-white font-display">AFRID</span>
    </div>
  );
}
