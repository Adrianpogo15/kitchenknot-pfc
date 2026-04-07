# Diseno inicial de base de datos

La base de datos propia gestiona usuarios, recetas creadas por usuarios, comentarios, valoraciones y listas de la compra.

Las recetas obtenidas desde TheMealDB no se almacenan como recetas internas del sistema para permitir comentarios o valoraciones. Solo se consultan externamente y se muestran en la app.

## Entidades principales

- `users`: usuarios registrados.
- `user_profiles`: datos basicos ampliados del perfil.
- `recipes`: recetas creadas por usuarios.
- `recipe_ingredients`: ingredientes de cada receta propia.
- `recipe_steps`: pasos de elaboracion de cada receta propia.
- `comments`: comentarios en recetas de usuarios.
- `ratings`: valoraciones de recetas de usuarios.
- `shopping_lists`: listas de la compra creadas por usuarios.
- `shopping_list_items`: elementos de cada lista.

## Reglas funcionales reflejadas en el modelo

- Un usuario puede registrarse, iniciar sesion, editar su perfil y darse de baja.
- Un usuario puede crear, editar y eliminar sus propias recetas.
- Solo las recetas internas permiten comentarios y valoraciones.
- Un usuario puede comentar y valorar recetas de otros usuarios.
- Los ingredientes de una receta propia pueden exportarse a una lista de la compra.
- Cada usuario puede crear varias listas de la compra.
- Cada lista permite anadir, editar, eliminar y marcar ingredientes como comprados.
- Usuarios autenticados y visitantes pueden buscar recetas.

## Nota tecnica

Para la baja de usuario se recomienda usar `deleted_at` en lugar de borrado fisico inmediato. Esto facilita auditoria, integridad referencial y defensa del proyecto.
