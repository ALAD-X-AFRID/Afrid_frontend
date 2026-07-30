"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  seconds: number;
  blob: Blob | null;
  error: string;
}

export function useAudioRecorder(maxDuration: number) {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isPaused: false,
    seconds: 0,
    blob: null,
    error: "",
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const start = useCallback(async () => {
    try {
      setState((s) => ({ ...s, error: "" }));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        setState((s) => ({ ...s, blob, isRecording: false, isPaused: false }));
        cleanup();
      };

      recorder.start();
      setState((s) => ({ ...s, isRecording: true, isPaused: false, seconds: 0, blob: null }));

      timerRef.current = setInterval(() => {
        setState((s) => {
          if (s.seconds >= maxDuration) {
            stop();
            return s;
          }
          return { ...s, seconds: s.seconds + 1 };
        });
      }, 1000);
    } catch {
      setState((s) => ({ ...s, error: "Microphone access denied" }));
    }
  }, [maxDuration, cleanup]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setState((s) => ({ ...s, isPaused: true }));
    }
  }, []);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setState((s) => ({ ...s, isPaused: false }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isRecording: false, isPaused: false, seconds: 0, blob: null, error: "" });
  }, []);

  return { ...state, start, stop, pause, resume, reset };
}
