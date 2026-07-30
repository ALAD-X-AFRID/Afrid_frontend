"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "goals", label: "Mission" },
  { id: "story", label: "Story" },
  { id: "refinery", label: "Refinery" },
  { id: "why", label: "Data" },
  { id: "turing-infrastructure", label: "Hunt" },
  { id: "infrastructure", label: "Reward" },
  { id: "waitlist", label: "Join" },
  { id: "discord", label: "Tribe" },
];

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("Home");

  useEffect(() => {
    let ticking = false;
    const sections = SECTIONS.map((s) => ({
      ...s,
      el: document.getElementById(s.id),
    }));

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const pct = maxScroll > 0 ? Math.min(100, (scrollY / maxScroll) * 100) : 0;
        setProgress(pct);

        const mid = scrollY + window.innerHeight / 3;
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = sections[i].el;
          if (el && el.offsetTop <= mid) {
            setActiveSection(sections[i].label);
            break;
          }
        }
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 z-40 h-[2px] bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-[#39e0ff] via-[#b27bff] to-[#ff6b6b] transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Section label — bottom right */}
      <div className="fixed bottom-6 right-6 z-40 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] px-3.5 py-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#39e0ff] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#39e0ff] font-mono">{activeSection}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
