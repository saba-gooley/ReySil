import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Req. 2.16 — Tests de las policies RLS de edicion de solicitudes.
 *
 * Estos tests NO usan las Server Actions: le pegan a PostgREST con la clave
 * anonima y una sesion de usuario real, para verificar que la BASE rechaza lo
 * que tiene que rechazar. Si maniana alguien mete un bug en la Server Action,
 * estas policies son la red que queda.
 *
 * Requieren el Supabase local levantado:
 *   npx supabase start && npx supabase db reset
 *   npm run test:rls
 *
 * Las claves de abajo son las que el CLI de Supabase genera por defecto para
 * cualquier entorno local — no son secretos.
 */
const SUPABASE_URL = process.env.SUPABASE_LOCAL_URL ?? "http://127.0.0.1:54321";
const ANON_KEY =
  process.env.SUPABASE_LOCAL_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE_KEY =
  process.env.SUPABASE_LOCAL_SERVICE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

// UUIDs del seed (supabase/seed.sql)
const TRIP = {
  PENDIENTE: "f0000000-0000-4000-8000-000000000001",
  PREASIGNADO: "f0000000-0000-4000-8000-000000000002",
  ASIGNADO: "f0000000-0000-4000-8000-000000000003",
  EN_CURSO: "f0000000-0000-4000-8000-000000000004",
  FINALIZADO: "f0000000-0000-4000-8000-000000000005",
  DE_OTRO_CLIENTE: "f0000000-0000-4000-8000-000000000006",
};

async function signIn(email: string): Promise<SupabaseClient> {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({
    email,
    password: "password123",
  });
  if (error) throw new Error(`No se pudo loguear ${email}: ${error.message}`);
  return client;
}

let clienteA: SupabaseClient;
let clienteB: SupabaseClient;
let operador: SupabaseClient;
let admin: SupabaseClient;

beforeAll(async () => {
  admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Falla temprano y claro si el stack local no esta levantado
  const { error } = await admin.from("trips").select("id").limit(1);
  if (error) {
    throw new Error(
      `No hay Supabase local respondiendo en ${SUPABASE_URL}. Corre: npx supabase start && npx supabase db reset\n${error.message}`,
    );
  }

  [clienteA, clienteB, operador] = await Promise.all([
    signIn("cliente-a@local.test"),
    signIn("cliente-b@local.test"),
    signIn("operador@local.test"),
  ]);
});

/**
 * Restaura el baseline de las filas que tocan estos tests.
 *
 * Corre ANTES y DESPUES de cada test a proposito: la base local es compartida
 * (el dev server, una corrida E2E previa) y el suite tiene que pasar aunque la
 * encuentre sucia. Si solo limpiara al final, bastaria con que algo externo
 * dejara datos para que la primera corrida fallara.
 */
async function resetFixtures() {
  await admin.from("trip_destinations").delete().eq("trip_id", TRIP.PENDIENTE);
  await admin
    .from("trips")
    .update({ observaciones_cliente: null, destino_descripcion: "Rosario centro", estado: "PENDIENTE" })
    .eq("id", TRIP.PENDIENTE);
  await admin
    .from("trips")
    .update({ observaciones_cliente: null, destino_descripcion: "Neuquen" })
    .eq("id", TRIP.DE_OTRO_CLIENTE);
}

beforeEach(resetFixtures);
afterEach(resetFixtures);

describe("RLS — el cliente edita sus propias solicitudes", () => {
  it("puede editar una solicitud PENDIENTE", async () => {
    const { error } = await clienteA
      .from("trips")
      .update({ observaciones_cliente: "Cambio del cliente" })
      .eq("id", TRIP.PENDIENTE);

    expect(error).toBeNull();

    const { data } = await admin
      .from("trips")
      .select("observaciones_cliente")
      .eq("id", TRIP.PENDIENTE)
      .single();
    expect(data!.observaciones_cliente).toBe("Cambio del cliente");
  });

  it("puede editar una solicitud PREASIGNADO", async () => {
    const { error } = await clienteA
      .from("trips")
      .update({ observaciones_cliente: "ok preasignado" })
      .eq("id", TRIP.PREASIGNADO);
    expect(error).toBeNull();
  });

  it("puede editar una solicitud ASIGNADO", async () => {
    const { error } = await clienteA
      .from("trips")
      .update({ observaciones_cliente: "ok asignado" })
      .eq("id", TRIP.ASIGNADO);
    expect(error).toBeNull();
  });
});

describe("RLS — el gate de estado (el corazon del req 2.16)", () => {
  it("NO deja editar un viaje EN_CURSO", async () => {
    const { data: antes } = await admin
      .from("trips")
      .select("observaciones_cliente")
      .eq("id", TRIP.EN_CURSO)
      .single();

    await clienteA
      .from("trips")
      .update({ observaciones_cliente: "NO DEBERIA ENTRAR" })
      .eq("id", TRIP.EN_CURSO);

    // RLS filtra la fila: no hay error, pero tampoco escritura.
    const { data: despues } = await admin
      .from("trips")
      .select("observaciones_cliente")
      .eq("id", TRIP.EN_CURSO)
      .single();

    expect(despues!.observaciones_cliente).toBe(antes!.observaciones_cliente);
    expect(despues!.observaciones_cliente).not.toBe("NO DEBERIA ENTRAR");
  });

  it("NO deja editar un viaje FINALIZADO", async () => {
    await clienteA
      .from("trips")
      .update({ observaciones_cliente: "NO DEBERIA ENTRAR" })
      .eq("id", TRIP.FINALIZADO);

    const { data } = await admin
      .from("trips")
      .select("observaciones_cliente")
      .eq("id", TRIP.FINALIZADO)
      .single();

    expect(data!.observaciones_cliente).not.toBe("NO DEBERIA ENTRAR");
  });

  it("NO deja borrar destinos de un viaje EN_CURSO", async () => {
    await clienteA.from("trip_destinations").delete().eq("trip_id", TRIP.EN_CURSO);

    const { data } = await admin
      .from("trip_destinations")
      .select("id, hora_llegada")
      .eq("trip_id", TRIP.EN_CURSO);

    expect(data).toHaveLength(1);
    expect(data![0].hora_llegada).not.toBeNull();
  });
});

