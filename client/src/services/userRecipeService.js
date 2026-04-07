import { API_BASE_URL } from "../constants/env";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se ha podido completar la solicitud");
  }

  return data;
}

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
  return request(`/user-recipes?${createSearchParams(params)}`, {
    method: "GET"
  });
}

export async function getMyRecipes(token, params = {}) {
  return request(`/user-recipes/mine?${createSearchParams(params)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function createUserRecipe(token, payload) {
  return request("/user-recipes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function updateUserRecipe(token, recipeId, payload) {
  return request(`/user-recipes/${encodeURIComponent(recipeId)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export async function deleteUserRecipe(token, recipeId) {
  return request(`/user-recipes/${encodeURIComponent(recipeId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
