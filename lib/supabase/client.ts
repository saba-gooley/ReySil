import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso en componentes Client (browser).
 * Usa la anon key publica. Las RLS policies son la unica fuente de seguridad.
 *
 * Uso:
 * ```ts
 * "use client";
 * import { createClient } from "@/lib/supabase/client";
 * const supabase = createClient();
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
