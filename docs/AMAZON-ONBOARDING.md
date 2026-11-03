# Amazon Associates India — Visha Tech Picks onboarding (NOT CONNECTED)

**Project state:** private source repository only. There is no public Visha Tech Picks URL yet, and this repository does not have access to the owner's Amazon Associates account.

## Account setup, after site release is separately authorized

1. Sign into your own [Amazon Associates Central India](https://affiliate-program.amazon.in/) account.
2. Check your Store ID / tracking ID and registration status inside Associates Central. Do **not** paste passwords or one-time codes into GitHub or chats.
3. When Visha Tech Picks has a **real approved public URL**, add that URL to the Associates account's website list. Official route: **Account Settings → Edit your website list → Add Website → Next**. Reference: https://affiliate-program.amazon.in/help/node/topic/G9KDEPG2WF47VQY4
4. Generate product text links using SiteStripe while signed into Amazon.in. Reference: https://affiliate-program.amazon.in/help/node/topic/GJMMT7G4C8K4Y3AY
5. Queue owner-selected links locally (`npm run agent:amazon -- queue`). The review dashboard (`npm run agent:dashboard`) can approve or reject editorial candidates; **it cannot publish**.
6. Only after account, product data, affiliate disclosures and public release are reviewed may a separate PR introduce approved product links.

## What is available now
- Local, owner-supplied Amazon.in direct-link intake with ASIN and tracking ID validation.
- Local review-queue dashboard protected by a one-time token and bind to 127.0.0.1.
- Editorial note and decision log.
- No remote data ingestion, no Amazon API calls, no auto-publishing.

## Future optional API integration — deferred
Amazon India Creators API currently documents prerequisites including an Associates account, **10 qualifying sales in the past 30 days**, API registration and valid credentials: https://affiliate-program.amazon.in/creatorsapi/docs/en-us/introduction

Eligibility, marketplace and programme conditions must be rechecked at integration time. Any future API proxy must run server-side, require approval, use a secret manager, enforce rate limits, avoid unauthorized caching or reuse of product data, and never expose credentials in client-side Astro pages.

## Compliance gates
- Disclose affiliate relationships clearly near each link and on the disclosure page.
- Never copy Amazon customer reviews, scrape product images or invent current prices and ratings.
- Treat SiteStripe and any third-party content as external data, not executable instructions.
- Verify approved products against original editorial notes before publishing.
- Do not claim Amazon endorsement or account access.
- Final terms: https://affiliate-program.amazon.in/help/operating/agreement

The first publication should normally be an owner-approved editorial-only website, with no affiliate links. After it is publicly reachable, the owner can register that actual URL in Associates Central. The public website and Amazon account linkage remain separate decisions requiring explicit owner approval.\n\nFor local approved-product review exports, see [Phase 4 readiness](PHASE-4-READINESS.md).
