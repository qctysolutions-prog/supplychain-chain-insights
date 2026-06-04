# Deployment Instructions for www.ocuosh.com

## Relaunch Target

The active relaunch target for this project is **https://www.ocuosh.com**. The active operating account is **caoqianwudi@gmail.com** and the GitHub repository is **https://github.com/qctysolutions-prog/supplychain-chain-insights.git**.

## Required Environment Variables

Do not commit production secrets to this repository. Configure the following values in the hosting provider environment:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<production MySQL connection string>
JWT_SECRET=<random 32+ character secret>
ADMIN_PASSWORD=<admin password>
BUILT_IN_FORGE_API_URL=<OpenAI-compatible API base URL, for example https://api.deepseek.com>
BUILT_IN_FORGE_API_KEY=<LLM API key>
PUBLIC_BASE_URL=https://www.ocuosh.com
```

## Build and Start

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

## Database Initialization

After provisioning the production MySQL database, run the migration command once with `DATABASE_URL` set:

```bash
pnpm db:push
```

If seed data is required, run the specific seed/import script only after confirming it points to the new production database via `DATABASE_URL`.

## Custom Domain

Configure the hosting provider to serve the application at **www.ocuosh.com**, then create the DNS record required by that provider, typically a `CNAME` from `www` to the provider-assigned deployment hostname. If the apex domain `ocuosh.com` should also resolve, configure an apex redirect to `https://www.ocuosh.com`.

## Verification Checklist

1. The site loads at `https://www.ocuosh.com`.
2. The subscriber access page matches the reference layout.
3. Authorized email access works against the new database.
4. Admin login works with the new `ADMIN_PASSWORD`.
5. News, indices, aluminum pricing, and chat features load without server errors.
6. The weekly news update job uses the new deployment URL and new database.
