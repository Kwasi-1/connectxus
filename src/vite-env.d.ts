/// &lt;reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DEFAULT_SPACE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
