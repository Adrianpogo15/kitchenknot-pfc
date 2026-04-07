const asyncHandler = require("../../utils/asyncHandler");
const internalRecipesService = require("../../services/internal/internalRecipesService");

const listPublicRecipes = asyncHandler(async (req, res) => {
  const result = await internalRecipesService.listPublicRecipes(req.query);

  res.status(200).json({
    ok: true,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    data: result.items
  });
});

const listMyRecipes = asyncHandler(async (req, res) => {
  const result = await internalRecipesService.listMyRecipes(req.user.id, req.query);

  res.status(200).json({
    ok: true,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    data: result.items
  });
});

const getRecipeDetail = asyncHandler(async (req, res) => {
  const result = await internalRecipesService.getRecipeDetail(req.params.recipeId, req.user?.id || null);

  res.status(200).json({
    ok: true,
    data: result
  });
});

const addComment = asyncHandler(async (req, res) => {
  const result = await internalRecipesService.addComment(req.params.recipeId, req.user.id, req.body);

  res.status(201).json({
    ok: true,
    message: "Comentario añadido correctamente",
    data: result
  });
});

const rateRecipe = asyncHandler(async (req, res) => {
  const result = await internalRecipesService.rateRecipe(req.params.recipeId, req.user.id, req.body);

  res.status(200).json({
    ok: true,
    message: "Valoración guardada correctamente",
    data: result
  });
});

const createRecipe = asyncHandler(async (req, res) => {
  const result = await internalRecipesService.createRecipe(req.user.id, req.body);

  res.status(201).json({
    ok: true,
    message: "Receta creada correctamente",
    data: result
  });
});

const updateRecipe = asyncHandler(async (req, res) => {
  const result = await internalRecipesService.updateRecipe(
    req.user.id,
    req.params.recipeId,
    req.body
  );

  res.status(200).json({
    ok: true,
    message: "Receta actualizada correctamente",
    data: result
  });
});

const deleteRecipe = asyncHandler(async (req, res) => {
  await internalRecipesService.deleteRecipe(req.user.id, req.params.recipeId);

  res.status(200).json({
    ok: true,
    message: "Receta eliminada correctamente"
  });
});

module.exports = {
  listPublicRecipes,
  listMyRecipes,
  getRecipeDetail,
  addComment,
  rateRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe
};
