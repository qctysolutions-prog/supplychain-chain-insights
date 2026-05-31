# Automated News Update Schedule Guide

This guide explains how to set up automated scheduled tasks to keep your supply chain brief updated with fresh news articles.

---

## Overview

You can schedule automatic news updates using Manus's built-in scheduling system. This will:

- ✅ Fetch fresh news articles from the last 14 days
- ✅ Update the database with new articles
- ✅ Remove articles older than 14 days
- ✅ Maintain at least 4 articles per category
- ✅ Run automatically on your chosen schedule (weekly, daily, etc.)

---

## Option 1: Using Manus Schedule Tool (Recommended)

The easiest way is to use the `schedule` tool that I can configure for you.

### Weekly Update Schedule

I can set up a weekly update that runs every Monday at 6:00 AM:

```
Schedule: Every Monday at 6:00 AM
Task: Fetch and update news articles across all 6 categories
Duration: ~5-10 minutes
```

### What the Automated Task Does:

1. **Search for recent news** (last 14 days) across all categories:
   - Tariff Regulations & Trade Policies
   - Logistics and Transportation
   - Materials Pricing
   - Supply Chain Risk Management
   - Supplier Relationship Management
   - Sustainability and Green Supply Chain

2. **Verify news sources** - Ensure no 404 or expired pages

3. **Update database** - Add new articles and remove old ones

4. **Maintain quality** - Ensure at least 4 articles per category

5. **Notify you** - Send notification when update completes

---

## Option 2: Manual Trigger via API

You can also create a tRPC endpoint to manually trigger news updates.

### Implementation:

**1. Create News Update Script (`server/newsUpdater.ts`):**

```typescript
import { getDb } from "./db";
import { newsArticles } from "../drizzle/schema";
import { lt } from "drizzle-orm";

export async function updateNewsArticles() {
  // This would integrate with news APIs or web scraping
  // For now, this is a placeholder structure
  
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Remove articles older than 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  await db.delete(newsArticles)
    .where(lt(newsArticles.publishDate, fourteenDaysAgo));

  // Fetch new articles (integrate with news API)
  const newArticles = await fetchLatestNews();
  
  // Insert new articles
  for (const article of newArticles) {
    await db.insert(newsArticles).values(article);
  }

  return {
    removed: articlesRemoved,
    added: newArticles.length,
    timestamp: new Date()
  };
}

async function fetchLatestNews() {
  // TODO: Integrate with news APIs like:
  // - NewsAPI.org
  // - Google News API
  // - RSS feeds from industry sources
  // - Web scraping with Puppeteer
  
  return [];
}
```

**2. Add tRPC Endpoint (`server/routers.ts`):**

```typescript
import { updateNewsArticles } from "./newsUpdater";

export const appRouter = router({
  // ... existing routers
  
  news: router({
    // ... existing news routes
    
    updateArticles: protectedProcedure
      .mutation(async () => {
        const result = await updateNewsArticles();
        return result;
      }),
  }),
});
```

**3. Create Admin UI Button:**

```typescript
// In admin dashboard
const updateMutation = trpc.news.updateArticles.useMutation();

<Button 
  onClick={() => updateMutation.mutate()}
  disabled={updateMutation.isLoading}
>
  {updateMutation.isLoading ? "Updating..." : "Update News"}
</Button>
```

---

## Option 3: External Cron Job

If you want to run updates from an external server:

### Using GitHub Actions:

**`.github/workflows/update-news.yml`:**

```yaml
name: Update News Articles

on:
  schedule:
    # Run every Monday at 6:00 AM UTC
    - cron: '0 6 * * 1'
  workflow_dispatch: # Allow manual trigger

jobs:
  update-news:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger News Update
        run: |
          curl -X POST https://your-site.manus.space/api/trpc/news.updateArticles \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.API_TOKEN }}"
```

---

## News Source Integration

To fetch real news automatically, you'll need to integrate with news APIs:

### Recommended News APIs:

**1. NewsAPI.org**
- Free tier: 100 requests/day
- Coverage: 80,000+ sources
- Good for: General news search

