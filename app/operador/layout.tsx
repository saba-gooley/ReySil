import { requireRole } from "@/lib/server/auth/get-current-user";
import { OperadorNav } from "@/components/operador/operador-nav";
import Link from "next/link";

export const metadata = { title: "Panel Operadores — ReySil" };

export default async function OperadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("OPERADOR", "ADMIN");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-reysil-red">ReySil</h1>
            <OperadorNav />
          </div>
          <div className="flex items-center gap-4">
            {user.profile.role === "ADMIN" && (
              <Link
                href="/admin"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-reysil-red hover:bg-red-50 transition"
              >
                ← Panel Admin
              </Link>
            )}
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
