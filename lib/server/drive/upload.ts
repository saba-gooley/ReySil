import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function getAuth() {
  const keyJson = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error("GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY not set");
  }

  const key = JSON.parse(
    Buffer.from(keyJson, "base64").toString("utf-8"),
  );

  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: SCOPES,
  });
}

type UploadParams = {
  fileName: string;
  mimeType: string;
  body: Buffer;
  folderId: string;
};

type UploadResult = {
  fileId: string;
  webViewLink: string;
};

/**
 * Upload a file to Google Drive and return the file ID + view link.
 * The file is made readable by anyone with the link.
 */
export async function uploadToDrive({
  fileName,
  mimeType,
  body,
  folderId,
}: UploadParams): Promise<UploadResult> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  // Upload (supportsAllDrives for Shared Drives)
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(body),
    },
    fields: "id,webViewLink",
    supportsAllDrives: true,
  });

  const fileId = res.data.id!;
  const webViewLink = res.data.webViewLink!;

  // Make readable by anyone with the link
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    supportsAllDrives: true,
  });

  return { fileId, webViewLink };
}
