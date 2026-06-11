import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * News articles table for supply chain brief
 */
export const newsArticles = mysqlTable("news_articles", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  title: text("title").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // yyyy-mm-dd format
  bullets: text("bullets").notNull(), // JSON array stored as text
  link: text("link").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;

/**
 * Category feedback table for user feedback on news categories
 */
export const categoryFeedback = mysqlTable("category_feedback", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  isRelevant: int("is_relevant").notNull(), // 1 for relevant, 0 for not relevant
  feedbackText: text("feedback_text"),
  userId: int("user_id"), // Optional: link to user if authenticated
  userEmail: varchar("user_email", { length: 320 }), // Optional: capture email for anonymous feedback
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CategoryFeedback = typeof categoryFeedback.$inferSelect;
export type InsertCategoryFeedback = typeof categoryFeedback.$inferInsert;

/**
 * Aluminum pricing index table for tracking historical aluminum prices
 */
export const aluminumPricing = mysqlTable("aluminum_pricing", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // yyyy-mm-dd format
  price: varchar("price", { length: 20 }).notNull(), // Price in USD per metric ton
  change: varchar("change", { length: 20 }), // Price change from previous period
  changePercent: varchar("change_percent", { length: 10 }), // Percentage change
  source: varchar("source", { length: 100 }).notNull(), // Data source (e.g., LME, CME)
  notes: text("notes"), // Optional notes about the price point
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AluminumPricing = typeof aluminumPricing.$inferSelect;
export type InsertAluminumPricing = typeof aluminumPricing.$inferInsert;

/**
 * Supply chain economic indices table
 * Tracks various economic indicators for supply chain risk assessment
 */
export const supplyChainIndices = mysqlTable("supply_chain_indices", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // yyyy-mm-dd format
  
  // Tariff/Policy Risk Indices
  tpuIndex: varchar("tpu_index", { length: 20 }), // Trade Policy Uncertainty Index
  usTradeTpu: varchar("us_trade_tpu", { length: 20 }), // US Trade TPU
  tpuChange3m: varchar("tpu_change_3m", { length: 20 }), // 3-month change
  
  // Import Price Index (BLS)
  blsImportPrice: varchar("bls_import_price", { length: 20 }), // BLS Import Price Index
  blsChange: varchar("bls_change", { length: 20 }), // Change from previous period
  
  // Materials Pricing
  hrcPrice: varchar("hrc_price", { length: 20 }), // Hot-Rolled Coil Steel
  hrcMom: varchar("hrc_mom", { length: 20 }), // Month-over-Month change
  hrcYoy: varchar("hrc_yoy", { length: 20 }), // Year-over-Year change
  
  lmeAluminum: varchar("lme_aluminum", { length: 20 }), // LME Aluminum
  lmeAlMom: varchar("lme_al_mom", { length: 20 }),
  lmeAlYoy: varchar("lme_al_yoy", { length: 20 }),
  
  cmeCopper: varchar("cme_copper", { length: 20 }), // CME Copper
  cmeCuMom: varchar("cme_cu_mom", { length: 20 }),
  cmeCuYoy: varchar("cme_cu_yoy", { length: 20 }),
  
  // Logistics Costs
  dieselPrice: varchar("diesel_price", { length: 20 }), // Diesel fuel price
  dieselChange: varchar("diesel_change", { length: 20 }),
  
  cassExpenditure: varchar("cass_expenditure", { length: 20 }), // Cass Freight Index
  cassChange: varchar("cass_change", { length: 20 }),
  
  wciOcean: varchar("wci_ocean", { length: 20 }), // World Container Index
  wciChange: varchar("wci_change", { length: 20 }),
  
  source: varchar("source", { length: 200 }), // Data sources
  notes: text("notes"), // Optional notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SupplyChainIndex = typeof supplyChainIndices.$inferSelect;
export type InsertSupplyChainIndex = typeof supplyChainIndices.$inferInsert;

/**
 * Subscription requests table
 * Tracks user requests for access to the site
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  organization: varchar("organization", { length: 200 }),
  reason: text("reason"), // Why they want access
  status: mysqlEnum("status", ["pending", "approved", "denied"]).default("pending").notNull(),
  approvedBy: varchar("approved_by", { length: 200 }), // Admin who approved/denied
  approvedAt: timestamp("approved_at"),
  notes: text("notes"), // Admin notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Email allowlist table
 * Admin-managed list of emails that have direct access without going through subscription flow
 */
export const emailAllowlist = mysqlTable("email_allowlist", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 200 }),
  addedBy: varchar("added_by", { length: 200 }).notNull(), // Admin who added them
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmailAllowlist = typeof emailAllowlist.$inferSelect;
export type InsertEmailAllowlist = typeof emailAllowlist.$inferInsert;

/**
 * Update logs table
 * Records every automated update run (news / indices) for monitoring and
 * to prevent duplicate runs across server restarts.
 */
export const updateLogs = mysqlTable("update_logs", {
  id: int("id").autoincrement().primaryKey(),
  jobType: varchar("job_type", { length: 32 }).notNull(), // 'news' | 'indices'
  status: varchar("status", { length: 16 }).notNull(), // 'success' | 'partial' | 'error'
  detail: text("detail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UpdateLog = typeof updateLogs.$inferSelect;
export type InsertUpdateLog = typeof updateLogs.$inferInsert;