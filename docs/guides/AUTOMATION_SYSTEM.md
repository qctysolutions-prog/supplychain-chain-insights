# Automation System Documentation

Complete guide to the fully automated news update system for the Mobility & Auto Supply Chain Brief.

---

## 🎯 Overview

The automation system handles the complete news update workflow without manual intervention:

1. **News Fetching** - Retrieves fresh articles from the last 14 days
2. **Database Management** - Removes old articles, adds new ones
3. **Documentation** - Generates update summaries and maintains changelog
4. **Version Control** - Commits and pushes changes to Git
5. **Scheduling** - Runs automatically every Monday at 5:00 AM

---

## 📁 System Architecture

```
supplychain-chain-insights/
├── scripts/
│   ├── automated-news-update.mjs    # Main automation script
│   └── README.md                     # Script documentation
├── docs/
│   ├── update-history/               # Timestamped update summaries
│   ├── bug-fixes/                    # Bug fix reports
│   └── guides/                       # Configuration guides
├── CHANGELOG.md                      # Master change log
└── package.json                      # npm scripts
```

---

## 🚀 How It Works

### Automated Workflow

**Every Monday at 5:00 AM:**

```
1. Fetch News Articles
   ↓
2. Remove Old Articles (>14 days)
   ↓
3. Add New Articles
   ↓
4. Count Articles by Category
   ↓
5. Generate Update Summary
   ↓
6. Update CHANGELOG.md
   ↓
7. Commit to Git
   ↓
8. Push to GitHub
   ↓
9. Notify Owner (optional)
```

### Manual Execution

Run the update pipeline manually:

```bash
# Option 1: Direct execution
cd /home/ubuntu/supplychain-chain-insights
node scripts/automated-news-update.mjs

# Option 2: Via npm script
pnpm run update:news
```

---

## 📊 What Gets Updated

### Database

**Removed:**
- All articles with `publishedDate` older than 14 days
- Logged in update summary

**Added:**
- Fresh articles from news sources
- Verified URLs and dates
- Minimum 4 articles per category maintained

**Categories:**
1. Tariff Regulations & Trade Policies
2. Logistics & Transportation
3. Materials Pricing
4. Supply Chain Risk Management
5. Supplier Relationship Management
6. Sustainability & Green Supply Chain

### Documentation

**Generated:**
- `docs/update-history/UPDATE_SUMMARY_YYYY-MM-DD.md`
  - Timestamped summary
  - Statistics (added/removed/total)
  - Category distribution
  - Article lists

**Updated:**
- `CHANGELOG.md` - New entry added at top
- Includes summary link and statistics

**Archived:**
- Old summaries moved to `docs/update-history/`
- Bug reports moved to `docs/bug-fixes/`
- Guides organized in `docs/guides/`

### Version Control

**Git Operations:**
```bash
git add -A                           # Stage all changes
git commit -m "Automated news..."    # Commit with timestamp
git push origin main                 # Push to Manus origin
git push user_github main            # Push to GitHub
```

---

## ⚙️ Configuration

### Environment Variables

Required in `.env` or system environment:

```bash
DATABASE_URL=mysql://...             # MySQL connection string
```

### Script Configuration

Edit `scripts/automated-news-update.mjs`:

```javascript
// Article age threshold (days)
const DAYS_THRESHOLD = 14;

// Minimum articles per category
const MIN_ARTICLES_PER_CATEGORY = 4;

// Category definitions
const CATEGORIES = [
  'Tariff Regulations & Trade Policies',
  'Logistics & Transportation',
  // ... etc
];
```

### Scheduled Task

**Current Schedule:**
- **Frequency:** Bi-weekly
- **Day:** Every Monday
- **Time:** 5:00 AM (your timezone)
- **Task Name:** "Weekly Supply Chain News Update"

**Modify Schedule:**
Tell Manus: "Change update time to [new time]"

---

## 📝 Output Examples

### Update Summary

```markdown
# News Update Summary - 2026-01-26

**Update Date:** Monday, January 26, 2026, 05:00 AM
**Date Range:** 2026-01-13 to 2026-01-26 (Last 14 days)

## Update Statistics
- Articles Removed: 12 (older than 14 days)
- Articles Added: 15
- Total Articles: 64

## Category Distribution
- ✅ Tariff Regulations & Trade Policies: 11 articles
- ✅ Logistics & Transportation: 10 articles
...
```

### CHANGELOG Entry

