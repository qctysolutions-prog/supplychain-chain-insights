import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { newsArticles } from './drizzle/schema';
import dotenv from 'dotenv';

dotenv.config();

async function verifyDatabase() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL!,
    ssl: {
      rejectUnauthorized: true
    }
  });

  const db = drizzle(connection);
  const articles = await db.select().from(newsArticles);
  
  console.log('📊 Database Verification Results:\n');
  console.log(`Total articles: ${articles.length}\n`);
  
  const counts: Record<string, number> = {};
  articles.forEach(a => {
    counts[a.category] = (counts[a.category] || 0) + 1;
  });
  
  console.log('By category:');
  Object.entries(counts).forEach(([category, count]) => {
    const status = count >= 4 ? '✅' : '⚠️';
    console.log(`   ${status} ${category}: ${count} articles`);
  });
  
  await connection.end();
}

verifyDatabase();
