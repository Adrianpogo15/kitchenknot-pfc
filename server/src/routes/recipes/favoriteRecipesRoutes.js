const express = require("express");

const authMiddleware = require("../../middleware/authMiddleware");
const favoriteRecipesController = require("../../controllers/recipes/favoriteRecipesController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", favoriteRecipesController.listFavorites);
router.get("/status", favoriteRecipesController.getFavoriteStatuses);
router.post("/", favoriteRecipesController.addFavorite);
router.delete("/", favoriteRecipesController.removeFavorite);

module.exports = router;
