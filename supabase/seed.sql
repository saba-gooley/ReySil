-- =========================================================================
-- Seed de desarrollo local — datos FALSOS
--
-- Se aplica solo con `supabase start` / `supabase db reset` contra la base
-- local. NUNCA se corre en produccion.
--
-- Sirve para dos cosas:
--   1. Poder usar la app con `npm run dev` apuntando al Supabase local
--   2. Dar datos estables a los tests de RLS (npm run test:rls)
--
-- Los UUID son fijos para que los tests puedan referenciarlos.
--
-- Usuarios (contrasena de todos: `password123`):
--   operador@local.test  → OPERADOR
--   cliente-a@local.test → CLIENTE de Norte SA
--   cliente-b@local.test → CLIENTE de Sur SRL (para probar aislamiento)
-- =========================================================================

-- ---------- Grants (paridad con Supabase hosted) ----------
-- En la nube, anon/authenticated/service_role reciben estos permisos por
-- defecto y RLS es la unica barrera real. El CLI local no los aplica, asi que
-- sin esto las policies nunca llegan a evaluarse y los tests medirian otra
-- cosa. Va en el seed (solo local) a proposito: NO debe entrar a una
-- migracion, porque en produccion ya estan puestos.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ---------- Clientes ----------
INSERT INTO public.clients (id, codigo, nombre, cuit, activo) VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 'CLI-NORTE', 'Norte SA', '30-11111111-1', true),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'CLI-SUR',   'Sur SRL',  '30-22222222-2', true);

