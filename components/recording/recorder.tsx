"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import { resampleBuffer, formatTime } from "@/lib/audio-utils";
import { encodeWAV } from "@/lib/wav-encoder";

export default function Recorder({
  duration,
  onRecorded,
}: {
  duration: number;
  onRecorded: (blob: Blob, recordedSeconds: number) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [noiseDb, setNoiseDb] = useState(-100);
  const [lowSignal, setLowSignal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const maxDurationRef = useRef<number>(duration);

  const draw = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    const sliceWidth = width / bufferLength;
    let x = 0;

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;

      const sample = (dataArray[i] - 128) / 128;
      sum += sample * sample;
    }
    ctx.stroke();

    const rms = Math.sqrt(sum / bufferLength);
    const db = 20 * Math.log10(rms + 1e-10);
    setNoiseDb(db);
    setLowSignal(db < -45);

    animationRef.current = requestAnimationFrame(draw);
  }, []);

  const cleanup = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setRecording(false);
  }, []);

  const finishRecording = useCallback(async () => {
    cleanup();
    setProcessing(true);
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const decodeCtx = new AudioContext();
      const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
      const resampled = await resampleBuffer(audioBuffer, 16000);
      const wav = encodeWAV(resampled, 16000);
      const recordedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onRecorded(wav, recordedSeconds);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  }, [cleanup, onRecorded]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => finishRecording();
      recorder.start(100);
      mediaRecorderRef.current = recorder;

      startTimeRef.current = Date.now();
      setElapsed(0);
      setRecording(true);
      animationRef.current = requestAnimationFrame(draw);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= maxDurationRef.current) {
            stopRecording();
          }
          return prev + 1;
        });
      }, 1000);

      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, maxDurationRef.current * 1000);
    } catch (error) {
      console.error(error);
    }
  }, [draw, finishRecording, stopRecording]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="space-y-6">
      <div className="relative h-32 w-full rounded-2xl border border-border bg-card">
        <canvas ref={canvasRef} width={800} height={128} className="h-full w-full" />
        {!recording && !processing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs uppercase tracking-widest text-muted">Ready to record</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-white">
            {formatTime(elapsed)}
          </p>
          <p className="text-xs text-muted">Target: {formatTime(duration)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-muted">Input level</p>
          <p className={`text-sm font-semibold ${lowSignal ? "text-red-400" : "text-white"}`}>
            {noiseDb.toFixed(1)} dB
          </p>
          {lowSignal && <p className="text-xs text-red-400">Low signal / high noise</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-warm px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
          >
            <Mic size={16} />
            {processing ? "Processing..." : "One-Press Record"}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-card-hover"
          >
            <Square size={16} />
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
