"use client";

import { useState, useEffect } from "react";
import { useMetadata } from "@/context/metadata-context";
import { getLegalStatus, updateLegal, uploadTaxForm } from "@/lib/api";
import AnimatedSection from "@/components/ui/animated-section";
import type { LegalStatus } from "@/types";
import Link from "next/link";

export default function LegalSettings() {
  const { user, idToken } = useMetadata();
  const [legal, setLegal] = useState<Partial<LegalStatus>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [kycStatus, setKycStatus] = useState("pending");
  const [taxFormUrl, setTaxFormUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    getLegalStatus(idToken)
      .then((data) => {
        const l = data.legal || {};
        setLegal(l);
        setTermsAccepted(!!l.terms_accepted);
        setIdentityVerified(!!l.identity_verified);
        setKycStatus(l.kyc_status || "pending");
        setTaxFormUrl(l.tax_form_url || "");
      })
      .finally(() => setLoading(false));
  }, [idToken]);

  const handleSave = async () => {
    if (!idToken) return;
    setSaving(true);
    setMessage("");
    try {
      await updateLegal(idToken, {
        terms_accepted: termsAccepted,
        kyc_status: kycStatus,
        identity_verified: identityVerified,
      });
      setMessage("Legal status saved.");
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!idToken || !file) return;
    setSaving(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("tax_form", file);
      const result = await uploadTaxForm(idToken, formData);
      setTaxFormUrl(result.tax_form_url);
      setMessage("Tax form uploaded.");
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <p className="text-center text-sm text-muted">
        Please{" "}
        <Link href="/" className="text-white underline">
          sign in
        </Link>{" "}
        to manage legal settings.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AnimatedSection>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Legal & KYC
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Compliance settings
        </h1>
        <p className="mt-4 text-muted">
          Accept the contributor agreement, verify your identity, and upload tax
          documents before receiving payouts.
        </p>
      </AnimatedSection>

      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading...</p>
      ) : (
        <AnimatedSection delay={0.1} className="mt-10 space-y-8">
          <div className="rounded-2xl border border-border bg-card p-6">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span className="text-sm text-muted">
                I accept the Afrid contributor terms, data license, and privacy
                policy.
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-white">Identity verification</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted">
                  KYC status
                </label>
                <div className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white capitalize">
                  {kycStatus}
                </div>
                <p className="mt-1 text-xs text-muted">KYC status is managed by AFRID administrators.</p>
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={identityVerified}
                  onChange={(e) => setIdentityVerified(e.target.checked)}
                />
                <span className="text-sm text-muted">Identity verified</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-white">Tax form</p>
            <p className="text-xs text-muted">
              Upload W-9 / W-8BEN or local equivalent PDF.
            </p>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-4 block w-full text-sm text-muted"
            />
            {taxFormUrl && (
              <p className="mt-2 text-xs text-muted">Uploaded: {taxFormUrl}</p>
            )}
            <button
              onClick={handleUpload}
              disabled={!file || saving}
              className="mt-4 rounded-xl border border-border bg-card px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-card-hover disabled:opacity-60"
            >
              Upload tax form
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-gradient-primary px-8 py-4 text-sm font-semibold text-white shadow-glow-sm transition-all hover:shadow-glow disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save legal status"}
          </button>
          {message && <p className="text-sm text-white">{message}</p>}
        </AnimatedSection>
      )}
    </div>
  );
}
