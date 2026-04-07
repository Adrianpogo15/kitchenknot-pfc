-- Datos masivos de prueba para KitchenKnot
-- Ejecuta primero:
--   1. schema/initial_schema.sql
--   2. seeds/sample_data.sql
--   3. este archivo
--
-- Contrasena para todos los usuarios generados aqui: demo1234

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS favorite_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_recipe_id TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    source VARCHAR(120),
    source_url TEXT,
    cuisine_type TEXT[] NOT NULL DEFAULT '{}',
    meal_type TEXT[] NOT NULL DEFAULT '{}',
    dish_type TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, external_recipe_id)
);

CREATE TABLE IF NOT EXISTS user_recipe_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, recipe_id)
);

WITH base_users AS (
    SELECT *
    FROM (
        VALUES
            (6, 'alba', 'Alba', 'Prieto', 'Recetas familiares, cremas y platos para diario.'),
            (7, 'jorge', 'Jorge', 'Linares', 'Planifico menús semanales y recetas de cuchara.'),
            (8, 'marta', 'Marta', 'Pascual', 'Me encantan los desayunos completos y los postres faciles.'),
            (9, 'raul', 'Raúl', 'Benítez', 'Cocina casera con toques rápidos para entre semana.'),
            (10, 'clara', 'Clara', 'Muñoz', 'Apuesta por recetas ligeras y vistosas.'),
            (11, 'ivan', 'Iván', 'Serrano', 'Tuppers, arroces y platos muy aprovechables.'),
            (12, 'elena', 'Elena', 'Lozano', 'Dulces caseros y meriendas para compartir.'),
            (13, 'pablo', 'Pablo', 'Herrera', 'Comidas sencillas con ingredientes fáciles de encontrar.'),
            (14, 'ines', 'Inés', 'Soler', 'Verduras al horno, ensaladas y platos coloridos.'),
            (15, 'adrian', 'Adrián', 'Crespo', 'Recetas potentes para reuniones y fines de semana.'),
            (16, 'lucia', 'Lucía', 'Merino', 'Cocina mediterránea con mucha planificación.'),
            (17, 'tomas', 'Tomás', 'Arias', 'Platos completos, ricos y con buena presencia.'),
            (18, 'andrea', 'Andrea', 'Gallego', 'Desayunos, meriendas y recetas caseras dulces.'),
            (19, 'sergio', 'Sergio', 'Pardo', 'Recetas rápidas con pocos ingredientes.'),
            (20, 'paula', 'Paula', 'Navas', 'Cocina vegetal, bowls y platos frescos.'),
            (21, 'rocio', 'Rocío', 'Iglesias', 'Mucho horno, muchas verduras y cenas cómodas.'),
            (22, 'hector', 'Héctor', 'Rubio', 'Arroces, pasta y platos para cocinar sin complicaciones.'),
            (23, 'laia', 'Laia', 'Caballero', 'Comidas completas para compartir con amigos.'),
            (24, 'david', 'David', 'Peña', 'Platos tradicionales con una presentación más cuidada.'),
            (25, 'noelia', 'Noelia', 'Méndez', 'Me gustan las recetas equilibradas y bien explicadas.')
    ) AS data(idx, alias, first_name, last_name, bio)
),
generated_users AS (
    SELECT
        (
            substr(md5('kk-massive-user-' || idx), 1, 8) || '-' ||
            substr(md5('kk-massive-user-' || idx), 9, 4) || '-' ||
            substr(md5('kk-massive-user-' || idx), 13, 4) || '-' ||
            substr(md5('kk-massive-user-' || idx), 17, 4) || '-' ||
            substr(md5('kk-massive-user-' || idx), 21, 12)
        )::uuid AS user_id,
        (
            substr(md5('kk-massive-profile-' || idx), 1, 8) || '-' ||
            substr(md5('kk-massive-profile-' || idx), 9, 4) || '-' ||
            substr(md5('kk-massive-profile-' || idx), 13, 4) || '-' ||
            substr(md5('kk-massive-profile-' || idx), 17, 4) || '-' ||
            substr(md5('kk-massive-profile-' || idx), 21, 12)
        )::uuid AS profile_id,
        idx,
        alias,
        first_name,
        last_name,
        bio,
        alias || '@kitchenknot.demo' AS email,
        alias || '_demo' AS username,
        (DATE '1988-01-01' + ((idx * 53) || ' days')::interval)::date AS birth_date
    FROM base_users
)
INSERT INTO users (id, email, username, password_hash, is_active)
SELECT
    user_id,
    email,
    username,
    '$2a$10$5EMYp5TY7fZ/7rK91BDRo.codvh6xO4dA1./NYR6zpWTrSfIvL.Uu',
    TRUE
