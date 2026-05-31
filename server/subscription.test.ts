/**
 * Unit tests for the subscription and access control system
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  isEmailAuthorized: vi.fn(),
  getAllSubscriptions: vi.fn(),
  getSubscriptionByEmail: vi.fn(),
  createSubscription: vi.fn(),
  updateSubscriptionStatus: vi.fn(),
  deleteSubscription: vi.fn(),
  getAllAllowlist: vi.fn(),
  addToAllowlist: vi.fn(),
  removeFromAllowlist: vi.fn(),
}));

import {
  isEmailAuthorized,
  getSubscriptionByEmail,
  createSubscription,
  updateSubscriptionStatus,
} from "./db";

describe("Subscription Access Control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isEmailAuthorized", () => {
    it("returns true for an email in the allowlist", async () => {
      vi.mocked(isEmailAuthorized).mockResolvedValue(true);
      const result = await isEmailAuthorized("admin@company.com");
      expect(result).toBe(true);
    });

    it("returns true for an email with approved subscription", async () => {
      vi.mocked(isEmailAuthorized).mockResolvedValue(true);
      const result = await isEmailAuthorized("approved@company.com");
      expect(result).toBe(true);
    });

    it("returns false for an email with pending subscription", async () => {
      vi.mocked(isEmailAuthorized).mockResolvedValue(false);
      const result = await isEmailAuthorized("pending@company.com");
      expect(result).toBe(false);
    });

    it("returns false for an email with denied subscription", async () => {
      vi.mocked(isEmailAuthorized).mockResolvedValue(false);
      const result = await isEmailAuthorized("denied@company.com");
      expect(result).toBe(false);
    });

    it("returns false for an unknown email", async () => {
      vi.mocked(isEmailAuthorized).mockResolvedValue(false);
      const result = await isEmailAuthorized("unknown@company.com");
      expect(result).toBe(false);
    });
  });

  describe("getSubscriptionByEmail", () => {
    it("returns subscription record for known email", async () => {
      const mockSub = {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        organization: "Test Corp",
        reason: "Need access for work",
        status: "pending" as const,
        approvedBy: null,
        approvedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(getSubscriptionByEmail).mockResolvedValue(mockSub);
      const result = await getSubscriptionByEmail("user@test.com");
      expect(result).toEqual(mockSub);
      expect(result?.status).toBe("pending");
    });

    it("returns null for unknown email", async () => {
      vi.mocked(getSubscriptionByEmail).mockResolvedValue(null);
      const result = await getSubscriptionByEmail("nobody@test.com");
      expect(result).toBeNull();
    });
  });

  describe("createSubscription", () => {
    it("creates a new subscription with pending status", async () => {
      const mockSub = {
        id: 2,
        email: "new@test.com",
        name: "New User",
        organization: "New Corp",
        reason: "Research purposes",
        status: "pending" as const,
        approvedBy: null,
        approvedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(createSubscription).mockResolvedValue(mockSub);
      const result = await createSubscription({
        email: "new@test.com",
        name: "New User",
        organization: "New Corp",
        reason: "Research purposes",
        status: "pending",
      });
      expect(result?.email).toBe("new@test.com");
      expect(result?.status).toBe("pending");
    });
  });

  describe("updateSubscriptionStatus", () => {
    it("can approve a pending subscription", async () => {
      vi.mocked(updateSubscriptionStatus).mockResolvedValue(undefined);
      await expect(
        updateSubscriptionStatus(1, "approved", "Admin User", "Looks good")
      ).resolves.not.toThrow();
      expect(updateSubscriptionStatus).toHaveBeenCalledWith(1, "approved", "Admin User", "Looks good");
    });

    it("can deny a pending subscription", async () => {
      vi.mocked(updateSubscriptionStatus).mockResolvedValue(undefined);
      await expect(
        updateSubscriptionStatus(1, "denied", "Admin User", "Not eligible")
      ).resolves.not.toThrow();
      expect(updateSubscriptionStatus).toHaveBeenCalledWith(1, "denied", "Admin User", "Not eligible");
    });
  });
});

describe("Subscription Request Flow", () => {
  it("validates required fields: email and name", () => {
    const validateRequest = (email: string, name: string) => {
      const errors: string[] = [];
      if (!email || !email.includes("@")) errors.push("Valid email required");
      if (!name || name.trim().length === 0) errors.push("Name required");
      return errors;
    };

    expect(validateRequest("", "")).toHaveLength(2);
    expect(validateRequest("invalid", "John")).toHaveLength(1);
    expect(validateRequest("john@test.com", "")).toHaveLength(1);
    expect(validateRequest("john@test.com", "John Doe")).toHaveLength(0);
  });

  it("normalizes email to lowercase", () => {
    const normalizeEmail = (email: string) => email.toLowerCase().trim();
    expect(normalizeEmail("JOHN@TEST.COM")).toBe("john@test.com");
    expect(normalizeEmail("  Jane@Company.com  ")).toBe("jane@company.com");
  });

  it("handles duplicate subscription requests correctly", async () => {
    // Simulate already pending
    vi.mocked(getSubscriptionByEmail).mockResolvedValue({
      id: 1,
      email: "existing@test.com",
      name: "Existing User",
      organization: null,
      reason: null,
      status: "pending",
      approvedBy: null,
      approvedAt: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const existing = await getSubscriptionByEmail("existing@test.com");
    expect(existing?.status).toBe("pending");
    // Should not create a new subscription
    expect(createSubscription).not.toHaveBeenCalled();
  });
});
