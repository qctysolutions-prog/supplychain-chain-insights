# Relaunch Status for Supply Chain Insights

## Current State

The repository has been relaunched for the active account **caoqianwudi@gmail.com** and target domain **www.ocuosh.com**. The cleanup commit has been pushed to `main` in `https://github.com/qctysolutions-prog/supplychain-chain-insights.git`.

| Item | Status | Notes |
|---|---|---|
| Active GitHub repository | Complete | `https://github.com/qctysolutions-prog/supplychain-chain-insights.git` |
| Relaunch commit | Complete | Commit `934061c` / `Prepare relaunch for ocuosh domain` |
| Old account references | Complete | `qiannathancao@gmail.com` references were removed or replaced with `caoqianwudi@gmail.com` where appropriate. |
| Old deployment references | Complete | Legacy `manus.space`/previous deployment references were removed from operational docs and configuration. |
| Hardcoded database credentials | Complete | Operational scripts now require `DATABASE_URL`; production credentials must be configured only in the host environment. |
| Local production build | Verified | `pnpm install`, `pnpm run build`, and local `pnpm start` succeeded. |
| Local type check | Verified | `pnpm run check` succeeded. |
| Automated tests | Partially verified | The app-level build is valid; the existing test suite contains database-dependent failures unless a reachable test database is configured. |
| Public deployment | Pending | Requires a hosting target with production environment variables and DNS records for `www.ocuosh.com`. |
| Weekly news job | Pending production prerequisites | The code includes `pnpm update:news`, but the production database and authenticated Git push path must be available to the scheduled runtime. |

## Production Hosting Requirements

The app is a Node/Vite web application with a MySQL database. The production host must run the following commands from the repository root.

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

The host must provide these environment variables. Secrets must not be committed to Git.

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

After the production database is created and `DATABASE_URL` is configured, initialize migrations once.

```bash
pnpm db:push
```

## Custom Domain Requirements

The Manus custom-domain documentation states that custom-domain setup is completed by publishing the web app to the desired domain and then adding the DNS records provided by the platform. The DNS record is usually an `A` record or `CNAME`; for a `www` subdomain, the help center notes that an additional record may need to be added manually and existing conflicting `A` records should be removed.

| Domain | Intended behavior | Required action |
|---|---|---|
| `www.ocuosh.com` | Primary app URL | Add the provider-supplied DNS record for the deployed app, usually `CNAME www -> <deployment-hostname>`. |
| `ocuosh.com` | Optional redirect | Configure the registrar or host to redirect the apex domain to `https://www.ocuosh.com`. |
| HTTPS | Required | Let the hosting platform issue the automatic SSL/TLS certificate after DNS resolves. |

## Weekly News Update Job

The repository already exposes the weekly update entry point:

```bash
pnpm update:news
```

The script currently performs database updates, summary/changelog generation, and a Git commit/push. To restore this job safely under the active account, the runtime that executes the job must have:

1. a reachable `DATABASE_URL` for the new production database;
2. Git authentication with write access to `qctysolutions-prog/supplychain-chain-insights`;
3. the same Node/pnpm dependency setup as production;
4. a schedule equivalent to the previous weekly cadence documented in `SCHEDULE_CONFIRMATION.md`.

A simple scheduled Manus task is suitable for a low-frequency weekly editorial workflow if the update requires research and judgment. A host-level cron job is better once the process is made fully deterministic, because it avoids future per-run agent overhead and can run directly beside the application.

## Remaining Relaunch Steps

| Step | Owner | Status |
|---|---|---|
| Provision production MySQL database | User/host | Pending |
| Configure production environment variables | User/host | Pending |
| Deploy latest `main` branch | Agent or host | Pending |
| Configure DNS for `www.ocuosh.com` | User/domain registrar | Pending |
| Verify live site and SSL | Agent | Pending after DNS/deploy |
| Restore weekly schedule | Agent | Pending after production database and Git write credentials are available to the scheduled runtime |
