/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PASSWORD: string;
  readonly VITE_MARKETPLACE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
