import { requireRole } from "@/lib/server/auth/get-current-user";
import Link from "next/link";

export const metadata = { title: "Panel Admin — ReySil" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-reysil-red">ReySil</h1>
            <nav className="flex flex-wrap gap-1">
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition"
              >
                Admin
              </Link>
              <Link
                href="/admin/operadores"
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition"
              >
                Operadores
              </Link>
              <span className="my-auto h-4 w-px bg-neutral-300" />
              <Link
                href="/operador"
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition"
              >
                Panel Operadores →
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">{user.email}</span>
            <form action="/sign-out" method="post">
              <button
                type="submit"
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
