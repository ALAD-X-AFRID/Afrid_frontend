"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Globe2, Mic2 } from "lucide-react";

const INPUT_DIALECTS = [
  { code: "pcm", label: "Nigerian Pidgin", flag: "🇳🇬" },
  { code: "yor", label: "Yoruba", flag: "🇳🇬" },
  { code: "swa", label: "Swahili", flag: "🇰🇪" },
  { code: "ibo", label: "Igbo", flag: "🇳🇬" },
  { code: "hau", label: "Hausa", flag: "🇳🇬" },
  { code: "amh", label: "Amharic", flag: "🇪🇹" },
  { code: "wol", label: "Wolof", flag: "🇸🇳" },
  { code: "zul", label: "Zulu", flag: "🇿🇦" },
  { code: "twi", label: "Twi", flag: "🇬🇭" },
  { code: "xho", label: "Xhosa", flag: "🇿🇦" },
];

const OUTPUT_LANGS = [
  { code: "eng", label: "English", flag: "🇬🇧" },
  { code: "fra", label: "French", flag: "🇫🇷" },
  { code: "dual", label: "Dual Display", flag: "🌍" },
];

export type LanguageOption = { code: string; label: string; flag: string };

interface LanguageSelectorProps {
  type: "input" | "output";
  value: LanguageOption;
  onChange: (lang: LanguageOption) => void;
}

export default function LanguageSelector({ type, value, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = type === "input" ? INPUT_DIALECTS : OUTPUT_LANGS;
  const Icon = type === "input" ? Mic2 : Globe2;
  const label = type === "input" ? "Input Dialect" : "Output Language";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl px-4 py-2.5 text-sm transition-all hover:border-white/20 hover:bg-white/[0.08]"
      >
        <Icon size={15} className={type === "input" ? "text-[#FF5E36]" : "text-[#10B981]"} />
        <span className="text-lg leading-none">{value.flag}</span>
        <span className="font-medium text-white/90">{value.label}</span>
        <ChevronDown
          size={14}
          className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full mt-2 left-0 min-w-[220px] rounded-2xl border border-white/10 bg-[#181F2C]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/30 font-semibold border-b border-white/[0.06]">
              {label}
            </div>
            <div className="max-h-[260px] overflow-y-auto p-1.5">
              {options.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    value.code === opt.code
                      ? "bg-white/[0.08] text-white"
                      : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span className="text-base">{opt.flag}</span>
                  <span className="flex-1 text-left font-medium">{opt.label}</span>
                  {value.code === opt.code && <Check size={14} className="text-[#10B981]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { INPUT_DIALECTS, OUTPUT_LANGS };
