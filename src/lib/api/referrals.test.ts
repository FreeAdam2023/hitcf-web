import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMyReferralCode, getReferralStats, getMyReferrals } from "./referrals";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("referrals API client", () => {
  it("getMyReferralCode calls GET /api/referrals/my-code", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ referral_code: "ABC12345" }),
    });

    const result = await getMyReferralCode();
    expect(result.referral_code).toBe("ABC12345");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/referrals/my-code");
  });

  it("getReferralStats returns stats object", async () => {
    const stats = {
      referral_code: "XYZ99999",
      total_referrals: 5,
      total_reward_days: 150,
      max_referrals: 20,
      remaining: 15,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(stats),
    });

    const result = await getReferralStats();
    expect(result.total_referrals).toBe(5);
    expect(result.remaining).toBe(15);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toBe("/api/referrals/stats");
  });

  it("getMyReferrals returns referral list", async () => {
    const items = [
      {
        id: "ref1",
        referee_email: "f***@test.com",
        referee_name: "Friend",
        status: "completed",
        referrer_reward_days: 30,
        referee_reward_days: 30,
        referrer_rewarded: true,
        fraud_flags: [],
        created_at: "2026-03-08T00:00:00",
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ items }),
    });

    const result = await getMyReferrals();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].status).toBe("completed");
    expect(result.items[0].referee_email).toContain("***");
  });

  it("handles 401 for unauthenticated user", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: "Not authenticated" }),
    });

    await expect(getMyReferralCode()).rejects.toThrow();
  });
});
