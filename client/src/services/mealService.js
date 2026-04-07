import { API_BASE_URL } from "../constants/env";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se ha podido realizar la busqueda");
  }

  return data;
}

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

  return request(`/external-recipes/search?${searchParams.toString()}`);
}