INSERT INTO public.client_deposits (id, client_id, nombre, direccion, tipo, activo) VALUES
  ('dddddddd-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 'Deposito Central', 'Av. Siempreviva 742', 'DEPOSITO', true),
  ('dddddddd-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001', 'Puerto Norte', 'Muelle 3', 'PUERTO', true);

INSERT INTO public.client_emails (client_id, email) VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001', 'cliente-a@local.test'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'cliente-b@local.test');

-- ---------- Choferes, operadores y camiones ----------
INSERT INTO public.drivers (id, codigo, dni, nombre, apellido, activo) VALUES
  ('bbbbbbbb-0000-4000-8000-000000000001', 'CHO-001', '22029000', 'Juan', 'Perez', true);

INSERT INTO public.operators (id, nombre, apellido, email, activo) VALUES
  ('cccccccc-0000-4000-8000-000000000001', 'Ana', 'Gomez', 'operador@local.test', true);

INSERT INTO public.trucks (id, marca, modelo, patente, is_active) VALUES
  ('77777777-0000-4000-8000-000000000001', 'Scania', 'R450', 'AA123BB', true);

INSERT INTO public.truck_types (nombre, is_active) VALUES
  ('Chasis', true), ('Semi', true), ('Balancin', true)
ON CONFLICT DO NOTHING;

-- ---------- Usuarios de auth ----------
-- Se insertan a mano para no depender de la API de admin. El hash es el de
-- `password123` generado con crypt() del propio Postgres.
-- Los campos de token van en '' y no en NULL: GoTrue los escanea como string
-- y un NULL le revienta el login con "Database error querying schema".
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token,
  email_change_token_new, email_change_token_current, email_change,
  phone_change, phone_change_token, reauthentication_token
) VALUES
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'operador@local.test', crypt('password123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'cliente-a@local.test', crypt('password123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'cliente-b@local.test', crypt('password123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-0000-4000-8000-000000000004', 'authenticated', 'authenticated',
   'chofer@local.test', crypt('password123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', '', '', '', '');

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), id, id::text,
       format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
       'email', now(), now(), now()
FROM auth.users
WHERE email LIKE '%@local.test';

INSERT INTO public.user_profiles (id, role, client_id, driver_id, operator_id, full_name) VALUES
  ('eeeeeeee-0000-4000-8000-000000000001', 'OPERADOR', NULL, NULL, 'cccccccc-0000-4000-8000-000000000001', 'Ana Gomez'),
  ('eeeeeeee-0000-4000-8000-000000000002', 'CLIENTE', 'aaaaaaaa-0000-4000-8000-000000000001', NULL, NULL, 'Cliente Norte'),
  ('eeeeeeee-0000-4000-8000-000000000003', 'CLIENTE', 'aaaaaaaa-0000-4000-8000-000000000002', NULL, NULL, 'Cliente Sur'),
  ('eeeeeeee-0000-4000-8000-000000000004', 'CHOFER', NULL, 'bbbbbbbb-0000-4000-8000-000000000001', NULL, 'Juan Perez');

-- ---------- Viajes de Reparto, uno por estado ----------
-- El set completo permite probar el gate del req 2.16 de una sola pasada.
INSERT INTO public.trips (id, client_id, tipo, estado, origen_deposit_id, origen_descripcion, destino_descripcion, fecha_solicitada, observaciones_cliente) VALUES
  ('f0000000-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 'REPARTO', 'PENDIENTE',   'dddddddd-0000-4000-8000-000000000001', 'Av. Siempreviva 742', 'Rosario centro',      CURRENT_DATE + 1, 'Entregar por la manana'),
  ('f0000000-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001', 'REPARTO', 'PREASIGNADO', 'dddddddd-0000-4000-8000-000000000001', 'Av. Siempreviva 742', 'Cordoba capital',     CURRENT_DATE + 2, NULL),
  ('f0000000-0000-4000-8000-000000000003', 'aaaaaaaa-0000-4000-8000-000000000001', 'REPARTO', 'ASIGNADO',    'dddddddd-0000-4000-8000-000000000002', 'Muelle 3',           'La Plata',            CURRENT_DATE,     NULL),
  ('f0000000-0000-4000-8000-000000000004', 'aaaaaaaa-0000-4000-8000-000000000001', 'REPARTO', 'EN_CURSO',    'dddddddd-0000-4000-8000-000000000001', 'Av. Siempreviva 742', 'Mar del Plata',       CURRENT_DATE,     NULL),
  ('f0000000-0000-4000-8000-000000000005', 'aaaaaaaa-0000-4000-8000-000000000001', 'REPARTO', 'FINALIZADO',  'dddddddd-0000-4000-8000-000000000001', 'Av. Siempreviva 742', 'Bahia Blanca',        CURRENT_DATE - 3, NULL),
  -- De otro cliente: sirve para probar el aislamiento entre clientes
  ('f0000000-0000-4000-8000-000000000006', 'aaaaaaaa-0000-4000-8000-000000000002', 'REPARTO', 'PENDIENTE',   NULL,                                  'Deposito Sur',        'Neuquen',             CURRENT_DATE + 1, NULL);

INSERT INTO public.trip_reparto_fields (trip_id, ndv, pal, cat, cantidad_bultos, peso_kg, toneladas, metadata) VALUES
  ('f0000000-0000-4000-8000-000000000001', 'NDV-001', 5, 'A', 20, 1500.00, 1.5, '{"tipo_camion":"Chasis","horario":"8:00 - 16:00","peon":"NO"}'),
  ('f0000000-0000-4000-8000-000000000002', 'NDV-002', 3, 'B', 10,  800.00, 0.8, '{"tipo_camion":"Semi"}'),
  ('f0000000-0000-4000-8000-000000000003', 'NDV-003', 8, 'A', 40, 3200.00, 3.2, '{}'),
  ('f0000000-0000-4000-8000-000000000004', 'NDV-004', 2, 'C',  6,  400.00, 0.4, '{}'),
  ('f0000000-0000-4000-8000-000000000005', 'NDV-005', 1, 'A',  4,  200.00, 0.2, '{}'),
  ('f0000000-0000-4000-8000-000000000006', 'NDV-006', 7, 'B', 30, 2100.00, 2.1, '{}');

-- Viaje 2: multi-destino sin horas (editable)
INSERT INTO public.trip_destinations (trip_id, destino, observaciones, orden) VALUES
  ('f0000000-0000-4000-8000-000000000002', 'Cordoba capital', 'Primer parada', 0),
  ('f0000000-0000-4000-8000-000000000002', 'Villa Maria',     NULL,            1);

-- Viaje 4 (EN_CURSO): multi-destino CON horas registradas por el chofer.
-- Es el estado que la edicion nunca debe poder tocar.
INSERT INTO public.trip_destinations (trip_id, destino, observaciones, orden, hora_llegada, hora_salida) VALUES
  ('f0000000-0000-4000-8000-000000000004', 'Mar del Plata', NULL, 0, now() - interval '2 hours', now() - interval '1 hour');

INSERT INTO public.trip_assignments (trip_id, driver_id, patente) VALUES
  ('f0000000-0000-4000-8000-000000000002', 'bbbbbbbb-0000-4000-8000-000000000001', 'AA123BB'),
  ('f0000000-0000-4000-8000-000000000003', 'bbbbbbbb-0000-4000-8000-000000000001', 'AA123BB'),
  ('f0000000-0000-4000-8000-000000000004', 'bbbbbbbb-0000-4000-8000-000000000001', 'AA123BB');

-- ---------- Notificaciones ----------
INSERT INTO public.reysil_notification_emails (email, enviar_solicitudes, enviar_asignaciones, enviar_ediciones) VALUES
  ('operaciones@local.test', true, true, true);
