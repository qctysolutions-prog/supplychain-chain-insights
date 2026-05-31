import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { newsArticles } from './drizzle/schema';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function importFreshNews() {
  console.log('🚀 Starting Fresh News Import...\n');

  // Connect to database
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true
    }
  });

  const db = drizzle(connection);

  // Read the fresh news articles
  const articlesJson = await readFile('./fresh_news_articles.json', 'utf-8');
  const articles = JSON.parse(articlesJson);

  console.log(`📰 Found ${articles.length} articles to import\n`);

  // Count by category
  const categoryCounts: Record<string, number> = {};
  articles.forEach((article: any) => {
    categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
  });

  console.log('📊 Category distribution:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`   - ${category}: ${count} articles`);
  });
  console.log('');

  // Insert articles into database
  try {
    await db.insert(newsArticles).values(
      articles.map((article: any) => ({
        title: article.title,
        link: article.link,
        date: article.date, // Keep as string in yyyy-mm-dd format
        category: article.category,
        label: 'Breaking', // Default label
        bullets: JSON.stringify([article.summary]) // Convert summary to bullets array
      }))
    );

    console.log('✅ Successfully imported all articles!\n');
  } catch (error) {
    console.error('❌ Error importing articles:', error);
    process.exit(1);
  }

  await connection.end();
}

importFreshNews();
