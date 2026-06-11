# Automated Pipeline V2 (Post-Manus)

Replaces the Manus-agent curation process. The app now updates itself — no
external agent required. Design stays in sync with the original process
(14-day window, 6 categories, min 4 articles per category, weekly cadence).

## What runs automatically

| Job | Schedule (UTC) | What it does |
|---|---|---|
| News update | Monday 06:00 | Google News RSS per category → DeepSeek selects up to 3 items/category and writes 3 analytical bullets each → inserts into `news_articles` → prunes articles older than 14 days (always keeps newest 4 per category) |
| Indices update | Daily 07:00 | Pulls free FRED series → inserts a row into `supply_chain_indices` and `aluminum_pricing` |
| Boot catch-up | ~2 min after server start | If news is >8 days stale or indices >3 days stale, runs immediately — site self-heals after downtime |

State is persisted in the `update_logs` table, so restarts never double-run.
Disable with `AUTO_UPDATE_DISABLED=true`.

## Index data sources (all free, no API key)

| Metric | FRED series | Notes |
|---|---|---|
| Trade Policy Uncertainty | `EPUTRADE` | Baker/Bloom/Davis categorical EPU, monthly |
| BLS Import Price Index | `IR` | All commodities, monthly |
| HRC Steel | `WPU10170301` | PPI Hot Rolled Steel Sheet & Strip (index, Jun 1982=100) |
| Aluminum | `PALUMUSDM` | IMF global benchmark, USD/tonne |
| Copper | `PCOPPUSDM` | IMF global benchmark, converted to USD/lb |
| Diesel | `GASDESW` | EIA weekly retail, USD/gal |
| Cass Freight (expenditures) | `FRGEXPUSM649NCIS` | Monthly |
| Drewry WCI (ocean) | — | No free source; last stored value carried forward, flagged in `notes` |

## Manual triggers

- **Admin panel** → Automation tab → "Run News Update" / "Refresh Indices"
  (admin password login required). Recent runs are listed there too.
- **CLI**: `pnpm update:news`, `pnpm update:indices`, `pnpm update:all`
  (requires `.env` with `DATABASE_URL` and DeepSeek key).

## Code map

```
server/updaters/
  rss.ts             RSS fetch + parse (no deps)
  fred.ts            FRED CSV fetch + MoM/YoY snapshots
  newsUpdater.ts     News pipeline (categories, queries, LLM prompt, pruning)
  indicesUpdater.ts  Index pipeline (series mapping, formatting)
  scheduler.ts       In-process cron + boot catch-up
  run.ts             CLI entry
drizzle/schema.ts    + update_logs table
server/routers.ts    + update.runNews / update.runIndices / update.history
client/src/pages/AdminPanel.tsx  + Automation tab
```

## Tuning

- Search queries per category: `CATEGORY_QUERIES` in `newsUpdater.ts`
- Window / minimums: `DAYS_THRESHOLD`, `MIN_ARTICLES_PER_CATEGORY`,
  `MAX_NEW_PER_CATEGORY` in `newsUpdater.ts`
- Schedules: `scheduler.ts`
- LLM model: `server/_core/llm.ts` (`deepseek-chat`)
