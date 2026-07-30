"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  format,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  format?: "k" | "comma";
  className?: string;
}) {
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
      // Slot machine feel — randomize digits near the end
      const eased = 1 - Math.pow(1 - t, 4);
      const current = Math.floor(value * eased);

      if (t < 0.85) {
        // Add jitter for slot machine effect
        const jitter = Math.floor(Math.random() * (value * 0.05));
        setDisplay(Math.min(value, current + jitter));
      } else {
        setDisplay(current);
      }

      if (t < 1) requestAnimationFrame(tick);
      else setDisplay(value);
    };
    tick();
  }, [inView, value]);

  let str = display.toLocaleString();
  if (format === "k" && display >= 1000) str = `${(display / 1000).toFixed(1)}K`;

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {prefix}
      {str}
      {suffix}
    </motion.span>
  );
}
