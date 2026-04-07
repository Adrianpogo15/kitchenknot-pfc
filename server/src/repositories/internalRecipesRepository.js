const { pool, query } = require("../config/db");

function buildFilters(filters = {}, includeOnlyPublic = true, ownerUserId = null) {
  const values = [];
  const conditions = [];

  if (includeOnlyPublic) {
    conditions.push("r.is_public = TRUE");
  }

  if (ownerUserId) {
    values.push(ownerUserId);
    conditions.push(`r.user_id = $${values.length}`);
  }

  if (filters.name) {
    values.push(`%${String(filters.name).trim()}%`);
    conditions.push(`r.title ILIKE $${values.length}`);
  }

  if (filters.difficulty) {
    values.push(String(filters.difficulty).trim().toLowerCase());
    conditions.push(`LOWER(r.difficulty) = $${values.length}`);
  }

  if (filters.servings) {
    values.push(Number(filters.servings));
    conditions.push(`r.servings = $${values.length}`);
  }

  return {
    values,
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
  };
}

async function listRecipes(filters = {}, options = {}) {
  const pageSize = Math.min(Math.max(Number(filters.pageSize) || 10, 1), 10);
  const page = Math.max(Number(filters.page) || 1, 1);
  const offset = (page - 1) * pageSize;
  const includeOnlyPublic = options.includeOnlyPublic !== false;
  const ownerUserId = options.ownerUserId || null;

  const { values, whereClause } = buildFilters(filters, includeOnlyPublic, ownerUserId);

  const countResult = await query(
    `
      SELECT COUNT(*)::int AS total
      FROM recipes r
      ${whereClause}
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
      FROM recipes r
      JOIN users u ON u.id = r.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      LEFT JOIN ratings rt ON rt.recipe_id = r.id
      ${whereClause}
      GROUP BY r.id, u.username, up.first_name, up.last_name
      ORDER BY r.created_at DESC
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

async function findRecipeById(recipeId) {
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
      FROM recipes r
      JOIN users u ON u.id = r.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      LEFT JOIN ratings rt ON rt.recipe_id = r.id
      WHERE r.id = $1
      GROUP BY r.id, u.username, up.first_name, up.last_name
      LIMIT 1
    `,
    [recipeId]
  );

  return result.rows[0] || null;
}

async function findIngredientsByRecipeId(recipeId) {
  const result = await query(
    `
      SELECT
        id,
        recipe_id,
        ingredient_name,
        quantity,
        unit,
        position
      FROM recipe_ingredients
      WHERE recipe_id = $1
      ORDER BY position ASC, created_at ASC
    `,
    [recipeId]
  );

  return result.rows;
}

async function findStepsByRecipeId(recipeId) {
  const result = await query(
    `
      SELECT
        id,
        recipe_id,
        step_number,
        instruction
      FROM recipe_steps
      WHERE recipe_id = $1
      ORDER BY step_number ASC
    `,
    [recipeId]
  );

  return result.rows;
}

async function findCommentsByRecipeId(recipeId) {
  const result = await query(
    `
      SELECT
        c.id,
        c.recipe_id,
        c.user_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.username,
        up.first_name,
        up.last_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE c.recipe_id = $1
      ORDER BY c.created_at DESC
    `,
    [recipeId]
  );

  return result.rows;
}

async function createComment(recipeId, userId, content) {
  const result = await query(
    `
      INSERT INTO comments (recipe_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [recipeId, userId, content]
  );

  return result.rows[0];
}

async function upsertRating(recipeId, userId, value) {
  const result = await query(
    `
      INSERT INTO ratings (recipe_id, user_id, value)
      VALUES ($1, $2, $3)
      ON CONFLICT (recipe_id, user_id)
      DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    [recipeId, userId, value]
  );

  return result.rows[0];
}

async function findUserRating(recipeId, userId) {
  const result = await query(
    `
      SELECT id, recipe_id, user_id, value, created_at, updated_at
      FROM ratings
      WHERE recipe_id = $1 AND user_id = $2
      LIMIT 1
    `,
    [recipeId, userId]
  );

  return result.rows[0] || null;
}

async function createRecipeWithDetails(userId, payload) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const recipeResult = await client.query(
      `
        INSERT INTO recipes (
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `,
      [
        userId,
        payload.title,
        payload.description,
        payload.category,
        payload.difficulty,
        payload.preparationTimeMinutes,
        payload.servings,
        payload.imageUrl,
        payload.isPublic
      ]
    );

    const recipeId = recipeResult.rows[0].id;

    for (const ingredient of payload.ingredients) {
      await client.query(
        `
          INSERT INTO recipe_ingredients (
            recipe_id,
            ingredient_name,
            quantity,
            unit,
            position
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [recipeId, ingredient.ingredientName, ingredient.quantity, ingredient.unit, ingredient.position]
      );
    }

    for (const step of payload.steps) {
      await client.query(
        `
          INSERT INTO recipe_steps (recipe_id, step_number, instruction)
          VALUES ($1, $2, $3)
        `,
        [recipeId, step.stepNumber, step.instruction]
      );
    }

    await client.query("COMMIT");
    return recipeId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateRecipeWithDetails(userId, recipeId, payload) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const ownership = await client.query(
      `
        SELECT id
        FROM recipes
        WHERE id = $1 AND user_id = $2
        LIMIT 1
      `,
      [recipeId, userId]
    );

    if (!ownership.rows[0]) {
      await client.query("ROLLBACK");
      return false;
    }

    await client.query(
      `
        UPDATE recipes
        SET
          title = $3,
          description = $4,
          category = $5,
          difficulty = $6,
          preparation_time_minutes = $7,
          servings = $8,
          image_url = $9,
          is_public = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
      `,
      [
        recipeId,
        userId,
        payload.title,
        payload.description,
        payload.category,
        payload.difficulty,
        payload.preparationTimeMinutes,
        payload.servings,
        payload.imageUrl,
        payload.isPublic
      ]
    );

    await client.query("DELETE FROM recipe_ingredients WHERE recipe_id = $1", [recipeId]);
    await client.query("DELETE FROM recipe_steps WHERE recipe_id = $1", [recipeId]);

    for (const ingredient of payload.ingredients) {
      await client.query(
        `
          INSERT INTO recipe_ingredients (
            recipe_id,
            ingredient_name,
            quantity,
            unit,
            position
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [recipeId, ingredient.ingredientName, ingredient.quantity, ingredient.unit, ingredient.position]
      );
    }

    for (const step of payload.steps) {
      await client.query(
        `
          INSERT INTO recipe_steps (recipe_id, step_number, instruction)
          VALUES ($1, $2, $3)
        `,
        [recipeId, step.stepNumber, step.instruction]
      );
    }

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deleteRecipeByOwner(userId, recipeId) {
  const result = await query(
    `
      DELETE FROM recipes
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `,
    [recipeId, userId]
  );

  return result.rowCount > 0;
}

module.exports = {
  listRecipes,
  findRecipeById,
  findIngredientsByRecipeId,
  findStepsByRecipeId,
  findCommentsByRecipeId,
  createComment,
  upsertRating,
  findUserRating,
  createRecipeWithDetails,
  updateRecipeWithDetails,
  deleteRecipeByOwner
};
