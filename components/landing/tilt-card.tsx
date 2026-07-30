"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function TiltCard({
  children,
  className = "",
  intensity = 8,
  style = {},
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  style?: React.CSSProperties;
}) {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });
  const transform = useTransform(
    [springX, springY],
    ([rx, ry]) => `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`
  );

  const onMove = (e: React.MouseEvent) => {
    if (isMobile || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-py * intensity);
    rotateY.set(px * intensity);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  if (isMobile) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ ...style, transform }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
