const MARKETPLACE = "www.amazon.in";
const PARTNER_TAG = "vishvatechgui-21";
const API_URL = "https://creatorsapi.amazon/catalog/v1/searchItems";
let tokenCache = { value: "", expiresAt: 0 };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function b64url(input) {
  return Uint8Array.from(atob(input.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
}

async function verifyCloudflareAccess(request, env) {
  const assertion = request.headers.get("Cf-Access-Jwt-Assertion");
  const team = String(env.CF_ACCESS_TEAM_DOMAIN || "").replace(/^https?:\\/\\//, "").replace(/\\/$/, "");
  const audience = String(env.CF_ACCESS_AUD || "");
  if (!assertion || !team || !audience) return false;

  const parts = assertion.split(".");
  if (parts.length !== 3) return false;
  let header, claims;
  try {
    header = JSON.parse(new TextDecoder().decode(b64url(parts[0])));
    claims = JSON.parse(new TextDecoder().decode(b64url(parts[1])));
  } catch { return false; }
  const issuer = `https://${team}`;
  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== "RS256" || claims.iss !== issuer ||
      !Array.isArray(claims.aud) || !claims.aud.includes(audience) ||
      typeof claims.exp !== "number" || claims.exp <= now ||
      typeof claims.nbf === "number" && claims.nbf > now) return false;

  const jwksResponse = await fetch(`${issuer}/cdn-cgi/access/certs`, { cf: { cacheTtl: 300 } });
  if (!jwksResponse.ok) return false;
  const jwks = await jwksResponse.json();
  const jwk = jwks.keys?.find(key => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) return false;
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
}

function tokenEndpoint(version) {
  if (version === "3.1") return "https://api.amazon.com/auth/o2/token";
  if (version === "3.2") return "https://api.amazon.co.uk/auth/o2/token";
  if (version === "3.3") return "https://api.amazon.co.jp/auth/o2/token";
  throw new Error("Unsupported Creators API credential version.");
}

async function getAccessToken(env) {
  const now = Date.now();
  if (tokenCache.value && tokenCache.expiresAt > now + 60_000) return tokenCache.value;
  const id = env.AMAZON_CREATORS_CREDENTIAL_ID;
  const secret = env.AMAZON_CREATORS_CREDENTIAL_SECRET;
  const version = env.AMAZON_CREATORS_CREDENTIAL_VERSION;
  if (!id || !secret || !version) throw new Error("Creators API credentials are not configured.");
  const response = await fetch(tokenEndpoint(version), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "creatorsapi::default" }),
  });
  if (!response.ok) throw new Error("Amazon token request failed (" + response.status + ").");
  const payload = await response.json();
  if (!payload.access_token || !Number.isFinite(payload.expires_in)) throw new Error("Amazon returned an invalid token response.");
  tokenCache = { value: payload.access_token, expiresAt: now + payload.expires_in * 1000 };
  return tokenCache.value;
}

export async function onRequestPost({ request, env }) {
  if (!await verifyCloudflareAccess(request, env)) return json({ error: "Unauthorized" }, 401);
  let input;
  try { input = await request.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }
  const keywords = typeof input?.keywords === "string" ? input.keywords.trim() : "";
  if (!keywords || keywords.length > 120) return json({ error: "keywords must contain 1–120 characters." }, 400);
  const allowedIndexes = new Set(["All", "Electronics", "Computers", "OfficeProducts", "HomeAndKitchen", "Books"]);
  const searchIndex = allowedIndexes.has(input.searchIndex) ? input.searchIndex : "All";

  try {
    const accessToken = await getAccessToken(env);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        authorization: "Bearer " + accessToken,
        "content-type": "application/json",
        "x-marketplace": MARKETPLACE,
      },
      body: JSON.stringify({
        keywords,
        searchIndex,
        itemCount: 10,
        marketplace: MARKETPLACE,
        partnerTag: PARTNER_TAG,
        resources: ["itemInfo.title", "images.primary.medium", "offersV2.listings.price"],
      }),
    });
    if (!response.ok) return json({ error: "Amazon Creators API request failed.", upstreamStatus: response.status }, 502);
    const payload = await response.json();
    const items = (payload.searchResult?.items || []).flatMap(item => {
      const url = item.detailPageURL;
      let parsed;
      try { parsed = new URL(url); } catch { return []; }
      if (parsed.hostname !== "www.amazon.in" || parsed.searchParams.get("tag") !== PARTNER_TAG) return [];
      return [{
        asin: item.asin,
        title: item.itemInfo?.title?.displayValue || "",
        affiliateUrl: parsed.toString(),
        imageUrl: item.images?.primary?.medium?.url || null,
        // Price is intentionally not surfaced until freshness and display-policy handling are implemented.
      }];
    });
    return json({ marketplace: MARKETPLACE, partnerTag: PARTNER_TAG, items });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Amazon integration error." }, 503);
  }
}
