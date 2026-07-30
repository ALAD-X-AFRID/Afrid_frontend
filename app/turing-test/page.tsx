"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Lock, Unlock, Check, X, Loader2 } from "lucide-react";
import { useMetadata } from "@/context/metadata-context";
import { getTuringTestUnlocked, setTuringTestUnlocked } from "@/lib/firestore";

export default function TuringTestPage() {
  const { user } = useMetadata();
  const [showVideo, setShowVideo] = useState(false);
  const [checks, setChecks] = useState({ watched: false, understood: false, agree: false });
  const [unlocked, setUnlocked] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setUnlockLoading(false);
      return;
    }
    getTuringTestUnlocked(user.uid).then((result) => {
      setUnlocked(result);
      setUnlockLoading(false);
    });
  }, [user?.uid]);

  const allChecked = checks.watched && checks.understood && checks.agree;

  const handleApply = async () => {
    if (!allChecked || !user?.uid) return;
    setUnlocked(true);
    setShowVideo(false);
    await setTuringTestUnlocked(user.uid, true);
  };

  return (
    <section className="mx-auto max-w-[1120px] px-6 pb-24 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-[rgba(57, 224, 255,0.22)] bg-[rgba(18,20,32,0.96)] p-8 max-md:p-6"
      >
        <h2 className="text-[clamp(1.8rem,2.5vw,2.4rem)] font-bold text-white">Mission Brief</h2>
        <p className="mt-2 text-lg text-muted">AI doesn&apos;t understand the real Africa. Join us in securing Africa from rogue AI</p>

        <div className="mt-6 rounded-[18px] border border-[rgba(57, 224, 255,0.16)] p-5">
          <div className="mb-4 flex items-center gap-3 font-bold text-[#39e0ff]">
            <span className="text-xl">🤖</span> Core directives
          </div>
          <ul className="list-disc space-y-1 pl-5 text-[#d8e1ff]">
            <li>Be Natural.</li>
            <li>Keep It Real.</li>
            <li>Stay Human.</li>
            <li>Be Yourself, Not a Robot.</li>
            <li><strong className="text-[#ff4757]">You should have gotten the point now. 😂</strong></li>
          </ul>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 rounded-[32px] border border-[#ff9f43]/30 bg-[rgba(255,159,67,0.05)] p-8 max-md:p-6"
      >
        <h3 className="flex items-center gap-2 text-xl font-bold text-[#ff9f43]">
          <span className="text-xl">🔢</span> Task steps
        </h3>
        <p className="mb-4 mt-2 text-sm font-bold text-[#d8e1ff]">
          (Copy and paste is allowed)<br />
          (Act like you are sending money to yourself)<br />
          (You can input random but human like information, no personal details are recorded!)
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-[#d8e1ff]">
          <li>Type email</li>
          <li>Type password</li>
          <li>Click the eye to confirm password</li>
          <li>Sign in</li>
          <li>Recipient name</li>
          <li>Recipient account</li>
          <li>Transfer amount</li>
          <li>Confirm transfer by SWIPING</li>
          <li>Click Select Bank</li>
          <li>Scroll through the list or type to filter Nigerian banks</li>
          <li>Select a bank and confirm bank selection</li>
          <li>Send to Firestore (Click it once and wait for it to show it’s completed)</li>
          <li>Download telemetry</li>
          <li className="font-bold text-[#39e0ff]">When done send Session ID to group</li>
        </ol>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mt-6 overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-[rgba(11,13,21,0.95)] to-[rgba(24,27,40,0.9)] p-8 max-md:p-6"
      >
        <div className="absolute -right-8 -top-8 h-52 w-52 rounded-full bg-[rgba(57, 224, 255,0.08)] blur-2xl" />
        <div className="absolute -bottom-5 -left-5 h-40 w-40 rounded-full bg-[rgba(178, 123, 255,0.08)] blur-xl" />

        <h2 className="relative z-10 text-2xl font-bold text-[#39e0ff]">The Hunt begins</h2>
        <p className="relative z-10 mt-2 text-muted">
          Enter a sleek AI control room and begin the challenge. This page is the gateway to your first mission.
        </p>

        <div className="relative z-10 mt-6 rounded-[24px] border border-[rgba(57, 224, 255,0.18)] bg-[rgba(245,230,211,0.02)] p-6">
          <h3 className="text-lg font-bold text-white">Defeat &quot;The Turing Test&quot;</h3>
          <p className="mt-2 text-sm text-muted">
            This mission interface launches the Turing Test challenge. Watch the task video first, then launch when ready.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setShowVideo(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57, 224, 255,0.18)]"
            >
              <Play size={16} /> Watch task video
            </button>
            {unlocked ? (
              <Link
                href="/banking-sim"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57, 224, 255,0.18)]"
              >
                <Unlock size={16} /> Launch Hunt
              </Link>
            ) : unlockLoading ? (
              <button
                disabled
                className="inline-flex cursor-wait items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-muted"
              >
                <Loader2 size={16} className="animate-spin" /> Checking...
              </button>
            ) : (
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-muted opacity-60"
              >
                <Lock size={16} /> Launch Hunt
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {showVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowVideo(false);
          }}
        >
          <div className="w-full max-w-2xl rounded-[24px] border border-white/10 bg-[#132824] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#39e0ff]">Task Video</h3>
              <button onClick={() => setShowVideo(false)} className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="aspect-video rounded-xl bg-black/50 flex items-center justify-center text-muted">
              <p className="text-center">Video placeholder: <code className="text-[#39e0ff]">task-video.mp4</code></p>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                { key: "watched", label: "I have watched the entire video" },
                { key: "understood", label: "I understand the task requirements" },
                { key: "agree", label: "I agree to follow the guidelines" },
              ].map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 text-sm text-[#d8e1ff]">
                  <span className={`flex h-5 w-5 items-center justify-center rounded border ${checks[key as keyof typeof checks] ? "border-[#39e0ff] bg-[#39e0ff] text-[#03040d]" : "border-white/20"}`}>
                    {checks[key as keyof typeof checks] && <Check size={12} />}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checks[key as keyof typeof checks]}
                    onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>
            <button
              onClick={handleApply}
              disabled={!allChecked}
              className="mt-5 w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57, 224, 255,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
