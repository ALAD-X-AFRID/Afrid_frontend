export interface ValidatorProfile {
  status: string;
  reputation: number;
  stake: number;
  applied_at?: string;
}

export interface PendingSubmission {
  id: string;
  contributor_id: string;
  languages: { language: string; dialect: string }[];
  duration_seconds: number;
  status: string;
  provenance: {
    provenance_id: string;
    context_tag: string;
  };
  transcription: {
    transcript_raw: string;
    transcript_refined: string;
    translation_english: string;
  };
  recording?: {
    mode: string;
    code_switching: boolean;
  };
  reviews?: unknown[];
  consensus_score?: number;
  consensus_decision?: string;
}

export interface ReviewSubmissionPayload {
  scores: {
    accuracy: number;
    cultural_fit: number;
    audio_quality: number;
    transcription_quality: number;
  };
  decision: "approve" | "reject" | "flag";
  comment?: string;
}

export interface ReviewerSubmission {
  id: string;
  contributor_id: string;
  languages: { language: string }[];
  duration_seconds: number;
  status: string;
  provenance?: { provenance_id: string };
  transcription: {
    transcript_raw: string;
    transcript_refined: string;
    translation_english: string;
  };
  consensus_score?: number;
  consensus_decision?: string;
  review_count: number;
  reviews?: unknown[];
}
