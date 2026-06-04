import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { newsArticles } from "./drizzle/schema";
import { sql, lt } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

async function updateDatabase() {
  console.log("Connecting to database...");
  
  // Create connection
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Calculate the cutoff date (14 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0]; // yyyy-mm-dd format
    
    console.log(`Cutoff date: ${cutoffDateStr}`);
    
    // Step 1: Remove articles older than 14 days
    console.log("\n=== Removing articles older than 14 days ===");
    const deleteResult = await db.delete(newsArticles)
      .where(lt(newsArticles.date, cutoffDateStr));
    
    console.log(`Deleted old articles`);
    
    // Step 2: Get current articles to check for duplicates
    console.log("\n=== Checking existing articles ===");
    const existingArticles = await db.select().from(newsArticles);
    console.log(`Current articles in database: ${existingArticles.length}`);
    
    const existingUrls = new Set(existingArticles.map(a => a.link));
    
    // Step 3: Load new articles from JSON
    console.log("\n=== Loading new articles ===");
    const newArticlesPath = path.join(__dirname, "new_articles.json");
    const newArticlesData = JSON.parse(fs.readFileSync(newArticlesPath, "utf-8"));
    
    console.log(`New articles to process: ${newArticlesData.length}`);
    
    // Step 4: Filter out duplicates and insert new articles
    const articlesToInsert = newArticlesData.filter((article: any) => {
      if (existingUrls.has(article.link)) {
        console.log(`Skipping duplicate: ${article.title}`);
        return false;
      }
      return true;
    });
    
    console.log(`\n=== Inserting ${articlesToInsert.length} new articles ===`);
    
    // Category name normalization map to ensure consistency
    const CATEGORY_NAME_MAP: Record<string, string> = {
      "Logistics and Transportation": "Logistics & Transportation",
      "Sustainability and Green Supply Chain": "Sustainability & Green Supply Chain",
      "Tariff Regulations & Trade Policies": "Tariff Regulations & Trade Policies",
      "Materials Pricing": "Materials Pricing",
      "Supply Chain Risk Management": "Supply Chain Risk Management",
      "Supplier Relationship Management": "Supplier Relationship Management"
    };

    let insertedCount = 0;
    for (const article of articlesToInsert) {
      try {
        // Normalize category name to match frontend expectations
        const normalizedCategory = CATEGORY_NAME_MAP[article.category] || article.category;
        
        await db.insert(newsArticles).values({
          category: normalizedCategory,
          label: article.label,
          title: article.title,
          date: article.date,
          bullets: JSON.stringify(article.bullets),
          link: article.link,
        });
        console.log(`✓ Inserted: ${article.title}`);
        insertedCount++;
      } catch (error) {
        console.error(`✗ Failed to insert: ${article.title}`, error);
      }
    }
    
    // Step 5: Get final count by category
    console.log("\n=== Final article count by category ===");
    const finalArticles = await db.select().from(newsArticles);
    
    const categoryCounts: Record<string, number> = {};
    finalArticles.forEach(article => {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`${category}: ${count} articles`);
    });
    
    console.log(`\nTotal articles in database: ${finalArticles.length}`);
    console.log(`\n=== Update Summary ===`);
    console.log(`Articles inserted: ${insertedCount}`);
    console.log(`Articles removed: (older than ${cutoffDateStr})`);
    
  } catch (error) {
    console.error("Error updating database:", error);
    throw error;
  } finally {
    await connection.end();
    console.log("\nDatabase connection closed.");
  }
}

updateDatabase()
  .then(() => {
    console.log("\n✓ Database update completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Database update failed:", error);
    process.exit(1);
  });
