import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { listTripHistory } from "@/lib/server/trips/queries";
import { TripList } from "@/components/cliente/trip-list";
import { HistorialFilters } from "@/components/cliente/historial-filters";

export const metadata = { title: "Historial — ReySil" };

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; page?: string };
}) {
  const user = await getCurrentUser();
  const page = parseInt(searchParams.page ?? "1", 10);
  const pageSize = 20;

  const { data: trips, total } = await listTripHistory(
    user.profile.client_id!,
    {
      from: searchParams.from,
      to: searchParams.to,
      page,
      pageSize,
    },
  );

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Historial de viajes
      </h2>

      <HistorialFilters
        from={searchParams.from ?? ""}
        to={searchParams.to ?? ""}
      />

      <TripList trips={trips} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <PaginationLink
              page={page - 1}
              from={searchParams.from}
              to={searchParams.to}
              label="Anterior"
            />
          )}
          <span className="text-sm text-neutral-500">
            Pagina {page} de {totalPages} ({total} viajes)
          </span>
          {page < totalPages && (
            <PaginationLink
              page={page + 1}
              from={searchParams.from}
              to={searchParams.to}
              label="Siguiente"
            />
          )}
        </div>
      )}
    </div>
  );
}

function PaginationLink({
  page,
  from,
  to,
  label,
}: {
  page: number;
  from?: string;
  to?: string;
  label: string;
}) {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  return (
    <a
      href={`/cliente/historial?${params.toString()}`}
      className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-100"
    >
      {label}
    </a>
  );
}
