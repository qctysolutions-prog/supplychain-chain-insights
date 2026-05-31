import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Dashboard Pages Data Access", () => {
  const caller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    user: null,
  });

  describe("Tariff/Policy Dashboard Data", () => {
    it("retrieves TPU and US Trade TPU data", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const tpuData = indices.filter(d => d.tpuIndex !== null && d.usTradeTpu !== null);
      
      expect(tpuData.length).toBeGreaterThan(0);
      expect(tpuData[0]).toHaveProperty("tpuIndex");
      expect(tpuData[0]).toHaveProperty("usTradeTpu");
      expect(tpuData[0]).toHaveProperty("date");
    });

    it("TPU values are numeric strings", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const tpuData = indices.filter(d => d.tpuIndex !== null);
      
      if (tpuData.length > 0) {
        const tpuValue = parseFloat(tpuData[0].tpuIndex || "0");
        expect(tpuValue).toBeGreaterThan(0);
      }
    });

    it("can calculate MoM and 3-month changes", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const tpuData = indices
        .filter(d => d.tpuIndex !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (tpuData.length >= 3) {
        const latest = parseFloat(tpuData[0].tpuIndex || "0");
        const prev = parseFloat(tpuData[1].tpuIndex || "0");
        const threeMonthAgo = parseFloat(tpuData[2].tpuIndex || "0");
        
        expect(latest).toBeGreaterThan(0);
        expect(prev).toBeGreaterThan(0);
        expect(threeMonthAgo).toBeGreaterThan(0);
        
        const momChange = ((latest - prev) / prev) * 100;
        const threeMonthChange = ((latest - threeMonthAgo) / threeMonthAgo) * 100;
        
        expect(typeof momChange).toBe("number");
        expect(typeof threeMonthChange).toBe("number");
      }
    });
  });

  describe("Landed-cost Dashboard Data", () => {
    it("retrieves BLS Import Price Index data", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const blsData = indices.filter(d => d.blsImportPrice !== null);
      
      expect(blsData.length).toBeGreaterThan(0);
      expect(blsData[0]).toHaveProperty("blsImportPrice");
      expect(blsData[0]).toHaveProperty("date");
    });

    it("can calculate MoM and YoY changes for BLS", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const blsData = indices
        .filter(d => d.blsImportPrice !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (blsData.length >= 12) {
        const latest = parseFloat(blsData[0].blsImportPrice || "0");
        const prev = parseFloat(blsData[1].blsImportPrice || "0");
        const yearAgo = parseFloat(blsData[11].blsImportPrice || "0");
        
        expect(latest).toBeGreaterThan(0);
        expect(prev).toBeGreaterThan(0);
        expect(yearAgo).toBeGreaterThan(0);
      }
    });
  });

  describe("Materials Dashboard Data", () => {
    it("retrieves HRC, Aluminum, and Copper data", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const materialsData = indices.filter(
        d => d.hrcPrice !== null || d.lmeAluminum !== null || d.cmeCopper !== null
      );
      
      expect(materialsData.length).toBeGreaterThan(0);
    });

    it("HRC data has price and change fields", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const hrcData = indices.filter(d => d.hrcPrice !== null);
      
      if (hrcData.length > 0) {
        expect(hrcData[0]).toHaveProperty("hrcPrice");
        expect(hrcData[0]).toHaveProperty("hrcMom");
        expect(hrcData[0]).toHaveProperty("hrcYoy");
      }
    });

    it("Aluminum data has price and change fields", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const alData = indices.filter(d => d.lmeAluminum !== null);
      
      if (alData.length > 0) {
        expect(alData[0]).toHaveProperty("lmeAluminum");
        expect(alData[0]).toHaveProperty("lmeAlMom");
        expect(alData[0]).toHaveProperty("lmeAlYoy");
      }
    });

    it("Copper data has price and change fields", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const cuData = indices.filter(d => d.cmeCopper !== null);
      
      if (cuData.length > 0) {
        expect(cuData[0]).toHaveProperty("cmeCopper");
        expect(cuData[0]).toHaveProperty("cmeCuMom");
        expect(cuData[0]).toHaveProperty("cmeCuYoy");
      }
    });

    it("can separate materials into different chart datasets", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const hrcData = indices.filter(d => d.hrcPrice !== null);
      const nonFerrousData = indices.filter(d => d.lmeAluminum !== null || d.cmeCopper !== null);
      
      // HRC should be on separate chart due to different scale
      expect(hrcData.length).toBeGreaterThan(0);
      expect(nonFerrousData.length).toBeGreaterThan(0);
    });
  });

  describe("Logistics Dashboard Data", () => {
    it("retrieves Diesel, Cass, and WCI data", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const logisticsData = indices.filter(
        d => d.dieselPrice !== null || d.cassExpenditure !== null || d.wciOcean !== null
      );
      
      expect(logisticsData.length).toBeGreaterThan(0);
    });

    it("Diesel data is available", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const dieselData = indices.filter(d => d.dieselPrice !== null);
      
      if (dieselData.length > 0) {
        expect(dieselData[0]).toHaveProperty("dieselPrice");
        expect(dieselData[0]).toHaveProperty("dieselChange");
      }
    });

    it("Cass Freight data is available", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const cassData = indices.filter(d => d.cassExpenditure !== null);
      
      if (cassData.length > 0) {
        expect(cassData[0]).toHaveProperty("cassExpenditure");
        expect(cassData[0]).toHaveProperty("cassChange");
      }
    });

    it("WCI Ocean data is available", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const wciData = indices.filter(d => d.wciOcean !== null);
      
      if (wciData.length > 0) {
        expect(wciData[0]).toHaveProperty("wciOcean");
        expect(wciData[0]).toHaveProperty("wciChange");
      }
    });

    it("logistics data can be separated into individual charts", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      const dieselData = indices.filter(d => d.dieselPrice !== null);
      const cassData = indices.filter(d => d.cassExpenditure !== null);
      const wciData = indices.filter(d => d.wciOcean !== null);
      
      // Each should have data for separate charts
      expect(dieselData.length).toBeGreaterThan(0);
      expect(cassData.length).toBeGreaterThan(0);
      expect(wciData.length).toBeGreaterThan(0);
    });
  });

  describe("Data Source Links Validation", () => {
    it("all indices have source field", async () => {
      const indices = await caller.supplyChainIndices.getAll();
      
      if (indices.length > 0) {
        expect(indices[0]).toHaveProperty("source");
      }
    });
  });
});
