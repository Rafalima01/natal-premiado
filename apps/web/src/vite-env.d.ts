/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do projeto Supabase. Pública por design. */
  readonly VITE_SUPABASE_URL: string;
  /**
   * Chave anônima do Supabase. Pública por design — protegida por RLS e pelas
   * políticas do provedor. A `service_role` NUNCA deve aparecer no frontend.
   */
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Base da API da plataforma. */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