```markdown
## [2026-01-26] - Automated News Update

- Removed 12 articles older than 14 days
- Added 15 new articles
- Total articles: 64
- See [detailed summary](docs/update-history/UPDATE_SUMMARY_2026-01-26.md)
```

### Git Commit

```
Automated news update - 2026-01-26

- Removed 12 old articles
- Added 15 new articles
- Generated update summary
- Updated CHANGELOG.md
```

---

## 🔍 Monitoring

### Check Last Update

```bash
# View latest changelog entry
head -20 CHANGELOG.md

# View latest update summary
ls -lt docs/update-history/ | head -5

# Check git history
git log --oneline -5
```

### Verify Database

```bash
# Count articles by category
pnpm exec tsx validate_categories.ts

# Or via SQL
mysql -e "SELECT category, COUNT(*) FROM news_articles GROUP BY category"
```

### Check Scheduled Task

Ask Manus: "Show my scheduled tasks"

---

## 🐛 Troubleshooting

### Issue: No New Articles

**Symptom:** Update runs but no articles added

**Cause:** News fetching placeholder not implemented

**Solution:** Integrate news API in `fetchNewsArticles()` function

```javascript
async function fetchNewsArticles() {
  // TODO: Implement actual news fetching
  // Options:
  // - Google News RSS
  // - NewsAPI.org
  // - Custom web scraping
  return [];
}
```

### Issue: Database Connection Failed

**Symptom:** "Database not available" error

**Solution:**
1. Check `DATABASE_URL` environment variable
2. Verify database is running
3. Test connection manually

### Issue: Git Push Failed

**Symptom:** "Git push failed" error

**Solution:**
1. Check remote configuration: `git remote -v`
2. Verify authentication (SSH keys or tokens)
3. Ensure both remotes are accessible

### Issue: Category Mismatch

**Symptom:** Articles not displaying on website

**Solution:**
```bash
# Validate categories
pnpm exec tsx validate_categories.ts

# Fix mismatches
pnpm exec tsx fix_categories.ts
```

---

## 🔗 Integration Points

### News Sources

**Current:** Placeholder (manual integration required)

**Recommended Options:**

1. **Google News RSS** (Free)
   ```javascript
   const RSS_FEEDS = {
     'Tariff Regulations': 'https://news.google.com/rss/search?q=tariffs+automotive',
     // ... etc
   };
   ```

2. **NewsAPI.org** (100 requests/day free)
   ```javascript
   const response = await fetch(
     `https://newsapi.org/v2/everything?q=supply+chain&apiKey=${API_KEY}`
   );
   ```

3. **Custom Web Scraping**
   - Industry-specific sources
   - Automotive news sites
   - Supply chain publications

### Notifications

**Add Owner Notification:**

```javascript
import { notifyOwner } from '../server/_core/notification.js';

// After successful update
await notifyOwner({
  title: 'News Update Complete',
  content: `Updated ${stats.total} articles. See CHANGELOG for details.`
});
```

### Publishing

**Auto-publish to www.ocuosh.com:**

The scheduled task should trigger:
1. Database update
2. Documentation generation
3. Git commit/push
4. Automatic deployment to www.ocuosh.com

---

## 📚 Related Documentation

- `../AUTOMATION_SYSTEM.md` - This file
- `AUTOMATED_NEWS_SCHEDULE_GUIDE.md` - Scheduling setup
- `CATEGORY_MAINTENANCE.md` - Category conventions
- `../../DOCUMENTATION_LIFECYCLE.md` - Doc management
- `../../CHANGELOG.md` - Complete history
- `../../scripts/README.md` - Script details

---

## 🎓 Best Practices

### Before Deployment

1. Test automation script manually
2. Verify all categories display correctly
3. Check Git remotes are configured
4. Ensure DATABASE_URL is set
5. Validate category naming conventions

### After Each Update

1. Review update summary
2. Verify article counts per category
3. Check website displays correctly
4. Monitor feedback submissions
5. Review changelog for accuracy

### Maintenance

1. **Weekly:** Review automated updates
2. **Monthly:** Archive old summaries
3. **Quarterly:** Audit news sources
4. **Annually:** Review automation logic

---

## 🚀 Future Enhancements

Planned improvements:

- [ ] Integrate live news API
- [ ] Add email notifications
- [ ] Implement article deduplication
- [ ] Add article quality scoring
- [ ] Create admin dashboard
- [ ] Add rollback capability
- [ ] Implement A/B testing for sources
- [ ] Add article sentiment analysis

---

_Last Updated: 2026-01-26_
_Maintained by: Manus AI Automation System_
