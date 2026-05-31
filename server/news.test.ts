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

describe("news.getAll", () => {
  it("returns all news articles from database", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.news.getAll();

    expect(articles).toBeDefined();
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeGreaterThan(0);
    
    // Verify article structure
    const firstArticle = articles[0];
    expect(firstArticle).toHaveProperty("id");
    expect(firstArticle).toHaveProperty("category");
    expect(firstArticle).toHaveProperty("label");
    expect(firstArticle).toHaveProperty("title");
    expect(firstArticle).toHaveProperty("date");
    expect(firstArticle).toHaveProperty("bullets");
    expect(firstArticle).toHaveProperty("link");
    
    // Verify bullets is parsed as array
    expect(Array.isArray(firstArticle?.bullets)).toBe(true);
  });

  it("returns articles with valid date format (yyyy-mm-dd)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.news.getAll();

    articles.forEach((article) => {
      expect(article.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("returns articles across all 6 categories", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.news.getAll();
    const categories = new Set(articles.map((a) => a.category));

    expect(categories.size).toBeGreaterThanOrEqual(6);
    expect(categories.has("Tariff Regulations & Trade Policies")).toBe(true);
    expect(categories.has("Logistics & Transportation")).toBe(true);
    expect(categories.has("Materials Pricing")).toBe(true);
    expect(categories.has("Supply Chain Risk Management")).toBe(true);
    expect(categories.has("Supplier Relationship Management")).toBe(true);
    expect(categories.has("Sustainability & Green Supply Chain")).toBe(true);
  });
});

describe("news.getByCategory", () => {
  it("returns articles for specific category", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.news.getByCategory({
      category: "Tariff Regulations & Trade Policies",
    });

    expect(articles).toBeDefined();
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeGreaterThan(0);
    
    // All articles should be from the requested category
    articles.forEach((article) => {
      expect(article.category).toBe("Tariff Regulations & Trade Policies");
    });
  });

  it("returns at least 4 articles per category", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const categories = [
      "Tariff Regulations & Trade Policies",
      "Logistics & Transportation",
      "Materials Pricing",
      "Supply Chain Risk Management",
      "Supplier Relationship Management",
      "Sustainability & Green Supply Chain",
    ];

    for (const category of categories) {
      const articles = await caller.news.getByCategory({ category });
      expect(articles.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("returns empty array for non-existent category", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.news.getByCategory({
      category: "Non-Existent Category",
    });

    expect(articles).toBeDefined();
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBe(0);
  });
});