describe("RLS — aislamiento entre clientes", () => {
  it("un cliente NO puede editar el viaje de otro cliente", async () => {
    const { data: antes } = await admin
      .from("trips")
      .select("destino_descripcion")
      .eq("id", TRIP.DE_OTRO_CLIENTE)
      .single();

    await clienteA
      .from("trips")
      .update({ destino_descripcion: "SECUESTRADO" })
      .eq("id", TRIP.DE_OTRO_CLIENTE);

    const { data: despues } = await admin
      .from("trips")
      .select("destino_descripcion")
      .eq("id", TRIP.DE_OTRO_CLIENTE)
      .single();

    expect(despues!.destino_descripcion).toBe(antes!.destino_descripcion);
    expect(despues!.destino_descripcion).not.toBe("SECUESTRADO");
  });

  it("un cliente NO puede agregarle destinos al viaje de otro cliente", async () => {
    const { error } = await clienteB
      .from("trip_destinations")
      .insert({ trip_id: TRIP.PENDIENTE, destino: "Intruso", orden: 99 });

    // El INSERT si devuelve error: WITH CHECK rechaza explicitamente.
    expect(error).not.toBeNull();

    const { data } = await admin
      .from("trip_destinations")
      .select("id")
      .eq("trip_id", TRIP.PENDIENTE);
    expect(data).toHaveLength(0);
  });
});

describe("RLS — el cliente no puede cambiar el estado ni el dueno", () => {
  it("el trigger bloquea que el cliente mueva el estado del viaje", async () => {
    const { error } = await clienteA
      .from("trips")
      .update({ estado: "ASIGNADO" })
      .eq("id", TRIP.PENDIENTE);

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/No autorizado a cambiar el estado/i);

    const { data } = await admin
      .from("trips")
      .select("estado")
      .eq("id", TRIP.PENDIENTE)
      .single();
    expect(data!.estado).toBe("PENDIENTE");
  });

  it("el trigger bloquea que el cliente se robe el viaje de otro", async () => {
    const { error } = await clienteA
      .from("trips")
      .update({ client_id: "aaaaaaaa-0000-4000-8000-000000000002" })
      .eq("id", TRIP.PENDIENTE);

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/No autorizado a cambiar el cliente/i);
  });
});

describe("RLS — el operador mantiene acceso completo", () => {
  it("el operador edita cualquier solicitud editable", async () => {
    const { error } = await operador
      .from("trips")
      .update({ observaciones_cliente: "Nota del operador" })
      .eq("id", TRIP.PENDIENTE);
    expect(error).toBeNull();
  });

  it("el operador sigue pudiendo cambiar el estado (asignar, finalizar)", async () => {
    const { error } = await operador
      .from("trips")
      .update({ estado: "PREASIGNADO" })
      .eq("id", TRIP.PENDIENTE);
    expect(error).toBeNull();

    await admin.from("trips").update({ estado: "PENDIENTE" }).eq("id", TRIP.PENDIENTE);
  });

  it("el operador puede editar viajes de cualquier cliente", async () => {
    const { error } = await operador
      .from("trips")
      .update({ observaciones_cliente: "Nota cross-cliente" })
      .eq("id", TRIP.DE_OTRO_CLIENTE);
    expect(error).toBeNull();

    await admin
      .from("trips")
      .update({ observaciones_cliente: null })
      .eq("id", TRIP.DE_OTRO_CLIENTE);
  });
});

describe("RLS — ABM de destinos por el cliente", () => {
  it("el cliente convierte su viaje de destino unico en multi-destino", async () => {
    const { error } = await clienteA.from("trip_destinations").insert([
      { trip_id: TRIP.PENDIENTE, destino: "Parada 1", orden: 0 },
      { trip_id: TRIP.PENDIENTE, destino: "Parada 2", orden: 1 },
    ]);

    expect(error).toBeNull();

    const { data } = await admin
      .from("trip_destinations")
      .select("destino, orden")
      .eq("trip_id", TRIP.PENDIENTE)
      .order("orden");

    expect(data).toHaveLength(2);
    expect(data!.map((d) => d.destino)).toEqual(["Parada 1", "Parada 2"]);
  });

  it("el cliente puede borrar los destinos de su viaje editable", async () => {
    await admin
      .from("trip_destinations")
      .insert({ trip_id: TRIP.PENDIENTE, destino: "Para borrar", orden: 0 });

    const { error } = await clienteA
      .from("trip_destinations")
      .delete()
      .eq("trip_id", TRIP.PENDIENTE);
    expect(error).toBeNull();

    const { data } = await admin
      .from("trip_destinations")
      .select("id")
      .eq("trip_id", TRIP.PENDIENTE);
    expect(data).toHaveLength(0);
  });
});
