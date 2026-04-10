export default function OperadorHomePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        Panel de Operadores
      </h2>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-base font-semibold text-amber-900">
          Modulos disponibles
        </h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-amber-800">
          <li>
            <a href="/operador/clientes" className="underline hover:text-amber-600">
              Clientes
            </a>{" "}
            — ABM de clientes, emails y depositos
          </li>
          <li>
            <a href="/operador/choferes" className="underline hover:text-amber-600">
              Choferes
            </a>{" "}
            — ABM de choferes con generacion de credenciales
          </li>
        </ul>
        <p className="mt-3 text-sm text-amber-700">
          Las vistas de viajes (Pendientes, En Curso, Finalizadas) se
          implementan en el Modulo 5.
        </p>
      </div>
    </div>
  );
}
