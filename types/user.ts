export interface UserProfile {
  uid: string;
  email: string;
  display_name: string;
  demographics: Demographics;
  linguistic_profile: LinguisticProfile;
  legal: LegalStatus;
  gamification: Gamification;
  economics: Economics;
  reviewer?: ReviewerStatus;
  validator?: ValidatorStatus;
  turing_test_payout?: TuringTestPayout;
  stripe_account_status?: string;
}

export interface Demographics {
  age_range: string;
  gender: string;
  region: string;
  country: string;
  tribe: string;
}

export interface LanguageEntry {
  language: string;
  dialect: string;
  proficiency_level: string;
}

export interface LinguisticProfile {
  languages: LanguageEntry[];
}

export interface LegalStatus {
  consent_timestamp: string;
  consent_version: string;
  revocable_status: boolean;
  kyc_status?: string;
  tax_form_uploaded?: boolean;
  terms_accepted?: boolean;
  identity_verified?: boolean;
}

export interface Gamification {
  status_badge: string;
  total_contributions: number;
  total_validations: number;
}

export interface Economics {
  earnings_pending: number;
  earnings_cleared: number;
}

export interface ReviewerStatus {
  status: string;
  applied_at: string;
}

export interface ValidatorStatus {
  status: string;
  reputation: number;
  stake: number;
}

export interface TuringTestPayout {
  account_holder: string;
  bank_name: string;
  status: string;
  updated_at: string;
}

export interface DiscordStatus {
  connected: boolean;
  discord_id?: string;
  discord_username?: string;
  joined_guild?: boolean;
  invite_url?: string;
}
