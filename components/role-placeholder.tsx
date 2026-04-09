import type { CurrentUser } from "@/lib/server/auth/get-current-user";

/**
 * Placeholder visual para los homes de cada rol mientras los modulos
 * funcionales no estan construidos. Muestra info del usuario y un boton
 * de cerrar sesion.
 *
 * Se reemplaza por las pantallas reales en los modulos 3-6.
 */
export function RolePlaceholder({
  title,
  user,
  pendingModule,
}: {
  title: string;
  user: CurrentUser;
  pendingModule: string;
}) {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-reysil-red">ReySil</h1>
            <p className="text-sm text-neutral-600">{title}</p>
          </div>
          <form action="/sign-out" method="post">
            <button
              type="submit"
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100"
            >
              Cerrar sesion
            </button>
          </form>
        </header>

        <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">
            Sesion activa
          </h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="w-24 text-neutral-500">Email:</dt>
              <dd className="text-neutral-900">{user.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 text-neutral-500">Rol:</dt>
              <dd className="text-neutral-900">{user.profile.role}</dd>
            </div>
            {user.profile.full_name ? (
              <div className="flex gap-2">
                <dt className="w-24 text-neutral-500">Nombre:</dt>
                <dd className="text-neutral-900">{user.profile.full_name}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-base font-semibold text-amber-900">
            Funcionalidad en construccion
          </h2>
          <p className="mt-2 text-sm text-amber-800">
            Esta seccion sera implementada en{" "}
            <span className="font-medium">{pendingModule}</span>. El modulo
            actual (Autenticacion) solo expone login, recuperacion de
            contrasena y enforce de roles.
          </p>
        </section>
      </div>
    </main>
  );
}
