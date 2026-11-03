#!/usr/bin/env node
/**
 * Local-only, human-review handoff. Never writes into Astro src/public,
 * never deploys, never calls Amazon or exposes credentials to a website.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { getPrivateQueue } from './product-review-store.mjs';
import { validateAmazonLink } from './amazon-link-policy.mjs';

const inputDir=resolve(process.env.AMAZON_AGENT_QUEUE_DIR || 'data/amazon/review-queue');
const outputDir=resolve(process.env.AMAZON_AGENT_HANDOFF_DIR || 'data/amazon/handoff');
const write=process.argv.includes('--write');
if(process.argv.slice(2).some(flag=>flag!=='--write'&&flag!=='--help')) {
  console.error('Allowed: npm run agent:handoff -- [--write]');
  process.exit(2);
}
if(process.argv.includes('--help')) {
  console.log('Read-only by default. --write creates a gitignored, local-only editorial handoff JSON file; never publishes.');
} else {
  const queue=await getPrivateQueue(inputDir);
  /** @type {Array<{id:string, asin:string, title:string,category:string,affiliateUrl:string, editorialNote:string, reviewNote:string, editorialStatus:string,publishApproved:false}>} */
  const ready=[];
  let unsafe=0;
  for(const {record} of queue) {
    if(record.reviewStatus!=='approved')continue;
    try {
      const link=validateAmazonLink(record.amazon.url);
      const latest=record.reviewHistory?.at(-1);
      if(link.asin!==record.amazon.asin || link.trackingId!==record.amazon.trackingId ||
         latest?.decision!=='approve' ||
         !latest?.note ||
         record.publishApproved!==false)throw new Error('Candidate provenance mismatch');
      ready.push({
        id:record.id,asin:link.asin,title:record.title,
        category:record.category,affiliateUrl:link.url,
        editorialNote:record.editorialNote,reviewNote:latest.note,
        editorialStatus:'awaiting-separate-content-pr-and-owner-publication-approval',
        publishApproved:false
      });
    }catch{unsafe++;}
  }
  if(!write){
    console.log(`Approved review candidates: ${ready.length}; rejected unsafe records: ${unsafe}.\nNothing was written or published. Use --write to create a LOCAL handoff.`);
  }else{
    if(!ready.length) {
      console.log('No valid approved candidates; nothing written.');
    }else{
      await mkdir(outputDir,{recursive:true,mode:0o700});
      const name=`handoff-${randomUUID()}.json`;
      const body={schemaVersion:1,exportedAt:new Date().toISOString(),usage:'private-editorial-review-only',
        publicationAuthorized:false,products:ready};
      await writeFile(join(outputDir,name),JSON.stringify(body,null,2)+'\n',{mode:0o600,flag:'wx'});
      console.log(`Created private editorial handoff: ${name} (${ready.length} product candidate(s)).\nDo not commit this file. No website or Amazon account changes were made.`);
    }
  }
}
