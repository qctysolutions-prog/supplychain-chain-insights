# Automated News Update System

This directory contains scripts for the fully automated news update pipeline.

## 📁 Scripts

### `automated-news-update.mjs`
Main automation script that handles the complete update workflow:
- Fetches fresh news articles (last 14 days)
- Removes articles older than 14 days from database
- Adds new articles to database
- Generates timestamped update summary
- Archives old summaries
- Updates CHANGELOG.md
- Commits and pushes to Git

**Usage:**
```bash
cd /home/ubuntu/supplychain-chain-insights
node scripts/automated-news-update.mjs
```

**Or via npm:**
```bash
pnpm run update:news
```

## 🔄 Scheduled Execution

The script is configured to run automatically via the Manus scheduled task:
- **Task Name:** "Weekly Supply Chain News Update"
- **Schedule:** Bi-weekly, every Monday at 5:00 AM
- **Timezone:** Your local timezone

## 📊 What Gets Updated

### Database
- Old articles (>14 days) are removed
- New articles are added
- Category balance is maintained (4+ articles per category)

### Documentation
- New update summary generated in `docs/update-history/`
- CHANGELOG.md updated with summary
- Old summaries archived automatically

### Git
- All changes committed with timestamp
- Pushed to both `origin` and `user_github` remotes
- GitHub repository stays in sync

## 🎯 Output

After each run, you'll find:
1. **Update Summary:** `docs/update-history/UPDATE_SUMMARY_YYYY-MM-DD.md`
2. **Updated Changelog:** `CHANGELOG.md` (latest entry at top)
3. **Git Commit:** Timestamped commit in repository
4. **Console Log:** Detailed execution log with statistics

## 🔧 Configuration

Edit these constants in `automated-news-update.mjs`:

```javascript
const DAYS_THRESHOLD = 14;              // Article age limit
const MIN_ARTICLES_PER_CATEGORY = 4;    // Minimum per category
```

## 📝 Manual Execution

To run the update manually (for testing or immediate updates):

```bash
cd /home/ubuntu/supplychain-chain-insights
node scripts/automated-news-update.mjs
```

## 🚨 Troubleshooting

### "No new articles fetched"
The script currently uses a placeholder for news fetching. Integrate with your news API by editing the `fetchNewsArticles()` function.

### "Database not available"
Ensure `DATABASE_URL` environment variable is set correctly.

### "Git push failed"
Check that both `origin` and `user_github` remotes are configured and accessible.

## 🔗 Integration Points

### News Fetching
The `fetchNewsArticles()` function needs to be implemented with your actual news source:
- Google News RSS
- NewsAPI.org
- Custom web scraping
- Or other news aggregation service

### Notification
After successful updates, you can add notification logic to alert you:
- Email digest
- Slack/Discord webhook
- Manus notification API

## 📚 Related Documentation

- `../docs/guides/AUTOMATED_NEWS_SCHEDULE_GUIDE.md` - Scheduling setup
- `../docs/guides/CATEGORY_MAINTENANCE.md` - Category naming conventions
- `../DOCUMENTATION_LIFECYCLE.md` - Documentation management guide
- `../CHANGELOG.md` - Complete change history
