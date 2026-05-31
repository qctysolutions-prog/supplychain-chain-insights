#!/usr/bin/env node
/**
 * Import fresh articles and run the full automated update pipeline.
 * Reads fresh_articles_feb25.json and injects them into the pipeline.
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { newsArticles } from '../drizzle/schema.ts';
import { lt } from 'drizzle-orm';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

const CATEGORIES = [
  'Tariff Regulations & Trade Policies',
  'Logistics & Transportation',
  'Materials Pricing',
  'Supply Chain Risk Management',
  'Supplier Relationship Management',
  'Sustainability & Green Supply Chain'
];

const DAYS_THRESHOLD = 14;
const MIN_ARTICLES_PER_CATEGORY = 4;

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://36ExQAj7aBpiWrH.root:2nU36nZpDSxh7RNZ4V0w@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/33ZKwMqRLwJj32NQ7UM9ou?ssl={"rejectUnauthorized":true}';

let db;
async function getDb() {
  if (!db) {
    const connection = await mysql.createConnection({
      uri: DATABASE_URL,
      ssl: { rejectUnauthorized: true }
    });
    db = drizzle(connection);
  }
  return db;
}

function getDateRange() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (DAYS_THRESHOLD - 1));
  return {
    today,
    startDate,
    cutoffDate: new Date(today.getTime() - DAYS_THRESHOLD * 24 * 60 * 60 * 1000),
    todayStr: today.toISOString().split('T')[0],
    startDateStr: startDate.toISOString().split('T')[0]
  };
}

async function removeOldArticles() {
  console.log('🗑️  Removing articles older than 14 days...');
  const database = await getDb();
  const { cutoffDate } = getDateRange();

  try {
    const oldArticles = await database.select().from(newsArticles).where(lt(newsArticles.date, cutoffDate.toISOString().split('T')[0]));
    if (oldArticles.length > 0) {
      await database.delete(newsArticles).where(lt(newsArticles.date, cutoffDate.toISOString().split('T')[0]));
      console.log(`   ✅ Removed ${oldArticles.length} old articles`);
      return { removed: oldArticles.length, articles: oldArticles };
    } else {
      console.log('   ℹ️  No old articles to remove');
      return { removed: 0, articles: [] };
    }
  } catch (error) {
    console.error('   ❌ Error removing old articles:', error.message);
    return { removed: 0, articles: [], error: error.message };
  }
}

async function addNewArticles(articles) {
  console.log(`📝 Adding ${articles.length} new articles to database...`);
  if (articles.length === 0) {
    console.log('   ℹ️  No new articles to add');
    return { added: 0 };
  }
  const database = await getDb();
  try {
    await database.insert(newsArticles).values(articles);
    console.log(`   ✅ Added ${articles.length} articles`);
    return { added: articles.length };
  } catch (error) {
    console.error('   ❌ Error adding articles:', error.message);
    return { added: 0, error: error.message };
  }
}

async function getArticleCounts() {
  console.log('📊 Counting articles by category...');
  const database = await getDb();
  try {
    const allArticles = await database.select().from(newsArticles);
    const counts = {};
    CATEGORIES.forEach(category => {
      counts[category] = allArticles.filter(a => a.category === category).length;
    });
    console.log('   Category counts:');
    Object.entries(counts).forEach(([cat, count]) => {
      const status = count >= MIN_ARTICLES_PER_CATEGORY ? '✅' : '⚠️';
      console.log(`   ${status} ${cat}: ${count} articles`);
    });
    return { counts, total: allArticles.length };
  } catch (error) {
    console.error('   ❌ Error counting articles:', error.message);
    return { counts: {}, total: 0, error: error.message };
  }
}

async function generateUpdateSummary(stats) {
  console.log('📄 Generating update summary...');
  const { todayStr, startDateStr } = getDateRange();
  const filename = `docs/update-history/UPDATE_SUMMARY_${todayStr}.md`;

  // Ensure directory exists
  if (!existsSync('docs/update-history')) {
    await mkdir('docs/update-history', { recursive: true });
  }

  const summary = `# News Update Summary - ${todayStr}

**Update Date:** ${new Date().toLocaleString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

**Date Range:** ${startDateStr} to ${todayStr} (Last ${DAYS_THRESHOLD} days)

---

## Update Statistics

- **Articles Removed:** ${stats.removed || 0} (older than ${DAYS_THRESHOLD} days)
- **Articles Added:** ${stats.added || 0}
- **Total Articles:** ${stats.total || 0}

## Category Distribution

${Object.entries(stats.counts || {}).map(([cat, count]) => {
  const status = count >= MIN_ARTICLES_PER_CATEGORY ? '✅' : '⚠️';
  return `- ${status} **${cat}:** ${count} articles`;
}).join('\n')}

---

## Removed Articles

${stats.removedArticles && stats.removedArticles.length > 0
  ? stats.removedArticles.map(a => `- [${a.title}](${a.link}) - ${a.date}`).join('\n')
  : '_No articles removed_'}

---

## Added Articles

${stats.addedArticles && stats.addedArticles.length > 0
  ? stats.addedArticles.map(a => `- [${a.title}](${a.link}) - ${a.category}`).join('\n')
  : '_No articles added (manual update required)_'}

---

## Status

${stats.total >= CATEGORIES.length * MIN_ARTICLES_PER_CATEGORY
  ? '✅ **All categories have sufficient articles**'
  : '⚠️ **Some categories need more articles**'}

---

## Next Steps

1. Verify all articles display correctly on website
2. Check feedback system is working
3. Monitor scheduled task for next update
4. Review category balance if needed

---

_This summary was automatically generated by the automated news update pipeline._
`;

  try {
    await writeFile(filename, summary, 'utf-8');
    console.log(`   ✅ Summary saved to ${filename}`);
    return filename;
  } catch (error) {
    console.error('   ❌ Error saving summary:', error.message);
    return null;
  }
}

async function updateChangelog(summaryFile, stats) {
  console.log('📋 Updating CHANGELOG.md...');
  const { todayStr } = getDateRange();
  const changelogPath = 'CHANGELOG.md';

  const newEntry = `
## [${todayStr}] - Automated News Update

- Removed ${stats.removed || 0} articles older than ${DAYS_THRESHOLD} days
- Added ${stats.added || 0} new articles
- Total articles: ${stats.total || 0}
- See [detailed summary](${summaryFile}) for more information

`;

  try {
    let changelog = '';
    if (existsSync(changelogPath)) {
      changelog = await readFile(changelogPath, 'utf-8');
    } else {
      changelog = `# Changelog\n\nAll notable changes to the Mobility & Auto Supply Chain Brief will be documented in this file.\n\n`;
    }
    const lines = changelog.split('\n');
    const headerEnd = lines.findIndex(l => l.startsWith('##'));
    if (headerEnd > 0) {
      lines.splice(headerEnd, 0, newEntry);
    } else {
      lines.push(newEntry);
    }
    await writeFile(changelogPath, lines.join('\n'), 'utf-8');
    console.log('   ✅ CHANGELOG.md updated');
    return true;
  } catch (error) {
    console.error('   ❌ Error updating changelog:', error.message);
    return false;
  }
}

async function commitAndPush(message) {
  console.log('🔄 Committing changes to Git...');
  try {
    await execAsync('git add -A');
    console.log('   ✅ Changes staged');
    await execAsync(`git commit -m "${message}"`);
    console.log('   ✅ Changes committed');
    try {
      await execAsync('git push origin main');
      console.log('   ✅ Pushed to origin');
    } catch (error) {
      console.log('   ⚠️  Could not push to origin:', error.message.split('\n')[0]);
    }
    return true;
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      console.log('   ℹ️  No changes to commit');
      return true;
    }
    console.error('   ❌ Git error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Automated News Update Pipeline\n');
  console.log('='.repeat(60));

  const startTime = Date.now();
  const stats = {};

  try {
    // Load fresh articles from JSON file
    console.log('📰 Loading fresh news articles from fresh_articles_feb25.json...');
    const rawArticles = JSON.parse(readFileSync('fresh_articles_feb25.json', 'utf-8'));
    console.log(`   ✅ Loaded ${rawArticles.length} articles`);
    const { startDateStr, todayStr } = getDateRange();
    console.log(`   Date range filter: ${startDateStr} to ${todayStr}`);

    // Filter to only articles within the 14-day window
    const newArticles = rawArticles.filter(a => a.date >= startDateStr && a.date <= todayStr);
    console.log(`   ✅ ${newArticles.length} articles within date range`);
    stats.addedArticles = newArticles;

    // Remove old articles
    const removeResult = await removeOldArticles();
    stats.removed = removeResult.removed;
    stats.removedArticles = removeResult.articles || [];

    // Add new articles
    if (newArticles.length > 0) {
      const addResult = await addNewArticles(newArticles);
      stats.added = addResult.added;
    } else {
      stats.added = 0;
      console.log('\n⚠️  No new articles in date range.');
    }

    // Get current counts
    const countResult = await getArticleCounts();
    stats.counts = countResult.counts;
    stats.total = countResult.total;

    // Generate summary
    const summaryFile = await generateUpdateSummary(stats);

    // Update changelog
    if (summaryFile) {
      await updateChangelog(summaryFile, stats);
    }

    // Commit and push
    const commitMsg = `Automated news update - ${new Date().toISOString().split('T')[0]}`;
    await commitAndPush(commitMsg);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Automated News Update Pipeline Complete!');
    console.log(`   Duration: ${duration}s`);
    console.log(`   Articles removed: ${stats.removed || 0}`);
    console.log(`   Articles added: ${stats.added || 0}`);
    console.log(`   Total articles: ${stats.total || 0}`);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error);
    process.exit(1);
  }
}

main();
