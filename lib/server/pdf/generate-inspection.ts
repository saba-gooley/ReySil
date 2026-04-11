import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { InspectionPdf, type InspectionPdfData } from "./templates/inspection";
import { uploadToDrive } from "@/lib/server/drive/upload";

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_INSPECCIONES;

type GenerateResult = {
  pdfUrl: string;
  driveFileId: string;
};

/**
 * HU-CHO-006: Generate inspection PDF and upload to Google Drive.
 * Returns the Drive view URL and file ID.
 */
export async function generateAndUploadInspectionPdf(
  data: InspectionPdfData,
): Promise<GenerateResult> {
  if (!FOLDER_ID) {
    throw new Error("GOOGLE_DRIVE_FOLDER_INSPECCIONES not set");
  }

  // Render PDF to buffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    React.createElement(InspectionPdf, { data }) as any,
  );

  // Upload to Drive with naming convention: [Patente]-[YYYY-MM-DD].pdf
  const fileName = `${data.patente}-${data.fecha}.pdf`;

  const { fileId, webViewLink } = await uploadToDrive({
    fileName,
    mimeType: "application/pdf",
    body: Buffer.from(buffer),
    folderId: FOLDER_ID,
  });

  return {
    pdfUrl: webViewLink,
    driveFileId: fileId,
  };
}
