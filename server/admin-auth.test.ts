/**
 * Tests for admin password authentication
 */
import { describe, it, expect, vi } from "vitest";

// Mock ENV before importing routers
vi.mock("./_core/env", () => ({
  ENV: {
    adminPassword: "test-admin-password-123",
    cookieSecret: "test-cookie-secret-abcdefgh",
    appId: "",
    databaseUrl: "",
    oAuthServerUrl: "",
    ownerOpenId: "",
    isProduction: false,
    forgeApiUrl: "",
    forgeApiKey: "",
  },
}));

// Mock all DB imports
vi.mock("./db", () => ({
  getAllNewsArticles: vi.fn().mockResolvedValue([]),
  getNewsArticlesByCategory: vi.fn().mockResolvedValue([]),
  submitCategoryFeedback: vi.fn().mockResolvedValue({}),
  getFeedbackByCategory: vi.fn().mockResolvedValue([]),
  getAllAluminumPricing: vi.fn().mockResolvedValue([]),
  getAluminumPricingByDateRange: vi.fn().mockResolvedValue([]),
  addAluminumPricing: vi.fn().mockResolvedValue({}),
  getAllSupplyChainIndices: vi.fn().mockResolvedValue([]),
  getSupplyChainIndicesByDateRange: vi.fn().mockResolvedValue([]),
  getLatestSupplyChainIndices: vi.fn().mockResolvedValue(null),
  addSupplyChainIndices: vi.fn().mockResolvedValue({}),
  isEmailAuthorized: vi.fn().mockResolvedValue(false),
  getAllSubscriptions: vi.fn().mockResolvedValue([]),
  getSubscriptionByEmail: vi.fn().mockResolvedValue(null),
  createSubscription: vi.fn().mockResolvedValue({}),
  updateSubscriptionStatus: vi.fn().mockResolvedValue({}),
  deleteSubscription: vi.fn().mockResolvedValue({}),
  getAllAllowlist: vi.fn().mockResolvedValue([]),
  addToAllowlist: vi.fn().mockResolvedValue({}),
  removeFromAllowlist: vi.fn().mockResolvedValue({}),
  bulkAddToAllowlist: vi.fn().mockResolvedValue({ added: 0, skipped: 0, errors: [] }),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Test response" } }],
  }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicCaller() {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
  return appRouter.createCaller(ctx);
}

describe("Admin Password Authentication", () => {
  describe("adminAuth.verify", () => {
    it("should return success and token for correct password", async () => {
      const caller = createPublicCaller();
      const result = await caller.adminAuth.verify({ password: "test-admin-password-123" });
      expect(result.success).toBe(true);
      expect(result.token).toBeTruthy();
      expect(typeof result.token).toBe("string");
    });

    it("should throw error for incorrect password", async () => {
      const caller = createPublicCaller();
      await expect(
        caller.adminAuth.verify({ password: "wrong-password" })
      ).rejects.toThrow("Incorrect password.");
    });

    it("should return a base64-encoded token containing admin prefix", async () => {
      const caller = createPublicCaller();
      const result = await caller.adminAuth.verify({ password: "test-admin-password-123" });
      const decoded = Buffer.from(result.token, "base64").toString("utf8");
      expect(decoded).toContain("admin:");
    });
  });

  describe("adminAuth.validateToken", () => {
    it("should return valid=true for a freshly generated token", async () => {
      const caller = createPublicCaller();
      const { token } = await caller.adminAuth.verify({ password: "test-admin-password-123" });
      const result = await caller.adminAuth.validateToken({ token });
      expect(result.valid).toBe(true);
    });

    it("should return valid=false for a tampered token", async () => {
      const caller = createPublicCaller();
      const result = await caller.adminAuth.validateToken({ token: "tampered-token-xyz" });
      expect(result.valid).toBe(false);
    });

    it("should return valid=false for an empty token", async () => {
      const caller = createPublicCaller();
      const result = await caller.adminAuth.validateToken({ token: "" });
      expect(result.valid).toBe(false);
    });

    it("should return valid=false for a token with wrong secret", async () => {
      const caller = createPublicCaller();
      const fakeToken = Buffer.from("admin:1234567890:wrongsec").toString("base64");
      const result = await caller.adminAuth.validateToken({ token: fakeToken });
      expect(result.valid).toBe(false);
    });
  });
});
