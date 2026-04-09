import type { ReactNode } from "react";

/**
 * Layout para rutas publicas de autenticacion (login, recuperar/restablecer
 * contrasena). Centra el contenido en una card sobre fondo neutro.
 *
 * El middleware se encarga de redirigir al home del rol si el usuario ya
 * tiene sesion.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-reysil-red">ReySil</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Gestion de Viajes
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
