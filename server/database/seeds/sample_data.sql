-- Datos de demostracion para KitchenKnot
-- Contrasena para todos los usuarios de prueba: demo1234

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

INSERT INTO users (id, email, username, password_hash, is_active)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'laura@kitchenknot.demo', 'lauracocina', '$2a$10$5EMYp5TY7fZ/7rK91BDRo.codvh6xO4dA1./NYR6zpWTrSfIvL.Uu', TRUE),
    ('10000000-0000-0000-0000-000000000002', 'marcos@kitchenknot.demo', 'marcosfit', '$2a$10$2Kw28xbnzknCDBO1.qxMXusOGJ2t8Mvhdp5Jz0zUs9E3xUFc6sZtq', TRUE),
    ('10000000-0000-0000-0000-000000000003', 'sara@kitchenknot.demo', 'saradulce', '$2a$10$YXVwPYHqoH6N9Fgfn6rt5OvOSMZZeQKWVi5CoITJdbLGNInVQ7C1C', TRUE),
    ('10000000-0000-0000-0000-000000000004', 'diego@kitchenknot.demo', 'diegochef', '$2a$10$/3pO46zz2sM0LRnUNZSCTu/j05qCqIp0S4mi5yp2zE6fJKbrTmBWO', TRUE),
    ('10000000-0000-0000-0000-000000000005', 'nuria@kitchenknot.demo', 'nuriaveggie', '$2a$10$UF8sYxgu8D8aipTuyknZlOpvCGKDWa9zYhfe2uVr.kqMtyBeg54we', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (id, user_id, first_name, last_name, avatar_url, bio, birth_date)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Laura', 'Santos Romero', NULL, 'Apasionada de la cocina casera, las cremas suaves y las cenas rapidas para diario.', '1997-04-18'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Marcos', 'Delgado Ruiz', NULL, 'Me gustan las recetas equilibradas, con proteina y preparaciones faciles para toda la semana.', '1994-09-02'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Sara', 'Molina Vega', NULL, 'Siempre termino haciendo postres. Comparto recetas sencillas y resultonas.', '1999-01-27'),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Diego', 'Ortega Perez', NULL, 'Cocino sobre todo platos mediterraneos, arroces y recetas para reuniones en casa.', '1992-11-14'),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Nuria', 'Campos Gil', NULL, 'Recetas vegetarianas faciles, coloridas y pensadas para aprovechar la despensa.', '1996-06-09')
ON CONFLICT (id) DO NOTHING;

