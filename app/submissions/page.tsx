"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, X, ClipboardList, Loader2 } from "lucide-react";
import { useMetadata } from "@/context/metadata-context";
import { getMySubmissions } from "@/lib/api";
import type { Submission } from "@/types";

const statuses = ["All", "pending_review", "transcribed", "validated", "accepted", "rejected", "revision_requested", "flagged"];

const statusColors: Record<string, string> = {
  validated: "bg-[#2E5A45] text-[#A8E6CF] border-[#4A8A68]",
  accepted: "bg-[#2E5A45] text-[#A8E6CF] border-[#4A8A68]",
  rejected: "bg-[#5A2E2E] text-[#FFB4B4] border-[#A85A5A]",
  pending_review: "bg-[#5A4A2E] text-[#FFE4A1] border-[#A88A4A]",
  transcribed: "bg-[#3A4A5A] text-[#A1D6FF] border-[#5A8AA8]",
  revision_requested: "bg-[#4A3E2E] text-[#FFD6A1] border-[#A07A4A]",
  flagged: "bg-[#4A3E2E] text-[#FFD6A1] border-[#A07A4A]",
};

const statusLabels: Record<string, string> = {
  validated: "Validated",
  accepted: "Accepted",
  rejected: "Rejected",
  pending_review: "Pending Review",
  transcribed: "Transcribed",
  revision_requested: "Changes Requested",
  flagged: "Flagged",
};

const UNIT_PRICE_PER_MINUTE = 0.50;

function StatusBadge({ status }: { status: string }) {
  const style = statusColors[status] || "bg-white/5 text-muted border-white/10";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
      {statusLabels[status] || status}
    </span>
  );
}

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  if (typeof ts === "string") return ts;
  if (typeof ts === "object" && ts !== null && "_seconds" in ts) {
    const obj = ts as { _seconds: number };
    return new Date(obj._seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  if (ts instanceof Date) return ts.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return "—";
}

function EmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(57, 224, 255,0.12)] text-[#39e0ff]">
        <ClipboardList size={32} />
      </div>
      <h3 className="text-lg font-bold text-white">No submissions yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Record audio in your language and submit it to see your contribution history here.
      </p>
      {onClear ? (
        <button
          onClick={onClear}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(245,230,211,0.12)] bg-white/5 px-4 py-2 text-sm text-[#F5E6D3] transition-colors hover:bg-white/10"
        >
          <X size={14} /> Clear filters
        </button>
      ) : (
        <Link
          href="/record"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#39e0ff] to-[#b27bff] px-5 py-2 text-sm font-bold text-[#03040d] shadow-[0_8px_24px_rgba(57,224,255,0.2)] transition-all hover:shadow-[0_12px_32px_rgba(57,224,255,0.3)]"
        >
          Start recording
        </Link>
      )}
    </motion.div>
  );
}

export default function SubmissionsPage() {
  const { idToken } = useMetadata();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const perPage = 5;

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    getMySubmissions(idToken)
      .then((data) => setSubmissions(data))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [idToken]);

  const filtered = useMemo(() => {
    return submissions.filter((row) => {
      const provId = row.provenance?.provenance_id || row.id || "";
      const taskId = row.task_id || "";
      const matchesQuery =
        provId.toLowerCase().includes(query.toLowerCase()) ||
        taskId.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = filter === "All" || row.status === filter;
      return matchesQuery && matchesStatus;
    });
  }, [submissions, query, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const hasFilters = query || filter !== "All";

  const clearFilters = () => {
    setQuery("");
    setFilter("All");
    setPage(1);
  };

  return (
    <section className="relative mx-auto max-w-[1200px] px-6 pb-24 pt-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[350px] h-[350px] bg-[#39e0ff] top-[5%] left-[5%]" />
        <div className="aurora-blob w-[250px] h-[250px] bg-[#b27bff] bottom-[10%] right-[10%]" style={{ animationDelay: "6s" }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <h1 className="text-[clamp(1.8rem,2.5vw,2.4rem)] font-bold text-white">Submissions</h1>
        <p className="mt-2 text-muted">Track your recordings, review status, and contribution history.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 glass-card mt-6 overflow-hidden p-6"
      >
        <div className="shimmer-line" />

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by provenance ID or task..."
              className="premium-input w-full py-3 pl-10 pr-4 text-sm text-white outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((s) => {
              const active = filter === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setFilter(s);
                    setPage(1);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#39e0ff] to-[#b27bff] text-[#03040d] shadow-[0_8px_24px_rgba(57, 224, 255,0.18)]"
                      : "border border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:border-[rgba(57, 224, 255,0.25)]"
                  }`}
                >
                  {s === "All" ? "All" : statusLabels[s] || s}
                </button>
              );
            })}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/[0.04]"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 glass-strong">
                <tr className="border-b border-white/[0.08] text-muted">
                  <th className="py-3 pl-4 font-semibold">Provenance ID</th>
                  <th className="py-3 font-semibold">Language(s)</th>
                  <th className="py-3 font-semibold">Duration</th>
                  <th className="py-3 font-semibold">Est. Earn</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold">Uploaded</th>
                  <th className="py-3 pr-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 size={24} className="mx-auto animate-spin text-muted" />
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="bg-transparent">
                      <EmptyState onClear={hasFilters ? clearFilters : undefined} />
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => {
                    const provId = row.provenance?.provenance_id || row.id || "—";
                    const languages = (row.languages || []).map((l: { language: string }) => l.language || "").filter(Boolean).join(", ") || "—";
                    const durationSec = row.duration_seconds || 0;
                    const durationStr = durationSec > 0 ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s` : "—";
                    const estEarn = durationSec > 0 ? `$${((durationSec / 60) * UNIT_PRICE_PER_MINUTE).toFixed(2)}` : "—";
                    const needsTranscription = row.status === "pending_review" || (!row.transcription?.transcript_refined && !row.transcription?.transcript_raw);
                    const needsRevision = row.status === "revision_requested";
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-white/[0.04] transition-colors duration-200 hover:bg-white/[0.03]"
                      >
                        <td className="py-4 pl-4">
                          <div className="font-mono text-xs text-white">{provId}</div>
                          {row.task_id && <div className="mt-0.5 text-xs text-muted">Task: {row.task_id}</div>}
                          {needsRevision && row.reviewer_comment && (
                            <div className="mt-2 max-w-xs rounded-lg border border-[#FFD6A1]/20 bg-[#4A3E2E]/30 px-2.5 py-1.5 text-xs text-[#FFD6A1]">
                              <span className="font-semibold">Reviewer feedback:</span> {row.reviewer_comment}
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-white/90">{languages}</td>
                        <td className="py-4 text-muted">{durationStr}</td>
                        <td className="py-4 text-[#58f5b0] font-semibold">{estEarn}</td>
                        <td className="py-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="py-4 text-muted">{formatDate(row.uploaded_at)}</td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-col gap-1.5">
                            <Link
                              href={`/transcribe/${row.id}`}
                              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white transition-all hover:bg-white/[0.06] hover:border-[#39e0ff]/30"
                            >
                              {needsRevision ? "Edit & Resubmit" : needsTranscription ? "Transcribe" : "View"}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length > 0 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-muted">
              Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length} submissions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
