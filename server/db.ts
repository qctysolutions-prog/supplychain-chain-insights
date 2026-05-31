import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, newsArticles, categoryFeedback, InsertCategoryFeedback, aluminumPricing, InsertAluminumPricing, supplyChainIndices, InsertSupplyChainIndex } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all news articles from database, sorted by date descending, limited to 8 per category
 */
export async function getAllNewsArticles() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get news articles: database not available");
    return [];
  }

  // Fetch all articles sorted by date descending
  const articles = await db.select().from(newsArticles).orderBy(desc(newsArticles.date));
  
  // Parse JSON bullets field
  const parsed = articles.map(article => ({
    ...article,
    bullets: JSON.parse(article.bullets)
  }));

  // Limit to 8 articles per category (already sorted by date desc, so most recent first)
  const categoryCount: Record<string, number> = {};
  const MAX_PER_CATEGORY = 8;
  return parsed.filter(article => {
    const count = categoryCount[article.category] || 0;
    if (count < MAX_PER_CATEGORY) {
      categoryCount[article.category] = count + 1;
      return true;
    }
    return false;
  });
}

/**
 * Get news articles by category, sorted by date descending, limited to 8 per category
 */
export async function getNewsArticlesByCategory(category: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get news articles: database not available");
    return [];
  }

  const articles = await db.select().from(newsArticles)
    .where(eq(newsArticles.category, category))
    .orderBy(desc(newsArticles.date))
    .limit(8);
  
  // Parse JSON bullets field
  return articles.map(article => ({
    ...article,
    bullets: JSON.parse(article.bullets)
  }));
}

/**
 * Submit category feedback
 */
export async function submitCategoryFeedback(feedback: InsertCategoryFeedback) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot submit feedback: database not available");
    return null;
  }

  const result = await db.insert(categoryFeedback).values(feedback);
  return result;
}

/**
 * Get all feedback for a specific category
 */
export async function getFeedbackByCategory(category: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get feedback: database not available");
    return [];
  }

  const feedback = await db.select().from(categoryFeedback).where(eq(categoryFeedback.category, category));
  return feedback;
}

/**
 * Get all aluminum pricing data, sorted by date descending
 */
export async function getAllAluminumPricing() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get aluminum pricing: database not available");
    return [];
  }

  const pricing = await db.select().from(aluminumPricing).orderBy(desc(aluminumPricing.date));
  return pricing;
}

/**
 * Get aluminum pricing data for a specific date range
 */
export async function getAluminumPricingByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get aluminum pricing: database not available");
    return [];
  }

  const pricing = await db
    .select()
    .from(aluminumPricing)
    .where(and(gte(aluminumPricing.date, startDate), lte(aluminumPricing.date, endDate)))
    .orderBy(aluminumPricing.date);
  return pricing;
}

/**
 * Add aluminum pricing data (upsert: update if exists, insert if new)
 */
export async function addAluminumPricing(pricing: InsertAluminumPricing) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add aluminum pricing: database not available");
    return null;
  }

  // Check if a record with this date already exists
  const existing = await db
    .select()
    .from(aluminumPricing)
    .where(eq(aluminumPricing.date, pricing.date))
    .limit(1);

  if (existing.length > 0) {
    // Update existing record
    const result = await db
      .update(aluminumPricing)
      .set({
        price: pricing.price,
        change: pricing.change,
        changePercent: pricing.changePercent,
        source: pricing.source,
        notes: pricing.notes,
      })
      .where(eq(aluminumPricing.date, pricing.date));
    return result;
  } else {
    // Insert new record
    const result = await db.insert(aluminumPricing).values(pricing);
    return result;
  }
}

/**
 * Get all supply chain indices data, sorted by date descending
 */
export async function getAllSupplyChainIndices() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get supply chain indices: database not available");
    return [];
  }

  const indices = await db.select().from(supplyChainIndices).orderBy(desc(supplyChainIndices.date));
  return indices;
}

/**
 * Get supply chain indices for a specific date range
 */
export async function getSupplyChainIndicesByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get supply chain indices: database not available");
    return [];
  }

  const indices = await db
    .select()
    .from(supplyChainIndices)
    .where(and(gte(supplyChainIndices.date, startDate), lte(supplyChainIndices.date, endDate)))
    .orderBy(supplyChainIndices.date);
  return indices;
}

