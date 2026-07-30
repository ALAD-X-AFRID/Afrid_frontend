"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const glow = glowRef.current;
    if (!dot || !ring || !glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;
    let raf = 0;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const target = e.target as HTMLElement;
      hovering = !!target.closest("a, button, input, [data-cursor-hover]");
    };

    const animate = () => {
      // Ring follows with lag
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      // Glow follows with more lag
      glowX += (mouseX - glowX) * 0.06;
      glowY += (mouseY - glowY) * 0.06;

      dot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
      const ringSize = hovering ? 40 : 26;
      ring.style.transform = `translate3d(${ringX - ringSize / 2}px, ${ringY - ringSize / 2}px, 0)`;
      ring.style.width = `${ringSize}px`;
      ring.style.height = `${ringSize}px`;
      ring.style.borderColor = hovering ? "rgba(178, 123, 255,0.7)" : "rgba(57, 224, 255,0.4)";
      glow.style.transform = `translate3d(${glowX - 150}px, ${glowY - 150}px, 0)`;

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    animate();
    document.body.style.cursor = "none";

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      {/* Glow — CSS radial gradient, no canvas */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 z-[9997] w-[300px] h-[300px] rounded-full opacity-50 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(57, 224, 255,0.12) 0%, rgba(178, 123, 255,0.04) 40%, transparent 65%)",
          willChange: "transform",
        }}
      />
      <div ref={dotRef} className="pointer-events-none fixed top-0 left-0 z-[9999] w-2 h-2 rounded-full bg-[#b27bff]" style={{ willChange: "transform" }} />
      <div ref={ringRef} className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border border-[#39e0ff]/40 transition-[width,height,border-color] duration-200" style={{ willChange: "transform" }} />
    </>
  );
}
