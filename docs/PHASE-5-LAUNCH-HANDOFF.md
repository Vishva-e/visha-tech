# Phase 5 — Editorial-only launch handoff

**Implementation status:** safe launch artifact builder available in private GitHub; this is not a deployed website.

## What is ready now
- 10 original, desk-research buying guides and 26 generated static pages.
- Homepage, reading guides, comparisons and product finder.
- Local-only Amazon product editorial queue; absolutely **no active affiliate links**.
- Strict `release:preflight` gates and separate editorial vs affiliate mode.
- `npm run build` produces **private preview output with noindex**.
- `npm run build:release` produces **reviewable, production-SEO static output only after approvals**; it does NOT connect to Cloudflare or publish.
- CI-generated private build ZIP for offline review (expires after seven days).

## Remaining details genuinely required to publish
1. A **Cloudflare account** connected to GitHub, with access to the private `Vishva-e/vishva-tech-picks` repo (not available from the existing tools).
2. A **real approved site hostname**, either a verified custom domain or a Cloudflare-generated `*.pages.dev` hostname that the owner confirms. Do not assume a hostname exists.
3. A **public-facing editorial contact email** explicitly approved for visitors: `vishvaelumalai98@gmail.com` (owner approved; committed to site source).
4. Final human content review, legal/privacy checks against actual hosting logs and a physical-device/screen-reader test. CI axe checks are a good baseline but not complete certification.

## Safe Cloudflare Pages configuration (after outstanding gates are satisfied)
Official docs: https://developers.cloudflare.com/pages/get-started/git-integration/

Cloudflare Workers & Pages → Create application → Pages → Connect to Git → GitHub → select the existing **private** repository.

- Project name: choose an available, approved name — do not assume `visha-tech-picks.pages.dev` is available.
- Production branch: `main`.
- Framework: Astro (static).
- Build command: `npm run build:release`.
- Output directory: `dist`.
- Root directory: repo root.
- Node.js version: 22.12+.
- `RELEASE_MODE=editorial`, `PUBLIC_AMAZON_ASSOCIATE_ACTIVE=false`.
- `SITE_URL=https://ACTUAL-APPROVED-HOST/`.
- Release gate variables must reflect independently verified approvals (see below).

**Warning:** Git integration enables automatic production/preview deployments by default. Do not connect it until every release gate is actually fulfilled. Branch previews can be accessible even when the repository is private. Review Cloudflare branch controls before enabling it: https://developers.cloudflare.com/pages/configuration/git-integration/.

### Required production build gates
```text
RELEASE_MODE=editorial
PUBLIC_SITE_LIVE=true
OWNER_RELEASE_APPROVED=true
HOSTING_APPROVED=true
CONTENT_REVIEW_APPROVED=true
PRIVACY_REVIEW_APPROVED=true
DEVICE_ACCESSIBILITY_APPROVED=true
PUBLIC_CONTACT_EMAIL=vishvaelumalai98@gmail.com
SITE_URL=https://<exact approved host>/
PUBLIC_AMAZON_ASSOCIATE_ACTIVE=false
```
The values are self-attestations. A green script or set of flags does not prove legal compliance and cannot replace explicit authorization.

## Local testing before any hosting
```bash
npm ci
npm run validate
npm run release:preflight
npm run build
```
The preflight **should fail** in the current environment because legitimate public release requirements are still missing. It exits code 2. This is by design.

## After an approved editorial website is publicly available
The owner may apply for Amazon Associates India with the real public site URL. Current Amazon guidance expects original public content, generally around ten posts as a rule of thumb, and reviews accounts after three qualifying sales in the first 180 days. Requirements may change. See https://affiliate-program.amazon.in/help/node/topic/G8TW5AE9XL2VX9VM.

**Never submit a made-up URL, Amazon password, tracking key or sales claim.** The next affiliate integration must use a separate approved workflow.

## No deployment performed
Neither this repository nor GitHub Actions includes a Cloudflare API token, Wrangler release command, or auto deployment workflow. Publishing requires an explicitly authorized and connected hosting provider.
