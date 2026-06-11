/**
 * Automated news pipeline:
 *   1. Pull candidate articles (last 14 days) from Google News RSS per category
 *   2. Deduplicate against the database and within the batch
 *   3. Ask DeepSeek to select the most relevant items and write analytical bullets
 *   4. Insert new articles, prune articles older than 14 days (keeping >= 4 per category)
 *
 * Replaces the manual/agent-curated process that ran on Manus.
 */

import { desc, eq } from "drizzle-orm";
import { newsArticles, updateLogs } from "../../drizzle/schema";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { fetchFeed, googleNewsUrl, RssItem } from "./rss";

export const CATEGORIES = [
  "Tariff Regulations & Trade Policies",
  "Logistics & Transportation",
  "Materials Pricing",
  "Supply Chain Risk Management",
  "Supplier Relationship Management",
  "Sustainability & Green Supply Chain",
] as const;

const DAYS_THRESHOLD = 14;
const MIN_ARTICLES_PER_CATEGORY = 4;
const MAX_NEW_PER_CATEGORY = 3;
const MAX_CANDIDATES_PER_CATEGORY = 18;

/** Search queries per category (Google News RSS). */
const CATEGORY_QUERIES: Record<string, string[]> = {
  "Tariff Regulations & Trade Policies": [
    "automotive tariffs trade policy",
    "USMCA OR \"Section 232\" OR \"trade deal\" auto industry",
  ],
  "Logistics & Transportation": [
    "automotive logistics freight",
    "trucking OR ocean freight OR rail automotive supply chain",
  ],
  "Materials Pricing": [
    "steel OR aluminum OR copper prices automotive",
    "battery materials lithium nickel price auto",
  ],
  "Supply Chain Risk Management": [
    "automotive supply chain disruption risk",
    "semiconductor shortage OR plant shutdown auto production",
  ],
  "Supplier Relationship Management": [
    "automotive supplier OEM contract sourcing",
    "auto parts supplier partnership investment",
  ],
  "Sustainability & Green Supply Chain": [
    "EV battery recycling sustainability supply chain",
    "green steel OR carbon neutral automotive manufacturing",
  ],
};

type Candidate = RssItem & { dateStr: string };

function normTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 120);
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function cutoffDate(): Date {
  return new Date(Date.now() - DAYS_THRESHOLD * 24 * 60 * 60 * 1000);
}

/** Gather, filter and dedupe candidate items for one category. */
async function gatherCandidates(
  category: string,
  seenTitles: Set<string>,
  seenLinks: Set<string>
): Promise<Candidate[]> {
  const queries = CATEGORY_QUERIES[category] || [category];
  const results = await Promise.all(
    queries.map(q => fetchFeed(googleNewsUrl(q, DAYS_THRESHOLD)))
  );
  const cutoff = cutoffDate();
  const out: Candidate[] = [];
  for (const item of results.flat()) {
    if (!item.pubDate || item.pubDate < cutoff || item.pubDate > new Date(Date.now() + 86400000)) continue;
    const tKey = normTitle(item.title);
    if (!tKey || seenTitles.has(tKey) || seenLinks.has(item.link)) continue;
    seenTitles.add(tKey);
    seenLinks.add(item.link);
    out.push({ ...item, dateStr: toDateStr(item.pubDate) });
  }
  // Newest first, cap the list we send to the LLM
  out.sort((a, b) => (b.pubDate!.getTime() - a.pubDate!.getTime()));
  return out.slice(0, MAX_CANDIDATES_PER_CATEGORY);
}

type GeneratedArticle = {
  category: string;
  label: string;
  title: string;
  date: string;
  bullets: string;
  link: string;
};

