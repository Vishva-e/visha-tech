import { validateAmazonLink } from '../../scripts/amazon-link-policy.mjs';

/**
 * Fail-closed Amazon India affiliate link publishing gate for pre-approved
 * SiteStripe product URLs. No external calls or credentials are needed here.
 * A valid tracking tag alone does NOT mean a verified Associates account.
 *
 * @param {{ url:string, reviewed:boolean, status?:string }} candidate
 * @param {Record<string,string|undefined>} env
 * @returns {null | {url:string, asin:string, trackingId:string, disclosure:string, rel:string}}
 */
export function approvedAffiliateLink(candidate, env) {
  if (!candidate || candidate.reviewed !== true || candidate.status !== 'approved') return null;
  if (env.PUBLIC_AMAZON_ASSOCIATE_ACTIVE !== 'true' ||
      env.AMAZON_SITE_REGISTERED !== 'true' ||
      env.AMAZON_LINKS_EDITORIALLY_APPROVED !== 'true') return null;
  const expectedTag=env.AMAZON_ASSOCIATE_TAG?.trim();
  if (!expectedTag || !/^[a-z0-9][a-z0-9_-]{1,40}-21$/i.test(expectedTag)) return null;
  let site,approved;
  try {
    site=new URL(env.SITE_URL ?? '');
    approved=new URL(env.AMAZON_APPROVED_SITE_URL ?? '');
  } catch { return null; }
  /** @param {URL} u */
  const validOrigin = (u) => u.protocol==='https:' && !!u.hostname &&
    !u.username && !u.password && !u.port && u.pathname==='/' && !u.search && !u.hash;
  if (!validOrigin(site) || !validOrigin(approved) || site.origin!==approved.origin) return null;
  let parsed;
  try { parsed=validateAmazonLink(candidate.url); } catch { return null; }
  if (parsed.trackingId!==expectedTag) return null;
  return {
    ...parsed,
    disclosure: '(paid link)',
    rel: 'sponsored nofollow noopener noreferrer',
  };
}
