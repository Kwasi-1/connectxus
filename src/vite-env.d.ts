/// &lt;reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DEFAULT_SPACE_ID: string;
  readonly PAYSTACK_SECRET_API_KEY: string;
  readonly PAYSTACK_PUBLIC_API_KEY: string;
  readonly VITE_SOCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
