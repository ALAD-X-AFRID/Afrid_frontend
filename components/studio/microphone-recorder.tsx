"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2 } from "lucide-react";
import AudioWaveform from "./audio-waveform";

type RecorderState = "idle" | "recording" | "processing";

interface MicrophoneRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onStateChange: (state: RecorderState) => void;
}

export default function MicrophoneRecorder({ onRecordingComplete, onStateChange }: MicrophoneRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);
  const rafTimerRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        setState("processing");
        onRecordingComplete(blob, durationRef.current);
      };
      recorder.start();
      setState("recording");
      startTimeRef.current = Date.now();

      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        durationRef.current = elapsed;
        rafTimerRef.current = requestAnimationFrame(updateTimer);
      };
      updateTimer();
    } catch (err) {
      console.error("Microphone access denied:", err);
      setState("idle");
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    cancelAnimationFrame(rafTimerRef.current);
    setAnalyser(null);
  }, []);

  const resetToIdle = useCallback(() => {
    setState("idle");
    setDuration(0);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer */}
      <AnimatePresence mode="wait">
        {state === "recording" && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-mono text-2xl font-bold tabular-nums text-white"
          >
            {formatTime(duration)}
          </motion.div>
        )}
        {state === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm font-medium text-[#10B981]"
          >
            Processing African Dialect AI Models...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic Orb */}
      <motion.button
        onClick={state === "idle" ? startRecording : state === "recording" ? stopRecording : undefined}
        disabled={state === "processing"}
        className="relative z-10"
        whileHover={state === "idle" ? { scale: 1.05 } : undefined}
        whileTap={state === "recording" ? { scale: 0.95 } : undefined}
      >
        {/* Ambient glow rings */}
        {state === "idle" && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-[#FF5E36]/20 blur-2xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-[#FF5E36]/30"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          </>
        )}
        {state === "recording" && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500/30 blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-500/50"
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            />
          </>
        )}

        {/* Main button */}
        <div
          className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
            state === "idle"
              ? "bg-gradient-to-br from-[#FF5E36] to-[#ff6b6b] shadow-[0_0_40px_rgba(255,94,54,0.3)]"
              : state === "recording"
              ? "bg-gradient-to-br from-red-500 to-[#FF5E36] shadow-[0_0_50px_rgba(239,68,68,0.4)]"
              : "bg-[#181F2C] border border-[#10B981]/30"
          }`}
        >
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div key="mic" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <Mic size={32} className="text-white" />
              </motion.div>
            )}
            {state === "recording" && (
              <motion.div key="stop" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <Square size={28} className="text-white fill-white" />
              </motion.div>
            )}
            {state === "processing" && (
              <motion.div key="spinner" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <Loader2 size={32} className="text-[#10B981] animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Waveform */}
      <div className="w-full flex items-center justify-center">
        <AudioWaveform analyser={analyser} isRecording={state === "recording"} />
      </div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium"
        >
          {state === "idle" && "Tap to record"}
          {state === "recording" && "Recording in progress"}
          {state === "processing" && "AI transcribing..."}
        </motion.p>
      </AnimatePresence>

      {/* Hidden trigger for parent to reset */}
      <button onClick={resetToIdle} className={state === "processing" ? "text-xs text-[#10B981] hover:underline" : "hidden"}>
        Reset
      </button>
    </div>
  );
}
