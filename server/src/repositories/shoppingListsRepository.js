const { query } = require("../config/db");

async function listShoppingLists(userId) {
  const result = await query(
    `
      SELECT
        sl.id,
        sl.user_id,
        sl.name,
        sl.description,
        sl.created_at,
        sl.updated_at,
        COUNT(sli.id)::int AS items_count,
        COUNT(*) FILTER (WHERE sli.is_checked = TRUE)::int AS checked_items_count
      FROM shopping_lists sl
      LEFT JOIN shopping_list_items sli ON sli.shopping_list_id = sl.id
      WHERE sl.user_id = $1
      GROUP BY sl.id
      ORDER BY sl.updated_at DESC, sl.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

async function createShoppingList(userId, name, description = null) {
  const result = await query(
    `
      INSERT INTO shopping_lists (user_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [userId, name, description]
  );

  return result.rows[0];
}

async function getShoppingListById(userId, listId) {
  const result = await query(
    `
      SELECT
        sl.id,
        sl.user_id,
        sl.name,
        sl.description,
        sl.created_at,
        sl.updated_at,
        COUNT(sli.id)::int AS items_count,
        COUNT(*) FILTER (WHERE sli.is_checked = TRUE)::int AS checked_items_count
      FROM shopping_lists sl
      LEFT JOIN shopping_list_items sli ON sli.shopping_list_id = sl.id
      WHERE sl.user_id = $1 AND sl.id = $2
      GROUP BY sl.id
      LIMIT 1
    `,
    [userId, listId]
  );

  return result.rows[0] || null;
}

async function deleteShoppingList(userId, listId) {
  const result = await query(
    `
      DELETE FROM shopping_lists
      WHERE user_id = $1 AND id = $2
      RETURNING id
    `,
    [userId, listId]
  );

  return result.rowCount > 0;
}

async function listShoppingListItems(userId, listId) {
  const result = await query(
    `
      SELECT
        sli.id,
        sli.shopping_list_id,
        sli.recipe_id,
        sli.ingredient_name,
        sli.quantity,
        sli.unit,
        sli.notes,
        sli.is_checked,
        sli.created_at,
        sli.updated_at
      FROM shopping_list_items sli
      JOIN shopping_lists sl ON sl.id = sli.shopping_list_id
      WHERE sl.user_id = $1 AND sl.id = $2
      ORDER BY sli.is_checked ASC, sli.created_at ASC
    `,
    [userId, listId]
  );

  return result.rows;
}

async function addShoppingListItem(userId, listId, payload) {
  const result = await query(
    `
      INSERT INTO shopping_list_items (
        shopping_list_id,
        recipe_id,
        ingredient_name,
        quantity,
        unit,
        notes,
        is_checked
      )
      SELECT
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        FALSE
      FROM shopping_lists sl
      WHERE sl.user_id = $1 AND sl.id = $2
      RETURNING *
    `,
    [
      userId,
      listId,
      payload.recipeId || null,
      payload.ingredientName,
      payload.quantity || null,
      payload.unit || null,
      payload.notes || null
    ]
  );

  return result.rows[0] || null;
}

async function updateShoppingListItem(userId, listId, itemId, payload) {
  const fields = [];
  const values = [userId, listId, itemId];

  if (Object.prototype.hasOwnProperty.call(payload, "ingredientName")) {
    values.push(payload.ingredientName);
    fields.push(`ingredient_name = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "quantity")) {
    values.push(payload.quantity);
    fields.push(`quantity = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "unit")) {
    values.push(payload.unit);
    fields.push(`unit = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "notes")) {
    values.push(payload.notes);
    fields.push(`notes = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "isChecked")) {
    values.push(Boolean(payload.isChecked));
    fields.push(`is_checked = $${values.length}`);
  }

  if (!fields.length) {
    return null;
  }

  values.push(new Date().toISOString());
  fields.push(`updated_at = $${values.length}`);

  const result = await query(
    `
      UPDATE shopping_list_items sli
      SET ${fields.join(", ")}
      FROM shopping_lists sl
      WHERE sl.user_id = $1
        AND sl.id = $2
        AND sli.id = $3
        AND sli.shopping_list_id = sl.id
      RETURNING sli.*
    `,
    values
  );

  return result.rows[0] || null;
}

async function deleteShoppingListItem(userId, listId, itemId) {
  const result = await query(
    `
      DELETE FROM shopping_list_items sli
      USING shopping_lists sl
      WHERE sl.user_id = $1
        AND sl.id = $2
        AND sli.id = $3
        AND sli.shopping_list_id = sl.id
      RETURNING sli.id
    `,
    [userId, listId, itemId]
  );

  return result.rowCount > 0;
}

async function addRecipeIngredientsToShoppingList(userId, listId, recipeId, ingredients) {
  const inserted = [];

  for (const ingredient of ingredients) {
    const row = await addShoppingListItem(userId, listId, {
      recipeId,
      ingredientName: ingredient.ingredientName,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      notes: null
    });

    if (row) {
      inserted.push(row);
    }
  }

  return inserted;
}

module.exports = {
  listShoppingLists,
  createShoppingList,
  getShoppingListById,
  deleteShoppingList,
  listShoppingListItems,
  addShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  addRecipeIngredientsToShoppingList
};
