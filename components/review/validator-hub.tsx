"use client";

import { useState, useEffect, useCallback } from "react";
import { useMetadata } from "@/context/metadata-context";
import {
  getPendingSubmissions,
  applyValidator,
  submitReview,
  getValidatorProfile,
} from "@/lib/api";
import AnimatedSection from "@/components/ui/animated-section";
import type { PendingSubmission } from "@/types";
import Link from "next/link";

export default function ValidatorHub() {
  const { user, idToken, metadata } = useMetadata();
  const [applied, setApplied] = useState(false);
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [selected, setSelected] = useState<PendingSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reputation, setReputation] = useState(0);
  const [stake, setStake] = useState(0);

  const [scores, setScores] = useState({
    accuracy: 4,
    cultural_fit: 4,
    audio_quality: 4,
    code_switch_fidelity: 4,
  });
  const [decision, setDecision] = useState("approve");
  const [comment, setComment] = useState("");
  const [stakeAmount, setStakeAmount] = useState(10);

  const loadData = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    try {
      const [subs, profile] = await Promise.all([
        getPendingSubmissions(idToken),
        getValidatorProfile(idToken),
      ]);
      setSubmissions(subs);
      const v = profile?.validator || {};
      setApplied(v.status === "applied" || v.status === "active");
      setReputation(v.reputation || 0);
      setStake(v.stake || 0);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApply = async () => {
    if (!idToken) return;
    try {
      await applyValidator(idToken, {
        languages: metadata.languages.map((l) => l.language),
        expertise: "Native speaker",
        stake_amount: stakeAmount,
      });
      setApplied(true);
      await loadData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken || !selected) return;
    try {
      await submitReview(idToken, selected.id, {
        ...scores,
        decision,
        comment,
      });
      setSelected(null);
      setComment("");
      await loadData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!user) {
    return (
      <p className="text-center text-sm text-muted">
        Please{" "}
        <Link href="/" className="text-white underline">
          sign in
        </Link>{" "}
        to validate submissions.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <AnimatedSection>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Validation Marketplace
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Human-in-the-loop validation
        </h1>
        <p className="mt-2 text-sm text-muted">
          Reputation: {reputation} · Stake: {stake}
        </p>
        <p className="mt-4 text-muted">
          Review submissions, score quality, and stop synthetic or low-quality
          data before it reaches the dataset.
        </p>
      </AnimatedSection>

      {!applied && (
        <AnimatedSection delay={0.1} className="mt-8">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-white">Validator application</p>
            <p className="mt-2 text-sm text-muted">
              Agree to review blind submissions fairly. Your reputation score is
              based on inter-rater consensus. Disagreeing with the consensus
              slashes your recorded stake.
            </p>
            <div className="mt-4">
              <label className="text-xs font-medium uppercase tracking-wider text-muted">
                Stake amount (demo units)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white outline-none transition-colors focus:border-border-strong"
              />
            </div>
            <button
              onClick={handleApply}
              className="mt-4 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow"
            >
              Apply as validator
            </button>
          </div>
        </AnimatedSection>
      )}

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      <AnimatedSection delay={0.2} className="mt-10">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted">
          Pending submissions
        </p>
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-muted">No pending submissions.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {submissions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selected?.id === s.id
                    ? "border-border-strong bg-card-hover"
                    : "border-border hover:border-border-strong"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {s.recording?.mode || "submission"}
                </p>
                <p className="mt-2 text-sm text-white">
                  {s.provenance?.context_tag || "Unknown context"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {s.duration_seconds || 0}s · code-switching: {s.recording?.code_switching ? "yes" : "no"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  reviews: {(s.reviews || []).length} · score: {s.consensus_score ? s.consensus_score.toFixed(2) : "—"}
                </p>
              </button>
            ))}
          </div>
        )}
      </AnimatedSection>

      {selected && (
        <AnimatedSection className="mt-10 rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Reviewing {selected.id}
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {[
              ["accuracy", "Accuracy"],
              ["cultural_fit", "Cultural Fit"],
              ["audio_quality", "Audio Quality"],
              ["code_switch_fidelity", "Code-Switch Fidelity"],
            ].map(([key, label]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-xs uppercase tracking-wider text-muted">
                  <span>{label}</span>
                  <span>{scores[key as keyof typeof scores]}/5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={scores[key as keyof typeof scores]}
                  onChange={(e) =>
                    setScores({ ...scores, [key]: Number(e.target.value) })
                  }
                  className="w-full accent-accent-violet"
                />
              </div>
            ))}

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
                Decision
              </p>
              <div className="flex gap-3">
                {["approve", "reject", "flag"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDecision(d)}
                    className={`rounded-full border px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                      decision === d
                        ? "border-border-strong bg-gradient-primary text-white"
                        : "border-border text-white hover:border-border-strong"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment"
              rows={3}
              className="w-full rounded-xl border border-border bg-card p-4 text-sm text-white placeholder-muted outline-none transition-colors focus:border-border-strong"
            />

            <button
              type="submit"
              disabled={!applied}
              className="rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-60"
            >
              Submit review
            </button>
            {!applied && (
              <p className="text-xs text-muted">Apply as a validator to submit reviews.</p>
            )}
          </form>
        </AnimatedSection>
      )}
    </div>
  );
}
