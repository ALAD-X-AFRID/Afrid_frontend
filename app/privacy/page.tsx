"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      body: "When you contribute to AFRID, we collect the data you provide (such as audio, text, or images) as well as the metadata associated with it (e.g., age, dialect, location) and behavioral signals to ensure data quality.",
    },
    {
      title: "2. How We Use Your Data",
      body: "The data collected is strictly used to create diverse, representative, and production-grade datasets for training AI models. It is anonymized to protect your personal identity.",
    },
    {
      title: "3. Data Sharing & Licensing",
      body: "We license these datasets to global AI companies, research institutions, and governments under strict compliance guidelines. We do not sell your direct contact information.",
    },
    {
      title: "4. Consent and Withdrawal",
      body: "Your participation is entirely voluntary. You retain the right to withdraw your consent and request the deletion of your personal account data at any time.",
    },
    {
      title: "5. Security",
      body: "We employ industry-standard encryption and security measures to protect your account information and the data you submit.",
    },
  ];

  return (
    <section className="mx-auto max-w-[800px] px-6 pb-24 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 max-md:p-6"
      >
        <h1 className="text-center text-[clamp(1.8rem,3vw,2.4rem)] font-bold text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          How AFRID handles and protects your data.
        </p>

        <div className="mt-8 max-h-[60vh] space-y-6 overflow-y-auto pr-3">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="mb-2 text-base font-bold text-[#39e0ff]">{s.title}</h2>
              <p className="text-sm leading-relaxed text-white/85">{s.body}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
