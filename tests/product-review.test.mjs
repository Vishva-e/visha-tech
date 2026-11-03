import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { decideDraft, getPrivateQueue, isProductDraft } from '../scripts/product-review-store.mjs';

test('product review decisions persist locally but always block public publishing',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'visha-product-review-'));
  try{
    const id=randomUUID(),name=`B0TEST1234-${id}.json`;
    const draft={schemaVersion:1,id,title:'A legitimate product recommendation',editorialNote:'Original notes and thoughtful comparison.',category:'laptops',createdAt:new Date().toISOString(),
      amazon:{asin:'B0TEST1234',url:'https://www.amazon.in/dp/B0TEST1234?tag=test-21',trackingId:'test-21'},reviewStatus:'pending',publishApproved:false};
    await writeFile(join(dir,name),JSON.stringify(draft));
    assert.equal((await getPrivateQueue(dir)).length,1);
    const approved=await decideDraft(dir,id,'approve','Checked original notes and product suitability.');
    assert.equal(approved.reviewStatus,'approved');
    assert.equal(approved.publishApproved,false);
    const stored=JSON.parse(await readFile(join(dir,name),'utf8'));
    assert.equal(stored.publishApproved,false);
    assert.equal(stored.reviewHistory.length,1);
    await assert.rejects(decideDraft(dir,id,'approve','Cannot approve this record twice.'),/already been reviewed/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('review queue ignores unexpected file names and rejects unsafe identifiers',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'visha-product-review-'));
  try{
    await writeFile(join(dir,'../'.replace(/\//g,'')+'other.json'),'{}');
    assert.equal((await getPrivateQueue(dir)).length,0);
    assert.equal(isProductDraft({publishApproved:true}),false);
    await assert.rejects(decideDraft(dir,'../../etc/passwd','reject','Reject malicious file path attempt.'),/Invalid draft identifier/);
    assert.equal((await readdir(dir)).length,1);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('editorial approval requires a useful review note',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'visha-product-review-'));
  try{await assert.rejects(decideDraft(dir,randomUUID(),'approve','ok'),/12–300/);}
  finally{await rm(dir,{recursive:true,force:true});}
});
