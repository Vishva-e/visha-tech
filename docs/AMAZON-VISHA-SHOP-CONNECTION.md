# Visha Shop — Amazon Associates India connection handoff

**Live website:** https://visha-shop.pages.dev/ (a publicly accessible, noindex editorial preview)
**Account connection:** NOT VERIFIED. Do not claim a Store ID, account approval, or automatic API access.

## Owner action in Amazon Associates Central
1. Sign in privately at https://affiliate-program.amazon.in/ (do not send passwords, OTPs or Creators API secrets through chat).
2. Check whether your Amazon.in Associates account is enrolled, active, pending review or rejected.
3. Go to **Account Settings → Edit your website list → Add Website**, add exactly **https://visha-shop.pages.dev/**, then choose **Next** to complete any declarations. Confirm the saved list contains the exact current public URL. Official instructions: https://affiliate-program.amazon.in/help/node/topic/G9KDEPG2WF47VQY4
4. Find the **Store ID / Tracking ID**, typically a value ending in `-21`. The tag is a public identifier embedded in outbound affiliate URLs; it is not a password. Provide the tag only after verifying ownership. Do not share API secrets.
5. Create your own qualifying product text links through Amazon.in SiteStripe, and review every ASIN and editorial claim. The existing `npm run agent:amazon -- queue` CLI validates direct HTTPS Amazon.in SiteStripe URLs, stores only local drafts, and **cannot publish automatically**.
6. Only once account/site registration and each link are confirmed by the owner, configure appropriate build flags and an approved product manifest. No paid link appears merely because a tracking ID exists.

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
