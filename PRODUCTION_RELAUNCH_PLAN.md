# Production Relaunch Plan for www.ocuosh.com

## Executive Recommendation

The recommended relaunch path is to keep the same **Manus-style hosting model** that the domain already uses, while moving ownership, deployment, database configuration, and weekly automation to the active account **caoqianwudi@gmail.com**. The public repository remains the development source of truth at `https://github.com/qctysolutions-prog/supplychain-chain-insights.git`, and production secrets must be configured only in the hosting environment.

The current public-domain failure is not a source-code issue. On 2026-06-04 CDT, `https://www.ocuosh.com/` resolved to a Manus Space availability page stating that the author's membership has expired and linking to the old space URL `https://mobilitybrief-33zkwmqr.manus.space`. DNS lookup also confirmed that `www.ocuosh.com` is already configured as a CNAME to `ocuosh.manus.space`.

| Area | Recommendation | Reason |
|---|---|---|
| Hosting | Relaunch as a Manus-hosted web app under **caoqianwudi@gmail.com**. | The domain already points to Manus infrastructure, and the old failure is tied to the sunset/expired Manus ownership rather than the IONOS domain itself. |
| Database | Use a managed MySQL-compatible database provisioned by the new hosting environment if available; otherwise use TiDB Cloud Serverless or another managed MySQL provider. | The app uses Drizzle with MySQL and expects `DATABASE_URL`. Managed MySQL avoids running database infrastructure manually. |
| DNS | Keep IONOS as registrar/DNS provider. Reuse `CNAME www -> ocuosh.manus.space` only if the new Manus deployment can claim the `ocuosh` subdomain/custom-domain mapping; otherwise replace it with the exact target Manus gives for the new deployment. | IONOS supports CNAME records for subdomains and Manus provides DNS records during custom-domain setup. |
| Weekly update | Restore the Monday 5:00 AM weekly news update after production database and deployment are live. Prefer a Manus scheduled task while the workflow still requires editorial/news judgment; move to host cron only after the update script is fully deterministic. | The previous automation was agentic/editorial and the current repository entry point is `pnpm update:news`. |

## Current Domain and DNS State

| Check | Observed result | Implication |
|---|---|---|
| Browser check | `www.ocuosh.com` shows a Manus Space message: the author's membership has expired. | The existing custom-domain binding is still associated with the old Manus owner or expired account state. |
| DNS CNAME | `www.ocuosh.com -> ocuosh.manus.space` | IONOS DNS is already configured for a Manus target. |
| DNS nameservers | `ns1120.ui-dns.org`, `ns1066.ui-dns.biz`, `ns1106.ui-dns.de`, `ns1087.ui-dns.com` | IONOS is the active DNS provider. |
| Old reference site | `https://mobilitybrief-33zkwmqr.manus.space/` still displays the expected app reference. | The desired appearance and product behavior are recoverable from the source code and reference deployment. |

## Required Production Environment

The app should be deployed from the latest `main` branch and started with these commands.

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

Production must provide the following environment variables. These values must never be committed to Git.

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://<user>:<password>@<host>:<port>/<database>?ssl={"rejectUnauthorized":true}
JWT_SECRET=<random 32+ character secret>
ADMIN_PASSWORD=<admin password for protected admin/update operations>
BUILT_IN_FORGE_API_URL=<OpenAI-compatible API base URL if LLM features are enabled>
BUILT_IN_FORGE_API_KEY=<LLM API key if LLM features are enabled>
PUBLIC_BASE_URL=https://www.ocuosh.com
```

After the database is provisioned and `DATABASE_URL` is present in the deployment environment, initialize schema migrations once.

```bash
pnpm db:push
```

If the production database starts empty, seed or import the required news/index data before final public verification. Existing seed/import scripts are available in `server/` and `scripts/`, but they should be run only against the intended production database and only after confirming the desired data source.

## Manus Custom-Domain Path

Manus documentation says custom domains can be connected by asking Manus to publish the site to a domain such as `www.example.com`; Manus then provides the necessary DNS records, typically an `A` record or `CNAME`, and provisions SSL/TLS automatically after the domain is connected.[^manus-custom-domain]

For IONOS, CNAME records are configured under **Domains & SSL**, then the desired subdomain such as `www` is pointed to the target fully qualified hostname without `http://` or `https://`. IONOS also notes that CNAMEs are for subdomains and should not be used on the root domain.[^ionos-cname-config][^ionos-cname-definition]

The practical relaunch sequence is therefore:

1. Publish a fresh Manus-hosted deployment under **caoqianwudi@gmail.com** from the current GitHub `main` branch or from a newly generated Manus web-app checkpoint using this repository as source.
2. Configure production environment variables and the managed MySQL `DATABASE_URL` in the new deployment.
3. Attach `www.ocuosh.com` in the new Manus deployment settings.
4. If Manus accepts the current `CNAME www -> ocuosh.manus.space`, leave IONOS DNS unchanged; otherwise update the IONOS `www` CNAME to the new Manus-provided target.
5. Wait for DNS propagation and automatic SSL provisioning.
6. Verify that `https://www.ocuosh.com` loads the supply-chain insights app rather than the expired-membership page.

If the apex domain `ocuosh.com` should also work, configure an HTTP redirect from `ocuosh.com` to `https://www.ocuosh.com`. IONOS supports forwarding a domain to another URL and recommends using HTTP redirect instead of frame redirect for search engines.[^ionos-forwarding]

## Weekly Automation Restoration

The previous documented cadence is every Monday at **5:00 AM** in the user's local timezone. The repository exposes the runtime entry point:

```bash
pnpm update:news
```

The scheduled runtime must have:

| Requirement | Needed value |
|---|---|
| Source checkout | Latest `main` branch of `qctysolutions-prog/supplychain-chain-insights` |
| Node dependencies | `pnpm install --frozen-lockfile` before first run or whenever lockfile changes |
| Database | Same production `DATABASE_URL` used by the app |
| Git write access | A short-lived or managed credential scoped to this repository if the job should commit/push update summaries |
| Admin/update secrets | `ADMIN_PASSWORD` and any API keys needed by the update workflow |

Because there is currently no active schedule in this project session, the weekly job should be recreated only after the new deployment and production database are live. Creating it before the database exists would produce scheduled failures.

## Decision Needed Before Execution

The next blocking action is not code; it is **Manus deployment ownership**. The domain already points to Manus, but the visible error indicates the current custom-domain binding is attached to the expired/sunset Manus account. To finish the relaunch, the active account must be able to publish or own a Manus-hosted deployment and bind `www.ocuosh.com` to it.

Once that deployment workspace is available, the remaining work is straightforward: configure environment variables, initialize the database, bind the custom domain, verify HTTPS, and recreate the Monday 5:00 AM schedule.

[^manus-custom-domain]: Manus, “Custom Domains: Professionalize Your Brand,” https://manus.im/docs/website-builder/custom-domains.
[^ionos-cname-config]: IONOS, “Configuring a CNAME Record for a Subdomain,” https://www.ionos.com/help/domains/configuring-cname-records-for-subdomains/configuring-a-cname-record-for-a-subdomain/.
[^ionos-cname-definition]: IONOS, “CNAME,” https://www.ionos.com/help/domains/glossary-important-terms-and-topics-explained/cname/.
[^ionos-forwarding]: IONOS, “Forwarding a Domain to a Different Domain,” https://www.ionos.com/help/domains/forwarding-a-domain/forwarding-a-domain-to-a-different-domain/.
