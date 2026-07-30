"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMetadata } from "@/context/metadata-context";
import { getTasks, getProfile, getEarnings, getDiscordStatus, getDiscordConnectURL } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowRight, Plus, CheckCircle2, Mic, Wallet, Globe, MessageCircle, CreditCard } from "lucide-react";
import type { Task, UserProfile, Earnings, DiscordStatus } from "@/types";

export default function DataDashboard() {
  const { user, idToken } = useMetadata();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [earnings, setEarnings] = useState<Earnings>({ total_earnings: 0, available: 0, claimed: 0, total_minutes: 0 });
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const tasksData = await getTasks();
        setTasks(tasksData || []);
        if (idToken) {
          const [profileData, earningsData, discordData] = await Promise.all([
            getProfile(idToken),
            getEarnings(idToken),
            getDiscordStatus(idToken).catch(() => null),
          ]);
          setProfile(profileData);
          setEarnings(earningsData || { total_earnings: 0, available: 0, claimed: 0, total_minutes: 0 });
          setDiscordStatus(discordData);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idToken]);

  const name = user?.displayName || user?.email?.split("@")[0] || "Contributor";
  const initial = name[0]?.toUpperCase() || "U";

  const hasProfile = profile && profile.demographics;
  const hasStripe = profile?.stripe_account_status === "verified";
  const discordConnected = discordStatus?.connected ?? false;
  const discordHref = idToken ? getDiscordConnectURL(idToken) : "https://discord.gg/QfDNSdvYw";
  const checklist = [
    { label: discordConnected ? `Discord: ${discordStatus?.discord_username || "Connected"}` : "Join the community", done: discordConnected, href: discordHref, icon: MessageCircle, external: true },
    { label: "Complete your profile", done: !!hasProfile, href: "/profile/setup", icon: Globe },
    { label: "Link your Stripe", done: hasStripe, href: "/wallet", icon: CreditCard },
    { label: "Make your first submission", done: false, href: "/record", icon: Mic },
  ];
  const completed = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-lg font-bold text-white shadow-glow-sm">
            {initial}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Welcome back, {name}</h1>
            <p className="text-sm text-muted">Help us shape the future of AI for Africa.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/wallet"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-card-hover"
          >
            <Wallet size={16} /> ${earnings.available.toFixed(2)}
          </Link>
          <Link
            href="/record"
            className="flex items-center gap-2 rounded-2xl bg-gradient-warm px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105 hover:shadow-glow-lg"
          >
            <Plus size={16} /> Contribute
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border bg-card p-6 shadow-glow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Getting Started</h2>
            <p className="text-xs text-muted">Finish these steps to unlock full payouts.</p>
          </div>
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-white">
            {completed}/4 complete
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {checklist.map((item) => {
            const Icon = item.done ? CheckCircle2 : item.icon;
            const Wrapper = item.external ? "a" : Link;
            return (
              <Wrapper
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors ${item.done ? "border-border bg-surface/50" : "border-border bg-card-hover"}`}
              >
                <Icon size={18} className={item.done ? "text-accent-cyan" : "text-muted"} />
                <div>
                  <p className={`text-xs font-semibold ${item.done ? "text-muted line-through" : "text-white"}`}>{item.label}</p>
                  {item.done ? <p className="text-[10px] text-accent-cyan">Done</p> : <p className="text-[10px] text-muted">Pending</p>}
                </div>
              </Wrapper>
            );
          })}
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all"
            style={{ width: `${(completed / checklist.length) * 100}%` }}
          />
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-glow-sm"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Earn</p>
              <p className="mt-1 text-3xl font-semibold text-white">$3.00</p>
              <p className="text-sm text-muted">Per 30-minute block of validated speech</p>
            </div>
            <Link
              href="/record"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-warm px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105 hover:shadow-glow-lg"
            >
              Start Creating
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-6 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white">$3,000 USD July Sprint</p>
              <span className="rounded-full bg-accent-orange/10 px-2 py-0.5 text-[10px] font-semibold text-accent-orange">LIVE</span>
            </div>
            <p className="mt-1 text-xs text-muted">Contributor milestone: 0/30</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface">
              <div className="h-full w-0 rounded-full bg-gradient-warm" />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>Earned $0</span>
              <span>Next $100 at 3/30</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-glow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Earnings & Quality</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-[10px] text-muted">Total Estimated</p>
              <p className="text-xl font-semibold text-white">${earnings.total_earnings.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-[10px] text-muted">Available</p>
              <p className="text-xl font-semibold text-white">${earnings.available.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-[10px] text-muted">Minutes</p>
              <p className="text-xl font-semibold text-white">{earnings.total_minutes.toFixed(0)}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-[10px] text-muted">Claimed</p>
              <p className="text-xl font-semibold text-white">${earnings.claimed.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl border border-border bg-card p-6 shadow-glow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Available Sprints</h2>
          <span className="text-xs text-muted">{tasks.length} active</span>
        </div>
        {loading ? (
          <p className="text-sm text-muted">Loading sprints...</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted">No active sprints right now.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-accent-violet/10 px-2 py-0.5 text-[10px] font-semibold text-accent-violet">
                    {task.type || "Sprint"}
                  </span>
                  <span className="text-[10px] text-muted">{Math.round((task.status?.current_fill_percentage || 0) * 100)}% filled</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{task.title || "Untitled Sprint"}</h3>
                <p className="mt-1 text-xs text-muted">
                  {task.requirements?.language_target} {task.requirements?.dialect_target && `· ${task.requirements.dialect_target}`}
                </p>
                <p className="text-xs text-muted">{task.requirements?.target_environment} · {task.requirements?.target_duration} min</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">${task.unit_price?.toFixed(2) || "3.00"}</span>
                  <Link href="/record" className="text-xs font-semibold text-accent-cyan hover:underline">
                    Record
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
