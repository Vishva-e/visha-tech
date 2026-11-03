# Amazon Associates account connection & website agent

**Status: manual-review integration scaffold only. No Amazon account has been connected. No product has been published.**

## Current supported workflow (no Creators API eligibility required)

1. Enrol or sign into [Amazon Associates India](https://affiliate-program.amazon.in/) yourself.
2. Add the **approved public URL** of Visha Tech Picks to the list of sites in Associates Central when the site has been approved for launch. Do not add an unlaunched or nonexistent URL.
3. While signed into Amazon.in with your Associate account, use [SiteStripe](https://affiliate-program.amazon.in/help/node/topic/GJMMT7G4C8K4Y3AY) to generate a direct text product link with your tracking tag. **Do not copy product photos, descriptions or customer reviews.**
4. Expand any shortlink to a direct HTTPS `amazon.in/dp/ASIN?tag=YOURTAG-21` format via normal browser navigation; this agent rejects `amzn.in` redirect links to avoid blind links.
5. Run locally with your original editorial note (the record is **not published**):

```bash
npm run agent:amazon -- queue \
  --title "Example laptop for software development" \
  --category laptops \
  --summary "Original research note explaining why this could suit a specific buyer." \
  --url "https://www.amazon.in/dp/B0TEST1234?tag=YOURTAG-21"
npm run agent:amazon -- list
```

The URL shown is a **non-working example**, not a real offer or a real tracking ID. The queue is under `data/amazon/review-queue/`, ignored by Git and not shipped as part of the website. The agent does not create live pages or insert links into guides.

## Editorial approval flow

`Manual SiteStripe link → Host / ASIN / tracking-tag validation → Private local review queue → Human fact-check & compliance review → Separate, explicitly approved content PR → Later public release`

There is **no automatic approval/publishing**. Verify the product is appropriate, current, and accurately described. Include conspicuous affiliate disclosures. Do not use misleading “today's price”, “best deal” or price claims without authorized compliant data.

## Amazon account access

- This repository does **not** contain Amazon login, cookies, account tokens, tracking IDs, passwords or API secrets.
- There is no currently connected Amazon Associates account in the tooling used to create this scaffold. Log into your own Associates account to obtain SiteStripe links.
- Do not send a password or two-factor authentication code through a chat or commit one to Git.
- Treat any future automated access as a **separate approved integration** with credentials stored in an encrypted secret manager, never in a public frontend or GitHub repository.

## Future authorized product catalogue integration

Amazon's **Creators API** is the successor to PA-API 5.0. According to Amazon India's current published [prerequisites](https://affiliate-program.amazon.in/creatorsapi/docs/en-us/introduction), access requires Associates enrolment and at least 10 qualifying sales in the preceding 30 days, registration, and credentials. Integrate server-side only after eligibility is confirmed. GitHub/Cloudflare secrets and a private server-side service would be evaluated separately.

## Policy boundaries

- Do **not** scrape Amazon pages or bulk copy product descriptions, prices, pictures, or reviews.
- Use creator-owned original explanations and properly licensed/approved product data.
- Respect Amazon's [Operating Agreement](https://affiliate-program.amazon.in/help/operating/agreement).
- Require separate release approval; keep current site `noindex` and robots `Disallow: /`.
