"use client";

import { useRef, useCallback } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function MagneticLetters({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const cachedRect = useRef<DOMRect | null>(null);

  const onContainerEnter = useCallback(() => {
    if (containerRef.current) {
      cachedRect.current = containerRef.current.getBoundingClientRect();
    }
  }, []);

  const onContainerLeave = useCallback(() => {
    cachedRect.current = null;
  }, []);

  return (
    <span
      ref={containerRef}
      onMouseEnter={onContainerEnter}
      onMouseLeave={onContainerLeave}
      className={`inline-block ${className}`}
    >
      {text.split("").map((char, i) => (
        <MagneticLetter
          key={i}
          char={char}
          index={i}
          cachedRect={cachedRect}
        />
      ))}
    </span>
  );
}

function MagneticLetter({
  char,
  index,
  cachedRect,
}: {
  char: string;
  index: number;
  cachedRect: React.RefObject<DOMRect | null>;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });
  const letterCenterRef = useRef<{ cx: number; cy: number } | null>(null);

  const onMove = (e: ReactMouseEvent) => {
    const rect = cachedRect.current;
    if (!rect) return;
    if (!letterCenterRef.current) {
      const letterEl = e.currentTarget as HTMLElement;
      const lr = letterEl.getBoundingClientRect();
      letterCenterRef.current = {
        cx: lr.left + lr.width / 2,
        cy: lr.top + lr.height / 2,
      };
    }
    const { cx: letterCx, cy: letterCy } = letterCenterRef.current;
    const dx = e.clientX - letterCx;
    const dy = e.clientY - letterCy;
    const distSq = dx * dx + dy * dy;
    if (distSq < 6400) {
      const dist = Math.sqrt(distSq);
      const force = (80 - dist) / 80;
      x.set(dx * force * 0.35);
      y.set(dy * force * 0.35);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
    letterCenterRef.current = null;
  };

  if (char === " ") return <span key={index} className="inline-block mr-[0.25em]" />;

  return (
    <motion.span
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY }}
      className="inline-block will-change-transform"
    >
      {char}
    </motion.span>
  );
}
