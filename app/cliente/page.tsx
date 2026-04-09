import { requireRole } from "@/lib/server/auth/get-current-user";
import { RolePlaceholder } from "@/components/role-placeholder";

export const metadata = { title: "Cliente — ReySil" };

export default async function ClientHomePage() {
  const user = await requireRole("CLIENTE");
  return (
    <RolePlaceholder
      title="Portal Cliente"
      user={user}
      pendingModule="el Modulo 4 — Portal Cliente"
    />
  );
}
