const createHttpError = require("../../utils/httpError");
const internalRecipesRepository = require("../../repositories/internalRecipesRepository");
const {
  deleteRecipeImageByUrl,
  uploadRecipeImage
} = require("../external/supabaseStorageService");

function mapRecipe(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.title,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    preparationTimeMinutes: row.preparation_time_minutes,
    servings: row.servings,
    image: row.image_url,
    isPublic: row.is_public,
    averageRating: Number(row.average_rating || 0),
    ratingsCount: Number(row.ratings_count || 0),
    author: {
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name
    }
  };
}

function mapComment(row) {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: {
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name
    }
  };
}

function normalizeFilters(filters) {
  return {
    name: filters.name ? String(filters.name).trim() : "",
    difficulty: filters.difficulty ? String(filters.difficulty).trim() : "",
    servings: filters.servings ? Number(filters.servings) : "",
    page: filters.page,
    pageSize: filters.pageSize
  };
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function normalizeRecipePayload(payload) {
  const title = String(payload?.title || "").trim();
  const description = normalizeOptionalString(payload?.description);
  const category = normalizeOptionalString(payload?.category);
  const difficulty = normalizeOptionalString(payload?.difficulty);
  const preparationTimeMinutes = payload?.preparationTimeMinutes
    ? Number(payload.preparationTimeMinutes)
    : null;
  const servings = payload?.servings ? Number(payload.servings) : null;
  const imageUrl = normalizeOptionalString(payload?.imageUrl);
  const removeImage = Boolean(payload?.removeImage);
  const imageUpload = payload?.imageUpload || null;
  const isPublic = payload?.isPublic === undefined ? true : Boolean(payload.isPublic);

  const ingredients = Array.isArray(payload?.ingredients)
    ? payload.ingredients
        .map((ingredient, index) => ({
          ingredientName: String(ingredient?.ingredientName || "").trim(),
          quantity: normalizeOptionalString(ingredient?.quantity),
          unit: normalizeOptionalString(ingredient?.unit),
          position: index + 1
        }))
        .filter((ingredient) => ingredient.ingredientName)
    : [];

  const steps = Array.isArray(payload?.steps)
    ? payload.steps
        .map((step, index) => ({
          instruction: String(step?.instruction || "").trim(),
          stepNumber: index + 1
        }))
        .filter((step) => step.instruction)
    : [];

  if (!title) {
    throw createHttpError(400, "Debes indicar el título de la receta");
  }

  if (!category) {
    throw createHttpError(400, "Debes indicar la categoría de la receta");
  }

  if (!difficulty) {
    throw createHttpError(400, "Debes indicar la dificultad de la receta");
  }

  if (!servings || servings < 1) {
    throw createHttpError(400, "Debes indicar los comensales de la receta");
  }

  if (!ingredients.length) {
    throw createHttpError(400, "Debes añadir al menos un ingrediente");
  }

  if (!steps.length) {
    throw createHttpError(400, "Debes añadir al menos un paso");
  }

  return {
    title,
    description,
    category,
    difficulty,
    preparationTimeMinutes: preparationTimeMinutes || null,
    servings,
    imageUrl,
    imageUpload,
    removeImage,
    isPublic,
    ingredients,
    steps
  };
}

async function listPublicRecipes(filters) {
  const normalizedFilters = normalizeFilters(filters);
  const result = await internalRecipesRepository.listRecipes(normalizedFilters, {
    includeOnlyPublic: true
  });

  return {
    ...result,
    totalPages: Math.ceil(result.total / result.pageSize),
    items: result.items.map(mapRecipe)
  };
}

async function listMyRecipes(userId, filters) {
  const normalizedFilters = normalizeFilters(filters);
  const result = await internalRecipesRepository.listRecipes(normalizedFilters, {
    includeOnlyPublic: false,
    ownerUserId: userId
  });

  return {
    ...result,
    totalPages: Math.ceil(result.total / result.pageSize),
    items: result.items.map(mapRecipe)
  };
}

async function getRecipeById(recipeId) {
  const recipe = await internalRecipesRepository.findRecipeById(recipeId);

  if (!recipe) {
    throw createHttpError(404, "Receta no encontrada");
  }

  return mapRecipe(recipe);
}

async function getRecipeIngredients(recipeId) {
  const recipe = await internalRecipesRepository.findRecipeById(recipeId);

  if (!recipe) {
    throw createHttpError(404, "Receta no encontrada");
  }

  const ingredients = await internalRecipesRepository.findIngredientsByRecipeId(recipeId);

  return ingredients.map((ingredient) => ({
    id: ingredient.id,
    recipeId: ingredient.recipe_id,
    ingredientName: ingredient.ingredient_name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    position: ingredient.position
  }));
}

async function getRecipeDetail(recipeId, userId = null) {
  const recipe = await internalRecipesRepository.findRecipeById(recipeId);

  if (!recipe) {
    throw createHttpError(404, "Receta no encontrada");
  }

  const [ingredients, steps, comments, userRating] = await Promise.all([
    internalRecipesRepository.findIngredientsByRecipeId(recipeId),
    internalRecipesRepository.findStepsByRecipeId(recipeId),
    internalRecipesRepository.findCommentsByRecipeId(recipeId),
    userId ? internalRecipesRepository.findUserRating(recipeId, userId) : Promise.resolve(null)
  ]);

  return {
    ...mapRecipe(recipe),
    ingredients: ingredients.map((ingredient) => ({
      id: ingredient.id,
      recipeId: ingredient.recipe_id,
      ingredientName: ingredient.ingredient_name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      position: ingredient.position
    })),
    steps: steps.map((step) => ({
      id: step.id,
      recipeId: step.recipe_id,
      stepNumber: step.step_number,
      instruction: step.instruction
    })),
    comments: comments.map(mapComment),
    myRating: userRating ? Number(userRating.value) : null
  };
}

async function addComment(recipeId, userId, payload) {
  const recipe = await internalRecipesRepository.findRecipeById(recipeId);

  if (!recipe) {
    throw createHttpError(404, "Receta no encontrada");
  }

  const content = String(payload?.content || "").trim();

  if (!content) {
    throw createHttpError(400, "Debes escribir un comentario");
  }

  await internalRecipesRepository.createComment(recipeId, userId, content);
  return getRecipeDetail(recipeId, userId);
}

async function rateRecipe(recipeId, userId, payload) {
  const recipe = await internalRecipesRepository.findRecipeById(recipeId);

  if (!recipe) {
    throw createHttpError(404, "Receta no encontrada");
  }

  const value = Number(payload?.value);

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw createHttpError(400, "La valoración debe estar entre 1 y 5");
  }

  await internalRecipesRepository.upsertRating(recipeId, userId, value);
  return getRecipeDetail(recipeId, userId);
}

