/**
 * Email HTML templates for ReySil notifications.
 * Inline styles for maximum email client compatibility.
 */

const BRAND_RED = "#DC2626";
const BRAND_RED_DARK = "#B91C1C";

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
  <tr><td style="background:${BRAND_RED};padding:20px 24px;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Transportes ReySil</h1>
  </td></tr>
  <tr><td style="padding:24px;">
    ${body}
  </td></tr>
  <tr><td style="background:#f9fafb;padding:16px 24px;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      Este es un email automatico de Transportes ReySil. No responder a este mensaje.
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function dataRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 12px;color:#6b7280;font-size:14px;white-space:nowrap;">${label}</td>
    <td style="padding:6px 12px;color:#111827;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

// ─── HU-NOT-001: Assignment notification ───────────────────────────

export type AssignmentEmailData = {
  clientName: string;
  driverName: string;
  patente: string;
  tipoViaje: string;
  destino: string;
  fecha: string;
};

export function assignmentSubject(data: AssignmentEmailData): string {
  return `ReySil — Chofer asignado para tu envio ${data.destino} — ${data.fecha}`;
}

export function assignmentHtml(data: AssignmentEmailData): string {
  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND_RED_DARK};font-size:18px;">Chofer y patente asignados</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.5;">
      Hola <strong>${data.clientName}</strong>, te informamos que se ha asignado un chofer
      y camion para tu envio.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:16px;">
      <tbody>
        ${dataRow("Chofer", data.driverName)}
        ${dataRow("Patente", data.patente)}
        ${dataRow("Tipo de viaje", data.tipoViaje)}
        ${dataRow("Destino", data.destino)}
        ${dataRow("Fecha", data.fecha)}
      </tbody>
    </table>
    <p style="margin:0;color:#6b7280;font-size:13px;">
      Si tenes alguna consulta, comunicate con nosotros.
    </p>`;

  return layout("Chofer asignado — ReySil", body);
}

// ─── HU-NOT-002: Remito uploaded notification ──────────────────────

export type RemitoEmailData = {
  clientName: string;
  driverName: string;
  patente: string;
  destino: string;
  fecha: string;
  remitoUrl: string | null;
};

export function remitoSubject(data: RemitoEmailData): string {
  return `ReySil — Confirmacion de entrega ${data.destino} — ${data.fecha}`;
}

export function remitoHtml(data: RemitoEmailData): string {
  const linkBlock = data.remitoUrl
    ? `<p style="margin:16px 0 0;text-align:center;">
        <a href="${data.remitoUrl}" target="_blank" rel="noopener"
           style="display:inline-block;background:${BRAND_RED};color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:600;">
          Ver remito
        </a>
      </p>`
    : "";

  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND_RED_DARK};font-size:18px;">Confirmacion de entrega</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.5;">
      Hola <strong>${data.clientName}</strong>, te confirmamos que la entrega se ha realizado
      y el remito firmado fue registrado.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:16px;">
      <tbody>
        ${dataRow("Chofer", data.driverName)}
        ${dataRow("Patente", data.patente)}
        ${dataRow("Destino", data.destino)}
        ${dataRow("Fecha", data.fecha)}
      </tbody>
    </table>
    ${linkBlock}
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">
      Si tenes alguna consulta, comunicate con nosotros.
    </p>`;

  return layout("Confirmacion de entrega — ReySil", body);
}

// ─── HU-NOT-003: Solicitud created notification ──────────────────────

export type SolicitudEmailData = {
  clientName: string;
  tipoSolicitud: "Reparto" | "Contenedor";
  origen: string;
  destino: string;
  fecha: string;
  detalles?: string;
};

export function solicitudSubject(data: SolicitudEmailData): string {
  return `ReySil — Nueva solicitud de ${data.tipoSolicitud} — ${data.destino}`;
}

export function solicitudHtml(data: SolicitudEmailData): string {
  const body = `
    <h2 style="margin:0 0 8px;color:${BRAND_RED_DARK};font-size:18px;">Solicitud de ${data.tipoSolicitud}</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.5;">
      Hola <strong>${data.clientName}</strong>, se ha registrado una nueva solicitud de ${data.tipoSolicitud.toLowerCase()}
      en el sistema.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:16px;">
      <tbody>
        ${dataRow("Tipo", data.tipoSolicitud)}
        ${dataRow("Origen", data.origen)}
        ${dataRow("Destino", data.destino)}
        ${dataRow("Fecha de carga", data.fecha)}
        ${data.detalles ? dataRow("Detalles", data.detalles) : ""}
      </tbody>
    </table>
    <p style="margin:0;color:#6b7280;font-size:13px;">
      Por favor, revisa la solicitud en tu cuenta de ReySil.
    </p>`;

  return layout(`Solicitud de ${data.tipoSolicitud} — ReySil`, body);
}
