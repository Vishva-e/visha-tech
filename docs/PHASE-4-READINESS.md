# Phase 4 — Editorial-first launch readiness (NOT A DEPLOYMENT)

## Correct launch sequence

1. Finish original-content and mobile/accessibility review, select an approved public editorial contact address, and audit privacy/copyright.
2. **Owner separately approves a public editorial-only release** (without affiliate links). This project currently has no approved domain and no public deployment. Cloudflare Pages configuration and hosting remain deferred.
3. When the editorial site is publicly reachable, **owner** registers its exact URL in Amazon Associates Central under Account Settings → Edit your website list → Add Website → Next. [Amazon help](https://affiliate-program.amazon.in/help/node/topic/G9KDEPG2WF47VQY4).
4. Owner obtains valid SiteStripe links within their Associates account. The local agent queues the links for editorial review.
5. The private dashboard records human decisions; `npm run agent:handoff` validates *approved* candidates without writing, and `npm run agent:handoff -- --write` saves a **gitignored** JSON file in `data/amazon/handoff/`. The export is NOT a public product listing and is never published automatically.
6. A later, **separately approved** affiliate-content PR may add properly disclosed links only after verified participation and compliance review.

Amazon's current application guidance recommends robust original content (around 10 posts as a rule of thumb), with an account review after three qualified sales in the initial 180 days. Neither approval nor commissions are guaranteed. [Official Amazon review guidance](https://affiliate-program.amazon.in/help/node/topic/G8TW5AE9XL2VX9VM).

## Commands (on local trusted computer)
```bash
npm ci
npm run validate
npm run release:preflight
npm run release:preflight -- --json

# After the owner manually provides and approves SiteStripe product drafts:
npm run agent:amazon -- list
npm run agent:dashboard
npm run agent:handoff
npm run agent:handoff -- --write
```

The preflight command deliberately exits nonzero while release requirements are missing; this is the expected, safe outcome. Setting environment flags is a **self-attested checklist**, not proof of Amazon eligibility or authorization to deploy. The script has no network calls or hosting permissions.

For an eventual **editorial-only** preflight, the separately approved environment would require:
- `SITE_URL`: real verified HTTPS origin, not `example.com`
- `OWNER_RELEASE_APPROVED=true`, `HOSTING_APPROVED=true`
- `PUBLIC_SITE_LIVE=true` *only after explicit launch approval*
- `CONTENT_REVIEW_APPROVED=true`, `PRIVACY_REVIEW_APPROVED=true`, `DEVICE_ACCESSIBILITY_APPROVED=true`
- `PUBLIC_CONTACT_EMAIL`: a real, owner-approved public contact address
- `RELEASE_MODE=editorial` and **no** active Amazon declaration

An **affiliate-enabled** release would additionally require `RELEASE_MODE=affiliate`, `PUBLIC_AMAZON_ASSOCIATE_ACTIVE=true`, `AMAZON_SITE_REGISTERED=true`, `AMAZON_LINKS_EDITORIALLY_APPROVED=true`, and `AMAZON_APPROVED_SITE_URL` matching the live URL. These values must be cross-checked against actual Associates account status; never infer account approval from a green local check.

## Non-negotiable boundaries

- No Cloudflare connection, public preview URL, branch production deployment or Amazon account login under this phase.
- No tracking tags, passwords, account credentials, product reviews, product images or API secrets in GitHub.
- `public/robots.txt`, meta noindex and `public/_headers` X-Robots-Tag remain **blocking** until an explicitly authorized launch PR.
- Private export files stay ignored by Git. Do not paste them into a support ticket or web service.
- `noindex` is **not** access control; staging deployments still expose URLs.

## Remaining owner decisions
A real domain / Cloudflare authorization, a public contact email, approved legal disclosures, physical-device/screen-reader QA, actual Amazon Associates state, and an explicit release instruction are not yet available.

## Source references
- [Amazon website list onboarding](https://affiliate-program.amazon.in/help/node/topic/G9KDEPG2WF47VQY4)
- [Amazon Associates application review](https://affiliate-program.amazon.in/help/node/topic/G8TW5AE9XL2VX9VM)
- [Amazon Creators API prerequisites](https://affiliate-program.amazon.in/creatorsapi/docs/en-us/introduction)
- [Cloudflare Pages custom static headers](https://developers.cloudflare.com/pages/configuration/headers/)