/** Ask DeepSeek to select + summarize the best candidates for a category. */
async function selectAndSummarize(
  category: string,
  candidates: Candidate[]
): Promise<GeneratedArticle[]> {
  if (candidates.length === 0) return [];

  const list = candidates
    .map(
      (c, i) =>
        `${i}. [${c.dateStr}] ${c.title}${c.source ? ` — ${c.source}` : ""}${c.description ? `\n   ${c.description.slice(0, 280)}` : ""}`
    )
    .join("\n");

  const prompt = `You are the research editor of the "Mobility & Auto Supply Chain Brief", an intelligence dashboard for automotive/mobility supply chain professionals.

Category: ${category}

Below are candidate news items from the last ${DAYS_THRESHOLD} days. Select the ${MAX_NEW_PER_CATEGORY} MOST relevant and substantive items for this category (fewer if quality is low; skip duplicates, opinion pieces, press-release fluff, and items that belong in a different category).

For each selected item produce:
- "index": the candidate number
- "label": short ALL-CAPS topic label ending with month+year, e.g. "EU US TRADE DEAL JULY DEADLINE JUN 2026"
- "title": a refined, specific headline (max ~25 words)
- "bullets": exactly 3 analytical bullet strings. Each bullet must be 1-3 sentences, written for supply chain executives, citing the source name and date where possible, covering: (1) what happened, (2) key figures/scope/companies affected, (3) implication or action for automotive supply chain strategy. Base bullets only on the information given; add widely-known industry context but never invent specific figures.

Candidates:
${list}

Respond with JSON only: {"articles":[{"index":0,"label":"...","title":"...","bullets":["...","...","..."]}]}`;

  const res = await invokeLLM({
    messages: [{ role: "user", content: prompt }],
    responseFormat: { type: "json_object" },
  });
  const raw = res.choices[0]?.message?.content;
  if (typeof raw !== "string") return [];

  let parsed: { articles?: Array<{ index: number; label: string; title: string; bullets: string[] }> };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const out: GeneratedArticle[] = [];
  for (const a of parsed.articles || []) {
    const cand = candidates[a.index];
    if (!cand || !a.title || !Array.isArray(a.bullets) || a.bullets.length === 0) continue;
    out.push({
      category,
      label: String(a.label || "").slice(0, 100) || category.toUpperCase().slice(0, 100),
      title: a.title,
      date: cand.dateStr,
      bullets: JSON.stringify(a.bullets.slice(0, 3)),
      link: cand.link,
    });
    if (out.length >= MAX_NEW_PER_CATEGORY) break;
  }
  return out;
}

export type NewsUpdateResult = {
  added: number;
  removed: number;
  perCategory: Record<string, { candidates: number; added: number; total: number }>;
  errors: string[];
};

export async function runNewsUpdate(): Promise<NewsUpdateResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available (DATABASE_URL not set?)");

  const result: NewsUpdateResult = { added: 0, removed: 0, perCategory: {}, errors: [] };

  // Existing articles → dedupe sets
  const existing = await db.select().from(newsArticles);
  const seenTitles = new Set(existing.map(a => normTitle(a.title)));
  const seenLinks = new Set(existing.map(a => a.link));

  for (const category of CATEGORIES) {
    const stat = { candidates: 0, added: 0, total: 0 };
    result.perCategory[category] = stat;
    try {
      const candidates = await gatherCandidates(category, seenTitles, seenLinks);
      stat.candidates = candidates.length;
      const generated = await selectAndSummarize(category, candidates);
      for (const article of generated) {
        await db.insert(newsArticles).values(article);
        stat.added++;
        result.added++;
      }
    } catch (e) {
      result.errors.push(`${category}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Prune: remove articles older than the window, but always keep the
  // newest MIN_ARTICLES_PER_CATEGORY in each category.
  const cutoffStr = toDateStr(cutoffDate());
  for (const category of CATEGORIES) {
    try {
      const rows = await db
        .select()
        .from(newsArticles)
        .where(eq(newsArticles.category, category))
        .orderBy(desc(newsArticles.date));
      result.perCategory[category].total = rows.length;
      for (let i = MIN_ARTICLES_PER_CATEGORY; i < rows.length; i++) {
        if (rows[i].date < cutoffStr) {
          await db.delete(newsArticles).where(eq(newsArticles.id, rows[i].id));
          result.removed++;
          result.perCategory[category].total--;
        }
      }
    } catch (e) {
      result.errors.push(`prune ${category}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Log the run
  try {
    await db.insert(updateLogs).values({
      jobType: "news",
      status: result.errors.length === 0 ? "success" : result.added > 0 ? "partial" : "error",
      detail: JSON.stringify(result),
    });
  } catch {
    /* non-critical */
  }

  return result;
}
