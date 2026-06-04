import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { newsArticles } from "./drizzle/schema";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

async function checkCategories() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Get distinct categories
    const categories = await db.select({
      category: newsArticles.category,
      count: sql<number>`count(*)`
    })
    .from(newsArticles)
    .groupBy(newsArticles.category);

    console.log("Categories in database:");
    console.log("========================");
    categories.forEach(cat => {
      console.log(`"${cat.category}" -> ${cat.count} articles`);
    });

    // Get sample articles from each category
    console.log("\n\nSample articles by category:");
    console.log("=============================");
    for (const cat of categories) {
      const samples = await db.select()
        .from(newsArticles)
        .where(sql`${newsArticles.category} = ${cat.category}`)
        .limit(2);
      
      console.log(`\n${cat.category}:`);
      samples.forEach(article => {
        console.log(`  - ${article.title.substring(0, 60)}...`);
        console.log(`    Label: "${article.label}"`);
      });
    }

  } finally {
    await connection.end();
  }
}

checkCategories().catch(console.error);
