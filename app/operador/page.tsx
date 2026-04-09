import { requireRole } from "@/lib/server/auth/get-current-user";
import { RolePlaceholder } from "@/components/role-placeholder";

export const metadata = { title: "Operador — ReySil" };

export default async function OperatorHomePage() {
  const user = await requireRole("OPERADOR", "ADMIN");
  return (
    <RolePlaceholder
      title="Panel Operadores"
      user={user}
      pendingModule="el Modulo 5 — Panel Operadores"
    />
  );
}
