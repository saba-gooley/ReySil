import { createAdminClient } from "@/lib/supabase/server";

export type OperatorRow = {
  id: string;
  email: string;
  full_name: string | null;
  banned: boolean;
  created_at: string;
};

export async function listOperators(): Promise<OperatorRow[]> {
  const supabase = createAdminClient();

  const { data: profiles, error } = await supabase
    .from("user_profiles")
    .select("id, full_name, created_at")
    .eq("role", "OPERADOR")
    .order("full_name");

  if (error) throw error;
  if (!profiles || profiles.length === 0) return [];

  // Fetch auth users to get email and banned status
  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (usersError) throw usersError;

  return profiles.map((p) => {
    const authUser = usersData.users.find((u) => u.id === p.id);
    return {
      id: p.id,
      email: authUser?.email ?? "—",
      full_name: p.full_name,
      banned: authUser?.banned ?? false,
      created_at: p.created_at,
    };
  });
}

export async function getOperatorById(id: string): Promise<OperatorRow> {
  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("id, full_name, created_at")
    .eq("id", id)
    .eq("role", "OPERADOR")
    .single();

  if (error || !profile) throw new Error("Operador no encontrado");

  const { data: authUser, error: authError } =
    await supabase.auth.admin.getUserById(id);

  if (authError) throw authError;

  return {
    id: profile.id,
    email: authUser.user.email ?? "—",
    full_name: profile.full_name,
    banned: authUser.user.banned ?? false,
    created_at: profile.created_at,
  };
}
