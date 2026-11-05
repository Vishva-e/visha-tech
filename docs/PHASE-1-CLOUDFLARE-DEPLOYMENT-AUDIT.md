# Phase 1 — Cloudflare deployment incident (read-only findings)

Date: 2026-11-05
Status: Root cause not established. No production release authorized.
Production website to preserve: https://visha-shop.pages.dev/

## Evidence

An owner-provided Cloudflare screenshot shows:
- Cloudflare Workers & Pages project **visha-tech**, Production > Deployments, failed build `#c50ef40e`.
- Connected GitHub repository label: `Vishva-e/visha-tech`, branch `main`.
- Build command: `npm run build`, marked **successful**.
- Deploy command: `npx wrangler deploy`, marked **failed**.
- Root directory `/`, build variables shown as **None**.
- A log excerpt includes a clone from `Vishva-e/vishva-tech-picks.git`, followed by a push to `Vishva-e/visha-tech.git`. The reason and safety of this repository-copy sequence remain unverified.
- The screenshot does **not** show the actual Wrangler error (last log lines).
- This screenshot proves which repository is associated with project `visha-tech`; it does NOT prove which Cloudflare project serves the distinct URL `visha-shop.pages.dev`.

Public-site checks independently confirmed that `visha-shop.pages.dev` currently serves the Visha Shop homepage and RAM guide; the public response contains `noindex,nofollow,noarchive`, while `robots.txt` disallows crawling. Do not remove those safeguards without separate release approval.

## Existing source configuration

- `wrangler.jsonc` declares Worker `name: "visha-tech"` and static assets `./dist`.
- `astro.config.mjs` uses `output: "static"`.
- `package.json` builds via `astro build && node scripts/finalize-build.mjs`.
- For the Worker shown in the screenshot, no SSR adapter is required.
- The source default build deliberately produces a noindex preview unless release approval gates are satisfied.

## Next checks before changing deployment settings

1. In Cloudflare, open the failed build `#c50ef40e` and record the **final Wrangler error lines**. Do not press Retry build.
2. Open Workers & Pages > **visha-tech** > Domains. Record every attached hostname. Separately inspect the Pages project `visha-shop` (if present) and its Git integration. Establish which repo produces `visha-shop.pages.dev`.
3. Check whether the failure is a Worker-name conflict, auth/permissions issue, deployment API error, incompatible Wrangler version, or target asset configuration. Do not assume the cause.
4. Investigate the log's `vishva-tech-picks` clone and `visha-tech` push sequence; confirm whether any repository sync is intentional.
5. Locally, in this branch only, run `npm ci`, `npm run validate`, and `npx wrangler deploy --dry-run --config wrangler.jsonc` to validate packaging. **Do not execute a real deploy**.
6. If required, prepare a narrowly scoped config change and PR for review. Do not merge or enable automatic deploy from this branch.

## Guardrails

- Never run `wrangler deploy` against the user's Cloudflare account without explicit deployment approval.
- Never push to or merge into `main` without explicit approval.
- Do not adjust `PUBLIC_SITE_LIVE`, index directives, affiliate mode, domains, or credentials as part of a speculative repair.
- If GitHub integration auto-deploys branch pushes, confirm preview/production branch controls before any PR/merge.
