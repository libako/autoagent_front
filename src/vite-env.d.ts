/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_KEY: string
  readonly VITE_SIGNALR_HUB_URL: string
  readonly VITE_ENABLE_SIGNALR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


