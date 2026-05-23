const TZ = "America/Argentina/Buenos_Aires";

/** Fecha de hoy en Argentina (YYYY-MM-DD). Usar en lugar de toISOString().split("T")[0] en código server-side. */
export function todayAR(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}
