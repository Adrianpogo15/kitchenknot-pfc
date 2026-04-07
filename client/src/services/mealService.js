import { requestJson } from "./httpClient";

export async function searchMeals(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.name?.trim()) {
    searchParams.set("name", params.name.trim());
  }

  if (params.cuisineType) {
    searchParams.set("cuisineType", params.cuisineType);
  }

  if (params.mealType) {
    searchParams.set("mealType", params.mealType);
  }

  if (params.dishType) {
    searchParams.set("dishType", params.dishType);
  }

  if (params.diet) {
    searchParams.set("diet", params.diet);
  }

  searchParams.set("page", String(params.page || 1));
  searchParams.set("pageSize", String(params.pageSize || 10));

  return requestJson(`/external-recipes/search?${searchParams.toString()}`);
}
