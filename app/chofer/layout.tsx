import { requireRole } from "@/lib/server/auth/get-current-user";
import { ChoferNav } from "@/components/chofer/chofer-nav";
import { LogoutButton } from "@/components/chofer/logout-button";

export const metadata = { title: "Chofer — ReySil" };

export default async function ChoferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("CHOFER");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <span className="text-sm font-bold text-reysil-red">ReySil</span>
          <span className="text-xs text-neutral-500">{user.profile.full_name}</span>
          <div className="flex items-center gap-2">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white">
        <ChoferNav />
      </nav>
    </div>
  );
}
