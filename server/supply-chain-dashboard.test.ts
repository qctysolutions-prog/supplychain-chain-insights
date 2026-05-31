import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("supplyChainIndices.getAll", () => {
  it("returns array of supply chain indices", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.supplyChainIndices.getAll();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns indices sorted by date descending", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.supplyChainIndices.getAll();

    if (result.length > 1) {
      const firstDate = new Date(result[0]!.date);
      const secondDate = new Date(result[1]!.date);
      expect(firstDate >= secondDate).toBe(true);
    }
  });

  it("returns indices with all required fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.supplyChainIndices.getAll();

    expect(result.length).toBeGreaterThan(0);
    const firstIndex = result[0]!;
    expect(firstIndex).toHaveProperty("date");
    expect(firstIndex).toHaveProperty("tpuIndex");
    expect(firstIndex).toHaveProperty("usTradeTpu");
    expect(firstIndex).toHaveProperty("blsImportPrice");
    expect(firstIndex).toHaveProperty("hrcPrice");
    expect(firstIndex).toHaveProperty("lmeAluminum");
    expect(firstIndex).toHaveProperty("cmeCopper");
    expect(firstIndex).toHaveProperty("dieselPrice");
    expect(firstIndex).toHaveProperty("cassExpenditure");
    expect(firstIndex).toHaveProperty("wciOcean");
  });
});

describe("supplyChainIndices.getLatest", () => {
  it("returns the most recent supply chain indices", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.supplyChainIndices.getLatest();

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("date");
    expect(result).toHaveProperty("tpuIndex");
  });

  it("returns the latest date", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const latest = await caller.supplyChainIndices.getLatest();
    const all = await caller.supplyChainIndices.getAll();

    expect(latest).not.toBeNull();
    expect(all.length).toBeGreaterThan(0);
    expect(latest!.date).toBe(all[0]!.date);
  });
});

describe("supplyChainIndices.getByDateRange", () => {
  it("returns indices within specified date range", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.supplyChainIndices.getByDateRange({
      startDate: "2025-06-01",
      endDate: "2025-09-01",
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Verify all dates are within range
    result.forEach((index) => {
      const date = new Date(index.date);
      expect(date >= new Date("2025-06-01")).toBe(true);
      expect(date <= new Date("2025-09-01")).toBe(true);
    });
  });

  it("returns empty array for date range with no data", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.supplyChainIndices.getByDateRange({
      startDate: "2020-01-01",
      endDate: "2020-12-31",
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("returns indices sorted chronologically", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.supplyChainIndices.getByDateRange({
      startDate: "2025-03-01",
      endDate: "2026-02-01",
    });

    if (result.length > 1) {
      for (let i = 0; i < result.length - 1; i++) {
        const currentDate = new Date(result[i]!.date);
        const nextDate = new Date(result[i + 1]!.date);
        expect(currentDate <= nextDate).toBe(true);
      }
    }
  });
});

describe("supplyChainIndices.add", () => {
  it("adds new supply chain indices successfully", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const newIndex = {
      date: "2026-03-01",
      tpuIndex: "155.2",
      usTradeTpu: "182.5",
      tpuChange3m: "+10.5%",
      blsImportPrice: "126.1",
      blsChange: "+0.7%",
      hrcPrice: "905",
      hrcMom: "+1.5%",
      hrcYoy: "+20.2%",
      lmeAluminum: "2,845",
      lmeAlMom: "+1.4%",
      lmeAlYoy: "+19.1%",
      cmeCopper: "4.72",
      cmeCuMom: "+0.9%",
      cmeCuYoy: "+23.2%",
      dieselPrice: "4.52",
      dieselChange: "+0.04",
      cassExpenditure: "1,412.5",
      cassChange: "+1.0%",
      wciOcean: "2,340",
      wciChange: "-0.4%",
      source: "Test data",
      notes: "Test entry for unit testing",
    };

    const result = await caller.supplyChainIndices.add(newIndex);

    expect(result).toBeDefined();
  });
});

describe("Dashboard Data Integrity", () => {
  it("ensures all indices have consistent data structure", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.supplyChainIndices.getAll();

    result.forEach((index) => {
      // Check that all string fields are either string or null
      expect(typeof index.tpuIndex === "string" || index.tpuIndex === null).toBe(true);
      expect(typeof index.usTradeTpu === "string" || index.usTradeTpu === null).toBe(true);
      expect(typeof index.blsImportPrice === "string" || index.blsImportPrice === null).toBe(true);
      expect(typeof index.hrcPrice === "string" || index.hrcPrice === null).toBe(true);
      expect(typeof index.lmeAluminum === "string" || index.lmeAluminum === null).toBe(true);
      expect(typeof index.cmeCopper === "string" || index.cmeCopper === null).toBe(true);
      expect(typeof index.dieselPrice === "string" || index.dieselPrice === null).toBe(true);
      expect(typeof index.cassExpenditure === "string" || index.cassExpenditure === null).toBe(true);
      expect(typeof index.wciOcean === "string" || index.wciOcean === null).toBe(true);
    });
  });

  it("verifies 12 months of historical data exists", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.supplyChainIndices.getAll();

    // Should have at least 12 months of data (Mar 2025 - Feb 2026)
    expect(result.length).toBeGreaterThanOrEqual(12);
  });

  it("verifies latest data is from 2026", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const latest = await caller.supplyChainIndices.getLatest();

    expect(latest).not.toBeNull();
    expect(latest!.date.startsWith("2026")).toBe(true);
  });
});
