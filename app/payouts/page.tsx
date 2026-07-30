"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CreditCard, Lock } from "lucide-react";

export default function PayoutsPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/wallet"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <section className="mx-auto max-w-[800px] px-6 pb-24 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-[clamp(1.8rem,3vw,2.4rem)] font-bold text-white">Connect to Stripe</h1>
        <p className="mt-2 text-sm text-muted">
          AFRID uses Stripe Connect to securely route your hunt rewards directly into your account. Setting up Stripe ensures fast payouts, compliance, and global payment support.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="mb-3 text-lg font-bold text-white">Why Stripe?</h2>
        <ul className="space-y-2 text-sm text-muted">
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">Secure payouts with bank-level encryption.</li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">Automatic currency conversion for international contributors.</li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">Fast settlement once your account is verified.</li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">Built-in fraud protection and compliance support.</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="mb-3 text-lg font-bold text-white">What you need to connect</h2>
        <p className="mb-3 text-sm text-muted">To link your AFRID account, Stripe typically requires:</p>
        <ul className="space-y-2 text-sm text-muted">
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#b27bff]">Legal name or business name</li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#b27bff]">Email address</li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#b27bff]">Bank account or debit card details</li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#b27bff]">Country of residence</li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#b27bff]">Tax or identity verification information</li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          The payout setup is not active yet. This page is prepared so you can connect as soon as the Stripe flow is ready.
        </p>
        <button
          disabled
          className="mt-5 inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-muted opacity-70"
        >
          <Lock size={16} /> Connect Stripe (Locked)
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="mb-3 text-lg font-bold text-white">What happens after connecting</h2>
        <p className="mb-3 text-sm text-muted">Once the Stripe integration is enabled, AFRID will be able to:</p>
        <ul className="space-y-2 text-sm text-muted">
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">Transfer your earned rewards automatically.</li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">Show payout history and upcoming deposits.</li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">Allow you to manage payment preferences securely.</li>
        </ul>
      </motion.div>

      <div className="mt-6 flex items-center justify-between rounded-[24px] border border-[rgba(57, 224, 255,0.14)] bg-[rgba(57, 224, 255,0.06)] p-5">
        <div className="flex items-center gap-3">
          <CreditCard size={20} className="text-[#39e0ff]" />
          <p className="text-sm text-muted">Redirecting to your wallet...</p>
        </div>
        <Link href="/wallet" className="text-sm font-semibold text-[#39e0ff] hover:text-[#b27bff] transition-colors">
          Go to Wallet →
        </Link>
      </div>
    </section>
  );
}
