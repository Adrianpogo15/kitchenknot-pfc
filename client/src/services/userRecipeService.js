import { requestJson } from "./httpClient";

function createSearchParams(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.name?.trim()) {
    searchParams.set("name", params.name.trim());
  }

  if (params.difficulty) {
    searchParams.set("difficulty", params.difficulty);
  }

  if (params.servings) {
    searchParams.set("servings", String(params.servings));
  }

  searchParams.set("page", String(params.page || 1));
  searchParams.set("pageSize", String(params.pageSize || 10));

  return searchParams.toString();
}

export async function getUserRecipes(params = {}) {
  return requestJson(`/user-recipes?${createSearchParams(params)}`, {
    method: "GET"
  });
}

export async function getMyRecipes(token, params = {}) {
  return requestJson(`/user-recipes/mine?${createSearchParams(params)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function createUserRecipe(token, payload) {
  return requestJson("/user-recipes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function updateUserRecipe(token, recipeId, payload) {
  return requestJson(`/user-recipes/${encodeURIComponent(recipeId)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function deleteUserRecipe(token, recipeId) {
  return requestJson(`/user-recipes/${encodeURIComponent(recipeId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
