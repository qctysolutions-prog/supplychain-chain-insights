import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Chat Router", () => {
  const caller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    user: null,
  });

  it("should respond to a simple supply chain question", async () => {
    const result = await caller.chat.sendMessage({
      message: "What are tariffs?",
      history: [],
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
    expect(result.message.length).toBeGreaterThan(0);
  }, 30000);

  it("should handle conversation history", async () => {
    const result = await caller.chat.sendMessage({
      message: "Can you elaborate?",
      history: [
        { role: "user", content: "What are tariffs?" },
        { role: "assistant", content: "Tariffs are taxes imposed on imported goods." },
      ],
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
  }, 30000);

  it("should handle questions about logistics", async () => {
    const result = await caller.chat.sendMessage({
      message: "What is freight forwarding?",
      history: [],
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
  }, 30000);

  it("should handle questions about materials pricing", async () => {
    const result = await caller.chat.sendMessage({
      message: "How does aluminum pricing work?",
      history: [],
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
  }, 30000);

  it("should handle questions about supply chain risk", async () => {
    const result = await caller.chat.sendMessage({
      message: "What are common supply chain risks?",
      history: [],
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
  }, 30000);

  it("should handle questions about sustainability", async () => {
    const result = await caller.chat.sendMessage({
      message: "What is a green supply chain?",
      history: [],
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.message.length).toBeGreaterThan(0);
  }, 30000);

  it("should handle empty message gracefully", async () => {
    const result = await caller.chat.sendMessage({
      message: "",
      history: [],
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
  });

  it("should maintain context across multiple exchanges", async () => {
    const result = await caller.chat.sendMessage({
      message: "What does that mean for automotive manufacturing?",
      history: [
        { role: "user", content: "Tell me about trade policies" },
        { role: "assistant", content: "Trade policies regulate international commerce." },
      ],
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe("string");
  }, 30000);

  it("should provide current date when asked", async () => {
    const result = await caller.chat.sendMessage({
      message: "What is today's date?",
      history: [],
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    // Check for current year - month may vary depending on when test runs
    expect(result.message).toContain("2026");
  }, 30000);
});
