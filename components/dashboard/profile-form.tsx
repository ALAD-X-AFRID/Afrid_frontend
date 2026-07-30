"use client";

import { useState, useMemo } from "react";
import { useMetadata, Language } from "@/context/metadata-context";
import { saveProfile } from "@/lib/api";
import ProfileProgress from "@/components/dashboard/profile-progress";
import AnimatedSection from "@/components/ui/animated-section";
import { africanLanguages } from "@/lib/languages";

const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55+"];
const proficiencyLevels = ["beginner", "intermediate", "fluent", "native"];

export default function ProfileForm() {
  const { user, idToken, metadata, setMetadata } = useMetadata();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [revocable, setRevocable] = useState(true);

  const percent = useMemo(() => {
    let score = 0;
    if (metadata.country) score += 20;
    if (metadata.tribe) score += 20;
    if (metadata.age_range) score += 20;
    if (metadata.region) score += 20;
    if (metadata.languages.length > 0) score += 20;
    return score;
  }, [metadata]);

  const addLanguage = () => {
    setMetadata({
      languages: [
        ...metadata.languages,
        { language: "", dialect: "", proficiency_level: "native" },
      ],
    });
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const languages = metadata.languages.map((lang, i) =>
      i === index ? { ...lang, [field]: value } : lang
    );
    setMetadata({ languages });
  };

  const removeLanguage = (index: number) => {
    const languages = metadata.languages.filter((_, i) => i !== index);
    setMetadata({ languages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please sign in first.");
      return;
    }
    if (!consent) {
      setError("You must accept the informed consent agreement.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const uid = user.uid;
      if (idToken) {
        await saveProfile(idToken, {
          uid,
          display_name: user.displayName || "",
          age_range: metadata.age_range,
          gender: "",
          region: metadata.region,
          country: metadata.country,
          tribe: metadata.tribe,
          languages: metadata.languages,
          consent_version: "v1.0",
          revocable_status: revocable,
        });
      }
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedSection className="mx-auto max-w-3xl">
      <div className="mb-10">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Investment Phase
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Build your linguistic profile.
        </h1>
        <p className="mt-4 text-muted">
          This is the daily 5-minute cultural safeguard that makes the platform
          relevant for you and irreplaceable for the future of African AI.
        </p>
      </div>

      <div className="mb-10">
        <ProfileProgress percent={percent} />
      </div>

      {saved ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-white">
            Linguistic Guardian
          </p>
          <p className="mt-2 text-muted">
            Your profile is saved. You can now join paid data sprints.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted">
                Country
              </label>
              <input
                type="text"
                required
                value={metadata.country}
                onChange={(e) => setMetadata({ country: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white placeholder-muted outline-none transition-colors focus:border-border-strong"
                placeholder="Nigeria"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted">
                Region
              </label>
              <input
                type="text"
                required
                value={metadata.region}
                onChange={(e) => setMetadata({ region: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white placeholder-muted outline-none transition-colors focus:border-border-strong"
                placeholder="Lagos State"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted">
                Tribe / Community
              </label>
              <input
                type="text"
                required
                value={metadata.tribe}
                onChange={(e) => setMetadata({ tribe: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white placeholder-muted outline-none transition-colors focus:border-border-strong"
                placeholder="Yoruba"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted">
                Age Range
              </label>
              <select
                required
                value={metadata.age_range}
                onChange={(e) => setMetadata({ age_range: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white outline-none transition-colors focus:border-border-strong"
              >
                <option value="" className="bg-surface">
                  Select range
                </option>
                {ageRanges.map((range) => (
                  <option key={range} value={range} className="bg-surface">
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-muted">
                African Languages & Dialects
              </label>
              <button
                type="button"
                onClick={addLanguage}
                className="text-xs font-semibold text-white underline underline-offset-4"
              >
                Add language
              </button>
            </div>
            <p className="text-[10px] text-muted">
              Type any language or dialect — the dropdown is only a suggestion list. Afrid supports every African language and your own dialect.
            </p>
            <datalist id="african-languages">
              {africanLanguages.map((language) => (
                <option key={language} value={language} />
              ))}
            </datalist>
            {metadata.languages.map((lang, index) => (
              <div key={index} className="grid gap-4 sm:grid-cols-4">
                <input
                  type="text"
                  required
                  list="african-languages"
                  placeholder="Type your language or dialect (e.g. Yoruba, Igbo, your own)"
                  value={lang.language}
                  onChange={(e) => updateLanguage(index, "language", e.target.value)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-white placeholder-muted outline-none transition-colors focus:border-border-strong"
                />
                <input
                  type="text"
                  placeholder="Dialect"
                  value={lang.dialect}
                  onChange={(e) => updateLanguage(index, "dialect", e.target.value)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-white placeholder-muted outline-none transition-colors focus:border-border-strong"
                />
                <select
                  value={lang.proficiency_level}
                  onChange={(e) => updateLanguage(index, "proficiency_level", e.target.value)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-white outline-none transition-colors focus:border-border-strong"
                >
                  {proficiencyLevels.map((level) => (
                    <option key={level} value={level} className="bg-surface">
                      {level}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="text-left text-xs text-muted hover:text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-white">Informed Consent</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              You own your raw voice and data. Afrid licenses only the refined,
              anonymized, production-grade asset. You may request deletion at any
              time and revoke participation without penalty.
            </p>
            <label className="mt-4 flex items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-muted">
                I have read and agree to the Afrid data contributor agreement.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div>
              <p className="text-sm font-semibold text-white">Revocable Participation</p>
              <p className="text-xs text-muted">
                You can request deletion of your audio and metadata at any time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRevocable(!revocable)}
              className={`relative h-6 w-12 rounded-full transition-colors ${
                revocable ? "bg-gradient-primary" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-surface transition-all ${
                  revocable ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !user}
            className="rounded-xl bg-gradient-primary px-8 py-4 text-sm font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      )}
    </AnimatedSection>
  );
}
