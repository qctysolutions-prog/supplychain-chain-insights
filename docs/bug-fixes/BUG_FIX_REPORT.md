# Bug Fix Report - Articles Not Displaying

**Date:** January 17, 2026
**Issue:** Logistics & Transportation and Sustainability & Green Supply Chain articles not displaying on website

---

## Problem Identified

**Root Cause:** Category name mismatch between database and frontend code.

### Database Category Names (with "and"):
- `Logistics and Transportation`
- `Sustainability and Green Supply Chain`

### Frontend CATEGORIES Constant (with "&"):
- `Logistics & Transportation`
- `Sustainability & Green Supply Chain`

**Impact:** The frontend filter `article.category === category` failed to match articles, causing 8 articles (4 per category) to not display despite being present in the database.

---

## Solution Applied

Updated database category names to match frontend format using SQL:

```sql
UPDATE news_articles 
SET category = 'Logistics & Transportation' 
WHERE category = 'Logistics and Transportation';

UPDATE news_articles 
SET category = 'Sustainability & Green Supply Chain' 
WHERE category = 'Sustainability and Green Supply Chain';
```

---

## Verification Results

### ✅ All 24 Articles Now Displaying Correctly

**1. Tariff Regulations & Trade Policies** - 4 articles ✓
- Trump 2.0 tariff tracker
- Tariffs in 2026: How new trade rules impact your business
- Trump says trade agreement with Mexico, Canada 'irrelevant' to US
- Automakers urge U.S. to stay in USMCA

**2. Logistics & Transportation** - 4 articles ✓ (FIXED)
- Trends shaping mobility, logistics and manufacturing in 2026
- The road haulage sector's recovery is set to stay in the slow lane
- Supply Chain Chaos Meets Its Match in 2026
- The Changing Landscape of Global Trade Routes in 2026

**3. Materials Pricing** - 4 articles ✓
- 2026 Automotive Supplier Outlook
- US Auto Production Trends: EV Strategy and Changes
- Lithium Prices Surge Amid Strong Demand Forecasts
- Lithium Market: Real-Time Price Data and Analysis

**4. Supply Chain Risk Management** - 4 articles ✓
- Sphera Supply Chain Risk Report 2026
- Are You Prepared for the Supply Chain Disruptions of 2026?
- Supplier Financial Distress: What It Means for Your Fleet in 2026
- Global Automotive Outlook: Predictions For 2026

**5. Supplier Relationship Management** - 4 articles ✓
- Gap Between Best And Worst Automaker-Supplier Trust Hits 17 Years
- Strategic partnerships: 50% of suppliers pursuing OEM collaboration
- Stop chasing annual productivity—rethinking supplier relationships
- Navigating Stormy Seas - How Suppliers Survive Economic Uncertainty

**6. Sustainability & Green Supply Chain** - 4 articles ✓ (FIXED)
- IEA: What's Next for EVs, Sustainability & The Car Industry?
- China implements strict EV battery recycling rules for 2026
- To make EVs greener, Colorado lawmakers could require recycled batteries
- BMW and Encory Open Recycling Center to Recover Battery Materials

---

## Prevention Measures

**Recommendation:** Update the seed script (`server/seed-fresh-news.mjs`) to use consistent category naming with ampersands (&) instead of "and" to prevent future mismatches.

**Future Consideration:** Add a database constraint or enum to enforce valid category names at the schema level.

---

## Status

✅ **Bug Fixed**
✅ **All Articles Verified**
✅ **Website Fully Functional**

**Total Articles:** 24/24 displaying correctly
**Categories:** 6/6 working properly
**Date Range:** 2026-01-10 to 2026-01-16 (all within 14 days)
