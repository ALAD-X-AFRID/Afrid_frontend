"use client";

import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function TextReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.05,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const isMobile = useIsMobile();
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={isMobile ? { opacity: 0 } : { opacity: 0, y: 20, filter: "blur(8px)" }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: isMobile ? 0.3 : 0.5,
            delay: isMobile ? 0 : delay + i * stagger,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
