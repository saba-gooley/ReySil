import { type NextRequest } from "next/server";
// Import relativo (no usar "@/...") porque el bundler Edge de Vercel
// no resuelve siempre los path aliases en imports del middleware raiz.
import { updateSession } from "./lib/supabase/middleware";

/**
 * Middleware raiz de Next.js.
 *
 * Modulo 1: solo refresca la sesion de Supabase en cada request.
 * Modulo 2 (Auth) agregara redirecciones por rol.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match todas las rutas excepto:
     * - _next/static (assets estaticos)
     * - _next/image (optimizacion de imagenes)
     * - favicon.ico
     * - manifest.json (PWA)
     * - sw.js (service worker)
     * - public/ (assets publicos)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)",
  ],
};
