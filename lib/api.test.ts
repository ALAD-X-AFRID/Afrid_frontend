import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Import after mocking fetch
import {
  saveProfile,
  getProfile,
  getTasks,
  uploadSubmission,
  getEarnings,
  getPayouts,
  claimPayout,
  getMySubmissions,
  getDiscordConnectURL,
  getDiscordStatus,
} from "@/lib/api";

const API_BASE = "http://localhost:8080/api/v1";

beforeEach(() => {
  mockFetch.mockReset();
});

describe("saveProfile", () => {
  it("sends POST with correct headers and body", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: "ok" }) });
    await saveProfile("test-token", { display_name: "Alice" });
    expect(mockFetch).toHaveBeenCalledWith(
      `${API_BASE}/user/profile`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(saveProfile("token", {})).rejects.toThrow("Failed to save profile");
  });
});

describe("getProfile", () => {
  it("sends GET with auth header", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ uid: "123" }) });
    const result = await getProfile("my-token");
    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/user/profile`, {
      headers: { Authorization: "Bearer my-token" },
    });
    expect(result).toEqual({ uid: "123" });
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(getProfile("token")).rejects.toThrow("Failed to fetch profile");
  });
});

describe("getTasks", () => {
  it("returns tasks array from response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ tasks: [{ id: "1" }, { id: "2" }] }) });
    const result = await getTasks();
    expect(result).toHaveLength(2);
  });

  it("returns empty array when no tasks field", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const result = await getTasks();
    expect(result).toEqual([]);
  });
});

describe("uploadSubmission", () => {
  it("sends FormData with auth header (no Content-Type)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ submission_id: "abc" }) });
    const formData = new FormData();
    formData.append("audio", new Blob(["test"]), "test.wav");
    await uploadSubmission("token", formData);
    const call = mockFetch.mock.calls[0];
    expect(call[0]).toBe(`${API_BASE}/submissions/upload`);
    expect(call[1].headers.Authorization).toBe("Bearer token");
    expect(call[1].headers["Content-Type"]).toBeUndefined();
    expect(call[1].body).toBe(formData);
  });

  it("parses error message from response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid file format" }),
    });
    await expect(uploadSubmission("token", new FormData())).rejects.toThrow("Invalid file format");
  });

  it("falls back to generic error when json parse fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new Error("parse error"); },
    });
    await expect(uploadSubmission("token", new FormData())).rejects.toThrow("Upload failed");
  });
});

describe("getEarnings", () => {
  it("returns earnings data", async () => {
    const mockEarnings = { total_earnings: 100, available: 50, claimed: 50, total_minutes: 120 };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockEarnings });
    const result = await getEarnings("token");
    expect(result).toEqual(mockEarnings);
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(getEarnings("token")).rejects.toThrow("Failed to fetch earnings");
  });
});

describe("getPayouts", () => {
  it("returns payouts array", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ payouts: [{ id: "p1" }] }) });
    const result = await getPayouts("token");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p1");
  });

  it("returns empty array when no payouts", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const result = await getPayouts("token");
    expect(result).toEqual([]);
  });
});

describe("claimPayout", () => {
  it("sends POST with amount", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: "ok", payout_id: "p1", amount: 50, status: "pending" }) });
    const result = await claimPayout("token", 50);
    expect(result.payout_id).toBe("p1");
    const call = mockFetch.mock.calls[0];
    expect(call[1].body).toBe(JSON.stringify({ amount: 50 }));
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(claimPayout("token", 50)).rejects.toThrow("Failed to claim payout");
  });
});

describe("getMySubmissions", () => {
  it("returns submissions array", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ submissions: [{ id: "s1" }, { id: "s2" }] }) });
    const result = await getMySubmissions("token");
    expect(result).toHaveLength(2);
  });

  it("returns empty array when no submissions", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const result = await getMySubmissions("token");
    expect(result).toEqual([]);
  });
});

describe("getDiscordConnectURL", () => {
  it("returns URL with token query param", () => {
    const url = getDiscordConnectURL("my-firebase-token");
    expect(url).toBe(`${API_BASE}/discord/connect?token=my-firebase-token`);
  });

  it("encodes special characters in token", () => {
    const url = getDiscordConnectURL("token+with/special");
    expect(url).toContain("token%2Bwith%2Fspecial");
  });
});

describe("getDiscordStatus", () => {
  it("returns discord status object", async () => {
    const mockStatus = { connected: true, discord_id: "123", discord_username: "alice", joined_guild: true };
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockStatus });
    const result = await getDiscordStatus("token");
    expect(result.connected).toBe(true);
    expect(result.discord_username).toBe("alice");
  });

  it("throws on failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(getDiscordStatus("token")).rejects.toThrow("Failed to fetch Discord status");
  });
});