FROM generated_users
ON CONFLICT (id) DO NOTHING;

WITH base_users AS (
    SELECT *
    FROM (
        VALUES
            (6, 'alba', 'Alba', 'Prieto', 'Recetas familiares, cremas y platos para diario.'),
            (7, 'jorge', 'Jorge', 'Linares', 'Planifico menús semanales y recetas de cuchara.'),
            (8, 'marta', 'Marta', 'Pascual', 'Me encantan los desayunos completos y los postres faciles.'),
            (9, 'raul', 'Raúl', 'Benítez', 'Cocina casera con toques rápidos para entre semana.'),
            (10, 'clara', 'Clara', 'Muñoz', 'Apuesta por recetas ligeras y vistosas.'),
            (11, 'ivan', 'Iván', 'Serrano', 'Tuppers, arroces y platos muy aprovechables.'),
            (12, 'elena', 'Elena', 'Lozano', 'Dulces caseros y meriendas para compartir.'),
            (13, 'pablo', 'Pablo', 'Herrera', 'Comidas sencillas con ingredientes fáciles de encontrar.'),
            (14, 'ines', 'Inés', 'Soler', 'Verduras al horno, ensaladas y platos coloridos.'),
            (15, 'adrian', 'Adrián', 'Crespo', 'Recetas potentes para reuniones y fines de semana.'),
            (16, 'lucia', 'Lucía', 'Merino', 'Cocina mediterránea con mucha planificación.'),
            (17, 'tomas', 'Tomás', 'Arias', 'Platos completos, ricos y con buena presencia.'),
            (18, 'andrea', 'Andrea', 'Gallego', 'Desayunos, meriendas y recetas caseras dulces.'),
            (19, 'sergio', 'Sergio', 'Pardo', 'Recetas rápidas con pocos ingredientes.'),
            (20, 'paula', 'Paula', 'Navas', 'Cocina vegetal, bowls y platos frescos.'),
            (21, 'rocio', 'Rocío', 'Iglesias', 'Mucho horno, muchas verduras y cenas cómodas.'),
            (22, 'hector', 'Héctor', 'Rubio', 'Arroces, pasta y platos para cocinar sin complicaciones.'),
            (23, 'laia', 'Laia', 'Caballero', 'Comidas completas para compartir con amigos.'),
            (24, 'david', 'David', 'Peña', 'Platos tradicionales con una presentación más cuidada.'),
            (25, 'noelia', 'Noelia', 'Méndez', 'Me gustan las recetas equilibradas y bien explicadas.')
    ) AS data(idx, alias, first_name, last_name, bio)
),
generated_profiles AS (
    SELECT
        (
            substr(md5('kk-massive-profile-' || idx), 1, 8) || '-' ||
            substr(md5('kk-massive-profile-' || idx), 9, 4) || '-' ||
            substr(md5('kk-massive-profile-' || idx), 13, 4) || '-' ||
            substr(md5('kk-massive-profile-' || idx), 17, 4) || '-' ||
            substr(md5('kk-massive-profile-' || idx), 21, 12)
        )::uuid AS profile_id,
        (
            substr(md5('kk-massive-user-' || idx), 1, 8) || '-' ||
            substr(md5('kk-massive-user-' || idx), 9, 4) || '-' ||
            substr(md5('kk-massive-user-' || idx), 13, 4) || '-' ||
            substr(md5('kk-massive-user-' || idx), 17, 4) || '-' ||
            substr(md5('kk-massive-user-' || idx), 21, 12)
        )::uuid AS user_id,
        first_name,
        last_name,
        bio,
        (DATE '1988-01-01' + ((idx * 53) || ' days')::interval)::date AS birth_date
    FROM base_users
)
INSERT INTO user_profiles (id, user_id, first_name, last_name, avatar_url, bio, birth_date)
SELECT
    profile_id,
    user_id,
    first_name,
    last_name,
    NULL,
    bio,
    birth_date
