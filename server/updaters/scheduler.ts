/**
 * In-process scheduler (no external deps, survives on any Node host).
 *
 * Schedule (UTC):
 *   - News update:    every Monday >= 06:00, once per day max
 *   - Indices update: every day    >= 07:00, once per day max
 *   - Boot catch-up:  if the last successful run is stale (news > 8 days,
 *     indices > 3 days) the job runs ~2 minutes after server start, so the
 *     site self-heals after downtime.
 *
 * Last-run state is persisted in the `update_logs` table, so restarts and
 * multiple replicas will not double-run within the same day.
 * Disable entirely with AUTO_UPDATE_DISABLED=true.
 */

import { desc, eq } from "drizzle-orm";
import { updateLogs } from "../../drizzle/schema";
import { getDb } from "../db";
import { runNewsUpdate } from "./newsUpdater";
import { runIndicesUpdate } from "./indicesUpdater";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const NEWS_STALE_MS = 8 * 24 * 60 * 60 * 1000;
const INDICES_STALE_MS = 3 * 24 * 60 * 60 * 1000;

const running = new Set<string>();

async function lastSuccess(jobType: string): Promise<Date | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(updateLogs)
    .where(eq(updateLogs.jobType, jobType))
    .orderBy(desc(updateLogs.createdAt))
    .limit(10);
  const ok = rows.find(r => r.status === "success" || r.status === "partial");
  return ok ? ok.createdAt : null;
}

function sameUtcDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

async function runJob(jobType: "news" | "indices") {
  if (running.has(jobType)) return;
  running.add(jobType);
  try {
    console.log(`[scheduler] running ${jobType} update...`);
    const result = jobType === "news" ? await runNewsUpdate() : await runIndicesUpdate();
    console.log(`[scheduler] ${jobType} update done:`, JSON.stringify(result).slice(0, 500));
  } catch (e) {
    console.error(`[scheduler] ${jobType} update failed:`, e);
    try {
      const db = await getDb();
      await db?.insert(updateLogs).values({
        jobType,
        status: "error",
        detail: e instanceof Error ? e.message : String(e),
      });
    } catch {
      /* ignore */
    }
  } finally {
    running.delete(jobType);
  }
}

async function tick(bootCatchUp = false) {
  const now = new Date();
  try {
    // News: Mondays after 06:00 UTC, or stale catch-up
    const newsLast = await lastSuccess("news");
    const newsDueWeekly =
      now.getUTCDay() === 1 &&
      now.getUTCHours() >= 6 &&
      (!newsLast || !sameUtcDay(newsLast, now));
    const newsStale =
      bootCatchUp && (!newsLast || now.getTime() - newsLast.getTime() > NEWS_STALE_MS);
    if (newsDueWeekly || newsStale) await runJob("news");

    // Indices: daily after 07:00 UTC, or stale catch-up
    const idxLast = await lastSuccess("indices");
    const idxDueDaily =
      now.getUTCHours() >= 7 && (!idxLast || !sameUtcDay(idxLast, now));
    const idxStale =
      bootCatchUp && (!idxLast || now.getTime() - idxLast.getTime() > INDICES_STALE_MS);
    if (idxDueDaily || idxStale) await runJob("indices");
  } catch (e) {
    console.error("[scheduler] tick failed:", e);
  }
}

export function startScheduler() {
  if (process.env.AUTO_UPDATE_DISABLED === "true") {
    console.log("[scheduler] disabled via AUTO_UPDATE_DISABLED");
    return;
  }
  if (!process.env.DATABASE_URL) {
    console.log("[scheduler] no DATABASE_URL, scheduler not started");
    return;
  }
  console.log("[scheduler] started (news: Mon 06:00 UTC, indices: daily 07:00 UTC)");
  setTimeout(() => tick(true), 2 * 60 * 1000); // boot catch-up after 2 min
  setInterval(() => tick(false), CHECK_INTERVAL_MS);
}
