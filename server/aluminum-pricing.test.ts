import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("aluminumPricing.getAll", () => {
  it("returns array of aluminum pricing data", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aluminumPricing.getAll();

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("date");
      expect(result[0]).toHaveProperty("price");
      expect(result[0]).toHaveProperty("source");
    }
  });

  it("returns data sorted by date descending", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aluminumPricing.getAll();

    if (result.length > 1) {
      const firstDate = new Date(result[0].date);
      const secondDate = new Date(result[1].date);
      expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
    }
  });
});

describe("aluminumPricing.getByDateRange", () => {
  it("returns pricing data within specified date range", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = "2026-01-01";
    const endDate = "2026-01-31";

    const result = await caller.aluminumPricing.getByDateRange({
      startDate,
      endDate,
    });

    expect(Array.isArray(result)).toBe(true);
    
    // Verify all results are within the date range
    result.forEach((item) => {
      const itemDate = new Date(item.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      expect(itemDate.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(itemDate.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  });

  it("returns empty array when no data in range", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aluminumPricing.getByDateRange({
      startDate: "2020-01-01",
      endDate: "2020-01-31",
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

describe("aluminumPricing.add", () => {
  it("successfully adds new pricing data", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const newPricing = {
      date: "2026-02-10",
      price: "2,850",
      change: "+27",
      changePercent: "+0.96%",
      source: "LME",
      notes: "Test pricing entry",
    };

    const result = await caller.aluminumPricing.add(newPricing);

    expect(result).toBeTruthy();
  });

  it("adds pricing data with minimal required fields", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const newPricing = {
      date: "2026-02-11",
      price: "2,860",
      source: "LME",
    };

    const result = await caller.aluminumPricing.add(newPricing);

    expect(result).toBeTruthy();
  });
});

describe("aluminum pricing data structure", () => {
  it("has correct data structure with all fields", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aluminumPricing.getAll();

    if (result.length > 0) {
      const item = result[0];
      
      expect(typeof item.id).toBe("number");
      expect(typeof item.date).toBe("string");
      expect(typeof item.price).toBe("string");
      expect(typeof item.source).toBe("string");
      expect(item.createdAt).toBeInstanceOf(Date);
      
      // Optional fields
      if (item.change !== null) {
        expect(typeof item.change).toBe("string");
      }
      if (item.changePercent !== null) {
        expect(typeof item.changePercent).toBe("string");
      }
      if (item.notes !== null) {
        expect(typeof item.notes).toBe("string");
      }
    }
  });

  it("date format is yyyy-mm-dd", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aluminumPricing.getAll();

    if (result.length > 0) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      result.forEach((item) => {
        expect(item.date).toMatch(dateRegex);
      });
    }
  });
});
