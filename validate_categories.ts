/**
 * Category Validation Script
 * Ensures category names match between frontend and database
 * Run this before deploying to catch naming mismatches early
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { newsArticles } from "./drizzle/schema";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// These MUST match the CATEGORIES array in client/src/data/newsData.ts
const EXPECTED_CATEGORIES = [
  "Tariff Regulations & Trade Policies",
  "Logistics & Transportation",
  "Materials Pricing",
  "Supply Chain Risk Management",
  "Supplier Relationship Management",
  "Sustainability & Green Supply Chain"
];

async function validateCategories() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    console.log("=== CATEGORY VALIDATION ===\n");
    
    // Get database categories
    const dbCategories = await db.select({
      category: newsArticles.category,
      count: sql<number>`count(*)`
    })
    .from(newsArticles)
    .groupBy(newsArticles.category);

    const dbCatNames = dbCategories.map(c => c.category);
    
    let hasErrors = false;
    
    // Check each expected category
    console.log("Checking category names:\n");
    for (const expectedCat of EXPECTED_CATEGORIES) {
      if (dbCatNames.includes(expectedCat)) {
        const count = dbCategories.find(c => c.category === expectedCat)?.count || 0;
        console.log(`✓ "${expectedCat}" (${count} articles)`);
      } else {
        console.log(`❌ MISSING: "${expectedCat}"`);
        hasErrors = true;
      }
    }
    
    // Check for unexpected categories
    console.log("\nChecking for unexpected categories:\n");
    for (const dbCat of dbCatNames) {
      if (!EXPECTED_CATEGORIES.includes(dbCat)) {
        const count = dbCategories.find(c => c.category === dbCat)?.count || 0;
        console.log(`⚠️  UNEXPECTED: "${dbCat}" (${count} articles)`);
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      console.log("\n❌ VALIDATION FAILED: Category mismatches detected!");
      console.log("\nTo fix:");
      console.log("  1. Run: pnpm exec tsx fix_categories.ts");
      console.log("  2. Update new_articles.json with correct category names");
      console.log("  3. Re-run this validation script");
      process.exit(1);
    } else {
      console.log("\n✅ VALIDATION PASSED: All categories match!");
    }

  } finally {
    await connection.end();
  }
}

validateCategories().catch((error) => {
  console.error("\n❌ Validation error:", error);
  process.exit(1);
});
