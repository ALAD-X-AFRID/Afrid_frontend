"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, HandCoins, TrendingUp, Mic, Pen, MapPin, Quote, ArrowRight } from "lucide-react";
import ScrollProgress from "@/components/landing/scroll-progress";
import DataBounties from "@/components/landing/data-bounties";
import PipelineGrid from "@/components/landing/pipeline-grid";
import LanguageMarquee from "@/components/landing/language-marquee";
import MagneticButton from "@/components/landing/magnetic-button";
import TextReveal from "@/components/landing/text-reveal";
import TiltCard from "@/components/landing/tilt-card";
import AnimatedCounter from "@/components/landing/animated-counter";
import DataFlowHero from "@/components/landing/data-flow-hero";
import TelemetryBand from "@/components/landing/telemetry-band";
import AfricaMap from "@/components/landing/africa-map";
import { joinWaitlist } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 24, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } } };

const DATA_TYPES = [
  { icon: Mic, title: "African Speech & Voice", text: "Earn by representing your language. Record short voice notes, read prompts, and teach AI how we communicate.", color: "#39e0ff" },
  { icon: Pen, title: "Handwriting & Text", text: "Turn old notebooks into income. Snap photos of handwritten notes and school papers to earn while building better tools.", color: "#b27bff" },
  { icon: MapPin, title: "Urban Mobility & Street", text: "Turn your daily commute into cash. Share transit routes or snap photos of local markets to help AI understand our streets.", color: "#ff6b6b" },
];

const COMPENSATION = [
  { badge: "Voice Harvest", rate: "$3 / 30 min", color: "#39e0ff", copy: "Submit short, high-fidelity audio sessions paired with tribe, age, and dialect metadata.", list: ["15-30 min sessions", "Metadata boosts payout"] },
  { badge: "Refinery Specialists", rate: "$5 / hour", color: "#b27bff", copy: "QA specialists validate audio for noise, natural code-switching, and phonetic consistency.", list: ["Review ~2 recordings/hour", "Earn extra via peer-review"] },
  { badge: "Infrastructure of Trust", rate: "Transparent", color: "#ff6b6b", copy: "Payments are transparent and only approved after verification and client funding.", list: ["Just-in-time payouts", "Automated + human verification", "Fair compensation for every clip"] },
];

