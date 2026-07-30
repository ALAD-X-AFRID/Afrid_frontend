import { describe, it, expect } from "vitest";
import type { Payout, PayoutStatus, Earnings, DiscordStatus, UserStats } from "@/types";

describe("PayoutStatus type", () => {
  it("accepts valid backend statuses", () => {
    const pending: PayoutStatus = "pending";
    const paid: PayoutStatus = "paid";
    const failed: PayoutStatus = "failed";
    expect([pending, paid, failed]).toHaveLength(3);
  });

  it("does not accept 'completed' (old incorrect status)", () => {
    // @ts-expect-error - "completed" is not a valid PayoutStatus
    const invalid: PayoutStatus = "completed";
    expect(invalid).toBe("completed");
  });

  it("does not accept 'processing' (old incorrect status)", () => {
    // @ts-expect-error - "processing" is not a valid PayoutStatus
    const invalid: PayoutStatus = "processing";
    expect(invalid).toBe("processing");
  });
});

describe("Payout type", () => {
  it("has requested_at field (not created_at)", () => {
    const payout: Payout = {
      id: "p1",
      amount: 50,
      status: "paid",
      requested_at: "2024-01-01T00:00:00Z",
      paid_at: "2024-01-02T00:00:00Z",
      transfer_id: "tr_123",
    };
    expect(payout.requested_at).toBeDefined();
    expect(payout.paid_at).toBeDefined();
    expect(payout.transfer_id).toBeDefined();
  });
});

describe("Earnings type", () => {
  it("matches backend response shape", () => {
    const earnings: Earnings = {
      total_earnings: 100,
      available: 50,
      claimed: 50,
      total_minutes: 120,
    };
    expect(earnings.total_earnings).toBe(100);
    expect(earnings.available).toBe(50);
  });
});

describe("DiscordStatus type", () => {
  it("supports connected state with all fields", () => {
    const status: DiscordStatus = {
      connected: true,
      discord_id: "123456",
      discord_username: "alice",
      joined_guild: true,
      invite_url: "https://discord.gg/abc",
    };
    expect(status.connected).toBe(true);
    expect(status.discord_id).toBe("123456");
  });

  it("supports disconnected state with minimal fields", () => {
    const status: DiscordStatus = {
      connected: false,
      invite_url: "https://discord.gg/abc",
    };
    expect(status.connected).toBe(false);
  });
});

describe("UserStats type", () => {
  it("has display_name field from backend", () => {
    const stats: UserStats = {
      accepted: 5,
      pending: 3,
      completed: 8,
      total_minutes: 120,
      total_contributions: 10,
      display_name: "Alice",
    };
    expect(stats.display_name).toBe("Alice");
  });
});
