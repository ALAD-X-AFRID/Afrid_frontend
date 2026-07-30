"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Save, Loader2, Star, Award, Clock } from "lucide-react";
import { useMetadata } from "@/context/metadata-context";
import { getProfile, getEarnings, saveProfile, getUserStats } from "@/lib/api";
import type { UserProfile, Earnings, LanguageEntry, UserStats } from "@/types";

type Tab = "overview" | "languages" | "settings";

export default function ProfilePage() {
  const { idToken } = useMetadata();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [earnings, setEarnings] = useState<Earnings>({ total_earnings: 0, total_minutes: 0, claimed: 0, available: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    Promise.all([getProfile(idToken), getEarnings(idToken), getUserStats(idToken).catch(() => null)])
      .then(([p, e, s]) => {
        setProfile(p);
        setEarnings(e);
        if (s) setStats(s);
        setEditName(p?.display_name || p?.email?.split("@")[0] || "User");
      })
      .catch((err) => {
        setStatus(`Failed to load profile: ${(err as Error).message}`);
      })
      .finally(() => setLoading(false));
  }, [idToken]);

  const displayName = profile?.display_name || profile?.email?.split("@")[0] || "User";
  const email = profile?.email || "";
  const demographics = profile?.demographics ?? ({} as Partial<import("@/types").Demographics>);
  const languages = profile?.linguistic_profile?.languages || [];
  const gamification = profile?.gamification ?? ({} as Partial<import("@/types").Gamification>);
  const initials = displayName.charAt(0).toUpperCase();

  const contributorLevel = (() => {
    const contributions = gamification.total_contributions || stats?.total_contributions || 0;
    if (contributions >= 100) return { label: "Gold Contributor", color: "#ff9f43", icon: Award };
    if (contributions >= 50) return { label: "Silver Contributor", color: "#b27bff", icon: Award };
    if (contributions >= 10) return { label: "Bronze Contributor", color: "#cd7f32", icon: Star };
    if (contributions >= 1) return { label: "New Contributor", color: "#39e0ff", icon: Star };
    return { label: "Newcomer", color: "#98a2c5", icon: User };
  })();
  const LevelIcon = contributorLevel.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken || !profile) return;
    setSaving(true);
    setStatus("");
    try {
      await saveProfile(idToken, {
        uid: profile.uid,
        display_name: editName,
        age_range: demographics.age_range || "",
        gender: demographics.gender || "",
        region: demographics.region || "",
        country: demographics.country || "",
        tribe: demographics.tribe || "",
        languages: languages,
        consent_version: profile?.legal?.consent_version || "v1",
        revocable_status: profile?.legal?.revocable_status ?? true,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="relative mx-auto max-w-[1120px] px-6 pb-24 pt-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="aurora-blob w-[300px] h-[300px] bg-[#39e0ff] top-[10%] left-[10%]" />
        </div>
        <div className="relative z-10 flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-[1120px] px-6 pb-24 pt-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[400px] h-[400px] bg-[#39e0ff] top-[5%] left-[5%]" />
        <div className="aurora-blob w-[300px] h-[300px] bg-[#b27bff] bottom-[10%] right-[10%]" style={{ animationDelay: "5s" }} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass-card overflow-hidden p-8 max-md:p-6"
      >
        <div className="shimmer-line" />

        {/* Profile Header with Avatar */}
        <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#39e0ff] to-[#b27bff] text-4xl font-bold text-[#03040d] shadow-[0_0_30px_rgba(57,224,255,0.25)] transition-transform hover:scale-105">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-bold text-white">{displayName}</h1>
            <p className="mt-1 text-sm text-muted">{email}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${contributorLevel.color}20`, color: contributorLevel.color, borderColor: `${contributorLevel.color}30` }}>
                <LevelIcon size={12} /> {contributorLevel.label}
              </span>
              {gamification.status_badge && (
                <span className="rounded-full border border-[#b27bff]/20 bg-[rgba(178, 123, 255, 0.12)] px-3 py-1 text-xs font-semibold text-[#b27bff]">
                  {gamification.status_badge}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{gamification.total_contributions || 0}</p>
              <p className="text-xs text-muted">Contributions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#39e0ff] glow-text-primary">${earnings.total_earnings.toFixed(0)}</p>
              <p className="text-xs text-muted">Earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{Math.floor(earnings.total_minutes / 60)}</p>
              <p className="text-xs text-muted">Hours</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-white/[0.06]">
          {([
            { id: "overview" as const, label: "Overview" },
            { id: "languages" as const, label: "Languages" },
            { id: "settings" as const, label: "Settings" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "text-white" : "text-muted hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#39e0ff] to-[#b27bff]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card p-6">
              <h2 className="mb-4 text-lg font-bold text-white">Demographics</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-[#39e0ff]/20">
                  <p className="text-xs text-muted">Country</p>
                  <p className="text-sm font-semibold text-white">{demographics.country || "Not set"}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-[#b27bff]/20">
                  <p className="text-xs text-muted">Tribe / Community</p>
                  <p className="text-sm font-semibold text-white">{demographics.tribe || "Not set"}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-[#39e0ff]/20">
                  <p className="text-xs text-muted">Region</p>
                  <p className="text-sm font-semibold text-white">{demographics.region || "Not set"}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-[#b27bff]/20">
                  <p className="text-xs text-muted">Age range</p>
                  <p className="text-sm font-semibold text-white">{demographics.age_range || "Not set"}</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-6">
              <h2 className="mb-4 text-lg font-bold text-white">Earnings Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
                  <span className="text-sm text-muted">Total Earned</span>
                  <span className="text-sm font-bold text-white">${earnings.total_earnings.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#39e0ff]/20 bg-[#39e0ff]/[0.04] p-3 transition-colors hover:bg-[#39e0ff]/[0.08]">
                  <span className="text-sm text-muted">Available</span>
                  <span className="text-sm font-bold text-[#39e0ff]">${earnings.available.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
                  <span className="text-sm text-muted">Validated Minutes</span>
                  <span className="text-sm font-bold text-white">{earnings.total_minutes.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <Clock size={14} /> Hours Contributed
                  </span>
                  <span className="text-sm font-bold text-white">{Math.floor(earnings.total_minutes / 60)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "languages" && (
          <div className="glass-card p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Languages & Dialects</h2>
            {languages.length === 0 ? (
              <p className="text-sm text-muted">No languages set. Update your profile during signup to add languages.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {languages.map((lang: LanguageEntry, i: number) => (
                  <span
                    key={i}
                    className="rounded-full border border-[rgba(57, 224, 255,0.2)] bg-[rgba(57, 224, 255,0.08)] px-4 py-2 text-sm text-[#39e0ff] transition-all hover:bg-[rgba(57, 224, 255,0.12)] hover:border-[rgba(57, 224, 255,0.3)]"
                  >
                    {lang.language}
                    {lang.dialect ? ` · ${lang.dialect}` : ""}
                    {lang.proficiency_level ? ` (${lang.proficiency_level})` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="glass-card p-6">
            <h2 className="mb-5 text-lg font-bold text-white">Account Settings</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="text-sm text-muted">
                Display name
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="premium-input mt-2 w-full px-4 py-3 text-sm text-white outline-none"
                />
              </label>
              <label className="text-sm text-muted">
                Email address
                <input
                  type="email"
                  readOnly
                  defaultValue={email}
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-muted outline-none"
                />
              </label>
              <div>
                <button type="submit" disabled={saving} className="btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#39e0ff] to-[#b27bff] px-6 py-3 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57,224,255,0.2)] transition-all hover:shadow-[0_16px_40px_rgba(57,224,255,0.3)] disabled:opacity-60">
                  <Save size={16} /> {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
              {status === "success" && <p className="text-sm text-[#58f5b0]">Profile saved.</p>}
              {status === "error" && <p className="text-sm text-[#ff8e8e]">Failed to save profile.</p>}
            </form>
          </div>
        )}
      </motion.div>
    </section>
  );
}
