import { ownerProvidedTrackingId } from '../src/config/amazon-associates.mjs';

const TRACKING_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,40}-21$/i;
const PRODUCT_PATH_PATTERN = /(?:^|\/)dp\/([A-Z0-9]{10})(?:\/|$)|(?:^|\/)gp\/product\/([A-Z0-9]{10})(?:\/|$)/i;

/** Strictly validate an owner-provided Amazon.in direct product link.
 * This function does not contact Amazon and does not verify account ownership.
 * @param {string} input
 */
export function validateAmazonLink(input) {
  let url;
  try { url = new URL(input); } catch { throw new Error('Invalid URL.'); }
  if (url.protocol !== 'https:' || url.username || url.password ||
      !['amazon.in', 'www.amazon.in'].includes(url.hostname) || url.port) {
    throw new Error('Use a direct HTTPS Amazon.in product link (not a redirect or shortlink).');
  }
  const match = url.pathname.match(PRODUCT_PATH_PATTERN);
  if (!match) throw new Error('Expected a direct Amazon product page containing a 10-character ASIN.');
  const trackingId = url.searchParams.get('tag');
  if (!trackingId || !TRACKING_ID_PATTERN.test(trackingId)) {
    throw new Error('A valid Amazon India Associates tracking tag is required (for example, example-21).');
  }
  if (url.hash) throw new Error('Product URL fragments are not accepted.');
  return { url: url.toString(), asin: (match[1] || match[2]).toUpperCase(), trackingId };
}

/**
 * Create a direct Amazon.in Special Link from a product ASIN or direct product URL.
 * The public owner-provided tracking tag is added automatically. This does not
 * scrape Amazon, fetch product metadata, authenticate, or publish a product.
 *
 * Existing tags are accepted only when they match the configured owner tag.
 * Short links and non-product pages are intentionally rejected.
 *
 * @param {string} input ASIN or direct HTTPS Amazon.in product URL
 */
export function createAmazonAffiliateLink(input) {
  const value = typeof input === 'string' ? input.trim() : '';
  if (!value) throw new Error('Provide a 10-character ASIN or direct Amazon.in product URL.');

  const trackingId = ownerProvidedTrackingId;
  if (!TRACKING_ID_PATTERN.test(trackingId)) {
    throw new Error('The configured Amazon India tracking ID is invalid.');
  }

  let asin;
  if (/^[A-Z0-9]{10}$/i.test(value)) {
    asin = value.toUpperCase();
  } else {
    let source;
    try { source = new URL(value); } catch { throw new Error('Provide a valid ASIN or direct Amazon.in product URL.'); }
    if (source.protocol !== 'https:' || source.username || source.password ||
        !['amazon.in', 'www.amazon.in'].includes(source.hostname) || source.port) {
      throw new Error('Use a direct HTTPS Amazon.in product URL (short links and other hosts are not accepted).');
    }
    if (source.hash) throw new Error('Product URL fragments are not accepted.');
    const match = source.pathname.match(PRODUCT_PATH_PATTERN);
    if (!match) throw new Error('The URL must be an Amazon product detail page containing a 10-character ASIN.');
    const existingTag = source.searchParams.get('tag');
    if (existingTag && existingTag !== trackingId) {
      throw new Error('The URL contains a different tracking tag; refusing to overwrite it.');
    }
    asin = (match[1] || match[2]).toUpperCase();
  }

  const target = new URL(\`/dp/\${asin}\`, 'https://www.amazon.in');
  target.searchParams.set('tag', trackingId);
  return validateAmazonLink(target.toString());
}
