# Amazon Associates account connection & website agent

**Status: automatic direct-link construction + private manual-review queue. No Amazon account session or Creators API connection is established. No product is published automatically.**

## What is automated now

The local link builder creates an Amazon.in direct product Special Link from either a 10-character ASIN or a direct Amazon.in product URL. It adds the owner-provided tracking tag \`vishvatechgui-21\` automatically.

Amazon's India linking requirements say Special Links may be created by the Associate or supplied by Amazon, and each link must contain the appropriate Associates ID/tag. This tool constructs only a direct HTTPS Amazon.in product URL with that tag; it does not log in to Amazon, interact with SiteStripe, scrape pages, or verify account ownership. Confirm the account/tag and destination in Associates Central before public release.

## Commands

Generate a tagged affiliate link:

\`\`\`bash
npm run agent:amazon -- link --asin B07NYB3HMC
npm run agent:amazon -- link --url "https://www.amazon.in/dp/B07NYB3HMC"
\`\`\`

Queue a selected product for private editorial review:

\`\`\`bash
npm run agent:amazon -- queue \\
  --title "Satechi M1 Bluetooth Wireless Mouse" \\
  --category developer-gear \\
  --summary "Original research note explaining who this product may suit and its limitations." \\
  --url "https://www.amazon.in/dp/B07NYB3HMC"
npm run agent:amazon -- list
\`\`\`

You may also use Amazon SiteStripe while signed in to your Associates account and pass its direct tagged link to the same queue command. The CLI rejects shortlinks and any tag that differs from the configured owner tag.

The URL in the examples is illustrative; the tool does not verify product availability, ASIN existence, product title, product claims or current seller details.

## What remains manual

- Choose the product and provide its title, category and an original editorial note.
- Check product specifications, compatibility, seller, warranty and the destination listing.
- Review and approve every draft in the private review dashboard.
- Approve a separate content PR and the public affiliate release.

The queue remains local under \`data/amazon/review-queue/\` and is gitignored. A queued item has \`reviewStatus: pending\` and \`publishApproved: false\`; it is not a live website listing. No product is published or deployed by the link builder.

## Full catalogue automation

Amazon India Creators API supports product search and item lookup. Amazon currently documents these prerequisites: Associates enrolment in the target marketplace, at least 10 qualifying sales in the preceding 30 days, Creators API registration and generated credentials. If eligible, a future integration must run server-side with credentials stored in Cloudflare secrets, retain Amazon-returned link parameters and obey API usage limits. Do not put credentials in the browser, source code or chat.

Until API access is approved, the supported automation is direct-link construction and local draft intake—not automated product metadata, images, prices, ratings or availability.

## Account security and policy

- Never share Amazon passwords, OTPs, session cookies or API secrets in chat or Git.
- Do not scrape Amazon product pages or copy customer reviews, images or descriptions.
- Do not invent current prices, availability, discounts or ratings.
- Display clear affiliate disclosures near every paid link and the required Associates statement when active.
- Keep the existing fail-closed publication and site-release gates enabled.

Official references:
- [Amazon.in SiteStripe help](https://affiliate-program.amazon.in/help/node/topic/GJMMT7G4C8K4Y3AY)
- [Amazon.in Associates linking requirements](https://affiliate-program.amazon.in/help/operating/linking)
- [Amazon.in Creators API prerequisites](https://affiliate-program.amazon.in/creatorsapi/docs/en-us/introduction)
- [Amazon.in Operating Agreement](https://affiliate-program.amazon.in/help/operating/agreement)
