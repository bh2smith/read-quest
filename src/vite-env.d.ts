/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GNOSIS_CHAIN_ID?: string;
  readonly VITE_ANALYTICS_URL?: string;
  readonly VITE_BADGE_1155_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
