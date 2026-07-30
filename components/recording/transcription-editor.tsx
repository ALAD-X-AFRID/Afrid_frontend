"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Flag, Save, Loader2 } from "lucide-react";
import AnimatedSection from "@/components/ui/animated-section";
import { useMetadata } from "@/context/metadata-context";
import { getSubmission, saveTranscription, getAudioURL } from "@/lib/api";

export default function TranscriptionEditor({ submissionId }: { submissionId: string }) {
  const { idToken } = useMetadata();
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewerComment, setReviewerComment] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!idToken || submissionId === "demo-submission") {
      setLoading(false);
      return;
    }
    setLoading(true);
    getSubmission(idToken, submissionId)
      .then(async (data) => {
        const t = data.transcription || {};
        setTranscript(t.transcript_refined || t.transcript_raw || "");
        setTranslation(t.translation_english || "");
        setReviewerComment(data.reviewer_comment || "");
        setSubmissionStatus(data.status || "");
        if (data.audio_file_url) {
          try {
            const signedUrl = await getAudioURL(idToken, submissionId);
            setAudioUrl(signedUrl);
          } catch {
            setAudioUrl("");
          }
        }
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [idToken, submissionId]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.playbackRate = speed;
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleSpeed = (value: number) => {
    setSpeed(value);
    if (audioRef.current) audioRef.current.playbackRate = value;
  };

  const markCodeSwitch = () => {
    const textarea = document.getElementById("transcript") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = transcript.slice(start, end);
    if (!selected) return;
    const wrapped = `[${selected}]`;
    setTranscript(transcript.slice(0, start) + wrapped + transcript.slice(end));
  };

  const handleSave = async () => {
    if (!idToken || submissionId === "demo-submission") {
      setSaved(true);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveTranscription(idToken, submissionId, transcript, translation);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AnimatedSection>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Human-in-the-Loop Layer
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          {submissionStatus === "revision_requested" ? "Revise & resubmit" : "Refine the transcript"}
        </h1>
        <p className="mt-4 text-muted">
          {submissionStatus === "revision_requested"
            ? "A reviewer has requested changes. Update your transcript and translation below, then save to resubmit."
            : "Correct the transcript, add the English translation, and mark code-switching. Submission: " + submissionId}
        </p>
      </AnimatedSection>

      {submissionStatus === "revision_requested" && reviewerComment && (
        <AnimatedSection delay={0.05} className="mt-6">
          <div className="rounded-2xl border border-[#FFD6A1]/20 bg-[#4A3E2E]/30 p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#FFD6A1]">Reviewer feedback</p>
            <p className="text-sm text-white/90">{reviewerComment}</p>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection delay={0.1} className="mt-10">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={togglePlay}
              disabled={!audioUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-40"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? "Pause" : "Play"}
            </button>
            <audio
              ref={audioRef}
              onEnded={() => setPlaying(false)}
              src={audioUrl}
              className="hidden"
            />
            {!audioUrl && (
              <p className="text-xs text-muted">Audio playback available after upload is processed.</p>
            )}
            <div className="flex items-center gap-2">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
                <button
                  key={value}
                  onClick={() => handleSpeed(value)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    speed === value
                      ? "border-border-strong bg-gradient-primary text-white"
                      : "border-border text-white hover:border-border-strong"
                  }`}
                >
                  {value}x
                </button>
              ))}
            </div>
            <button
              onClick={markCodeSwitch}
              className="ml-auto text-xs font-semibold uppercase tracking-wider text-white underline underline-offset-4"
            >
              Mark code-switch
            </button>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.15} className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
          Transcript (in your language / dialect)
        </p>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => { setTranscript(e.target.value); setSaved(false); }}
          rows={8}
          className="w-full rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-white placeholder-muted outline-none transition-colors focus:border-border-strong"
          placeholder="Write or correct the transcript in your language here..."
        />
      </AnimatedSection>

      <AnimatedSection delay={0.2} className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
          English translation
        </p>
        <textarea
          value={translation}
          onChange={(e) => { setTranslation(e.target.value); setSaved(false); }}
          rows={6}
          className="w-full rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-white placeholder-muted outline-none transition-colors focus:border-border-strong"
          placeholder="Translate what you said into English here..."
        />
      </AnimatedSection>

      <AnimatedSection delay={0.3} className="mt-6 flex flex-wrap items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save transcript & translation"}
        </button>
        <button
          onClick={() => setFlagged(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-border-strong"
        >
          <Flag size={16} />
          {flagged ? "Flagged" : "Flag for review"}
        </button>
        {saved && <p className="text-sm text-white">Transcript and translation saved. Validator will be notified.</p>}
        {flagged && <p className="text-sm text-yellow-400">Submission flagged for reviewer attention.</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </AnimatedSection>
    </div>
  );
}
