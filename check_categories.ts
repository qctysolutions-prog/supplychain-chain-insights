import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { newsArticles } from "./drizzle/schema";
import { sql } from "drizzle-orm";

const DATABASE_URL = "mysql://36ExQAj7aBpiWrH.root:2nU36nZpDSxh7RNZ4V0w@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/33ZKwMqRLwJj32NQ7UM9ou?ssl={\"rejectUnauthorized\":true}";

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
