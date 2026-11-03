/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly PUBLIC_SITE_LIVE?: string;
  readonly PUBLIC_AMAZON_ASSOCIATE_ACTIVE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