FROM generated_profiles
ON CONFLICT (id) DO NOTHING;

WITH recipe_variants AS (
    SELECT *
    FROM (
        VALUES
            (1, 'Arroz', 'Arroz de temporada con verduras y acabado casero.', 'Arroces', 'facil', 32, 3),
            (2, 'Pasta', 'Pasta sabrosa para el día a día, rápida y completa.', 'Pasta', 'facil', 26, 2),
            (3, 'Bandeja al horno', 'Verduras y proteína al horno para comer bien sin complicarse.', 'Plato principal', 'media', 42, 4),
            (4, 'Postre de horno', 'Postre casero muy resultón para rematar cualquier menú.', 'Postres', 'media', 48, 6)
    ) AS data(variant_idx, variant_name, base_description, category, difficulty, prep_minutes, servings)
),
generated_recipes AS (
    SELECT
        u.idx AS user_idx,
        v.variant_idx,
        (
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 1, 8) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 9, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 13, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 17, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 21, 12)
        )::uuid AS recipe_id,
        (
            substr(md5('kk-massive-user-' || u.idx), 1, 8) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 9, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 13, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 17, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 21, 12)
        )::uuid AS user_id,
        initcap(u.alias) || ' ' || v.variant_name || ' ' || ((u.idx + v.variant_idx) % 7 + 1) AS title,
        v.base_description || ' Preparada por ' || initcap(u.alias) || ' para pruebas grandes en la app.' AS description,
        v.category,
        v.difficulty,
        v.prep_minutes + ((u.idx + v.variant_idx) % 12) AS preparation_time_minutes,
        v.servings + ((u.idx + v.variant_idx) % 3) AS servings,
        CASE v.variant_idx
            WHEN 1 THEN 'http://192.168.1.131:3000/static/recipe-images/categoria-arroces.png'
            WHEN 2 THEN 'http://192.168.1.131:3000/static/recipe-images/categoria-pasta.png'
            WHEN 3 THEN 'http://192.168.1.131:3000/static/recipe-images/categoria-horno.png'
            ELSE 'http://192.168.1.131:3000/static/recipe-images/categoria-postres.png'
        END AS image_url,
        CASE WHEN v.variant_idx = 4 AND (u.idx % 4 = 0) THEN FALSE ELSE TRUE END AS is_public
    FROM (
        SELECT idx, alias
        FROM (
            VALUES
                (6, 'alba'), (7, 'jorge'), (8, 'marta'), (9, 'raul'), (10, 'clara'),
                (11, 'ivan'), (12, 'elena'), (13, 'pablo'), (14, 'ines'), (15, 'adrian'),
                (16, 'lucia'), (17, 'tomas'), (18, 'andrea'), (19, 'sergio'), (20, 'paula'),
                (21, 'rocio'), (22, 'hector'), (23, 'laia'), (24, 'david'), (25, 'noelia')
        ) AS users(idx, alias)
    ) u
    CROSS JOIN recipe_variants v
)
INSERT INTO recipes (
    id,
    user_id,
    title,
    description,
    category,
    difficulty,
    preparation_time_minutes,
    servings,
    image_url,
    is_public
)
SELECT
    recipe_id,
    user_id,
    title,
    description,
    category,
    difficulty,
    preparation_time_minutes,
    servings,
    image_url,
    is_public
FROM generated_recipes
ON CONFLICT (id) DO NOTHING;

