"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMetadata } from "@/context/metadata-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LeafOverlay from "@/components/landing/leaf-overlay";

export default function Hero() {
  const { user } = useMetadata();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleJoin = () => {
    router.push("/signup");
  };

  return (
    <section
      id="intelligence"
      className="relative flex min-h-screen flex-col justify-center px-6 pt-24"
    >
      <LeafOverlay className="opacity-20" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-violet" />
          The Foundation of Sovereign Intelligence
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl md:text-8xl"
        >
          Capture the data{" "}
          <span className="bg-gradient-to-r from-accent-violet via-accent-orange to-white bg-clip-text text-transparent">
            the world ignores.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-muted sm:text-lg"
        >
          Afrid turns spontaneous speech, handwritten artifacts, and street-level
          commerce into production-grade AI assets. We are building the data
          supply chain that makes Africa a strategic owner, not a consumer, of
          the next generation of intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          {user ? (
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-primary px-8 py-4 text-sm font-semibold text-white shadow-glow transition-all hover:shadow-glow-lg"
            >
              Go to Dashboard
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <>
              <button
                onClick={handleJoin}
                className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-primary px-8 py-4 text-sm font-semibold text-white shadow-glow transition-all hover:shadow-glow-lg"
              >
                Sign up
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-card-hover"
              >
                Log in
              </Link>
            </>
          )}
        </motion.div>
        <p className="mt-4 text-xs text-muted">
          {user ? "Start contributing in under 15 minutes." : "Create an account with your name, email, and nationality."}
        </p>
      </div>
    </section>
  );
}
