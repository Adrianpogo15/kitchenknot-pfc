const createHttpError = require("../../utils/httpError");
const favoriteRecipesRepository = require("../../repositories/favoriteRecipesRepository");
const internalRecipesService = require("./internalRecipesService");

function validateRecipeId(recipeId) {
  if (!recipeId) {
    throw createHttpError(400, "Debes indicar la receta a guardar en favoritos");
  }
}

function getRecipeIdFromPayload(payload) {
  return (
    payload?.recipeId ||
    payload?.id ||
    payload?.recipe?.id ||
    payload?.recipe?.recipeId ||
    null
  );
}

async function addFavorite(userId, payload) {
  const recipeId = getRecipeIdFromPayload(payload);
  validateRecipeId(recipeId);

  const recipe = await internalRecipesService.getRecipeById(recipeId);

  await favoriteRecipesRepository.addFavorite(userId, recipeId);
  return recipe;
}

async function removeFavorite(userId, recipeId) {
  validateRecipeId(recipeId);

  const removed = await favoriteRecipesRepository.removeFavorite(userId, recipeId);

  if (!removed) {
    throw createHttpError(404, "La receta no estaba guardada en favoritos");
  }
}

async function listFavorites(userId, filters) {
  const result = await favoriteRecipesRepository.listFavorites(userId, filters);

  return {
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: Math.ceil(result.total / result.pageSize),
    items: result.items.map((item) => ({
      id: item.id,
      userId: item.user_id,
      name: item.title,
      description: item.description,
      category: item.category,
      difficulty: item.difficulty,
      preparationTimeMinutes: item.preparation_time_minutes,
      servings: item.servings,
      image: item.image_url,
      isPublic: item.is_public,
      averageRating: Number(item.average_rating || 0),
      ratingsCount: Number(item.ratings_count || 0),
      author: {
        username: item.username,
        firstName: item.first_name,
        lastName: item.last_name
      }
    }))
  };
}

async function getFavoriteStatuses(userId, recipeIds) {
  return favoriteRecipesRepository.getFavoriteStatuses(userId, recipeIds);
}

module.exports = {
  addFavorite,
  removeFavorite,
  listFavorites,
  getFavoriteStatuses
};
