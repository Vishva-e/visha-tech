# Architecture — Phase 1

**Source state:** approved blueprint v1.0, implemented locally. No hosted deployment.

## Components

- Astro pre-renders the complete site as static HTML.
- Tailwind CSS v4 is present through the Vite plugin; project styling is largely tokenized CSS in `src/styles/global.css`.
- Markdown content lives in `src/content/guides/` and is validated by `src/content.config.ts`.
- `src/pages/guides/[slug].astro` generates static article routes from content collection entry IDs.
- Category pages are generated from a fixed TypeScript category list; no arbitrary router input is served by a backend.
- Search is purely local, filtering already-rendered guide cards. It stores and sends no search queries to a server.
- No server runtime, database, authentication, checkout or external product data integration.

## Important constraints

- No product feeds, Amazon image scraping or prices.
- No claims of first-hand testing in desk-research posts.
- No operational tracking or contact submission until an approved policy and provider exist.
- Production SEO is gated by a verified domain and written launch approval.

## Planned milestones

Phase 1: UI and architecture foundation with sample content (current).
Phase 2: Complete research and review of 10 substantial articles; comprehensive build, accessibility and mobile QA.
Phase 3: Approved public deployment, production sitemap/canonical, contact channel, Search Console and Amazon website registration.
