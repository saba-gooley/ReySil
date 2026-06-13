"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadRemitoFromOperatorAction } from "@/lib/server/remitos/operator-remito-actions";
import { sendRemitoEmailAction } from "@/lib/server/chofer/remito-actions";

type RemitoRow = { id: string; drive_url: string };

const initialState = {};

function UploadBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "Subiendo..." : "Subir remito"}
    </button>
  );
}

export function TripRemitoActions({
  tripId,
  estado,
  remitos,
  remitoEmailEnviadoAt,
}: {
  tripId: string;
  estado: string;
  remitos: RemitoRow[];
  remitoEmailEnviadoAt?: string | null;
}) {
  const router = useRouter();
  const [uploadState, uploadAction] = useFormState(uploadRemitoFromOperatorAction, initialState);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const canUpload = ["EN_CURSO", "FINALIZADO"].includes(estado);

  function handleUpload(formData: FormData) {
    formData.set("trip_id", tripId);
    uploadAction(formData);
  }

  async function handleEnviarMail() {
    setEmailLoading(true);
    setEmailError(null);
    const result = await sendRemitoEmailAction(tripId);
    setEmailLoading(false);
    if (result.error) {
      setEmailError(result.error);
    } else {
      setEmailSent(true);
      router.refresh();
    }
  }

  if (!canUpload && remitos.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase text-neutral-400">
        Remitos {remitos.length > 0 ? `(${remitos.length})` : ""}
      </h4>

      {/* Lista de remitos */}
      {remitos.map((r, i) => (
        <a
          key={r.id}
          href={r.drive_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs font-medium text-green-600 hover:underline"
        >
          Ver Remito {i + 1}
        </a>
      ))}

      {/* Upload desde back office (req. 2.8) */}
      {canUpload && (
        <form action={handleUpload} className="flex flex-wrap items-center gap-2 pt-1">
          {("error" in uploadState) && typeof uploadState.error === "string" && (
            <p className="w-full text-xs text-red-600">{uploadState.error}</p>
          )}
          {("success" in uploadState) && uploadState.success === true && (
            <p className="w-full text-xs text-green-600">Remito cargado</p>
          )}
          <input
            type="file"
            name="remito_file"
            accept="image/*,application/pdf"
            className="text-xs text-neutral-600 file:mr-2 file:rounded file:border-0 file:bg-neutral-100 file:px-2 file:py-1 file:text-xs file:font-medium"
          />
          <UploadBtn />
        </form>
      )}

      {/* Enviar Mail */}
      {remitos.length > 0 && (
        <div className="pt-1">
          {remitoEmailEnviadoAt && !emailSent && (
            <p className="text-xs text-neutral-500 mb-1">
              Mail enviado el{" "}
              {new Date(remitoEmailEnviadoAt).toLocaleString("es-AR", {
                timeZone: "America/Argentina/Buenos_Aires",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          {emailError && <p className="text-xs text-red-600 mb-1">{emailError}</p>}
          {emailSent ? (
            <p className="text-xs font-medium text-green-700">Mail enviado correctamente</p>
          ) : (
            <button
              type="button"
              onClick={handleEnviarMail}
              disabled={emailLoading}
              className="rounded-md border border-reysil-red px-3 py-1.5 text-xs font-medium text-reysil-red hover:bg-reysil-red hover:text-white disabled:opacity-50 transition-colors"
            >
              {emailLoading ? "Enviando..." : "Enviar Mail"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
