"use client";

import { useState, useEffect, useCallback } from "react";
import { useMetadata } from "@/context/metadata-context";
import { getEarnings, getPayouts, getConnectStatus, claimPayout } from "@/lib/api";
import type { Earnings, Payout, StripeConnectStatus, PayoutClaimResult } from "@/types";

export function useEarnings() {
  const { idToken } = useMetadata();
  const [earnings, setEarnings] = useState<Earnings>({
    total_earnings: 0,
    available: 0,
    claimed: 0,
    total_minutes: 0,
  });
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [connectStatus, setConnectStatus] = useState<StripeConnectStatus>({
    connected: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!idToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [earningsData, payoutsData, connectData] = await Promise.all([
        getEarnings(idToken),
        getPayouts(idToken),
        getConnectStatus(idToken).catch(() => ({ connected: false })),
      ]);
      setEarnings(earningsData as Earnings);
      setPayouts(payoutsData as Payout[]);
      setConnectStatus(connectData as StripeConnectStatus);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    load();
  }, [load]);

  const claim = useCallback(
    async (amount: number): Promise<PayoutClaimResult> => {
      if (!idToken) throw new Error("Not authenticated");
      const result = await claimPayout(idToken, amount);
      await load();
      return result as PayoutClaimResult;
    },
    [idToken, load]
  );

  return { earnings, payouts, connectStatus, loading, error, reload: load, claim };
}
