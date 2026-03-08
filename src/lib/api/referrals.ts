import { get } from "./client";

export interface ReferralCodeResponse {
  referral_code: string;
}

export interface ReferralStats {
  referral_code: string | null;
  total_referrals: number;
  total_reward_days: number;
  max_referrals: number;
  remaining: number;
}

export interface ReferralItem {
  id: string;
  referee_email: string;
  referee_name: string | null;
  status: string;
  referrer_reward_days: number;
  referee_reward_days: number;
  referrer_rewarded: boolean;
  fraud_flags: string[];
  created_at: string;
}

export async function getMyReferralCode(): Promise<ReferralCodeResponse> {
  return get<ReferralCodeResponse>("/api/referrals/my-code");
}

export async function getReferralStats(): Promise<ReferralStats> {
  return get<ReferralStats>("/api/referrals/stats");
}

export async function getMyReferrals(): Promise<{ items: ReferralItem[] }> {
  return get<{ items: ReferralItem[] }>("/api/referrals/list");
}
