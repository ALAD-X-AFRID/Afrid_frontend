"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Settings, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import LanguageSelector, { INPUT_DIALECTS, OUTPUT_LANGS, type LanguageOption } from "@/components/studio/language-selector";
import MicrophoneRecorder from "@/components/studio/microphone-recorder";
import TranscriptCard from "@/components/studio/transcript-card";
import FileUploadZone from "@/components/studio/file-upload-zone";

type RecorderState = "idle" | "recording" | "processing";

const SAMPLE_ORIGINAL = [
  { timestamp: "00:00", text: "E get one ting wey dey happen for our village wey nobody fit explain." },
  { timestamp: "00:04", text: "Every night, we dey hear voice from the river, but when we go look, nothing dey there." },
  { timestamp: "00:09", text: "My papa talk say na our ancestors dey call us, but I no too believe am." },
  { timestamp: "00:14", text: "So I decide say I go record the voice make I show my teacher for school." },
];

const SAMPLE_TRANSLATED = [
  { timestamp: "00:00", text: "There is something happening in our village that nobody can explain." },
  { timestamp: "00:04", text: "Every night, we hear a voice from the river, but when we go to look, nothing is there." },
  { timestamp: "00:09", text: "My father says it is our ancestors calling us, but I do not quite believe it." },
  { timestamp: "00:14", text: "So I decided that I will record the voice to show my teacher at school." },
];

export default function TranscribePage() {
  const [inputLang, setInputLang] = useState<LanguageOption>(INPUT_DIALECTS[0]);
  const [outputLang, setOutputLang] = useState<LanguageOption>(OUTPUT_LANGS[0]);
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [showTranscript, setShowTranscript] = useState(false);

  const handleRecordingComplete = useCallback((_blob: Blob, _duration: number) => {
    setTimeout(() => {
      setShowTranscript(true);
      setRecorderState("idle");
    }, 2500);
  }, []);

  const handleFileSelected = useCallback((_file: File) => {
    setRecorderState("processing");
    setTimeout(() => {
      setShowTranscript(true);
      setRecorderState("idle");
    }, 2500);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#FF5E36]/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#10B981]/[0.04] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/[0.06] bg-[#0B0F17]/60 backdrop-blur-xl">
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5E36] to-[#10B981] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight">AFRID<span className="text-[#FF5E36]">.</span>Studio</span>
          </Link>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors">
              <History size={15} />
              <span className="hidden sm:inline">History</span>
            </button>
            <button className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-colors">
              <Settings size={16} />
            </button>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <h1 className="text-[clamp(1.8rem,5vw,3rem)] font-black tracking-tight leading-[1.1]">
            African Audio
            <br />
            <span className="bg-gradient-to-r from-[#FF5E36] via-[#b27bff] to-[#10B981] bg-clip-text text-transparent">
              Transcription & Translation
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/40 max-w-md mx-auto">
            Record or upload audio in any African dialect. Get instant AI-powered transcription and translation.
          </p>
        </motion.div>

        {/* Language selectors */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 mb-10"
        >
          <LanguageSelector type="input" value={inputLang} onChange={setInputLang} />
          <div className="text-white/20 text-lg">{"\u2192"}</div>
          <LanguageSelector type="output" value={outputLang} onChange={setOutputLang} />
        </motion.div>

        {/* Recording hub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-white/[0.08] bg-[#181F2C]/40 backdrop-blur-xl p-8 sm:p-10 mb-8"
        >
          <MicrophoneRecorder
            onRecordingComplete={handleRecordingComplete}
            onStateChange={setRecorderState}
          />
        </motion.div>

        {/* File upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs uppercase tracking-widest text-white/30 font-medium">or upload a file</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <FileUploadZone onFileSelected={handleFileSelected} />
        </motion.div>

        {/* Transcript workspace */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Transcript</h2>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="text-xs text-white/40 hover:text-white transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TranscriptCard
                  title="Original Dialect"
                  language={inputLang.label}
                  flag={inputLang.flag}
                  segments={SAMPLE_ORIGINAL}
                  accentColor="#FF5E36"
                  isOriginal
                />
                <TranscriptCard
                  title="Translation"
                  language={outputLang.label}
                  flag={outputLang.flag}
                  segments={SAMPLE_TRANSLATED}
                  accentColor="#10B981"
                  isOriginal={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
