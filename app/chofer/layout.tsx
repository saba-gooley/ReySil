import { requireRole } from "@/lib/server/auth/get-current-user";
import { ChoferNav } from "@/components/chofer/chofer-nav";

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
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white"
          >
            WhatsApp
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white">
        <ChoferNav />
      </nav>
    </div>
  );
}
