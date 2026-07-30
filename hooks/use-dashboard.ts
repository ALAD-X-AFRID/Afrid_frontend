"use client";

import { useState, useEffect, useCallback } from "react";
import { useMetadata } from "@/context/metadata-context";
import { getUserStats, getProfile } from "@/lib/api";
import type { UserStats, UserProfile } from "@/types";

export function useDashboard() {
  const { idToken } = useMetadata();
  const [stats, setStats] = useState<UserStats>({
    accepted: 0,
    pending: 0,
    completed: 0,
    total_minutes: 0,
    total_contributions: 0,
    display_name: "",
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
      const [statsData, profileData] = await Promise.all([
        getUserStats(idToken),
        getProfile(idToken).catch(() => null),
      ]);
      setStats(statsData as UserStats);
      if (profileData) setProfile(profileData as UserProfile);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, profile, loading, error, reload: load };
}
