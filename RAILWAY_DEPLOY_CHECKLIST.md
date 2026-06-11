# Railway Deployment Checklist

Follow these steps once. After this, every `git push` auto-deploys and the
site updates its own news and indices on schedule.

## 1. Create the Railway project

1. Go to https://railway.app → New Project → **Deploy from GitHub repo**
2. Select `qctysolutions-prog/supplychain-chain-insights`
3. In the service → Settings:
   - **Build command**: `pnpm run build`
   - **Start command**: `node dist/index.js`

## 2. Add MySQL

1. In the same project: **+ New → Database → MySQL**
2. Open your app service → Variables → **Add Variable Reference** →
   select `MYSQL_URL` from the MySQL service, name it `DATABASE_URL`
   (or paste the MySQL public URL manually).

## 3. Set environment variables (app service → Variables)

```
NODE_ENV=production
DATABASE_URL=<from step 2>
JWT_SECRET=e0be5e0db9db1ea08ceab20dd864ac632ad7ce0053f03f19
ADMIN_PASSWORD=3DyfAovuNlcwQNx        ← change to your own
BUILT_IN_FORGE_API_URL=https://api.deepseek.com
BUILT_IN_FORGE_API_KEY=sk-...          ← your DeepSeek key
```

## 4. Create tables + first data load

In the Railway service shell (or locally with the same `DATABASE_URL` in `.env`):

```bash
pnpm db:push          # creates all tables (incl. new update_logs)
pnpm update:all       # first news + indices load (takes 2-3 min)
```

Optional historical backfill (12 months of index history for nicer charts):

```bash
node server/seed-supply-chain-indices.mjs
node server/seed-aluminum-pricing.mjs
```

## 5. Verify

- Open the Railway-generated domain → dashboard should show fresh articles
- `/admin` → log in with `ADMIN_PASSWORD` → Automation tab → check "Recent Runs"
- News refreshes every Monday 06:00 UTC; indices daily 07:00 UTC, automatically

## 6. Custom domain (optional)

Railway service → Settings → Networking → Custom Domain.

## Troubleshooting

- **No articles**: check service logs for `[scheduler]` lines; trigger manually
  from the Admin → Automation tab.
- **Chatbot errors**: verify `BUILT_IN_FORGE_API_KEY` and DeepSeek account balance.
- **DB errors**: re-run `pnpm db:push`; confirm `DATABASE_URL` points to the
  Railway MySQL **public** URL if connecting from outside Railway.