INSERT INTO recipes (id, user_id, title, description, category, difficulty, preparation_time_minutes, servings, image_url, is_public)
VALUES
    ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Crema de calabaza asada', 'Una crema suave y aromatica perfecta para una cena ligera.', 'Cremas y sopas', 'facil', 40, 4, 'http://192.168.1.131:3000/static/recipe-images/crema-calabaza-asada.png', TRUE),
    ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Tortilla de patatas jugosa', 'Version tradicional con cebolla pochada y centro tierno.', 'Plato principal', 'media', 35, 4, 'http://192.168.1.131:3000/static/recipe-images/tortilla-patatas-jugosa.png', TRUE),
    ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Bowl de arroz con pollo y verduras', 'Receta completa para preparar tuppers saludables.', 'Plato principal', 'facil', 30, 3, 'http://192.168.1.131:3000/static/recipe-images/bowl-arroz-pollo-verduras.png', TRUE),
    ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Pasta integral con atun y tomate', 'Una pasta rapida con salsa de tomate casera y atun.', 'Pasta', 'facil', 25, 2, 'http://192.168.1.131:3000/static/recipe-images/pasta-integral-atun-tomate.png', TRUE),
    ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Brownie de cacao intenso', 'Brownie denso con nueces y acabado ligeramente crujiente.', 'Postres', 'media', 45, 8, 'http://192.168.1.131:3000/static/recipe-images/brownie-cacao-intenso.png', TRUE),
    ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Galletas de avena y platano', 'Receta facil sin azucar refinado para meriendas.', 'Postres', 'facil', 22, 12, 'http://192.168.1.131:3000/static/recipe-images/galletas-avena-platano.png', TRUE),
    ('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 'Paella mixta para domingo', 'Arroz de fin de semana con pollo, marisco y sofrito casero.', 'Arroces', 'dificil', 60, 6, 'http://192.168.1.131:3000/static/recipe-images/paella-mixta-domingo.png', TRUE),
    ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'Croquetas de jamon cremosas', 'Croquetas caseras con bechamel suave y rebozado crujiente.', 'Tapas', 'media', 70, 6, 'http://192.168.1.131:3000/static/recipe-images/croquetas-jamon-cremosas.png', TRUE),
    ('30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', 'Curry suave de garbanzos', 'Plato vegetariano con leche de coco y especias suaves.', 'Plato principal', 'facil', 35, 4, 'http://192.168.1.131:3000/static/recipe-images/curry-garbanzos-suave.png', TRUE),
    ('30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'Ensalada templada de quinoa', 'Ensalada completa con verduras asadas, quinoa y aliño de limon.', 'Ensaladas', 'facil', 28, 3, 'http://192.168.1.131:3000/static/recipe-images/ensalada-templada-quinoa.png', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO recipe_ingredients (id, recipe_id, ingredient_name, quantity, unit, position)
VALUES
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Calabaza', 800, 'g', 1),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Cebolla', 1, 'unidad', 2),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Caldo de verduras', 700, 'ml', 3),
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'Patatas', 600, 'g', 1),
    ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'Huevos', 5, 'unidades', 2),
    ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'Cebolla', 1, 'unidad', 3),
    ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', 'Arroz largo', 220, 'g', 1),
    ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', 'Pechuga de pollo', 300, 'g', 2),
    ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000003', 'Brocoli', 150, 'g', 3),
    ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000004', 'Pasta integral', 180, 'g', 1),
    ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000004', 'Atun al natural', 2, 'latas', 2),
    ('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000004', 'Tomate triturado', 250, 'g', 3),
    ('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000005', 'Chocolate negro', 200, 'g', 1),
    ('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000005', 'Mantequilla', 120, 'g', 2),
    ('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000005', 'Azucar', 180, 'g', 3),
    ('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000006', 'Copos de avena', 180, 'g', 1),
    ('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000006', 'Platano maduro', 2, 'unidades', 2),
    ('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000006', 'Canela', 1, 'cucharadita', 3),
    ('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000007', 'Arroz bomba', 420, 'g', 1),
    ('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000007', 'Pollo troceado', 350, 'g', 2),
    ('40000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000007', 'Mejillones', 300, 'g', 3),
    ('40000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000008', 'Jamon serrano', 120, 'g', 1),
    ('40000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000008', 'Leche', 700, 'ml', 2),
    ('40000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000008', 'Harina', 80, 'g', 3),
    ('40000000-0000-0000-0000-000000000025', '30000000-0000-0000-0000-000000000009', 'Garbanzos cocidos', 400, 'g', 1),
    ('40000000-0000-0000-0000-000000000026', '30000000-0000-0000-0000-000000000009', 'Leche de coco', 250, 'ml', 2),
    ('40000000-0000-0000-0000-000000000027', '30000000-0000-0000-0000-000000000009', 'Espinacas', 120, 'g', 3),
    ('40000000-0000-0000-0000-000000000028', '30000000-0000-0000-0000-000000000010', 'Quinoa', 180, 'g', 1),
    ('40000000-0000-0000-0000-000000000029', '30000000-0000-0000-0000-000000000010', 'Calabacin', 1, 'unidad', 2),
    ('40000000-0000-0000-0000-000000000030', '30000000-0000-0000-0000-000000000010', 'Pimiento rojo', 1, 'unidad', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO recipe_steps (id, recipe_id, step_number, instruction)
VALUES
    ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1, 'Asa la calabaza y la cebolla con un poco de aceite hasta que queden tiernas.'),
    ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 2, 'Tritura con el caldo caliente hasta obtener una crema fina.'),
    ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 1, 'Pocha lentamente la cebolla y las patatas en aceite hasta que esten tiernas.'),
    ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 2, 'Mezcla con los huevos batidos y cuaja la tortilla al gusto.'),
    ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 1, 'Cocina el arroz y saltea el pollo con las verduras.'),
    ('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', 2, 'Monta el bowl y sirve con una salsa ligera.'),
    ('50000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000004', 1, 'Cuece la pasta y prepara una salsa de tomate rapida con ajo.'),
    ('50000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000004', 2, 'Añade el atun escurrido, mezcla con la pasta y ajusta de sal.'),
    ('50000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000005', 1, 'Funde el chocolate con la mantequilla y mezcla con el resto de ingredientes.'),
    ('50000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000005', 2, 'Hornea hasta que el centro quede jugoso y deja enfriar antes de cortar.'),
    ('50000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000006', 1, 'Tritura el platano y mezcla con avena y canela.'),
    ('50000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000006', 2, 'Forma galletas y hornea hasta que los bordes se doren.'),
    ('50000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000007', 1, 'Prepara un sofrito generoso y añade el arroz, el pollo y el marisco.'),
    ('50000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000007', 2, 'Cuece sin remover hasta que el arroz quede en su punto.'),
    ('50000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000008', 1, 'Haz una bechamel espesa, incorpora el jamon y deja enfriar la masa.'),
    ('50000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000008', 2, 'Forma las croquetas, empana y frie hasta que esten doradas.'),
    ('50000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000009', 1, 'Saltea cebolla y especias, añade garbanzos y leche de coco.'),
    ('50000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000009', 2, 'Incorpora espinacas y cocina unos minutos hasta integrar sabores.'),
    ('50000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000010', 1, 'Cuece la quinoa y asa las verduras con aceite y especias.'),
    ('50000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000010', 2, 'Monta la ensalada y aliña con limon y aceite de oliva.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO comments (id, recipe_id, user_id, content)
VALUES
    ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'La he preparado esta noche y queda muy cremosa. Repetire seguro.'),
    ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Buenisima. Yo la deje un poco menos hecha y quedo perfecta.'),
    ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Ideal para tupper. Le añadi zanahoria y quedo genial.'),
    ('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Muy rico y facil. La proxima vez probare con menos azucar.'),
    ('60000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Gran receta para domingo. Bien explicada y con buen resultado.'),
    ('60000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'Me gusta que sea suave. Le puse un poco mas de curry y quedo estupendo.'),
    ('60000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', 'Muy completa para llevar al trabajo y aguanta bien de un dia para otro.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ratings (id, recipe_id, user_id, value)
VALUES
    ('70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 5),
    ('70000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 5),
    ('70000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 4),
    ('70000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 4),
    ('70000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 5),
    ('70000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 5),
    ('70000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 4),
    ('70000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 5),
    ('70000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO shopping_lists (id, user_id, name, description)
VALUES
    ('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Compra semanal', 'Lista principal para el menu de la semana.'),
    ('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Batch cooking domingo', 'Ingredientes para cocinar varios tuppers.'),
    ('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'Recetas vegetarianas', 'Ingredientes para platos faciles de diario.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO shopping_list_items (id, shopping_list_id, recipe_id, ingredient_name, quantity, unit, notes, is_checked)
VALUES
    ('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Calabaza', 1, 'unidad', 'Que sea grande y dulce', TRUE),
    ('90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'Huevos', 12, 'unidades', NULL, FALSE),
    ('90000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'Pechuga de pollo', 1, 'bandeja', NULL, FALSE),
    ('90000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'Tomate triturado', 2, 'botes', NULL, TRUE),
    ('90000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000009', 'Leche de coco', 2, 'latas', 'Sin azucar', FALSE),
    ('90000000-0000-0000-0000-000000000006', '80000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000010', 'Quinoa', 500, 'g', NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO favorite_recipes (id, user_id, external_recipe_id, title, image_url, source, source_url, cuisine_type, meal_type, dish_type)
VALUES
    ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'http://www.edamam.com/ontologies/edamam.owl#recipe-demo-arroz', 'Arroz blanco facil', NULL, 'Edamam', 'https://example.com/arroz-blanco', ARRAY['south american'], ARRAY['lunch/dinner'], ARRAY['main course']),
    ('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'http://www.edamam.com/ontologies/edamam.owl#recipe-demo-pollo', 'Pollo al horno especiado', NULL, 'Edamam', 'https://example.com/pollo-horno', ARRAY['mediterranean'], ARRAY['lunch/dinner'], ARRAY['main course']),
    ('a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'http://www.edamam.com/ontologies/edamam.owl#recipe-demo-galletas', 'Galletas de avena y miel', NULL, 'Edamam', 'https://example.com/galletas-avena', ARRAY['american'], ARRAY['teatime'], ARRAY['biscuits and cookies'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_recipe_favorites (id, user_id, recipe_id)
VALUES
    ('b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000007'),
    ('b0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000009'),
    ('b0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005'),
    ('b0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id, recipe_id) DO NOTHING;
