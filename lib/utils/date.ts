const TZ = "America/Argentina/Buenos_Aires";

/** Fecha de hoy en Argentina (YYYY-MM-DD). Usar en lugar de toISOString().split("T")[0] en código server-side. */
export function todayAR(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Hora (HH:MM) de un timestamp ISO, en timezone Argentina. */
export function formatHoraAR(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}
