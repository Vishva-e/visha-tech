# Amazon Creators API integration

The Cloudflare Pages Function at `functions/api/amazon-search.js` provides a server-side Amazon.in product search endpoint. It is intentionally fail-closed and does not publish products automatically.

## Security prerequisite

Protect `/api/amazon-search` with a Cloudflare Access self-hosted application before enabling it. Configure an allow policy for the owner's identity. The function independently verifies the Cloudflare Access JWT signature, issuer, audience and expiry using the Access JWKS endpoint.

Set these non-secret Pages environment variables:
- `CF_ACCESS_TEAM_DOMAIN`: your Access team hostname, e.g. `example.cloudflareaccess.com` (hostname only).
- `CF_ACCESS_AUD`: the Access application's AUD tag for the protected application.

If these values are absent or invalid, the endpoint returns 401.

## Secrets and environment

In Cloudflare Dashboard → Workers & Pages → visha-shop → Settings → Variables and Secrets, add the following as **encrypted secrets** (not plaintext variables):

- `AMAZON_CREATORS_CREDENTIAL_ID`: Creators API Credential ID.
- `AMAZON_CREATORS_CREDENTIAL_SECRET`: Creators API Credential Secret.

Add the credential version as a non-secret variable:
- `AMAZON_CREATORS_CREDENTIAL_VERSION`: the exact version shown for the generated credential (3.1, 3.2, or 3.3). Do not infer this from the marketplace; it selects the Login with Amazon token endpoint.

Also ensure the deployment target supports Cloudflare Pages Functions and that the function is included in the production deployment.

## Request

Authenticated POST to `/api/amazon-search`:

```json
{ "keywords": "wireless mouse", "searchIndex": "Electronics" }
```

Allowed indexes currently include All, Electronics, Computers, OfficeProducts, HomeAndKitchen and Books. The endpoint requests up to ten results and returns only ASIN, title, Amazon-hosted image URL and Amazon's tagged detail-page URL. The returned URL is accepted only when its hostname is `www.amazon.in` and its `tag` equals `vishvatechgui-21`.

The endpoint does not expose credentials or access tokens, does not return prices yet, and does not write products to the public catalogue. Results must pass editorial review and the existing publication gates.

## Operational notes

- OAuth access tokens are cached in memory for the lifetime of a Worker isolate and refreshed before expiry.
- Do not commit credentials, tokens, or Cloudflare Access secrets.
- Amazon may change API quotas, data availability, or required resources; handle upstream errors and respect the current Creators API agreement.
- Test only after Cloudflare Access and encrypted secrets are configured.
- Public product publishing and site indexability remain separately approval-gated.

Official docs:
- [Creators API overview and prerequisites](https://affiliate-program.amazon.in/creatorsapi/docs/)
- [SearchItems reference](https://affiliate-program.amazon.in/creatorsapi/docs/en-us/api-reference/operations/search-items)
- [OAuth token and cURL guide](https://affiliate-program.amazon.in/creatorsapi/docs/en-us/get-started/using-curl)
- [Credential versions](https://affiliate-program.amazon.in/creatorsapi/docs/en-us/concepts/understanding-versions)
