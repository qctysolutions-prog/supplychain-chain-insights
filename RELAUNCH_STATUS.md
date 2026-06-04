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
| Public deployment | Pending | `www.ocuosh.com` currently resolves to Manus but shows an expired-membership page tied to the old owner; a fresh Manus-hosted deployment must be published under `caoqianwudi@gmail.com`. |
| Current DNS | Verified | `www.ocuosh.com` is a CNAME to `ocuosh.manus.space`, with IONOS nameservers active. |
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

The active custom domain is already pointed from IONOS toward Manus infrastructure. On 2026-06-04 CDT, DNS showed `www.ocuosh.com -> ocuosh.manus.space`, and the browser showed a Manus Space message saying the author's membership has expired. This means the domain is not blocked by basic DNS ownership; the blocker is that the existing Manus custom-domain binding appears to belong to the sunset/expired account.

The Manus custom-domain documentation states that custom-domain setup is completed by publishing the web app to the desired domain and then adding the DNS records provided by the platform. The DNS record is usually an `A` record or `CNAME`; for a `www` subdomain, IONOS supports adding a CNAME for the `www` host and pointing it to the provider-assigned hostname.

| Domain | Intended behavior | Required action |
|---|---|---|
| `www.ocuosh.com` | Primary app URL | Currently `CNAME www -> ocuosh.manus.space`; keep this only if the new Manus deployment can claim that target, otherwise replace it with the new Manus-provided hostname. |
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
| Deploy latest `main` branch | Agent or host | Pending; recommended target is Manus-hosted deployment under `caoqianwudi@gmail.com` |
| Configure DNS for `www.ocuosh.com` | User/domain registrar | Partially complete; IONOS already points `www` at `ocuosh.manus.space`, but the new Manus deployment must bind or replace this target |
| Verify live site and SSL | Agent | Pending after DNS/deploy |
| Restore weekly schedule | Agent | Pending after production database and Git write credentials are available to the scheduled runtime |
