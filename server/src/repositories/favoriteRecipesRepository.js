const { query } = require("../config/db");

let schemaReadyPromise;

function ensureSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = query(`
      CREATE TABLE IF NOT EXISTS user_recipe_favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, recipe_id)
      );

      CREATE INDEX IF NOT EXISTS idx_user_recipe_favorites_user_id
      ON user_recipe_favorites(user_id);

      CREATE INDEX IF NOT EXISTS idx_user_recipe_favorites_recipe_id
      ON user_recipe_favorites(recipe_id);
    `);
  }

  return schemaReadyPromise;
}

async function addFavorite(userId, recipeId) {
  await ensureSchema();

  const result = await query(
    `
      INSERT INTO user_recipe_favorites (user_id, recipe_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, recipe_id)
      DO UPDATE SET created_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    [userId, recipeId]
  );

  return result.rows[0];
}

async function removeFavorite(userId, recipeId) {
  await ensureSchema();

  const result = await query(
    `
      DELETE FROM user_recipe_favorites
      WHERE user_id = $1 AND recipe_id = $2
      RETURNING id
    `,
    [userId, recipeId]
  );

  return result.rowCount > 0;
}

async function listFavorites(userId, filters) {
  await ensureSchema();

  const values = [userId];
  const conditions = ["f.user_id = $1"];

  if (filters.name) {
    values.push(`%${String(filters.name).trim()}%`);
    conditions.push(`r.title ILIKE $${values.length}`);
  }

  const pageSize = Math.min(Math.max(Number(filters.pageSize) || 10, 1), 10);
  const page = Math.max(Number(filters.page) || 1, 1);
  const offset = (page - 1) * pageSize;
  const whereClause = conditions.join(" AND ");

  const countResult = await query(
    `
      SELECT COUNT(*)::int AS total
      FROM user_recipe_favorites f
      JOIN recipes r ON r.id = f.recipe_id
      WHERE ${whereClause}
    `,
    values
  );

  const dataValues = [...values, pageSize, offset];
  const result = await query(
    `
      SELECT
        r.id,
        r.user_id,
        r.title,
        r.description,
        r.category,
        r.difficulty,
        r.preparation_time_minutes,
        r.servings,
        r.image_url,
        r.is_public,
        r.created_at,
        r.updated_at,
        u.username,
        up.first_name,
        up.last_name,
        COALESCE(ROUND(AVG(rt.value)::numeric, 1), 0) AS average_rating,
        COUNT(rt.id)::int AS ratings_count
      FROM user_recipe_favorites f
      JOIN recipes r ON r.id = f.recipe_id
      JOIN users u ON u.id = r.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      LEFT JOIN ratings rt ON rt.recipe_id = r.id
      WHERE ${whereClause}
      GROUP BY r.id, u.username, up.first_name, up.last_name
      ORDER BY MAX(f.created_at) DESC
      LIMIT $${dataValues.length - 1}
      OFFSET $${dataValues.length}
    `,
    dataValues
  );

  return {
    total: countResult.rows[0]?.total || 0,
    page,
    pageSize,
    items: result.rows
  };
}

async function getFavoriteStatuses(userId, recipeIds) {
  await ensureSchema();

  if (!recipeIds.length) {
    return [];
  }

  const result = await query(
    `
      SELECT recipe_id
      FROM user_recipe_favorites
      WHERE user_id = $1
      AND recipe_id = ANY($2::uuid[])
    `,
    [userId, recipeIds]
  );

  return result.rows.map((row) => row.recipe_id);
}

module.exports = {
  addFavorite,
  removeFavorite,
  listFavorites,
  getFavoriteStatuses
};
