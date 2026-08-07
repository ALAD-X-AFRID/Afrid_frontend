import type { UserProfile, Task, Earnings, Payout, Submission, UserStats, StripeConnectStatus, PayoutClaimResult, DiscordStatus } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_BASE = `${API_URL}/api/v1`;

export async function saveProfile(token: string, payload: object) {
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json();
}

export async function getProfile(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json() as Promise<UserProfile>;
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return (data.tasks || []) as Task[];
}

export async function uploadSubmission(token: string, formData: FormData) {
  const res = await fetch(`${API_BASE}/submissions/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
}

export async function getPendingSubmissions(token: string) {
  const res = await fetch(`${API_BASE}/submissions/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch pending submissions");
  const data = await res.json();
  return data.submissions || [];
}

export async function submitReview(token: string, submissionId: string, payload: object) {
  const res = await fetch(`${API_BASE}/submissions/${submissionId}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit review");
  return res.json();
}

export async function applyValidator(token: string, payload: object) {
  const res = await fetch(`${API_BASE}/validators/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to apply as validator");
  return res.json();
}

export async function getValidatorProfile(token: string) {
  const res = await fetch(`${API_BASE}/validators/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch validator profile");
  return res.json();
}

export async function getEarnings(token: string): Promise<Earnings> {
  const res = await fetch(`${API_BASE}/payouts/earnings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch earnings");
  return res.json() as Promise<Earnings>;
}

export async function claimPayout(token: string, amount: number): Promise<PayoutClaimResult> {
  const res = await fetch(`${API_BASE}/payouts/claim`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error("Failed to claim payout");
  return res.json() as Promise<PayoutClaimResult>;
}

export async function getPayouts(token: string): Promise<Payout[]> {
  const res = await fetch(`${API_BASE}/payouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch payouts");
  const data = await res.json();
  return data.payouts || [];
}

export async function connectStripe(token: string) {
  const res = await fetch(`${API_BASE}/payments/connect`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to create Stripe account");
  return res.json();
}

export async function getConnectStatus(token: string): Promise<StripeConnectStatus> {
  const res = await fetch(`${API_BASE}/payments/connect-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch connect status");
  return res.json() as Promise<StripeConnectStatus>;
}

export async function getLegalStatus(token: string) {
  const res = await fetch(`${API_BASE}/user/legal`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch legal status");
  return res.json();
}

export async function updateLegal(token: string, payload: object) {
  const res = await fetch(`${API_BASE}/user/legal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update legal status");
  return res.json();
}

export async function uploadTaxForm(token: string, formData: FormData) {
  const res = await fetch(`${API_BASE}/user/tax-form`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload tax form");
  return res.json();
}

export async function applyReviewer(token: string) {
  const res = await fetch(`${API_BASE}/reviewers/apply`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to apply as reviewer");
  return res.json();
}

export async function getReviewerProfile(token: string) {
  const res = await fetch(`${API_BASE}/reviewers/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch reviewer profile");
  return res.json();
}

export async function getReviewerSubmissions(token: string, filters: Record<string, string> = {}) {
  const qs = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_BASE}/reviewer/submissions?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch reviewer submissions");
  return res.json();
}

export async function finalizeReview(token: string, submissionId: string, decision: "include" | "exclude" | "accept" | "reject" | "request_changes", comment: string) {
  const res = await fetch(`${API_BASE}/reviewer/submissions/${submissionId}/finalize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ decision, comment }),
  });
  if (!res.ok) throw new Error("Failed to finalize review");
  return res.json();
}

export async function getMySubmissions(token: string): Promise<Submission[]> {
  const res = await fetch(`${API_BASE}/submissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch submissions");
  const data = await res.json();
  return (data.submissions || []) as Submission[];
}

export async function getSubmission(token: string, submissionId: string) {
  const res = await fetch(`${API_BASE}/submissions/${submissionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch submission");
  return res.json();
}

export async function getAudioURL(token: string, submissionId: string) {
  const res = await fetch(`${API_BASE}/submissions/${submissionId}/audio`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch audio URL");
  const data = await res.json();
  return data.audio_url as string;
}

export async function saveTranscription(
  token: string,
  submissionId: string,
  transcriptRefined: string,
  translationEnglish: string
) {
  const res = await fetch(`${API_BASE}/submissions/${submissionId}/transcription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      transcript_refined: transcriptRefined,
      translation_english: translationEnglish,
    }),
  });
  if (!res.ok) throw new Error("Failed to save transcription");
  return res.json();
}

export async function getUserStats(token: string): Promise<UserStats> {
  const res = await fetch(`${API_BASE}/user/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user stats");
  return res.json() as Promise<UserStats>;
}

export async function joinWaitlist(email: string) {
  const url = `${API_BASE}/waitlist`;
  console.log("[joinWaitlist] API_URL:", API_URL);
  console.log("[joinWaitlist] full URL:", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  console.log("[joinWaitlist] response status:", res.status, res.statusText);
  if (!res.ok) {
    const body = await res.text().catch(() => "unreadable");
    console.error("[joinWaitlist] error body:", body);
    throw new Error(`Failed to join waitlist: ${res.status} ${body}`);
  }
  return res.json();
}

export async function submitTuringTestPayout(token: string, payload: { account_holder: string; account_number: string; bank_name: string }) {
  const res = await fetch(`${API_BASE}/turing-test/payout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit payout details");
  return res.json();
}

export async function getReviewerAudioURL(token: string, submissionId: string) {
  const res = await fetch(`${API_BASE}/reviewer/submissions/${submissionId}/audio`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch audio URL");
  const data = await res.json();
  return data.audio_url as string;
}

export function getDiscordConnectURL(token: string): string {
  return `${API_BASE}/discord/connect?token=${encodeURIComponent(token)}`;
}

export async function getDiscordStatus(token: string): Promise<DiscordStatus> {
  const res = await fetch(`${API_BASE}/discord/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Discord status");
  return res.json() as Promise<DiscordStatus>;
}
