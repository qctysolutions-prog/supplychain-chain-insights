import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { newsArticles } from './drizzle/schema';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function importArticles() {
  console.log('📥 Importing fresh articles from fresh_articles_feb16.json...');
  
  // Read the JSON file
  const articlesData = await readFile('fresh_articles_feb16.json', 'utf-8');
  const articles = JSON.parse(articlesData);
  
  console.log(`   Found ${articles.length} articles to import`);
  
  // Connect to database
  if (!process.env.DATABASE_URL) {
    console.error('   ❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true
    }
  });
  
  const db = drizzle(connection);
  
  // Insert articles
  try {
    await db.insert(newsArticles).values(articles);
    console.log(`   ✅ Successfully imported ${articles.length} articles`);
    
    // Count articles by category
    const allArticles = await db.select().from(newsArticles);
    const categories = [
      'Tariff Regulations & Trade Policies',
      'Logistics & Transportation',
      'Materials Pricing',
      'Supply Chain Risk Management',
      'Supplier Relationship Management',
      'Sustainability & Green Supply Chain'
    ];
    
    console.log('\n📊 Current article counts by category:');
    categories.forEach(category => {
      const count = allArticles.filter(a => a.category === category).length;
      const status = count >= 4 ? '✅' : '⚠️';
      console.log(`   ${status} ${category}: ${count} articles`);
    });
    
    console.log(`\n   Total articles in database: ${allArticles.length}`);
    
  } catch (error) {
    console.error('   ❌ Error importing articles:', error);
    process.exit(1);
  }
  
  await connection.end();
  console.log('\n✅ Import complete!');
}

importArticles();
