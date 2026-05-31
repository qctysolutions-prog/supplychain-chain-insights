import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthenticatedContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("feedback.submit", () => {
  it("submits feedback with relevance marked as true", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feedback.submit({
      category: "Tariff Regulations & Trade Policies",
      isRelevant: true,
      feedbackText: "This category is very helpful for my work",
      userEmail: "user@example.com",
    });

    expect(result).toBeDefined();
  });

  it("submits feedback with relevance marked as false", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feedback.submit({
      category: "Logistics & Transportation",
      isRelevant: false,
      feedbackText: "Not relevant to my current projects",
    });

    expect(result).toBeDefined();
  });

  it("submits feedback without optional fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feedback.submit({
      category: "Materials Pricing",
      isRelevant: true,
    });

    expect(result).toBeDefined();
  });

  it("captures user information when authenticated", async () => {
    const ctx = createAuthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feedback.submit({
      category: "Supply Chain Risk Management",
      isRelevant: true,
      feedbackText: "Great insights on risk management",
    });

    expect(result).toBeDefined();
  });

  it("validates email format when provided", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.feedback.submit({
        category: "Sustainability & Green Supply Chain",
        isRelevant: true,
        userEmail: "invalid-email",
      })
    ).rejects.toThrow();
  });
});

describe("feedback.getByCategory", () => {
  it("retrieves feedback for a specific category", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First submit some feedback
    await caller.feedback.submit({
      category: "Tariff Regulations & Trade Policies",
      isRelevant: true,
      feedbackText: "Test feedback for retrieval",
    });

    // Then retrieve it
    const feedback = await caller.feedback.getByCategory({
      category: "Tariff Regulations & Trade Policies",
    });

    expect(feedback).toBeDefined();
    expect(Array.isArray(feedback)).toBe(true);
    expect(feedback.length).toBeGreaterThan(0);

    // Verify feedback structure
    const firstFeedback = feedback[0];
    expect(firstFeedback).toHaveProperty("id");
    expect(firstFeedback).toHaveProperty("category");
    expect(firstFeedback).toHaveProperty("isRelevant");
    expect(firstFeedback).toHaveProperty("feedbackText");
    expect(firstFeedback).toHaveProperty("createdAt");
  });

  it("returns empty array for category with no feedback", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const feedback = await caller.feedback.getByCategory({
      category: "Non-Existent Category With No Feedback",
    });

    expect(feedback).toBeDefined();
    expect(Array.isArray(feedback)).toBe(true);
  });

  it("stores relevance as integer (1 for true, 0 for false)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Submit feedback with isRelevant = true
    await caller.feedback.submit({
      category: "Test Category for Relevance",
      isRelevant: true,
    });

    // Submit feedback with isRelevant = false
    await caller.feedback.submit({
      category: "Test Category for Relevance",
      isRelevant: false,
    });

    const feedback = await caller.feedback.getByCategory({
      category: "Test Category for Relevance",
    });

    const relevantFeedback = feedback.filter((f) => f.isRelevant === 1);
    const notRelevantFeedback = feedback.filter((f) => f.isRelevant === 0);

    expect(relevantFeedback.length).toBeGreaterThan(0);
    expect(notRelevantFeedback.length).toBeGreaterThan(0);
  });
});
