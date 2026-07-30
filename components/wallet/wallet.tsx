"use client";

import { useState, useEffect } from "react";
import { useMetadata } from "@/context/metadata-context";
import {
  getEarnings,
  claimPayout,
  getPayouts,
  connectStripe,
  getConnectStatus,
  getLegalStatus,
} from "@/lib/api";
import AnimatedSection from "@/components/ui/animated-section";
import type { Payout, LegalStatus } from "@/types";
import Link from "next/link";

function EarningsChart({ payouts, totalEarnings }: { payouts: Payout[]; totalEarnings: number }) {
  const completed = payouts.filter((p) => p.status === "paid");
  const data = [0, ...completed.map((p) => p.amount || 0)];
  const cumulative: number[] = [];
  let sum = 0;
  for (const v of data) {
    sum += v;
    cumulative.push(sum);
  }
  const maxVal = Math.max(totalEarnings, 1);
  const width = 100;
  const height = 40;
  const points = cumulative.map((v, i) => {
    const x = (i / Math.max(cumulative.length - 1, 1)) * width;
    const y = height - (v / maxVal) * height;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="earningsArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#39e0ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#39e0ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#earningsArea)" />
        <polyline points={points} fill="none" stroke="#39e0ff" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-muted">
        <span>{cumulative.length - 1} payouts</span>
        <span>Total: ${totalEarnings.toFixed(2)}</span>
      </div>
      {cumulative.length <= 1 && (
        <p className="mt-2 text-xs text-muted">No completed payouts yet. Your earnings chart will appear here once payouts are processed.</p>
      )}
    </div>
  );
}

export default function Wallet() {
  const { user, idToken } = useMetadata();
  const [earnings, setEarnings] = useState({
    total_earnings: 0,
    total_minutes: 0,
    claimed: 0,
    available: 0,
  });
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimAmount, setClaimAmount] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [legal, setLegal] = useState<LegalStatus | null>(null);

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    Promise.all([
      getEarnings(idToken),
      getPayouts(idToken),
      getConnectStatus(idToken),
      getLegalStatus(idToken),
    ])
      .then(([e, p, c, l]) => {
        setEarnings(e);
        setPayouts(p);
        setClaimAmount(e.available.toFixed(2));
        setStripeAccountId(c.stripe_account_id || null);
        setLegal(l.legal || null);
      })
      .catch((err) => {
        setMessage(`Failed to load wallet data: ${(err as Error).message}`);
      })
      .finally(() => setLoading(false));
  }, [idToken]);

  const handleConnectStripe = async () => {
    if (!idToken) return;
    setConnectLoading(true);
    setMessage("");
    try {
      const result = await connectStripe(idToken);
      setStripeAccountId(result.account_id);
      window.open(result.onboarding_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!idToken) return;
    const amount = parseFloat(claimAmount);
    if (!amount || amount > earnings.available) {
      setMessage("Invalid claim amount");
      return;
    }
    setClaiming(true);
    setMessage("");
    try {
      await claimPayout(idToken, amount);
      setMessage("Payout request submitted.");
      const [e, p] = await Promise.all([getEarnings(idToken), getPayouts(idToken)]);
      setEarnings(e);
      setPayouts(p);
      setClaimAmount(e.available.toFixed(2));
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setClaiming(false);
    }
  };

  if (!user) {
    return (
      <p className="text-center text-sm text-muted">
        Please{" "}
        <Link href="/" className="text-white underline">
          sign in
        </Link>{" "}
        to view your wallet.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AnimatedSection>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Payouts
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Contributor wallet
        </h1>
        <p className="mt-4 text-muted">
          Claim earnings from validated submissions. Every minute of
          production-grade data is a priced asset.
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="glass-card p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Total earnings</p>
          <p className="mt-2 text-3xl font-bold text-white glow-text-primary">${earnings.total_earnings.toFixed(2)}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(57, 224, 255, 0.25)] bg-gradient-to-br from-[rgba(57, 224, 255, 0.08)] to-[rgba(178, 123, 255, 0.06)] p-6">
          <div className="shimmer-line" />
          <p className="text-xs font-medium uppercase tracking-wider text-[#39e0ff]">Available to claim</p>
          <p className="mt-2 text-4xl font-bold text-white glow-text-primary">${earnings.available.toFixed(2)}</p>
          {earnings.total_earnings > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Claimed</span>
                <span>${(earnings.total_earnings - earnings.available).toFixed(2)} / ${earnings.total_earnings.toFixed(2)}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#39e0ff] to-[#b27bff] transition-all"
                  style={{ width: `${earnings.total_earnings > 0 ? ((earnings.total_earnings - earnings.available) / earnings.total_earnings) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="glass-card p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Validated minutes</p>
          <p className="mt-2 text-3xl font-bold text-white glow-text-secondary">{earnings.total_minutes.toFixed(1)}</p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2} className="mt-10 glass-card p-6">
        <p className="text-sm font-semibold text-white">Claim payout</p>
        {!stripeAccountId ? (
          <div className="mt-4">
            <p className="text-sm text-muted">
              Connect a Stripe account to receive payouts.
            </p>
            <button
              onClick={handleConnectStripe}
              disabled={connectLoading}
              className="btn-glow mt-4 rounded-xl bg-gradient-to-r from-[#39e0ff] to-[#b27bff] px-6 py-3 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57,224,255,0.2)] transition-all hover:shadow-[0_16px_40px_rgba(57,224,255,0.3)] disabled:opacity-60"
            >
              {connectLoading ? "Connecting..." : "Connect Stripe"}
            </button>
          </div>
        ) : !legal?.terms_accepted || !legal?.identity_verified ? (
          <div className="mt-4">
            <p className="text-sm text-muted">
              Complete KYC and accept the contributor terms before claiming payouts.
            </p>
            <Link
              href="/settings/legal"
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-[#39e0ff] to-[#b27bff] px-6 py-3 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57,224,255,0.2)] transition-all hover:shadow-[0_16px_40px_rgba(57,224,255,0.3)]"
            >
              Complete legal / KYC
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex max-w-sm items-center gap-4">
            <input
              type="number"
              step="0.01"
              min={0}
              max={earnings.available}
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              className="premium-input w-full px-4 py-3 text-sm text-white outline-none"
            />
            <button
              onClick={handleClaim}
              disabled={claiming || earnings.available <= 0}
              className="btn-glow rounded-xl bg-gradient-to-r from-[#39e0ff] to-[#b27bff] px-6 py-3 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57,224,255,0.2)] transition-all hover:shadow-[0_16px_40px_rgba(57,224,255,0.3)] disabled:opacity-60"
            >
              {claiming ? "Processing..." : "Claim"}
            </button>
          </div>
        )}
        {message && <p className="mt-4 text-sm text-white">{message}</p>}
      </AnimatedSection>

      <AnimatedSection delay={0.25} className="mt-10 glass-card p-6">
        <p className="text-sm font-semibold text-white">Earnings overview</p>
        <p className="mt-1 text-xs text-muted">Cumulative earnings over time</p>
        <div className="mt-6">
          <EarningsChart payouts={payouts} totalEarnings={earnings.total_earnings} />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.3} className="mt-10">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted">
          Payout history
        </p>
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : payouts.length === 0 ? (
          <p className="text-sm text-muted">No payout requests yet.</p>
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => {
              const statusColor =
                p.status === "paid" ? "text-[#58f5b0] bg-[rgba(88, 245, 176, 0.12)] border-[#58f5b0]/20" :
                p.status === "pending" ? "text-[#ff9f43] bg-[rgba(255, 159, 67, 0.12)] border-[#ff9f43]/20" :
                p.status === "failed" ? "text-[#ff6b6b] bg-[rgba(255, 107, 107, 0.12)] border-[#ff6b6b]/20" :
                "text-muted bg-white/[0.06] border-white/10";
              return (
                <div key={p.id} className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] hover:border-white/[0.1]">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-white">${p.amount?.toFixed(2)}</p>
                    {p.requested_at && (
                      <p className="text-xs text-muted">
                        {new Date(p.requested_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusColor}`}>
                    {p.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </AnimatedSection>
    </div>
  );
}
