/** Strictly validate an owner-provided Amazon.in SiteStripe product link.
 * This function does not contact Amazon and does not verify an account's ownership.
 * @param {string} input
 */
export function validateAmazonLink(input) {
  let url;
  try { url = new URL(input); } catch { throw new Error('Invalid URL.'); }
  if (url.protocol !== 'https:' || url.username || url.password ||
      !['amazon.in', 'www.amazon.in'].includes(url.hostname) || url.port) {
    throw new Error('Use a direct HTTPS Amazon.in link from SiteStripe (not a redirect/shortlink).');
  }
  const match = url.pathname.match(/(?:^|\/)dp\/([A-Z0-9]{10})(?:\/|$)|(?:^|\/)gp\/product\/([A-Z0-9]{10})(?:\/|$)/i);
  if (!match) throw new Error('Expected a direct Amazon product page containing a 10-character ASIN.');
  const trackingId = url.searchParams.get('tag');
  if (!trackingId || !/^[a-z0-9][a-z0-9_-]{1,40}-21$/i.test(trackingId)) {
    throw new Error('A valid Amazon India Associates tracking tag is required (for example, example-21).');
  }
  if (url.hash) throw new Error('Product URL fragments are not accepted.');
  return {url:url.toString(),asin:(match[1]||match[2]).toUpperCase(),trackingId};
}
