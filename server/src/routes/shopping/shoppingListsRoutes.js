const express = require("express");

const authMiddleware = require("../../middleware/authMiddleware");
const shoppingListsController = require("../../controllers/shopping/shoppingListsController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", shoppingListsController.listShoppingLists);
router.post("/", shoppingListsController.createShoppingList);
router.post("/import-recipe", shoppingListsController.importRecipeIngredients);
router.get("/:listId", shoppingListsController.getShoppingListDetail);
router.delete("/:listId", shoppingListsController.deleteShoppingList);
router.post("/:listId/items", shoppingListsController.addShoppingListItem);
router.patch("/:listId/items/:itemId", shoppingListsController.updateShoppingListItem);
router.delete("/:listId/items/:itemId", shoppingListsController.deleteShoppingListItem);

module.exports = router;