```typescript
const response = await fetch(
  `https://newsapi.org/v2/everything?` +
  `q=automotive+tariffs&` +
  `from=${fourteenDaysAgo}&` +
  `language=en&` +
  `sortBy=publishedAt&` +
  `apiKey=${process.env.NEWS_API_KEY}`
);
```

**2. Google News RSS**
- Free
- No API key needed
- Good for: Topic-specific feeds

```typescript
const rssUrl = `https://news.google.com/rss/search?q=automotive+supply+chain&hl=en-US&gl=US&ceid=US:en`;
// Parse with rss-parser library
```

**3. Industry-Specific Sources**
- Automotive Logistics (automotivelogistics.media)
- Supply Chain Dive (supplychaindive.com)
- Reuters Automotive
- Trade compliance blogs

**4. Web Scraping**
- Use Puppeteer or Playwright
- Respect robots.txt
- Cache results to avoid rate limiting

---

## Schedule Configuration Examples

### Daily Updates (Every morning at 6 AM):
```
Cron: 0 6 * * *
Frequency: Daily
Best for: High-traffic sites needing fresh content
```

### Weekly Updates (Every Monday at 6 AM):
```
Cron: 0 6 * * 1
Frequency: Weekly
Best for: Weekly briefings (your current use case)
```

### Bi-weekly Updates (1st and 15th of month):
```
Cron: 0 6 1,15 * *
Frequency: Twice per month
Best for: Less frequent updates
```

---

## Implementation Steps

### To Set Up Automated Weekly Updates:

**Step 1: I'll create the schedule for you**
Just confirm:
- Frequency: Weekly (every Monday)
- Time: 6:00 AM (your timezone)
- Notification: Yes, notify when complete

**Step 2: News API Integration**
Choose your news source:
- Option A: I integrate NewsAPI.org (requires API key)
- Option B: I set up Google News RSS parsing (free, no key)
- Option C: I create web scraping for specific sources

**Step 3: Testing**
- Run first update manually
- Verify articles are current
- Check all categories have 4+ articles

**Step 4: Monitoring**
- Receive notifications after each update
- Check logs for any errors
- Review new articles weekly

---

## Cost Considerations

| Method | Cost | Pros | Cons |
|--------|------|------|------|
| Manus Schedule | Included | Easy, built-in, reliable | Runs in sandbox |
| NewsAPI Free | Free (100/day) | Simple API, good coverage | Rate limited |
| NewsAPI Paid | $449/month | Unlimited, commercial use | Expensive |
| Google News RSS | Free | No limits, no key | Less structured data |
| Web Scraping | Free | Full control | Maintenance required |

---

## Monitoring & Notifications

After each scheduled update, you'll receive:

1. **Success notification** with summary:
   - Articles added
   - Articles removed
   - Current article count per category

2. **Error notification** if update fails:
   - Error details
   - Failed categories
   - Suggested actions

3. **Weekly report** (optional):
   - Total articles updated
   - Most popular categories (by feedback)
   - User engagement metrics

---

## Best Practices

1. **Test thoroughly** - Run manual updates first
2. **Monitor initially** - Check first few automated runs
3. **Have fallback** - Keep manual update option
4. **Verify sources** - Regularly check article quality
5. **User feedback** - Use relevance data to improve selection
6. **Backup data** - Keep old articles in archive table

---

## Troubleshooting

### No New Articles Found
- Check API rate limits
- Verify search keywords
- Expand date range temporarily
- Check news source availability

### Duplicate Articles
- Add URL uniqueness check
- Compare titles with fuzzy matching
- Track article IDs from source

### Category Imbalance
- Adjust search terms per category
- Use multiple news sources
- Manual curation for sparse categories

---

## Next Steps

**Ready to set up automated updates?**

I can:
1. ✅ Create the scheduled task (weekly Monday 6 AM)
2. ✅ Integrate Google News RSS (free, no API key needed)
3. ✅ Set up notifications
4. ✅ Add manual trigger button in admin panel

Just let me know and I'll implement this for you!

---

## Quick Start Command

If you want me to set this up now, just say:

> "Set up weekly news updates every Monday at 6 AM using Google News RSS"

And I'll:
- Create the news fetching script
- Set up the schedule
- Test the first update
- Show you how to monitor it
