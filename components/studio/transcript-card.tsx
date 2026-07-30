"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Share2, Gauge, Check, FileText, FileCode, FileType } from "lucide-react";

interface TranscriptCardProps {
  title: string;
  language: string;
  flag: string;
  segments: { timestamp: string; text: string }[];
  accentColor: string;
  isOriginal: boolean;
}

export default function TranscriptCard({ title, language, flag, segments, accentColor, isOriginal }: TranscriptCardProps) {
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [speed, setSpeed] = useState(1);

  const handleCopy = () => {
    const text = segments.map((s) => `[${s.timestamp}] ${s.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speeds = [1, 1.25, 1.5];
  const cycleSpeed = () => {
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: isOriginal ? 0 : 0.15 }}
      className="rounded-2xl border border-white/10 bg-[#181F2C]/80 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
          <span className="text-sm font-semibold text-white">{title}</span>
          <span className="text-base">{flag}</span>
          <span className="text-xs text-white/40">{language}</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-white/[0.04] bg-white/[0.02]">
        <ActionButton onClick={handleCopy} tooltip="Copy to Clipboard">
          {copied ? <Check size={15} className="text-[#10B981]" /> : <Copy size={15} />}
        </ActionButton>

        <div className="relative">
          <ActionButton onClick={() => setShowExport((v) => !v)} tooltip="Export">
            <Download size={15} />
          </ActionButton>
          <AnimatePresence>
            {showExport && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 left-0 rounded-xl border border-white/10 bg-[#181F2C] shadow-xl overflow-hidden z-20"
              >
                {[
                  { label: "TXT", icon: FileText },
                  { label: "SRT", icon: FileCode },
                  { label: "PDF", icon: FileType },
                ].map((fmt) => (
                  <button
                    key={fmt.label}
                    onClick={() => setShowExport(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <fmt.icon size={13} /> {fmt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ActionButton onClick={() => window.open("https://wa.me/?text=" + encodeURIComponent(segments.map((s) => s.text).join(" ")), "_blank")} tooltip="Share to WhatsApp">
          <Share2 size={15} />
        </ActionButton>

        <div className="ml-auto">
          <button
            onClick={cycleSpeed}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Gauge size={14} />
            {speed}x
          </button>
        </div>
      </div>

      {/* Transcript content */}
      <div className="px-5 py-4 max-h-[320px] overflow-y-auto space-y-3">
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: isOriginal ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            className="flex gap-3 group"
          >
            <span className="text-[10px] font-mono text-white/30 tabular-nums pt-1 shrink-0 w-12">
              {seg.timestamp}
            </span>
            <p className="text-sm leading-relaxed text-white/85">
              {seg.text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ActionButton({ children, onClick, tooltip }: { children: React.ReactNode; onClick: () => void; tooltip: string }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="flex items-center justify-center w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
    >
      {children}
    </button>
  );
}
