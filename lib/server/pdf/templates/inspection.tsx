import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const BRAND_RED = "#DC2626";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: `2px solid ${BRAND_RED}`,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_RED,
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    width: 100,
    color: "#6b7280",
    fontWeight: "bold",
  },
  infoValue: {
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    backgroundColor: "#f3f4f6",
    padding: 6,
    marginTop: 14,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  itemDesc: {
    flex: 1,
    color: "#374151",
  },
  itemCumple: {
    width: 80,
    textAlign: "center",
    fontWeight: "bold",
    color: "#16a34a",
  },
  itemNoCumple: {
    width: 80,
    textAlign: "center",
    fontWeight: "bold",
    color: "#dc2626",
  },
  itemPendiente: {
    width: 80,
    textAlign: "center",
    color: "#9ca3af",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  obsSection: {
    marginTop: 14,
    padding: 8,
    backgroundColor: "#fef3c7",
    borderRadius: 4,
  },
  obsLabel: {
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 4,
  },
  obsText: {
    color: "#78350f",
  },
});

const SECTION_LABELS: Record<string, string> = {
  DOCUMENTACION: "Documentacion",
  ESTADO_VEHICULO: "Estado del Vehiculo",
  SEG_PERSONAL: "Seguridad del Personal",
  SEG_VEHICULO: "Seguridad del Vehiculo",
  KIT_DERRAMES: "Kit Derrames y Otros",
};

type InspectionItem = {
  seccion: string;
  item_codigo: string;
  item_descripcion: string;
  estado: string;
  observaciones: string | null;
};

export type InspectionPdfData = {
  driverName: string;
  patente: string;
  fecha: string;
  completadoAt: string;
  observacionesGenerales: string | null;
  items: InspectionItem[];
};

export function InspectionPdf({ data }: { data: InspectionPdfData }) {
  const totalItems = data.items.length;
  const cumple = data.items.filter((i) => i.estado === "CUMPLE").length;
  const noCumple = data.items.filter((i) => i.estado === "NO_CUMPLE").length;
  const pendiente = totalItems - cumple - noCumple;

  // Group items by section
  const sections = Object.keys(SECTION_LABELS);
  const grouped = sections
    .map((sec) => ({
      key: sec,
      label: SECTION_LABELS[sec],
      items: data.items.filter((i) => i.seccion === sec),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Transportes ReySil</Text>
            <Text style={styles.subtitle}>Inspeccion del camion</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.infoValue}>{data.fecha}</Text>
            <Text style={styles.subtitle}>{data.completadoAt}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Chofer:</Text>
          <Text style={styles.infoValue}>{data.driverName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Patente:</Text>
          <Text style={styles.infoValue}>{data.patente}</Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: "#111827" }]}>
              {totalItems}
            </Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: "#16a34a" }]}>
              {cumple}
            </Text>
            <Text style={styles.summaryLabel}>Cumple</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: "#dc2626" }]}>
              {noCumple}
            </Text>
            <Text style={styles.summaryLabel}>No Cumple</Text>
          </View>
          {pendiente > 0 && (
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: "#9ca3af" }]}>
                {pendiente}
              </Text>
              <Text style={styles.summaryLabel}>Pendiente</Text>
            </View>
          )}
        </View>

        {/* Sections */}
        {grouped.map((sec) => (
          <View key={sec.key}>
            <Text style={styles.sectionTitle}>{sec.label}</Text>
            {sec.items.map((item) => (
              <View key={item.item_codigo} style={styles.itemRow}>
                <Text style={styles.itemDesc}>{item.item_descripcion}</Text>
                <Text
                  style={
                    item.estado === "CUMPLE"
                      ? styles.itemCumple
                      : item.estado === "NO_CUMPLE"
                        ? styles.itemNoCumple
                        : styles.itemPendiente
                  }
                >
                  {item.estado === "CUMPLE"
                    ? "CUMPLE"
                    : item.estado === "NO_CUMPLE"
                      ? "NO CUMPLE"
                      : "PENDIENTE"}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* General observations */}
        {data.observacionesGenerales && (
          <View style={styles.obsSection}>
            <Text style={styles.obsLabel}>Observaciones generales:</Text>
            <Text style={styles.obsText}>{data.observacionesGenerales}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Documento generado automaticamente por el sistema ReySil —{" "}
          {data.completadoAt}
        </Text>
      </Page>
    </Document>
  );
}
