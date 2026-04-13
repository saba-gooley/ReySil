// Shared inspection section definitions — NOT a "use server" file
// so it can be imported by both server actions and client components.

export const INSPECTION_SECTIONS = {
  DOCUMENTACION: [
    { codigo: "ART", desc: "ART" },
    { codigo: "SEGURO_LIC", desc: "Seguro y Licencias" },
    { codigo: "CEDULA_VERDE", desc: "Cedula Verde" },
    { codigo: "RUTA", desc: "RUTA" },
    { codigo: "VTV", desc: "VTV" },
  ],
  ESTADO_VEHICULO: [
    { codigo: "CUBIERTAS", desc: "Cubiertas" },
    { codigo: "LONAS", desc: "Lonas" },
    { codigo: "LUCES", desc: "Luces" },
    { codigo: "SUJECION", desc: "Elementos de Sujecion" },
    { codigo: "COMBUSTIBLE", desc: "Combustible/Aceite" },
    { codigo: "FRENOS", desc: "Frenos" },
    { codigo: "LIMPIEZA", desc: "Limpieza" },
  ],
  SEG_PERSONAL: [
    { codigo: "VESTIMENTA", desc: "Vestimenta" },
    { codigo: "ZAPATOS", desc: "Zapatos" },
    { codigo: "CASCO", desc: "Casco" },
    { codigo: "GUANTES_CUERO", desc: "Guantes cuero" },
    { codigo: "GUANTES_GOMA", desc: "Guantes goma" },
    { codigo: "CHALECO", desc: "Chaleco" },
    { codigo: "MASCARA", desc: "Mascara" },
    { codigo: "BOTIQUIN", desc: "Botiquin" },
  ],
  SEG_VEHICULO: [
    { codigo: "BALIZAS", desc: "Balizas" },
    { codigo: "LINTERNAS", desc: "Linternas" },
    { codigo: "CUARTA_REMOLQUE", desc: "Cuarta de remolque" },
    { codigo: "TACOGRAFO", desc: "Tacografo" },
    { codigo: "ARRESTALLAMAS", desc: "Arrestallamas" },
    { codigo: "CALZAS", desc: "Calzas" },
    { codigo: "ALARMA_RETROCESO", desc: "Alarma de retroceso" },
  ],
  KIT_DERRAMES: [
    { codigo: "MATAFUEGO", desc: "Matafuego" },
    { codigo: "ABSORBENTE", desc: "Absorbente" },
    { codigo: "CONOS", desc: "Conos" },
    { codigo: "BOLSAS", desc: "Bolsas" },
    { codigo: "CINTAS", desc: "Cintas" },
    { codigo: "PALA_ANTICHISPA", desc: "Pala antichispa" },
    { codigo: "PLACAS", desc: "Placas" },
    { codigo: "SIN_FUGAS", desc: "Ausencia de fugas" },
    { codigo: "HOJA_SEGURIDAD", desc: "Hoja de seguridad" },
  ],
};
