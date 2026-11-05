# Visha Shop — Amazon Associates India connection handoff

**Live website:** https://visha-shop.pages.dev/ (a publicly accessible, noindex editorial preview)
**Tracking ID provided by site owner:** `vishvatechgui-21` (format valid, ownership not independently verified).
**Account connection / site registration:** NOT VERIFIED. No login, approval, earnings, or automatic API access has been confirmed.

## Owner action in Amazon Associates Central
1. Sign in privately at https://affiliate-program.amazon.in/ (do not send passwords, OTPs or Creators API secrets through chat).
2. Check whether your Amazon.in Associates account is enrolled, active, pending review or rejected.
3. Go to **Account Settings → Edit your website list → Add Website**, add exactly **https://visha-shop.pages.dev/**, then choose **Next** to complete any declarations. Confirm the saved list contains the exact current public URL. Official instructions: https://affiliate-program.amazon.in/help/node/topic/G9KDEPG2WF47VQY4
4. Confirm `vishvatechgui-21` appears as an existing active Tracking ID under Associates Central. The owner supplied this public identifier, but the website cannot independently verify the associated account. Do not share API secrets.
5. Create your own qualifying product text links through Amazon.in SiteStripe, and review every ASIN and editorial claim. The existing `npm run agent:amazon -- queue` CLI validates direct HTTPS Amazon.in SiteStripe URLs, stores only local drafts, and **cannot publish automatically**.
6. Once Amazon account status and website registration are independently confirmed, configure deployment flags `AMAZON_ACCOUNT_VERIFIED=true`, `AMAZON_SITE_REGISTERED=true`, `AMAZON_APPROVED_SITE_URL=https://visha-shop.pages.dev/`, and `AMAZON_ASSOCIATE_TAG=vishvatechgui-21`, with `PUBLIC_AMAZON_ASSOCIATE_ACTIVE=true` only for a separately approved affiliate release. Set `AMAZON_LINKS_EDITORIALLY_APPROVED=true` only after all live product URLs pass individual review. Never set any flag on an assumption. No paid link appears merely because a tracking ID exists.

## Code shipped in this phase
- A user-friendly `/shop/` discovery page using published independent editorial guides and categories. It does not pretend to sell inventory or show unverified prices.
- `src/lib/affiliate-link-gate.mjs` is a fail-closed helper for future owner-approved SiteStripe links. It requires verified flags, matching site URL, exact tag and reviewed item status; returns a visible `(paid link)` disclosure and safe `rel` attributes, or `null` when not approved.
- Tests for eligibility flags, mismatched site/tag, URL restrictions and transparent product discovery.
- No account authentication, OAuth, Amazon API call, Amazon-sourced image or price scraping, background sync, checkout or affiliate activation.

## Verification and launch safeguards
Official Amazon India application-review guidance requires at least three qualifying sales in the first 180 days, and recommends at least ten substantive posts: https://affiliate-program.amazon.in/help/node/topic/G8TW5AE9XL2VX9VM

Creators API is separate from SiteStripe. Its currently documented prerequisites include ten qualifying sales in the past 30 days, registration and credentials: https://affiliate-program.amazon.in/creatorsapi/docs/en-us/introduction . PA-API 5 is deprecated: https://affiliate-program.amazon.in/creatorsapi/docs/en-us/paapiv5-deprecation .

When affiliate activity actually begins, include the required identity statement **“As an Amazon Associate I earn from qualifying purchases.”** and link-level **“(paid link)”** disclosures. https://affiliate-program.amazon.in/help/node/topic/GPXFHVYZMTGPUMPE

Keep `PUBLIC_AMAZON_ASSOCIATE_ACTIVE=false` and `PUBLIC_SITE_LIVE=false` until independently approved. Do not change search-indexing controls simply to link the affiliate account. The current build may be publicly viewed but remains intentionally noindex.

## Tracking ID validation (November 2026)
The file `src/config/amazon-associates.mjs` stores only the explicitly user-provided public tracking ID and the live website URL that needs to be registered. It deliberately records `amazonAccountAndSiteVerified = false` until verified outside the code. `scripts/amazon-agent.mjs` rejects manually queued links whose tag differs from that configured ID; `src/lib/affiliate-link-gate.mjs` also requires a separate explicit account verification flag. This does **not** connect to Amazon, authenticate, or activate a commission link.
