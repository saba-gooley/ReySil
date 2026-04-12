"use client";

import { useState } from "react";
import { debugPingAction } from "@/lib/server/chofer/debug-action";

export function DebugButton({ driverId, userId }: { driverId: string; userId: string }) {
  const [result, setResult] = useState<string>("No probado");
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);
    setResult("Llamando...");
    try {
      const res = await debugPingAction();
      setResult(JSON.stringify(res));
    } catch (err) {
      setResult(`CATCH: ${err instanceof Error ? err.message : String(err)}`);
    }
    setLoading(false);
  }

  return (
    <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-xs space-y-2">
      <p><strong>DEBUG</strong> userId: {userId} | driverId: {driverId}</p>
      <button
        type="button"
        onClick={handleTest}
        disabled={loading}
        className="rounded bg-yellow-500 px-3 py-1 text-white font-medium"
      >
        Test Action
      </button>
      <p>Resultado: {result}</p>
    </div>
  );
}