WITH ingredients_seed AS (
    SELECT *
    FROM (
        VALUES
            (1, 'Cebolla', 1, 'ud'),
            (2, 'Ajo', 2, 'ud'),
            (3, 'Aceite de oliva', 2, 'cda'),
            (4, 'Ingrediente principal', 400, 'g')
    ) AS data(position, ingredient_name, quantity, unit)
),
recipes_source AS (
    SELECT
        u.idx AS user_idx,
        v.variant_idx,
        (
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 1, 8) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 9, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 13, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 17, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 21, 12)
        )::uuid AS recipe_id,
        v.variant_name
    FROM (
        SELECT idx
        FROM (
            VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15),
                   (16), (17), (18), (19), (20), (21), (22), (23), (24), (25)
        ) AS ids(idx)
    ) u
    CROSS JOIN (
        VALUES
            (1, 'Arroz'),
            (2, 'Pasta'),
            (3, 'Bandeja'),
            (4, 'Postre')
    ) AS v(variant_idx, variant_name)
)
INSERT INTO recipe_ingredients (id, recipe_id, ingredient_name, quantity, unit, position)
SELECT
    (
        substr(md5('kk-massive-ingredient-' || r.recipe_id::text || '-' || i.position), 1, 8) || '-' ||
        substr(md5('kk-massive-ingredient-' || r.recipe_id::text || '-' || i.position), 9, 4) || '-' ||
        substr(md5('kk-massive-ingredient-' || r.recipe_id::text || '-' || i.position), 13, 4) || '-' ||
        substr(md5('kk-massive-ingredient-' || r.recipe_id::text || '-' || i.position), 17, 4) || '-' ||
        substr(md5('kk-massive-ingredient-' || r.recipe_id::text || '-' || i.position), 21, 12)
    )::uuid,
    r.recipe_id,
    CASE
        WHEN i.position = 4 THEN
            CASE r.variant_name
                WHEN 'Arroz' THEN 'Arroz redondo'
                WHEN 'Pasta' THEN 'Pasta seca'
                WHEN 'Bandeja' THEN 'Pollo o tofu'
                ELSE 'Harina y cacao'
            END
        ELSE i.ingredient_name
    END,
    i.quantity + ((r.user_idx + r.variant_idx + i.position) % 4) * 25,
    i.unit,
    i.position
FROM recipes_source r
CROSS JOIN ingredients_seed i
ON CONFLICT (id) DO NOTHING;

WITH steps_seed AS (
    SELECT *
    FROM (
        VALUES
            (1, 'Prepara todos los ingredientes y deja la mise en place lista.'),
            (2, 'Cocina la base a fuego medio hasta integrar bien los sabores.'),
            (3, 'Termina la receta, ajusta el punto y sirve caliente.')
    ) AS data(step_number, instruction)
),
recipes_source AS (
    SELECT
        u.idx AS user_idx,
        v.variant_idx,
        (
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 1, 8) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 9, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 13, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 17, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 21, 12)
        )::uuid AS recipe_id
    FROM (
        SELECT idx
        FROM (
            VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15),
                   (16), (17), (18), (19), (20), (21), (22), (23), (24), (25)
        ) AS ids(idx)
    ) u
    CROSS JOIN (
        VALUES (1), (2), (3), (4)
    ) AS v(variant_idx)
)
INSERT INTO recipe_steps (id, recipe_id, step_number, instruction)
SELECT
    (
        substr(md5('kk-massive-step-' || r.recipe_id::text || '-' || s.step_number), 1, 8) || '-' ||
        substr(md5('kk-massive-step-' || r.recipe_id::text || '-' || s.step_number), 9, 4) || '-' ||
        substr(md5('kk-massive-step-' || r.recipe_id::text || '-' || s.step_number), 13, 4) || '-' ||
        substr(md5('kk-massive-step-' || r.recipe_id::text || '-' || s.step_number), 17, 4) || '-' ||
        substr(md5('kk-massive-step-' || r.recipe_id::text || '-' || s.step_number), 21, 12)
    )::uuid,
    r.recipe_id,
    s.step_number,
    s.instruction
FROM recipes_source r
CROSS JOIN steps_seed s
ON CONFLICT (id) DO NOTHING;

