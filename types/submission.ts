export interface Task {
  id?: string;
  title?: string;
  type?: string;
  requirements?: {
    language_target?: string;
    dialect_target?: string;
    target_environment?: string;
    target_duration?: number;
  };
  status?: {
    is_active?: boolean;
    current_fill_percentage?: number;
  };
  unit_price?: number;
}

export interface Provenance {
  provenance_id: string;
  timestamp: string;
  duration: string;
  context_tag: string;
}

export interface Recording {
  mode: string;
  code_switching: boolean;
  file_size: number;
}

export interface Transcription {
  transcript_raw: string;
  transcript_refined: string;
  translation_english: string;
  edited_at?: string;
}

export interface Review {
  validator_id: string;
  decision: string;
  scores: ReviewScores;
  comment?: string;
  submitted_at: string;
}

export interface ReviewScores {
  accuracy: number;
  cultural_fit: number;
  audio_quality: number;
  transcription_quality: number;
}

export interface Submission {
  id: string;
  contributor_id: string;
  task_id: string;
  audio_file_url: string;
  duration_seconds: number;
  unit_price: number;
  languages: LanguageInSubmission[];
  language_codes: string[];
  provenance: Provenance;
  recording: Recording;
  transcription: Transcription;
  status: SubmissionStatus;
  uploaded_at: string;
  reviews?: Review[];
  review_count?: number;
  consensus_score?: number;
  consensus_decision?: string;
  reviewer_decision?: string;
  reviewer_comment?: string;
  reviewer_id?: string;
  reviewed_at?: string;
}

export type SubmissionStatus =
  | "pending_review"
  | "transcribed"
  | "validated"
  | "accepted"
  | "rejected"
  | "flagged"
  | "revision_requested"
  | "included"
  | "excluded";

interface LanguageInSubmission {
  language: string;
  dialect: string;
  proficiency_level: string;
}

export interface UploadResult {
  message: string;
  submission_id: string;
  provenance_id: string;
  audio_url: string;
}

export interface UserStats {
  accepted: number;
  pending: number;
  completed: number;
  total_minutes: number;
  total_contributions: number;
  display_name: string;
}
