# Cloudflare Workers static deployment repair — Visha Tech Picks
The Cloudflare dashboard project **visha-tech** is connected to GitHub repo `Vishva-e/visha-tech`, NOT `Vishva-e/vishva-tech-picks`. On Nov 3, 2026 its build failed because Wrangler automatically attempted to install `@astrojs/cloudflare` through `astro add cloudflare`, although this project is a static Astro site.

This branch adds the explicit `wrangler.jsonc` below so Wrangler deploys `dist/` as static assets without an Astro SSR adapter:

```json
{
  "name": "visha-tech",
  "compatibility_date": "2026-11-03",
  "assets": {
    "directory": "./dist",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

**Cloudflare Workers Builds configuration:**
- Git repository: `Vishva-e/visha-tech`
- Branch: `main`
- Build: `npm run build`
- Deploy: `npx wrangler deploy --config wrangler.jsonc`
- Node: 22.12+.
- Root: repo root.

Cloudflare build-time environment variables are different from runtime secrets. Until the separate production release checklist is fulfilled, use `PUBLIC_SITE_LIVE=false`, `PUBLIC_AMAZON_ASSOCIATE_ACTIVE=false`, and keep the metadata and robots defaults set to noindex. Do not claim a successful deployment until Cloudflare shows a successful build and public URL loads.

**Cloudflare project:** `visha-tech`; verified dashboard address `https://visha-tech.vishvaelumalai98.workers.dev/`. The project may be publicly reachable but not yet have a successful deployment.

**Important:** The previously attempted `Retry build` was rejected: `Cannot retry a build that was created with a seed_repo override`. Pushing changes to `main` may generate a new build if Git integration is active. Otherwise use the dashboard's manual deployment/build flow with the corrected source.

This change is specifically for the Cloudflare-connected repository; it does not change website content, release gates, Amazon Associates status, or credentials.
