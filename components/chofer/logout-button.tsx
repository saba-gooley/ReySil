"use client";

import { logoutAction } from "@/lib/server/auth/logout-action";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => logoutAction()}
      className="rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
    >
      Salir
    </button>
  );
}