WITH comment_seed AS (
    SELECT *
    FROM (
        VALUES
            (1, 'Muy buena para diario, queda equilibrada y fácil de seguir.'),
            (2, 'La he hecho en casa y ha salido estupenda con muy pocos cambios.')
    ) AS data(comment_idx, content)
),
comments_source AS (
    SELECT
        u.idx AS owner_idx,
        v.variant_idx,
        (
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 1, 8) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 9, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 13, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 17, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 21, 12)
        )::uuid AS recipe_id,
        (
            substr(md5('kk-massive-user-' || CASE WHEN u.idx = 25 THEN 6 ELSE u.idx + 1 END), 1, 8) || '-' ||
            substr(md5('kk-massive-user-' || CASE WHEN u.idx = 25 THEN 6 ELSE u.idx + 1 END), 9, 4) || '-' ||
            substr(md5('kk-massive-user-' || CASE WHEN u.idx = 25 THEN 6 ELSE u.idx + 1 END), 13, 4) || '-' ||
            substr(md5('kk-massive-user-' || CASE WHEN u.idx = 25 THEN 6 ELSE u.idx + 1 END), 17, 4) || '-' ||
            substr(md5('kk-massive-user-' || CASE WHEN u.idx = 25 THEN 6 ELSE u.idx + 1 END), 21, 12)
        )::uuid AS commenter_id
    FROM (
        SELECT idx
        FROM (
            VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15),
                   (16), (17), (18), (19), (20), (21), (22), (23), (24), (25)
        ) AS ids(idx)
    ) u
    CROSS JOIN (
        VALUES (1), (2), (3)
    ) AS v(variant_idx)
)
INSERT INTO comments (id, recipe_id, user_id, content)
SELECT
    (
        substr(md5('kk-massive-comment-' || c.recipe_id::text || '-' || s.comment_idx), 1, 8) || '-' ||
        substr(md5('kk-massive-comment-' || c.recipe_id::text || '-' || s.comment_idx), 9, 4) || '-' ||
        substr(md5('kk-massive-comment-' || c.recipe_id::text || '-' || s.comment_idx), 13, 4) || '-' ||
        substr(md5('kk-massive-comment-' || c.recipe_id::text || '-' || s.comment_idx), 17, 4) || '-' ||
        substr(md5('kk-massive-comment-' || c.recipe_id::text || '-' || s.comment_idx), 21, 12)
    )::uuid,
    c.recipe_id,
    c.commenter_id,
    s.content
FROM comments_source c
CROSS JOIN comment_seed s
ON CONFLICT (id) DO NOTHING;

WITH ratings_source AS (
    SELECT
        u.idx AS owner_idx,
        v.variant_idx,
        (
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 1, 8) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 9, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 13, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 17, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || v.variant_idx), 21, 12)
        )::uuid AS recipe_id,
        (
            substr(md5('kk-massive-user-' || CASE WHEN u.idx >= 24 THEN 6 + (u.idx - 24) ELSE u.idx + 2 END), 1, 8) || '-' ||
            substr(md5('kk-massive-user-' || CASE WHEN u.idx >= 24 THEN 6 + (u.idx - 24) ELSE u.idx + 2 END), 9, 4) || '-' ||
            substr(md5('kk-massive-user-' || CASE WHEN u.idx >= 24 THEN 6 + (u.idx - 24) ELSE u.idx + 2 END), 13, 4) || '-' ||
            substr(md5('kk-massive-user-' || CASE WHEN u.idx >= 24 THEN 6 + (u.idx - 24) ELSE u.idx + 2 END), 17, 4) || '-' ||
            substr(md5('kk-massive-user-' || CASE WHEN u.idx >= 24 THEN 6 + (u.idx - 24) ELSE u.idx + 2 END), 21, 12)
        )::uuid AS rating_user_id,
        ((u.idx + v.variant_idx) % 2) + 4 AS value
    FROM (
        SELECT idx
        FROM (
            VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15),
                   (16), (17), (18), (19), (20), (21), (22), (23), (24), (25)
        ) AS ids(idx)
    ) u
    CROSS JOIN (
        VALUES (1), (2), (3), (4)
    ) AS v(variant_idx)
)
INSERT INTO ratings (id, recipe_id, user_id, value)
SELECT
    (
        substr(md5('kk-massive-rating-' || r.recipe_id::text || '-' || r.rating_user_id::text), 1, 8) || '-' ||
        substr(md5('kk-massive-rating-' || r.recipe_id::text || '-' || r.rating_user_id::text), 9, 4) || '-' ||
        substr(md5('kk-massive-rating-' || r.recipe_id::text || '-' || r.rating_user_id::text), 13, 4) || '-' ||
        substr(md5('kk-massive-rating-' || r.recipe_id::text || '-' || r.rating_user_id::text), 17, 4) || '-' ||
        substr(md5('kk-massive-rating-' || r.recipe_id::text || '-' || r.rating_user_id::text), 21, 12)
    )::uuid,
    r.recipe_id,
    r.rating_user_id,
    r.value
FROM ratings_source r
ON CONFLICT (recipe_id, user_id) DO NOTHING;

