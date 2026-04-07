# Configuracion de Supabase

## 1. Ejecutar el esquema SQL

Abre el `SQL Editor` de Supabase y pega el contenido de:

- `server/database/schema/initial_schema.sql`

Ese script ya esta adaptado para PostgreSQL en Supabase:

- activa `pgcrypto`
- genera UUID automaticamente con `gen_random_uuid()`
- usa `TIMESTAMPTZ` para fechas con zona horaria

## 2. Variables de entorno del backend

Rellena el archivo:

- `server/.env.example`

copiandolo a un futuro archivo `.env` con tus credenciales reales.

## 3. Credenciales que necesitaremos

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 4. Recomendacion

La `SERVICE_ROLE_KEY` debe usarse solo en backend. Nunca debe enviarse a la app movil.
