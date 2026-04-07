const createHttpError = require("../../utils/httpError");
const shoppingListsRepository = require("../../repositories/shoppingListsRepository");
const internalRecipesService = require("./internalRecipesService");

function mapList(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    itemsCount: Number(row.items_count || 0),
    checkedItemsCount: Number(row.checked_items_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapItem(row) {
  return {
    id: row.id,
    shoppingListId: row.shopping_list_id,
    recipeId: row.recipe_id,
    ingredientName: row.ingredient_name,
    quantity: row.quantity,
    unit: row.unit,
    notes: row.notes,
    isChecked: row.is_checked,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function requireName(name, message = "Debes indicar el nombre de la lista") {
  if (!String(name || "").trim()) {
    throw createHttpError(400, message);
  }
}

function requireIngredientName(name) {
  if (!String(name || "").trim()) {
    throw createHttpError(400, "Debes indicar el nombre del ingrediente");
  }
}

async function listShoppingLists(userId) {
  const lists = await shoppingListsRepository.listShoppingLists(userId);
  return lists.map(mapList);
}

async function createShoppingList(userId, payload) {
  requireName(payload?.name);

  const list = await shoppingListsRepository.createShoppingList(
    userId,
    String(payload.name).trim(),
    payload?.description ? String(payload.description).trim() : null
  );

  return mapList({
    ...list,
    items_count: 0,
    checked_items_count: 0
  });
}

async function getShoppingListDetail(userId, listId) {
  const list = await shoppingListsRepository.getShoppingListById(userId, listId);

  if (!list) {
    throw createHttpError(404, "Lista de la compra no encontrada");
  }

  const items = await shoppingListsRepository.listShoppingListItems(userId, listId);

  return {
    ...mapList(list),
    items: items.map(mapItem)
  };
}

async function deleteShoppingList(userId, listId) {
  const deleted = await shoppingListsRepository.deleteShoppingList(userId, listId);

  if (!deleted) {
    throw createHttpError(404, "Lista de la compra no encontrada");
  }
}

async function addShoppingListItem(userId, listId, payload) {
  requireIngredientName(payload?.ingredientName);

  const item = await shoppingListsRepository.addShoppingListItem(userId, listId, {
    recipeId: payload?.recipeId || null,
    ingredientName: String(payload.ingredientName).trim(),
    quantity: payload?.quantity || null,
    unit: payload?.unit ? String(payload.unit).trim() : null,
    notes: payload?.notes ? String(payload.notes).trim() : null
  });

  if (!item) {
    throw createHttpError(404, "Lista de la compra no encontrada");
  }

  return mapItem(item);
}

async function updateShoppingListItem(userId, listId, itemId, payload) {
  const normalizedPayload = {};

  if (Object.prototype.hasOwnProperty.call(payload, "ingredientName")) {
    requireIngredientName(payload.ingredientName);
    normalizedPayload.ingredientName = String(payload.ingredientName).trim();
  }

  if (Object.prototype.hasOwnProperty.call(payload, "quantity")) {
    normalizedPayload.quantity = payload.quantity || null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "unit")) {
    normalizedPayload.unit = payload.unit ? String(payload.unit).trim() : null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "notes")) {
    normalizedPayload.notes = payload.notes ? String(payload.notes).trim() : null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "isChecked")) {
    normalizedPayload.isChecked = Boolean(payload.isChecked);
  }

  const item = await shoppingListsRepository.updateShoppingListItem(
    userId,
    listId,
    itemId,
    normalizedPayload
  );

  if (!item) {
    throw createHttpError(404, "No se ha encontrado el ingrediente de la lista");
  }

  return mapItem(item);
}

async function deleteShoppingListItem(userId, listId, itemId) {
  const deleted = await shoppingListsRepository.deleteShoppingListItem(userId, listId, itemId);

  if (!deleted) {
    throw createHttpError(404, "No se ha encontrado el ingrediente de la lista");
  }
}

async function importRecipeIngredients(userId, payload) {
  const recipeId = payload?.recipeId;
  const shoppingListId = payload?.shoppingListId;
  const newListName = payload?.newListName;

  if (!recipeId) {
    throw createHttpError(400, "Debes indicar la receta que quieres añadir a la lista");
  }

  if (!shoppingListId && !String(newListName || "").trim()) {
    throw createHttpError(400, "Debes elegir una lista o indicar el nombre de una nueva");
  }

  const ingredients = await internalRecipesService.getRecipeIngredients(recipeId);

  if (!ingredients.length) {
    throw createHttpError(400, "La receta no tiene ingredientes para añadir a una lista");
  }

  let targetListId = shoppingListId;

  if (!targetListId) {
    const list = await shoppingListsRepository.createShoppingList(
      userId,
      String(newListName).trim(),
      null
    );
    targetListId = list.id;
  }

  await shoppingListsRepository.addRecipeIngredientsToShoppingList(
    userId,
    targetListId,
    recipeId,
    ingredients
  );

  return getShoppingListDetail(userId, targetListId);
}

module.exports = {
  listShoppingLists,
  createShoppingList,
  getShoppingListDetail,
  deleteShoppingList,
  addShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  importRecipeIngredients
};
