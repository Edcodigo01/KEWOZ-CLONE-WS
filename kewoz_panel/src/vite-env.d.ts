/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PRODUCT_TYPE?: string;
    readonly VITE_DEMO_LOGO_LIGHT?: string;
    readonly VITE_DEMO_LOGO_DARK?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
