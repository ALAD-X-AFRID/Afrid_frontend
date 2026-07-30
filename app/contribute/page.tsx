"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Recorder from "@/components/recording/recorder";
import TranscriptionEditor from "@/components/recording/transcription-editor";
import AfricaLogo from "@/components/landing/africa-logo";

export default function ContributePage() {
  const [recorded, setRecorded] = useState(false);

  return (
    <main className="min-h-screen px-6 pb-24 pt-24">
      <div className="mx-auto max-w-5xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-white">
                <AfricaLogo className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold text-white">Afrid</span>
            </Link>
            <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-white">
              Contributor test playground
            </h1>
            <p className="mt-2 text-muted">
              Record up to 30 seconds of audio and practice transcribing without signing up. This is a public preview for testing.
            </p>
          </div>
          <Link
            href="/login"
            className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-card-hover"
          >
            Sign in for real
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-glow-sm sm:p-8"
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted">
            Recording
          </p>
          <Recorder duration={30} onRecorded={() => setRecorded(true)} />
          {recorded && (
            <p className="mt-4 text-sm text-white">
              Recording captured. Preview the transcription below.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-glow-sm sm:p-8"
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted">
            Transcription
          </p>
          <TranscriptionEditor submissionId="demo-submission" />
        </motion.div>
      </div>
    </main>
  );
}
