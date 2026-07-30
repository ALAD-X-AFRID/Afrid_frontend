"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Mic, Home, Inbox, CreditCard, User, Clock, DollarSign, TrendingUp, FileText, CheckCircle2 } from "lucide-react";
import { useMetadata } from "@/context/metadata-context";
import { getUserStats, getEarnings } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardSkeleton } from "@/components/ui/skeleton";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const TASKS = [
  {
    id: "turing-test",
    title: "Banking Simulation Challenge",
    description: "Complete a banking simulation to help AI distinguish human behavior from bots.",
    payout: "₦5,000",
    payoutLabel: "per submission",
    estTime: "~10 min",
    difficulty: "Medium",
    icon: Brain,
    color: "#b27bff",
    bgColor: "rgba(178, 123, 255, 0.12)",
    href: "/turing-test",
    status: "available" as const,
  },
  {
    id: "afridialet",
    title: "Voice Recording",
    description: "Record speech in your native language and dialect to build African voice datasets.",
    payout: "$3",
    payoutLabel: "per 30 min",
    estTime: "15-30 min",
    difficulty: "Easy",
    icon: Mic,
    color: "#39e0ff",
    bgColor: "rgba(57, 224, 255, 0.12)",
    href: "/record",
    status: "available" as const,
  },
  {
    id: "transcription",
    title: "Transcription & Validation",
    description: "Transcribe and validate audio clips to ensure dataset quality and accuracy.",
    payout: "$5/hr",
    payoutLabel: "per hour",
    estTime: "Flexible",
    difficulty: "Easy",
    icon: FileText,
    color: "#39e0ff",
    bgColor: "rgba(57, 224, 255, 0.12)",
    href: "/reviewer",
    status: "available" as const,
  },
  {
    id: "validator",
    title: "Data Review",
    description: "Review submitted data for quality, noise, and phonetic consistency.",
    payout: "$5/hr",
    payoutLabel: "per hour",
    estTime: "Flexible",
    difficulty: "Medium",
    icon: CheckCircle2,
    color: "#ff6b6b",
    bgColor: "rgba(255, 107, 107, 0.12)",
    href: "/validator",
    status: "available" as const,
  },
];

export default function DashboardPage() {
  const { idToken, user } = useMetadata();
  const [name, setName] = useState("User");
  const [stats, setStats] = useState({
    accepted: 0,
    pending: 0,
    completed: 0,
    total_minutes: 0,
    total_contributions: 0,
  });
  const [earnings, setEarnings] = useState({ total_earnings: 0, available: 0, total_minutes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    Promise.all([
      getUserStats(idToken).catch(() => null),
      getEarnings(idToken).catch(() => null),
    ]).then(([statsData, earningsData]) => {
      if (statsData) {
        setStats({
          accepted: statsData.accepted || 0,
          pending: statsData.pending || 0,
          completed: statsData.completed || 0,
          total_minutes: statsData.total_minutes || 0,
          total_contributions: statsData.total_contributions || 0,
        });
        if (statsData.display_name) setName(statsData.display_name);
      }
      if (earningsData) {
        setEarnings({
          total_earnings: earningsData.total_earnings || 0,
          available: earningsData.available || 0,
          total_minutes: earningsData.total_minutes || 0,
        });
      }
    }).finally(() => setLoading(false));
  }, [idToken]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <ProtectedRoute>
    <section className="relative mx-auto max-w-[1180px] px-6 pb-24 pt-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob w-[400px] h-[400px] bg-[#39e0ff] top-[10%] left-[5%]" />
        <div className="aurora-blob w-[300px] h-[300px] bg-[#b27bff] bottom-[20%] right-[10%]" style={{ animationDelay: "7s" }} />
      </div>
      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative glass-card p-8 overflow-hidden"
        >
          <div className="shimmer-line" />
          <div className="mb-6">
            <p className="text-sm text-muted">Welcome back, {name}</p>
            <h1 className="text-[clamp(1.8rem,2.5vw,2.4rem)] font-bold text-white">Available Tasks</h1>
            <p className="mt-2 text-muted">Choose a task below and start earning.</p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="grid gap-5 sm:grid-cols-2"
          >
            {TASKS.map((task) => {
              const Icon = task.icon;
              const isAvailable = task.status === "available";
              return (
                <motion.div key={task.id} variants={item}>
                  <div className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-300 ${isAvailable ? "hover:border-[rgba(57, 224, 255,0.2)] hover:bg-white/[0.04] hover:translateY(-2px)" : "opacity-70"}`}>
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `${task.color}15` }} />
                    <div className="relative z-10">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] transition-transform group-hover:scale-110" style={{ backgroundColor: task.bgColor, color: task.color }}>
                          <Icon size={24} />
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[rgba(88, 245, 176, 0.12)] text-[#58f5b0] border border-[#58f5b0]/20">
                          {isAvailable ? "Available" : "Coming Soon"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{task.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{task.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} className="text-[#39e0ff]" />
                          <span className="font-semibold text-[#39e0ff]">{task.payout}</span>
                          <span>{task.payoutLabel}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {task.estTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          {task.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5">
                      <Link
                        href={task.href}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57, 224, 255,0.18)] w-full"
                      >
                        Start Task
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Overview Panel */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col gap-5"
        >
          {/* Available Earnings Hero */}
          <div className="relative overflow-hidden rounded-[28px] border border-[rgba(57, 224, 255, 0.2)] bg-gradient-to-br from-[rgba(57, 224, 255, 0.08)] to-[rgba(178, 123, 255, 0.06)] p-6">
            <div className="shimmer-line" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Available to Claim</p>
            <p className="mt-2 text-3xl font-bold text-white glow-text-primary">${earnings.available.toFixed(2)}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>Total Earned: <span className="font-semibold text-white">${earnings.total_earnings.toFixed(2)}</span></span>
              <Link href="/wallet" className="font-semibold text-[#39e0ff] hover:underline transition-colors">Withdraw →</Link>
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Your Stats</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center transition-colors hover:border-[#39e0ff]/20">
                <p className="text-lg font-bold text-white">{stats.completed}</p>
                <p className="text-xs text-muted">Completed</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center transition-colors hover:border-[#b27bff]/20">
                <p className="text-lg font-bold text-white">{stats.pending}</p>
                <p className="text-xs text-muted">Pending</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center transition-colors hover:border-[#ff6b6b]/20">
                <p className="text-lg font-bold text-white">{Math.floor(stats.total_minutes / 60)}</p>
                <p className="text-xs text-muted">Hours</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="glass-card p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Navigation</p>
            <nav className="flex flex-col gap-2">
              <Link href="/dashboard" className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#39e0ff]/10 to-transparent px-4 py-3 text-sm font-semibold text-white">
                <Home size={18} className="text-[#39e0ff]" /> Home
              </Link>
              <Link href="/submissions" className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted transition-all hover:bg-white/[0.04] hover:text-white">
                <Inbox size={18} className="text-muted group-hover:text-[#b27bff] transition-colors" /> Submissions
              </Link>
              <Link href="/wallet" className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted transition-all hover:bg-white/[0.04] hover:text-white">
                <CreditCard size={18} className="text-muted group-hover:text-[#b27bff] transition-colors" /> Wallet
              </Link>
              <Link href="/profile" className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted transition-all hover:bg-white/[0.04] hover:text-white">
                <User size={18} className="text-muted group-hover:text-[#39e0ff] transition-colors" /> Profile
              </Link>
            </nav>
          </div>
        </motion.aside>
      </div>
    </section>
    </ProtectedRoute>
  );
}
