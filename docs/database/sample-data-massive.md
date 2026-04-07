# Datos masivos de prueba

El archivo [sample_data_massive.sql](C:\Users\dev016\Desktop\PFC\server\database\seeds\sample_data_massive.sql) amplia el conjunto base de datos de ejemplo para hacer pruebas grandes de listados, favoritos, comentarios y listas de la compra.

## Orden recomendado

1. Ejecuta [initial_schema.sql](C:\Users\dev016\Desktop\PFC\server\database\schema\initial_schema.sql)
2. Ejecuta [sample_data.sql](C:\Users\dev016\Desktop\PFC\server\database\seeds\sample_data.sql)
3. Ejecuta [sample_data_massive.sql](C:\Users\dev016\Desktop\PFC\server\database\seeds\sample_data_massive.sql)

## Que añade

- 20 usuarios extra de prueba
- 20 perfiles extra
- 80 recetas internas adicionales
- 320 ingredientes de receta
- 240 pasos
- 120 comentarios
- 80 valoraciones
- 40 listas de la compra
- 120 elementos de listas
- favoritos internos y externos adicionales

## Credenciales

Todos los usuarios generados en este archivo usan:

- email: `<alias>@kitchenknot.demo`
- password: `demo1234`

Ejemplos:

- `alba@kitchenknot.demo`
- `jorge@kitchenknot.demo`
- `marta@kitchenknot.demo`
- `paula@kitchenknot.demo`

## Nota

El script esta planteado para poder ejecutarse varias veces sin duplicar usuarios, recetas o favoritos ya existentes.