function RevealMask({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "start 30%"] });
  const clipPath = useTransform(scrollYProgress, [0, 1], ["circle(0% at 50% 50%)", "circle(150% at 50% 50%)"]);
  return (
    <motion.div ref={ref} style={{ clipPath }} className={className}>
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"" | "success" | "error" | "api-error">("");
  const [loading, setLoading] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setStatus("error"); return; }
    setLoading(true);
    try {
      console.log("[waitlist] submitting email:", email);
      const res = await joinWaitlist(email);
      console.log("[waitlist] success response:", res);
      setStatus("success"); setEmail("");
    } catch (err) {
      console.error("[waitlist] error:", err);
      setStatus("api-error");
    }
    finally { setLoading(false); }
  };

  return (
    <div className="afrid-shell bg-[#03040d] w-full">
      <ScrollProgress />

      <div className="relative z-10">
        <DataFlowHero />

        {/* LANGUAGE MARQUEE */}
        <LanguageMarquee />

        {/* LIVE TELEMETRY BAND */}
        <TelemetryBand />

        {/* BENTO GRID - THREE PILLARS */}
        <section id="goals" className="mx-auto max-w-5xl px-6 sm:px-8 py-20 sm:py-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} className="mb-12">
            <div className="mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39e0ff] animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#39e0ff]">MISSION_OBJECTIVES</span>
            </div>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-white leading-[1.1] font-display tracking-tight">
              <TextReveal text="Three goals. One continent." />{" "}
              <span className="gradient-text-animated"><TextReveal text="Infinite impact." delay={0.3} /></span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {/* Large card - Secure */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={item} className="md:col-span-2 md:row-span-2">
              <TiltCard className="tactical-card bento-card reticle relative overflow-hidden p-8 h-full min-h-[280px]" intensity={4}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#39e0ff]/[0.06] rounded-full blur-[80px]" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[4px] border border-[#39e0ff]/20 bg-[#39e0ff]/[0.06] text-[#39e0ff]">
                    <Shield size={28} />
                  </div>
                  <TextReveal text="Secure Africa" className="mb-2 text-2xl font-bold text-white font-display tracking-tight" />
                  <p className="text-base leading-relaxed text-[#39e0ff]/70 max-w-md">
                    AI models that detect scams and AI-driven attacks in real time. We are securing Africans from digital dangers by teaching machines to recognize threats before they strike.
                  </p>
                  <div className="mt-auto pt-6 flex gap-6">
                    <div><span className="text-2xl font-bold font-mono tabular-nums text-[#39e0ff]"><AnimatedCounter value={24} suffix="/7" /></span><p className="text-[9px] uppercase tracking-[0.12em] text-[#39e0ff]/50 mt-1 font-mono">Monitoring</p></div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Pay Africans */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={item}>
              <TiltCard className="tactical-card bento-card reticle relative overflow-hidden p-6 h-full" intensity={6}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#b27bff]/[0.06] rounded-full blur-[60px]" />
                <div className="relative z-10">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#b27bff]/20 bg-[#b27bff]/[0.06] text-[#b27bff]">
                    <HandCoins size={22} />
                  </div>
                  <TextReveal text="Pay Africans" className="mb-2 text-lg font-bold text-white font-display tracking-tight" />
                  <p className="text-sm leading-relaxed text-[#39e0ff]/70">Every dataset you build puts money directly in your pocket. Turn your time into real income.</p>
                </div>
              </TiltCard>
            </motion.div>

            {/* Own the Data */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={item}>
              <TiltCard className="tactical-card bento-card reticle relative overflow-hidden p-6 h-full" intensity={6}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b6b]/[0.06] rounded-full blur-[60px]" />
                <div className="relative z-10">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#ff6b6b]/20 bg-[#ff6b6b]/[0.06] text-[#ff6b6b]">
                    <TrendingUp size={22} />
                  </div>
                  <TextReveal text="Own the Data" className="mb-2 text-lg font-bold text-white font-display tracking-tight" />
                  <p className="text-sm leading-relaxed text-[#39e0ff]/70">Reduce raw data export. Africa owns, controls, and profits from its own intelligence.</p>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </section>

        {/* THE DATA STORY + AFRICA MAP */}
        <section id="story" className="mx-auto max-w-5xl px-6 sm:px-8 py-20 sm:py-28">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
              <div className="tactical-card reticle relative overflow-hidden p-8 sm:p-10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b6b]/[0.04] via-transparent to-[#39e0ff]/[0.04]" />
                <div className="relative z-10">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b27bff] animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#b27bff]">SOVEREIGN_INTELLIGENCE</span>
                  </div>
                  <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold text-white leading-tight font-display tracking-tight">
                    <TextReveal text="Africa is not a data source. It is a data owner." />
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-[#39e0ff]/70">
                    For too long, the continent has supplied raw voice, text, and movement while others built the models. AFRID changes the contract: ethical provenance, regional consent, and fair pay.
                  </p>
                  <div className="proverb mt-6">
                    <Quote size={20} className="text-[#ff6b6b]/40 mb-2" />
                    <p className="relative z-10 font-display text-lg italic text-white/90 leading-relaxed">
                      Until the lion learns to write, every story will glorify the hunter.
                    </p>
                    <p className="mt-3 text-sm text-[#39e0ff]/60 font-mono">- Igbo proverb</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Animated Africa Map */}
            <RevealMask>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <AfricaMap />
              </motion.div>
            </RevealMask>
          </div>
        </section>

        {/* REFINERY PIPELINE GRID */}
        <PipelineGrid />

        {/* THE DATA GAP */}
        <section id="why" className="mx-auto max-w-5xl px-6 sm:px-8 py-20 sm:py-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} className="mb-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#ff6b6b]">MISSING_DATA_VECTORS</span>
            </div>
            <h2 className="mx-auto max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] font-bold text-white leading-tight font-display tracking-tight">
              <TextReveal text="Global AI doesn't understand our accents, languages, or daily lives." />
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="grid gap-5 md:grid-cols-3">
            {DATA_TYPES.map((card) => (
              <motion.div key={card.title} variants={item}>
                <TiltCard className="tactical-card bento-card reticle p-6 h-full" intensity={6}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[4px] border" style={{ borderColor: `${card.color}20`, background: `${card.color}08`, color: card.color }}>
                    <card.icon size={24} />
                  </div>
                  <TextReveal text={card.title} className="mb-2 text-lg font-bold text-white font-display tracking-tight" />
                  <p className="text-sm leading-relaxed text-[#39e0ff]/70">{card.text}</p>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* DATA BOUNTIES TERMINAL */}
        <DataBounties />

        {/* TURING TEST - ACTIVE TASK */}
        <section id="turing-infrastructure" className="mx-auto max-w-5xl px-6 sm:px-8 py-20 sm:py-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39e0ff] animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#39e0ff]">ACTIVE_TASK</span>
            </div>
            <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold text-white font-display tracking-tight">
              <TextReveal text='Defeat "The Turing Test"' />
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#39e0ff]/70">
              A research on human interaction under real world conditions. Participate in our banking simulation and help us capture realistic African behavioral signals.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={item}>
            <TiltCard className="tactical-card bento-card reticle p-8 h-full" intensity={5}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-[2px] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] font-mono border border-[#39e0ff]/15 bg-[#39e0ff]/[0.06] text-[#39e0ff]">The Turing Test</span>
                <span className="rounded-[4px] bg-gradient-to-r from-[#39e0ff] to-[#070a18] px-3 py-1.5 text-xs font-bold text-white font-mono">₦5,000 / submission</span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[#39e0ff]/70">A research on human interaction under real world conditions.</p>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">Complete a realistic banking simulation</li>
                <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">Metadata and behavioral signals are captured</li>
                <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">Earn ₦5,000 per successful submission</li>
              </ul>
            </TiltCard>
          </motion.div>
        </section>

        {/* COMPENSATION */}
        <section id="infrastructure" className="mx-auto max-w-5xl px-6 sm:px-8 py-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b27bff] animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#b27bff]">YIELD_STRUCTURE</span>
            </div>
            <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold text-white font-display tracking-tight"><TextReveal text="Reward of the Hunt" /></h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPENSATION.map((card) => (
              <motion.div key={card.badge} variants={item}>
                <TiltCard className="tactical-card bento-card reticle p-6 h-full" intensity={5}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-[2px] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] font-mono" style={{ background: `${card.color}0a`, color: card.color, border: `1px solid ${card.color}15` }}>{card.badge}</span>
                    {card.rate && <span className="rounded-[4px] bg-gradient-to-r from-[#39e0ff] to-[#070a18] px-3 py-1.5 text-xs font-bold text-white font-mono">{card.rate}</span>}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-[#39e0ff]/70">{card.copy}</p>
                  <ul className="space-y-2 text-sm text-white/80">
                    {card.list.map((line) => <li key={line} className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#39e0ff]">{line}</li>)}
                  </ul>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Coming Soon overlay */}
          <div className="relative mt-6 rounded-[18px] border border-[rgba(57, 224, 255,0.16)] bg-[rgba(57, 224, 255,0.04)] p-8 text-center">
            <h3 className="text-xl font-bold text-[#39e0ff]">Coming Soon</h3>
            <p className="mt-2 text-sm text-muted">Reward system launching with our first dataset release.</p>
          </div>
        </section>

        {/* CONTRIBUTORS - VOICES OF THE CONTINENT */}
        <section className="mx-auto max-w-5xl px-6 sm:px-8 py-20 sm:py-28 overflow-hidden">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} className="mb-12 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#ff6b6b]">HUMAN_VECTOR_DATA</span>
            </div>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-white leading-tight font-display tracking-tight">
              <TextReveal text="Voices of the Continent." />
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { role: "Voice Contributor", desc: "Record audio in your native language and get paid per submission.", color: "#39e0ff", coord: "LAT: 6.5244N" },
              { role: "Data Refiner", desc: "Validate and transcribe audio clips to ensure dataset quality.", color: "#b27bff", coord: "LAT: 5.6037N" },
              { role: "Mobility Hunter", desc: "Contribute behavioral data through interactive simulations.", color: "#ff6b6b", coord: "LAT: 1.2921S" },
            ].map((role, i) => (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <TiltCard className="tactical-card reticle p-8 relative overflow-hidden h-full border-l-2" intensity={8} style={{ borderLeftColor: role.color }}>
                  <span className="coord-label absolute top-3 right-3">{role.coord}</span>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-[4px] border border-white/10 bg-white/[0.04] flex items-center justify-center font-bold text-xl text-white font-display">
                      {role.role[0]}
                    </div>
                    <div>
                      <h4 className="text-white font-bold font-display tracking-tight">{role.role}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed mb-6">{role.desc}</p>
                  <div className="mt-auto">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] px-2 py-1 rounded-[2px] bg-white/[0.04] text-[#39e0ff]/60 border border-white/[0.06]">
                      {role.role}
                    </span>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* WAITLIST CTA */}
        <section id="waitlist" className="relative w-full py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#39e0ff]/[0.06] via-transparent to-[#ff6b6b]/[0.06]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#39e0ff]/[0.04] rounded-full blur-[120px] glow-pulse" />
          </div>

          <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
              <div className="mb-4 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39e0ff] animate-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#39e0ff]">EARLY_ACCESS_PROTOCOL</span>
              </div>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-white leading-[1.1] mb-4 font-display tracking-tighter">
                Earn by Representing<br />
                <span className="gradient-text-animated">Your Culture.</span>
              </h2>
              <p className="text-base sm:text-lg text-[#39e0ff]/70 max-w-lg mx-auto mb-8">
                Claim your early access to paid tasks. Turn your everyday actions into income while building the foundation Africa lacks.
              </p>

              <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="h-12 w-full rounded-[4px] border border-white/[0.08] bg-[#0d0f17]/60 px-5 text-sm text-white outline-none transition-all placeholder:text-[#39e0ff]/40 focus:border-[#39e0ff]/40 focus:shadow-[0_0_0_3px_rgba(57, 224, 255,0.08)] font-mono"
                  required
                />
                <button type="submit" disabled={loading} className="btn-primary h-12 w-full sm:w-auto px-8 disabled:opacity-60 whitespace-nowrap" data-cursor-hover>
                  {loading ? "Joining..." : "Join Waitlist"}
                </button>
              </form>

              {status === "success" && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm text-[#39e0ff] font-mono">[SUCCESS] You&apos;ve been added to the waitlist.</motion.p>}
              {status === "error" && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm text-[#ff6b6b] font-mono">[ERROR] Please enter a valid email address.</motion.p>}
              {status === "api-error" && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm text-[#ff6b6b] font-mono">[ERROR] Server unreachable. Please try again later.</motion.p>}
            </motion.div>
          </div>
        </section>

        {/* COMMUNITY */}
        <section id="discord" className="mx-auto max-w-5xl px-6 sm:px-8 pb-20">
          <div className="grid items-center gap-7 md:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
              <div className="mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39e0ff] animate-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#39e0ff]">JOIN_THE_TRIBE</span>
              </div>
              <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold text-white leading-tight font-display tracking-tight">
                <TextReveal text="Connect with the AFRID team and contributors." />
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-[#39e0ff]/70">Join a movement of everyday people earning by representing their culture. Share insights, discover new paid tasks, and shape the future of AI together.</p>
              <MagneticButton href="https://discord.gg/QfDNSdvYw" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-12 items-center justify-center rounded-[4px] border border-white/[0.08] bg-white/[0.02] px-6 text-sm font-bold text-white transition-all hover:border-[#39e0ff]/30 hover:bg-[#39e0ff]/[0.04]">
                Enter Discord <ArrowRight size={16} className="ml-2" />
              </MagneticButton>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <TiltCard className="tactical-card reticle p-7" intensity={10}>
                <div className="mb-6 inline-flex h-9 items-center justify-center rounded-[4px] border border-[#39e0ff]/20 bg-[#39e0ff]/[0.06] px-4 text-sm font-bold text-[#39e0ff] font-mono">Discord</div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "100+", label: "Contributors" },
                    { value: "4", label: "Ways to Earn" },
                    { value: "Active", label: "Community" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex flex-col items-center justify-center rounded-[4px] border border-white/[0.06] bg-white/[0.02] p-3 text-center" data-cursor-hover>
                      <strong className="break-words text-xl font-bold text-white font-mono tabular-nums">{stat.value}</strong>
                      <span className="break-words text-[9px] uppercase tracking-[0.1em] text-[#39e0ff]/50 font-mono">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
