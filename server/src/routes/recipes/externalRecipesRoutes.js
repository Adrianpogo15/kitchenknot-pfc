const express = require("express");

const { searchExternalMeals } = require("../../controllers/recipes/externalRecipesController");

const router = express.Router();

router.get("/search", searchExternalMeals);

module.exports = router;