WITH shopping_lists_source AS (
    SELECT
        u.idx,
        list_idx,
        (
            substr(md5('kk-massive-shopping-list-' || u.idx || '-' || list_idx), 1, 8) || '-' ||
            substr(md5('kk-massive-shopping-list-' || u.idx || '-' || list_idx), 9, 4) || '-' ||
            substr(md5('kk-massive-shopping-list-' || u.idx || '-' || list_idx), 13, 4) || '-' ||
            substr(md5('kk-massive-shopping-list-' || u.idx || '-' || list_idx), 17, 4) || '-' ||
            substr(md5('kk-massive-shopping-list-' || u.idx || '-' || list_idx), 21, 12)
        )::uuid AS list_id,
        (
            substr(md5('kk-massive-user-' || u.idx), 1, 8) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 9, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 13, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 17, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 21, 12)
        )::uuid AS user_id,
        CASE list_idx
            WHEN 1 THEN 'Compra semanal ' || u.idx
            ELSE 'Invitados y extras ' || u.idx
        END AS name,
        CASE list_idx
            WHEN 1 THEN 'Lista pensada para el menú semanal.'
            ELSE 'Ingredientes para reuniones, cenas o reposición de despensa.'
        END AS description
    FROM (
        SELECT idx
        FROM (
            VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15),
                   (16), (17), (18), (19), (20), (21), (22), (23), (24), (25)
        ) AS ids(idx)
    ) u
    CROSS JOIN (
        VALUES (1), (2)
    ) AS l(list_idx)
)
INSERT INTO shopping_lists (id, user_id, name, description)
SELECT list_id, user_id, name, description
FROM shopping_lists_source
ON CONFLICT (id) DO NOTHING;

WITH items_seed AS (
    SELECT *
    FROM (
        VALUES
            (1, 'Tomate', 4, 'ud', FALSE),
            (2, 'Leche', 1, 'l', TRUE),
            (3, 'Pan', 1, 'paquete', FALSE)
    ) AS data(position, ingredient_name, quantity, unit, is_checked)
),
shopping_lists_source AS (
    SELECT
        u.idx,
        list_idx,
        (
            substr(md5('kk-massive-shopping-list-' || u.idx || '-' || list_idx), 1, 8) || '-' ||
            substr(md5('kk-massive-shopping-list-' || u.idx || '-' || list_idx), 9, 4) || '-' ||
            substr(md5('kk-massive-shopping-list-' || u.idx || '-' || list_idx), 13, 4) || '-' ||
            substr(md5('kk-massive-shopping-list-' || u.idx || '-' || list_idx), 17, 4) || '-' ||
            substr(md5('kk-massive-shopping-list-' || u.idx || '-' || list_idx), 21, 12)
        )::uuid AS list_id,
        (
            substr(md5('kk-massive-recipe-' || u.idx || '-' || CASE WHEN list_idx = 1 THEN 1 ELSE 2 END), 1, 8) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || CASE WHEN list_idx = 1 THEN 1 ELSE 2 END), 9, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || CASE WHEN list_idx = 1 THEN 1 ELSE 2 END), 13, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || CASE WHEN list_idx = 1 THEN 1 ELSE 2 END), 17, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || u.idx || '-' || CASE WHEN list_idx = 1 THEN 1 ELSE 2 END), 21, 12)
        )::uuid AS recipe_id
    FROM (
        SELECT idx
        FROM (
            VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15),
                   (16), (17), (18), (19), (20), (21), (22), (23), (24), (25)
        ) AS ids(idx)
    ) u
    CROSS JOIN (
        VALUES (1), (2)
    ) AS l(list_idx)
)
INSERT INTO shopping_list_items (
    id,
    shopping_list_id,
    recipe_id,
    ingredient_name,
    quantity,
    unit,
    notes,
    is_checked
)
SELECT
    (
        substr(md5('kk-massive-shopping-item-' || s.list_id::text || '-' || i.position), 1, 8) || '-' ||
        substr(md5('kk-massive-shopping-item-' || s.list_id::text || '-' || i.position), 9, 4) || '-' ||
        substr(md5('kk-massive-shopping-item-' || s.list_id::text || '-' || i.position), 13, 4) || '-' ||
        substr(md5('kk-massive-shopping-item-' || s.list_id::text || '-' || i.position), 17, 4) || '-' ||
        substr(md5('kk-massive-shopping-item-' || s.list_id::text || '-' || i.position), 21, 12)
    )::uuid,
    s.list_id,
    s.recipe_id,
    i.ingredient_name,
    i.quantity + ((s.idx + i.position) % 3),
    i.unit,
    CASE WHEN i.position = 1 THEN 'Comprar fresco' ELSE NULL END,
    i.is_checked
