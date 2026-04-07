const express = require("express");

const authMiddleware = require("../../middleware/authMiddleware");
const optionalAuthMiddleware = require("../../middleware/optionalAuthMiddleware");
const internalRecipesController = require("../../controllers/recipes/internalRecipesController");

const router = express.Router();

router.get("/", internalRecipesController.listPublicRecipes);
router.get("/mine", authMiddleware, internalRecipesController.listMyRecipes);
router.post("/", authMiddleware, internalRecipesController.createRecipe);
router.get("/:recipeId", optionalAuthMiddleware, internalRecipesController.getRecipeDetail);
router.put("/:recipeId", authMiddleware, internalRecipesController.updateRecipe);
router.delete("/:recipeId", authMiddleware, internalRecipesController.deleteRecipe);
router.post("/:recipeId/comments", authMiddleware, internalRecipesController.addComment);
router.put("/:recipeId/rating", authMiddleware, internalRecipesController.rateRecipe);

module.exports = router;
