"use client";

import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  color?: string;
}

export default function AudioWaveform({ analyser, isRecording, color = "#FF5E36" }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (!analyser || !isRecording) {
        // Idle state — draw flat line with subtle pulse
        ctx.strokeStyle = `${color}30`;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        const baseY = h / 2;
        const segments = 60;
        const barWidth = w / segments;
        for (let i = 0; i < segments; i++) {
          const idleHeight = Math.sin(Date.now() / 800 + i * 0.3) * 3 * dpr;
          const x = i * barWidth + barWidth / 2;
          ctx.moveTo(x, baseY - idleHeight);
          ctx.lineTo(x, baseY + idleHeight);
        }
        ctx.stroke();
        return;
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      const segments = 64;
      const barWidth = w / segments;
      const gap = 2 * dpr;

      for (let i = 0; i < segments; i++) {
        const dataIndex = Math.floor((i / segments) * dataArray.length * 0.6);
        const value = dataArray[dataIndex] / 255;
        const barHeight = Math.max(value * h * 0.8, 2 * dpr);
        const x = i * barWidth + gap / 2;
        const y = (h - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, color);
        grad.addColorStop(1, `${color}40`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth - gap, barHeight);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [analyser, isRecording, color]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-20 sm:h-24 pointer-events-none"
      style={{ maxWidth: "420px" }}
    />
  );
}
