const express = require("express");

const { query } = require("../config/db");
const authRoutes = require("./auth/authRoutes");
const externalRecipesRoutes = require("./recipes/externalRecipesRoutes");
const favoriteRecipesRoutes = require("./recipes/favoriteRecipesRoutes");
const internalRecipesRoutes = require("./recipes/internalRecipesRoutes");
const shoppingListsRoutes = require("./shopping/shoppingListsRoutes");

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "API de recetas inicializada"
  });
});

router.get("/db-status", async (_req, res, next) => {
  try {
    const result = await query("SELECT NOW() AS current_time");

    res.status(200).json({
      ok: true,
      database: "connected",
      currentTime: result.rows[0].current_time
    });
  } catch (error) {
    next(error);
  }
});

router.use("/auth", authRoutes);
router.use("/external-recipes", externalRecipesRoutes);
router.use("/user-recipes", internalRecipesRoutes);
router.use("/favorites", favoriteRecipesRoutes);
router.use("/shopping-lists", shoppingListsRoutes);

module.exports = router;
