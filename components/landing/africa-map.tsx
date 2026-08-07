"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";

export const AFRICA_PATH =
  "M146.6 323c-3.1-1.1-3.5-1.7-3.8-5.2-.3-4.5-4.3-13.1-8.9-19.2-2.6-3.5-3.4-5.6-3.9-11-1-10.1-4.2-20.9-8.5-28.8-6.5-11.8-6.3-21.3.7-34.8 2.3-4.3 2.4-5.3 1.4-8.6-.6-2.1-1.1-5.6-1.1-7.8s-.4-4.3-1-4.7c-.5-.3-1.8-3.5-2.9-7.1-1.5-5.1-3.1-7.7-7-11.9-6-6.3-6.9-9.1-5.2-16.5.7-3 1.5-7 1.8-8.8.5-3.1.3-3.3-2.7-3.3-3 0-3.2-.2-2.8-3 .5-3.3.4-3.4-6.3-3-4.4.2-4.6.1-5.2-2.9-.5-2.3-1.6-3.5-4.2-4.8-3.6-1.7-3.7-1.7-14.5 2.1-9.3 3.3-11.6 3.7-15.8 3.1-3.4-.5-6.8-.2-11.1 1-9.6 2.7-14.8 1.1-23.8-7.2-4.6-4.2-7.5-7.7-8-9.7-1.1-4-9-14.7-10.8-14.7-1.4 0-1.9-3.3-1.4-9.7.1-1.8-.3-4.1-.9-5.3-.7-1.4-.8-2.6-.2-3.3.5-.7 1.2-3.4 1.6-6.2.8-6.1.8-4.9 0-17.2-.7-9.8-.6-10.3 1.8-13.5 1.4-1.8 4-6.1 5.8-9.5 3.2-6 10.2-14.3 12.1-14.3 2.1 0 8.9-7.3 8.9-9.6 0-5.1 3.1-10.2 8.1-13.4 2.7-1.7 5.8-4.7 7-6.5 2.4-3.8 5.9-4.5 9.6-1.9 3.5 2.5 7.5 2.1 13.4-1.3l5.6-3.2h15.1c8.3 0 16.2-.4 17.6-.9 4-1.5 8.5.7 9.2 4.6.3 1.8.3 4.1 0 5.1-.8 2.4 2.7 5.7 6.9 6.7 8.7 2 10.1 2.6 11.8 5.6 1 1.7 2.5 3 3.5 3.1.9 0 3.4.6 5.4 1.4 4.2 1.5 5.8.6 5.8-3.2 0-1.3.5-3.2 1-4.3 1.6-3.1 9.6-2.6 16.7.9 7 3.5 16.1 5.2 26.5 4.9 9-.3 10.7.9 10.7 7.4 0 2.7 1.4 6.2 4.9 12.3 2.7 4.7 5.8 10.6 6.9 13.1s3.1 6 4.6 7.9c1.5 2 2.6 4.7 2.6 6.6 0 3.8 1.1 6.1 5.5 11.6 1.8 2.2 3.5 5.4 3.9 7.1.5 2.2 2.4 4.5 6.6 7.9 6.3 5.1 10.4 10.3 11.4 14.7 1 4.3 3.8 5.2 12 3.8 3.9-.7 9-2.1 11.5-3.1 6.2-2.7 7.8-2.5 8.5 1.2 1.4 6.8.6 9.4-7.2 24.1-7.6 14.4-8 15-15.8 21.2-4.4 3.5-8.8 7.6-9.7 9-.9 1.4-4.6 5.8-8.2 9.8-10 11.1-11.2 18.5-4.9 30.9 1.7 3.4 2.5 6.4 2.3 8.8-.1 2 .1 6.2.5 9.2.7 4.7.5 6.3-1.2 9.5-2.5 4.8-4.3 6.5-11 9.8-2.9 1.4-5.3 3.1-5.3 3.6 0 .6-1.9 3-4.1 5.5l-4.1 4.5 1.8 3.9c1.9 4.3 1.7 10.9-.6 13.6-.7.8-3.1 2.5-5.3 3.6-5.2 2.7-5.7 3.4-5 8.5.5 3.8.3 4.6-2.6 7.5-1.8 1.8-6.1 6.7-9.6 10.9-10.2 12.1-11.6 12.8-26.5 13.3-6.8.2-13.4.6-14.5.9-1.1.3-3.6 0-5.5-.8zm102.3-38.7c-2.8-1.3-3.2-2.4-3.9-10.7-.6-6.2-.4-7.1 2.2-11.2 2.5-3.9 2.8-5.3 2.6-10.8-.3-8.2 1.1-11.8 5.2-12.7 4.1-.9 13.4-9.1 14.9-13.2 1.5-4.2 4.9-4.4 6.7-.5 3 6.7 2.5 12-2.5 25.8-2.6 7.2-5.4 15.7-6.2 19-2.6 10.6-4 13.1-8.2 14.4-4.6 1.4-7.8 1.3-10.7-.1zm53.7-24.2c0-1.3.5-2.7 1-3.1.6-.3 1 .1 1 1s.5 1.3 1 1c1.5-.9 1.2.4-.4 2.1-2 2-2.6 1.8-2.6-1zm-56-32.1c0-.8-.5-1.5-1-1.5s-1-1.4-1-3c0-2.5.4-3 2.5-3 1.6 0 2.5.6 2.5 1.5 0 1 1 1.5 3 1.5 2.7 0 3 .3 3 3 0 2.9-.2 3-4.5 3-3.3 0-4.5-.4-4.5-1.5zm53-35.5c0-2.5.4-3 2.5-3s2.5.5 2.5 3-.4 3-2.5 3-2.5-.5-2.5-3zm-203-27.5c0-1.4.7-2.8 1.5-3.1.8-.3 1.5-1.4 1.5-2.5 0-1.4.7-1.9 2.5-1.9 2 0 2.5.5 2.5 2.5 0 1.4-.5 2.5-1 2.5s-1 1.1-1 2.5c0 2.1-.5 2.5-3 2.5-2.5 0-3-.4-3-2.5z";

