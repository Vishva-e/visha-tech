# Phase 2 — Private Amazon product review dashboard

## Status
Implemented as a **local developer tool only**. No Amazon account connection, scraping, sales, product prices, credentials, or public admin route. Launch still requires explicit owner approval.

## Run (on your trusted computer)
```bash
npm ci
npm run agent:amazon -- queue --title "A product for desk research" --category laptops \
  --summary "Original editorial notes, no scraped descriptions or prices." \
  --url "https://www.amazon.in/dp/B0TEST1234?tag=EXAMPLE-21"
npm run agent:dashboard
```
The URL above is a **synthetic demonstration**, not an actual offer or tracking ID. Copy a real SiteStripe link from your own Amazon Associates login for actual use.

The dashboard binds exclusively to `127.0.0.1` on an ephemeral port (or `VISHA_REVIEW_PORT`), prints a randomly generated local session token, and rejects cross-origin review requests. It reads `data/amazon/review-queue`, ignored by Git.

## Decision states
`pending → approved` or `pending → rejected`, with an editorial note and timestamp recorded in the local JSON. The action cannot run twice on a reviewed draft. **All records retain `publishApproved: false`; no button sends a product to the public site, writes an Astro page, or contacts Amazon.**

The dashboard does not call the Amazon API; no account state or live product metadata is imported. Do not keep the dashboard running on shared computers, disclose its one-time token, or port-forward it to the internet.

## Future integrations (not activated)
1. Amazon Associates owner verifies registration and the website's approved public URL.
2. After eligibility, consider Creators API **server-side** with provider-issued credentials in a secret manager. Current documentation: https://affiliate-program.amazon.in/creatorsapi/docs/en-us/introduction
3. Introduce separate editorial approval + explicit production publication gate; never expose raw affiliate APIs or secrets in Astro client scripts.
4. Audit current Amazon Associates operating terms before public product link displays, especially rules on prices, reviews, images, availability and disclosures: https://affiliate-program.amazon.in/help/operating/linking

## Security boundaries
A local queue is not an authenticated, hosted CMS. Do not deploy `tools/product-review.html` or `scripts/product-review-dashboard.mjs` through Cloudflare or any other host. Preview only using the local command.

Run `npm test` and `npm run validate` before merging this feature branch.
