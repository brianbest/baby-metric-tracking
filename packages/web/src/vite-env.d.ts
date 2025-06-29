/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SEGMENT_WRITE_KEY?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 