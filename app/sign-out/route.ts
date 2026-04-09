import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cierra la sesion de Supabase y redirige a /login.
 * Acepta POST (preferido para evitar logouts accidentales por prefetch)
 * y GET como fallback.
 */
async function signOutAndRedirect(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}

export async function POST(request: NextRequest) {
  return signOutAndRedirect(request);
}

export async function GET(request: NextRequest) {
  return signOutAndRedirect(request);
}
