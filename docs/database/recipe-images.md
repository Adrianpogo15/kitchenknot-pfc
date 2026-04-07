# Imagenes de recetas de prueba

He dejado generadas imagenes de apoyo para las recetas de prueba en:

- [server/public/recipe-images](C:\Users\dev016\Desktop\PFC\server\public\recipe-images)

El backend las sirve automaticamente desde:

- `http://TU_IP_LOCAL:3000/static/recipe-images/...`

## Importante

En este proyecto de desarrollo se han enlazado usando la IP local actual:

- `http://192.168.1.131:3000`

Si tu IP local cambia, tendras que actualizar:

- [sample_data.sql](C:\Users\dev016\Desktop\PFC\server\database\seeds\sample_data.sql)
- [sample_data_massive.sql](C:\Users\dev016\Desktop\PFC\server\database\seeds\sample_data_massive.sql)
- [apply_recipe_images.sql](C:\Users\dev016\Desktop\PFC\server\database\seeds\apply_recipe_images.sql)

## Como aplicarlas si ya tenias los datos cargados

1. Arranca el backend
2. Abre Supabase SQL Editor
3. Ejecuta [apply_recipe_images.sql](C:\Users\dev016\Desktop\PFC\server\database\seeds\apply_recipe_images.sql)

## Como comprobarlas

Con el backend encendido, abre por ejemplo:

- `http://192.168.1.131:3000/static/recipe-images/crema-calabaza-asada.png`
- `http://192.168.1.131:3000/static/recipe-images/categoria-arroces.png`

Si esas URLs cargan en tu navegador o movil, la app tambien podra mostrarlas.
