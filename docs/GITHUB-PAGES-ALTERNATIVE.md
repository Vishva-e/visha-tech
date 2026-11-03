# GitHub Pages fallback — Visha Tech Picks (noindex preview)

The Cloudflare Worker `visha-tech` failed to start its managed build environment, and Cloudflare's new Pages wizard unexpectedly created another Worker instead of a Pages project. This independent fallback uses the **public** GitHub repository `Vishva-e/visha-tech` and GitHub's own Actions build infrastructure.

## Site
If GitHub Pages is enabled with **Source: GitHub Actions**, the preview should be at:

`https://vishva-e.github.io/visha-tech/`

**This is an expected format, not proof the site is deployed.** Confirm the deployed URL in GitHub Pages settings / Actions run and test the actual HTTP site.

The workflow `.github/workflows/deploy-pages.yml` builds all 26 static Astro pages with environment variable `GITHUB_PAGES_BASE=/visha-tech`. Astro prefixes compiled `/_astro/` assets, and `scripts/prepare-github-pages.mjs` rewrites hard-coded root-absolute HTML links. No original site source links are rewritten for Cloudflare. Tests enforce `noindex` metadata and an intentional `robots.txt` Disallow.

## Requirements
GitHub repository **Settings → Pages → Build and deployment → Source: GitHub Actions** must be enabled. The Actions job has `pages: write` and `id-token: write` and publishes the built `dist/` artifact. If the action says Pages must be enabled, the Pages setting must be changed by a user/admin with repo permissions; this app's GitHub connector does not expose a Pages settings mutation.

The default public Pages preview is **not confidential**. `noindex` does not prevent direct access or sharing. No Amazon Associates links are activated.

Source: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Verification
1. New push to `main` starts **GitHub Pages - Visha Tech Picks noindex preview** workflow.
2. The workflow must pass check + tests + Astro build + prelaunch audit + prefix conversion.
3. The `deploy-pages` step must show a production URL.
4. Visit the actual URL and verify home page, `/guides/`, `/contact/`, `/_astro/` styles and `/robots.txt` via the prefixed project path.

Do **not** promote this as an indexed editorial launch or activate affiliate functionality before all release signoffs.
