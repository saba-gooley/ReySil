import { requireRole } from "@/lib/server/auth/get-current-user";
import { RolePlaceholder } from "@/components/role-placeholder";

export const metadata = { title: "Admin — ReySil" };

export default async function AdminHomePage() {
  const user = await requireRole("ADMIN");
  return (
    <RolePlaceholder
      title="Administracion"
      user={user}
      pendingModule="el Modulo 3 — Administracion"
    />
  );
}