/**
 * Get latest supply chain indices
 */
export async function getLatestSupplyChainIndices() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get supply chain indices: database not available");
    return null;
  }

  const latest = await db.select().from(supplyChainIndices).orderBy(desc(supplyChainIndices.date)).limit(1);
  return latest.length > 0 ? latest[0] : null;
}

/**
 * Add supply chain indices data (upsert pattern - insert or update based on date)
 */
export async function addSupplyChainIndices(indices: InsertSupplyChainIndex) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add supply chain indices: database not available");
    return null;
  }

  // Check if record with this date already exists
  const existing = await db.select().from(supplyChainIndices).where(eq(supplyChainIndices.date, indices.date));
  
  if (existing.length > 0) {
    // Update existing record
    const result = await db.update(supplyChainIndices)
      .set(indices)
      .where(eq(supplyChainIndices.date, indices.date));
    return result;
  } else {
    // Insert new record
    const result = await db.insert(supplyChainIndices).values(indices);
    return result;
  }
}

// ─── Subscription Helpers ────────────────────────────────────────────────────

import { subscriptions, emailAllowlist, InsertSubscription, InsertEmailAllowlist } from "../drizzle/schema";

/**
 * Check if an email is authorized to access the site.
 * Returns true if email is in the allowlist OR has an approved subscription.
 */
export async function isEmailAuthorized(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const normalizedEmail = email.toLowerCase().trim();

  // Check allowlist first
  const allowlistEntry = await db
    .select()
    .from(emailAllowlist)
    .where(eq(emailAllowlist.email, normalizedEmail))
    .limit(1);

  if (allowlistEntry.length > 0) return true;

  // Check approved subscriptions
  const approvedSub = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.email, normalizedEmail), eq(subscriptions.status, "approved")))
    .limit(1);

  return approvedSub.length > 0;
}

/**
 * Get all subscription requests (for admin panel)
 */
export async function getAllSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
}

/**
 * Get subscription by email
 */
export async function getSubscriptionByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.email, email.toLowerCase().trim()))
    .limit(1);
  return result[0] || null;
}

/**
 * Create a new subscription request
 */
export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const normalized = { ...data, email: data.email.toLowerCase().trim() };
  await db.insert(subscriptions).values(normalized);
  return getSubscriptionByEmail(normalized.email);
}

/**
 * Update subscription status (approve/deny)
 */
export async function updateSubscriptionStatus(
  id: number,
  status: "approved" | "denied",
  approvedBy: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(subscriptions)
    .set({ status, approvedBy, approvedAt: new Date(), notes: notes || null })
    .where(eq(subscriptions.id, id));
}

/**
 * Delete a subscription record
 */
export async function deleteSubscription(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(subscriptions).where(eq(subscriptions.id, id));
}

// ─── Allowlist Helpers ───────────────────────────────────────────────────────

/**
 * Get all allowlist entries
 */
export async function getAllAllowlist() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailAllowlist).orderBy(desc(emailAllowlist.createdAt));
}

/**
 * Add email to allowlist
 */
export async function addToAllowlist(data: InsertEmailAllowlist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const normalized = { ...data, email: data.email.toLowerCase().trim() };
  await db.insert(emailAllowlist).values(normalized);
}

/**
 * Bulk add emails to allowlist, skipping duplicates
 */
export async function bulkAddToAllowlist(entries: InsertEmailAllowlist[]): Promise<{ added: number; skipped: number; errors: string[] }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let added = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const entry of entries) {
    try {
      const normalized = { ...entry, email: entry.email.toLowerCase().trim() };
      // Check if already exists
      const existing = await db.select().from(emailAllowlist).where(eq(emailAllowlist.email, normalized.email)).limit(1);
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      await db.insert(emailAllowlist).values(normalized);
      added++;
    } catch (e: any) {
      errors.push(`${entry.email}: ${e.message}`);
    }
  }

  return { added, skipped, errors };
}

/**
 * Remove email from allowlist
 */
export async function removeFromAllowlist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(emailAllowlist).where(eq(emailAllowlist.id, id));
}
