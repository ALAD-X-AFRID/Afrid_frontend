"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMetadata } from "@/context/metadata-context";
import { submitTuringTestPayout } from "@/lib/api";

export default function TuringTestPayoutsPage() {
  const { idToken } = useMetadata();
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountNumberError, setAccountNumberError] = useState("");
  const [bankName, setBankName] = useState("");

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(value);
    if (value.length > 0 && value.length !== 10) {
      setAccountNumberError("Account number must be exactly 10 digits.");
    } else {
      setAccountNumberError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken) {
      setStatus("error");
      return;
    }
    if (accountNumber.length !== 10) {
      setAccountNumberError("Account number must be exactly 10 digits.");
      return;
    }
    setSaving(true);
    setStatus("");
    try {
      await submitTuringTestPayout(idToken, {
        account_holder: accountHolder,
        account_number: accountNumber,
        bank_name: bankName,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1120px] px-6 pb-24 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-[rgba(57, 224, 255,0.2)] bg-[rgba(20,22,34,0.95)] p-8 max-md:p-6"
      >
        <h1 className="text-[clamp(1.8rem,2.5vw,2.4rem)] font-bold text-white">Payout Details</h1>
        <p className="mt-2 text-muted">
          Enter the account information you want AFRID to use for Turing Test rewards. This payout form is specific to the Turing Test hunt.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <label className="text-sm text-muted">
            Account holder name
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Jane Doe"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0f17]/60 px-4 py-3.5 text-sm text-white outline-none focus:border-[rgba(57, 224, 255,0.4)]"
            />
          </label>
          <label className="text-sm text-muted">
            Account number
            <input
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={handleAccountNumberChange}
              placeholder="0123456789"
              required
              maxLength={10}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0f17]/60 px-4 py-3.5 text-sm text-white outline-none focus:border-[rgba(57, 224, 255,0.4)]"
            />
            {accountNumberError && (
              <p className="mt-1 text-xs text-[#ff8e8e]">{accountNumberError}</p>
            )}
          </label>
          <label className="text-sm text-muted">
            Bank name
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Example Bank"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d0f17]/60 px-4 py-3.5 text-sm text-white outline-none focus:border-[rgba(57, 224, 255,0.4)]"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full rounded-xl bg-gradient-primary py-4 text-base font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57, 224, 255,0.18)] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save payout details"}
          </button>
          {status === "success" && (
            <p className="text-sm text-[#58f5b0]">Payout details saved successfully.</p>
          )}
          {status === "error" && (
            <p className="text-sm text-[#ff8e8e]">Failed to save payout details. Please try again.</p>
          )}
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 rounded-[28px] border border-[rgba(57, 224, 255,0.12)] bg-[rgba(16,18,30,0.96)] p-8 max-md:p-6"
      >
        <h2 className="text-xl font-bold text-white">Payout workflow</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
          <li>AFRID will use these details when Turing Test rewards are approved.</li>
          <li>Only the bank name and payout name are required right now.</li>
          <li>Bank account details are handled securely via Stripe Connect.</li>
        </ul>
        <p className="mt-6 text-sm text-muted">
          This section is built specifically for the hunt payout flow rather than general platform payout routing.
        </p>
      </motion.div>
    </section>
  );
}
