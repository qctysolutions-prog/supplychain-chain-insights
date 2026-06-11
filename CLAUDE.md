# Mobility & Auto Supply Chain Brief — CLAUDE.md

## Project Overview

A full-stack supply chain intelligence dashboard (OSK Insights) for the automotive/mobility industry. Aggregates news, tracks commodity pricing and economic indices, and provides an AI-powered chatbot.

Originally built on the Manus platform; migrated to self-hosted (Railway + Railway MySQL + DeepSeek API).

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4, Radix UI, Recharts, Wouter (routing)
- **Backend**: Node.js, Express, tRPC, Drizzle ORM
- **Database**: MySQL (Railway MySQL in production; any MySQL 8.x locally)
- **LLM**: DeepSeek API (`deepseek-chat` model), OpenAI-compatible format
- **Package manager**: pnpm

## Commands

```bash
pnpm dev          # Start dev server (Express + Vite HMR) on port 3000
pnpm build        # Build frontend (Vite → dist/public) + backend (esbuild → dist/index.js)
pnpm start        # Run production build
pnpm db:push      # Run Drizzle migrations (creates/updates DB tables)
pnpm test         # Run Vitest tests
pnpm update:news     # Run news pipeline now (RSS → DeepSeek → DB)
pnpm update:indices  # Refresh economic indices now (FRED → DB)
pnpm update:all      # Both
```

## Automated Updates

The server runs a built-in scheduler (`server/updaters/scheduler.ts`): news
every Monday 06:00 UTC, indices daily 07:00 UTC, with stale catch-up on boot.
Runs are logged to the `update_logs` table and visible in the Admin panel
(Automation tab), which also has manual trigger buttons.
See `docs/guides/AUTOMATED_PIPELINE_V2.md` for details. Disable via
`AUTO_UPDATE_DISABLED=true`.

## Project Structure

```
client/src/         React SPA
  pages/            Route-level page components
  components/       Shared UI components (AccessGate, DashboardLayout, etc.)
  _core/hooks/      useAuth and other hooks
server/
  _core/            Core infra: auth, LLM, tRPC setup, cookies, env
  routers.ts        All tRPC routes (news, chat, auth, subscription, allowlist, update, etc.)
  db.ts             Drizzle query functions
  updaters/         Automated news + indices pipelines and scheduler
drizzle/            Schema and migration files
shared/             Types and constants shared between client and server
scripts/            Automated news update script
```

## Environment Variables

Create a `.env` in the project root (gitignored):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://user:pass@host:3306/dbname
JWT_SECRET=<random 32+ char string>
ADMIN_PASSWORD=<your admin password>
BUILT_IN_FORGE_API_URL=https://api.deepseek.com
BUILT_IN_FORGE_API_KEY=sk-...
```

## Authentication

Two separate auth systems:

1. **Subscriber email gate** (`AccessGate.tsx`): visitors enter their email; it's checked against the `allowlist` table. No password or OAuth required.

2. **Admin session** (`/login` page): POST to `/api/auth/login` with `ADMIN_PASSWORD`. On success, a JWT session cookie is set (`app_session_id`). This grants `role: admin`, bypassing the email gate and unlocking `/admin`.

3. **Admin panel** (`/admin`): uses `adminAuth.verify` tRPC procedure with `ADMIN_PASSWORD` stored separately in localStorage. Independent of the session cookie.

## Database

Drizzle ORM with MySQL2 driver. Schema in `drizzle/schema.ts`.

Tables: `users`, `news_articles`, `category_feedback`, `aluminum_pricing`, `supply_chain_indices`, `subscriptions`, `allowlist`.

Run `pnpm db:push` after provisioning a new database to create all tables.

## LLM / Chatbot

`server/_core/llm.ts` sends requests to `{BUILT_IN_FORGE_API_URL}/v1/chat/completions` using OpenAI-compatible format. Model is hardcoded to `deepseek-chat`. To switch models, edit the `model` field in `llm.ts:~284`.

## Deployment (Railway)

1. Push repo to GitHub
2. Create Railway project → connect GitHub repo
3. Add MySQL service → Railway auto-injects `DATABASE_URL`
4. Set env vars in Railway Variables tab
5. Run `pnpm db:push` once via Railway shell
6. App auto-deploys on `git push`

Build command: `pnpm run build`
Start command: `node dist/index.js`