async function createRecipe(userId, payload) {
  const normalizedPayload = normalizeRecipePayload(payload);
  let imageUrl = normalizedPayload.imageUrl;

  if (normalizedPayload.imageUpload?.base64) {
    imageUrl = await uploadRecipeImage(userId, normalizedPayload.imageUpload);
  }

  const recipeId = await internalRecipesRepository.createRecipeWithDetails(userId, {
    ...normalizedPayload,
    imageUrl
  });
  return getRecipeDetail(recipeId, userId);
}

async function updateRecipe(userId, recipeId, payload) {
  const normalizedPayload = normalizeRecipePayload(payload);
  const currentRecipe = await internalRecipesRepository.findRecipeById(recipeId);

  if (!currentRecipe || currentRecipe.user_id !== userId) {
    throw createHttpError(404, "Receta no encontrada");
  }

  let imageUrl = normalizedPayload.imageUrl !== null ? normalizedPayload.imageUrl : currentRecipe.image_url;

  if (normalizedPayload.removeImage) {
    await deleteRecipeImageByUrl(currentRecipe.image_url);
    imageUrl = null;
  }

  if (normalizedPayload.imageUpload?.base64) {
    if (currentRecipe.image_url) {
      await deleteRecipeImageByUrl(currentRecipe.image_url);
    }

    imageUrl = await uploadRecipeImage(userId, normalizedPayload.imageUpload);
  }

  const updated = await internalRecipesRepository.updateRecipeWithDetails(
    userId,
    recipeId,
    {
      ...normalizedPayload,
      imageUrl
    }
  );

  if (!updated) {
    throw createHttpError(404, "Receta no encontrada");
  }

  return getRecipeDetail(recipeId, userId);
}

async function deleteRecipe(userId, recipeId) {
  const currentRecipe = await internalRecipesRepository.findRecipeById(recipeId);

  if (!currentRecipe || currentRecipe.user_id !== userId) {
    throw createHttpError(404, "Receta no encontrada");
  }

  if (currentRecipe.image_url) {
    await deleteRecipeImageByUrl(currentRecipe.image_url);
  }

  const deleted = await internalRecipesRepository.deleteRecipeByOwner(userId, recipeId);

  if (!deleted) {
    throw createHttpError(404, "Receta no encontrada");
  }
}

module.exports = {
  listPublicRecipes,
  listMyRecipes,
  getRecipeById,
  getRecipeIngredients,
  getRecipeDetail,
  addComment,
  rateRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe
};
