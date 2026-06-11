import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { newsArticles } from "./drizzle/schema";
import { sql, eq } from "drizzle-orm";

const DATABASE_URL = "mysql://36ExQAj7aBpiWrH.root:2nU36nZpDSxh7RNZ4V0w@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/33ZKwMqRLwJj32NQ7UM9ou?ssl={\"rejectUnauthorized\":true}";

async function fixCategories() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    console.log("=== FIXING CATEGORY NAMES ===\n");
    
    // Fix 1: Logistics and Transportation -> Logistics & Transportation
    console.log('1. Updating "Logistics and Transportation" to "Logistics & Transportation"');
    const result1 = await db.update(newsArticles)
      .set({ category: "Logistics & Transportation" })
      .where(eq(newsArticles.category, "Logistics and Transportation"));
    console.log(`   ✓ Updated articles\n`);
    
    // Fix 2: Sustainability and Green Supply Chain -> Sustainability & Green Supply Chain
    console.log('2. Updating "Sustainability and Green Supply Chain" to "Sustainability & Green Supply Chain"');
    const result2 = await db.update(newsArticles)
      .set({ category: "Sustainability & Green Supply Chain" })
      .where(eq(newsArticles.category, "Sustainability and Green Supply Chain"));
    console.log(`   ✓ Updated articles\n`);
    
    // Verify the fix
    console.log("=== VERIFICATION ===\n");
    const categories = await db.select({
      category: newsArticles.category,
      count: sql<number>`count(*)`
    })
    .from(newsArticles)
    .groupBy(newsArticles.category);

    console.log("Updated categories in database:");
    categories.forEach(cat => {
      console.log(`  ✓ "${cat.category}" (${cat.count} articles)`);
    });
    
    console.log("\n✅ Category names fixed successfully!");

  } finally {
    await connection.end();
  }
}

fixCategories().catch(console.error);