export const DATA_POINTS = [
  { cx: 55, cy: 130, label: "Lagos", delay: 0, size: 2.5 },
  { cx: 28, cy: 115, label: "Accra", delay: 0.4, size: 2 },
  { cx: 195, cy: 125, label: "Addis Ababa", delay: 0.8, size: 2.5 },
  { cx: 170, cy: 155, label: "Nairobi", delay: 1.2, size: 3 },
  { cx: 140, cy: 285, label: "Johannesburg", delay: 1.6, size: 3 },
  { cx: 12, cy: 95, label: "Dakar", delay: 2.0, size: 2 },
  { cx: 150, cy: 40, label: "Cairo", delay: 2.4, size: 2.5 },
  { cx: 68, cy: 148, label: "Douala", delay: 2.8, size: 2 },
];

const CONNECTIONS: [number, number][] = [
  [0, 2], [0, 7], [2, 3], [3, 4], [5, 0], [6, 2], [7, 3], [1, 0],
];

interface AfricaMapProps {
  scrollProgress?: MotionValue<number>;
  className?: string;
  showDataPoints?: boolean;
  showLabel?: boolean;
}

export default function AfricaMap({ scrollProgress, className = "", showDataPoints = true, showLabel = true }: AfricaMapProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const progress = scrollProgress ?? scrollYProgress;
  const scale = useTransform(progress, [0, 0.5, 1], [0.92, 1, 0.92]);
  const rotate = useTransform(progress, [0, 1], [-1.5, 1.5]);

  if (isMobile) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="relative w-full h-auto">
          <svg viewBox="0 0 307 325" className="w-full h-auto" fill="none">
            <defs>
              <linearGradient id="meshGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#39e0ff" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#b27bff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="fillGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#39e0ff" stopOpacity="0.08" />
                <stop offset="50%" stopColor="#b27bff" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <path
              d={AFRICA_PATH}
              stroke="url(#meshGradientMobile)"
              strokeWidth="1"
              fill="url(#fillGradientMobile)"
            />
            <path
              d={AFRICA_PATH}
              stroke="#39e0ff"
              strokeWidth="0.4"
              strokeOpacity="0.3"
              fill="none"
            />
            {showDataPoints && DATA_POINTS.map((pt, i) => (
              <circle
                key={`pt-m-${i}`}
                cx={pt.cx}
                cy={pt.cy}
                r={pt.size}
                fill={pt.size >= 2.5 ? "#39e0ff" : "#b27bff"}
                opacity="0.8"
              />
            ))}
            {showDataPoints && CONNECTIONS.map(([from, to], i) => {
              const pt = DATA_POINTS[from];
              const target = DATA_POINTS[to];
              return (
                <line
                  key={`conn-m-${i}`}
                  x1={pt.cx} y1={pt.cy}
                  x2={target.cx} y2={target.cy}
                  stroke="#39e0ff"
                  strokeWidth="0.25"
                  strokeOpacity="0.15"
                />
              );
            })}
          </svg>
        </div>
        {showLabel && (
          <p className="text-center text-[9px] uppercase tracking-[0.14em] text-[#39e0ff]/50 mt-4 font-mono">
            DATA_NODES_ACROSS_CONTINENT
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <motion.div style={{ scale, rotate }} className="relative w-full h-auto">
        <svg viewBox="0 0 307 325" className="w-full h-auto drop-shadow-[0_0_50px_rgba(57, 224, 255,0.15)]" fill="none">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#39e0ff" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#b27bff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="fillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#39e0ff" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#b27bff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.08" />
            </linearGradient>
            <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#39e0ff" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#b27bff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#39e0ff" stopOpacity="0" />
            </radialGradient>
            <pattern id="grid" width="15" height="15" patternUnits="userSpaceOnUse">
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="url(#meshGradient)" strokeWidth="0.2" strokeOpacity="0.15" />
            </pattern>
          </defs>

          {/* Africa silhouette — animated draw with glow */}
          <motion.path
            d={AFRICA_PATH}
            stroke="url(#meshGradient)"
            strokeWidth="1"
            fill="url(#fillGradient)"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />

          {/* Second pass — brighter stroke after fill */}
          <motion.path
            d={AFRICA_PATH}
            stroke="#39e0ff"
            strokeWidth="0.4"
            strokeOpacity="0.3"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
          />

          <clipPath id="africaClip">
            <path d={AFRICA_PATH} />
          </clipPath>
          <rect width="307" height="325" fill="url(#grid)" clipPath="url(#africaClip)" />

          {/* Rotating inner glow */}
          <g clipPath="url(#africaClip)">
            <motion.circle
              cx={110} cy={170} r="80"
              fill="url(#coreGradient)"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "110px 170px" }}
            />
          </g>

          {showDataPoints && (
            <>
              {/* Animated connection lines with flowing dashes */}
              {CONNECTIONS.map(([from, to], i) => {
                const pt = DATA_POINTS[from];
                const target = DATA_POINTS[to];
                return (
                  <g key={`conn-${i}`}>
                    <line
                      x1={pt.cx} y1={pt.cy}
                      x2={target.cx} y2={target.cy}
                      stroke="#39e0ff"
                      strokeWidth="0.25"
                      strokeOpacity="0.15"
                    />
                    <motion.line
                      x1={pt.cx} y1={pt.cy}
                      x2={target.cx} y2={target.cy}
                      stroke="#39e0ff"
                      strokeWidth="0.4"
                      strokeDasharray="3 50"
                      animate={{ strokeDashoffset: [53, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "linear",
                      }}
                      opacity="0.5"
                    />
                  </g>
                );
              })}

              {/* Data points with layered ripple effects */}
              {DATA_POINTS.map((pt, i) => (
                <g key={`pt-${i}`}>
                  {pt.size >= 2.5 && (
                    <motion.circle
                      cx={pt.cx} cy={pt.cy}
                      r={pt.size}
                      fill="none"
                      stroke="#39e0ff"
                      strokeWidth="0.15"
                      animate={{ scale: [1, 3.5], opacity: [0.5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: pt.delay, ease: "easeOut" }}
                      style={{ transformOrigin: `${pt.cx}px ${pt.cy}px` }}
                    />
                  )}
                  {pt.size >= 2.5 && (
                    <motion.circle
                      cx={pt.cx} cy={pt.cy}
                      r={pt.size}
                      fill="none"
                      stroke="#b27bff"
                      strokeWidth="0.2"
                      animate={{ scale: [1, 2], opacity: [0.4, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: pt.delay + 1, ease: "easeOut" }}
                      style={{ transformOrigin: `${pt.cx}px ${pt.cy}px` }}
                    />
                  )}
                  <motion.circle
                    cx={pt.cx} cy={pt.cy}
                    r={pt.size}
                    fill={pt.size >= 2.5 ? "#39e0ff" : "#b27bff"}
                    filter="url(#glow)"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", delay: pt.delay, stiffness: 200 }}
                  />
                  <motion.circle
                    cx={pt.cx} cy={pt.cy}
                    r={pt.size * 0.6}
                    fill="#ffffff"
                    filter="url(#strongGlow)"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: pt.delay, ease: "easeInOut" }}
                  />
                  <text
                    x={pt.cx + 4}
                    y={pt.cy + 2}
                    fill="#39e0ff"
                    fontSize="3.5"
                    className="font-mono uppercase tracking-widest opacity-30 pointer-events-none"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}

              {/* Data packets travelling along connections */}
              {CONNECTIONS.slice(0, 5).map(([from, to], i) => {
                const pt = DATA_POINTS[from];
                const next = DATA_POINTS[to];
                return (
                  <motion.circle
                    key={`packet-${i}`}
                    cx={pt.cx}
                    cy={pt.cy}
                    r={1}
                    fill="#ffffff"
                    filter="url(#strongGlow)"
                    initial={{ cx: pt.cx, cy: pt.cy, r: 1, opacity: 0, scale: 0.5 }}
                    animate={{
                      cx: [pt.cx, next.cx],
                      cy: [pt.cy, next.cy],
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1.2, 1.2, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeInOut",
                      times: [0, 0.2, 0.8, 1],
                    }}
                  />
                );
              })}

              {/* Central core — geographic center of Africa */}
              <motion.circle
                cx={110} cy={170} r={4}
                fill="#39e0ff" fillOpacity="0.15"
                stroke="#39e0ff" strokeWidth="0.5"
                filter="url(#glow)"
                initial={{ r: 4, fillOpacity: 0.15 }}
                animate={{ r: [4, 7, 4], fillOpacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle
                cx={110} cy={170} r="8"
                fill="none"
                stroke="#39e0ff"
                strokeWidth="0.15"
                animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                style={{ transformOrigin: "110px 170px" }}
              />
            </>
          )}
        </svg>
      </motion.div>
      {showLabel && (
        <p className="text-center text-[9px] uppercase tracking-[0.14em] text-[#39e0ff]/50 mt-4 font-mono">
          DATA_NODES_ACROSS_CONTINENT
        </p>
      )}
    </div>
  );
}
