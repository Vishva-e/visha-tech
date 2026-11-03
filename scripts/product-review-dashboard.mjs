import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { getPrivateQueue, decideDraft } from './product-review-store.mjs';

const queueDir = resolve(process.env.AMAZON_AGENT_QUEUE_DIR || 'data/amazon/review-queue');
const token = randomBytes(24).toString('hex');
const nonce = randomBytes(16).toString('base64');
const portOption = Number(process.env.VISHA_REVIEW_PORT ?? '0');
if (!Number.isInteger(portOption) || portOption < 0 || portOption > 65535) {
  throw new Error('VISHA_REVIEW_PORT must be 0–65535');
}

/** @param {import('node:http').ServerResponse} res @param {number} status @param {unknown} data */
function json(res,status,data) {
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(data));
}
/** @param {string|undefined} candidate */
function authorized(candidate) {
  if (!candidate || candidate.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(candidate),Buffer.from(token));
}
/** @param {import('node:http').IncomingMessage} req @returns {Promise<Record<string,any>>} */
function readJson(req) {
  return new Promise((resolve,reject)=>{
    let body='';
    req.on('data',part=>{
      body+=part.toString('utf8');
      if (body.length > 4096) {
        reject(new Error('Request too large'));
        req.destroy();
      }
    });
    req.on('end',()=>{
      try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON request')); }
    });
    req.on('error',reject);
  });
}
const server=createServer(async (req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Referrer-Policy','no-referrer');
  const currentPort = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  const expectedHost = `127.0.0.1:${currentPort}`;
  if (req.headers.host!==expectedHost) return json(res,403,{error:'Local access only'});
  const pathname=new URL(req.url??'/',`http://${expectedHost}`).pathname;
  if (pathname==='/' && req.method==='GET') {
    const template=await readFile(new URL('../tools/product-review.html',import.meta.url),'utf8');
    res.writeHead(200,{
      'Content-Type':'text/html; charset=utf-8',
      'Cache-Control':'no-store',
      'Content-Security-Policy':`default-src 'none'; base-uri 'none'; frame-ancestors 'none'; connect-src 'self'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'`,
    });
    return res.end(template.replaceAll('__NONCE__',nonce));
  }
  if (pathname==='/api/items' && req.method==='GET') {
    if (!authorized(req.headers['x-visha-review-token']?.toString())) return json(res,401,{error:'Invalid local review token'});
    try {
      const entries=await getPrivateQueue(queueDir);
      return json(res,200,{items:entries.map(item=>item.record).map(({amazon,...rest})=>({
        ...rest,amazon:{asin:amazon.asin}, // product affiliate links/tracking IDs stay private
      }))});
    } catch { return json(res,500,{error:'Unable to read local review queue'}); }
  }
  if (pathname==='/api/decision' && req.method==='POST') {
    if (req.headers.origin!==`http://${expectedHost}`) return json(res,403,{error:'Unexpected origin'});
    if (!authorized(req.headers['x-visha-review-token']?.toString())) return json(res,401,{error:'Invalid local review token'});
    try {
      const body=await readJson(req);
      const record=await decideDraft(queueDir,body.id,body.decision,body.note);
      return json(res,200,{id:record.id,status:record.reviewStatus,publishApproved:false});
    } catch (error) {
      return json(res,400,{error:error instanceof Error?error.message:'Unable to record decision'});
    }
  }
  return json(res,404,{error:'Not found'});
});
server.listen(portOption,'127.0.0.1',()=>{
  const p=/** @type {import('node:net').AddressInfo} */(server.address()).port;
  process.stdout.write(`\nVisha Tech Picks • local private review dashboard\nOpen: http://127.0.0.1:${p}/\nOne-time dashboard token: ${token}\nNo Cloudflare or Amazon connection. Approved items NEVER publish automatically.\nPress Ctrl+C to stop.\n\n`);
});
