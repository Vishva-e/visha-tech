# Phase 3 — Internal QA & release-readiness audit

**Website status: source-only, private GitHub; not published.**

## Local checks
- `npm ci` installs the locked dependency tree.
- `npm run validate` runs Astro type checking, Node unit tests, static compilation and `audit:build`.
- `audit:build` checks built HTML titles, descriptions, noindex, landmarks, root-relative internal links, robots, headers and absence of premature Amazon tracking links.
- GitHub Actions' `browser-qa` runs headless Chromium against **127.0.0.1** only. It checks 375, 768 and 1440 px layouts, mobile menu, guide filters, product finder and comparisons.
- Private screenshots are stored for 7 days as a GitHub Actions workflow artifact, **not deployed**.

## Not covered by automated checks
- Human judgement of whether all copy is accurate and Amazon Associates-compliant.
- Assistive technology screen-reader testing, color contrast measurements and every device/browser.
- Any real Amazon account or live product API.
- Final real-hosting headers, logging and privacy policy checks.
- Lighthouse scores for a real deployed site.
- Actual public-domain/copyright review and product listing checks.

## Manual phone/device review to complete before release
1. Visit each page at 320, 375, 390, 768, 1024 and 1440 px.
2. Verify mobile menu, guide search, select inputs and comparison scroll using keyboard and touch.
3. Inspect product finder without JavaScript (initial content and guide link remain accessible).
4. Check image/illustration and text clipping with text zoom to 200%.
5. Test at least Safari iOS, Chrome Android and a desktop browser.
6. Audit all policy text, Amazon disclosures, source references and contact channel.
7. Review private CI screenshots and fix visible issues.
8. Final domain, privacy, SEO and release flags require a **separate approval**. Do not use `PUBLIC_SITE_LIVE=true` in QA.

## Security notes
`public/_headers` sets baseline headers for a later Cloudflare deployment and deliberately adds an `X-Robots-Tag: noindex` block during prelaunch. This is **not** access control. Even a noindexed preview would be reachable by URL, so do not deploy a preview without authorization.

No hosted admin, backend API, payment collection or Amazon login exists.
