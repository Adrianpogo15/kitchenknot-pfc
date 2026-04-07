const asyncHandler = require("../../utils/asyncHandler");
const favoriteRecipesService = require("../../services/internal/favoriteRecipesService");

const addFavorite = asyncHandler(async (req, res) => {
  const payload = {
    ...(req.body || {}),
    recipeId: req.body?.recipeId || req.query?.recipeId || req.params?.recipeId || req.body?.id
  };

  const favorite = await favoriteRecipesService.addFavorite(req.user.id, payload);

  res.status(201).json({
    ok: true,
    message: "Receta guardada en favoritos",
    data: favorite
  });
});

const removeFavorite = asyncHandler(async (req, res) => {
  await favoriteRecipesService.removeFavorite(req.user.id, req.query.recipeId);

  res.status(200).json({
    ok: true,
    message: "Receta eliminada de favoritos"
  });
});

const listFavorites = asyncHandler(async (req, res) => {
  const result = await favoriteRecipesService.listFavorites(req.user.id, req.query);

  res.status(200).json({
    ok: true,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    data: result.items
  });
});

const getFavoriteStatuses = asyncHandler(async (req, res) => {
  const ids = String(req.query.ids || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const favorites = await favoriteRecipesService.getFavoriteStatuses(req.user.id, ids);

  res.status(200).json({
    ok: true,
    data: favorites
  });
});

module.exports = {
  addFavorite,
  removeFavorite,
  listFavorites,
  getFavoriteStatuses
};