FROM shopping_lists_source s
CROSS JOIN items_seed i
ON CONFLICT (id) DO NOTHING;

WITH favorite_source AS (
    SELECT
        u.idx AS user_idx,
        fav_recipe_idx,
        (
            substr(md5('kk-massive-user-' || u.idx), 1, 8) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 9, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 13, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 17, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 21, 12)
        )::uuid AS user_id,
        (
            substr(md5('kk-massive-recipe-' || CASE WHEN u.idx = 25 THEN 6 ELSE u.idx + 1 END || '-' || fav_recipe_idx), 1, 8) || '-' ||
            substr(md5('kk-massive-recipe-' || CASE WHEN u.idx = 25 THEN 6 ELSE u.idx + 1 END || '-' || fav_recipe_idx), 9, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || CASE WHEN u.idx = 25 THEN 6 ELSE u.idx + 1 END || '-' || fav_recipe_idx), 13, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || CASE WHEN u.idx = 25 THEN 6 ELSE u.idx + 1 END || '-' || fav_recipe_idx), 17, 4) || '-' ||
            substr(md5('kk-massive-recipe-' || CASE WHEN u.idx = 25 THEN 6 ELSE u.idx + 1 END || '-' || fav_recipe_idx), 21, 12)
        )::uuid AS recipe_id
    FROM (
        SELECT idx
        FROM (
            VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15),
                   (16), (17), (18), (19), (20), (21), (22), (23), (24), (25)
        ) AS ids(idx)
    ) u
    CROSS JOIN (
        VALUES (1), (2)
    ) AS f(fav_recipe_idx)
)
INSERT INTO user_recipe_favorites (id, user_id, recipe_id)
SELECT
    (
        substr(md5('kk-massive-favorite-' || user_id::text || '-' || recipe_id::text), 1, 8) || '-' ||
        substr(md5('kk-massive-favorite-' || user_id::text || '-' || recipe_id::text), 9, 4) || '-' ||
        substr(md5('kk-massive-favorite-' || user_id::text || '-' || recipe_id::text), 13, 4) || '-' ||
        substr(md5('kk-massive-favorite-' || user_id::text || '-' || recipe_id::text), 17, 4) || '-' ||
        substr(md5('kk-massive-favorite-' || user_id::text || '-' || recipe_id::text), 21, 12)
    )::uuid,
    user_id,
    recipe_id
FROM favorite_source
ON CONFLICT (user_id, recipe_id) DO NOTHING;

WITH external_favorites_source AS (
    SELECT
        u.idx,
        (
            substr(md5('kk-massive-user-' || u.idx), 1, 8) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 9, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 13, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 17, 4) || '-' ||
            substr(md5('kk-massive-user-' || u.idx), 21, 12)
        )::uuid AS user_id
    FROM (
        SELECT idx
        FROM (
            VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15),
                   (16), (17), (18), (19), (20), (21), (22), (23), (24), (25)
        ) AS ids(idx)
    ) u
)
INSERT INTO favorite_recipes (
    id,
    user_id,
    external_recipe_id,
    title,
    image_url,
    source,
    source_url,
    cuisine_type,
    meal_type,
    dish_type
)
SELECT
    (
        substr(md5('kk-massive-external-favorite-' || user_id::text), 1, 8) || '-' ||
        substr(md5('kk-massive-external-favorite-' || user_id::text), 9, 4) || '-' ||
        substr(md5('kk-massive-external-favorite-' || user_id::text), 13, 4) || '-' ||
        substr(md5('kk-massive-external-favorite-' || user_id::text), 17, 4) || '-' ||
        substr(md5('kk-massive-external-favorite-' || user_id::text), 21, 12)
    )::uuid,
    user_id,
    'http://www.edamam.com/ontologies/edamam.owl#recipe-demo-massive-' || idx,
    'Receta externa de prueba ' || idx,
    NULL,
    'Edamam',
    'https://example.com/edamam-demo-' || idx,
    ARRAY['mediterranean'],
    ARRAY['lunch/dinner'],
    ARRAY['main course']
FROM external_favorites_source
ON CONFLICT (user_id, external_recipe_id) DO NOTHING;
