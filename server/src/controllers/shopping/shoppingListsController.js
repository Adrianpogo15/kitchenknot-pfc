const asyncHandler = require("../../utils/asyncHandler");
const shoppingListsService = require("../../services/internal/shoppingListsService");

const listShoppingLists = asyncHandler(async (req, res) => {
  const lists = await shoppingListsService.listShoppingLists(req.user.id);

  res.status(200).json({
    ok: true,
    data: lists
  });
});

const createShoppingList = asyncHandler(async (req, res) => {
  const list = await shoppingListsService.createShoppingList(req.user.id, req.body);

  res.status(201).json({
    ok: true,
    message: "Lista de la compra creada",
    data: list
  });
});

const getShoppingListDetail = asyncHandler(async (req, res) => {
  const list = await shoppingListsService.getShoppingListDetail(req.user.id, req.params.listId);

  res.status(200).json({
    ok: true,
    data: list
  });
});

const deleteShoppingList = asyncHandler(async (req, res) => {
  await shoppingListsService.deleteShoppingList(req.user.id, req.params.listId);

  res.status(200).json({
    ok: true,
    message: "Lista de la compra eliminada"
  });
});

const addShoppingListItem = asyncHandler(async (req, res) => {
  const item = await shoppingListsService.addShoppingListItem(
    req.user.id,
    req.params.listId,
    req.body
  );

  res.status(201).json({
    ok: true,
    message: "Ingrediente añadido a la lista",
    data: item
  });
});

const updateShoppingListItem = asyncHandler(async (req, res) => {
  const item = await shoppingListsService.updateShoppingListItem(
    req.user.id,
    req.params.listId,
    req.params.itemId,
    req.body
  );

  res.status(200).json({
    ok: true,
    message: "Ingrediente actualizado",
    data: item
  });
});

const deleteShoppingListItem = asyncHandler(async (req, res) => {
  await shoppingListsService.deleteShoppingListItem(
    req.user.id,
    req.params.listId,
    req.params.itemId
  );

  res.status(200).json({
    ok: true,
    message: "Ingrediente eliminado de la lista"
  });
});

const importRecipeIngredients = asyncHandler(async (req, res) => {
  const list = await shoppingListsService.importRecipeIngredients(req.user.id, req.body);

  res.status(200).json({
    ok: true,
    message: "Ingredientes añadidos a la lista",
    data: list
  });
});

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
