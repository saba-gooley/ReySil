import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Cliente Supabase para uso en Server Components, Server Actions y Route Handlers.
 * Lee/escribe cookies httpOnly via la API de cookies() de Next.
 *
 * Uso:
 * ```ts
 * import { createClient } from "@/lib/supabase/server";
 * const supabase = createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // El metodo setAll lanza si se llama desde un Server Component.
            // Es seguro ignorarlo si hay middleware que refresca la sesion.
          }
        },
      },
    },
  );
}

/**
 * Cliente Supabase con privilegios de service_role.
 * USAR SOLO en operaciones administrativas que necesiten saltarse RLS
 * (creacion de usuarios, jobs, webhooks).
 * NUNCA exponer al cliente.
 */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // no-op
        },
      },
    },
  );
}
