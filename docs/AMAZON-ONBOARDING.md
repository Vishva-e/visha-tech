# Amazon Associates India — Visha Shop onboarding

**Current status:** The repository contains a public owner-provided tracking identifier (\`vishvatechgui-21\`) and a private manual-review workflow. The code does not authenticate to Amazon or independently verify account/site approval.

## Account and website

1. Sign in privately at [Amazon Associates Central India](https://affiliate-program.amazon.in/).
2. Confirm the Associates account is fully active and the tracking ID \`vishvatechgui-21\` exists under that account.
3. Confirm the exact public site URL \`https://visha-shop.pages.dev/\` is saved in the Associates website list.
4. Never send passwords, OTPs, session cookies or API credentials through chat or commit them to Git.

## Create product links

There are two supported ways to create a tagged direct product link:

- **Visha link builder:** run \`npm run agent:amazon -- link --asin B07NYB3HMC\` or pass a direct Amazon.in product URL with \`--url\`. The tool adds the configured tracking tag automatically. It does not contact Amazon or verify the product exists.
- **Amazon SiteStripe:** while signed into Amazon.in with the Associates account, open the product detail page and use SiteStripe → Get Link → Text. Pass the direct tagged URL to the local queue if preferred.

Queue the product for editorial review with \`npm run agent:amazon -- queue\`. Provide an original title, category and editorial note. The draft is stored locally, not published.

## Fully automated product catalogue (optional)

Amazon India Creators API provides product search and item lookup. Its current prerequisites include:
- Associates enrolment for the target marketplace
- At least 10 qualifying sales in the preceding 30 days
- Creators API registration in Associates Central
- Generated API credentials

If eligible, credentials must be stored only as server-side Cloudflare secrets. The integration must retain the link parameters returned by Amazon, enforce usage limits and comply with the API licence. If not eligible, continue using the link builder and manual review queue.

## Publication controls

- Product details, images, prices, ratings and availability are not fetched by the link builder.
- No draft becomes a website listing automatically.
- Each product requires editorial fact-checking, review approval, an approved content PR and a separate public release approval.
- Affiliate disclosures must be clear near each link. When participation is active, include: **“As an Amazon Associate I earn from qualifying purchases.”**
- Do not scrape Amazon or copy customer reviews, images or descriptions.

Official references:
- [SiteStripe help](https://affiliate-program.amazon.in/help/node/topic/GJMMT7G4C8K4Y3AY)
- [Associates linking requirements](https://affiliate-program.amazon.in/help/operating/linking)
- [Creators API introduction](https://affiliate-program.amazon.in/creatorsapi/docs/en-us/introduction)
- [Operating Agreement](https://affiliate-program.amazon.in/help/operating/agreement)
