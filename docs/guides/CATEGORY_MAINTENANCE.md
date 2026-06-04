# Category Maintenance Guide

This guide ensures category naming consistency between the frontend and database to prevent display issues.

---

## ⚠️ Important: Category Naming Convention

**All category names MUST use ampersand (`&`) notation, NOT "and".**

### Correct Category Names

1. `Tariff Regulations & Trade Policies`
2. `Logistics & Transportation`
3. `Materials Pricing`
4. `Supply Chain Risk Management`
5. `Supplier Relationship Management`
6. `Sustainability & Green Supply Chain`

These names are defined in `client/src/data/newsData.ts` and MUST match exactly in the database.

---

## 🔧 Scripts Available

### 1. Validate Categories
**Purpose:** Check if database categories match frontend expectations

```bash
pnpm exec tsx validate_categories.ts
```

**When to run:**
- Before every deployment
- After database updates
- When adding new articles

**Output:**
```
✓ "Tariff Regulations & Trade Policies" (10 articles)
✓ "Logistics & Transportation" (10 articles)
...
✅ VALIDATION PASSED: All categories match!
```

### 2. Fix Categories
**Purpose:** Update database categories to match frontend

```bash
pnpm exec tsx fix_categories.ts
```

**When to run:**
- When validation fails
- After discovering naming mismatches

### 3. Check Categories
**Purpose:** View all categories and sample articles in database

```bash
pnpm exec tsx check_categories.ts
```

**When to run:**
- Debugging category issues
- Verifying database content

### 4. Compare Categories
**Purpose:** Detailed comparison between frontend and database

```bash
pnpm exec tsx compare_categories.ts
```

**When to run:**
- Investigating naming mismatches
- Understanding differences

---

## 📝 Adding New Articles

### Step 1: Prepare Articles JSON

Create or update `new_articles.json` with correct category names:

```json
{
  "category": "Logistics & Transportation",
  "label": "ARTICLE LABEL",
  "title": "Article Title",
  "date": "2026-01-21",
  "bullets": ["Bullet 1", "Bullet 2"],
  "link": "https://example.com/article",
  "source": "Source Name"
}
```

**⚠️ CRITICAL:** Use `&` not "and" in category names!

### Step 2: Run Database Update

```bash
pnpm exec tsx update_database.ts
```

The script automatically normalizes category names using `CATEGORY_NAME_MAP`.

### Step 3: Validate

```bash
pnpm exec tsx validate_categories.ts
```

Ensure validation passes before deploying.

---

## 🛡️ Automatic Protection

### Category Name Normalization

The `update_database.ts` script includes automatic normalization:

```typescript
const CATEGORY_NAME_MAP: Record<string, string> = {
  "Logistics and Transportation": "Logistics & Transportation",
  "Sustainability and Green Supply Chain": "Sustainability & Green Supply Chain",
  // ... other mappings
};
```

This means even if you accidentally use "and" in `new_articles.json`, it will be automatically corrected to use `&`.

---

## 🐛 Troubleshooting

### Problem: Category not displaying articles

**Symptoms:**
- Category section appears empty
- Articles exist in database but don't show on website

**Diagnosis:**
```bash
pnpm exec tsx compare_categories.ts
```

Look for mismatches like:
```
❌ MISMATCH: Frontend expects "Logistics & Transportation"
   Database has: "Logistics and Transportation"
```

**Solution:**
```bash
pnpm exec tsx fix_categories.ts
pnpm exec tsx validate_categories.ts
pm2 restart supplychain-insights
```

### Problem: New articles not appearing

**Check:**
1. Article date within 14 days?
2. Category name correct?
3. Database updated successfully?

**Verify:**
```bash
pnpm exec tsx check_categories.ts
```

---

## 📋 Pre-Deployment Checklist

Before deploying updates:

- [ ] Run `pnpm exec tsx validate_categories.ts`
- [ ] Validation passes with ✅
- [ ] All 6 categories have articles
- [ ] Test website locally
- [ ] Commit changes to Git
- [ ] Restart PM2: `pm2 restart supplychain-insights`

---

## 🔄 Regular Maintenance

### Weekly (when updating news)

1. Search for new articles (last 14 days)
2. Verify URLs accessible
3. Update `new_articles.json` with correct category names
4. Run `pnpm exec tsx update_database.ts`
5. Run `pnpm exec tsx validate_categories.ts`
6. Test website
7. Commit and push to GitHub

### Monthly

1. Review article counts by category
2. Check for outdated articles (>14 days)
3. Verify all categories balanced (4+ articles each)

---

## 📞 Support

If you encounter category issues:

1. Run diagnostic scripts
2. Check this guide
3. Review Git commit history for recent changes
4. Verify database connection

**Remember:** Always use `&` not "and" in category names! 🎯
