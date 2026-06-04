import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { newsArticles } from "./drizzle/schema";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Frontend categories
const FRONTEND_CATEGORIES = [
  "Tariff Regulations & Trade Policies",
  "Logistics & Transportation",
  "Materials Pricing",
  "Supply Chain Risk Management",
  "Supplier Relationship Management",
  "Sustainability & Green Supply Chain"
];

async function compareCategories() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Get database categories
    const dbCategories = await db.select({
      category: newsArticles.category,
      count: sql<number>`count(*)`
    })
    .from(newsArticles)
    .groupBy(newsArticles.category);

    console.log("=== CATEGORY COMPARISON ===\n");
    
    console.log("Frontend Categories:");
    FRONTEND_CATEGORIES.forEach((cat, i) => {
      console.log(`  ${i+1}. "${cat}"`);
    });

    console.log("\nDatabase Categories:");
    dbCategories.forEach((cat, i) => {
      console.log(`  ${i+1}. "${cat.category}" (${cat.count} articles)`);
    });

    console.log("\n=== MISMATCH ANALYSIS ===\n");
    
    const dbCatNames = dbCategories.map(c => c.category);
    
    FRONTEND_CATEGORIES.forEach(frontendCat => {
      const exactMatch = dbCatNames.includes(frontendCat);
      if (!exactMatch) {
        console.log(`❌ MISMATCH: Frontend expects "${frontendCat}"`);
        
        // Find similar
        const similar = dbCatNames.find(dbCat => 
          dbCat.toLowerCase().replace(/[&\s]/g, '') === 
          frontendCat.toLowerCase().replace(/[&\s]/g, '')
        );
        
        if (similar) {
          console.log(`   Database has: "${similar}"`);
          console.log(`   → Need to update database from "${similar}" to "${frontendCat}"\n`);
        } else {
          console.log(`   → No similar category found in database!\n`);
        }
      } else {
        console.log(`✓ MATCH: "${frontendCat}"`);
      }
    });

  } finally {
    await connection.end();
  }
}

compareCategories().catch(console.error);
