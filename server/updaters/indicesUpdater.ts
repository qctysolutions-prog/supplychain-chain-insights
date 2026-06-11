/**
 * Automated economic index updater.
 * Pulls free public series from FRED (no API key) and writes a fresh row into
 * supply_chain_indices (+ aluminum_pricing) so dashboards stay current.
 *
 * Series used:
 *   EPUTRADE          Trade Policy Uncertainty (Baker/Bloom/Davis categorical EPU, monthly)
 *   IR                BLS Import Price Index: All Commodities (monthly)
 *   WPU10170301       PPI: Hot Rolled Steel Sheet & Strip (monthly, index Jun 1982=100)
 *   PALUMUSDM         Global Aluminum price, USD/tonne (monthly)
 *   PCOPPUSDM         Global Copper price, USD/tonne (monthly) → converted to USD/lb
 *   GASDESW           US Diesel retail price, USD/gallon (weekly, EIA)
 *   FRGEXPUSM649NCIS  Cass Freight Index: Expenditures (monthly)
 *
 * Drewry WCI (ocean container) has no free machine-readable source; the most
 * recent stored value is carried forward and flagged in `notes`.
 */

import { desc } from "drizzle-orm";
import { aluminumPricing, supplyChainIndices, updateLogs } from "../../drizzle/schema";
import { getDb } from "../db";
import { fetchFredSeries, fmt, snapshot } from "./fred";

export type IndicesUpdateResult = {
  date: string;
  fetched: string[];
  missing: string[];
  carriedForward: string[];
};

export async function runIndicesUpdate(): Promise<IndicesUpdateResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available (DATABASE_URL not set?)");

  const today = new Date().toISOString().split("T")[0];
  const fetched: string[] = [];
  const missing: string[] = [];
  const carriedForward: string[] = [];

  const [tpu, importPrice, hrc, aluminum, copper, diesel, cass] = await Promise.all([
    fetchFredSeries("EPUTRADE"),
    fetchFredSeries("IR"),
    fetchFredSeries("WPU10170301"),
    fetchFredSeries("PALUMUSDM"),
    fetchFredSeries("PCOPPUSDM"),
    fetchFredSeries("GASDESW"),
    fetchFredSeries("FRGEXPUSM649NCIS"),
  ]);

  const tpuS = snapshot(tpu);
  const irS = snapshot(importPrice);
  const hrcS = snapshot(hrc);
  const alS = snapshot(aluminum);
  const cuS = snapshot(copper);
  const dieselS = snapshot(diesel, 52);
  const cassS = snapshot(cass);

  const track = (name: string, ok: unknown) => (ok ? fetched.push(name) : missing.push(name));
  track("EPUTRADE", tpuS);
  track("IR", irS);
  track("WPU10170301", hrcS);
  track("PALUMUSDM", alS);
  track("PCOPPUSDM", cuS);
  track("GASDESW", dieselS);
  track("FRGEXPUSM649NCIS", cassS);

  // Previous stored row (for WCI carry-forward)
  const prevRows = await db
    .select()
    .from(supplyChainIndices)
    .orderBy(desc(supplyChainIndices.date))
    .limit(1);
  const prev = prevRows[0];

  const wciOcean = prev?.wciOcean ?? null;
  const wciChange = prev?.wciOcean ? "carried fwd" : null;
  if (wciOcean) carriedForward.push("WCI (Drewry)");

  const cuPerLb = cuS ? cuS.latest.value / 2204.62 : null;

  const row = {
    date: today,
    // Trade policy uncertainty (EPU trade-policy categorical index)
    tpuIndex: tpuS ? fmt.num(tpuS.latest.value, 1) : prev?.tpuIndex ?? null,
    usTradeTpu: tpuS ? fmt.num(tpuS.latest.value, 1) : prev?.usTradeTpu ?? null,
    tpuChange3m: tpuS && tpu.length > 3
      ? fmt.pct(((tpuS.latest.value - tpu[tpu.length - 4].value) / tpu[tpu.length - 4].value) * 100)
      : prev?.tpuChange3m ?? null,
    // BLS import price index
    blsImportPrice: irS ? fmt.num(irS.latest.value, 1) : prev?.blsImportPrice ?? null,
    blsChange: irS ? fmt.pct(irS.momPct) : prev?.blsChange ?? null,
    // Materials
    hrcPrice: hrcS ? fmt.num(hrcS.latest.value, 1) : prev?.hrcPrice ?? null,
    hrcMom: hrcS ? fmt.pct(hrcS.momPct) : prev?.hrcMom ?? null,
    hrcYoy: hrcS ? fmt.pct(hrcS.yoyPct) : prev?.hrcYoy ?? null,
    lmeAluminum: alS ? fmt.num(alS.latest.value, 0) : prev?.lmeAluminum ?? null,
    lmeAlMom: alS ? fmt.pct(alS.momPct) : prev?.lmeAlMom ?? null,
    lmeAlYoy: alS ? fmt.pct(alS.yoyPct) : prev?.lmeAlYoy ?? null,
    cmeCopper: cuPerLb !== null ? cuPerLb.toFixed(2) : prev?.cmeCopper ?? null,
    cmeCuMom: cuS ? fmt.pct(cuS.momPct) : prev?.cmeCuMom ?? null,
    cmeCuYoy: cuS ? fmt.pct(cuS.yoyPct) : prev?.cmeCuYoy ?? null,
    // Logistics
    dieselPrice: dieselS ? dieselS.latest.value.toFixed(2) : prev?.dieselPrice ?? null,
    dieselChange: dieselS ? fmt.signed(dieselS.prevChange, 2) : prev?.dieselChange ?? null,
    cassExpenditure: cassS ? fmt.num(cassS.latest.value, 1) : prev?.cassExpenditure ?? null,
    cassChange: cassS ? fmt.pct(cassS.momPct) : prev?.cassChange ?? null,
    wciOcean,
    wciChange,
    source:
      "FRED: EPUTRADE (TPU), BLS IR, PPI WPU10170301 (HRC), PALUMUSDM, PCOPPUSDM, EIA GASDESW, Cass FRGEXPUSM649NCIS",
    notes:
      `Auto-fetched ${today}. ` +
      (missing.length ? `Missing: ${missing.join(", ")}. ` : "") +
      (carriedForward.length ? `Carried forward: ${carriedForward.join(", ")}. ` : "") +
      "HRC reported as PPI index (Jun 1982=100); aluminum/copper are IMF global benchmark prices (USD/t, USD/lb).",
  };

  await db.insert(supplyChainIndices).values(row);

  // Also append to the aluminum pricing history table
  if (alS) {
    await db.insert(aluminumPricing).values({
      date: alS.latest.date,
      price: fmt.num(alS.latest.value, 0),
      change: fmt.signed(alS.prevChange, 0),
      changePercent: fmt.pct(alS.momPct),
      source: "IMF/FRED PALUMUSDM",
      notes: `Auto-fetched ${today}`,
    });
  }

  const result: IndicesUpdateResult = { date: today, fetched, missing, carriedForward };

  try {
    await db.insert(updateLogs).values({
      jobType: "indices",
      status: missing.length === 0 ? "success" : "partial",
      detail: JSON.stringify(result),
    });
  } catch {
    /* non-critical */
  }

  return result;
}
