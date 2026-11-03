# Cloudflare Pages — future deployment guide (NOT EXECUTED)

**Release freeze:** Owner approved source-code Phase 1 only. No Pages project, GitHub Pages, Cloudflare preview URL or production URL should be created under this approval.

## GitHub private repo handoff

The owner has created the **private** repository at `https://github.com/Vishva-e/vishva-tech-picks` on November 3, 2026. The repository slug retains the original spelling (`vishva-...`) while **the public-facing brand and package name are Visha Tech Picks**. Do not rename the repository without explicit authorization.

Phase 1 code should be committed only to a non-production development branch, `feat/phase-1-foundation`, and reviewed before any merge. `main` stays unpublished. Do **not** configure Cloudflare Pages or any other deployment integration until the owner explicitly approves the visibility and release process.

To push code locally if needed (with the owner's GitHub credentials configured):

```bash
git remote add origin git@github.com:Vishva-e/vishva-tech-picks.git
git push -u origin feat/phase-1-foundation
```

## AFTER separate owner release approval

1. Finish Phase 2 content QA and approve a public contact channel.
2. Review website privacy, editorial and affiliate documents.
3. In Cloudflare Workers & Pages, connect the GitHub private repository.
4. Configure Astro static build `npm run build`, output `dist`, production branch `main`.
5. Set `SITE_URL=https://<actual-approved-host>` and `PUBLIC_SITE_LIVE=true` only for the approved production build.
6. Replace blocking robots.txt with reviewed sitemap-aware robots instructions; create a sitemap after the actual URL is known.
7. Preview under an explicitly approved visibility model. **Preview URLs are not confidential by default.**
8. After explicit final sign-off, enable public deployment and confirm live URL.
9. Check mobile, keyboard navigation, link integrity, canonical URLs and Search Console.

Reference: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
