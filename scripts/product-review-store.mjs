import { randomUUID } from 'node:crypto';
import { readFile, readdir, writeFile, rename, unlink, lstat } from 'node:fs/promises';
import { join } from 'node:path';

/** @typedef {{id:string,title:string,category:string,editorialNote:string,createdAt:string,amazon:{asin:string,url:string,trackingId:string},reviewStatus:'pending'|'approved'|'rejected',publishApproved:false,reviewHistory?:Array<{decision:string,note:string,at:string}>}} ProductDraft */
const filenamePattern = /^[A-Z0-9]{10}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.json$/i;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const working = new Set();

/** @param {unknown} input @returns {input is ProductDraft} */
export function isProductDraft(input) {
  if (!input || typeof input !== 'object') return false;
  const data = /** @type {Record<string,any>} */ (input);
  return typeof data.id === 'string' && uuidPattern.test(data.id) &&
    typeof data.title === 'string' && typeof data.category === 'string' &&
    typeof data.editorialNote === 'string' &&
    data.amazon && typeof data.amazon === 'object' &&
    /^[A-Z0-9]{10}$/i.test(data.amazon.asin || '') &&
    typeof data.amazon.url === 'string' &&
    typeof data.amazon.trackingId === 'string' &&
    ['pending','approved','rejected'].includes(data.reviewStatus) &&
    data.publishApproved === false;
}

/** @param {string} dir @returns {Promise<Array<{filename:string,record:ProductDraft}>>} */
export async function getPrivateQueue(dir) {
  let names;
  try { names = await readdir(dir); }
  catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }
  /** @type {Array<{filename:string,record:ProductDraft}>} */
  const entries = [];
  for (const filename of names.filter(name => filenamePattern.test(name))) {
    const path = join(dir,filename);
    const stat = await lstat(path);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 16384) continue;
    let record;
    try { record = JSON.parse(await readFile(path,'utf8')); }
    catch { continue; }
    if (!isProductDraft(record) || filename.toUpperCase() !== `${record.amazon.asin}-${record.id}.json`.toUpperCase()) continue;
    entries.push({ filename,record });
  }
  return entries.sort((a,b)=>a.record.createdAt.localeCompare(b.record.createdAt));
}

/** @param {string} dir @param {string} id @param {'approve'|'reject'} decision @param {string} note */
export async function decideDraft(dir,id,decision,note) {
  if (!uuidPattern.test(id)) throw new Error('Invalid draft identifier');
  if (!['approve','reject'].includes(decision)) throw new Error('Unsupported decision');
  if (typeof note !== 'string' || note.trim().length < 12 || note.trim().length > 300) throw new Error('Provide a 12–300 character editorial review note');
  if (working.has(id)) throw new Error('Review already in progress');
  working.add(id);
  try {
    const entries = await getPrivateQueue(dir);
    const entry = entries.find(item => item.record.id === id);
    if (!entry) throw new Error('Product draft not found');
    if (entry.record.reviewStatus !== 'pending') throw new Error('Draft has already been reviewed');
    const record = {
      ...entry.record,
      reviewStatus: decision === 'approve' ? /** @type {const} */ ('approved') : /** @type {const} */ ('rejected'),
      publishApproved: /** @type {const} */ (false),
      reviewHistory: [...(entry.record.reviewHistory ?? []),{
        decision, note:note.trim(), at:new Date().toISOString(),
      }],
    };
    const path = join(dir,entry.filename);
    const temp = `${path}.${randomUUID()}.tmp`;
    try {
      await writeFile(temp,JSON.stringify(record,null,2)+'\n',{flag:'wx',mode:0o600});
      await rename(temp,path);
    } catch (error) {
      await unlink(temp).catch(()=>{});
      throw error;
    }
    return record;
  } finally { working.delete(id); }
}
