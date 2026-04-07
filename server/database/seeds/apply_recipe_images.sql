-- Aplica imagenes a las recetas de prueba que ya tienes cargadas en Supabase
-- Util si ya ejecutaste sample_data.sql o sample_data_massive.sql antes de que las recetas tuvieran imagen.

UPDATE recipes
SET image_url = CASE id
    WHEN '30000000-0000-0000-0000-000000000001'::uuid THEN 'http://192.168.1.131:3000/static/recipe-images/crema-calabaza-asada.png'
    WHEN '30000000-0000-0000-0000-000000000002'::uuid THEN 'http://192.168.1.131:3000/static/recipe-images/tortilla-patatas-jugosa.png'
    WHEN '30000000-0000-0000-0000-000000000003'::uuid THEN 'http://192.168.1.131:3000/static/recipe-images/bowl-arroz-pollo-verduras.png'
    WHEN '30000000-0000-0000-0000-000000000004'::uuid THEN 'http://192.168.1.131:3000/static/recipe-images/pasta-integral-atun-tomate.png'
    WHEN '30000000-0000-0000-0000-000000000005'::uuid THEN 'http://192.168.1.131:3000/static/recipe-images/brownie-cacao-intenso.png'
    WHEN '30000000-0000-0000-0000-000000000006'::uuid THEN 'http://192.168.1.131:3000/static/recipe-images/galletas-avena-platano.png'
    WHEN '30000000-0000-0000-0000-000000000007'::uuid THEN 'http://192.168.1.131:3000/static/recipe-images/paella-mixta-domingo.png'
    WHEN '30000000-0000-0000-0000-000000000008'::uuid THEN 'http://192.168.1.131:3000/static/recipe-images/croquetas-jamon-cremosas.png'
    WHEN '30000000-0000-0000-0000-000000000009'::uuid THEN 'http://192.168.1.131:3000/static/recipe-images/curry-garbanzos-suave.png'
    WHEN '30000000-0000-0000-0000-000000000010'::uuid THEN 'http://192.168.1.131:3000/static/recipe-images/ensalada-templada-quinoa.png'
    ELSE image_url
END
WHERE id IN (
    '30000000-0000-0000-0000-000000000001'::uuid,
    '30000000-0000-0000-0000-000000000002'::uuid,
    '30000000-0000-0000-0000-000000000003'::uuid,
    '30000000-0000-0000-0000-000000000004'::uuid,
    '30000000-0000-0000-0000-000000000005'::uuid,
    '30000000-0000-0000-0000-000000000006'::uuid,
    '30000000-0000-0000-0000-000000000007'::uuid,
    '30000000-0000-0000-0000-000000000008'::uuid,
    '30000000-0000-0000-0000-000000000009'::uuid,
    '30000000-0000-0000-0000-000000000010'::uuid
);

UPDATE recipes
SET image_url = CASE
    WHEN category = 'Arroces' THEN 'http://192.168.1.131:3000/static/recipe-images/categoria-arroces.png'
    WHEN category = 'Pasta' THEN 'http://192.168.1.131:3000/static/recipe-images/categoria-pasta.png'
    WHEN category = 'Postres' THEN 'http://192.168.1.131:3000/static/recipe-images/categoria-postres.png'
    ELSE 'http://192.168.1.131:3000/static/recipe-images/categoria-horno.png'
END
WHERE image_url IS NULL
  AND id::text IN (
      SELECT
          (
              substr(md5('kk-massive-recipe-' || user_idx || '-' || variant_idx), 1, 8) || '-' ||
              substr(md5('kk-massive-recipe-' || user_idx || '-' || variant_idx), 9, 4) || '-' ||
              substr(md5('kk-massive-recipe-' || user_idx || '-' || variant_idx), 13, 4) || '-' ||
              substr(md5('kk-massive-recipe-' || user_idx || '-' || variant_idx), 17, 4) || '-' ||
              substr(md5('kk-massive-recipe-' || user_idx || '-' || variant_idx), 21, 12)
          )
      FROM (
          SELECT u.idx AS user_idx, v.variant_idx
          FROM (
              VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15),
                     (16), (17), (18), (19), (20), (21), (22), (23), (24), (25)
          ) AS u(idx)
          CROSS JOIN (
              VALUES (1), (2), (3), (4)
          ) AS v(variant_idx)
      ) generated
  );
