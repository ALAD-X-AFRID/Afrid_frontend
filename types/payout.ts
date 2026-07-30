export interface Earnings {
  total_earnings: number;
  available: number;
  claimed: number;
  total_minutes: number;
}

export interface Payout {
  id: string;
  amount: number;
  status: PayoutStatus;
  requested_at: string;
  paid_at?: string;
  transfer_id?: string;
}

export type PayoutStatus = "pending" | "paid" | "failed";

export interface StripeConnectStatus {
  connected: boolean;
  account_id?: string;
  stripe_account_id?: string;
  details_submitted?: boolean;
  payouts_enabled?: boolean;
}

export interface PayoutClaimResult {
  message: string;
  payout_id: string;
  amount: number;
  status: string;
}
