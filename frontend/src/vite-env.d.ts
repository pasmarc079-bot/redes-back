/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_WHATSAPP_NUMBER: string;
  readonly VITE_META_PIXEL_ID: string;
  readonly VITE_TIKTOK_PIXEL_ID: string;
  readonly VITE_GTM_ID: string;
  readonly VITE_FACEBOOK_PAGE: string;
  readonly VITE_YOUTUBE_CHANNEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
