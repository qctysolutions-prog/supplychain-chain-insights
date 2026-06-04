# Deployment Guide for www.ocuosh.com

## Relaunch Scope

This project is being relaunched for the active operating account **caoqianwudi@gmail.com** and the production domain **https://www.ocuosh.com**. The source of truth for development and deployment is **https://github.com/qctysolutions-prog/supplychain-chain-insights.git**.

## Application Stack

The app is a full-stack TypeScript project with a React/Vite frontend, an Express/tRPC backend, Drizzle ORM, and MySQL-compatible storage. Production secrets must be configured only in the deployment environment and must not be committed to Git.

## Required Environment Variables

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<production MySQL connection string>
JWT_SECRET=<random 32+ character secret>
ADMIN_PASSWORD=<admin password>
BUILT_IN_FORGE_API_URL=<OpenAI-compatible API base URL>
BUILT_IN_FORGE_API_KEY=<LLM API key>
PUBLIC_BASE_URL=https://www.ocuosh.com
```

## Build and Run

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

## Database Setup

Run database migrations once after provisioning the new production database:

```bash
pnpm db:push
```

Only run seed or import scripts after confirming that `DATABASE_URL` points to the new production database for this relaunch.

## Hosting and Domain Setup

1. Connect the GitHub repository to the selected hosting provider.
2. Configure the environment variables above in the provider settings.
3. Set the build command to `pnpm run build`.
4. Set the start command to `node dist/index.js`.
5. Configure the custom domain `www.ocuosh.com` in the hosting provider.
6. Add the DNS record requested by the provider, typically a `CNAME` for `www`.
7. Enable HTTPS and, if required, redirect `ocuosh.com` to `www.ocuosh.com`.

## Verification Checklist

1. `https://www.ocuosh.com` loads over HTTPS.
2. The subscriber access screen visually matches the reference deployment.
3. Authorized-email access uses the relaunched database.
4. Admin login works with the new `ADMIN_PASSWORD`.
5. News, economic indices, aluminum pricing, feedback, and chat routes respond without server errors.
6. The weekly news update workflow commits any code/data changes to Git before deployment.

## Weekly News Update

The current low-frequency weekly update is suitable for a scheduled task when it requires news judgment, source validation, summarization, or article selection. If the update becomes purely deterministic or needs to run much more frequently, move it into a persistent background job attached to the production service instead.
