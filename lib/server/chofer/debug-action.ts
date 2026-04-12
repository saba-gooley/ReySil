"use server";

export async function debugPingAction(): Promise<{ ok: boolean; ts: string }> {
  return { ok: true, ts: new Date().toISOString() };
}
