"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, XCircle, RefreshCw, Loader2, Play, Pause } from "lucide-react";
import { useMetadata } from "@/context/metadata-context";
import { applyReviewer, getReviewerProfile, getReviewerSubmissions, finalizeReview, getReviewerAudioURL } from "@/lib/api";
import type { ReviewerSubmission } from "@/types";
import { africanLanguages } from "@/lib/languages";

const statusFilters = [
  { value: "transcribed", label: "Awaiting Review" },
  { value: "pending_review", label: "Pending Review" },
  { value: "validated", label: "Validated" },
  { value: "rejected", label: "Rejected" },
  { value: "revision_requested", label: "Changes Requested" },
];

export default function ReviewerHub() {
  const { user, idToken } = useMetadata();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<ReviewerSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [languageFilter, setLanguageFilter] = useState("");
  const [comments, setComments] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadProfile = useCallback(async () => {
    if (!idToken) return;
    try {
      const data = await getReviewerProfile(idToken);
      setIsActive(!!data.is_active);
    } catch {
      setIsActive(false);
    }
  }, [idToken]);

  const loadSubmissions = useCallback(async () => {
    if (!idToken || !isActive) return;
    setLoading(true);
    setError("");
    try {
      const filters: Record<string, string> = { status: statusFilter };
      if (languageFilter) filters.language = languageFilter;
      const data = await getReviewerSubmissions(idToken, filters);
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [idToken, isActive, statusFilter, languageFilter]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleApply = async () => {
    if (!idToken) return;
    try {
      setError("");
      await applyReviewer(idToken);
      setIsActive(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDecision = async (id: string, decision: "accept" | "reject" | "request_changes" | "include" | "exclude") => {
    if (!idToken) return;
    setActionLoading({ ...actionLoading, [id]: true });
    try {
      setError("");
      await finalizeReview(idToken, id, decision, comments[id] || "");
      await loadSubmissions();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading({ ...actionLoading, [id]: false });
    }
  };

  const handlePlayAudio = async (subId: string) => {
    if (!idToken) return;
    if (playingId === subId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioUrls[subId]) {
      if (audioRef.current) {
        audioRef.current.src = audioUrls[subId];
        audioRef.current.play();
        setPlayingId(subId);
      }
      return;
    }
    try {
      const url = await getReviewerAudioURL(idToken, subId);
      setAudioUrls({ ...audioUrls, [subId]: url });
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
      } else {
        audioRef.current.src = url;
      }
      audioRef.current.onended = () => setPlayingId(null);
      audioRef.current.play();
      setPlayingId(subId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!user) {
    return <p className="text-sm text-muted">Sign in to access reviewer tools.</p>;
  }

  if (!isActive) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-white">Reviewer / Admin Role</p>
        <p className="mt-2 text-sm text-muted">
          Reviewers review each submission — accept, reject, or request changes. Apply below to get started.
        </p>
        <button
          onClick={handleApply}
          className="mt-6 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow"
        >
          Apply as Reviewer
        </button>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">Reviewer / Admin Hub</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Review submissions
          </h1>
          <p className="mt-2 text-sm text-muted">
            Listen to audio, read transcript & translation, then accept, reject, or request changes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-white outline-none transition-colors focus:border-border-strong"
          >
            {statusFilters.map((s) => (
              <option key={s.value} value={s.value} className="bg-surface">{s.label}</option>
            ))}
          </select>
          <input
            type="text"
            list="reviewer-languages"
            placeholder="Filter by language"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-white placeholder-muted outline-none transition-colors focus:border-border-strong"
          />
          <datalist id="reviewer-languages">
            {africanLanguages.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" /> Loading submissions...
        </div>
      )}

      <div className="grid gap-4">
        {submissions.map((sub) => {
          const languages = (sub.languages || []).map((l: { language: string }) => l.language || "").filter(Boolean).join(", ");
          const transcription = sub.transcription || {};
          const hasTranscript = transcription.transcript_refined || transcription.transcript_raw;
          const hasTranslation = transcription.translation_english;
          const isExpanded = expanded[sub.id];
          const isLoading = actionLoading[sub.id];

          return (
            <div key={sub.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                    {sub.provenance?.provenance_id || sub.id}
                  </p>
                  <p className="mt-1 text-sm text-white">
                    Score: {sub.consensus_score?.toFixed(2) ?? "—"} · Decision: {sub.consensus_decision ?? "—"} · Reviews: {sub.review_count}
                  </p>
                  <p className="text-xs text-muted">
                    {languages} · {sub.duration_seconds ? `${Math.floor(sub.duration_seconds / 60)}m ${sub.duration_seconds % 60}s` : "—"} · Status: {sub.status}
                  </p>
                </div>
                <button
                  onClick={() => setExpanded({ ...expanded, [sub.id]: !isExpanded })}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-white transition-colors hover:border-border-strong"
                >
                  {isExpanded ? "Collapse" : "Review details"}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
                      Audio playback
                    </p>
                    <button
                      onClick={() => handlePlayAudio(sub.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-border-strong"
                    >
                      {playingId === sub.id ? <Pause size={14} /> : <Play size={14} />}
                      {playingId === sub.id ? "Pause" : "Play audio"}
                    </button>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
                      Transcript ({languages || "original language"})
                    </p>
                    <div className="rounded-lg border border-border bg-surface p-3 text-sm text-white max-h-32 overflow-auto">
                      {hasTranscript ? (transcription.transcript_refined || transcription.transcript_raw) : "No transcript provided."}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
                      English translation
                    </p>
                    <div className="rounded-lg border border-border bg-surface p-3 text-sm text-white max-h-32 overflow-auto">
                      {hasTranslation ? transcription.translation_english : "No translation provided."}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Review comment (optional for accept, required for changes/reject)"
                    value={comments[sub.id] || ""}
                    onChange={(e) => setComments({ ...comments, [sub.id]: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white placeholder-muted outline-none transition-colors focus:border-border-strong"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleDecision(sub.id, "accept")}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-xs font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-60"
                    >
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecision(sub.id, "request_changes")}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-xl border border-[rgba(178, 123, 255,0.3)] bg-[rgba(178, 123, 255,0.08)] px-4 py-2 text-xs font-semibold text-[#b27bff] transition-colors hover:bg-[rgba(178, 123, 255,0.15)] disabled:opacity-60"
                    >
                      <RefreshCw size={14} />
                      Request changes
                    </button>
                    <button
                      onClick={() => handleDecision(sub.id, "reject")}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-xl border border-[rgba(255,100,100,0.3)] bg-[rgba(255,100,100,0.08)] px-4 py-2 text-xs font-semibold text-[#FF6464] transition-colors hover:bg-[rgba(255,100,100,0.15)] disabled:opacity-60"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && submissions.length === 0 && (
          <p className="text-sm text-muted">No submissions match the current filters.</p>
        )}
      </div>
    </div>
  );
}
