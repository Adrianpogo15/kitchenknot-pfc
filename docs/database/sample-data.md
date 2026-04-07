# Datos de prueba

Archivo SQL listo para ejecutar en Supabase:

- `C:\Users\dev016\Desktop\PFC\server\database\seeds\sample_data.sql`

## Usuarios de acceso

Todos usan la misma contraseña:

- `demo1234`

Cuentas incluidas:

- `laura@kitchenknot.demo` / `lauracocina`
- `marcos@kitchenknot.demo` / `marcosfit`
- `sara@kitchenknot.demo` / `saradulce`
- `diego@kitchenknot.demo` / `diegochef`
- `nuria@kitchenknot.demo` / `nuriaveggie`

## Contenido incluido

- 5 usuarios
- 5 perfiles
- 10 recetas internas
- ingredientes y pasos para todas las recetas
- comentarios
- valoraciones
- listas de la compra
- items de listas
- favoritos de ejemplo

Nota:

- Si ya cargaste una version anterior del seed, vuelve a ejecutar `sample_data.sql` para crear tambien la tabla `user_recipe_favorites` y sus datos de ejemplo.

## Como cargarlo

1. Abre Supabase.
2. Entra en `SQL Editor`.
3. Pega el contenido de `sample_data.sql`.
4. Ejecuta la consulta.
