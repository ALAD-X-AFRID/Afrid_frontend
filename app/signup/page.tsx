"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Wallet, Globe, Loader2, Eye, EyeOff, X, Search, Check } from "lucide-react";
import { useAuth } from "@/context/metadata-context";
import { useToast } from "@/components/ui/toast";
import type { AuthError } from "firebase/auth";
import { africanLanguages } from "@/lib/languages";

const proficiencyLevels = ["Native", "Fluent", "Intermediate", "Basic"];

const africanCountries = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo", "Côte d'Ivoire",
  "Djibouti", "DR Congo", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini",
  "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya",
  "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania",
  "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda",
  "São Tomé and Príncipe", "Senegal", "Seychelles", "Sierra Leone", "Somalia",
  "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda",
  "Zambia", "Zimbabwe",
];

const features = [
  { icon: Mic, title: "Contribute voice data", desc: "Record speech in your language and dialect." },
  { icon: Wallet, title: "Earn per submission", desc: "Get paid transparently for validated data." },
  { icon: Globe, title: "Own the future", desc: "Help build Africa’s sovereign AI data layer." },
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function getAuthErrorMessage(err: AuthError): string {
  switch (err.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed. Please try again.";
    default:
      return err.message || "An error occurred during sign up.";
  }
}

export default function SignupPage() {
  const router = useRouter();
  const { user, signUpWithEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    country: "",
    ageRange: "",
    occupation: "",
  });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedLanguages, setSelectedLanguages] = useState<Array<{ language: string; dialect: string; proficiency_level: string }>>([]);
  const [langInput, setLangInput] = useState("");
  const [langProficiency, setLangProficiency] = useState("Native");
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const addLanguage = () => {
    if (!langInput.trim()) return;
    if (selectedLanguages.some((l) => l.language.toLowerCase() === langInput.trim().toLowerCase())) return;
    setSelectedLanguages([...selectedLanguages, { language: langInput.trim(), dialect: "", proficiency_level: langProficiency }]);
    setLangInput("");
    setShowLangDropdown(false);
  };

  const removeLanguage = (lang: string) => {
    setSelectedLanguages(selectedLanguages.filter((l) => l.language !== lang));
  };

  const filteredLangs = africanLanguages.filter(
    (l) => l.toLowerCase().includes(langInput.toLowerCase()) && !selectedLanguages.some((s) => s.language.toLowerCase() === l.toLowerCase())
  );

  useEffect(() => {
    if (user) {
      toast("Account created successfully!", "success");
      router.push("/dashboard");
    }
  }, [user, router, toast]);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const passwordStrength = (() => {
    const pw = form.password;
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: "Very weak", color: "#ff6b6b" },
      { label: "Weak", color: "#ff6b6b" },
      { label: "Fair", color: "#ff9f43" },
      { label: "Good", color: "#39e0ff" },
      { label: "Strong", color: "#58f5b0" },
      { label: "Very strong", color: "#58f5b0" },
    ];
    return { score, ...levels[score] };
  })();

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = getAuthErrorMessage(err as AuthError);
      setError(msg);
      toast(msg, "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      toast("Passwords do not match.", "error");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      toast("Password must be at least 6 characters.", "error");
      return;
    }
    if (!consent) {
      setError("You must agree to the behavioral data consent to create an account.");
      toast("You must agree to the behavioral data consent to create an account.", "error");
      return;
    }

    setLoading(true);
    try {
      const displayName = `${form.firstname} ${form.lastname}`.trim();
      await signUpWithEmail(form.email, form.password, displayName, {
        uid: "",
        display_name: displayName,
        firstname: form.firstname,
        lastname: form.lastname,
        username: form.username,
        phone: form.phone,
        email: form.email,
        country: form.country,
        age_range: form.ageRange,
        occupation_institution: form.occupation,
        behavioral_data_consent: consent ? "yes" : "no",
        consent_version: "v1",
        revocable_status: true,
        languages: selectedLanguages,
      });
    } catch (err) {
      const msg = getAuthErrorMessage(err as AuthError);
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-screen pt-14 lg:grid-cols-2 overflow-hidden">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-surface p-10 lg:flex">
        <div className="absolute inset-0 pointer-events-none">
          <div className="aurora-blob w-[400px] h-[400px] bg-[#b27bff] top-[10%] left-[10%]" />
          <div className="aurora-blob w-[300px] h-[300px] bg-[#39e0ff] bottom-[20%] right-[15%]" style={{ animationDelay: "5s" }} />
          <div className="aurora-blob w-[200px] h-[200px] bg-[#ff6b6b] top-[50%] left-[40%]" style={{ animationDelay: "10s" }} />
        </div>
        <div className="absolute inset-0 bg-mesh opacity-40" />
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
            Join AFRID
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Record, validate, and review language data while keeping Africa at the center of the AI revolution.
          </p>
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="mt-10 space-y-3"
          >
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={item}
                className="group flex items-start gap-4 rounded-2xl glass-card p-4 transition-all hover:translate-x-1"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#39e0ff]/20 to-[#b27bff]/20 border border-white/10">
                  <Icon size={18} className="text-[#39e0ff]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="relative z-10 text-xs text-muted">
          © {new Date().getFullYear()} Afrid. All rights reserved.
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative flex flex-col items-center justify-center px-6 py-10 lg:px-12 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="aurora-blob w-[300px] h-[300px] bg-[#b27bff] top-[20%] right-[10%]" />
        </div>
        <div className="relative z-10 w-full max-w-md glass-card p-8 sm:p-10">
          <div className="shimmer-line" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Join AFRID</h1>
          <p className="mt-2 text-sm text-muted">Start your journey in Africa&apos;s data revolution.</p>

          {error && (
            <div className="mt-4 rounded-xl border border-[#ff6b6b]/20 bg-[#ff6b6b]/[0.06] px-4 py-3 text-sm text-[#ff6b6b]">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogle}
              className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {googleLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              Continue with Google
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[10px] uppercase tracking-wider text-muted">or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="First name"
                value={form.firstname}
                onChange={(e) => update("firstname", e.target.value)}
                className="premium-input w-full px-4 py-3 text-sm text-white placeholder-muted outline-none"
              />
              <input
                type="text"
                required
                placeholder="Last name"
                value={form.lastname}
                onChange={(e) => update("lastname", e.target.value)}
                className="premium-input w-full px-4 py-3 text-sm text-white placeholder-muted outline-none"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Username"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              className="premium-input w-full px-4 py-3 text-sm text-white placeholder-muted outline-none"
            />
            <input
              type="tel"
              required
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="premium-input w-full px-4 py-3 text-sm text-white placeholder-muted outline-none"
            />
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="premium-input w-full px-4 py-3 text-sm text-white placeholder-muted outline-none"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="premium-input w-full px-4 py-3 pr-11 text-sm text-white placeholder-muted outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="flex items-center gap-2">
                <div className="flex h-1.5 flex-1 gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-colors"
                      style={{ backgroundColor: i < passwordStrength.score ? passwordStrength.color : "rgba(255,255,255,0.08)" }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
              </div>
            )}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Confirm password"
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                className="premium-input w-full px-4 py-3 pr-11 text-sm text-white placeholder-muted outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                aria-label="Toggle password visibility"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.confirm && form.password !== form.confirm && (
              <p className="text-xs text-[#ff6b6b]">Passwords do not match</p>
            )}
            <input
              type="text"
              required
              list="african-countries"
              placeholder="Nationality / Country"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              className="premium-input w-full px-4 py-3 text-sm text-white placeholder-muted outline-none"
            />
            <datalist id="african-countries">
              {africanCountries.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <select
              required
              value={form.ageRange}
              onChange={(e) => update("ageRange", e.target.value)}
              className="premium-input w-full px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">Select your age range</option>
              <option value="under-18">Under 18</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-54">45-54</option>
              <option value="55-64">55-64</option>
              <option value="65-plus">65+</option>
            </select>
            <input
              type="text"
              required
              placeholder="Occupation/Institution (Student, teacher, university...)"
              value={form.occupation}
              onChange={(e) => update("occupation", e.target.value)}
              className="premium-input w-full px-4 py-3 text-sm text-white placeholder-muted outline-none"
            />
            <div className="relative">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Languages you speak</p>
              {selectedLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedLanguages.map((l) => (
                    <span key={l.language} className="inline-flex items-center gap-2 rounded-lg border border-[#39e0ff]/20 bg-[#39e0ff]/[0.08] px-3 py-1.5 text-xs font-medium text-[#39e0ff]">
                      {l.language}
                      <span className="text-[#39e0ff]/40">·</span>
                      <span className="text-[#39e0ff]/70 capitalize">{l.proficiency_level.toLowerCase()}</span>
                      <button type="button" onClick={() => removeLanguage(l.language)} className="ml-0.5 text-[#39e0ff]/50 transition-colors hover:text-[#ff6b6b]">
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="relative">
                    <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      placeholder="Search 200+ languages..."
                      value={langInput}
                      onChange={(e) => { setLangInput(e.target.value); setShowLangDropdown(true); }}
                      onFocus={() => setShowLangDropdown(true)}
                      onBlur={() => setTimeout(() => setShowLangDropdown(false), 200)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLanguage(); } }}
                      className="premium-input w-full py-3 pl-10 pr-4 text-sm text-white placeholder-muted outline-none"
                    />
                  </div>
                  {showLangDropdown && filteredLangs.length > 0 && (
                    <div className="absolute z-30 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-white/[0.08] bg-[#0d0f17] shadow-2xl shadow-black/40">
                      {filteredLangs.slice(0, 12).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelectedLanguages([...selectedLanguages, { language: lang, dialect: "", proficiency_level: langProficiency }]);
                            setLangInput("");
                            setShowLangDropdown(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-[#39e0ff]/[0.06] hover:text-white"
                        >
                          {lang}
                          <Check size={14} className="opacity-0 text-[#39e0ff] group-hover:opacity-100" />
                        </button>
                      ))}
                      {filteredLangs.length > 12 && (
                        <div className="px-4 py-2 text-center text-xs text-muted/60">
                          +{filteredLangs.length - 12} more — keep typing to narrow down
                        </div>
                      )}
                    </div>
                  )}
                  {showLangDropdown && langInput && filteredLangs.length === 0 && (
                    <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#0d0f17] px-4 py-3 text-sm text-muted shadow-2xl">
                      No match found. Press <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-white/70">Enter</kbd> to add &ldquo;{langInput}&rdquo; as a custom language.
                    </div>
                  )}
                </div>
                <select
                  value={langProficiency}
                  onChange={(e) => setLangProficiency(e.target.value)}
                  className="premium-input rounded-xl px-3 py-3 text-sm text-white outline-none"
                >
                  {proficiencyLevels.map((p) => (
                    <option key={p} value={p} className="bg-[#0d0f17]">{p}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="rounded-xl bg-gradient-to-r from-[#39e0ff]/20 to-[#b27bff]/20 px-5 py-3 text-sm font-semibold text-white transition-all hover:from-[#39e0ff]/30 hover:to-[#b27bff]/30"
                >
                  Add
                </button>
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-3 text-xs text-muted">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/20 accent-[#39e0ff]"
              />
              <span>I agree to securely share my anonymized daily experiences to help build AI that truly understands and represents our culture.</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#39e0ff] to-[#b27bff] py-3 text-sm font-bold text-[#03040d] shadow-[0_12px_30px_rgba(57,224,255,0.2)] transition-all hover:shadow-[0_16px_40px_rgba(57,224,255,0.3)] disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#39e0ff] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
