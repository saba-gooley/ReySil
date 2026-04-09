import { requireRole } from "@/lib/server/auth/get-current-user";
import { RolePlaceholder } from "@/components/role-placeholder";

export const metadata = { title: "Chofer — ReySil" };

export default async function DriverHomePage() {
  const user = await requireRole("CHOFER");
  return (
    <RolePlaceholder
      title="PWA Chofer"
      user={user}
      pendingModule="el Modulo 6 — PWA Chofer"
    />
  );
}
