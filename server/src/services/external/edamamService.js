const { edamamAppId, edamamAppKey, edamamAccountUser } = require("../../config/env");
const createHttpError = require("../../utils/httpError");

const EDAMAM_BASE_URL = "https://api.edamam.com/api/recipes/v2";

function mapRecipe(hit) {
  const recipe = hit.recipe || {};

  return {
    externalId: recipe.uri,
    name: recipe.label,
    source: recipe.source || "Edamam",
    sourceUrl: recipe.url || null,
    image: recipe.image || null,
    ingredientLines: Array.isArray(recipe.ingredientLines) ? recipe.ingredientLines : [],
    cuisineType: Array.isArray(recipe.cuisineType) ? recipe.cuisineType : [],
    mealType: Array.isArray(recipe.mealType) ? recipe.mealType : [],
    dishType: Array.isArray(recipe.dishType) ? recipe.dishType : [],
    dietLabels: Array.isArray(recipe.dietLabels) ? recipe.dietLabels : [],
    healthLabels: Array.isArray(recipe.healthLabels) ? recipe.healthLabels : [],
    calories: Number.isFinite(recipe.calories) ? Math.round(recipe.calories) : null,
    servings: recipe.yield || null,
    totalTime: recipe.totalTime || null
  };
}

async function searchMealsByName(name, filter = {}) {
  const normalizedName = String(name || "").trim();

  if (
    !normalizedName &&
    !filter.cuisineType &&
    !filter.mealType &&
    !filter.dishType &&
    !filter.diet
  ) {
    throw createHttpError(400, "Debes indicar un nombre o seleccionar al menos un filtro");
  }

  const url = new URL(EDAMAM_BASE_URL);
  const pageSize = Math.min(Math.max(Number(filter.pageSize) || 10, 1), 10);
  const page = Math.max(Number(filter.page) || 1, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize;

  url.searchParams.set("type", "public");
  if (normalizedName) {
    url.searchParams.set("q", normalizedName);
  }
  url.searchParams.set("app_id", edamamAppId);
  url.searchParams.set("app_key", edamamAppKey);
  url.searchParams.set("from", String(from));
  url.searchParams.set("to", String(to));

  if (filter.cuisineType) {
    url.searchParams.set("cuisineType", filter.cuisineType);
  }

  if (filter.mealType) {
    url.searchParams.set("mealType", filter.mealType);
  }

  if (filter.dishType) {
    url.searchParams.set("dishType", filter.dishType);
  }

  if (filter.diet) {
    url.searchParams.set("diet", filter.diet);
  }

  const response = await fetch(url, {
    headers: {
      "Edamam-Account-User": edamamAccountUser
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw createHttpError(
      502,
      `No se ha podido consultar Edamam (${response.status}). ${errorBody || ""}`.trim()
    );
  }

  const data = await response.json();
  const hits = Array.isArray(data.hits) ? data.hits : [];

  return {
    items: hits.map(mapRecipe),
    total: Number(data.count) || 0,
    page,
    pageSize
  };
}

module.exports = {
  searchMealsByName
};
